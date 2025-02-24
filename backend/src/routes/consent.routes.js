const express = require('express');
const router = express.Router();
const ConsentController = require('../controllers/consent.controller');
const { isAuthenticated } = require('../middleware/auth');

// Obtener términos de servicio
router.get(
    '/terms/:serviceProvider',
    ConsentController.getServiceTerms
);

// Obtener formulario de consentimiento
router.get(
    '/form/:serviceProvider',
    isAuthenticated,
    ConsentController.getConsentForm
);

// Registrar consentimiento
router.post(
    '/record',
    isAuthenticated,
    ConsentController.recordConsent
);

// Verificar consentimiento
router.get(
    '/verify/:serviceProvider',
    isAuthenticated,
    ConsentController.verifyConsent
);

// Revocar consentimiento
router.post(
    '/revoke/:serviceProvider',
    isAuthenticated,
    ConsentController.revokeConsent
);

// Obtener historial de consentimiento
router.get(
    '/history/:serviceProvider',
    isAuthenticated,
    ConsentController.getConsentHistory
);

module.exports = router;
