const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
    class Partner extends Model {
        static async hashPassword(password) {
            return bcrypt.hash(password, 10);
        }

        async validatePassword(password) {
            return bcrypt.compare(password, this.password);
        }

        static associate(models) {
            Partner.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user'
            });
            Partner.hasMany(models.Provider, {
                foreignKey: 'partnerId',
                as: 'providers'
            });
            Partner.hasMany(models.Service, {
                foreignKey: 'partnerId',
                as: 'services'
            });
        }
    }

    Partner.init({
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
        company_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        company_address: DataTypes.STRING,
        company_logo: DataTypes.STRING,
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'pending'),
            defaultValue: 'pending'
        },
        subscription_plan: {
            type: DataTypes.STRING,
            defaultValue: 'free'
        },
        subscription_status: {
            type: DataTypes.ENUM('active', 'expired', 'cancelled'),
            defaultValue: 'active'
        },
        subscription_expiry: DataTypes.DATE,
        stripe_customer_id: DataTypes.STRING,
        settings: {
            type: DataTypes.JSON,
            defaultValue: {}
        }
    }, {
        sequelize,
        modelName: 'Partner',
        tableName: 'partners',
        hooks: {
            beforeSave: async (partner) => {
                if (partner.changed('password')) {
                    partner.password = await Partner.hashPassword(partner.password);
                }
            }
        }
    });

    return Partner;
};
