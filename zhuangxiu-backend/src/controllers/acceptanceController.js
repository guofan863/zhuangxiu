const { Acceptance } = require('../config/database');

// 创建验收记录
exports.createAcceptance = async (req, res) => {
  try {
    const user = req.user;
    const {
      projectId,
      stage,
      name,
      description,
      expectedStandard,
      actualCondition,
      passStatus,
      inspectionDate,
      inspector,
      issues,
      rectificationDeadline,
      images,
      notes
    } = req.body;
    
    // 创建验收记录
    const acceptance = await Acceptance.create({
      userId: user.id,
      projectId,
      stage,
      name,
      description,
      expectedStandard,
      actualCondition,
      passStatus,
      inspectionDate,
      inspector,
      issues,
      rectificationDeadline,
      images,
      notes
    });
    
    res.status(201).json({
      status: 'success',
      message: '验收记录创建成功',
      data: acceptance
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '验收记录创建失败' });
  }
};

// 获取验收记录列表
exports.getAcceptances = async (req, res) => {
  try {
    const user = req.user;
    const { projectId, stage, passStatus } = req.query;
    
    // 构建查询条件
    const query = { userId: user.id };
    if (projectId) {
      query.projectId = projectId;
    }
    if (stage) {
      query.stage = stage;
    }
    if (passStatus !== undefined) {
      query.passStatus = passStatus;
    }
    
    // 获取验收记录列表
    const acceptances = await Acceptance.findAll({ where: query });
    
    res.status(200).json({
      status: 'success',
      data: acceptances
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取验收记录列表失败' });
  }
};

// 获取验收记录详情
exports.getAcceptanceById = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    
    // 获取验收记录详情
    const acceptance = await Acceptance.findOne({ where: { id, userId: user.id } });
    
    if (!acceptance) {
      return res.status(404).json({ status: 'error', message: '验收记录不存在' });
    }
    
    res.status(200).json({
      status: 'success',
      data: acceptance
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取验收记录详情失败' });
  }
};

// 更新验收记录
exports.updateAcceptance = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const {
      stage,
      name,
      description,
      expectedStandard,
      actualCondition,
      passStatus,
      inspectionDate,
      inspector,
      issues,
      rectificationDeadline,
      images,
      notes
    } = req.body;
    
    // 获取验收记录
    const acceptance = await Acceptance.findOne({ where: { id, userId: user.id } });
    
    if (!acceptance) {
      return res.status(404).json({ status: 'error', message: '验收记录不存在' });
    }
    
    // 更新验收记录
    await acceptance.update({
      stage: stage || acceptance.stage,
      name: name || acceptance.name,
      description: description || acceptance.description,
      expectedStandard: expectedStandard || acceptance.expectedStandard,
      actualCondition: actualCondition || acceptance.actualCondition,
      passStatus: passStatus !== undefined ? passStatus : acceptance.passStatus,
      inspectionDate: inspectionDate || acceptance.inspectionDate,
      inspector: inspector || acceptance.inspector,
      issues: issues || acceptance.issues,
      rectificationDeadline: rectificationDeadline || acceptance.rectificationDeadline,
      images: images || acceptance.images,
      notes: notes || acceptance.notes
    });
    
    res.status(200).json({
      status: 'success',
      message: '验收记录更新成功',
      data: acceptance
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '验收记录更新失败' });
  }
};

// 删除验收记录
exports.deleteAcceptance = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    
    // 获取验收记录
    const acceptance = await Acceptance.findOne({ where: { id, userId: user.id } });
    
    if (!acceptance) {
      return res.status(404).json({ status: 'error', message: '验收记录不存在' });
    }
    
    // 删除验收记录
    await acceptance.destroy();
    
    res.status(200).json({
      status: 'success',
      message: '验收记录删除成功'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '验收记录删除失败' });
  }
};