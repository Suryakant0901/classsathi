const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../_controllers/dashboardController');
const { protect } = require('../_middleware/auth');

router.use(protect);

router.get('/stats', getDashboardStats);

module.exports = router;
