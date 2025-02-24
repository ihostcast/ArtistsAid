const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');

// Middleware para verificar si es admin
const isAdmin = async (req, res, next) => {
    try {
        console.log('isAdmin middleware - user:', req.user);
        if (!req.user) {
            console.log('No user in request');
            return res.status(401).json({
                error: true,
                message: 'No user found in request'
            });
        }

        const user = await User.findByPk(req.user.id);
        console.log('Found user:', user ? {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status
        } : 'No user found');

        if (user && user.role === 'admin') {
            console.log('User is admin, proceeding...');
            next();
        } else {
            console.log('Access denied - not admin');
            res.status(403).json({
                error: true,
                message: 'Access denied. Admin only.'
            });
        }
    } catch (error) {
        console.error('Error in isAdmin middleware:', error);
        next(error);
    }
};

// Login para admin
router.post('/login', async (req, res, next) => {
    try {
        console.log('Login attempt body:', req.body);
        const { email, password } = req.body;

        if (!email || !password) {
            console.log('Missing credentials - Email:', !!email, 'Password:', !!password);
            return res.status(400).json({
                error: true,
                message: 'Email and password are required'
            });
        }

        // Buscar usuario
        console.log('Searching for user with email:', email);
        const user = await User.findOne({ 
            where: { email },
            attributes: ['id', 'email', 'password', 'role', 'status'] 
        });

        console.log('User found:', user ? {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            passwordLength: user.password.length
        } : 'No user found');

        if (!user) {
            console.log('No user found with email:', email);
            return res.status(401).json({
                error: true,
                message: 'Invalid credentials'
            });
        }

        if (user.role !== 'admin') {
            console.log('User is not an admin. Role:', user.role);
            return res.status(401).json({
                error: true,
                message: 'Invalid credentials'
            });
        }

        if (user.status !== 'active') {
            console.log('User account is not active. Status:', user.status);
            return res.status(401).json({
                error: true,
                message: 'Account is not active'
            });
        }

        // Verificar contraseña
        console.log('Validating password...');
        const validPassword = await bcrypt.compare(password, user.password);
        console.log('Password validation result:', validPassword);

        if (!validPassword) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({
                error: true,
                message: 'Invalid credentials'
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET not configured');
            throw new Error('Server configuration error');
        }

        // Generar token
        console.log('Generating JWT token...');
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Enviar respuesta
        console.log('Login successful, sending response');
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            },
            redirectTo: 'https://artists-aid.vercel.app/admin/dashboard'
        });
    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
});

// Verificar token
router.get('/verify', authenticateToken, isAdmin, (req, res) => {
    res.status(200).json({
        success: true,
        user: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role
        }
    });
});

module.exports = router;
