const { IntegrationNotification, ThirdPartyIntegration, User } = require('../models');
const emailService = require('./email.service');

class IntegrationNotificationService {
    constructor() {
        this.notificationTypes = {
            TERMS_UPDATE: {
                priority: 'high',
                template: 'terms-update',
                title: 'Actualización de Términos de Servicio'
            },
            SERVICE_DISRUPTION: {
                priority: 'high',
                template: 'service-disruption',
                title: 'Interrupción del Servicio'
            },
            BILLING_ISSUE: {
                priority: 'high',
                template: 'billing-issue',
                title: 'Problema de Facturación'
            },
            API_DEPRECATION: {
                priority: 'medium',
                template: 'api-deprecation',
                title: 'Deprecación de API'
            },
            USAGE_LIMIT: {
                priority: 'medium',
                template: 'usage-limit',
                title: 'Límite de Uso Alcanzado'
            },
            MAINTENANCE: {
                priority: 'low',
                template: 'maintenance',
                title: 'Mantenimiento Programado'
            }
        };
    }

    async createNotification(data) {
        try {
            const notification = await IntegrationNotification.create({
                type: data.type,
                serviceProvider: data.serviceProvider,
                title: this.notificationTypes[data.type].title,
                message: data.message,
                priority: this.notificationTypes[data.type].priority,
                metadata: data.metadata,
                affectedUsers: data.affectedUsers || [],
                actionRequired: data.actionRequired || false,
                actionUrl: data.actionUrl,
                expiresAt: data.expiresAt
            });

            // Notificar a usuarios afectados
            await this.notifyAffectedUsers(notification);

            return notification;
        } catch (error) {
            console.error('Error creating integration notification:', error);
            throw error;
        }
    }

    async notifyAffectedUsers(notification) {
        try {
            const { affectedUsers, type, serviceProvider } = notification;

            // Si no hay usuarios específicos, notificar a todos los usuarios del servicio
            const users = affectedUsers.length > 0 
                ? await User.findAll({ where: { id: affectedUsers } })
                : await this.getUsersByService(serviceProvider);

            const template = this.notificationTypes[type].template;
            const emailPromises = users.map(user => 
                emailService.sendEmail({
                    to: user.email,
                    template,
                    data: {
                        userName: user.name,
                        notification,
                        serviceProvider
                    }
                })
            );

            await Promise.all(emailPromises);
        } catch (error) {
            console.error('Error notifying affected users:', error);
            throw error;
        }
    }

    async getUsersByService(serviceProvider) {
        const integration = await ThirdPartyIntegration.findOne({
            where: { provider: serviceProvider }
        });

        return await User.findAll({
            include: [{
                model: ThirdPartyIntegration,
                where: { id: integration.id }
            }]
        });
    }

    async getNotifications(userId, filters = {}) {
        try {
            const where = { ...filters };
            
            if (userId) {
                where.affectedUsers = {
                    [Op.contains]: [userId]
                };
            }

            const notifications = await IntegrationNotification.findAll({
                where,
                order: [
                    ['priority', 'DESC'],
                    ['createdAt', 'DESC']
                ]
            });

            return notifications;
        } catch (error) {
            console.error('Error getting notifications:', error);
            throw error;
        }
    }

    async markAsRead(notificationId, userId) {
        try {
            const notification = await IntegrationNotification.findByPk(notificationId);
            
            if (!notification) {
                throw new Error('Notification not found');
            }

            const readBy = notification.readBy || [];
            if (!readBy.includes(userId)) {
                readBy.push(userId);
                await notification.update({ readBy });
            }

            return notification;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    async createServiceDisruptionNotification(serviceProvider, details) {
        return await this.createNotification({
            type: 'SERVICE_DISRUPTION',
            serviceProvider,
            message: `El servicio ${serviceProvider} está experimentando problemas: ${details.message}`,
            metadata: {
                expectedResolution: details.expectedResolution,
                affectedFeatures: details.affectedFeatures,
                workaround: details.workaround
            },
            actionRequired: details.actionRequired,
            actionUrl: details.statusPage
        });
    }

    async createTermsUpdateNotification(serviceProvider, details) {
        return await this.createNotification({
            type: 'TERMS_UPDATE',
            serviceProvider,
            message: `${serviceProvider} ha actualizado sus términos de servicio`,
            metadata: {
                effectiveDate: details.effectiveDate,
                majorChanges: details.majorChanges,
                version: details.version
            },
            actionRequired: true,
            actionUrl: `/consent/form/${serviceProvider}`,
            expiresAt: new Date(details.effectiveDate)
        });
    }

    async createBillingIssueNotification(serviceProvider, details) {
        return await this.createNotification({
            type: 'BILLING_ISSUE',
            serviceProvider,
            message: `Problema de facturación detectado con ${serviceProvider}`,
            metadata: {
                issue: details.issue,
                amount: details.amount,
                dueDate: details.dueDate
            },
            actionRequired: true,
            actionUrl: details.billingUrl
        });
    }

    async createUsageLimitNotification(serviceProvider, details) {
        return await this.createNotification({
            type: 'USAGE_LIMIT',
            serviceProvider,
            message: `Has alcanzado el ${details.percentage}% de tu límite en ${serviceProvider}`,
            metadata: {
                currentUsage: details.currentUsage,
                limit: details.limit,
                period: details.period
            },
            actionRequired: details.percentage >= 90
        });
    }

    async getServiceHealth(serviceProvider) {
        try {
            const recentDisruptions = await IntegrationNotification.findAll({
                where: {
                    serviceProvider,
                    type: 'SERVICE_DISRUPTION',
                    createdAt: {
                        [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // últimas 24 horas
                    }
                }
            });

            const integration = await ThirdPartyIntegration.findOne({
                where: { provider: serviceProvider }
            });

            return {
                status: recentDisruptions.length > 0 ? 'disrupted' : 'healthy',
                lastCheck: integration.lastHealthCheck,
                recentDisruptions,
                uptime: integration.metadata.uptime || '100%'
            };
        } catch (error) {
            console.error('Error getting service health:', error);
            throw error;
        }
    }

    async deleteExpiredNotifications() {
        try {
            const deleted = await IntegrationNotification.destroy({
                where: {
                    expiresAt: {
                        [Op.lt]: new Date()
                    }
                }
            });

            return {
                success: true,
                deletedCount: deleted
            };
        } catch (error) {
            console.error('Error deleting expired notifications:', error);
            throw error;
        }
    }
}

module.exports = new IntegrationNotificationService();
