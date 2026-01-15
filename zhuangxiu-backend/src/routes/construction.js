const express = require('express');
const router = express.Router();
const constructionController = require('../controllers/constructionController');
const authMiddleware = require('../middlewares/auth');

// 应用认证中间件
router.use(authMiddleware.protect);

// 施工进度相关路由
router.post('/constructions', constructionController.createConstruction);
router.get('/constructions', constructionController.getConstructions);
router.get('/constructions/:id', constructionController.getConstructionById);
router.put('/constructions/:id', constructionController.updateConstruction);
router.delete('/constructions/:id', constructionController.deleteConstruction);

// 费用相关路由
router.post('/costs', constructionController.createCost);
router.get('/costs', constructionController.getCosts);
router.get('/costs/statistics', constructionController.getCostStatistics);
router.put('/costs/:id', constructionController.updateCost);
router.delete('/costs/:id', constructionController.deleteCost);

module.exports = router;