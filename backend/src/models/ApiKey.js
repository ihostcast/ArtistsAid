const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const crypto = require('crypto');

class ApiKey extends Model {
    static generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    static generateKeyHash(key) {
        return crypto.createHash('sha256').update(key).digest('hex');
    }

    validateKey(key) {
        const hash = ApiKey.generateKeyHash(key);
        return this.keyHash === hash;
    }
}

ApiKey.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    keyHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    provider: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'revoked'),
        defaultValue: 'active'
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    lastUsed: {
        type: DataTypes.DATE,
        allowNull: true
    },
    usageCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    permissions: {
        type: DataTypes.JSONB,
        defaultValue: {}
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
    revokedBy: {
        type: DataTypes.UUID,
        references: {
            model: 'Users',
            key: 'id'
        },
        allowNull: true
    },
    revokedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    revocationReason: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'ApiKey',
    tableName: 'api_keys',
    timestamps: true,
    paranoid: true,
    indexes: [
        {
            unique: true,
            fields: ['keyHash']
        },
        {
            fields: ['provider']
        },
        {
            fields: ['status']
        }
    ],
    hooks: {
        beforeCreate: async (apiKey) => {
            if (!apiKey.keyHash) {
                const key = ApiKey.generateKey();
                apiKey.keyHash = ApiKey.generateKeyHash(key);
                // Almacenar temporalmente la clave sin hash para devolverla
                apiKey.tempKey = key;
            }
        }
    }
});

module.exports = ApiKey;
