const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class IntegrationLog extends Model {}

IntegrationLog.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    integrationId: {
        type: DataTypes.UUID,
        references: {
            model: 'third_party_integrations',
            key: 'id'
        },
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['api_call', 'webhook', 'sync', 'error', 'health_check', 'config_change']]
        }
    },
    event: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['success', 'error', 'warning', 'info']]
        }
    },
    requestData: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    responseData: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    error: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    duration: {
        type: DataTypes.INTEGER, // en milisegundos
        allowNull: true
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userAgent: {
        type: DataTypes.STRING,
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    userId: {
        type: DataTypes.UUID,
        references: {
            model: 'Users',
            key: 'id'
        },
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'IntegrationLog',
    tableName: 'integration_logs',
    timestamps: true,
    indexes: [
        {
            fields: ['integrationId']
        },
        {
            fields: ['type']
        },
        {
            fields: ['status']
        },
        {
            fields: ['createdAt']
        }
    ]
});

module.exports = IntegrationLog;
