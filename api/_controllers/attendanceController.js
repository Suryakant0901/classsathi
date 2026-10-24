const Attendance = require('../_models/Attendance');
const Student = require('../_models/Student');

// @desc    Save or Update Attendance (with duplicate protection and audit history)
// @route   POST /api/attendance
// @access  Private
const saveAttendance = async (req, res) => {
  try {
    const { date, studentClass, records, reason } = req.body;

    if (!date || !studentClass || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'Date, Class, and student records are required'
      });
    }

    const cleanDate = date.trim(); // YYYY-MM-DD
    const cleanClass = String(studentClass);

    // Look for existing attendance record for this date and class
    let attendance = await Attendance.findOne({
      date: cleanDate,
      studentClass: cleanClass
    });

    if (!attendance) {
      // Create new attendance
      attendance = new Attendance({
        date: cleanDate,
        studentClass: cleanClass,
        records: records.map((r) => ({
          student: r.student,
          rollNo: r.rollNo,
          name: r.name,
          fatherName: r.fatherName,
          status: r.status || 'Present',
          remarks: r.remarks || ''
        })),
        submittedBy: req.user._id,
        auditTrail: [
          {
            action: 'CREATED',
            timestamp: new Date(),
            changedBy: req.user.name || 'Admin',
            reason: reason || 'Initial Attendance Submission',
            changes: []
          }
        ]
      });

      attendance.calculateSummary();
      await attendance.save();

      return res.status(201).json({
        success: true,
        message: `Attendance successfully saved for Class ${cleanClass} on ${cleanDate}`,
        data: attendance
      });
    } else {
      // Record already exists -> Perform update with AUDIT TRAIL
      const changes = [];
      const previousMap = new Map();
      attendance.records.forEach((r) => {
        previousMap.set(String(r.rollNo), { status: r.status, remarks: r.remarks, name: r.name });
      });

      const updatedRecords = records.map((r) => {
        const prev = previousMap.get(String(r.rollNo));
        if (prev && (prev.status !== r.status || (r.remarks && prev.remarks !== r.remarks))) {
          changes.push({
            rollNo: r.rollNo,
            name: r.name,
            oldStatus: prev.status,
            newStatus: r.status,
            oldRemarks: prev.remarks || '',
            newRemarks: r.remarks || ''
          });
        }
        return {
          student: r.student,
          rollNo: r.rollNo,
          name: r.name,
          fatherName: r.fatherName,
          status: r.status,
          remarks: r.remarks || ''
        };
      });

      attendance.records = updatedRecords;
      attendance.calculateSummary();

      // Append to audit trail
      attendance.auditTrail.push({
        action: 'CORRECTED',
        timestamp: new Date(),
        changedBy: req.user.name || 'Admin',
        reason: reason || (changes.length > 0 ? `Updated ${changes.length} record(s)` : 'Attendance re-verified'),
        changes
      });

      await attendance.save();

      return res.json({
        success: true,
        message: `Attendance updated for Class ${cleanClass} on ${cleanDate} (${changes.length} changes logged)`,
        data: attendance
      });
    }
  } catch (error) {
    console.error('Save attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Daily Attendance for specific date and class
// @route   GET /api/attendance/daily
// @access  Private
const getDailyAttendance = async (req, res) => {
  try {
    const { date, studentClass } = req.query;

    if (!date || !studentClass) {
      return res.status(400).json({
        success: false,
        message: 'date and studentClass are required parameters'
      });
    }

    const cleanDate = date.trim();
    const cleanClass = String(studentClass);

    const attendance = await Attendance.findOne({
      date: cleanDate,
      studentClass: cleanClass
    }).populate('submittedBy', 'name email');

    // Fetch all current active students in this class
    const currentStudents = await Student.find({
      studentClass: cleanClass,
      isActive: true
    }).sort({ rollNo: 1 });

    res.json({
      success: true,
      data: attendance || null,
      students: currentStudents,
      isRecorded: !!attendance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Monthly Attendance Register Matrix
// @route   GET /api/attendance/monthly
// @access  Private
const getMonthlyRegister = async (req, res) => {
  try {
    const { year, month, studentClass } = req.query;

    if (!year || !month || !studentClass) {
      return res.status(400).json({
        success: false,
        message: 'year, month, and studentClass are required parameters'
      });
    }

    const numYear = parseInt(year, 10);
    const numMonth = parseInt(month, 10); // 1 to 12
    const cleanClass = String(studentClass);

    // Calculate number of days in this month
    const daysInMonth = new Date(numYear, numMonth, 0).getDate();

    // Pad month with zero
    const monthStr = numMonth < 10 ? `0${numMonth}` : `${numMonth}`;
    const datePrefix = `${numYear}-${monthStr}`;

    // Regex to match dates in this month: e.g. ^2026-10-
    const dateRegex = new RegExp(`^${datePrefix}-`);

    // Fetch all attendance documents in this month for this class
    const attendances = await Attendance.find({
      studentClass: cleanClass,
      date: { $regex: dateRegex }
    }).sort({ date: 1 });

    // Fetch all active students in this class
    const students = await Student.find({
      studentClass: cleanClass,
      isActive: true
    }).sort({ rollNo: 1 });

    // Build a map of date -> attendance doc
    const attendanceByDate = {};
    attendances.forEach((att) => {
      attendanceByDate[att.date] = att;
    });

    // Build student-wise row records
    const studentRows = students.map((student) => {
      const dailyStatus = {};
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let leaveCount = 0;
      let totalWorkingDays = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = day < 10 ? `0${day}` : `${day}`;
        const dateKey = `${datePrefix}-${dayStr}`;
        const attDoc = attendanceByDate[dateKey];

        if (attDoc) {
          totalWorkingDays++;
          // Find student record inside this day's attendance
          const rec = attDoc.records.find(
            (r) => String(r.student) === String(student._id) || r.rollNo === student.rollNo
          );

          if (rec) {
            dailyStatus[day] = {
              status: rec.status,
              remarks: rec.remarks || ''
            };
            if (rec.status === 'Present') presentCount++;
            else if (rec.status === 'Absent') absentCount++;
            else if (rec.status === 'Late') lateCount++;
            else if (rec.status === 'Leave') leaveCount++;
          } else {
            // Student wasn't in list on that day
            dailyStatus[day] = { status: '-', remarks: '' };
          }
        } else {
          // No attendance taken on this day (weekend / holiday / future day)
          dailyStatus[day] = null;
        }
      }

      const totalMarked = presentCount + absentCount + lateCount + leaveCount;
      const effectivePresent = presentCount + lateCount;
      const percentage = totalMarked > 0 ? Number(((effectivePresent / totalMarked) * 100).toFixed(1)) : 0;

      return {
        studentId: student._id,
        rollNo: student.rollNo,
        name: student.name,
        fatherName: student.fatherName,
        phone: student.phone,
        dailyStatus,
        summary: {
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          leave: leaveCount,
          totalWorkingDays: attendances.length,
          totalMarked,
          percentage
        }
      };
    });

    // Daily totals across all students
    const dailyTotals = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const dateKey = `${datePrefix}-${dayStr}`;
      const attDoc = attendanceByDate[dateKey];

      if (attDoc) {
        dailyTotals[day] = {
          date: dateKey,
          summary: attDoc.summary
        };
      } else {
        dailyTotals[day] = null;
      }
    }

    res.json({
      success: true,
      data: {
        year: numYear,
        month: numMonth,
        daysInMonth,
        studentClass: cleanClass,
        totalWorkingDaysRecorded: attendances.length,
        studentsCount: students.length,
        studentRows,
        dailyTotals
      }
    });
  } catch (error) {
    console.error('Error in monthly register:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance history for a single student
// @route   GET /api/attendance/student/:id
// @access  Private
const getStudentAttendanceHistory = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Find all attendance records for this student's class
    const attendances = await Attendance.find({
      studentClass: student.studentClass
    }).sort({ date: -1 });

    const history = [];
    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;

    attendances.forEach((att) => {
      const rec = att.records.find(
        (r) => String(r.student) === String(student._id) || r.rollNo === student.rollNo
      );
      if (rec) {
        history.push({
          date: att.date,
          status: rec.status,
          remarks: rec.remarks || '',
          takenAt: att.createdAt
        });

        if (rec.status === 'Present') present++;
        else if (rec.status === 'Absent') absent++;
        else if (rec.status === 'Late') late++;
        else if (rec.status === 'Leave') leave++;
      }
    });

    const totalDays = history.length;
    const effectivePresent = present + late;
    const percentage = totalDays > 0 ? Number(((effectivePresent / totalDays) * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      student,
      summary: {
        totalDays,
        present,
        absent,
        late,
        leave,
        percentage
      },
      history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get audit trail for a specific attendance record
// @route   GET /api/attendance/audit/:id
// @access  Private
const getAttendanceAudit = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id).select('date studentClass auditTrail');
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private
const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  saveAttendance,
  getDailyAttendance,
  getMonthlyRegister,
  getStudentAttendanceHistory,
  getAttendanceAudit,
  deleteAttendance
};
