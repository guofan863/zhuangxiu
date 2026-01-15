const { Company } = require('../config/database');

// 创建装修公司
exports.createCompany = async (req, res) => {
  try {
    const user = req.user;
    const {
      name,
      contactName,
      contactPhone,
      address,
      qualificationLevel,
      serviceScope,
      priceScore,
      periodScore,
      evaluationScore,
      serviceScore,
      qualificationScore,
      establishedYear,
      caseCount,
      price,
      unitPrice,
      paymentMethod,
      constructionPeriod,
      warrantyPeriod,
      hasSupervision,
      evaluation,
      notes
    } = req.body;

    // 转换前端字段到后端字段
    const companyData = {
      userId: user.id,
      name,
      contactPerson: contactName,
      phone: contactPhone,
      address: address || '',
      qualification: qualificationLevel,
      serviceScope,
      priceScore,
      periodScore,
      evaluationScore,
      serviceScore,
      qualificationScore,
      establishedYear,
      caseCount,
      price,
      unitPrice,
      paymentMethod,
      constructionPeriod,
      warrantyPeriod,
      hasSupervision,
      evaluation,
      notes
    };

    // 创建装修公司
    const company = await Company.create(companyData);

    res.status(201).json({
      status: 'success',
      message: '装修公司创建成功',
      data: company
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '装修公司创建失败' });
  }
};

// 获取装修公司列表
exports.getCompanies = async (req, res) => {
  try {
    const user = req.user;

    // 获取用户的所有装修公司
    const companies = await Company.findAll({ where: { userId: user.id } });

    // 转换后端字段到前端字段
    const formattedCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      contactName: company.contactPerson,
      contactPhone: company.phone,
      qualificationLevel: company.qualification,
      serviceScope: company.serviceScope,
      priceScore: company.priceScore,
      periodScore: company.periodScore,
      evaluationScore: company.evaluationScore,
      serviceScore: company.serviceScore,
      qualificationScore: company.qualificationScore
    }));

    res.status(200).json({
      status: 'success',
      data: formattedCompanies
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取装修公司列表失败' });
  }
};

// 获取装修公司详情
exports.getCompanyById = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // 获取装修公司详情
    const company = await Company.findOne({ where: { id, userId: user.id } });

    if (!company) {
      return res.status(404).json({ status: 'error', message: '装修公司不存在' });
    }

    // 转换后端字段到前端字段
    const formattedCompany = {
      id: company.id,
      name: company.name,
      contactName: company.contactPerson,
      contactPhone: company.phone,
      qualificationLevel: company.qualification,
      serviceScope: company.serviceScope,
      priceScore: company.priceScore,
      periodScore: company.periodScore,
      evaluationScore: company.evaluationScore,
      serviceScore: company.serviceScore,
      qualificationScore: company.qualificationScore
    };

    res.status(200).json({
      status: 'success',
      data: formattedCompany
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '获取装修公司详情失败' });
  }
};

// 更新装修公司
exports.updateCompany = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const {
      name,
      contactName,
      contactPhone,
      address,
      qualificationLevel,
      serviceScope,
      priceScore,
      periodScore,
      evaluationScore,
      serviceScore,
      qualificationScore,
      establishedYear,
      caseCount,
      price,
      unitPrice,
      paymentMethod,
      constructionPeriod,
      warrantyPeriod,
      hasSupervision,
      evaluation,
      notes,
      isFavorite
    } = req.body;

    // 获取装修公司
    const company = await Company.findOne({ where: { id, userId: user.id } });

    if (!company) {
      return res.status(404).json({ status: 'error', message: '装修公司不存在' });
    }

    // 转换前端字段到后端字段并更新
    await company.update({
      name: name || company.name,
      contactPerson: contactName || company.contactPerson,
      phone: contactPhone || company.phone,
      address: address !== undefined ? address : company.address,
      qualification: qualificationLevel || company.qualification,
      serviceScope: serviceScope || company.serviceScope,
      priceScore: priceScore !== undefined ? priceScore : company.priceScore,
      periodScore: periodScore !== undefined ? periodScore : company.periodScore,
      evaluationScore: evaluationScore !== undefined ? evaluationScore : company.evaluationScore,
      serviceScore: serviceScore !== undefined ? serviceScore : company.serviceScore,
      qualificationScore: qualificationScore !== undefined ? qualificationScore : company.qualificationScore,
      establishedYear: establishedYear !== undefined ? establishedYear : company.establishedYear,
      caseCount: caseCount !== undefined ? caseCount : company.caseCount,
      price: price !== undefined ? price : company.price,
      unitPrice: unitPrice !== undefined ? unitPrice : company.unitPrice,
      paymentMethod: paymentMethod !== undefined ? paymentMethod : company.paymentMethod,
      constructionPeriod: constructionPeriod !== undefined ? constructionPeriod : company.constructionPeriod,
      warrantyPeriod: warrantyPeriod !== undefined ? warrantyPeriod : company.warrantyPeriod,
      hasSupervision: hasSupervision !== undefined ? hasSupervision : company.hasSupervision,
      evaluation: evaluation !== undefined ? evaluation : company.evaluation,
      notes: notes !== undefined ? notes : company.notes,
      isFavorite: isFavorite !== undefined ? isFavorite : company.isFavorite
    });

    res.status(200).json({
      status: 'success',
      message: '装修公司更新成功',
      data: company
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '装修公司更新失败' });
  }
};

// 删除装修公司
exports.deleteCompany = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // 获取装修公司
    const company = await Company.findOne({ where: { id, userId: user.id } });

    if (!company) {
      return res.status(404).json({ status: 'error', message: '装修公司不存在' });
    }

    // 删除装修公司
    await company.destroy();

    res.status(200).json({
      status: 'success',
      message: '装修公司删除成功'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '装修公司删除失败' });
  }
};

// 标记为收藏
exports.toggleFavorite = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // 获取装修公司
    const company = await Company.findOne({ where: { id, userId: user.id } });

    if (!company) {
      return res.status(404).json({ status: 'error', message: '装修公司不存在' });
    }

    // 切换收藏状态
    await company.update({ isFavorite: !company.isFavorite });

    res.status(200).json({
      status: 'success',
      message: company.isFavorite ? '标记收藏成功' : '取消收藏成功',
      data: company
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '操作失败' });
  }
};