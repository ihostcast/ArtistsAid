const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Automation = sequelize.define('Automation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  type: {
    type: DataTypes.ENUM('trigger', 'schedule', 'webhook'),
    allowNull: false
  },
  moduleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Modules',
      key: 'id'
    }
  },
  config: {
    type: DataTypes.JSONB,
    defaultValue: {},
    validate: {
      validateConfig(value) {
        // Validación específica según el tipo
        switch (this.type) {
          case 'trigger':
            if (!value.event || !value.conditions || !value.actions) {
              throw new Error('Trigger automation requires event, conditions, and actions');
            }
            break;
          case 'schedule':
            if (!value.cronExpression || !value.actions) {
              throw new Error('Schedule automation requires cronExpression and actions');
            }
            break;
          case 'webhook':
            if (!value.endpoint || !value.method || !value.actions) {
              throw new Error('Webhook automation requires endpoint, method, and actions');
            }
            break;
        }
      }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastRun: {
    type: DataTypes.DATE
  },
  nextRun: {
    type: DataTypes.DATE
  },
  stats: {
    type: DataTypes.JSONB,
    defaultValue: {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      lastError: null,
      averageExecutionTime: 0
    }
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  hooks: {
    beforeValidate: (automation) => {
      // Asegurarse de que config sea un objeto
      if (typeof automation.config === 'string') {
        try {
          automation.config = JSON.parse(automation.config);
        } catch (error) {
          throw new Error('Invalid JSON in config');
        }
      }
    }
  }
});

// Asociaciones
Automation.associate = (models) => {
  Automation.belongsTo(models.Module, {
    foreignKey: 'moduleId',
    as: 'module'
  });
  
  Automation.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });

  Automation.hasMany(models.AutomationLog, {
    foreignKey: 'automationId',
    as: 'logs'
  });
};

module.exports = Automation;
