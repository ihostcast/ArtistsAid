const express = require('express');
const router = express.Router();
const { authenticateToken, isPartner } = require('../../middleware/auth');
const dashboardController = require('../../controllers/partner/dashboard.controller');

// Middleware para verificar que el usuario es un partner
router.use(authenticateToken, isPartner);

// Rutas del dashboard
router.get('/stats', dashboardController.getDashboardStats);
router.get('/providers/stats', dashboardController.getProviderStats);
router.get('/services/stats', dashboardController.getServiceStats);

module.exports = router;
