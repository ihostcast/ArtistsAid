const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class UserConsent extends Model {}

UserConsent.init({
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
    termsAccepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    termsVersion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    acceptedAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    revokedAt: {
        type: DataTypes.DATE,
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
    }
}, {
    sequelize,
    modelName: 'UserConsent',
    tableName: 'user_consents',
    timestamps: true,
    indexes: [
        {
            fields: ['userId']
        },
        {
            fields: ['serviceProvider']
        },
        {
            fields: ['termsAccepted']
        }
    ]
});

module.exports = UserConsent;
