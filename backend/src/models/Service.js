const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = (sequelize) => {
    class Service extends Model {
        static associate(models) {
            Service.belongsTo(models.Partner, {
                foreignKey: 'partnerId',
                as: 'partner'
            });
            Service.belongsToMany(models.Provider, {
                through: 'provider_services',
                foreignKey: 'serviceId',
                as: 'providers'
            });
        }
    }

    Service.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        partnerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'partners',
                key: 'id'
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        category: DataTypes.STRING,
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active'
        }
    }, {
        sequelize,
        modelName: 'Service',
        tableName: 'services'
    });

    return Service;
};
