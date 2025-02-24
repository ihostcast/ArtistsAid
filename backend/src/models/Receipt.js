const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Receipt extends Model {
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
      uploadedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      fileUrl: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending'
      },
      verifiedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      verificationDate: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'Receipt'
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'uploadedBy', as: 'uploader' });
    this.belongsTo(models.User, { foreignKey: 'verifiedBy', as: 'verifier' });
    this.belongsTo(models.Cause, { foreignKey: 'causeId', as: 'cause' });
  }
}

Receipt.init(sequelize);

module.exports = Receipt;
