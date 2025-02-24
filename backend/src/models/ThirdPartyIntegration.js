const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ThirdPartyIntegration extends Model {}

ThirdPartyIntegration.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    provider: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['aws', 'google', 'stripe', 'sendgrid', 'twitter', 
                   'hubspot', 'salesforce', 'mailchimp', 'openai']]
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    config: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'error'),
        defaultValue: 'inactive'
    },
    healthStatus: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    lastHealthCheck: {
        type: DataTypes.DATE
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    createdBy: {
        type: DataTypes.UUID,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    updatedBy: {
        type: DataTypes.UUID,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'ThirdPartyIntegration',
    tableName: 'third_party_integrations',
    timestamps: true,
    paranoid: true,
    indexes: [
        {
            unique: true,
            fields: ['provider', 'name']
        }
    ]
});

module.exports = ThirdPartyIntegration;
