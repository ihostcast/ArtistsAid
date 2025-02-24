const ConsentService = require('../services/consent.service');
const { validateRequest } = require('../middleware/validator');
const { isAuthenticated } = require('../middleware/auth');

class ConsentController {
    async getServiceTerms(req, res) {
        try {
            const { serviceProvider } = req.params;
            const terms = await ConsentService.getServiceTerms(serviceProvider);
            res.json(terms);
        } catch (error) {
            console.error('Error getting service terms:', error);
            res.status(400).json({
                error: 'Error al obtener términos del servicio',
                details: error.message
            });
        }
    }

    async recordConsent(req, res) {
        try {
            validateRequest(req.body, {
                required: ['serviceProvider', 'termsVersion'],
                optional: ['metadata']
            });

            const consentData = {
                ...req.body,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                metadata: {
                    ...req.body.metadata,
                    location: req.headers['x-forwarded-for'] || req.connection.remoteAddress
                }
            };

            const consent = await ConsentService.recordConsent(
                req.user.id,
                req.body.serviceProvider,
                consentData
            );

            res.json({
                success: true,
                message: 'Consentimiento registrado exitosamente',
                consent
            });
        } catch (error) {
            console.error('Error recording consent:', error);
            res.status(400).json({
                error: 'Error al registrar consentimiento',
                details: error.message
            });
        }
    }

    async verifyConsent(req, res) {
        try {
            const { serviceProvider } = req.params;
            const verificationResult = await ConsentService.verifyConsent(
                req.user.id,
                serviceProvider
            );

            res.json(verificationResult);
        } catch (error) {
            console.error('Error verifying consent:', error);
            res.status(400).json({
                error: 'Error al verificar consentimiento',
                details: error.message
            });
        }
    }

    async revokeConsent(req, res) {
        try {
            const { serviceProvider } = req.params;
            const result = await ConsentService.revokeConsent(
                req.user.id,
                serviceProvider
            );

            res.json(result);
        } catch (error) {
            console.error('Error revoking consent:', error);
            res.status(400).json({
                error: 'Error al revocar consentimiento',
                details: error.message
            });
        }
    }

    async getConsentHistory(req, res) {
        try {
            const { serviceProvider } = req.params;
            const history = await ConsentService.getConsentHistory(
                req.user.id,
                serviceProvider
            );

            res.json(history);
        } catch (error) {
            console.error('Error getting consent history:', error);
            res.status(400).json({
                error: 'Error al obtener historial de consentimiento',
                details: error.message
            });
        }
    }

    async getConsentForm(req, res) {
        try {
            const { serviceProvider } = req.params;
            const form = ConsentService.generateConsentForm(serviceProvider);
            res.json(form);
        } catch (error) {
            console.error('Error generating consent form:', error);
            res.status(400).json({
                error: 'Error al generar formulario de consentimiento',
                details: error.message
            });
        }
    }
}

module.exports = new ConsentController();
