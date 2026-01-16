import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Input, Select, InputNumber, message, Typography, Space, Popconfirm, Tabs, Row, Col, Alert, Divider, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { companyAPI } from '../services/api';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const CompanyComparison = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState([]);
  const [form] = Form.useForm();

  // 获取装修公司列表
  useEffect(() => {
    fetchCompanies();
  }, []);

  // 绘制对比雷达图
  useEffect(() => {
    if (companies.length > 0) {
      drawRadarChart();
    }
  }, [companies, selectedCompanyIds]);

  // 获取装修公司列表
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);

      // 使用封装的API服务获取公司列表
      const response = await companyAPI.getAll();
      setCompanies(response.data || response || []);
    } catch (error) {
      message.error('获取装修公司列表失败');
      console.error('Fetch companies error:', error);
      setError('获取装修公司列表失败，请检查网络连接');

      // 模拟数据（用于演示）
      setCompanies([
        {
          id: 1,
          name: '美家装饰',
          contactName: '张经理',
          contactPhone: '13800138001',
          qualificationLevel: '一级',
          serviceScope: '室内装修设计、施工',
          priceScore: 85,
          periodScore: 90,
          evaluationScore: 95,
          serviceScore: 92,
          qualificationScore: 98
        },
        {
          id: 2,
          name: '宜居装饰',
          contactName: '李工',
          contactPhone: '13900139001',
          qualificationLevel: '二级',
          serviceScope: '家居装修、办公室装修',
          priceScore: 90,
          periodScore: 85,
          evaluationScore: 92,
          serviceScore: 88,
          qualificationScore: 85
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 打开创建公司弹窗
  const openCreateModal = () => {
    setEditingCompany(null);
    form.resetFields();
    setVisible(true);
  };

  // 打开编辑公司弹窗
  const openEditModal = (company) => {
    setEditingCompany(company);
    form.setFieldsValue(company);
    setVisible(true);
  };

  // 关闭弹窗
  const closeModal = () => {
    setVisible(false);
    setEditingCompany(null);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError(null);

      if (editingCompany) {
        // 更新公司
        const response = await companyAPI.update(editingCompany.id, values);

        if (response.status === 'success' || response.id) {
          message.success('公司信息更新成功');
          fetchCompanies();
          closeModal();
        } else {
          message.error(response.message || '公司信息更新失败');
        }
      } else {
        // 创建公司
        const response = await companyAPI.create(values);

        if (response.status === 'success' || response.id) {
          message.success('公司信息创建成功');
          fetchCompanies();
          closeModal();
        } else {
          message.error(response.message || '公司信息创建失败');
        }
      }
    } catch (error) {
      message.error('操作失败，请检查网络');
      console.error('Submit company error:', error);
      setError('操作失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 删除公司
  const deleteCompany = async (id) => {
    try {
      setLoading(true);
      setError(null);

      // 使用封装的API服务删除公司
      const response = await companyAPI.delete(id);

      if (response.status === 'success' || response.message === '删除成功') {
        message.success('公司信息删除成功');
        fetchCompanies();
      } else {
        message.error(response.message || '公司信息删除失败');
      }
    } catch (error) {
      message.error('删除失败，请检查网络');
      console.error('Delete company error:', error);
      setError('删除失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 绘制雷达图
  const drawRadarChart = () => {
    const chartDom = document.getElementById('radarChart');
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);

    const getScore = (value, maxValue) => {
      if (value === undefined || value === null) return 0;
      if (!maxValue) return Math.min(100, Math.max(0, Number(value)));
      return Math.min(100, Math.max(0, (Number(value) / maxValue) * 100));
    };

    const normalizeBoolean = (value) => (value ? 100 : 0);

    const scoreMap = (company) => {
      const priceTransparency = Math.round((
        (company.addItemPolicy === '闭口' ? 100 : company.addItemPolicy === '5%封顶' ? 80 : 40) +
        (company.waterElectricBilling === '封顶' || company.waterElectricBilling === '包含' ? 90 : company.waterElectricBilling === '按实测' ? 30 : 60) +
        (company.taxIncluded ? 80 : 40) +
        (company.manageFeeRate ? Math.max(0, 100 - company.manageFeeRate * 5) : 60)
      ) / 4);

      const designAbility = Math.round((
        (company.designerLevel === '资深' ? 90 : company.designerLevel === '高级' ? 80 : company.designerLevel === '中级' ? 70 : 60) +
        (company.evaluationScore || 60)
      ) / 2);

      const constructionQuality = Math.round((
        getScore(company.hiddenWorkWarranty, 10) +
        normalizeBoolean(company.hasOwnWorkers) +
        normalizeBoolean(company.hasSupervision) +
        normalizeBoolean(company.hasCloudMonitoring)
      ) / 4);

      const serviceGuarantee = Math.round((
        getScore(company.warrantyPeriod, 10) +
        (company.serviceResponseHours ? Math.max(0, 100 - company.serviceResponseHours * 3) : 60) +
        (company.complaintCount !== undefined ? Math.max(0, 100 - company.complaintCount * 5) : 60)
      ) / 3);

      const enterpriseStrength = Math.round((
        getScore(company.registeredCapital, 1000) +
        getScore(company.establishedYear ? (new Date().getFullYear() - company.establishedYear) : 0, 20) +
        getScore(company.storeCount, 10)
      ) / 3);

      return {
        priceTransparency,
        designAbility,
        constructionQuality,
        serviceGuarantee,
        enterpriseStrength
      };
    };

    const selectedCompanies = companies.filter(company => selectedCompanyIds.includes(company.id));
    const radarCompanies = selectedCompanies.length > 0 ? selectedCompanies : companies;

    const indicators = [
      { name: '价格透明度', max: 100 },
      { name: '设计能力', max: 100 },
      { name: '施工质量', max: 100 },
      { name: '服务保障', max: 100 },
      { name: '企业实力', max: 100 }
    ];

    const seriesData = radarCompanies.map(company => {
      const scores = scoreMap(company);
      return {
        value: [
          scores.priceTransparency,
          scores.designAbility,
          scores.constructionQuality,
          scores.serviceGuarantee,
          scores.enterpriseStrength
        ],
        name: company.name
      };
    });

    const option = {
      title: {
        text: '装修公司五维综合能力雷达图',
        left: 'center'
      },
      tooltip: {},
      legend: {
        data: radarCompanies.map(company => company.name),
        bottom: 10
      },
      radar: {
        indicator: indicators
      },
      series: [
        {
          name: '公司对比',
          type: 'radar',
          data: seriesData
        }
      ]
    };

    myChart.setOption(option);

    // 响应式
    window.addEventListener('resize', () => {
      myChart.resize();
    });
  };

  const selectedCompanies = companies.filter(company => selectedCompanyIds.includes(company.id));

  const comparisonRows = [
    { key: 'qualification', label: '资质等级', group: '资质与硬实力', valueKey: 'qualificationLevel' },
    { key: 'establishedYear', label: '成立年限', group: '资质与硬实力', valueKey: 'establishedYear', format: (v) => v ? `${new Date().getFullYear() - v}年` : '-' },
    { key: 'registeredCapital', label: '注册资本', group: '资质与硬实力', valueKey: 'registeredCapital', format: (v) => v ? `${v}万` : '-' },
    { key: 'storeCount', label: '线下门店数', group: '资质与硬实力', valueKey: 'storeCount', format: (v) => v ?? '-' },
    { key: 'hasOwnWorkers', label: '自有工人', group: '资质与硬实力', valueKey: 'hasOwnWorkers', format: (v) => v ? '是' : '否' },
    { key: 'quotationMode', label: '报价模式', group: '报价与合同', valueKey: 'quotationMode' },
    { key: 'depositRatio', label: '首付比例', group: '报价与合同', valueKey: 'depositRatio', format: (v) => v !== undefined && v !== null ? `${v}%` : '-' },
    { key: 'addItemPolicy', label: '增项条款', group: '报价与合同', valueKey: 'addItemPolicy' },
    { key: 'waterElectricBilling', label: '水电计费', group: '报价与合同', valueKey: 'waterElectricBilling' },
    { key: 'taxIncluded', label: '税金/管理费包含', group: '报价与合同', valueKey: 'taxIncluded', format: (v) => v ? '包含' : '不包含' },
    { key: 'manageFeeRate', label: '管理费费率', group: '报价与合同', valueKey: 'manageFeeRate', format: (v) => v !== undefined && v !== null ? `${v}%` : '-' },
    { key: 'hiddenWorkWarranty', label: '隐蔽工程质保', group: '施工与工艺', valueKey: 'hiddenWorkWarranty', format: (v) => v ? `${v}年` : '-' },
    { key: 'constructionPeriod', label: '工期(天)', group: '施工与工艺', valueKey: 'constructionPeriod', format: (v) => v ?? '-' },
    { key: 'delayCompensation', label: '延期赔付', group: '施工与工艺', valueKey: 'delayCompensation' },
    { key: 'hasSupervision', label: '工地监管', group: '施工与工艺', valueKey: 'hasSupervision', format: (v) => v ? '有' : '无' },
    { key: 'hasCloudMonitoring', label: '云监工', group: '施工与工艺', valueKey: 'hasCloudMonitoring', format: (v) => v ? '有' : '无' },
    { key: 'mainMaterialBrands', label: '主材品牌', group: '材料配置', valueKey: 'mainMaterialBrands' },
    { key: 'auxMaterialBrands', label: '辅材品牌', group: '材料配置', valueKey: 'auxMaterialBrands' },
    { key: 'ecoLevel', label: '环保等级', group: '材料配置', valueKey: 'ecoLevel' },
    { key: 'designerLevel', label: '设计师水平', group: '服务与口碑', valueKey: 'designerLevel' },
    { key: 'serviceResponseHours', label: '售后响应(小时)', group: '服务与口碑', valueKey: 'serviceResponseHours', format: (v) => v ?? '-' },
    { key: 'complaintCount', label: '投诉量(近一年)', group: '服务与口碑', valueKey: 'complaintCount', format: (v) => v ?? '-' }
  ];

  const comparisonColumns = [
    {
      title: '对比维度',
      dataIndex: 'label',
      key: 'label',
      width: 180,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.group}</Text>
        </div>
      )
    },
    ...selectedCompanies.map(company => ({
      title: company.name,
      dataIndex: company.id,
      key: company.id,
      render: (value) => <span>{value}</span>
    }))
  ];

  const comparisonData = comparisonRows.map(row => {
    const rowData = { key: row.key, label: row.label, group: row.group };
    selectedCompanies.forEach(company => {
      const rawValue = company[row.valueKey];
      const formatted = row.format ? row.format(rawValue) : (rawValue ?? '-');
      rowData[company.id] = formatted;
    });
    return rowData;
  });

  const buildRiskAlerts = (company) => {
    const alerts = [];
    if (company.depositRatio >= 60) {
      alerts.push('首付比例过高，建议争取3-3-3-1付款方式');
    }
    if (company.addItemPolicy && company.addItemPolicy !== '闭口' && company.addItemPolicy !== '5%封顶') {
      alerts.push('增项条款风险较高，建议要求闭口合同或5%封顶');
    }
    if (company.waterElectricBilling === '按实测') {
      alerts.push('水电按实测可能导致后期增项，建议封顶或包含在总价内');
    }
    if (company.taxIncluded === false) {
      alerts.push('税金/管理费未包含，需明确是否额外收费');
    }
    if (company.manageFeeRate >= 10) {
      alerts.push('管理费偏高，建议进一步协商费率');
    }
    return alerts;
  };

  // 表格列配置
  const columns = [
    {
      title: '公司名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '联系人',
      dataIndex: 'contactName',
      key: 'contactName'
    },
    {
      title: '联系方式',
      dataIndex: 'contactPhone',
      key: 'contactPhone'
    },
    {
      title: '资质等级',
      dataIndex: 'qualificationLevel',
      key: 'qualificationLevel'
    },
    {
      title: '报价模式',
      dataIndex: 'quotationMode',
      key: 'quotationMode',
      render: (value) => value || '-'
    },
    {
      title: '首付比例',
      dataIndex: 'depositRatio',
      key: 'depositRatio',
      render: (value) => value !== undefined && value !== null ? `${value}%` : '-'
    },
    {
      title: '增项条款',
      dataIndex: 'addItemPolicy',
      key: 'addItemPolicy',
      render: (value) => value || '-'
    },
    {
      title: '隐蔽工程质保',
      dataIndex: 'hiddenWorkWarranty',
      key: 'hiddenWorkWarranty',
      render: (value) => value ? `${value}年` : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该公司信息吗？"
            description="删除后不可恢复"
            onConfirm={() => deleteCompany(record.id)}
            okText="确定"
            cancelText="取消"
            icon={<ExclamationCircleOutlined style={{ color: 'orange' }} />}
          >
            <Button danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="company-comparison-container" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>装修公司对比</Title>
        <Paragraph>对比不同装修公司的实力，包括价格、工期、评价等多维度分析</Paragraph>
      </div>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}

      <Tabs defaultActiveKey="list">
        <TabPane tab="公司列表" key="list">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Typography.Text strong>装修公司列表</Typography.Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              style={{ borderRadius: '8px' }}
            >
              添加装修公司
            </Button>
          </div>

          <Card
            hoverable
            style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
          >
            <Table
              columns={columns}
              dataSource={companies}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: '暂无装修公司信息' }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="对比分析" key="comparison">
          <Card
            hoverable
            style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
          >
            <div style={{ marginBottom: 16 }}>
              <Typography.Text strong>选择公司（最多3家）</Typography.Text>
              <div style={{ marginTop: 8 }}>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="请选择2-3家公司进行对比"
                  value={selectedCompanyIds}
                  onChange={(values) => setSelectedCompanyIds(values.slice(0, 3))}
                  options={companies.map(company => ({ label: company.name, value: company.id }))}
                />
              </div>
            </div>

            <Divider />

            <Row gutter={16}>
              <Col xs={24} lg={12}>
                <Card title="五维雷达评分" size="small">
                  <div id="radarChart" style={{ width: '100%', height: 420 }}></div>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="避坑预警" size="small">
                  {selectedCompanies.length === 0 && (
                    <Alert
                      type="info"
                      message="请选择公司后查看风险预警"
                      showIcon
                    />
                  )}
                  {selectedCompanies.map(company => {
                    const alerts = buildRiskAlerts(company);
                    return (
                      <Card key={company.id} size="small" style={{ marginBottom: 12 }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Typography.Text strong>{company.name}</Typography.Text>
                          {alerts.length === 0 ? (
                            <Tag color="green">暂无明显风险点</Tag>
                          ) : (
                            alerts.map((item, index) => (
                              <Alert key={index} type="warning" message={item} showIcon />
                            ))
                          )}
                        </Space>
                      </Card>
                    );
                  })}
                </Card>
              </Col>
            </Row>

            <Divider />

            <Card title="参数化对比表" size="small">
              {selectedCompanies.length < 2 ? (
                <Alert
                  type="info"
                  message="至少选择两家公司进行对比"
                  showIcon
                />
              ) : (
                <Table
                  columns={comparisonColumns}
                  dataSource={comparisonData}
                  pagination={false}
                  size="small"
                  scroll={{ x: 800 }}
                />
              )}
            </Card>
          </Card>
        </TabPane>
      </Tabs>

      {/* 创建/编辑公司弹窗 */}
      <Modal
        title={editingCompany ? '编辑装修公司' : '添加装修公司'}
        open={visible}
        onCancel={closeModal}
        footer={null}
        width={800}
        style={{
          borderRadius: '8px'
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="公司名称"
                rules={[{ required: true, message: '请输入公司名称' }]}
              >
                <Input placeholder="请输入公司名称" size="large" style={{ borderRadius: '8px' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="qualificationLevel"
                label="资质等级"
                rules={[{ required: true, message: '请选择资质等级' }]}
              >
                <Select placeholder="请选择资质等级" size="large" style={{ width: '100%', borderRadius: '8px' }}>
                  <Option value="一级">一级</Option>
                  <Option value="二级">二级</Option>
                  <Option value="三级">三级</Option>
                  <Option value="无">无</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contactName"
                label="联系人"
                rules={[{ required: true, message: '请输入联系人' }]}
              >
                <Input placeholder="请输入联系人" size="large" style={{ borderRadius: '8px' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contactPhone"
                label="联系方式"
                rules={[{ required: true, message: '请输入联系方式' }]}
              >
                <Input placeholder="请输入联系方式" size="large" style={{ borderRadius: '8px' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="serviceScope"
            label="服务范围"
            rules={[{ required: true, message: '请输入服务范围' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入服务范围" size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Divider />
          <Typography.Title level={4} style={{ marginBottom: 16 }}>资质与硬实力</Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="registeredCapital" label="注册资本(万)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="例如：500" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="establishedYear" label="成立年份">
                <InputNumber min={1980} max={new Date().getFullYear()} style={{ width: '100%' }} placeholder="例如：2012" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="storeCount" label="线下门店数">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hasOwnWorkers" label="是否自有工人">
                <Select placeholder="请选择">
                  <Option value={true}>是</Option>
                  <Option value={false}>否</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Typography.Title level={4} style={{ marginBottom: 16 }}>报价与合同</Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="quotationMode" label="报价模式">
                <Select placeholder="请选择">
                  <Option value="全包">全包</Option>
                  <Option value="半包">半包</Option>
                  <Option value="清包">清包</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="depositRatio" label="首付比例(%)">
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="addItemPolicy" label="增项条款">
                <Select placeholder="请选择">
                  <Option value="闭口">闭口合同</Option>
                  <Option value="5%封顶">5%封顶</Option>
                  <Option value="无承诺">无承诺</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="waterElectricBilling" label="水电计费">
                <Select placeholder="请选择">
                  <Option value="包含">包含在总价</Option>
                  <Option value="封顶">封顶</Option>
                  <Option value="按实测">按米实测</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="taxIncluded" label="税金/管理费包含">
                <Select placeholder="请选择">
                  <Option value={true}>包含</Option>
                  <Option value={false}>不包含</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="manageFeeRate" label="管理费费率(%)">
                <InputNumber min={0} max={30} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Typography.Title level={4} style={{ marginBottom: 16 }}>施工与工艺</Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="hiddenWorkWarranty" label="隐蔽工程质保(年)">
                <InputNumber min={0} max={20} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="constructionPeriod" label="工期(天)">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="delayCompensation" label="延期赔付标准">
                <Input placeholder="例如：延期一天赔付200元" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hasSupervision" label="是否监理">
                <Select placeholder="请选择">
                  <Option value={true}>有</Option>
                  <Option value={false}>无</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="hasCloudMonitoring" label="是否云监工">
                <Select placeholder="请选择">
                  <Option value={true}>有</Option>
                  <Option value={false}>无</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="processStandard" label="工艺标准">
                <Input placeholder="例如：墙面找平标准/防水高度" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Typography.Title level={4} style={{ marginBottom: 16 }}>材料配置</Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="mainMaterialBrands" label="主材品牌">
                <Input placeholder="例如：马可波罗/箭牌/东鹏" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="auxMaterialBrands" label="辅材品牌">
                <Input placeholder="例如：伟星/日丰/立邦" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="ecoLevel" label="环保等级">
                <Select placeholder="请选择">
                  <Option value="E1">E1</Option>
                  <Option value="E0">E0</Option>
                  <Option value="ENF">ENF</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Typography.Title level={4} style={{ marginBottom: 16 }}>服务与口碑</Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="designerLevel" label="设计师水平">
                <Select placeholder="请选择">
                  <Option value="资深">资深</Option>
                  <Option value="高级">高级</Option>
                  <Option value="中级">中级</Option>
                  <Option value="初级">初级</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="serviceResponseHours" label="售后响应(小时)">
                <InputNumber min={1} max={168} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="complaintCount" label="近一年投诉量">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Typography.Title level={4} style={{ marginBottom: 16 }}>评分信息</Typography.Title>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="priceScore"
                label="价格评分"
                rules={[{ required: true, message: '请输入价格评分' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%', borderRadius: '8px' }} placeholder="0-100" size="large" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="periodScore"
                label="工期评分"
                rules={[{ required: true, message: '请输入工期评分' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%', borderRadius: '8px' }} placeholder="0-100" size="large" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="evaluationScore"
                label="评价评分"
                rules={[{ required: true, message: '请输入评价评分' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%', borderRadius: '8px' }} placeholder="0-100" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="serviceScore"
                label="服务评分"
                rules={[{ required: true, message: '请输入服务评分' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%', borderRadius: '8px' }} placeholder="0-100" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="qualificationScore"
                label="资质评分"
                rules={[{ required: true, message: '请输入资质评分' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%', borderRadius: '8px' }} placeholder="0-100" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button
                onClick={closeModal}
                size="large"
                style={{ borderRadius: '8px' }}
              >
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{ borderRadius: '8px' }}
              >
                {editingCompany ? '更新' : '创建'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};



export default CompanyComparison;