const { verifyToken } = require('../utils/jwt');
const { User } = require('../config/database');

// 认证中间件
exports.protect = async (req, res, next) => {
  try {
    // 从请求头获取token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ status: 'error', message: '未提供认证令牌' });
    }
    
    // 验证token
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.id) {
      return res.status(401).json({ status: 'error', message: '无效的认证令牌' });
    }
    
    // 获取用户信息
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ status: 'error', message: '用户不存在' });
    }
    
    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    console.error('错误详情:', error.message);
    res.status(401).json({ 
      status: 'error', 
      message: '认证失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 权限中间件（可选）
exports.authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: '权限不足' });
    }
    next();
  };
};