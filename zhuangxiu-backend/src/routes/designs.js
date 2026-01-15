const express = require('express');
const router = express.Router();
const { createDesign, getDesigns, getDesignById, updateDesign, deleteDesign, evaluateReduction } = require('../controllers/designController');
const { protect } = require('../middlewares/auth');

// 创建设计对比
router.post('/', protect, createDesign);

// 获取设计对比列表
router.get('/', protect, getDesigns);

// 获取设计对比详情
router.get('/:id', protect, getDesignById);

// 更新设计对比
router.put('/:id', protect, updateDesign);

// 删除设计对比
router.delete('/:id', protect, deleteDesign);

// 设计还原度智能评估
router.post('/:id/evaluate', protect, evaluateReduction);

module.exports = router;