const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, updateProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middlewares/auth');

// 创建项目
router.post('/', protect, createProject);

// 获取项目列表
router.get('/', protect, getProjects);

// 获取项目详情
router.get('/:id', protect, getProjectById);

// 更新项目
router.put('/:id', protect, updateProject);

// 删除项目
router.delete('/:id', protect, deleteProject);

module.exports = router;