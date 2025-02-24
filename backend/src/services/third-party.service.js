const axios = require('axios');
const AWS = require('aws-sdk');
const { Storage } = require('@google-cloud/storage');
const Stripe = require('stripe');
const sgMail = require('@sendgrid/mail');
const { google } = require('googleapis');
const Twitter = require('twitter-api-v2').TwitterApi;
const { Client } = require('@hubspot/api-client');
const { Client: SalesforceClient } = require('jsforce');
const Mailchimp = require('@mailchimp/mailchimp_marketing');
const OpenAI = require('openai');
const { Configuration, OpenAIApi } = require("openai");
const { ThirdPartyIntegration, ApiKey } = require('../models');

class ThirdPartyService {
    constructor() {
        this.initializeServices();
    }

    async initializeServices() {
        try {
            // Inicializar servicios con configuraciones desde la base de datos
            const integrations = await ThirdPartyIntegration.findAll({
                where: { status: 'active' }
            });

            for (const integration of integrations) {
                await this.initializeService(integration);
            }
        } catch (error) {
            console.error('Error initializing third-party services:', error);
        }
    }

    async initializeService(integration) {
        const { provider, config } = integration;

        switch (provider) {
            case 'aws':
                this.initAWS(config);
                break;
            case 'google':
                await this.initGoogle(config);
                break;
            case 'stripe':
                this.initStripe(config);
                break;
            case 'sendgrid':
                this.initSendGrid(config);
                break;
            case 'twitter':
                this.initTwitter(config);
                break;
            case 'hubspot':
                this.initHubspot(config);
                break;
            case 'salesforce':
                await this.initSalesforce(config);
                break;
            case 'mailchimp':
                this.initMailchimp(config);
                break;
            case 'openai':
                this.initOpenAI(config);
                break;
        }
    }

    // Inicializadores de servicios

    initAWS(config) {
        AWS.config.update({
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
            region: config.region
        });

        this.s3 = new AWS.S3();
        this.ses = new AWS.SES();
        this.cloudfront = new AWS.CloudFront();
    }

    async initGoogle(config) {
        this.googleStorage = new Storage({
            projectId: config.projectId,
            keyFilename: config.keyFilename
        });

        const auth = new google.auth.GoogleAuth({
            credentials: config.credentials,
            scopes: ['https://www.googleapis.com/auth/analytics.readonly']
        });

        this.analytics = google.analytics({
            version: 'v4',
            auth: await auth.getClient()
        });
    }

    initStripe(config) {
        this.stripe = new Stripe(config.secretKey, {
            apiVersion: '2023-10-16'
        });
    }

    initSendGrid(config) {
        sgMail.setApiKey(config.apiKey);
        this.sendgrid = sgMail;
    }

    initTwitter(config) {
        this.twitter = new Twitter({
            appKey: config.apiKey,
            appSecret: config.apiSecretKey,
            accessToken: config.accessToken,
            accessSecret: config.accessTokenSecret
        });
    }

    initHubspot(config) {
        this.hubspot = new Client({ accessToken: config.accessToken });
    }

    async initSalesforce(config) {
        this.salesforce = new SalesforceClient({
            loginUrl: config.loginUrl
        });

        await this.salesforce.login(config.username, config.password + config.securityToken);
    }

    initMailchimp(config) {
        Mailchimp.setConfig({
            apiKey: config.apiKey,
            server: config.server
        });

        this.mailchimp = Mailchimp;
    }

    initOpenAI(config) {
        const configuration = new Configuration({
            apiKey: config.apiKey,
        });
        this.openai = new OpenAIApi(configuration);
    }

    // Métodos de almacenamiento en la nube

    async uploadToCloud(file, options) {
        const { provider, path } = options;

        switch (provider) {
            case 'aws':
                return await this.uploadToS3(file, path);
            case 'google':
                return await this.uploadToGCS(file, path);
            default:
                throw new Error(`Unsupported storage provider: ${provider}`);
        }
    }

    async uploadToS3(file, path) {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: path,
            Body: file.buffer,
            ContentType: file.mimetype
        };

        const result = await this.s3.upload(params).promise();
        return result.Location;
    }

    async uploadToGCS(file, path) {
        const bucket = this.googleStorage.bucket(process.env.GOOGLE_STORAGE_BUCKET);
        const blob = bucket.file(path);

        await blob.save(file.buffer, {
            contentType: file.mimetype
        });

        return `https://storage.googleapis.com/${process.env.GOOGLE_STORAGE_BUCKET}/${path}`;
    }

    // Métodos de análisis

    async getAnalytics(metrics, dimensions, startDate, endDate) {
        try {
            const response = await this.analytics.reports.batchGet({
                requestBody: {
                    reportRequests: [{
                        viewId: process.env.GA_VIEW_ID,
                        dateRanges: [{
                            startDate,
                            endDate
                        }],
                        metrics: metrics.map(metric => ({ expression: metric })),
                        dimensions: dimensions.map(dimension => ({ name: dimension }))
                    }]
                }
            });

            return this.formatAnalyticsResponse(response.data);
        } catch (error) {
            console.error('Error getting analytics:', error);
            throw error;
        }
    }

    // Métodos de pagos

    async processPayment(paymentData) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: paymentData.amount,
                currency: paymentData.currency,
                payment_method_types: ['card'],
                metadata: paymentData.metadata
            });

            return paymentIntent;
        } catch (error) {
            console.error('Error processing payment:', error);
            throw error;
        }
    }

    // Métodos de email

    async sendEmail(emailData) {
        try {
            const msg = {
                to: emailData.to,
                from: emailData.from,
                subject: emailData.subject,
                text: emailData.text,
                html: emailData.html
            };

            const response = await this.sendgrid.send(msg);
            return response;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    // Métodos de redes sociales

    async postToSocialMedia(content, platforms) {
        const posts = [];

        for (const platform of platforms) {
            try {
                switch (platform) {
                    case 'twitter':
                        const tweet = await this.twitter.v2.tweet(content.text);
                        posts.push({ platform, id: tweet.data.id });
                        break;
                    // Agregar más plataformas según sea necesario
                }
            } catch (error) {
                console.error(`Error posting to ${platform}:`, error);
            }
        }

        return posts;
    }

    // Métodos de CRM

    async syncToCRM(data, platform) {
        try {
            switch (platform) {
                case 'hubspot':
                    return await this.syncToHubspot(data);
                case 'salesforce':
                    return await this.syncToSalesforce(data);
                default:
                    throw new Error(`Unsupported CRM platform: ${platform}`);
            }
        } catch (error) {
            console.error(`Error syncing to ${platform}:`, error);
            throw error;
        }
    }

    async syncToHubspot(data) {
        const properties = {
            email: data.email,
            firstname: data.firstName,
            lastname: data.lastName,
            phone: data.phone,
            company: data.organization
        };

        return await this.hubspot.crm.contacts.basicApi.create({ properties });
    }

    async syncToSalesforce(data) {
        return await this.salesforce.sobject('Contact').create({
            Email: data.email,
            FirstName: data.firstName,
            LastName: data.lastName,
            Phone: data.phone,
            Company: data.organization
        });
    }

    // Métodos de marketing por email

    async syncToMailchimp(listId, subscriber) {
        try {
            const response = await this.mailchimp.lists.addListMember(listId, {
                email_address: subscriber.email,
                status: 'subscribed',
                merge_fields: {
                    FNAME: subscriber.firstName,
                    LNAME: subscriber.lastName
                }
            });

            return response;
        } catch (error) {
            console.error('Error syncing to Mailchimp:', error);
            throw error;
        }
    }

    // Métodos de IA

    async generateAIContent(prompt, options = {}) {
        try {
            const completion = await this.openai.createCompletion({
                model: options.model || 'text-davinci-003',
                prompt,
                max_tokens: options.maxTokens || 100,
                temperature: options.temperature || 0.7
            });

            return completion.data.choices[0].text.trim();
        } catch (error) {
            console.error('Error generating AI content:', error);
            throw error;
        }
    }

    // Gestión de claves API

    async rotateApiKey(provider) {
        try {
            const integration = await ThirdPartyIntegration.findOne({
                where: { provider }
            });

            if (!integration) {
                throw new Error(`No integration found for provider: ${provider}`);
            }

            // Generar nueva clave API
            const newKey = await this.generateNewApiKey(provider);

            // Actualizar configuración
            const updatedConfig = {
                ...integration.config,
                apiKey: newKey
            };

            // Actualizar en la base de datos
            await integration.update({ config: updatedConfig });

            // Reinicializar el servicio
            await this.initializeService({
                provider,
                config: updatedConfig
            });

            return { success: true, message: 'API key rotated successfully' };
        } catch (error) {
            console.error('Error rotating API key:', error);
            throw error;
        }
    }

    async generateNewApiKey(provider) {
        // Implementar lógica específica para cada proveedor
        // Este es solo un ejemplo genérico
        return crypto.randomBytes(32).toString('hex');
    }

    // Monitoreo y diagnóstico

    async checkServiceHealth(provider) {
        try {
            const integration = await ThirdPartyIntegration.findOne({
                where: { provider }
            });

            if (!integration) {
                throw new Error(`No integration found for provider: ${provider}`);
            }

            const healthCheck = await this.performHealthCheck(provider);
            
            await integration.update({
                lastHealthCheck: new Date(),
                healthStatus: healthCheck.status
            });

            return healthCheck;
        } catch (error) {
            console.error('Error checking service health:', error);
            throw error;
        }
    }

    async performHealthCheck(provider) {
        // Implementar verificaciones específicas para cada proveedor
        switch (provider) {
            case 'stripe':
                return await this.checkStripeHealth();
            case 'sendgrid':
                return await this.checkSendGridHealth();
            // Agregar más proveedores según sea necesario
            default:
                throw new Error(`Health check not implemented for provider: ${provider}`);
        }
    }

    async checkStripeHealth() {
        try {
            await this.stripe.balance.retrieve();
            return { status: 'healthy', message: 'Stripe API is responding' };
        } catch (error) {
            return { status: 'unhealthy', message: error.message };
        }
    }

    async checkSendGridHealth() {
        try {
            const response = await this.sendgrid.client.request({
                method: 'GET',
                url: '/v3/user/credits'
            });
            return { status: 'healthy', message: 'SendGrid API is responding' };
        } catch (error) {
            return { status: 'unhealthy', message: error.message };
        }
    }
}

module.exports = new ThirdPartyService();
