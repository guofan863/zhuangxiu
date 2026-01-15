const { Contract } = require('../config/database');
const { analyzeContract } = require('../utils/llm');
const fs = require('fs');
const path = require('path');

// 创建合同
exports.createContract = async (req, res) => {
  try {
    const user = req.user;
    const {
      projectId,
      companyId,
      name,
      filePath,
      fileType,
      contractAmount,
      constructionPeriod,
      paymentSchedule,
      warrantyPeriod,
      riskAssessment,
      status,
      signingDate,
      expirationDate,
      notes
    } = req.body;

    // 创建合同
    const contract = await Contract.create({
      userId: user.id,
      projectId,
      companyId,
      name,
      filePath,
      fileType,
      contractAmount,
      constructionPeriod,
      paymentSchedule,
      warrantyPeriod,
      riskAssessment,
      status,
      signingDate,
      expirationDate,
      notes
    });

    res.status(201).json({
      status: 'success',
      message: '合同创建成功',
      data: contract
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '合同创建失败' });
  }
};

// 获取合同列表
exports.getContracts = async (req, res) => {
  try {
    const user = req.user;

    // 获取用户的所有合同
    const contracts = await Contract.findAll({ where: { userId: user.id } });

    res.status(200).json({
      status: 'success',
      data: contracts
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取合同列表失败' });
  }
};

// 获取合同详情
exports.getContractById = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // 获取合同详情
    const contract = await Contract.findOne({ where: { id, userId: user.id } });

    if (!contract) {
      return res.status(404).json({ status: 'error', message: '合同不存在' });
    }

    res.status(200).json({
      status: 'success',
      data: contract
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取合同详情失败' });
  }
};

// 更新合同
exports.updateContract = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const {
      projectId,
      companyId,
      name,
      filePath,
      fileType,
      contractAmount,
      constructionPeriod,
      paymentSchedule,
      warrantyPeriod,
      riskAssessment,
      status,
      signingDate,
      expirationDate,
      notes
    } = req.body;

    // 获取合同
    const contract = await Contract.findOne({ where: { id, userId: user.id } });

    if (!contract) {
      return res.status(404).json({ status: 'error', message: '合同不存在' });
    }

    // 更新合同
    await contract.update({
      projectId: projectId || contract.projectId,
      companyId: companyId || contract.companyId,
      name: name || contract.name,
      filePath: filePath || contract.filePath,
      fileType: fileType || contract.fileType,
      contractAmount: contractAmount || contract.contractAmount,
      constructionPeriod: constructionPeriod || contract.constructionPeriod,
      paymentSchedule: paymentSchedule || contract.paymentSchedule,
      warrantyPeriod: warrantyPeriod || contract.warrantyPeriod,
      riskAssessment: riskAssessment || contract.riskAssessment,
      status: status || contract.status,
      signingDate: signingDate || contract.signingDate,
      expirationDate: expirationDate || contract.expirationDate,
      notes: notes || contract.notes
    });

    res.status(200).json({
      status: 'success',
      message: '合同更新成功',
      data: contract
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '合同更新失败' });
  }
};

// 删除合同
exports.deleteContract = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // 获取合同
    const contract = await Contract.findOne({ where: { id, userId: user.id } });

    if (!contract) {
      return res.status(404).json({ status: 'error', message: '合同不存在' });
    }

    // 删除合同
    await contract.destroy();

    res.status(200).json({
      status: 'success',
      message: '合同删除成功'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '合同删除失败' });
  }
};

// 合同智能审核
exports.analyzeContract = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // 获取合同
    const contract = await Contract.findOne({ where: { id, userId: user.id } });

    if (!contract) {
      return res.status(404).json({ status: 'error', message: '合同不存在' });
    }

    // 读取合同文件内容（如果是文本文件）
    let contractContent = '';
    if (contract.filePath) {
      const filePath = path.join(__dirname, '../../uploads', path.basename(contract.filePath));
      if (fs.existsSync(filePath)) {
        // 如果是PDF或Word文件，这里简化处理，实际应该使用PDF解析库
        // 目前只处理文本文件
        if (contract.fileType === 'text/plain' || contract.filePath.endsWith('.txt')) {
          contractContent = fs.readFileSync(filePath, 'utf-8');
        } else {
          // 对于PDF和Word文件，提示用户需要手动输入内容
          contractContent = `合同名称：${contract.name}\n合同金额：${contract.contractAmount || '未填写'}\n工期：${contract.constructionPeriod || '未填写'}天\n付款方式：${contract.paymentSchedule || '未填写'}\n质保期限：${contract.warrantyPeriod || '未填写'}个月\n备注：${contract.notes || '无'}`;
        }
      } else {
        // 如果文件不存在，使用合同基本信息
        contractContent = `合同名称：${contract.name}\n合同金额：${contract.contractAmount || '未填写'}\n工期：${contract.constructionPeriod || '未填写'}天\n付款方式：${contract.paymentSchedule || '未填写'}\n质保期限：${contract.warrantyPeriod || '未填写'}个月\n备注：${contract.notes || '无'}`;
      }
    } else {
      // 如果没有文件，使用合同基本信息
      contractContent = `合同名称：${contract.name}\n合同金额：${contract.contractAmount || '未填写'}\n工期：${contract.constructionPeriod || '未填写'}天\n付款方式：${contract.paymentSchedule || '未填写'}\n质保期限：${contract.warrantyPeriod || '未填写'}个月\n备注：${contract.notes || '无'}`;
    }

    // 调用大模型进行审核
    const analysisResult = await analyzeContract(contractContent);

    // 更新合同的风险评估字段
    await contract.update({
      riskAssessment: JSON.stringify(analysisResult)
    });

    res.status(200).json({
      status: 'success',
      message: '合同审核完成',
      data: {
        contract: contract,
        analysis: analysisResult
      }
    });
  } catch (error) {
    console.error('合同审核错误:', error);
    res.status(500).json({
      status: 'error',
      message: '合同审核失败',
      error: error.message
    });
  }
};