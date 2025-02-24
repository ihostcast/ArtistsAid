const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const AutomationLog = sequelize.define('AutomationLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  automationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Automations',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('success', 'error', 'warning'),
    allowNull: false
  },
  executionTime: {
    type: DataTypes.INTEGER, // en milisegundos
    allowNull: false
  },
  details: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  error: {
    type: DataTypes.TEXT
  },
  input: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  output: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['automationId', 'createdAt']
    },
    {
      fields: ['status']
    }
  ]
});

// Asociaciones
AutomationLog.associate = (models) => {
  AutomationLog.belongsTo(models.Automation, {
    foreignKey: 'automationId',
    as: 'automation'
  });
};

module.exports = AutomationLog;
