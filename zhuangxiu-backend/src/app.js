const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const { connectDB } = require('./config/database');

// 加载环境变量
dotenv.config();

// 连接数据库
connectDB();

// 创建Express应用
const app = express();

// 安全中间件
app.use(helmet());

// 跨域配置
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 请求体解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制100个请求
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/contracts', require('./routes/contracts'));
app.use('/api/designs', require('./routes/designs'));
app.use('/api/construction', require('./routes/construction'));
app.use('/api/acceptance', require('./routes/acceptance'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/weather', require('./routes/weather'));

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '服务运行正常' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: '接口不存在' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: '服务器内部错误' });
});

// 启动服务器
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = app;