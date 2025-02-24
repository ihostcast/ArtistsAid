const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Subscription extends Model {
        static associate(models) {
            Subscription.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user'
            });
            Subscription.hasMany(models.Payment, {
                foreignKey: 'subscriptionId',
                as: 'payments'
            });
        }
    }

    Subscription.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        plan: {
            type: DataTypes.ENUM,
            values: ['free', 'basic', 'premium', 'enterprise'],
            defaultValue: 'free'
        },
        status: {
            type: DataTypes.ENUM,
            values: ['active', 'cancelled', 'expired', 'suspended'],
            defaultValue: 'active'
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        autoRenew: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        currency: {
            type: DataTypes.STRING,
            defaultValue: 'USD'
        },
        billingCycle: {
            type: DataTypes.ENUM,
            values: ['monthly', 'quarterly', 'annual'],
            defaultValue: 'monthly'
        },
        features: {
            type: DataTypes.JSON,
            defaultValue: {}
        },
        metadata: {
            type: DataTypes.JSON,
            defaultValue: {}
        }
    }, {
        sequelize,
        modelName: 'Subscription',
        hooks: {
            beforeCreate: async (subscription) => {
                // Calcular la fecha de finalización basada en el ciclo de facturación
                const startDate = subscription.startDate || new Date();
                let endDate = new Date(startDate);
                
                switch(subscription.billingCycle) {
                    case 'monthly':
                        endDate.setMonth(endDate.getMonth() + 1);
                        break;
                    case 'quarterly':
                        endDate.setMonth(endDate.getMonth() + 3);
                        break;
                    case 'annual':
                        endDate.setFullYear(endDate.getFullYear() + 1);
                        break;
                }
                
                subscription.endDate = endDate;
            }
        }
    });

    return Subscription;
};
