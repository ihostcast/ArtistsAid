const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Organization extends Model {
    static associate(models) {
      Organization.hasMany(models.User);
      Organization.hasMany(models.Cause);
    }
  }

  Organization.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'suspended'),
      defaultValue: 'pending'
    },
    bankInfo: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        accountName: '',
        accountNumber: '',
        routingNumber: '',
        bankName: ''
      }
    },
    stripeAccountId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    monthlyFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 15.00
    },
    nextBillingDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    settings: {
      type: DataTypes.JSON,
      defaultValue: {
        notificationPreferences: {
          email: true,
          push: true
        },
        privacySettings: {
          showDonors: true,
          showAmounts: true
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Organization',
    indexes: [
      {
        unique: true,
        fields: ['name']
      }
    ]
  });

  return Organization;
};
