const express = require('express');
const router = express.Router();
const acceptanceController = require('../controllers/acceptanceController');
const authMiddleware = require('../middlewares/auth');

// 应用认证中间件
router.use(authMiddleware.protect);

// 验收记录相关路由
router.post('/acceptances', acceptanceController.createAcceptance);
router.get('/acceptances', acceptanceController.getAcceptances);
router.get('/acceptances/:id', acceptanceController.getAcceptanceById);
router.put('/acceptances/:id', acceptanceController.updateAcceptance);
router.delete('/acceptances/:id', acceptanceController.deleteAcceptance);

module.exports = router;