const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
    class Provider extends Model {
        static async hashPassword(password) {
            return bcrypt.hash(password, 10);
        }

        async validatePassword(password) {
            return bcrypt.compare(password, this.password);
        }

        static associate(models) {
            Provider.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user'
            });
            Provider.belongsTo(models.Partner, {
                foreignKey: 'partnerId',
                as: 'partner'
            });
            Provider.belongsToMany(models.Service, {
                through: 'provider_services',
                foreignKey: 'providerId',
                as: 'services'
            });
        }
    }

    Provider.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        partnerId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'partners',
                key: 'id'
            },
            onDelete: 'SET NULL'
        },
        specialty: DataTypes.STRING,
        bio: DataTypes.TEXT,
        profile_picture: DataTypes.STRING,
        location: {
            type: DataTypes.JSON,
            defaultValue: {}
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'busy'),
            defaultValue: 'active'
        },
        rating: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        total_reviews: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        available_hours: {
            type: DataTypes.JSON,
            defaultValue: {}
        },
        settings: {
            type: DataTypes.JSON,
            defaultValue: {}
        }
    }, {
        sequelize,
        modelName: 'Provider',
        tableName: 'providers',
        hooks: {
            beforeSave: async (provider) => {
                if (provider.changed('password')) {
                    provider.password = await Provider.hashPassword(provider.password);
                }
            }
        }
    });

    return Provider;
};
