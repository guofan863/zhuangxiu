const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { protect } = require('../middlewares/auth');

// 应用认证中间件
router.use(protect);

// 物料相关路由
router.post('/', materialController.createMaterial);
router.get('/', materialController.getMaterials);
router.get('/:id', materialController.getMaterialById);
router.put('/:id', materialController.updateMaterial);
router.delete('/:id', materialController.deleteMaterial);

module.exports = router;