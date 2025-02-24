const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ServiceTerms extends Model {}

ServiceTerms.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    serviceProvider: {
        type: DataTypes.STRING,
        allowNull: false
    },
    version: {
        type: DataTypes.STRING,
        allowNull: false
    },
    effectiveDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    termsUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isUrl: true
        }
    },
    privacyUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isUrl: true
        }
    },
    requirements: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    restrictions: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    changes: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    sequelize,
    modelName: 'ServiceTerms',
    tableName: 'service_terms',
    timestamps: true,
    indexes: [
        {
            fields: ['serviceProvider']
        },
        {
            fields: ['version']
        },
        {
            fields: ['effectiveDate']
        }
    ]
});

module.exports = ServiceTerms;
