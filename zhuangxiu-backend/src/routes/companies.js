const express = require('express');
const router = express.Router();
const { createCompany, getCompanies, getCompanyById, updateCompany, deleteCompany, toggleFavorite } = require('../controllers/companyController');
const { protect } = require('../middlewares/auth');

// 创建装修公司
router.post('/', protect, createCompany);

// 获取装修公司列表
router.get('/', protect, getCompanies);

// 获取装修公司详情
router.get('/:id', protect, getCompanyById);

// 更新装修公司
router.put('/:id', protect, updateCompany);

// 删除装修公司
router.delete('/:id', protect, deleteCompany);

// 标记为收藏
router.put('/:id/favorite', protect, toggleFavorite);

module.exports = router;