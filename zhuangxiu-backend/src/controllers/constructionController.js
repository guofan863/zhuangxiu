const { Construction, Cost } = require('../config/database');

// 创建施工进度
exports.createConstruction = async (req, res) => {
  try {
    const user = req.user;
    const {
      projectId,
      stage,
      name,
      description,
      progress,
      plannedStartDate,
      plannedEndDate,
      actualStartDate,
      actualEndDate,
      status,
      image,
      notes
    } = req.body;
    
    // 创建施工进度
    const construction = await Construction.create({
      userId: user.id,
      projectId,
      stage,
      name,
      description,
      progress,
      plannedStartDate,
      plannedEndDate,
      actualStartDate,
      actualEndDate,
      status,
      image,
      notes
    });
    
    res.status(201).json({
      status: 'success',
      message: '施工进度创建成功',
      data: construction
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '施工进度创建失败' });
  }
};

// 获取施工进度列表
exports.getConstructions = async (req, res) => {
  try {
    const user = req.user;
    const { projectId } = req.query;
    
    // 构建查询条件
    const query = { userId: user.id };
    if (projectId) {
      query.projectId = projectId;
    }
    
    // 获取施工进度列表
    const constructions = await Construction.findAll({ where: query });
    
    res.status(200).json({
      status: 'success',
      data: constructions
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取施工进度列表失败' });
  }
};

// 获取施工进度详情
exports.getConstructionById = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    
    // 获取施工进度详情
    const construction = await Construction.findOne({ where: { id, userId: user.id } });
    
    if (!construction) {
      return res.status(404).json({ status: 'error', message: '施工进度不存在' });
    }
    
    res.status(200).json({
      status: 'success',
      data: construction
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取施工进度详情失败' });
  }
};

// 更新施工进度
exports.updateConstruction = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const {
      stage,
      name,
      description,
      progress,
      plannedStartDate,
      plannedEndDate,
      actualStartDate,
      actualEndDate,
      status,
      image,
      notes
    } = req.body;
    
    // 获取施工进度
    const construction = await Construction.findOne({ where: { id, userId: user.id } });
    
    if (!construction) {
      return res.status(404).json({ status: 'error', message: '施工进度不存在' });
    }
    
    // 更新施工进度
    await construction.update({
      stage: stage || construction.stage,
      name: name || construction.name,
      description: description || construction.description,
      progress: progress || construction.progress,
      plannedStartDate: plannedStartDate || construction.plannedStartDate,
      plannedEndDate: plannedEndDate || construction.plannedEndDate,
      actualStartDate: actualStartDate || construction.actualStartDate,
      actualEndDate: actualEndDate || construction.actualEndDate,
      status: status || construction.status,
      image: image || construction.image,
      notes: notes || construction.notes
    });
    
    res.status(200).json({
      status: 'success',
      message: '施工进度更新成功',
      data: construction
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '施工进度更新失败' });
  }
};

// 删除施工进度
exports.deleteConstruction = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    
    // 获取施工进度
    const construction = await Construction.findOne({ where: { id, userId: user.id } });
    
    if (!construction) {
      return res.status(404).json({ status: 'error', message: '施工进度不存在' });
    }
    
    // 删除施工进度
    await construction.destroy();
    
    res.status(200).json({
      status: 'success',
      message: '施工进度删除成功'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '施工进度删除失败' });
  }
};

// 创建费用记录
exports.createCost = async (req, res) => {
  try {
    const user = req.user;
    const {
      projectId,
      category,
      subcategory,
      amount,
      paymentDate,
      paymentMethod,
      description,
      receiptImage,
      status
    } = req.body;
    
    // 创建费用记录
    const cost = await Cost.create({
      userId: user.id,
      projectId,
      category,
      subcategory,
      amount,
      paymentDate,
      paymentMethod,
      description,
      receiptImage,
      status
    });
    
    res.status(201).json({
      status: 'success',
      message: '费用记录创建成功',
      data: cost
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '费用记录创建失败' });
  }
};

// 获取费用记录列表
exports.getCosts = async (req, res) => {
  try {
    const user = req.user;
    const { projectId, category } = req.query;
    
    // 构建查询条件
    const query = { userId: user.id };
    if (projectId) {
      query.projectId = projectId;
    }
    if (category) {
      query.category = category;
    }
    
    // 获取费用记录列表
    const costs = await Cost.findAll({ where: query });
    
    res.status(200).json({
      status: 'success',
      data: costs
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取费用记录列表失败' });
  }
};

// 获取费用统计
exports.getCostStatistics = async (req, res) => {
  try {
    const user = req.user;
    const { projectId } = req.query;
    
    // 构建查询条件
    const query = { userId: user.id };
    if (projectId) {
      query.projectId = projectId;
    }
    
    // 获取费用记录
    const costs = await Cost.findAll({ where: query });
    
    // 计算统计数据
    const totalAmount = costs.reduce((sum, cost) => sum + cost.amount, 0);
    const categoryStats = costs.reduce((acc, cost) => {
      if (!acc[cost.category]) {
        acc[cost.category] = 0;
      }
      acc[cost.category] += cost.amount;
      return acc;
    }, {});
    
    res.status(200).json({
      status: 'success',
      data: {
        totalAmount,
        categoryStats
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取费用统计失败' });
  }
};

// 更新费用记录
exports.updateCost = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const {
      category,
      subcategory,
      amount,
      paymentDate,
      paymentMethod,
      description,
      receiptImage,
      status
    } = req.body;
    
    // 获取费用记录
    const cost = await Cost.findOne({ where: { id, userId: user.id } });
    
    if (!cost) {
      return res.status(404).json({ status: 'error', message: '费用记录不存在' });
    }
    
    // 更新费用记录
    await cost.update({
      category: category || cost.category,
      subcategory: subcategory || cost.subcategory,
      amount: amount || cost.amount,
      paymentDate: paymentDate || cost.paymentDate,
      paymentMethod: paymentMethod || cost.paymentMethod,
      description: description || cost.description,
      receiptImage: receiptImage || cost.receiptImage,
      status: status || cost.status
    });
    
    res.status(200).json({
      status: 'success',
      message: '费用记录更新成功',
      data: cost
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '费用记录更新失败' });
  }
};

// 删除费用记录
exports.deleteCost = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    
    // 获取费用记录
    const cost = await Cost.findOne({ where: { id, userId: user.id } });
    
    if (!cost) {
      return res.status(404).json({ status: 'error', message: '费用记录不存在' });
    }
    
    // 删除费用记录
    await cost.destroy();
    
    res.status(200).json({
      status: 'success',
      message: '费用记录删除成功'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '费用记录删除失败' });
  }
};