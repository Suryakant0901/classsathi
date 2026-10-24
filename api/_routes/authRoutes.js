const express = require('express');
const router = express.Router();
const { login, getMe, updateProfile, changePassword } = require('../_controllers/authController');
const { protect } = require('../_middleware/auth');

router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
