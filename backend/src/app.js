const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const domains = require('./config/domains');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const adminAuthRoutes = require('./routes/admin.auth.routes');

// Crear instancia de Express
const app = express();

// Configurar CORS basado en el entorno
const corsOptions = {
    origin: function(origin, callback) {
        console.log('Request origin:', origin);
        
        // Permitir solicitudes sin origin (como postman o curl)
        if (!origin) {
            return callback(null, true);
        }

        // Lista de dominios permitidos
        const allowedOrigins = [
            'https://artists-aid.vercel.app',
            'https://admin.artists-aid.vercel.app',
            'https://artists-rae2w2hwk-odalis-j-garcias-projects.vercel.app'
        ];

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Origin not allowed:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'X-Api-Version', 'Authorization'],
    exposedHeaders: ['Content-Length', 'Content-Type']
};

// Middleware para manejar OPTIONS preflight
app.options('*', (req, res) => {
    console.log('OPTIONS request received:', {
        origin: req.get('origin'),
        method: req.method,
        path: req.path,
        headers: req.headers
    });
    
    const origin = req.get('origin');
    if (origin && corsOptions.origin) {
        corsOptions.origin(origin, (err, allowed) => {
            if (err || !allowed) {
                console.log('Origin not allowed in OPTIONS:', origin);
                return res.sendStatus(403);
            }
            
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Max-Age', '86400');
            res.sendStatus(200);
        });
    } else {
        res.sendStatus(200);
    }
});

// Logger middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    next();
});

// Configurar middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(compression());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'", "https://artists-aid.vercel.app", "https://admin.artists-aid.vercel.app", "https://artists-rae2w2hwk-odalis-j-garcias-projects.vercel.app"],
            scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://artists-aid.vercel.app", "https://admin.artists-aid.vercel.app", "https://artists-rae2w2hwk-odalis-j-garcias-projects.vercel.app"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));

// Middleware para asegurar respuestas JSON en rutas API
app.use('/api', (req, res, next) => {
    // Manejar preflight OPTIONS
    if (req.method === 'OPTIONS') {
        const origin = req.get('origin');
        if (origin) {
            const allowedOrigins = [
                'https://artists-aid.vercel.app',
                'https://admin.artists-aid.vercel.app',
                'https://artists-rae2w2hwk-odalis-j-garcias-projects.vercel.app'
            ];
            
            if (allowedOrigins.includes(origin)) {
                res.setHeader('Access-Control-Allow-Origin', origin);
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas
            }
        }
        return res.status(200).end();
    }

    // Continuar con otras solicitudes
    const origin = req.get('origin');
    if (origin) {
        const allowedOrigins = [
            'https://artists-aid.vercel.app',
            'https://admin.artists-aid.vercel.app',
            'https://artists-rae2w2hwk-odalis-j-garcias-projects.vercel.app'
        ];
        
        if (allowedOrigins.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    
    const oldJson = res.json;
    res.json = function (data) {
        if (res.headersSent) return;
        res.setHeader('Content-Type', 'application/json');
        return oldJson.call(this, data);
    };
    
    const oldSend = res.send;
    res.send = function (data) {
        if (res.headersSent) return;
        res.setHeader('Content-Type', 'application/json');
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                data = { message: data };
            }
        }
        return oldSend.call(this, JSON.stringify(data));
    };
    
    next();
});

// Middleware para detectar si es una petición desde el subdominio admin
function isAdminSubdomain(req) {
    const host = req.get('host');
    return host && host.startsWith('admin.');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas API
app.use('/api/auth/admin', adminAuthRoutes);
app.use('/api/auth', authRoutes);

// Ruta de bienvenida API
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to ArtistsAid API' });
});

// Servir archivos estáticos para el admin
app.use('/admin', express.static(path.join(__dirname, '../public/admin')));
app.use(express.static(path.join(__dirname, '../public')));

// Ruta para el login de admin
app.get('/admin/login', (req, res) => {
    console.log('Serving admin login page');
    res.sendFile(path.join(__dirname, '../public/admin/login.html'));
});

// Ruta para el dashboard de admin
app.get('/admin/dashboard', (req, res) => {
    console.log('Serving admin dashboard page');
    res.sendFile(path.join(__dirname, '../public/admin/index.html'));
});

// Ruta para cualquier otra página de admin
app.get('/admin/*', (req, res) => {
    console.log('Serving admin page:', req.path);
    res.sendFile(path.join(__dirname, '../public/admin/index.html'));
});

// Ruta para el frontend principal
app.get('/*', (req, res) => {
    if (isAdminSubdomain(req)) {
        console.log('Redirecting admin request to admin login');
        res.redirect('/admin/login');
    } else {
        console.log('Serving main frontend page');
        res.sendFile(path.join(__dirname, '../public/index.html'));
    }
});

// Manejador de errores para rutas API
app.use('/api', (err, req, res, next) => {
    console.error('API Error:', err);
    
    // Asegurar que la respuesta sea JSON
    res.status(err.status || 500);
    res.setHeader('Content-Type', 'application/json');
    res.json({
        error: true,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' ? {
            stack: err.stack,
            details: err.details || err.toString()
        } : {})
    });
});

// Manejador de errores general
app.use((err, req, res, next) => {
    console.error('General Error:', err);
    
    if (req.path.startsWith('/api')) {
        res.status(err.status || 500).json({
            error: true,
            message: err.message || 'Internal server error'
        });
    } else {
        res.status(err.status || 500).send('Server Error');
    }
});

module.exports = app;
