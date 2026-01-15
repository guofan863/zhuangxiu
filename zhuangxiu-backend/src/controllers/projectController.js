const { Project } = require('../config/database');

// 创建项目
exports.createProject = async (req, res) => {
  try {
    const user = req.user;
    const { name, type, area, address, totalBudget, startDate, expectedEndDate, description } = req.body;
    
    // 创建项目
    const project = await Project.create({
      userId: user.id,
      name,
      type,
      area,
      address,
      totalBudget,
      startDate,
      expectedEndDate,
      description
    });
    
    res.status(201).json({
      status: 'success',
      message: '项目创建成功',
      data: project
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '项目创建失败' });
  }
};

// 获取项目列表
exports.getProjects = async (req, res) => {
  try {
    const user = req.user;
    
    // 获取用户的所有项目
    const projects = await Project.findAll({ where: { userId: user.id } });
    
    res.status(200).json({
      status: 'success',
      data: projects
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取项目列表失败' });
  }
};

// 获取项目详情
exports.getProjectById = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    
    // 获取项目详情
    const project = await Project.findOne({ where: { id, userId: user.id } });
    
    if (!project) {
      return res.status(404).json({ status: 'error', message: '项目不存在' });
    }
    
    res.status(200).json({
      status: 'success',
      data: project
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取项目详情失败' });
  }
};

// 更新项目
exports.updateProject = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { name, type, area, address, totalBudget, startDate, expectedEndDate, actualEndDate, status, description } = req.body;
    
    // 获取项目
    const project = await Project.findOne({ where: { id, userId: user.id } });
    
    if (!project) {
      return res.status(404).json({ status: 'error', message: '项目不存在' });
    }
    
    // 更新项目
    await project.update({
      name: name || project.name,
      type: type || project.type,
      area: area || project.area,
      address: address || project.address,
      totalBudget: totalBudget || project.totalBudget,
      startDate: startDate || project.startDate,
      expectedEndDate: expectedEndDate || project.expectedEndDate,
      actualEndDate: actualEndDate || project.actualEndDate,
      status: status || project.status,
      description: description || project.description
    });
    
    res.status(200).json({
      status: 'success',
      message: '项目更新成功',
      data: project
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '项目更新失败' });
  }
};

// 删除项目
exports.deleteProject = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    
    // 获取项目
    const project = await Project.findOne({ where: { id, userId: user.id } });
    
    if (!project) {
      return res.status(404).json({ status: 'error', message: '项目不存在' });
    }
    
    // 删除项目
    await project.destroy();
    
    res.status(200).json({
      status: 'success',
      message: '项目删除成功'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '项目删除失败' });
  }
};