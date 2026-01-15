const express = require('express');
const router = express.Router();
const { createContract, getContracts, getContractById, updateContract, deleteContract, analyzeContract } = require('../controllers/contractController');
const { protect } = require('../middlewares/auth');

// 创建合同
router.post('/', protect, createContract);

// 获取合同列表
router.get('/', protect, getContracts);

// 获取合同详情
router.get('/:id', protect, getContractById);

// 更新合同
router.put('/:id', protect, updateContract);

// 删除合同
router.delete('/:id', protect, deleteContract);

// 合同智能审核
router.post('/:id/analyze', protect, analyzeContract);

module.exports = router;