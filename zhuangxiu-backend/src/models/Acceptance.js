const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Acceptance = sequelize.define('Acceptance', {
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
  stage: {
    type: DataTypes.STRING,
    allowNull: false
  },
  space: {
    type: DataTypes.STRING,
    allowNull: false
  },
  acceptanceDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  designImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  actualImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  issues: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rectificationDeadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rectificationStatus: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
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
  tableName: 'acceptances'
});

module.exports = Acceptance;