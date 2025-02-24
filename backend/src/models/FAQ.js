const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class FAQ extends Model {}

FAQ.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  question: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  category: {
    type: DataTypes.STRING
  }
}, {
  sequelize,
  modelName: 'FAQ',
  timestamps: true
});

module.exports = FAQ;
