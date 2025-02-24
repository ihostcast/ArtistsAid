const { Integration, IntegrationLog, User } = require('../models');
const axios = require('axios');
const crypto = require('crypto');
const { OAuth } = require('oauth');

class IntegrationService {
    constructor() {
        this.supportedIntegrations = {
            payment: {
                stripe: this.setupStripeIntegration.bind(this),
                paypal: this.setupPayPalIntegration.bind(this)
            },
            email: {
                sendgrid: this.setupSendGridIntegration.bind(this),
                mailchimp: this.setupMailchimpIntegration.bind(this)
            },
            storage: {
                aws: this.setupAWSIntegration.bind(this),
                gcloud: this.setupGCloudIntegration.bind(this)
            },
            crm: {
                hubspot: this.setupHubspotIntegration.bind(this),
                salesforce: this.setupSalesforceIntegration.bind(this)
            },
            analytics: {
                google: this.setupGoogleAnalyticsIntegration.bind(this),
                mixpanel: this.setupMixpanelIntegration.bind(this)
            },
            social: {
                facebook: this.setupFacebookIntegration.bind(this),
                twitter: this.setupTwitterIntegration.bind(this),
                instagram: this.setupInstagramIntegration.bind(this)
            }
        };
    }

    async setupIntegration(type, provider, config) {
        try {
            if (!this.supportedIntegrations[type]?.[provider]) {
                throw new Error(`Unsupported integration: ${type}/${provider}`);
            }

            // Validar configuración
            await this.validateIntegrationConfig(type, provider, config);

            // Configurar integración
            const integration = await this.supportedIntegrations[type][provider](config);

            // Guardar configuración
            const savedIntegration = await Integration.create({
                type,
                provider,
                config: this.encryptSensitiveData(config),
                status: 'active',
                lastSync: null
            });

            // Probar conexión
            await this.testIntegration(savedIntegration);

            return savedIntegration;
        } catch (error) {
            console.error('Error setting up integration:', error);
            throw error;
        }
    }

    async validateIntegrationConfig(type, provider, config) {
        const requiredFields = {
            payment: {
                stripe: ['apiKey', 'webhookSecret'],
                paypal: ['clientId', 'clientSecret']
            },
            email: {
                sendgrid: ['apiKey', 'fromEmail'],
                mailchimp: ['apiKey', 'listId']
            },
            storage: {
                aws: ['accessKeyId', 'secretAccessKey', 'bucket'],
                gcloud: ['projectId', 'keyFile']
            },
            crm: {
                hubspot: ['apiKey', 'portalId'],
                salesforce: ['clientId', 'clientSecret', 'instanceUrl']
            },
            analytics: {
                google: ['trackingId', 'viewId'],
                mixpanel: ['projectToken']
            },
            social: {
                facebook: ['appId', 'appSecret'],
                twitter: ['apiKey', 'apiSecretKey'],
                instagram: ['accessToken']
            }
        };

        const fields = requiredFields[type]?.[provider];
        if (!fields) return;

        const missing = fields.filter(field => !config[field]);
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
    }

    encryptSensitiveData(config) {
        const encryptedConfig = {};
        for (const [key, value] of Object.entries(config)) {
            if (this.isSensitiveField(key)) {
                encryptedConfig[key] = this.encrypt(value);
            } else {
                encryptedConfig[key] = value;
            }
        }
        return encryptedConfig;
    }

    isSensitiveField(field) {
        const sensitiveFields = [
            'apiKey', 'secret', 'password', 'token', 'key',
            'accessKey', 'privateKey', 'credential'
        ];
        return sensitiveFields.some(sensitive => 
            field.toLowerCase().includes(sensitive.toLowerCase())
        );
    }

    encrypt(value) {
        const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
        let encrypted = cipher.update(value, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    decrypt(value) {
        const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
        let decrypted = decipher.update(value, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    async testIntegration(integration) {
        try {
            const testResult = await this.runIntegrationTest(integration);
            await IntegrationLog.create({
                integrationId: integration.id,
                type: 'test',
                status: testResult.success ? 'success' : 'error',
                details: testResult
            });
            return testResult;
        } catch (error) {
            console.error('Integration test failed:', error);
            throw error;
        }
    }

    async runIntegrationTest(integration) {
        const testMethods = {
            payment: this.testPaymentIntegration.bind(this),
            email: this.testEmailIntegration.bind(this),
            storage: this.testStorageIntegration.bind(this),
            crm: this.testCRMIntegration.bind(this),
            analytics: this.testAnalyticsIntegration.bind(this),
            social: this.testSocialIntegration.bind(this)
        };

        return await testMethods[integration.type](integration);
    }

    // Implementaciones específicas de integraciones

    async setupStripeIntegration(config) {
        const stripe = require('stripe')(config.apiKey);
        try {
            await stripe.accounts.retrieve();
            return { success: true };
        } catch (error) {
            throw new Error('Invalid Stripe configuration');
        }
    }

    async setupPayPalIntegration(config) {
        try {
            const { data } = await axios.post(
                'https://api.sandbox.paypal.com/v1/oauth2/token',
                'grant_type=client_credentials',
                {
                    auth: {
                        username: config.clientId,
                        password: config.clientSecret
                    }
                }
            );
            return { success: true, token: data.access_token };
        } catch (error) {
            throw new Error('Invalid PayPal configuration');
        }
    }

    async setupSendGridIntegration(config) {
        const sgMail = require('@sendgrid/mail');
        try {
            sgMail.setApiKey(config.apiKey);
            await sgMail.send({
                to: 'test@example.com',
                from: config.fromEmail,
                subject: 'Integration Test',
                text: 'Testing SendGrid integration'
            });
            return { success: true };
        } catch (error) {
            throw new Error('Invalid SendGrid configuration');
        }
    }

    async setupMailchimpIntegration(config) {
        try {
            const response = await axios.get(
                `https://${config.dc}.api.mailchimp.com/3.0/lists/${config.listId}`,
                {
                    auth: {
                        username: 'anystring',
                        password: config.apiKey
                    }
                }
            );
            return { success: true, listName: response.data.name };
        } catch (error) {
            throw new Error('Invalid Mailchimp configuration');
        }
    }

    // Métodos de prueba de integración

    async testPaymentIntegration(integration) {
        switch (integration.provider) {
            case 'stripe':
                return this.testStripeIntegration(integration);
            case 'paypal':
                return this.testPayPalIntegration(integration);
            default:
                throw new Error(`Unsupported payment provider: ${integration.provider}`);
        }
    }

    async testEmailIntegration(integration) {
        switch (integration.provider) {
            case 'sendgrid':
                return this.testSendGridIntegration(integration);
            case 'mailchimp':
                return this.testMailchimpIntegration(integration);
            default:
                throw new Error(`Unsupported email provider: ${integration.provider}`);
        }
    }

    // Webhooks y eventos

    async handleWebhook(provider, event, data) {
        try {
            const handler = this.webhookHandlers[provider];
            if (!handler) {
                throw new Error(`No webhook handler for provider: ${provider}`);
            }

            const result = await handler(event, data);
            await this.logWebhookEvent(provider, event, data, result);
            return result;
        } catch (error) {
            console.error('Webhook handling error:', error);
            throw error;
        }
    }

    webhookHandlers = {
        stripe: async (event, data) => {
            switch (event) {
                case 'payment_intent.succeeded':
                    return this.handleStripePaymentSuccess(data);
                case 'payment_intent.failed':
                    return this.handleStripePaymentFailure(data);
                default:
                    return { handled: false };
            }
        },
        paypal: async (event, data) => {
            switch (event) {
                case 'PAYMENT.SALE.COMPLETED':
                    return this.handlePayPalPaymentSuccess(data);
                case 'PAYMENT.SALE.DENIED':
                    return this.handlePayPalPaymentFailure(data);
                default:
                    return { handled: false };
            }
        }
    };

    async logWebhookEvent(provider, event, data, result) {
        await IntegrationLog.create({
            provider,
            event,
            data,
            result,
            timestamp: new Date()
        });
    }

    // Sincronización de datos

    async syncData(integration) {
        try {
            const syncMethod = this.syncMethods[integration.type]?.[integration.provider];
            if (!syncMethod) {
                throw new Error(`No sync method for ${integration.type}/${integration.provider}`);
            }

            const result = await syncMethod(integration);
            await integration.update({ lastSync: new Date() });

            await IntegrationLog.create({
                integrationId: integration.id,
                type: 'sync',
                status: 'success',
                details: result
            });

            return result;
        } catch (error) {
            console.error('Data sync error:', error);
            await IntegrationLog.create({
                integrationId: integration.id,
                type: 'sync',
                status: 'error',
                details: error.message
            });
            throw error;
        }
    }

    syncMethods = {
        crm: {
            hubspot: async (integration) => {
                // Implementar sincronización con HubSpot
            },
            salesforce: async (integration) => {
                // Implementar sincronización con Salesforce
            }
        },
        analytics: {
            google: async (integration) => {
                // Implementar sincronización con Google Analytics
            },
            mixpanel: async (integration) => {
                // Implementar sincronización con Mixpanel
            }
        }
    };
}

module.exports = new IntegrationService();
