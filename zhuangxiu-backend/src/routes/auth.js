const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, updateUser, updatePassword } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

// 注册
router.post('/register', register);

// 登录
router.post('/login', login);

// 获取当前用户信息
router.get('/me', protect, getCurrentUser);

// 更新用户信息
router.put('/update', protect, updateUser);

// 修改密码
router.put('/password', protect, updatePassword);

module.exports = router;