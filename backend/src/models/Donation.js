const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Donation extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      causeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Causes',
          key: 'id'
        }
      },
      donorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      transactionId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'pending'
      },
      isAnonymous: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'Donation'
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'donorId', as: 'donor' });
    this.belongsTo(models.Cause, { foreignKey: 'causeId', as: 'cause' });
  }
}

Donation.init(sequelize);

module.exports = Donation;
