const { Model, DataTypes } = require('sequelize');
const { VERIFICATION_TYPES } = require('../config/constants');

class VerificationRequest extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      type: {
        type: DataTypes.ENUM(Object.values(VERIFICATION_TYPES)),
        allowNull: false
      },
      documents: {
        type: DataTypes.JSONB,
        defaultValue: []
      },
      status: {
        type: DataTypes.ENUM('pending', 'in_review', 'approved', 'rejected', 'needs_info'),
        defaultValue: 'pending'
      },
      reviewerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      reviewNotes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      submissionDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      reviewDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      validUntil: {
        type: DataTypes.DATE,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
      }
    }, {
      sequelize,
      modelName: 'VerificationRequest',
      hooks: {
        beforeCreate: async (request) => {
          request.submissionDate = new Date();
        },
        beforeUpdate: async (request) => {
          if (request.changed('status') && request.status === 'approved') {
            request.reviewDate = new Date();
            // Set validation period (e.g., 1 year from approval)
            request.validUntil = new Date(request.reviewDate);
            request.validUntil.setFullYear(request.validUntil.getFullYear() + 1);
          }
        }
      }
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    this.belongsTo(models.User, { foreignKey: 'reviewerId', as: 'reviewer' });
  }
}

module.exports = VerificationRequest;
