const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ConsentLog extends Model {}

ConsentLog.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        references: {
            model: 'Users',
            key: 'id'
        },
        allowNull: false
    },
    serviceProvider: {
        type: DataTypes.STRING,
        allowNull: false
    },
    action: {
        type: DataTypes.ENUM('create', 'update', 'revoke'),
        allowNull: false
    },
    termsVersion: {
        type: DataTypes.STRING,
        allowNull: false
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
    }
}, {
    sequelize,
    modelName: 'ConsentLog',
    tableName: 'consent_logs',
    timestamps: true,
    indexes: [
        {
            fields: ['userId']
        },
        {
            fields: ['serviceProvider']
        },
        {
            fields: ['action']
        },
        {
            fields: ['createdAt']
        }
    ]
});

module.exports = ConsentLog;
