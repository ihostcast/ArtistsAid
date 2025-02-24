const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Payment extends Model {
        static associate(models) {
            Payment.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user'
            });
            Payment.belongsTo(models.Subscription, {
                foreignKey: 'subscriptionId',
                as: 'subscription'
            });
        }
    }

    Payment.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        subscriptionId: {
            type: DataTypes.UUID,
            allowNull: true
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        currency: {
            type: DataTypes.STRING,
            defaultValue: 'USD'
        },
        status: {
            type: DataTypes.ENUM,
            values: ['pending', 'completed', 'failed', 'refunded'],
            defaultValue: 'pending'
        },
        paymentMethod: {
            type: DataTypes.ENUM,
            values: ['stripe', 'paypal'],
            allowNull: false
        },
        paymentMethodId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        transactionId: {
            type: DataTypes.STRING,
            unique: true
        },
        commissionAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        commissionRate: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        metadata: {
            type: DataTypes.JSON,
            defaultValue: {}
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        billingDetails: {
            type: DataTypes.JSON,
            defaultValue: {}
        },
        refundReason: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Payment',
        hooks: {
            beforeCreate: async (payment) => {
                // Calcular la comisión si no está establecida
                if (!payment.commissionAmount && payment.amount && payment.commissionRate) {
                    payment.commissionAmount = parseFloat(payment.amount) * payment.commissionRate;
                }
            }
        }
    });

    return Payment;
};
