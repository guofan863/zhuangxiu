const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User } = require('../config/database');
const { generateToken } = require('../utils/jwt');

// 注册
exports.register = async (req, res) => {
  try {
    const { username, password, phone, email, name } = req.body;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: '用户名已存在' });
    }

    // 检查手机号是否已存在
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ status: 'error', message: '手机号已被注册' });
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ status: 'error', message: '邮箱已被注册' });
      }
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    const user = await User.create({
      username,
      password: hashedPassword,
      phone,
      email,
      name
    });

    // 生成token
    const token = generateToken(user.id);

    res.status(201).json({
      status: 'success',
      message: '注册成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          phone: user.phone,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '注册失败' });
  }
};

// 登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ status: 'error', message: '用户名或密码错误' });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: '用户名或密码错误' });
    }

    // 生成token
    const token = generateToken(user.id);

    res.status(200).json({
      status: 'success',
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          phone: user.phone,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '登录失败' });
  }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          username: user.username,
          phone: user.phone,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取用户信息失败' });
  }
};

// 更新用户信息
exports.updateUser = async (req, res) => {
  try {
    const user = req.user;
    const { phone, email, name, avatar } = req.body;

    // 检查手机号是否已被其他用户使用
    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ where: { phone, id: { [Op.ne]: user.id } } });
      if (existingPhone) {
        return res.status(400).json({ status: 'error', message: '手机号已被注册' });
      }
    }

    // 检查邮箱是否已被其他用户使用
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email, id: { [Op.ne]: user.id } } });
      if (existingEmail) {
        return res.status(400).json({ status: 'error', message: '邮箱已被注册' });
      }
    }

    // 更新用户信息
    await user.update({
      phone: phone || user.phone,
      email: email || user.email,
      name: name || user.name,
      avatar: avatar || user.avatar
    });

    res.status(200).json({
      status: 'success',
      message: '更新成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          phone: user.phone,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '更新失败' });
  }
};

// 修改密码
exports.updatePassword = async (req, res) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;

    // 验证旧密码
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: 'error', message: '旧密码错误' });
    }

    // 加密新密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 更新密码
    await user.update({ password: hashedPassword });

    res.status(200).json({ status: 'success', message: '密码修改成功' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '密码修改失败' });
  }
};