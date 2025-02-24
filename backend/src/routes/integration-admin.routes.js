const express = require('express');
const router = express.Router();
const IntegrationAdminController = require('../controllers/integration-admin.controller');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Todos los endpoints requieren autenticación y rol de admin
router.use(isAuthenticated, isAdmin);

// Dashboard y estadísticas
router.get(
    '/dashboard',
    IntegrationAdminController.getIntegrationDashboard
);

// Gestión de configuraciones
router.put(
    '/config',
    IntegrationAdminController.updateIntegrationConfig
);

router.put(
    '/bulk-update',
    IntegrationAdminController.bulkUpdateIntegrations
);

// Monitoreo y salud
router.get(
    '/health/:provider',
    IntegrationAdminController.getIntegrationHealth
);

router.get(
    '/logs/:provider',
    IntegrationAdminController.getIntegrationLogs
);

router.get(
    '/analytics/:provider',
    IntegrationAdminController.getIntegrationAnalytics
);

// Seguridad
router.post(
    '/rotate-keys/:provider',
    IntegrationAdminController.rotateApiKeys
);

// Notificaciones y términos
router.post(
    '/notifications',
    IntegrationAdminController.createServiceNotification
);

router.put(
    '/terms',
    IntegrationAdminController.updateServiceTerms
);

module.exports = router;
