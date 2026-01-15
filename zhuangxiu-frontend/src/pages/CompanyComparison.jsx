import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Input, Select, InputNumber, message, Typography, Space, Popconfirm, Tabs, Row, Col, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { companyAPI } from '../services/api';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const CompanyComparison = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [error, setError] = useState(null);
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
  }, [companies]);

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

    // 准备雷达图数据
    const indicators = [
      { name: '价格', max: 100 },
      { name: '工期', max: 100 },
      { name: '评价', max: 100 },
      { name: '服务', max: 100 },
      { name: '资质', max: 100 }
    ];

    const seriesData = companies.map(company => ({
      value: [
        company.priceScore || 50,
        company.periodScore || 50,
        company.evaluationScore || 50,
        company.serviceScore || 50,
        company.qualificationScore || 50
      ],
      name: company.name
    }));

    const option = {
      title: {
        text: '装修公司综合实力对比',
        left: 'center'
      },
      tooltip: {},
      legend: {
        data: companies.map(company => company.name),
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
      title: '服务范围',
      dataIndex: 'serviceScope',
      key: 'serviceScope'
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
            <div id="radarChart" style={{ width: '100%', height: 500 }}></div>
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