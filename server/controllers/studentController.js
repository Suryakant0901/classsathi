const Student = require('../models/Student');

// @desc    Get all students with optional filters (Class 9 or Class 10)
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res) => {
  try {
    const { studentClass, search, isActive } = req.query;

    const query = {};
    if (studentClass && studentClass !== 'all') {
      query.studentClass = studentClass;
    }
    if (isActive !== undefined && isActive !== 'all') {
      query.isActive = isActive === 'true';
    }
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      const isNum = !isNaN(Number(search.trim()));

      query.$or = [
        { name: searchRegex },
        { fatherName: searchRegex },
        ...(isNum ? [{ rollNo: Number(search.trim()) }] : [])
      ];
    }

    const students = await Student.find(query).sort({ studentClass: 1, rollNo: 1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new student
// @route   POST /api/students
// @access  Private
const createStudent = async (req, res) => {
  try {
    const { rollNo, name, fatherName, studentClass, phone, gender } = req.body;

    if (!rollNo || !name || !fatherName || !studentClass) {
      return res.status(400).json({
        success: false,
        message: "Please provide Roll Number, Student's Name, Father's Name, and Class (9 or 10)"
      });
    }

    if (!['9', '10'].includes(String(studentClass))) {
      return res.status(400).json({
        success: false,
        message: 'Class must be either 9 or 10'
      });
    }

    // Check if roll number already exists in this class
    const existing = await Student.findOne({
      rollNo: Number(rollNo),
      studentClass: String(studentClass)
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Roll No. ${rollNo} already exists in Class ${studentClass}`
      });
    }

    const student = await Student.create({
      rollNo: Number(rollNo),
      name: name.trim(),
      fatherName: fatherName.trim(),
      studentClass: String(studentClass),
      phone: phone ? phone.trim() : '',
      gender: gender || 'Male'
    });

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: student
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A student with this Roll Number already exists in the selected Class'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk create students
// @route   POST /api/students/bulk
// @access  Private
const bulkCreateStudents = async (req, res) => {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of students' });
    }

    const createdList = [];
    const errors = [];

    for (const item of students) {
      try {
        const { rollNo, name, fatherName, studentClass, phone, gender } = item;
        if (!rollNo || !name || !fatherName || !studentClass) {
          errors.push(`Row for ${name || 'Unknown'} is missing required fields`);
          continue;
        }

        const existing = await Student.findOne({
          rollNo: Number(rollNo),
          studentClass: String(studentClass)
        });

        if (existing) {
          errors.push(`Roll No. ${rollNo} already exists in Class ${studentClass}`);
          continue;
        }

        const newStudent = await Student.create({
          rollNo: Number(rollNo),
          name: name.trim(),
          fatherName: fatherName.trim(),
          studentClass: String(studentClass),
          phone: phone ? phone.trim() : '',
          gender: gender || 'Male'
        });
        createdList.push(newStudent);
      } catch (err) {
        errors.push(`Error adding ${item.name || 'Student'}: ${err.message}`);
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully added ${createdList.length} student(s)${errors.length ? `, with ${errors.length} skipped` : ''}`,
      data: createdList,
      errors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private
const updateStudent = async (req, res) => {
  try {
    const { rollNo, name, fatherName, studentClass, phone, gender, isActive } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // If roll number or class is changing, check uniqueness
    if (
      (rollNo && Number(rollNo) !== student.rollNo) ||
      (studentClass && String(studentClass) !== student.studentClass)
    ) {
      const targetRoll = rollNo ? Number(rollNo) : student.rollNo;
      const targetClass = studentClass ? String(studentClass) : student.studentClass;

      const duplicate = await Student.findOne({
        _id: { $ne: student._id },
        rollNo: targetRoll,
        studentClass: targetClass
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Roll No. ${targetRoll} is already assigned in Class ${targetClass}`
        });
      }
    }

    if (rollNo !== undefined) student.rollNo = Number(rollNo);
    if (name) student.name = name.trim();
    if (fatherName) student.fatherName = fatherName.trim();
    if (studentClass) student.studentClass = String(studentClass);
    if (phone !== undefined) student.phone = phone.trim();
    if (gender) student.gender = gender;
    if (isActive !== undefined) student.isActive = Boolean(isActive);

    const updated = await student.save();
    res.json({ success: true, message: 'Student updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get summary of Class 9 and Class 10 student counts
// @route   GET /api/students/classes-summary
// @access  Private
const getClassesSummary = async (req, res) => {
  try {
    const class9Total = await Student.countDocuments({ studentClass: '9', isActive: true });
    const class10Total = await Student.countDocuments({ studentClass: '10', isActive: true });
    const totalStudents = await Student.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        totalStudents,
        class9: {
          total: class9Total
        },
        class10: {
          total: class10Total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  bulkCreateStudents,
  updateStudent,
  deleteStudent,
  getClassesSummary
};
