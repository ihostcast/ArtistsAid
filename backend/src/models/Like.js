const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Like extends Model {}

Like.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    },
    allowNull: false
  },
  newsId: {
    type: DataTypes.UUID,
    references: {
      model: 'News',
      key: 'id'
    }
  },
  postId: {
    type: DataTypes.UUID,
    references: {
      model: 'Posts',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Like',
  timestamps: true,
  validate: {
    eitherNewsOrPost() {
      if (!this.newsId && !this.postId) {
        throw new Error('A like must be associated with either a news article or a post');
      }
      if (this.newsId && this.postId) {
        throw new Error('A like cannot be associated with both a news article and a post');
      }
    }
  }
});

module.exports = Like;
