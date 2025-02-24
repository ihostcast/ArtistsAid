const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const verificationController = require('../../controllers/auth/verification.controller');

// Rutas de verificación de email
router.post('/email/send', 
    authenticateToken,
    verificationController.sendEmailVerification
);

router.post('/email/verify',
    authenticateToken,
    verificationController.verifyEmailCode
);

// Rutas de verificación de SMS
router.post('/sms/send',
    authenticateToken,
    verificationController.sendSMSVerification
);

router.post('/sms/verify',
    authenticateToken,
    verificationController.verifySMSCode
);

module.exports = router;
