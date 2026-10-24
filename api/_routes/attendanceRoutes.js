const express = require('express');
const router = express.Router();
const {
  saveAttendance,
  getDailyAttendance,
  getMonthlyRegister,
  getStudentAttendanceHistory,
  getAttendanceAudit,
  deleteAttendance
} = require('../_controllers/attendanceController');
const { protect } = require('../_middleware/auth');

router.use(protect); // All attendance routes require admin authentication

router.post('/', saveAttendance);
router.get('/daily', getDailyAttendance);
router.get('/monthly', getMonthlyRegister);
router.get('/student/:id', getStudentAttendanceHistory);
router.get('/audit/:id', getAttendanceAudit);
router.delete('/:id', deleteAttendance);

module.exports = router;
