const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 创建SQLite数据库连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

// 清理可能的备份表（SQLite在alter模式失败时可能遗留）
async function cleanupBackupTables() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const [results] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_backup'"
    );
    
    for (const table of results) {
      const tableName = table.name;
      console.log(`清理备份表: ${tableName}`);
      try {
        await queryInterface.dropTable(tableName);
        console.log(`已删除备份表: ${tableName}`);
      } catch (dropError) {
        console.warn(`删除备份表 ${tableName} 失败:`, dropError.message);
      }
    }
  } catch (error) {
    console.warn('清理备份表时出错:', error.message);
  }
}

// 测试数据库连接
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite数据库连接成功');

    // 先清理可能的备份表
    await cleanupBackupTables();

    // 同步数据库模型
    // force: false - 不删除现有数据
    // alter: false - 不自动修改表结构（避免SQLite的备份表问题）
    // 如果表不存在，会创建；如果表已存在，不会修改
    await sequelize.sync({ force: false, alter: false });
    console.log('数据库模型同步完成');

    // 手动检查并添加缺失的列（针对Company表）
    await ensureCompanyTableColumns();
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    console.error('错误详情:', error);
    process.exit(1);
  }
};

// 手动确保Company表有所有必需的列
async function ensureCompanyTableColumns() {
  try {
    // 延迟导入避免循环依赖
    const Company = require('../models/Company');
    const queryInterface = sequelize.getQueryInterface();
    
    // 检查表是否存在
    try {
      await queryInterface.describeTable('companies');
    } catch (tableError) {
      // 如果表不存在，会在sync时创建，这里不需要处理
      console.log('companies表不存在，将在sync时创建');
      return;
    }

    // 需要添加的列列表（如果缺失）
    const columnsToAdd = [
      'registeredCapital', 'establishedYear', 'storeCount', 'hasOwnWorkers',
      'caseCount', 'quotationMode', 'depositRatio', 'addItemPolicy',
      'waterElectricBilling', 'taxIncluded', 'manageFeeRate', 'price',
      'unitPrice', 'paymentMethod', 'constructionPeriod', 'delayCompensation',
      'hiddenWorkWarranty', 'warrantyPeriod', 'hasSupervision', 'supervisionType',
      'hasCloudMonitoring', 'processStandard', 'mainMaterialBrands',
      'auxMaterialBrands', 'ecoLevel', 'designerLevel', 'serviceResponseHours',
      'complaintCount', 'evaluation', 'notes', 'isFavorite'
    ];

    // 获取当前表结构
    const tableDescription = await queryInterface.describeTable('companies');
    
    // 检查并添加缺失的列
    let addedCount = 0;
    for (const columnName of columnsToAdd) {
      if (!tableDescription[columnName]) {
        console.log(`检测到缺失的列: ${columnName}，正在添加...`);
        
        // 根据模型定义获取列类型
        const columnDefinition = Company.rawAttributes[columnName];
        if (columnDefinition) {
          try {
            await queryInterface.addColumn('companies', columnName, {
              type: columnDefinition.type,
              allowNull: columnDefinition.allowNull !== false,
              defaultValue: columnDefinition.defaultValue
            });
            console.log(`✓ 成功添加列: ${columnName}`);
            addedCount++;
          } catch (addError) {
            // 如果列已存在或其他错误，忽略
            if (addError.message && addError.message.includes('duplicate column')) {
              console.log(`列 ${columnName} 已存在，跳过`);
            } else {
              console.warn(`添加列 ${columnName} 时出错:`, addError.message);
            }
          }
        }
      }
    }
    
    if (addedCount > 0) {
      console.log(`Company表列检查完成，共添加 ${addedCount} 个列`);
    } else {
      console.log('Company表列检查完成，所有列已存在');
    }
  } catch (error) {
    // 如果检查过程中出错，只记录日志，不中断启动
    console.warn('检查Company表列时出错:', error.message);
  }
}

// 导出sequelize对象（先导出，避免循环依赖）
module.exports = {
  sequelize,
  connectDB
};

// 导入模型
const User = require('../models/User');
const Project = require('../models/Project');
const Company = require('../models/Company');
const Contract = require('../models/Contract');
const Design = require('../models/Design');
const Construction = require('../models/Construction');
const Cost = require('../models/Cost');
const Acceptance = require('../models/Acceptance');
const Note = require('../models/Note');
const Material = require('../models/Material');

// 重新导出所有模型
module.exports.User = User;
module.exports.Project = Project;
module.exports.Company = Company;
module.exports.Contract = Contract;
module.exports.Design = Design;
module.exports.Construction = Construction;
module.exports.Cost = Cost;
module.exports.Acceptance = Acceptance;
module.exports.Note = Note;
module.exports.Material = Material;