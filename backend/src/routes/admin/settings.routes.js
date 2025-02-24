const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/admin/settings.controller');
const { authenticateToken, isAdmin } = require('../../middleware/auth');

// Protect all routes
router.use(authenticateToken);
router.use(isAdmin);

// Settings routes
router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);

// Config file routes
router.get('/config', settingsController.getConfigFiles);
router.get('/config/:filename', settingsController.getConfigFile);
router.put('/config/:filename', settingsController.updateConfigFile);

// System info route
router.get('/system', settingsController.getSystemInfo);

module.exports = router;
