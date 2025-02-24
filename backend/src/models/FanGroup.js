const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FanGroup = sequelize.define('FanGroup', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Organizations',
      key: 'id'
    }
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('official', 'community'),
    defaultValue: 'community'
  },
  status: {
    type: DataTypes.ENUM('active', 'archived'),
    defaultValue: 'active'
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      joinPolicy: 'open', // open, request, invite
      postPolicy: 'members', // members, admins
      visibility: 'public' // public, private
    }
  },
  stats: {
    type: DataTypes.JSON,
    defaultValue: {
      memberCount: 0,
      postCount: 0,
      totalDonations: 0
    }
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
});

// Asociaciones
FanGroup.associate = (models) => {
  FanGroup.belongsTo(models.Organization);
  FanGroup.belongsTo(models.User, { as: 'creator' });
  FanGroup.belongsToMany(models.User, {
    through: 'FanGroupMembers',
    as: 'members'
  });
  FanGroup.hasMany(models.Post, { as: 'posts' });
  FanGroup.hasMany(models.Event, { as: 'events' });
};

module.exports = FanGroup;
