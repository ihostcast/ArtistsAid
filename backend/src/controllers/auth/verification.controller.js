const NotificationService = require('../../services/NotificationService');
const { User } = require('../../models');
const catchAsync = require('../../utils/catchAsync');

exports.sendEmailVerification = catchAsync(async (req, res) => {
    const result = await NotificationService.sendVerificationEmail(req.user.id);
    
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: result.error
        });
    }

    res.json({
        success: true,
        message: 'Verification email sent successfully'
    });
});

exports.sendSMSVerification = catchAsync(async (req, res) => {
    const result = await NotificationService.sendVerificationSMS(req.user.id);
    
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: result.error
        });
    }

    res.json({
        success: true,
        message: 'Verification SMS sent successfully'
    });
});

exports.verifyEmailCode = catchAsync(async (req, res) => {
    const { code } = req.body;
    
    const result = await NotificationService.verifyCode(req.user.id, code, 'email');
    
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: result.error
        });
    }

    // Actualizar estado de verificación del usuario
    await User.update(
        { emailVerified: true },
        { where: { id: req.user.id } }
    );

    res.json({
        success: true,
        message: 'Email verified successfully'
    });
});

exports.verifySMSCode = catchAsync(async (req, res) => {
    const { code } = req.body;
    
    const result = await NotificationService.verifyCode(req.user.id, code, 'sms');
    
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: result.error
        });
    }

    // Actualizar estado de verificación del usuario
    await User.update(
        { phoneVerified: true },
        { where: { id: req.user.id } }
    );

    res.json({
        success: true,
        message: 'Phone number verified successfully'
    });
});
