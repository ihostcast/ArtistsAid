require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const path = require('path');
const express = require('express'); // Agregar esta línea

// Configurar puerto
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Función para inicializar la base de datos
async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        
        // Sincronizar modelos con la base de datos
        await sequelize.sync();
        console.log('Database synchronized successfully');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

// Iniciar servidor
async function startServer() {
    try {
        // Inicializar base de datos
        await initializeDatabase();

        // Iniciar servidor HTTP
        const server = app.listen(PORT, () => {
            console.log(`
        🚀 Servidor iniciado
        🔊 Puerto: ${PORT}
        🌐 Host: ${HOST}
        🔗 URL: http://${HOST}:${PORT}
        📝 ID de Proceso: ${process.pid}
        🌍 Ambiente: ${process.env.NODE_ENV}
        `);
        });

        // Manejar señales de terminación
        process.on('SIGTERM', () => {
            console.log('SIGTERM signal received: closing HTTP server');
            server.close(() => {
                console.log('HTTP server closed');
                sequelize.close().then(() => {
                    console.log('Database connection closed');
                    process.exit(0);
                });
            });
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

// Manejar todas las rutas no encontradas
app.use('*', (req, res) => {
    console.log('Route not found:', req.originalUrl);
    if (req.path.startsWith('/api')) {
        res.status(404).json({ error: 'API route not found' });
    } else {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    }
});

// Iniciar la aplicación
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = app;
