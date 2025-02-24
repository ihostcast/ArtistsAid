const ThirdPartyService = require('../services/third-party.service');
const IntegrationNotificationService = require('../services/integration-notification.service');
const ConsentService = require('../services/consent.service');
const { validateRequest } = require('../middleware/validator');
const { isAdmin } = require('../middleware/auth');

class IntegrationAdminController {
    async getIntegrationDashboard(req, res) {
        try {
            const integrations = await ThirdPartyService.getAllIntegrations();
            const stats = await this.getIntegrationStats();
            const recentNotifications = await IntegrationNotificationService.getNotifications(
                null,
                { limit: 5 }
            );

            res.json({
                integrations,
                stats,
                recentNotifications
            });
        } catch (error) {
            console.error('Error getting integration dashboard:', error);
            res.status(500).json({
                error: 'Error al obtener dashboard de integraciones',
                details: error.message
            });
        }
    }

    async getIntegrationStats() {
        const stats = {
            totalIntegrations: await ThirdPartyService.countIntegrations(),
            activeIntegrations: await ThirdPartyService.countIntegrations({ status: 'active' }),
            totalUsers: await ThirdPartyService.countUsersWithIntegrations(),
            recentIssues: await IntegrationNotificationService.countRecentIssues(),
            pendingConsents: await ConsentService.countPendingConsents()
        };

        return stats;
    }

    async updateIntegrationConfig(req, res) {
        try {
            validateRequest(req.body, {
                required: ['provider', 'config'],
                optional: ['metadata']
            });

            const { provider, config, metadata } = req.body;
            const updatedIntegration = await ThirdPartyService.updateIntegrationConfig(
                provider,
                config,
                metadata
            );

            res.json({
                success: true,
                message: 'Configuración actualizada exitosamente',
                integration: updatedIntegration
            });
        } catch (error) {
            console.error('Error updating integration config:', error);
            res.status(400).json({
                error: 'Error al actualizar configuración',
                details: error.message
            });
        }
    }

    async getIntegrationHealth(req, res) {
        try {
            const { provider } = req.params;
            const health = await ThirdPartyService.checkServiceHealth(provider);

            res.json(health);
        } catch (error) {
            console.error('Error checking integration health:', error);
            res.status(400).json({
                error: 'Error al verificar salud del servicio',
                details: error.message
            });
        }
    }

    async rotateApiKeys(req, res) {
        try {
            const { provider } = req.params;
            const result = await ThirdPartyService.rotateApiKey(provider);

            res.json({
                success: true,
                message: 'API key rotada exitosamente',
                ...result
            });
        } catch (error) {
            console.error('Error rotating API key:', error);
            res.status(400).json({
                error: 'Error al rotar API key',
                details: error.message
            });
        }
    }

    async getIntegrationLogs(req, res) {
        try {
            const { provider } = req.params;
            const { startDate, endDate, type } = req.query;

            const logs = await ThirdPartyService.getIntegrationLogs(
                provider,
                { startDate, endDate, type }
            );

            res.json(logs);
        } catch (error) {
            console.error('Error getting integration logs:', error);
            res.status(400).json({
                error: 'Error al obtener logs',
                details: error.message
            });
        }
    }

    async createServiceNotification(req, res) {
        try {
            validateRequest(req.body, {
                required: ['type', 'serviceProvider', 'message'],
                optional: ['metadata', 'affectedUsers', 'actionRequired', 'actionUrl', 'expiresAt']
            });

            const notification = await IntegrationNotificationService.createNotification(req.body);

            res.json({
                success: true,
                message: 'Notificación creada exitosamente',
                notification
            });
        } catch (error) {
            console.error('Error creating service notification:', error);
            res.status(400).json({
                error: 'Error al crear notificación',
                details: error.message
            });
        }
    }

    async updateServiceTerms(req, res) {
        try {
            validateRequest(req.body, {
                required: ['serviceProvider', 'version', 'changes'],
                optional: ['effectiveDate', 'termsUrl', 'privacyUrl']
            });

            const terms = await ConsentService.updateServiceTerms(req.body);

            // Crear notificación de actualización de términos
            await IntegrationNotificationService.createTermsUpdateNotification(
                req.body.serviceProvider,
                {
                    effectiveDate: req.body.effectiveDate,
                    majorChanges: req.body.changes,
                    version: req.body.version
                }
            );

            res.json({
                success: true,
                message: 'Términos actualizados exitosamente',
                terms
            });
        } catch (error) {
            console.error('Error updating service terms:', error);
            res.status(400).json({
                error: 'Error al actualizar términos',
                details: error.message
            });
        }
    }

    async getIntegrationAnalytics(req, res) {
        try {
            const { provider } = req.params;
            const { startDate, endDate } = req.query;

            const analytics = await ThirdPartyService.getIntegrationAnalytics(
                provider,
                startDate,
                endDate
            );

            res.json(analytics);
        } catch (error) {
            console.error('Error getting integration analytics:', error);
            res.status(400).json({
                error: 'Error al obtener análisis',
                details: error.message
            });
        }
    }

    async bulkUpdateIntegrations(req, res) {
        try {
            validateRequest(req.body, {
                required: ['providers', 'updates']
            });

            const { providers, updates } = req.body;
            const results = await ThirdPartyService.bulkUpdateIntegrations(
                providers,
                updates
            );

            res.json({
                success: true,
                message: 'Integraciones actualizadas exitosamente',
                results
            });
        } catch (error) {
            console.error('Error bulk updating integrations:', error);
            res.status(400).json({
                error: 'Error al actualizar integraciones',
                details: error.message
            });
        }
    }
}

module.exports = new IntegrationAdminController();
