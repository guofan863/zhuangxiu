const { generateBudget } = require('../utils/llm');

// 智能预算生成
exports.generateBudget = async (req, res) => {
  try {
    const { houseType, area, style, city, level } = req.body;

    // 验证参数
    if (!houseType || !area || !style || !city || !level) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要参数：houseType, area, style, city, level'
      });
    }

    // 验证面积为正数
    const areaNum = parseFloat(area);
    if (isNaN(areaNum) || areaNum <= 0) {
      return res.status(400).json({
        status: 'error',
        message: '面积必须为正数'
      });
    }

    console.log('开始生成预算:', { houseType, area: areaNum, style, city, level });

    // 调用生成预算（会自动使用备用方案如果LLM不可用）
    const budgetResult = await generateBudget({
      houseType,
      area: areaNum,
      style,
      city,
      level
    });

    const message = budgetResult.source === 'llm' 
      ? '预算生成成功（AI智能生成）' 
      : '预算生成成功（使用备用计算方案）';

    res.status(200).json({
      status: 'success',
      message: message,
      data: budgetResult
    });
  } catch (error) {
    console.error('预算生成错误:', error);
    res.status(500).json({
      status: 'error',
      message: '预算生成失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
