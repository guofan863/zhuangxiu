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

    // 调用大模型生成预算
    const budgetResult = await generateBudget({
      houseType,
      area: parseFloat(area),
      style,
      city,
      level
    });

    res.status(200).json({
      status: 'success',
      message: '预算生成成功',
      data: budgetResult
    });
  } catch (error) {
    console.error('预算生成错误:', error);
    res.status(500).json({
      status: 'error',
      message: '预算生成失败',
      error: error.message
    });
  }
};
