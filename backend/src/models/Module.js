const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Module extends Model {
    static associate(models) {
      Module.hasMany(models.UserModule, {
        foreignKey: 'moduleId',
        as: 'installations'
      });
    }
  }

  Module.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(
        'gateway',           // Pasarelas de pago
        'addon',            // Módulos adicionales
        'integration',      // Integraciones con servicios
        'notification',     // Sistema de notificaciones
        'security',         // Módulos de seguridad
        'report',           // Módulos de reportes
        'music',            // Módulos específicos para músicos
        'photography',      // Módulos para fotógrafos
        'journalism',       // Módulos para periodistas
        'streaming',        // Integraciones con plataformas de streaming
        'artisan',          // Módulos para artesanos
        'entertainment',    // Módulos de entretenimiento
        'portfolio',        // Módulos de portafolio
        'social',           // Módulos de redes sociales
        'booking',          // Sistema de reservas
        'contract',         // Gestión de contratos
        'ai',              // Inteligencia Artificial
        'analytics',        // Análisis y algoritmos
        'promotion'         // Módulos promocionales
      ),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isBase: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indica si el módulo es base y está disponible para todos los usuarios registrados'
    },
    requiredRoles: {
      type: DataTypes.TEXT,
      defaultValue: JSON.stringify(['user']),
      get() {
        const rawValue = this.getDataValue('requiredRoles');
        return rawValue ? JSON.parse(rawValue) : ['user'];
      },
      set(value) {
        this.setDataValue('requiredRoles', JSON.stringify(value));
      }
    },
    config: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false
    },
    systemRequirements: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    license: {
      type: DataTypes.STRING
    },
    licenseKey: {
      type: DataTypes.STRING
    },
    licenseExpiry: {
      type: DataTypes.DATE
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    category: {
      type: DataTypes.STRING
    },
    targetAudience: {
      type: DataTypes.TEXT,
      defaultValue: JSON.stringify(['all']),
      get() {
        const rawValue = this.getDataValue('targetAudience');
        return rawValue ? JSON.parse(rawValue) : ['all'];
      },
      set(value) {
        this.setDataValue('targetAudience', JSON.stringify(value));
      }
    },
    pricing: {
      type: DataTypes.JSONB,
      defaultValue: {
        type: 'one-time', // or 'subscription'
        price: 0,
        currency: 'USD',
        interval: null, // 'monthly', 'yearly' for subscriptions
        trialDays: 0
      }
    },
    dependencies: {
      type: DataTypes.TEXT,
      defaultValue: JSON.stringify(['core']),
      get() {
        const rawValue = this.getDataValue('dependencies');
        return rawValue ? JSON.parse(rawValue) : ['core'];
      },
      set(value) {
        this.setDataValue('dependencies', JSON.stringify(value));
      }
    }
  }, {
    sequelize,
    modelName: 'Module',
    tableName: 'Modules',
    timestamps: true
  });

  return Module;
};
