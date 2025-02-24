const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Organizations',
      key: 'id'
    }
  },
  fanGroupId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'FanGroups',
      key: 'id'
    }
  },
  causeId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Causes',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('update', 'announcement', 'cause', 'event', 'media'),
    defaultValue: 'update'
  },
  visibility: {
    type: DataTypes.ENUM('public', 'members', 'donors', 'private'),
    defaultValue: 'public'
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {
      media: [], // URLs de imágenes, videos, etc.
      links: [], // Enlaces externos
      tags: []
    }
  },
  stats: {
    type: DataTypes.JSON,
    defaultValue: {
      likes: 0,
      comments: 0,
      shares: 0
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'published'
  }
});

// Asociaciones
Post.associate = (models) => {
  Post.belongsTo(models.User, { as: 'author' });
  Post.belongsTo(models.Organization, { as: 'organization' });
  Post.belongsTo(models.FanGroup, { as: 'fanGroup' });
  Post.belongsTo(models.Cause, { as: 'cause' });
  Post.hasMany(models.Comment, { as: 'comments' });
  Post.hasMany(models.Like, { as: 'likes' });
  Post.hasMany(models.Share, { as: 'shares' });
};

module.exports = Post;
