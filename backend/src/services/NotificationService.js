const nodemailer = require('nodemailer');
const twilio = require('twilio');
const config = require('../config/notification.config.json');
const { User, VerificationCode } = require('../models');
const { generateRandomCode } = require('../utils/helpers');

class NotificationService {
    constructor() {
        // Configurar transportador de email
        this.emailTransporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || config.email.smtp.host,
            port: process.env.SMTP_PORT || config.email.smtp.port,
            secure: config.email.smtp.secure,
            auth: {
                user: process.env.SMTP_USER || config.email.smtp.auth.user,
                pass: process.env.SMTP_PASSWORD || config.email.smtp.auth.pass
            }
        });

        // Configurar cliente de Twilio
        this.twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID || config.sms.twilio.accountSid,
            process.env.TWILIO_AUTH_TOKEN || config.sms.twilio.authToken
        );
        this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || config.sms.twilio.phoneNumber;
    }

    async sendEmail(to, subject, html) {
        try {
            const mailOptions = {
                from: `"${config.email.from.name}" <${config.email.from.email}>`,
                to,
                subject,
                html
            };

            const info = await this.emailTransporter.sendMail(mailOptions);
            return {
                success: true,
                messageId: info.messageId
            };
        } catch (error) {
            console.error('Email sending error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async sendSMS(to, message) {
        try {
            const result = await this.twilioClient.messages.create({
                body: message,
                from: this.twilioPhoneNumber,
                to
            });

            return {
                success: true,
                messageId: result.sid
            };
        } catch (error) {
            console.error('SMS sending error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async generateVerificationCode(userId, type) {
        try {
            // Verificar intentos previos
            const recentAttempt = await VerificationCode.findOne({
                where: {
                    userId,
                    type,
                    createdAt: {
                        [Op.gte]: new Date(Date.now() - config.verification[type].cooldownMinutes * 60000)
                    }
                }
            });

            if (recentAttempt) {
                return {
                    success: false,
                    error: `Please wait ${config.verification[type].cooldownMinutes} minutes before requesting a new code`
                };
            }

            // Generar nuevo código
            const code = generateRandomCode(config.verification[type].codeLength);
            const expiresAt = new Date(Date.now() + config.verification[type].expirationMinutes * 60000);

            await VerificationCode.create({
                userId,
                code,
                type,
                expiresAt,
                attempts: 0
            });

            return {
                success: true,
                code
            };
        } catch (error) {
            console.error('Code generation error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async verifyCode(userId, code, type) {
        try {
            const verificationCode = await VerificationCode.findOne({
                where: {
                    userId,
                    type,
                    code,
                    expiresAt: {
                        [Op.gt]: new Date()
                    }
                }
            });

            if (!verificationCode) {
                return {
                    success: false,
                    error: 'Invalid or expired verification code'
                };
            }

            if (verificationCode.attempts >= config.verification[type].maxAttempts) {
                return {
                    success: false,
                    error: 'Maximum verification attempts exceeded'
                };
            }

            // Incrementar intentos
            verificationCode.attempts += 1;
            await verificationCode.save();

            if (verificationCode.code !== code) {
                return {
                    success: false,
                    error: 'Invalid verification code'
                };
            }

            // Código válido, marcarlo como usado
            await verificationCode.destroy();

            return {
                success: true
            };
        } catch (error) {
            console.error('Code verification error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async sendVerificationEmail(userId) {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }

            const { success, code, error } = await this.generateVerificationCode(userId, 'email');
            if (!success) {
                return { success, error };
            }

            const template = config.email.templates.verification;
            const result = await this.sendEmail(
                user.email,
                template.subject,
                this.getEmailTemplate(template.template, { code, name: user.name })
            );

            return result;
        } catch (error) {
            console.error('Email verification error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async sendVerificationSMS(userId) {
        try {
            const user = await User.findByPk(userId);
            if (!user || !user.phone) {
                return {
                    success: false,
                    error: 'User not found or phone number not provided'
                };
            }

            const { success, code, error } = await this.generateVerificationCode(userId, 'sms');
            if (!success) {
                return { success, error };
            }

            const message = config.sms.templates.verification.replace('{{code}}', code);
            const result = await this.sendSMS(user.phone, message);

            return result;
        } catch (error) {
            console.error('SMS verification error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    getEmailTemplate(templateName, data) {
        // Aquí implementarías la lógica para cargar y renderizar las plantillas de email
        // Podrías usar un motor de plantillas como handlebars o ejs
        // Por ahora retornamos un HTML básico
        return `
            <html>
                <body>
                    <h1>Welcome to ArtistsAid</h1>
                    <p>Hello ${data.name},</p>
                    <p>Your verification code is: <strong>${data.code}</strong></p>
                    <p>This code will expire in ${config.verification.email.expirationMinutes} minutes.</p>
                </body>
            </html>
        `;
    }
}

module.exports = new NotificationService();
