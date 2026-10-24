const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// @desc    Get comprehensive dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const today = req.query.date || new Date().toISOString().split('T')[0];

    // Student counts
    const totalStudents = await Student.countDocuments({ isActive: true });
    const class9Total = await Student.countDocuments({ studentClass: '9', isActive: true });
    const class10Total = await Student.countDocuments({ studentClass: '10', isActive: true });

    // Today's attendance records
    const todayAttendances = await Attendance.find({ date: today });

    let todayStats = {
      isRecorded: todayAttendances.length > 0,
      totalMarked: 0,
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
      percentage: 0,
      sessions: []
    };

    if (todayAttendances.length > 0) {
      let totalP = 0;
      let totalA = 0;
      let totalL = 0;
      let totalLV = 0;
      let totalRecs = 0;

      todayAttendances.forEach((att) => {
        totalP += att.summary.present || 0;
        totalA += att.summary.absent || 0;
        totalL += att.summary.late || 0;
        totalLV += att.summary.leave || 0;
        totalRecs += att.summary.total || 0;

        todayStats.sessions.push({
          _id: att._id,
          studentClass: att.studentClass,
          summary: att.summary
        });
      });

      todayStats.totalMarked = totalRecs;
      todayStats.present = totalP;
      todayStats.absent = totalA;
      todayStats.late = totalL;
      todayStats.leave = totalLV;

      const effectivePresent = totalP + totalL;
      todayStats.percentage = totalRecs > 0 ? Number(((effectivePresent / totalRecs) * 100).toFixed(1)) : 0;
    }

    // Recent attendance logs
    const recentSessions = await Attendance.find()
      .sort({ date: -1, createdAt: -1 })
      .limit(6)
      .select('date studentClass summary createdAt');

    // Overall month statistics (current month)
    const currentMonthPrefix = today.substring(0, 7); // YYYY-MM
    const monthAttendances = await Attendance.find({
      date: { $regex: new RegExp(`^${currentMonthPrefix}-`) }
    });

    let monthStats = {
      totalWorkingDays: new Set(monthAttendances.map((a) => a.date)).size,
      totalSessions: monthAttendances.length,
      averagePercentage: 0
    };

    if (monthAttendances.length > 0) {
      const totalPctSum = monthAttendances.reduce((acc, curr) => acc + (curr.summary.percentage || 0), 0);
      monthStats.averagePercentage = Number((totalPctSum / monthAttendances.length).toFixed(1));
    }

    // Low attendance alert (< 75%) calculation
    const allAttendances = await Attendance.find().select('studentClass records');
    const studentAttendanceMap = new Map();

    allAttendances.forEach((att) => {
      att.records.forEach((r) => {
        const key = String(r.student);
        if (!studentAttendanceMap.has(key)) {
          studentAttendanceMap.set(key, {
            studentId: r.student,
            rollNo: r.rollNo,
            name: r.name,
            fatherName: r.fatherName,
            totalDays: 0,
            presentDays: 0,
            lateDays: 0,
            absentDays: 0,
            leaveDays: 0
          });
        }
        const record = studentAttendanceMap.get(key);
        record.totalDays++;
        if (r.status === 'Present') record.presentDays++;
        else if (r.status === 'Late') record.lateDays++;
        else if (r.status === 'Absent') record.absentDays++;
        else if (r.status === 'Leave') record.leaveDays++;
      });
    });

    const lowAttendanceList = [];
    for (const [, item] of studentAttendanceMap) {
      if (item.totalDays >= 3) {
        const pct = Number((((item.presentDays + item.lateDays) / item.totalDays) * 100).toFixed(1));
        if (pct < 75) {
          const studentDoc = await Student.findById(item.studentId).select('studentClass phone');
          if (studentDoc && studentDoc.isActive) {
            lowAttendanceList.push({
              studentId: item.studentId,
              rollNo: item.rollNo,
              name: item.name,
              fatherName: item.fatherName,
              studentClass: studentDoc.studentClass,
              phone: studentDoc.phone,
              totalDays: item.totalDays,
              presentDays: item.presentDays,
              absentDays: item.absentDays,
              percentage: pct
            });
          }
        }
      }
    }

    // Sort lowest percentage first
    lowAttendanceList.sort((a, b) => a.percentage - b.percentage);

    // Class 9 & Class 10 specific breakdown
    const class9Att = todayAttendances.find((a) => String(a.studentClass) === '9');
    const class10Att = todayAttendances.find((a) => String(a.studentClass) === '10');

    const classStats = {
      class9: {
        studentClass: '9',
        total: class9Total,
        isRecorded: Boolean(class9Att),
        present: class9Att?.summary?.present || 0,
        absent: class9Att?.summary?.absent || 0,
        late: class9Att?.summary?.late || 0,
        leave: class9Att?.summary?.leave || 0,
        percentage: class9Att?.summary?.percentage || 0
      },
      class10: {
        studentClass: '10',
        total: class10Total,
        isRecorded: Boolean(class10Att),
        present: class10Att?.summary?.present || 0,
        absent: class10Att?.summary?.absent || 0,
        late: class10Att?.summary?.late || 0,
        leave: class10Att?.summary?.leave || 0,
        percentage: class10Att?.summary?.percentage || 0
      }
    };

    res.json({
      success: true,
      data: {
        date: today,
        students: {
          total: totalStudents,
          class9: class9Total,
          class10: class10Total
        },
        todayStats,
        classStats,
        classStatsList: [classStats.class9, classStats.class10],
        monthStats,
        recentSessions,
        lowAttendanceAlerts: lowAttendanceList.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats };
