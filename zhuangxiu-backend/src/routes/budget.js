const express = require('express');
const router = express.Router();
const { generateBudget } = require('../controllers/budgetController');
const { protect } = require('../middlewares/auth');

// 智能预算生成
router.post('/generate', protect, generateBudget);

module.exports = router;
