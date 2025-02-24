const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const crypto = require('crypto');

class Webhook extends Model {
    static generateSecret() {
        return crypto.randomBytes(32).toString('hex');
    }

    verifySignature(signature, payload) {
        const hmac = crypto.createHmac('sha256', this.secret);
        const calculatedSignature = hmac.update(payload).digest('hex');
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(calculatedSignature)
        );
    }
}

Webhook.init({
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
    url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isUrl: true
        }
    },
    events: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: []
    },
    secret: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: Webhook.generateSecret
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'error'),
        defaultValue: 'active'
    },
    version: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '1.0'
    },
    retryConfig: {
        type: DataTypes.JSONB,
        defaultValue: {
            maxAttempts: 3,
            backoffMultiplier: 2,
            initialDelay: 1000 // ms
        }
    },
    filters: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    headers: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    lastSuccess: {
        type: DataTypes.DATE,
        allowNull: true
    },
    lastFailure: {
        type: DataTypes.DATE,
        allowNull: true
    },
    failureCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    successCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
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
    modelName: 'Webhook',
    tableName: 'webhooks',
    timestamps: true,
    paranoid: true,
    indexes: [
        {
            fields: ['integrationId']
        },
        {
            fields: ['status']
        }
    ]
});

module.exports = Webhook;
