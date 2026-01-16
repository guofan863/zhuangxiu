const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('Company', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactPerson: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  qualification: {
    type: DataTypes.STRING,
    allowNull: false
  },
  serviceScope: {
    type: DataTypes.STRING,
    allowNull: false
  },
  priceScore: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  periodScore: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  evaluationScore: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  serviceScore: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  qualificationScore: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  registeredCapital: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  establishedYear: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  storeCount: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  hasOwnWorkers: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  caseCount: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  quotationMode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  depositRatio: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  addItemPolicy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  waterElectricBilling: {
    type: DataTypes.STRING,
    allowNull: true
  },
  taxIncluded: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  manageFeeRate: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  unitPrice: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  constructionPeriod: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  delayCompensation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hiddenWorkWarranty: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  warrantyPeriod: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  hasSupervision: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  supervisionType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hasCloudMonitoring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  processStandard: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  mainMaterialBrands: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  auxMaterialBrands: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ecoLevel: {
    type: DataTypes.STRING,
    allowNull: true
  },
  designerLevel: {
    type: DataTypes.STRING,
    allowNull: true
  },
  serviceResponseHours: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  complaintCount: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  evaluation: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isFavorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  tableName: 'companies'
});

module.exports = Company;