const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Theme = sequelize.define('Theme', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('frontend', 'dashboard'),
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  config: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false
  },
  directory: {
    type: DataTypes.STRING,
    allowNull: false
  },
  previewImage: {
    type: DataTypes.STRING
  },
  author: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  }
});
