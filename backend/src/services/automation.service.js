const { User, Subscription, Invoice, Task, Notification } = require('../models');
const { sendEmail } = require('../utils/email');
const cron = require('node-cron');

class AutomationService {
    constructor() {
        this.initializeScheduledTasks();
    }

    initializeScheduledTasks() {
        // Tareas diarias
        cron.schedule('0 0 * * *', () => this.runDailyTasks());
        
        // Tareas semanales
        cron.schedule('0 0 * * 0', () => this.runWeeklyTasks());
        
        // Tareas mensuales
        cron.schedule('0 0 1 * *', () => this.runMonthlyTasks());
    }

    async runDailyTasks() {
        await Promise.all([
            this.checkSubscriptionRenewals(),
            this.sendPaymentReminders(),
            this.checkServiceStatus(),
            this.processAutomaticBackups(),
            this.updateExchangeRates(),
            this.cleanupTemporaryFiles()
        ]);
    }

    async runWeeklyTasks() {
        await Promise.all([
            this.generateWeeklyReports(),
            this.checkDomainExpirations(),
            this.sendWeeklyNewsletters(),
            this.processAffiliatePayouts()
        ]);
    }

    async runMonthlyTasks() {
        await Promise.all([
            this.generateMonthlyInvoices(),
            this.generateMonthlyReports(),
            this.processMonthlyCommissions(),
            this.checkResourceUsage()
        ]);
    }

    async checkSubscriptionRenewals() {
        try {
            const dueSubscriptions = await Subscription.findAll({
                where: {
                    status: 'active',
                    nextBillingDate: {
                        [Op.lte]: new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 horas
                    }
                },
                include: [{ model: User }]
            });

            for (const subscription of dueSubscriptions) {
                // Enviar recordatorio de renovación
                await sendEmail({
                    to: subscription.User.email,
                    template: 'subscription_renewal',
                    data: {
                        subscription,
                        dueDate: subscription.nextBillingDate
                    }
                });

                // Crear tarea de renovación
                await Task.create({
                    type: 'subscription_renewal',
                    status: 'pending',
                    data: {
                        subscriptionId: subscription.id,
                        userId: subscription.userId,
                        dueDate: subscription.nextBillingDate
                    },
                    scheduledFor: subscription.nextBillingDate
                });
            }
        } catch (error) {
            console.error('Error checking subscription renewals:', error);
        }
    }

    async sendPaymentReminders() {
        try {
            const overdueInvoices = await Invoice.findAll({
                where: {
                    status: 'unpaid',
                    dueDate: {
                        [Op.lt]: new Date()
                    }
                },
                include: [{ model: User }]
            });

            for (const invoice of overdueInvoices) {
                const daysOverdue = Math.floor(
                    (Date.now() - invoice.dueDate) / (1000 * 60 * 60 * 24)
                );

                // Determinar el tipo de recordatorio
                let template;
                if (daysOverdue >= 30) {
                    template = 'payment_reminder_final';
                } else if (daysOverdue >= 14) {
                    template = 'payment_reminder_urgent';
                } else if (daysOverdue >= 7) {
                    template = 'payment_reminder_second';
                } else {
                    template = 'payment_reminder_first';
                }

                // Enviar recordatorio
                await sendEmail({
                    to: invoice.User.email,
                    template,
                    data: {
                        invoice,
                        daysOverdue
                    }
                });

                // Actualizar estado de la factura
                await invoice.update({
                    remindersSent: (invoice.remindersSent || 0) + 1,
                    lastReminderDate: new Date()
                });
            }
        } catch (error) {
            console.error('Error sending payment reminders:', error);
        }
    }

    async checkServiceStatus() {
        try {
            const activeServices = await Subscription.findAll({
                where: { status: 'active' },
                include: [{ model: User }]
            });

            for (const service of activeServices) {
                const status = await this.checkResourceUsage(service);
                
                if (status.hasWarnings) {
                    await Notification.create({
                        userId: service.userId,
                        type: 'service_warning',
                        title: 'Advertencia de Uso de Recursos',
                        message: status.warningMessage
                    });

                    await sendEmail({
                        to: service.User.email,
                        template: 'service_warning',
                        data: { service, status }
                    });
                }

                if (status.hasErrors) {
                    await this.createSupportTicket({
                        userId: service.userId,
                        subject: 'Problema de Recursos Detectado',
                        message: status.errorMessage,
                        priority: 'high'
                    });
                }
            }
        } catch (error) {
            console.error('Error checking service status:', error);
        }
    }

    async processAutomaticBackups() {
        try {
            // Implementar lógica de respaldo
            const backupConfig = {
                databases: true,
                files: true,
                configurations: true,
                retention: '30d'
            };

            // Crear respaldo
            const backup = await this.createBackup(backupConfig);

            // Verificar respaldo
            if (await this.verifyBackup(backup)) {
                // Almacenar en ubicación segura
                await this.storeBackup(backup);

                // Limpiar respaldos antiguos
                await this.cleanupOldBackups();
            } else {
                // Notificar error
                await this.notifyBackupFailure(backup);
            }
        } catch (error) {
            console.error('Error processing automatic backups:', error);
        }
    }

    async generateWeeklyReports() {
        try {
            // Generar reportes semanales
            const reports = {
                newUsers: await this.generateNewUsersReport(),
                revenue: await this.generateRevenueReport(),
                support: await this.generateSupportReport(),
                performance: await this.generatePerformanceReport()
            };

            // Enviar reportes a administradores
            const admins = await User.findAll({
                where: { role: 'admin' }
            });

            for (const admin of admins) {
                await sendEmail({
                    to: admin.email,
                    template: 'weekly_report',
                    data: { reports }
                });
            }
        } catch (error) {
            console.error('Error generating weekly reports:', error);
        }
    }

    async checkDomainExpirations() {
        try {
            const domains = await Domain.findAll({
                where: {
                    expirationDate: {
                        [Op.lte]: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    }
                },
                include: [{ model: User }]
            });

            for (const domain of domains) {
                const daysUntilExpiration = Math.floor(
                    (domain.expirationDate - Date.now()) / (1000 * 60 * 60 * 24)
                );

                await sendEmail({
                    to: domain.User.email,
                    template: 'domain_expiration',
                    data: {
                        domain,
                        daysUntilExpiration
                    }
                });
            }
        } catch (error) {
            console.error('Error checking domain expirations:', error);
        }
    }

    async generateMonthlyInvoices() {
        try {
            const activeSubscriptions = await Subscription.findAll({
                where: {
                    status: 'active',
                    billingCycle: 'monthly'
                },
                include: [{ model: User }]
            });

            for (const subscription of activeSubscriptions) {
                await Invoice.create({
                    userId: subscription.userId,
                    subscriptionId: subscription.id,
                    amount: subscription.price,
                    status: 'pending',
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    items: [{
                        description: `${subscription.plan} - Mensual`,
                        amount: subscription.price
                    }]
                });
            }
        } catch (error) {
            console.error('Error generating monthly invoices:', error);
        }
    }

    async checkResourceUsage(service) {
        // Implementar verificación de recursos
        const usage = {
            storage: await this.getStorageUsage(service),
            bandwidth: await this.getBandwidthUsage(service),
            cpu: await this.getCPUUsage(service),
            memory: await this.getMemoryUsage(service)
        };

        const limits = service.limits;
        const status = {
            hasWarnings: false,
            hasErrors: false,
            warningMessage: '',
            errorMessage: ''
        };

        // Verificar cada recurso
        for (const [resource, value] of Object.entries(usage)) {
            const limit = limits[resource];
            const usagePercentage = (value / limit) * 100;

            if (usagePercentage >= 90) {
                status.hasErrors = true;
                status.errorMessage += `${resource} usage critical (${usagePercentage}%). `;
            } else if (usagePercentage >= 75) {
                status.hasWarnings = true;
                status.warningMessage += `${resource} usage high (${usagePercentage}%). `;
            }
        }

        return status;
    }

    async createBackup(config) {
        // Implementar creación de respaldo
    }

    async verifyBackup(backup) {
        // Implementar verificación de respaldo
    }

    async storeBackup(backup) {
        // Implementar almacenamiento de respaldo
    }

    async cleanupOldBackups() {
        // Implementar limpieza de respaldos antiguos
    }

    async notifyBackupFailure(backup) {
        // Implementar notificación de fallo de respaldo
    }

    // Métodos auxiliares para obtener uso de recursos
    async getStorageUsage(service) {}
    async getBandwidthUsage(service) {}
    async getCPUUsage(service) {}
    async getMemoryUsage(service) {}
}

module.exports = new AutomationService();
