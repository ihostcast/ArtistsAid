const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class IntegrationNotification extends Model {}

IntegrationNotification.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['TERMS_UPDATE', 'SERVICE_DISRUPTION', 'BILLING_ISSUE', 
                   'API_DEPRECATION', 'USAGE_LIMIT', 'MAINTENANCE']]
        }
    },
    serviceProvider: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    priority: {
        type: DataTypes.ENUM('high', 'medium', 'low'),
        allowNull: false
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    affectedUsers: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        defaultValue: []
    },
    readBy: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        defaultValue: []
    },
    actionRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    actionUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'resolved', 'expired'),
        defaultValue: 'active'
    }
}, {
    sequelize,
    modelName: 'IntegrationNotification',
    tableName: 'integration_notifications',
    timestamps: true,
    indexes: [
        {
            fields: ['type']
        },
        {
            fields: ['serviceProvider']
        },
        {
            fields: ['priority']
        },
        {
            fields: ['status']
        },
        {
            fields: ['createdAt']
        }
    ]
});

module.exports = IntegrationNotification;
