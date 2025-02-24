const { UserConsent, ServiceTerms, ConsentLog } = require('../models');
const { ThirdPartyIntegration } = require('../models');

class ConsentService {
    constructor() {
        this.requiredConsents = {
            stripe: {
                terms: 'https://stripe.com/legal',
                privacy: 'https://stripe.com/privacy',
                description: 'Procesamiento de pagos y gestión de suscripciones'
            },
            sendgrid: {
                terms: 'https://sendgrid.com/terms',
                privacy: 'https://sendgrid.com/privacy',
                description: 'Envío de correos electrónicos y notificaciones'
            },
            aws: {
                terms: 'https://aws.amazon.com/service-terms/',
                privacy: 'https://aws.amazon.com/privacy/',
                description: 'Almacenamiento de archivos y recursos'
            },
            google: {
                terms: 'https://cloud.google.com/terms',
                privacy: 'https://cloud.google.com/privacy',
                description: 'Análisis y almacenamiento en la nube'
            },
            hubspot: {
                terms: 'https://legal.hubspot.com/terms-of-service',
                privacy: 'https://legal.hubspot.com/privacy-policy',
                description: 'Gestión de relaciones con clientes'
            },
            salesforce: {
                terms: 'https://www.salesforce.com/company/legal/sfdc-website-terms-of-service/',
                privacy: 'https://www.salesforce.com/company/privacy/',
                description: 'Gestión de ventas y clientes'
            },
            openai: {
                terms: 'https://openai.com/policies/terms-of-use',
                privacy: 'https://openai.com/policies/privacy-policy',
                description: 'Servicios de inteligencia artificial'
            }
        };
    }

    async recordConsent(userId, serviceProvider, consentData) {
        try {
            // Verificar si el servicio existe
            const integration = await ThirdPartyIntegration.findOne({
                where: { provider: serviceProvider }
            });

            if (!integration) {
                throw new Error(`Servicio no encontrado: ${serviceProvider}`);
            }

            // Crear o actualizar el consentimiento
            const [consent, created] = await UserConsent.findOrCreate({
                where: { userId, serviceProvider },
                defaults: {
                    termsAccepted: true,
                    termsVersion: consentData.termsVersion,
                    acceptedAt: new Date(),
                    ipAddress: consentData.ipAddress,
                    userAgent: consentData.userAgent,
                    metadata: {
                        location: consentData.location,
                        device: consentData.device
                    }
                }
            });

            if (!created) {
                await consent.update({
                    termsAccepted: true,
                    termsVersion: consentData.termsVersion,
                    acceptedAt: new Date(),
                    ipAddress: consentData.ipAddress,
                    userAgent: consentData.userAgent,
                    metadata: {
                        location: consentData.location,
                        device: consentData.device
                    }
                });
            }

            // Registrar en el log de consentimientos
            await ConsentLog.create({
                userId,
                serviceProvider,
                action: created ? 'create' : 'update',
                termsVersion: consentData.termsVersion,
                ipAddress: consentData.ipAddress,
                userAgent: consentData.userAgent,
                metadata: consentData.metadata
            });

            return consent;
        } catch (error) {
            console.error('Error recording consent:', error);
            throw error;
        }
    }

    async verifyConsent(userId, serviceProvider) {
        try {
            const consent = await UserConsent.findOne({
                where: {
                    userId,
                    serviceProvider,
                    termsAccepted: true
                }
            });

            // Verificar si los términos han sido actualizados
            const currentTerms = await ServiceTerms.findOne({
                where: { serviceProvider },
                order: [['version', 'DESC']]
            });

            if (!consent) {
                return {
                    hasConsent: false,
                    requiresUpdate: false,
                    message: 'Consentimiento no otorgado'
                };
            }

            const requiresUpdate = currentTerms.version > consent.termsVersion;

            return {
                hasConsent: true,
                requiresUpdate,
                lastAccepted: consent.acceptedAt,
                currentVersion: currentTerms.version,
                acceptedVersion: consent.termsVersion,
                message: requiresUpdate ? 'Se requiere actualización del consentimiento' : 'Consentimiento válido'
            };
        } catch (error) {
            console.error('Error verifying consent:', error);
            throw error;
        }
    }

    async getServiceTerms(serviceProvider) {
        try {
            const terms = this.requiredConsents[serviceProvider];
            if (!terms) {
                throw new Error(`Términos no encontrados para: ${serviceProvider}`);
            }

            const currentTerms = await ServiceTerms.findOne({
                where: { serviceProvider },
                order: [['version', 'DESC']]
            });

            return {
                ...terms,
                version: currentTerms.version,
                lastUpdated: currentTerms.updatedAt,
                requirements: currentTerms.requirements,
                restrictions: currentTerms.restrictions
            };
        } catch (error) {
            console.error('Error getting service terms:', error);
            throw error;
        }
    }

    async revokeConsent(userId, serviceProvider) {
        try {
            const consent = await UserConsent.findOne({
                where: { userId, serviceProvider }
            });

            if (!consent) {
                throw new Error('Consentimiento no encontrado');
            }

            await consent.update({
                termsAccepted: false,
                revokedAt: new Date()
            });

            // Registrar la revocación
            await ConsentLog.create({
                userId,
                serviceProvider,
                action: 'revoke',
                termsVersion: consent.termsVersion,
                metadata: { reason: 'User requested revocation' }
            });

            return {
                success: true,
                message: 'Consentimiento revocado exitosamente'
            };
        } catch (error) {
            console.error('Error revoking consent:', error);
            throw error;
        }
    }

    async getConsentHistory(userId, serviceProvider) {
        try {
            const history = await ConsentLog.findAll({
                where: { userId, serviceProvider },
                order: [['createdAt', 'DESC']]
            });

            return history.map(log => ({
                action: log.action,
                timestamp: log.createdAt,
                termsVersion: log.termsVersion,
                ipAddress: log.ipAddress,
                userAgent: log.userAgent,
                metadata: log.metadata
            }));
        } catch (error) {
            console.error('Error getting consent history:', error);
            throw error;
        }
    }

    generateConsentForm(serviceProvider) {
        const terms = this.requiredConsents[serviceProvider];
        if (!terms) {
            throw new Error(`Servicio no soportado: ${serviceProvider}`);
        }

        return {
            provider: serviceProvider,
            description: terms.description,
            requiredConsents: [
                {
                    type: 'terms',
                    url: terms.terms,
                    label: `Acepto los términos y condiciones de ${serviceProvider}`
                },
                {
                    type: 'privacy',
                    url: terms.privacy,
                    label: `Acepto la política de privacidad de ${serviceProvider}`
                },
                {
                    type: 'data_processing',
                    label: `Autorizo el procesamiento de mis datos por ${serviceProvider}`
                },
                {
                    type: 'billing',
                    label: 'Entiendo que soy responsable de todos los cargos asociados con este servicio'
                }
            ],
            additionalInformation: [
                'Puede revocar este consentimiento en cualquier momento',
                'Los cambios en los términos requerirán un nuevo consentimiento',
                'Sus datos serán procesados de acuerdo con las políticas del proveedor'
            ]
        };
    }
}

module.exports = new ConsentService();
