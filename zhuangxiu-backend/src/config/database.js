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

// 测试数据库连接
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite数据库连接成功');

    // 同步数据库模型（不使用force，避免删除现有数据）
    await sequelize.sync({ alter: false });
    console.log('数据库模型同步完成');
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    process.exit(1);
  }
};

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