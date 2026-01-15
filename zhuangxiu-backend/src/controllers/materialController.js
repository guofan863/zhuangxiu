const { Material } = require('../config/database');

// 创建物料
exports.createMaterial = async (req, res) => {
  try {
    const user = req.user;
    const {
      projectId,
      name,
      category,
      quantity,
      unit,
      price,
      totalPrice,
      status,
      supplier,
      orderDate,
      deliveryDate,
      notes
    } = req.body;
    
    // 创建物料
    const material = await Material.create({
      userId: user.id,
      projectId,
      name,
      category,
      quantity,
      unit,
      price,
      totalPrice: totalPrice || (quantity * price),
      status: status || 'pending',
      supplier,
      orderDate,
      deliveryDate,
      notes
    });
    
    res.status(201).json({
      status: 'success',
      message: '物料创建成功',
      data: material
    });
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({ status: 'error', message: '物料创建失败' });
  }
};

// 获取物料列表
exports.getMaterials = async (req, res) => {
  try {
    const user = req.user;
    const { projectId } = req.query;
    
    // 构建查询条件
    const query = { userId: user.id };
    if (projectId) {
      query.projectId = projectId;
    }
    
    // 获取物料列表
    const materials = await Material.findAll({ 
      where: query,
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      status: 'success',
      data: materials
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ status: 'error', message: '获取物料列表失败' });
  }
};

// 获取物料详情
exports.getMaterialById = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    
    // 获取物料
    const material = await Material.findOne({ where: { id, userId: user.id } });
    
    if (!material) {
      return res.status(404).json({ status: 'error', message: '物料不存在' });
    }
    
    res.status(200).json({
      status: 'success',
      data: material
    });
  } catch (error) {
    console.error('Get material by id error:', error);
    res.status(500).json({ status: 'error', message: '获取物料详情失败' });
  }
};

// 更新物料
exports.updateMaterial = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const {
      projectId,
      name,
      category,
      quantity,
      unit,
      price,
      totalPrice,
      status,
      supplier,
      orderDate,
      deliveryDate,
      notes
    } = req.body;
    
    // 获取物料
    const material = await Material.findOne({ where: { id, userId: user.id } });
    
    if (!material) {
      return res.status(404).json({ status: 'error', message: '物料不存在' });
    }
    
    // 更新物料
    await material.update({
      projectId: projectId !== undefined ? projectId : material.projectId,
      name: name || material.name,
      category: category || material.category,
      quantity: quantity !== undefined ? quantity : material.quantity,
      unit: unit || material.unit,
      price: price !== undefined ? price : material.price,
      totalPrice: totalPrice !== undefined ? totalPrice : (quantity !== undefined && price !== undefined ? quantity * price : material.totalPrice),
      status: status || material.status,
      supplier: supplier !== undefined ? supplier : material.supplier,
      orderDate: orderDate !== undefined ? orderDate : material.orderDate,
      deliveryDate: deliveryDate !== undefined ? deliveryDate : material.deliveryDate,
      notes: notes !== undefined ? notes : material.notes
    });
    
    res.status(200).json({
      status: 'success',
      message: '物料更新成功',
      data: material
    });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ status: 'error', message: '物料更新失败' });
  }
};

// 删除物料
exports.deleteMaterial = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    
    // 获取物料
    const material = await Material.findOne({ where: { id, userId: user.id } });
    
    if (!material) {
      return res.status(404).json({ status: 'error', message: '物料不存在' });
    }
    
    // 删除物料
    await material.destroy();
    
    res.status(200).json({
      status: 'success',
      message: '物料删除成功'
    });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ status: 'error', message: '物料删除失败' });
  }
};