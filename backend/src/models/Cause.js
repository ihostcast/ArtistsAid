const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Cause extends Model {
    static associate(models) {
      Cause.belongsTo(models.User);
      Cause.belongsTo(models.Organization);
      Cause.hasMany(models.Transaction);
    }
  }

  Cause.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    goalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    currentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'active', 'completed', 'cancelled'),
      defaultValue: 'draft'
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    media: {
      type: DataTypes.JSON,
      defaultValue: {
        images: [],
        videos: [],
        documents: []
      }
    },
    evidence: {
      type: DataTypes.JSON,
      defaultValue: {
        files: [],
        links: []
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Organizations',
        key: 'id'
      }
    },
    settings: {
      type: DataTypes.JSON,
      defaultValue: {
        visibility: 'public',
        allowComments: true,
        showDonors: true,
        showProgress: true
      }
    }
  }, {
    sequelize,
    modelName: 'Cause',
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['category']
      }
    ]
  });

  return Cause;
};
