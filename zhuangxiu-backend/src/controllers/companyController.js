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
      registeredCapital,
      establishedYear,
      storeCount,
      hasOwnWorkers,
      caseCount,
      quotationMode,
      depositRatio,
      addItemPolicy,
      waterElectricBilling,
      taxIncluded,
      manageFeeRate,
      price,
      unitPrice,
      paymentMethod,
      constructionPeriod,
      delayCompensation,
      hiddenWorkWarranty,
      warrantyPeriod,
      hasSupervision,
      supervisionType,
      hasCloudMonitoring,
      processStandard,
      mainMaterialBrands,
      auxMaterialBrands,
      ecoLevel,
      designerLevel,
      serviceResponseHours,
      complaintCount,
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
      registeredCapital,
      establishedYear,
      storeCount,
      hasOwnWorkers,
      caseCount,
      quotationMode,
      depositRatio,
      addItemPolicy,
      waterElectricBilling,
      taxIncluded,
      manageFeeRate,
      price,
      unitPrice,
      paymentMethod,
      constructionPeriod,
      delayCompensation,
      hiddenWorkWarranty,
      warrantyPeriod,
      hasSupervision,
      supervisionType,
      hasCloudMonitoring,
      processStandard,
      mainMaterialBrands,
      auxMaterialBrands,
      ecoLevel,
      designerLevel,
      serviceResponseHours,
      complaintCount,
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

    // 检查用户对象
    if (!user || !user.id) {
      console.error('用户信息不完整:', user);
      return res.status(400).json({ 
        status: 'error', 
        message: '用户信息不完整' 
      });
    }

    console.log('获取用户ID为', user.id, '的装修公司列表');

    // 获取用户的所有装修公司
    const companies = await Company.findAll({ where: { userId: user.id } });
    
    console.log('查询到', companies.length, '个装修公司');

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
      qualificationScore: company.qualificationScore,
      registeredCapital: company.registeredCapital,
      establishedYear: company.establishedYear,
      storeCount: company.storeCount,
      hasOwnWorkers: company.hasOwnWorkers,
      caseCount: company.caseCount,
      quotationMode: company.quotationMode,
      depositRatio: company.depositRatio,
      addItemPolicy: company.addItemPolicy,
      waterElectricBilling: company.waterElectricBilling,
      taxIncluded: company.taxIncluded,
      manageFeeRate: company.manageFeeRate,
      price: company.price,
      unitPrice: company.unitPrice,
      paymentMethod: company.paymentMethod,
      constructionPeriod: company.constructionPeriod,
      delayCompensation: company.delayCompensation,
      hiddenWorkWarranty: company.hiddenWorkWarranty,
      warrantyPeriod: company.warrantyPeriod,
      hasSupervision: company.hasSupervision,
      supervisionType: company.supervisionType,
      hasCloudMonitoring: company.hasCloudMonitoring,
      processStandard: company.processStandard,
      mainMaterialBrands: company.mainMaterialBrands,
      auxMaterialBrands: company.auxMaterialBrands,
      ecoLevel: company.ecoLevel,
      designerLevel: company.designerLevel,
      serviceResponseHours: company.serviceResponseHours,
      complaintCount: company.complaintCount,
      evaluation: company.evaluation,
      notes: company.notes
    }));

    res.status(200).json({
      status: 'success',
      data: formattedCompanies
    });
  } catch (error) {
    console.error('获取装修公司列表失败:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ 
      status: 'error', 
      message: '获取装修公司列表失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
      qualificationScore: company.qualificationScore,
      registeredCapital: company.registeredCapital,
      establishedYear: company.establishedYear,
      storeCount: company.storeCount,
      hasOwnWorkers: company.hasOwnWorkers,
      caseCount: company.caseCount,
      quotationMode: company.quotationMode,
      depositRatio: company.depositRatio,
      addItemPolicy: company.addItemPolicy,
      waterElectricBilling: company.waterElectricBilling,
      taxIncluded: company.taxIncluded,
      manageFeeRate: company.manageFeeRate,
      price: company.price,
      unitPrice: company.unitPrice,
      paymentMethod: company.paymentMethod,
      constructionPeriod: company.constructionPeriod,
      delayCompensation: company.delayCompensation,
      hiddenWorkWarranty: company.hiddenWorkWarranty,
      warrantyPeriod: company.warrantyPeriod,
      hasSupervision: company.hasSupervision,
      supervisionType: company.supervisionType,
      hasCloudMonitoring: company.hasCloudMonitoring,
      processStandard: company.processStandard,
      mainMaterialBrands: company.mainMaterialBrands,
      auxMaterialBrands: company.auxMaterialBrands,
      ecoLevel: company.ecoLevel,
      designerLevel: company.designerLevel,
      serviceResponseHours: company.serviceResponseHours,
      complaintCount: company.complaintCount,
      evaluation: company.evaluation,
      notes: company.notes
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
      registeredCapital,
      establishedYear,
      storeCount,
      hasOwnWorkers,
      caseCount,
      quotationMode,
      depositRatio,
      addItemPolicy,
      waterElectricBilling,
      taxIncluded,
      manageFeeRate,
      price,
      unitPrice,
      paymentMethod,
      constructionPeriod,
      delayCompensation,
      hiddenWorkWarranty,
      warrantyPeriod,
      hasSupervision,
      supervisionType,
      hasCloudMonitoring,
      processStandard,
      mainMaterialBrands,
      auxMaterialBrands,
      ecoLevel,
      designerLevel,
      serviceResponseHours,
      complaintCount,
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
      registeredCapital: registeredCapital !== undefined ? registeredCapital : company.registeredCapital,
      establishedYear: establishedYear !== undefined ? establishedYear : company.establishedYear,
      storeCount: storeCount !== undefined ? storeCount : company.storeCount,
      hasOwnWorkers: hasOwnWorkers !== undefined ? hasOwnWorkers : company.hasOwnWorkers,
      caseCount: caseCount !== undefined ? caseCount : company.caseCount,
      quotationMode: quotationMode !== undefined ? quotationMode : company.quotationMode,
      depositRatio: depositRatio !== undefined ? depositRatio : company.depositRatio,
      addItemPolicy: addItemPolicy !== undefined ? addItemPolicy : company.addItemPolicy,
      waterElectricBilling: waterElectricBilling !== undefined ? waterElectricBilling : company.waterElectricBilling,
      taxIncluded: taxIncluded !== undefined ? taxIncluded : company.taxIncluded,
      manageFeeRate: manageFeeRate !== undefined ? manageFeeRate : company.manageFeeRate,
      price: price !== undefined ? price : company.price,
      unitPrice: unitPrice !== undefined ? unitPrice : company.unitPrice,
      paymentMethod: paymentMethod !== undefined ? paymentMethod : company.paymentMethod,
      constructionPeriod: constructionPeriod !== undefined ? constructionPeriod : company.constructionPeriod,
      delayCompensation: delayCompensation !== undefined ? delayCompensation : company.delayCompensation,
      hiddenWorkWarranty: hiddenWorkWarranty !== undefined ? hiddenWorkWarranty : company.hiddenWorkWarranty,
      warrantyPeriod: warrantyPeriod !== undefined ? warrantyPeriod : company.warrantyPeriod,
      hasSupervision: hasSupervision !== undefined ? hasSupervision : company.hasSupervision,
      supervisionType: supervisionType !== undefined ? supervisionType : company.supervisionType,
      hasCloudMonitoring: hasCloudMonitoring !== undefined ? hasCloudMonitoring : company.hasCloudMonitoring,
      processStandard: processStandard !== undefined ? processStandard : company.processStandard,
      mainMaterialBrands: mainMaterialBrands !== undefined ? mainMaterialBrands : company.mainMaterialBrands,
      auxMaterialBrands: auxMaterialBrands !== undefined ? auxMaterialBrands : company.auxMaterialBrands,
      ecoLevel: ecoLevel !== undefined ? ecoLevel : company.ecoLevel,
      designerLevel: designerLevel !== undefined ? designerLevel : company.designerLevel,
      serviceResponseHours: serviceResponseHours !== undefined ? serviceResponseHours : company.serviceResponseHours,
      complaintCount: complaintCount !== undefined ? complaintCount : company.complaintCount,
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