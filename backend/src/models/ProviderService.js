const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class ProviderService extends Model {
        static associate(models) {
            // Las asociaciones se manejan en los modelos Provider y Service
        }
    }

    ProviderService.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        providerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'providers',
                key: 'id'
            }
        },
        serviceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'services',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active'
        },
        customPrice: {
            type: DataTypes.DECIMAL(10, 2)
        }
    }, {
        sequelize,
        modelName: 'ProviderService',
        tableName: 'provider_services'
    });

    return ProviderService;
};
