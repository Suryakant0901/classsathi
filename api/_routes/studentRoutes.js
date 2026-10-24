const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  bulkCreateStudents,
  updateStudent,
  deleteStudent,
  getClassesSummary
} = require('../_controllers/studentController');
const { protect } = require('../_middleware/auth');

router.use(protect); // All student routes require admin authentication

router.get('/classes-summary', getClassesSummary);
router.route('/').get(getStudents).post(createStudent);
router.post('/bulk', bulkCreateStudents);
router.route('/:id').get(getStudentById).put(updateStudent).delete(deleteStudent);

module.exports = router;
