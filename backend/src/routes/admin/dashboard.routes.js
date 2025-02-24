const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboard.controller');
const { authenticateToken, isAdmin } = require('../../middleware/auth');

// Protect all routes
router.use(authenticateToken);
router.use(isAdmin);

// Dashboard routes
router.get('/overview', dashboardController.getOverview);
router.get('/statistics', dashboardController.getStatistics);
router.get('/health', dashboardController.getSystemHealth);

module.exports = router;
