const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { User } = require('../models');
const { createTransporter } = require('../config/email.config');
const { sendVerificationCode, checkVerificationCode } = require('../config/sms.config');

const RECAPTCHA_SECRET_KEY = '6Lct1N8qAAAAAH49Q4lPKDiHmmp4iHjPAPDjO9A5';

class AuthController {
    async register(req, res) {
        try {
            const { 
                firstName, 
                lastName, 
                email, 
                password, 
                phone,
                role,
                recaptchaToken 
            } = req.body;

            // Verificar reCAPTCHA
            const recaptchaVerification = await axios.post(
                `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
            );

            if (!recaptchaVerification.data.success) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Verificación reCAPTCHA fallida' 
                });
            }

            // Verificar si el usuario ya existe
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'El correo electrónico ya está registrado' 
                });
            }

            // Crear el usuario
            const user = await User.create({
                firstName,
                lastName,
                email,
                password,
                phone,
                role
            });

            // Enviar código por SMS usando Twilio Verify
            try {
                await sendVerificationCode(phone);
            } catch (error) {
                console.error('Error sending SMS verification:', error);
                return res.status(400).json({
                    success: false,
                    message: 'Error al enviar el código de verificación por SMS'
                });
            }

            // Enviar código por email
            const transporter = createTransporter();
            const emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Verifica tu cuenta en ArtistsAid',
                html: `
                    <h1>Bienvenido a ArtistsAid</h1>
                    <p>Tu código de verificación por email es: <strong>${emailVerificationCode}</strong></p>
                    <p>También recibirás un código por SMS para verificar tu número de teléfono.</p>
                    <p>Ambos códigos expirarán en 30 minutos.</p>
                `
            });

            // Guardar el código de verificación de email
            user.verificationCode = emailVerificationCode;
            user.verificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
            await user.save();

            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente. Por favor verifica tu cuenta con los códigos enviados por email y SMS.'
            });

        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el registro'
            });
        }
    }

    async verify(req, res) {
        try {
            const { emailCode, smsCode, email, phone } = req.body;

            // Verificar código de email
            const user = await User.findOne({ 
                where: { 
                    email,
                    verificationCode: emailCode,
                    verificationCodeExpires: { $gt: new Date() }
                }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Código de email inválido o expirado'
                });
            }

            // Verificar código de SMS
            try {
                const isValidSmsCode = await checkVerificationCode(phone, smsCode);
                if (!isValidSmsCode) {
                    return res.status(400).json({
                        success: false,
                        message: 'Código SMS inválido'
                    });
                }
            } catch (error) {
                console.error('Error checking SMS code:', error);
                return res.status(400).json({
                    success: false,
                    message: 'Error al verificar el código SMS'
                });
            }

            // Actualizar estado del usuario
            user.isVerified = true;
            user.verificationCode = null;
            user.verificationCodeExpires = null;
            user.status = 'active';
            await user.save();

            res.json({
                success: true,
                message: 'Cuenta verificada exitosamente'
            });

        } catch (error) {
            console.error('Error en verificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error en la verificación'
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            if (!user.isVerified) {
                return res.status(401).json({
                    success: false,
                    message: 'Por favor verifica tu cuenta primero'
                });
            }

            const token = jwt.sign(
                { 
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                }
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el inicio de sesión'
            });
        }
    }

    async getProfile(req, res) {
        try {
            const user = await User.findByPk(req.user.id, {
                attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'phone', 'status', 'createdAt']
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            res.json({
                success: true,
                user
            });
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el perfil'
            });
        }
    }
}

module.exports = new AuthController();
