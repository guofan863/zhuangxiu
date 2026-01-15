const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Design = sequelize.define('Design', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  space: {
    type: DataTypes.STRING,
    allowNull: false
  },
  stage: {
    type: DataTypes.STRING,
    allowNull: false
  },
  designImage: {
    type: DataTypes.STRING,
    allowNull: false
  },
  renderImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  actualImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reductionDegree: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  colorMatch: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  sizeMatch: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  materialMatch: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  shapeMatch: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  decorationMatch: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'designs'
});

module.exports = Design;