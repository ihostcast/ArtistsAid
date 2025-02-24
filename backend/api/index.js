const app = require('../src/app');
const { Pool } = require('@neondatabase/serverless');
const { sequelize } = require('../src/models');

// Configurar el pool de conexiones
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function testDatabaseConnection() {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to Neon database');
        const result = await client.query('SELECT NOW()');
        console.log('Database time:', result.rows[0].now);
        client.release();
        return true;
    } catch (error) {
        console.error('Error testing database connection:', error);
        return false;
    }
}

async function initializeDatabase() {
    try {
        console.log('Testing direct database connection...');
        const neonConnected = await testDatabaseConnection();
        if (!neonConnected) {
            throw new Error('Could not connect to Neon database');
        }

        console.log('Testing Sequelize connection...');
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        
        console.log('Syncing database models...');
        await sequelize.sync();
        console.log('Database synchronized successfully');
        
        return true;
    } catch (error) {
        console.error('Database initialization error:', error);
        return false;
    }
}

// Variable para rastrear si la base de datos está inicializada
let isDatabaseInitialized = false;

// Función para manejar las solicitudes
const handler = async (req, res) => {
    console.log('Request received:', {
        method: req.method,
        url: req.url,
        headers: req.headers,
        query: req.query
    });

    try {
        // Inicializar la base de datos si no está inicializada
        if (!isDatabaseInitialized) {
            console.log('Initializing database...');
            isDatabaseInitialized = await initializeDatabase();
            if (!isDatabaseInitialized) {
                throw new Error('Failed to initialize database');
            }
        }

        // Verificar variables de entorno críticas
        const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'NODE_ENV'];
        const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingEnvVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
        }

        // Log environment info
        console.log('Environment:', {
            NODE_ENV: process.env.NODE_ENV,
            DATABASE_URL: process.env.DATABASE_URL ? '(set)' : '(not set)',
            JWT_SECRET: process.env.JWT_SECRET ? '(set)' : '(not set)'
        });

        // Asegurarse de que el body esté disponible
        if (req.method === 'POST' || req.method === 'PUT') {
            if (typeof req.body === 'string') {
                try {
                    req.body = JSON.parse(req.body);
                } catch (e) {
                    console.error('Error parsing request body:', e);
                }
            } else if (!req.body && req.rawBody) {
                try {
                    req.body = JSON.parse(req.rawBody);
                } catch (e) {
                    console.error('Error parsing raw body:', e);
                }
            }
        }

        // Manejar la solicitud con la aplicación Express
        return app(req, res);
    } catch (error) {
        console.error('Error handling request:', error);
        
        // Asegurarse de que la respuesta sea JSON válido
        return res.status(500).json({
            error: 'Internal Server Error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
};

// Exportar el handler para Vercel
module.exports = handler;
