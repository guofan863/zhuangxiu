import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Table, Modal, Form, Input, Select, InputNumber, DatePicker, message, Typography, Space, Popconfirm, Tabs, Row, Col, Alert, Statistic, Progress, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, DollarOutlined, BarChartOutlined, AlertOutlined, DownloadOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { constructionAPI, projectAPI } from '../services/api';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const BudgetManagement = () => {
  const [costs, setCosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingCost, setEditingCost] = useState(null);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();
  const [budget, setBudget] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetForm] = Form.useForm();
  const chartRef = useRef(null);
  const reportRef = useRef(null);

  // 初始化数据
  useEffect(() => {
    fetchData();
  }, []);

  // 绘制费用统计图表
  useEffect(() => {
    if (costs.length > 0 && chartRef.current) {
      drawCostChart();
    }
  }, [costs, selectedProject]);

  // 获取数据
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 使用封装的API服务获取数据
      const [costData, projectData] = await Promise.all([
        constructionAPI.getCosts(),
        fetchProjects()
      ]);

      // 处理数据，确保都是数组
      setCosts(Array.isArray(costData.data || costData) ? (costData.data || costData) : []);
      setProjects(Array.isArray(projectData) ? projectData : []);
    } catch (error) {
      message.error('获取数据失败');
      console.error('Fetch data error:', error);
      setError('获取数据失败，请检查网络连接');

      // 发生错误时使用模拟数据
      setCosts([
        { id: 1, projectId: 1, category: '材料', subcategory: '瓷砖', amount: 15000, paymentDate: '2024-01-01', paymentMethod: '微信', description: '客厅瓷砖', status: 'completed' },
        { id: 2, projectId: 1, category: '人工', subcategory: '水电', amount: 10000, paymentDate: '2024-01-05', paymentMethod: '支付宝', description: '水电改造', status: 'completed' },
        { id: 3, projectId: 1, category: '设计', subcategory: '效果图', amount: 5000, paymentDate: '2024-01-10', paymentMethod: '银行卡', description: '装修设计', status: 'completed' },
        { id: 4, projectId: 1, category: '其他', subcategory: '垃圾清运', amount: 2000, paymentDate: '2024-01-15', paymentMethod: '现金', description: '装修垃圾清运', status: 'completed' }
      ]);
      setProjects([
        { id: 1, name: '三居室装修', houseType: '三室两厅', area: 120, totalBudget: 150000, startDate: '2024-01-01', expectedEndDate: '2024-04-01' },
        { id: 2, name: '办公室改造', houseType: '办公空间', area: 200, totalBudget: 300000, startDate: '2024-02-01', expectedEndDate: '2024-05-01' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 获取项目列表
  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      // 确保返回的是数组
      const projects = (response.data || response || []);
      return Array.isArray(projects) ? projects : [];
    } catch (error) {
      console.error('Fetch projects error:', error);
      return [];
    }
  };

  // 打开添加费用弹窗
  const openCreateModal = () => {
    setEditingCost(null);
    form.resetFields();
    setVisible(true);
  };

  // 打开编辑费用弹窗
  const openEditModal = (cost) => {
    setEditingCost(cost);
    form.setFieldsValue({
      ...cost,
      paymentDate: cost.paymentDate ? new Date(cost.paymentDate) : null
    });
    setVisible(true);
  };

  // 关闭弹窗
  const closeModal = () => {
    setVisible(false);
    setEditingCost(null);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError(null);

      const costData = {
        ...values,
        paymentDate: values.paymentDate.format('YYYY-MM-DD')
      };

      let response;
      if (editingCost) {
        response = await constructionAPI.updateCost(editingCost.id, costData);
      } else {
        response = await constructionAPI.createCost(costData);
      }

      if (response.status === 'success' || response.id) {
        message.success(editingCost ? '费用更新成功' : '费用添加成功');
        setVisible(false);
        fetchData();
      } else {
        message.error(editingCost ? '费用更新失败' : '费用添加失败');
      }
    } catch (error) {
      message.error(editingCost ? '费用更新失败' : '费用添加失败');
      console.error('Submit cost error:', error);
      setError('操作失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 删除费用
  const deleteCost = async (id) => {
    try {
      setLoading(true);
      setError(null);

      // 使用封装的API服务删除费用
      const response = await constructionAPI.deleteCost(id);

      if (response.status === 'success' || response.message === '删除成功') {
        message.success('费用删除成功');
        fetchData();
      } else {
        message.error(response.message || '费用删除失败');
      }
    } catch (error) {
      message.error('删除失败，请检查网络');
      console.error('Delete cost error:', error);
      setError('删除失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 生成智能预算
  const generateBudget = async (values) => {
    try {
      setBudgetLoading(true);

      // 模拟预算生成
      const { houseType, area, style, city, level } = values;

      // 根据输入参数计算预算
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

      // 根据风格调整价格
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

      // 计算总预算
      const totalBudget = area * basePrice * styleFactor;

      // 拆分预算
      const budgetDetails = {
        labor: totalBudget * 0.3,
        materials: totalBudget * 0.4,
        design: totalBudget * 0.1,
        other: totalBudget * 0.2
      };

      setBudget({
        total: totalBudget,
        details: budgetDetails,
        input: values
      });

      message.success('预算生成成功');
    } catch (error) {
      message.error('预算生成失败');
      console.error('Generate budget error:', error);
    } finally {
      setBudgetLoading(false);
    }
  };

  // 绘制费用统计图表
  const drawCostChart = () => {
    if (!chartRef.current) return;

    const myChart = echarts.init(chartRef.current);

    // 筛选当前项目的费用
    const projectCosts = selectedProject
      ? costs.filter(cost => cost.projectId === selectedProject.id)
      : costs;

    // 计算费用统计
    const categoryStats = projectCosts.reduce((acc, cost) => {
      if (!acc[cost.category]) {
        acc[cost.category] = 0;
      }
      acc[cost.category] += cost.amount;
      return acc;
    }, {});

    const option = {
      title: {
        text: '费用分布',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          fontSize: 12
        }
      },
      series: [
        {
          name: '费用',
          type: 'pie',
          radius: '50%',
          data: Object.entries(categoryStats).map(([category, amount]) => ({
            value: amount,
            name: category
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2
          }
        }
      ]
    };

    myChart.setOption(option);

    // 响应式
    const handleResize = () => {
      myChart.resize();
    };

    window.addEventListener('resize', handleResize);

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize);
      myChart.dispose();
    };
  };

  // 计算总费用
  const calculateTotalCost = () => {
    const projectCosts = selectedProject
      ? costs.filter(cost => cost.projectId === selectedProject.id)
      : costs;
    return projectCosts.reduce((sum, cost) => sum + cost.amount, 0);
  };

  // 计算预算使用情况
  const calculateBudgetUsage = () => {
    const totalCost = calculateTotalCost();
    const projectBudget = selectedProject ? selectedProject.totalBudget : budget?.total || 0;
    return projectBudget > 0 ? (totalCost / projectBudget) * 100 : 0;
  };

  // 计算超支预警
  const getBudgetStatus = () => {
    const usage = calculateBudgetUsage();
    if (usage < 80) {
      return { status: 'normal', text: '预算正常', color: '#52c41a' };
    } else if (usage < 100) {
      return { status: 'warning', text: '预算紧张', color: '#faad14' };
    } else {
      return { status: 'error', text: '预算超支', color: '#ff4d4f' };
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: '子类别',
      dataIndex: 'subcategory',
      key: 'subcategory'
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (text) => `¥${text.toFixed(2)}`
    },
    {
      title: '支付日期',
      dataIndex: 'paymentDate',
      key: 'paymentDate'
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod'
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          completed: { text: '已完成', color: 'green' },
          pending: { text: '待支付', color: 'orange' },
          cancelled: { text: '已取消', color: 'red' }
        };
        const statusInfo = statusMap[status] || { text: status, color: 'blue' };
        return <Badge status={statusInfo.color} text={statusInfo.text} />;
      }
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
            title="确定删除该费用记录吗？"
            description="删除后不可恢复"
            onConfirm={() => deleteCost(record.id)}
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
    <div className="budget-management-container" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>预算管理</Title>
        <Paragraph>智能预算评估与花费预警，帮助您控制装修成本</Paragraph>
      </div>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}

      <Tabs defaultActiveKey="overview">
        <TabPane tab="预算概览" key="overview">
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} md={8}>
              <Card hoverable style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
                <Statistic
                  title="总费用"
                  value={calculateTotalCost()}
                  prefix={<DollarOutlined style={{ color: '#1890ff' }} />}
                  suffix="元"
                  precision={2}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card hoverable style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
                <Statistic
                  title="预算"
                  value={selectedProject ? selectedProject.totalBudget : budget?.total || 0}
                  prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
                  suffix="元"
                  precision={2}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card hoverable style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
                <Statistic
                  title="预算使用"
                  value={Math.round(calculateBudgetUsage())}
                  prefix={<AlertOutlined style={{ color: getBudgetStatus().color }} />}
                  suffix="%"
                  valueStyle={{ color: getBudgetStatus().color }}
                />
                <div style={{ marginTop: 8 }}>
                  <Text style={{ color: getBudgetStatus().color }}>{getBudgetStatus().text}</Text>
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} md={12}>
              <Card
                title="费用分布"
                hoverable
                style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
              >
                <div ref={chartRef} style={{ width: '100%', height: 300 }}></div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title="预算使用情况"
                hoverable
                style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
              >
                <div style={{ marginBottom: 16 }}>
                  <Progress
                    percent={Math.round(calculateBudgetUsage())}
                    status={getBudgetStatus().status === 'error' ? 'exception' : getBudgetStatus().status === 'warning' ? 'warning' : 'normal'}
                    format={(percent) => `${percent}%`}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>费用明细：</Text>
                  <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                    {Object.entries(
                      costs
                        .filter(cost => !selectedProject || cost.projectId === selectedProject.id)
                        .reduce((acc, cost) => {
                          if (!acc[cost.category]) {
                            acc[cost.category] = 0;
                          }
                          acc[cost.category] += cost.amount;
                          return acc;
                        }, {})
                    ).map(([category, amount], index) => (
                      <li key={index}>
                        <Text>{category}: ¥{amount.toFixed(2)}</Text>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  style={{ marginTop: 8 }}
                >
                  导出预算报表
                </Button>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="费用记录" key="costs">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Typography.Text strong>费用记录</Typography.Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              style={{ borderRadius: '8px' }}
            >
              添加费用
            </Button>
          </div>

          <Card
            hoverable
            style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
          >
            <Table
              columns={columns}
              dataSource={selectedProject ? costs.filter(cost => cost.projectId === selectedProject.id) : costs}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: '暂无费用记录' }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="智能预算生成" key="budget">
          <Card
            title="智能预算评估"
            hoverable
            style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
          >
            <Form
              form={budgetForm}
              layout="vertical"
              onFinish={generateBudget}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="houseType"
                    label="户型"
                    rules={[{ required: true, message: '请选择户型' }]}
                  >
                    <Select placeholder="请选择户型" size="large" style={{ width: '100%', borderRadius: '8px' }}>
                      <Option value="apartment">公寓</Option>
                      <Option value="villa">别墅</Option>
                      <Option value="office">办公室</Option>
                      <Option value="other">其他</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="area"
                    label="面积（㎡）"
                    rules={[{ required: true, message: '请输入面积' }]}
                  >
                    <InputNumber min={1} step={1} size="large" style={{ width: '100%', borderRadius: '8px' }} placeholder="请输入面积" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="style"
                    label="装修风格"
                    rules={[{ required: true, message: '请选择装修风格' }]}
                  >
                    <Select placeholder="请选择装修风格" size="large" style={{ width: '100%', borderRadius: '8px' }}>
                      <Option value="modern">现代风格</Option>
                      <Option value="chinese">中式风格</Option>
                      <Option value="european">欧式风格</Option>
                      <Option value="minimalist">极简风格</Option>
                      <Option value="industrial">工业风格</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="level"
                    label="装修档次"
                    rules={[{ required: true, message: '请选择装修档次' }]}
                  >
                    <Select placeholder="请选择装修档次" size="large" style={{ width: '100%', borderRadius: '8px' }}>
                      <Option value="simple">简约装修</Option>
                      <Option value="standard">标准装修</Option>
                      <Option value="luxury">豪华装修</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="city"
                label="所在城市"
                rules={[{ required: true, message: '请输入所在城市' }]}
              >
                <Input placeholder="请输入所在城市" size="large" style={{ borderRadius: '8px' }} />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={budgetLoading}
                  size="large"
                  style={{ borderRadius: '8px' }}
                >
                  生成预算
                </Button>
              </Form.Item>
            </Form>

            {budget && (
              <Card
                title="预算结果"
                style={{ marginTop: 24, borderRadius: '8px' }}
              >
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ fontSize: 18 }}>总预算：¥{budget.total.toFixed(2)}元</Text>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>预算明细：</Text>
                  <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                    <li>人工费用：¥{budget.details.labor.toFixed(2)}元 ({(budget.details.labor / budget.total * 100).toFixed(0)}%)</li>
                    <li>材料费用：¥{budget.details.materials.toFixed(2)}元 ({(budget.details.materials / budget.total * 100).toFixed(0)}%)</li>
                    <li>设计费用：¥{budget.details.design.toFixed(2)}元 ({(budget.details.design / budget.total * 100).toFixed(0)}%)</li>
                    <li>其他费用：¥{budget.details.other.toFixed(2)}元 ({(budget.details.other / budget.total * 100).toFixed(0)}%)</li>
                  </ul>
                </div>
                <Alert
                  message="预算建议"
                  description="此预算为参考值，实际费用可能因市场波动、材料选择等因素有所不同。建议预留10-15%的弹性预算以应对突发情况。"
                  type="info"
                  showIcon
                />
              </Card>
            )}
          </Card>
        </TabPane>
      </Tabs>

      {/* 项目选择 */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
        <Card
          title="选择项目"
          style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
        >
          <Select
            placeholder="选择项目"
            style={{ width: 200 }}
            value={selectedProject?.id}
            onChange={(value) => {
              const project = Array.isArray(projects) ? projects.find(p => p.id === value) : null;
              setSelectedProject(project || null);
            }}
          >
            <Option value={null}>全部项目</Option>
            {Array.isArray(projects) && projects.map(project => (
              <Option key={project.id} value={project.id}>{project.name}</Option>
            ))}
          </Select>
        </Card>
      </div>

      {/* 创建/编辑费用弹窗 */}
      <Modal
        title={editingCost ? '编辑费用' : '添加费用'}
        open={visible}
        onCancel={closeModal}
        footer={null}
        width={600}
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
            <Col xs={24} md={12}>
              <Form.Item
                name="projectId"
                label="项目"
                rules={[{ required: true, message: '请选择项目' }]}
              >
                <Select placeholder="请选择项目" size="large" style={{ width: '100%', borderRadius: '8px' }}>
                  {Array.isArray(projects) && projects.map(project => (
                    <Option key={project.id} value={project.id}>{project.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="category"
                label="类别"
                rules={[{ required: true, message: '请选择类别' }]}
              >
                <Select placeholder="请选择类别" size="large" style={{ width: '100%', borderRadius: '8px' }}>
                  <Option value="人工">人工</Option>
                  <Option value="材料">材料</Option>
                  <Option value="设计">设计</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="subcategory"
                label="子类别"
                rules={[{ required: true, message: '请输入子类别' }]}
              >
                <Input placeholder="请输入子类别" size="large" style={{ borderRadius: '8px' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="amount"
                label="金额"
                rules={[{ required: true, message: '请输入金额' }]}
              >
                <InputNumber min={0.01} step={0.01} size="large" style={{ width: '100%', borderRadius: '8px' }} placeholder="请输入金额" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="paymentDate"
                label="支付日期"
                rules={[{ required: true, message: '请选择支付日期' }]}
              >
                <DatePicker size="large" style={{ width: '100%', borderRadius: '8px' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="paymentMethod"
                label="支付方式"
                rules={[{ required: true, message: '请选择支付方式' }]}
              >
                <Select placeholder="请选择支付方式" size="large" style={{ width: '100%', borderRadius: '8px' }}>
                  <Option value="现金">现金</Option>
                  <Option value="微信">微信</Option>
                  <Option value="支付宝">支付宝</Option>
                  <Option value="银行卡">银行卡</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="请输入描述" size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>

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
                {editingCost ? '更新' : '创建'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BudgetManagement;