const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config/constants.json');
const errorMessages = require('../config/errorMessages.json');

const authenticateToken = (req, res, next) => {
    try {
        console.log('Authenticating token...');
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            console.log('No token provided');
            return res.status(401).json({
                status: 401,
                message: errorMessages.auth.token_required
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET not configured');
            return res.status(500).json({
                status: 500,
                message: errorMessages.server.config_error
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error('Token verification error:', err);
                return res.status(403).json({
                    status: 403,
                    message: errorMessages.auth.invalid_token
                });
            }

            console.log('Finding user with id:', decoded.id);
            User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            })
            .then(user => {
                if (!user) {
                    console.log('User not found');
                    return res.status(401).json({
                        status: 401,
                        message: errorMessages.auth.invalid_token
                    });
                }

                if (user.status !== 'active') {
                    console.log('User account not active. Status:', user.status);
                    return res.status(403).json({
                        status: 403,
                        message: errorMessages.auth.account_locked
                    });
                }

                console.log('Token authenticated successfully for user:', user.email);
                req.user = user;
                next();
            })
            .catch(error => {
                console.error('User retrieval error:', error);
                return res.status(500).json({
                    status: 500,
                    message: errorMessages.server.internal_error
                });
            });
        });
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            status: 500,
            message: errorMessages.server.internal_error
        });
    }
};

const isAdmin = (req, res, next) => {
    console.log('Checking admin role for user:', req.user.email);
    if (!req.user || req.user.role !== 'admin') {
        console.log('User is not admin. Role:', req.user?.role);
        return res.status(403).json({
            status: 403,
            message: errorMessages.auth.unauthorized
        });
    }
    console.log('Admin role verified successfully');
    next();
};

const hasRole = (roles) => {
    return (req, res, next) => {
        console.log('Checking roles:', roles, 'for user:', req.user.email);
        if (!req.user || !roles.includes(req.user.role)) {
            console.log('User does not have required role. User role:', req.user?.role);
            return res.status(403).json({
                status: 403,
                message: errorMessages.auth.unauthorized
            });
        }
        console.log('Role verified successfully');
        next();
    };
};

const generateToken = (user) => {
    console.log('Generating token for user:', user.email);
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || config.security.jwt.secret,
        { expiresIn: config.security.jwt.expiresIn }
    );
};

const refreshToken = async (req, res) => {
    try {
        console.log('Refreshing token...');
        const { refreshToken } = req.body;
        if (!refreshToken) {
            console.log('No refresh token provided');
            return res.status(400).json({
                status: 400,
                message: errorMessages.auth.token_required
            });
        }

        console.log('Verifying refresh token...');
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            console.log('User not found');
            return res.status(401).json({
                status: 401,
                message: errorMessages.auth.invalid_token
            });
        }

        console.log('Generating new access token...');
        const accessToken = generateToken(user);

        console.log('Token refreshed successfully');
        res.json({
            status: 200,
            message: 'Token refreshed successfully',
            data: { accessToken }
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({
            status: 401,
            message: errorMessages.auth.invalid_token
        });
    }
};

module.exports = {
    authenticateToken,
    isAdmin,
    hasRole,
    generateToken,
    refreshToken
};
