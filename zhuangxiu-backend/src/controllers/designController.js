const { Design } = require('../config/database');
const { evaluateDesignReduction } = require('../utils/llm');

// 创建设计对比
exports.createDesign = async (req, res) => {
  try {
    const user = req.user;
    const {
      projectId,
      name,
      space,
      stage,
      designImage,
      renderImage,
      actualImage,
      reductionDegree,
      colorMatch,
      sizeMatch,
      materialMatch,
      shapeMatch,
      decorationMatch,
      notes
    } = req.body;

    // 创建设计对比
    const design = await Design.create({
      userId: user.id,
      projectId,
      name,
      space,
      stage,
      designImage,
      renderImage,
      actualImage,
      reductionDegree,
      colorMatch,
      sizeMatch,
      materialMatch,
      shapeMatch,
      decorationMatch,
      notes
    });

    res.status(201).json({
      status: 'success',
      message: '设计对比创建成功',
      data: design
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '设计对比创建失败' });
  }
};

// 获取设计对比列表
exports.getDesigns = async (req, res) => {
  try {
    const user = req.user;
    const { projectId } = req.query;

    // 构建查询条件
    const query = { userId: user.id };
    if (projectId) {
      query.projectId = projectId;
    }

    // 获取设计对比列表
    const designs = await Design.findAll({ where: query });

    res.status(200).json({
      status: 'success',
      data: designs
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取设计对比列表失败' });
  }
};

// 获取设计对比详情
exports.getDesignById = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // 获取设计对比详情
    const design = await Design.findOne({ where: { id, userId: user.id } });

    if (!design) {
      return res.status(404).json({ status: 'error', message: '设计对比不存在' });
    }

    res.status(200).json({
      status: 'success',
      data: design
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取设计对比详情失败' });
  }
};

// 更新设计对比
exports.updateDesign = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const {
      name,
      space,
      stage,
      designImage,
      renderImage,
      actualImage,
      reductionDegree,
      colorMatch,
      sizeMatch,
      materialMatch,
      shapeMatch,
      decorationMatch,
      notes
    } = req.body;

    // 获取设计对比
    const design = await Design.findOne({ where: { id, userId: user.id } });

    if (!design) {
      return res.status(404).json({ status: 'error', message: '设计对比不存在' });
    }

    // 更新设计对比
    await design.update({
      name: name || design.name,
      space: space || design.space,
      stage: stage || design.stage,
      designImage: designImage || design.designImage,
      renderImage: renderImage || design.renderImage,
      actualImage: actualImage || design.actualImage,
      reductionDegree: reductionDegree || design.reductionDegree,
      colorMatch: colorMatch || design.colorMatch,
      sizeMatch: sizeMatch || design.sizeMatch,
      materialMatch: materialMatch || design.materialMatch,
      shapeMatch: shapeMatch || design.shapeMatch,
      decorationMatch: decorationMatch || design.decorationMatch,
      notes: notes || design.notes
    });

    res.status(200).json({
      status: 'success',
      message: '设计对比更新成功',
      data: design
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '设计对比更新失败' });
  }
};

// 删除设计对比
exports.deleteDesign = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // 获取设计对比
    const design = await Design.findOne({ where: { id, userId: user.id } });

    if (!design) {
      return res.status(404).json({ status: 'error', message: '设计对比不存在' });
    }

    // 删除设计对比
    await design.destroy();

    res.status(200).json({
      status: 'success',
      message: '设计对比删除成功'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '设计对比删除失败' });
  }
};

// 设计还原度智能评估
exports.evaluateReduction = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // 获取设计对比
    const design = await Design.findOne({ where: { id, userId: user.id } });

    if (!design) {
      return res.status(404).json({ status: 'error', message: '设计对比不存在' });
    }

    // 调用大模型进行评估
    const evaluationResult = await evaluateDesignReduction({
      space: design.space,
      stage: design.stage,
      notes: design.notes
    });

    // 更新设计的还原度评分
    await design.update({
      colorMatch: evaluationResult.scores.colorMatch,
      sizeMatch: evaluationResult.scores.sizeMatch,
      materialMatch: evaluationResult.scores.materialMatch,
      shapeMatch: evaluationResult.scores.shapeMatch,
      decorationMatch: evaluationResult.scores.decorationMatch,
      reductionDegree: evaluationResult.overallScore,
      notes: design.notes ? `${design.notes}\n\n评估结果：${JSON.stringify(evaluationResult)}` : JSON.stringify(evaluationResult)
    });

    res.status(200).json({
      status: 'success',
      message: '还原度评估完成',
      data: {
        design: design,
        evaluation: evaluationResult
      }
    });
  } catch (error) {
    console.error('还原度评估错误:', error);
    res.status(500).json({
      status: 'error',
      message: '还原度评估失败',
      error: error.message
    });
  }
};