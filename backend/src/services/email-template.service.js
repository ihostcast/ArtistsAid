const { EmailTemplate, User } = require('../models');
const handlebars = require('handlebars');
const mjml2html = require('mjml');
const path = require('path');
const fs = require('fs').promises;

class EmailTemplateService {
    constructor() {
        this.registerHelpers();
        this.loadDefaultTemplates();
    }

    registerHelpers() {
        handlebars.registerHelper('formatDate', function(date) {
            return new Date(date).toLocaleDateString();
        });

        handlebars.registerHelper('formatCurrency', function(amount) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);
        });

        handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        });
    }

    async loadDefaultTemplates() {
        const defaultTemplates = {
            welcome: {
                name: 'Welcome Email',
                subject: 'Welcome to ArtistsAid!',
                category: 'user',
                variables: ['name', 'loginUrl'],
                content: await this.loadTemplateFile('welcome.mjml')
            },
            invoice: {
                name: 'Invoice',
                subject: 'New Invoice #{invoiceNumber}',
                category: 'billing',
                variables: ['invoiceNumber', 'amount', 'dueDate', 'items'],
                content: await this.loadTemplateFile('invoice.mjml')
            },
            subscription_renewal: {
                name: 'Subscription Renewal',
                subject: 'Your Subscription is About to Renew',
                category: 'billing',
                variables: ['name', 'plan', 'renewalDate', 'amount'],
                content: await this.loadTemplateFile('subscription-renewal.mjml')
            },
            support_ticket: {
                name: 'Support Ticket Response',
                subject: 'Update on Ticket #{ticketId}',
                category: 'support',
                variables: ['ticketId', 'status', 'message', 'responseTime'],
                content: await this.loadTemplateFile('support-ticket.mjml')
            }
        };

        for (const [key, template] of Object.entries(defaultTemplates)) {
            await this.createOrUpdateTemplate(key, template);
        }
    }

    async loadTemplateFile(filename) {
        try {
            const filePath = path.join(__dirname, '../templates/email', filename);
            return await fs.readFile(filePath, 'utf8');
        } catch (error) {
            console.error(`Error loading template file ${filename}:`, error);
            return '';
        }
    }

    async createOrUpdateTemplate(key, templateData) {
        try {
            const existing = await EmailTemplate.findOne({
                where: { key }
            });

            if (existing) {
                await existing.update(templateData);
            } else {
                await EmailTemplate.create({
                    key,
                    ...templateData
                });
            }
        } catch (error) {
            console.error(`Error creating/updating template ${key}:`, error);
        }
    }

    async renderTemplate(templateKey, data) {
        try {
            const template = await EmailTemplate.findOne({
                where: { key: templateKey }
            });

            if (!template) {
                throw new Error(`Template ${templateKey} not found`);
            }

            // Validar variables requeridas
            this.validateTemplateVariables(template, data);

            // Compilar plantilla Handlebars
            const compiledTemplate = handlebars.compile(template.content);
            const mjmlContent = compiledTemplate(data);

            // Convertir MJML a HTML
            const { html } = mjml2html(mjmlContent, {
                keepComments: false,
                beautify: false
            });

            return {
                subject: this.renderSubject(template.subject, data),
                html,
                template: template.key
            };
        } catch (error) {
            console.error('Error rendering template:', error);
            throw error;
        }
    }

    renderSubject(subject, data) {
        const template = handlebars.compile(subject);
        return template(data);
    }

    validateTemplateVariables(template, data) {
        const missingVariables = template.variables.filter(
            variable => !data.hasOwnProperty(variable)
        );

        if (missingVariables.length > 0) {
            throw new Error(
                `Missing required variables: ${missingVariables.join(', ')}`
            );
        }
    }

    async createCustomTemplate(userId, templateData) {
        try {
            const user = await User.findByPk(userId);
            if (!user) throw new Error('User not found');

            // Validar MJML
            try {
                mjml2html(templateData.content);
            } catch (error) {
                throw new Error('Invalid MJML template');
            }

            // Crear plantilla personalizada
            const template = await EmailTemplate.create({
                ...templateData,
                userId,
                isCustom: true
            });

            return template;
        } catch (error) {
            console.error('Error creating custom template:', error);
            throw error;
        }
    }

    async getTemplatePreview(templateKey, sampleData) {
        try {
            const rendered = await this.renderTemplate(templateKey, sampleData);
            return {
                subject: rendered.subject,
                html: rendered.html
            };
        } catch (error) {
            console.error('Error generating template preview:', error);
            throw error;
        }
    }

    async getTemplateVariables(templateKey) {
        try {
            const template = await EmailTemplate.findOne({
                where: { key: templateKey }
            });

            if (!template) {
                throw new Error(`Template ${templateKey} not found`);
            }

            return {
                required: template.variables,
                optional: template.optionalVariables || []
            };
        } catch (error) {
            console.error('Error getting template variables:', error);
            throw error;
        }
    }

    async updateTemplate(templateKey, updates) {
        try {
            const template = await EmailTemplate.findOne({
                where: { key: templateKey }
            });

            if (!template) {
                throw new Error(`Template ${templateKey} not found`);
            }

            // Validar MJML si se actualiza el contenido
            if (updates.content) {
                try {
                    mjml2html(updates.content);
                } catch (error) {
                    throw new Error('Invalid MJML template');
                }
            }

            await template.update(updates);
            return template;
        } catch (error) {
            console.error('Error updating template:', error);
            throw error;
        }
    }

    async deleteTemplate(templateKey) {
        try {
            const template = await EmailTemplate.findOne({
                where: { key: templateKey }
            });

            if (!template) {
                throw new Error(`Template ${templateKey} not found`);
            }

            if (!template.isCustom) {
                throw new Error('Cannot delete system templates');
            }

            await template.destroy();
        } catch (error) {
            console.error('Error deleting template:', error);
            throw error;
        }
    }
}

module.exports = new EmailTemplateService();
