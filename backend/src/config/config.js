require('dotenv').config();

const config = {
  development: {
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  },
  test: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 3,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    },
    logging: false
  }
};

// Configuración de Neon DB para entornos no development
if (process.env.NODE_ENV !== 'development') {
  try {
    const neonDb = require('@neondatabase/serverless');
    config.test.dialectModule = neonDb;
    config.production.dialectModule = neonDb;
  } catch (error) {
    console.error('Error al cargar el módulo de Neon DB:', error);
    process.exit(1);
  }
}

module.exports = config;
