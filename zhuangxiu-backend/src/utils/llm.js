const axios = require('axios');

// 大模型API配置
const LLM_API_URL = process.env.LLM_API_URL || 'http://127.0.0.1:1234/v1/chat/completions';
const LLM_MODEL = process.env.LLM_MODEL || 'local-model';
const LLM_TIMEOUT = 30000; // 30秒超时

/**
 * 调用大模型API
 * @param {string} prompt - 提示词
 * @param {object} options - 额外选项
 * @returns {Promise<string>} 大模型的回复
 */
async function callLLM(prompt, options = {}) {
  try {
    const response = await axios.post(
      LLM_API_URL,
      {
        model: LLM_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000,
        stream: false
      },
      {
        timeout: LLM_TIMEOUT,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('大模型返回数据格式错误');
    }
  } catch (error) {
    console.error('调用大模型API失败:', error.message);
    throw error;
  }
}

/**
 * 合同智能审核
 * @param {string} contractContent - 合同内容（文本）
 * @returns {Promise<object>} 审核结果
 */
async function analyzeContract(contractContent) {
  const prompt = `你是一个专业的合同审核专家。请仔细分析以下装修合同内容，识别潜在风险和问题。

合同内容：
${contractContent}

请从以下维度进行分析：
1. 风险识别：识别霸王条款（如单方面解约高额违约金、增项无明确定价等）、模糊条款（如"优质材料"无具体标准）、风险点（如质保期限过短、付款节点不合理等）
2. 内容解析：提取合同核心信息（装修公司信息、合同金额、工期、付款节点、质保范围、双方权责）
3. 建议输出：针对识别到的风险点，给出具体的修改建议和注意事项

请以JSON格式返回结果，格式如下：
{
  "risks": [
    {
      "type": "霸王条款/模糊条款/风险点",
      "content": "具体的风险内容",
      "severity": "high/medium/low",
      "suggestion": "修改建议"
    }
  ],
  "summary": {
    "companyName": "装修公司名称",
    "contractAmount": "合同金额",
    "constructionPeriod": "工期",
    "paymentSchedule": "付款节点",
    "warrantyPeriod": "质保期限",
    "responsibilities": "双方权责"
  },
  "suggestions": [
    "具体的修改建议1",
    "具体的修改建议2"
  ]
}`;

  try {
    const response = await callLLM(prompt, { max_tokens: 3000 });

    // 尝试解析JSON响应
    let result;
    try {
      // 提取JSON部分（如果响应中包含其他文本）
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(response);
      }
    } catch (parseError) {
      // 如果解析失败，返回结构化的文本响应
      result = {
        risks: [],
        summary: {
          note: response
        },
        suggestions: []
      };
    }

    return result;
  } catch (error) {
    console.error('合同审核失败:', error);
    throw error;
  }
}

/**
 * 设计图还原度评估
 * @param {object} designInfo - 设计信息
 * @returns {Promise<object>} 评估结果
 */
async function evaluateDesignReduction(designInfo) {
  const prompt = `你是一个专业的装修设计评估专家。请评估以下装修设计的还原度。

设计信息：
- 空间：${designInfo.space || '未知'}
- 阶段：${designInfo.stage || '未知'}
- 设计说明：${designInfo.notes || '无'}

请从以下5个维度进行分析和评分（0-100分）：
1. 色彩匹配度：评估实际效果与设计图/效果图的色彩一致性
2. 尺寸比例：评估实际尺寸与设计比例的匹配度
3. 材质一致性：评估实际使用的材质与设计要求的材质是否一致
4. 造型还原度：评估实际造型与设计图的一致性
5. 软装摆放：评估软装摆放位置、风格与设计图的一致性

请以JSON格式返回结果，格式如下：
{
  "scores": {
    "colorMatch": 85,
    "sizeMatch": 90,
    "materialMatch": 80,
    "shapeMatch": 88,
    "decorationMatch": 82
  },
  "overallScore": 85,
  "differences": [
    {
      "aspect": "色彩",
      "description": "窗帘颜色与效果图略有差异",
      "suggestion": "建议调整窗帘颜色，与效果图一致"
    }
  ],
  "strengths": [
    "吊顶造型还原度较高",
    "整体风格与设计图一致"
  ],
  "improvements": [
    "建议调整窗帘颜色",
    "可以优化软装摆放位置"
  ]
}`;

  try {
    const response = await callLLM(prompt, { max_tokens: 2000 });

    // 尝试解析JSON响应
    let result;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(response);
      }
    } catch (parseError) {
      // 如果解析失败，返回默认评分
      result = {
        scores: {
          colorMatch: 75,
          sizeMatch: 75,
          materialMatch: 75,
          shapeMatch: 75,
          decorationMatch: 75
        },
        overallScore: 75,
        differences: [],
        strengths: [],
        improvements: []
      };
    }

    return result;
  } catch (error) {
    console.error('设计还原度评估失败:', error);
    throw error;
  }
}

/**
 * 智能预算生成
 * @param {object} budgetParams - 预算参数
 * @returns {Promise<object>} 预算结果
 */
async function generateBudget(budgetParams) {
  const { houseType, area, style, city, level } = budgetParams;

  const prompt = `你是一个专业的装修预算评估专家。请根据以下信息生成一份详细的装修预算。

装修需求：
- 户型：${houseType}
- 面积：${area}平方米
- 装修风格：${style}
- 所在城市：${city}
- 装修档次：${level}

请综合考虑：
1. 当地建材市场价格
2. 人工成本
3. 装修档次差异
4. 装修风格对成本的影响
5. 行业标准

请以JSON格式返回详细的预算拆分，格式如下：
{
  "totalBudget": 150000,
  "breakdown": {
    "labor": {
      "amount": 45000,
      "percentage": 30,
      "items": ["水电工", "泥瓦工", "木工", "油漆工"]
    },
    "materials": {
      "amount": 60000,
      "percentage": 40,
      "items": ["瓷砖", "地板", "涂料", "门窗"]
    },
    "design": {
      "amount": 15000,
      "percentage": 10,
      "items": ["设计费", "效果图"]
    },
    "other": {
      "amount": 30000,
      "percentage": 20,
      "items": ["管理费", "杂费"]
    }
  },
  "recommendations": [
    "建议预留10-15%的弹性预算",
    "材料费用可根据实际需求调整"
  ],
  "warning": "此预算为参考值，实际费用可能因市场波动有所不同"
}`;

  try {
    const response = await callLLM(prompt, { max_tokens: 2000 });

    // 尝试解析JSON响应
    let result;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(response);
      }
    } catch (parseError) {
      // 如果解析失败，使用默认计算逻辑
      let basePrice = 0;
      switch (level) {
        case 'simple':
          basePrice = 500;
          break;
        case 'standard':
          basePrice = 1000;
          break;
        case 'luxury':
          basePrice = 2000;
          break;
        default:
          basePrice = 1000;
      }

      let styleFactor = 1;
      switch (style) {
        case 'modern':
          styleFactor = 1;
          break;
        case 'chinese':
          styleFactor = 1.2;
          break;
        case 'european':
          styleFactor = 1.3;
          break;
        case 'minimalist':
          styleFactor = 0.9;
          break;
        default:
          styleFactor = 1;
      }

      const totalBudget = area * basePrice * styleFactor;
      result = {
        totalBudget,
        breakdown: {
          labor: {
            amount: totalBudget * 0.3,
            percentage: 30,
            items: ['水电工', '泥瓦工', '木工', '油漆工']
          },
          materials: {
            amount: totalBudget * 0.4,
            percentage: 40,
            items: ['瓷砖', '地板', '涂料', '门窗']
          },
          design: {
            amount: totalBudget * 0.1,
            percentage: 10,
            items: ['设计费', '效果图']
          },
          other: {
            amount: totalBudget * 0.2,
            percentage: 20,
            items: ['管理费', '杂费']
          }
        },
        recommendations: [
          '建议预留10-15%的弹性预算',
          '材料费用可根据实际需求调整'
        ],
        warning: '此预算为参考值，实际费用可能因市场波动有所不同'
      };
    }

    return result;
  } catch (error) {
    console.error('预算生成失败:', error);
    throw error;
  }
}

module.exports = {
  callLLM,
  analyzeContract,
  evaluateDesignReduction,
  generateBudget
};
