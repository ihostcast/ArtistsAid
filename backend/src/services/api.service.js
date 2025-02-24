const crypto = require('crypto');
const { ApiKey, ApiLog, User } = require('../models');
const rateLimit = require('express-rate-limit');
const { validateApiSchema } = require('../utils/validation');

class ApiService {
    constructor() {
        this.setupRateLimits();
    }

    setupRateLimits() {
        this.rateLimiter = {
            basic: rateLimit({
                windowMs: 15 * 60 * 1000, // 15 minutos
                max: 100 // límite de solicitudes
            }),
            premium: rateLimit({
                windowMs: 15 * 60 * 1000,
                max: 1000
            }),
            unlimited: rateLimit({
                windowMs: 15 * 60 * 1000,
                max: 0 // sin límite
            })
        };
    }

    async generateApiKey(userId, scope = 'basic') {
        try {
            const user = await User.findByPk(userId);
            if (!user) throw new Error('User not found');

            // Generar API key única
            const apiKey = crypto.randomBytes(32).toString('hex');
            const secretKey = crypto.randomBytes(32).toString('hex');

            // Crear registro de API key
            const key = await ApiKey.create({
                userId,
                apiKey: this.hashKey(apiKey),
                secretKey: this.hashKey(secretKey),
                scope,
                status: 'active',
                lastUsed: null,
                ipWhitelist: [],
                rateLimit: this.getRateLimitForScope(scope)
            });

            // Solo devolver las claves en texto plano una vez
            return {
                id: key.id,
                apiKey,
                secretKey,
                scope,
                rateLimit: key.rateLimit
            };
        } catch (error) {
            console.error('Error generating API key:', error);
            throw error;
        }
    }

    getRateLimitForScope(scope) {
        const limits = {
            basic: 100,
            premium: 1000,
            unlimited: 0
        };
        return limits[scope] || limits.basic;
    }

    hashKey(key) {
        return crypto.createHash('sha256').update(key).digest('hex');
    }

    async validateApiKey(apiKey, secretKey) {
        try {
            const key = await ApiKey.findOne({
                where: {
                    apiKey: this.hashKey(apiKey),
                    status: 'active'
                },
                include: [{ model: User }]
            });

            if (!key) return false;

            // Verificar secret key
            const isValidSecret = this.hashKey(secretKey) === key.secretKey;
            if (!isValidSecret) return false;

            // Actualizar último uso
            await key.update({ lastUsed: new Date() });

            return {
                isValid: true,
                userId: key.userId,
                scope: key.scope,
                rateLimit: key.rateLimit
            };
        } catch (error) {
            console.error('Error validating API key:', error);
            return false;
        }
    }

    async logApiCall(apiKeyId, endpoint, method, requestData, responseStatus) {
        try {
            await ApiLog.create({
                apiKeyId,
                endpoint,
                method,
                requestData,
                responseStatus,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error logging API call:', error);
        }
    }

    // Endpoints de la API

    async getUsers(params) {
        try {
            const schema = {
                type: 'object',
                properties: {
                    page: { type: 'number' },
                    limit: { type: 'number' },
                    status: { type: 'string' },
                    role: { type: 'string' }
                }
            };

            validateApiSchema(params, schema);

            const users = await User.findAll({
                where: this.buildWhereClause(params),
                limit: params.limit || 10,
                offset: ((params.page || 1) - 1) * (params.limit || 10)
            });

            return users;
        } catch (error) {
            console.error('Error in getUsers API:', error);
            throw error;
        }
    }

    async createUser(data) {
        try {
            const schema = {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    name: { type: 'string' },
                    role: { type: 'string' }
                }
            };

            validateApiSchema(data, schema);

            const user = await User.create(data);
            return user;
        } catch (error) {
            console.error('Error in createUser API:', error);
            throw error;
        }
    }

    async getSubscriptions(params) {
        try {
            const schema = {
                type: 'object',
                properties: {
                    userId: { type: 'string' },
                    status: { type: 'string' },
                    page: { type: 'number' },
                    limit: { type: 'number' }
                }
            };

            validateApiSchema(params, schema);

            const subscriptions = await Subscription.findAll({
                where: this.buildWhereClause(params),
                limit: params.limit || 10,
                offset: ((params.page || 1) - 1) * (params.limit || 10),
                include: [{ model: User }]
            });

            return subscriptions;
        } catch (error) {
            console.error('Error in getSubscriptions API:', error);
            throw error;
        }
    }

    async createSubscription(data) {
        try {
            const schema = {
                type: 'object',
                required: ['userId', 'plan', 'billingCycle'],
                properties: {
                    userId: { type: 'string' },
                    plan: { type: 'string' },
                    billingCycle: { type: 'string' }
                }
            };

            validateApiSchema(data, schema);

            const subscription = await Subscription.create(data);
            return subscription;
        } catch (error) {
            console.error('Error in createSubscription API:', error);
            throw error;
        }
    }

    async getInvoices(params) {
        try {
            const schema = {
                type: 'object',
                properties: {
                    userId: { type: 'string' },
                    status: { type: 'string' },
                    page: { type: 'number' },
                    limit: { type: 'number' }
                }
            };

            validateApiSchema(params, schema);

            const invoices = await Invoice.findAll({
                where: this.buildWhereClause(params),
                limit: params.limit || 10,
                offset: ((params.page || 1) - 1) * (params.limit || 10),
                include: [{ model: User }]
            });

            return invoices;
        } catch (error) {
            console.error('Error in getInvoices API:', error);
            throw error;
        }
    }

    async createInvoice(data) {
        try {
            const schema = {
                type: 'object',
                required: ['userId', 'amount', 'items'],
                properties: {
                    userId: { type: 'string' },
                    amount: { type: 'number' },
                    items: { 
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['description', 'amount'],
                            properties: {
                                description: { type: 'string' },
                                amount: { type: 'number' }
                            }
                        }
                    }
                }
            };

            validateApiSchema(data, schema);

            const invoice = await Invoice.create(data);
            return invoice;
        } catch (error) {
            console.error('Error in createInvoice API:', error);
            throw error;
        }
    }

    buildWhereClause(params) {
        const where = {};
        
        // Remover parámetros de paginación y otros no relacionados con filtros
        const { page, limit, ...filters } = params;

        // Construir cláusula where basada en filtros
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                where[key] = value;
            }
        });

        return where;
    }

    // Webhooks
    async registerWebhook(userId, data) {
        try {
            const schema = {
                type: 'object',
                required: ['url', 'events'],
                properties: {
                    url: { type: 'string', format: 'uri' },
                    events: { 
                        type: 'array',
                        items: { type: 'string' }
                    },
                    secret: { type: 'string' }
                }
            };

            validateApiSchema(data, schema);

            const webhook = await Webhook.create({
                userId,
                url: data.url,
                events: data.events,
                secret: data.secret,
                status: 'active'
            });

            return webhook;
        } catch (error) {
            console.error('Error registering webhook:', error);
            throw error;
        }
    }

    async triggerWebhook(event, data) {
        try {
            const webhooks = await Webhook.findAll({
                where: {
                    status: 'active',
                    events: {
                        [Op.contains]: [event]
                    }
                }
            });

            for (const webhook of webhooks) {
                try {
                    const signature = this.generateWebhookSignature(data, webhook.secret);
                    
                    await axios.post(webhook.url, data, {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Webhook-Signature': signature
                        }
                    });

                    await WebhookLog.create({
                        webhookId: webhook.id,
                        event,
                        data,
                        status: 'success'
                    });
                } catch (error) {
                    await WebhookLog.create({
                        webhookId: webhook.id,
                        event,
                        data,
                        status: 'failed',
                        error: error.message
                    });
                }
            }
        } catch (error) {
            console.error('Error triggering webhooks:', error);
        }
    }

    generateWebhookSignature(data, secret) {
        return crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(data))
            .digest('hex');
    }
}

module.exports = new ApiService();
