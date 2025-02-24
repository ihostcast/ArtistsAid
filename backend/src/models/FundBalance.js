const { Model, DataTypes } = require('sequelize');

class FundBalance extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      totalBalance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      availableBalance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      reservedBalance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      disbursedBalance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      monthlyStats: {
        type: DataTypes.JSONB,
        defaultValue: {}
      },
      categoryAllocation: {
        type: DataTypes.JSONB,
        defaultValue: {}
      },
      lastUpdated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      modelName: 'FundBalance',
      hooks: {
        beforeUpdate: async (balance) => {
          balance.lastUpdated = new Date();
        }
      }
    });
  }

  static associate(models) {
    // No direct associations needed
  }
}

module.exports = FundBalance;
