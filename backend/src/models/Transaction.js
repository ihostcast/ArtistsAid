const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.User);
      Transaction.belongsTo(models.Cause);
    }
  }

  Transaction.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD'
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending'
    },
    type: {
      type: DataTypes.ENUM('donation', 'fee', 'refund'),
      defaultValue: 'donation'
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false
    },
    paymentDetails: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    stripePaymentId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    causeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Causes',
        key: 'id'
      }
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {
        anonymous: false,
        message: '',
        tags: []
      }
    }
  }, {
    sequelize,
    modelName: 'Transaction',
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['type']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return Transaction;
};
