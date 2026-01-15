import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Input, Select, DatePicker, InputNumber, Upload, message, Typography, Space, Popconfirm, Tabs, Row, Col, Progress, Alert, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, UploadOutlined, BarChartOutlined, DollarOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { constructionAPI, uploadAPI } from '../services/api';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const ConstructionManagement = () => {
  const [constructions, setConstructions] = useState([]);
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [costVisible, setCostVisible] = useState(false);
  const [editingConstruction, setEditingConstruction] = useState(null);
  const [editingCost, setEditingCost] = useState(null);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();
  const [costForm] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [receiptFileList, setReceiptFileList] = useState([]);

  // 获取施工进度和费用列表
  useEffect(() => {
    fetchData();
  }, []);

  // 绘制费用统计图表
  useEffect(() => {
    if (costs.length > 0) {
      drawCostChart();
    }
  }, [costs]);

  // 获取数据
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 获取施工进度
      const constructionResponse = await constructionAPI.getAll();
      setConstructions(constructionResponse.data || constructionResponse || []);

      // 获取费用记录
      const costResponse = await constructionAPI.getCosts();
      setCosts(costResponse.data || costResponse || []);
    } catch (error) {
      message.error('获取数据失败');
      console.error('Fetch data error:', error);
      setError('获取数据失败，请检查网络连接');

      // 模拟数据（用于演示）
      setConstructions([
        {
          id: 1,
          stage: '水电',
          name: '水电改造',
          projectName: '三居室装修',
          progress: 100,
          plannedStartDate: '2024-01-01',
          plannedEndDate: '2024-01-10',
          actualStartDate: '2024-01-01',
          actualEndDate: '2024-01-08',
          status: 'completed',
          image: ''
        },
        {
          id: 2,
          stage: '泥瓦',
          name: '瓷砖铺贴',
          projectName: '三居室装修',
          progress: 80,
          plannedStartDate: '2024-01-11',
          plannedEndDate: '2024-01-25',
          actualStartDate: '2024-01-11',
          actualEndDate: null,
          status: 'in_progress',
          image: ''
        }
      ]);

      setCosts([
        {
          id: 1,
          category: '人工',
          subcategory: '水电工',
          projectName: '三居室装修',
          amount: 8000,
          paymentDate: '2024-01-08',
          paymentMethod: '微信',
          status: 'paid',
          receiptImage: ''
        },
        {
          id: 2,
          category: '物料',
          subcategory: '瓷砖',
          projectName: '三居室装修',
          amount: 15000,
          paymentDate: '2024-01-10',
          paymentMethod: '银行卡',
          status: 'paid',
          receiptImage: ''
        },
        {
          id: 3,
          category: '人工',
          subcategory: '泥瓦工',
          projectName: '三居室装修',
          amount: 12000,
          paymentDate: null,
          paymentMethod: '微信',
          status: 'pending',
          receiptImage: ''
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 绘制费用统计图表
  const drawCostChart = () => {
    const chartDom = document.getElementById('costChart');
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);

    // 计算费用统计
    const categoryStats = costs.reduce((acc, cost) => {
      if (!acc[cost.category]) {
        acc[cost.category] = 0;
      }
      acc[cost.category] += cost.amount;
      return acc;
    }, {});

    const option = {
      title: {
        text: '费用分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        data: Object.keys(categoryStats),
        bottom: 10
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
          }
        }
      ]
    };

    myChart.setOption(option);

    // 响应式
    window.addEventListener('resize', () => {
      myChart.resize();
    });
  };

  // 打开创建施工进度弹窗
  const openCreateModal = () => {
    setEditingConstruction(null);
    form.resetFields();
    setFileList([]);
    setVisible(true);
  };

  // 打开编辑施工进度弹窗
  const openEditModal = (construction) => {
    setEditingConstruction(construction);
    form.setFieldsValue({
      projectId: construction.projectId,
      stage: construction.stage,
      name: construction.name,
      description: construction.description,
      progress: construction.progress,
      plannedStartDate: construction.plannedStartDate,
      plannedEndDate: construction.plannedEndDate,
      actualStartDate: construction.actualStartDate,
      actualEndDate: construction.actualEndDate,
      status: construction.status,
      notes: construction.notes
    });
    setFileList(construction.image ? [{ url: construction.image, name: '施工进度图片' }] : []);
    setVisible(true);
  };

  // 打开创建费用记录弹窗
  const openCreateCostModal = () => {
    setEditingCost(null);
    costForm.resetFields();
    setReceiptFileList([]);
    setCostVisible(true);
  };

  // 打开编辑费用记录弹窗
  const openEditCostModal = (cost) => {
    setEditingCost(cost);
    costForm.setFieldsValue({
      projectId: cost.projectId,
      category: cost.category,
      subcategory: cost.subcategory,
      amount: cost.amount,
      paymentDate: cost.paymentDate,
      paymentMethod: cost.paymentMethod,
      description: cost.description,
      status: cost.status
    });
    setReceiptFileList(cost.receiptImage ? [{ url: cost.receiptImage, name: '收据图片' }] : []);
    setCostVisible(true);
  };

  // 关闭弹窗
  const closeModal = () => {
    setVisible(false);
    setEditingConstruction(null);
    form.resetFields();
    setFileList([]);
  };

  // 关闭费用弹窗
  const closeCostModal = () => {
    setCostVisible(false);
    setEditingCost(null);
    costForm.resetFields();
    setReceiptFileList([]);
  };

  // 处理文件上传
  const handleFileUpload = async (file) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:5000/api/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        message.success('文件上传成功');
        return {
          uid: file.uid,
          name: file.name,
          status: 'done',
          url: response.data.data.url
        };
      } else {
        message.error('文件上传失败');
        return {
          uid: file.uid,
          name: file.name,
          status: 'error'
        };
      }
    } catch (error) {
      message.error('文件上传失败');
      console.error('Upload file error:', error);
      return {
        uid: file.uid,
        name: file.name,
        status: 'error'
      };
    }
  };

  // 提交施工进度表单
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError(null);

      // 处理文件
      const image = fileList.length > 0 ? fileList[0].url : editingConstruction?.image;

      if (editingConstruction) {
        // 更新施工进度
        const response = await constructionAPI.update(editingConstruction.id, {
          ...values,
          image
        });

        if (response.status === 'success' || response.id) {
          message.success('施工进度更新成功');
          fetchData();
          closeModal();
        } else {
          message.error(response.message || '施工进度更新失败');
        }
      } else {
        // 创建施工进度
        const response = await constructionAPI.create({
          ...values,
          image
        });

        if (response.status === 'success' || response.id) {
          message.success('施工进度创建成功');
          fetchData();
          closeModal();
        } else {
          message.error(response.message || '施工进度创建失败');
        }
      }
    } catch (error) {
      message.error('操作失败，请检查网络');
      console.error('Submit construction error:', error);
      setError('操作失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 提交费用记录表单
  const handleCostSubmit = async (values) => {
    try {
      setLoading(true);
      setError(null);

      // 处理文件
      const receiptImage = receiptFileList.length > 0 ? receiptFileList[0].url : editingCost?.receiptImage;

      if (editingCost) {
        // 更新费用记录
        const response = await constructionAPI.updateCost(editingCost.id, {
          ...values,
          receiptImage
        });

        if (response.status === 'success' || response.id) {
          message.success('费用记录更新成功');
          fetchData();
          closeCostModal();
        } else {
          message.error(response.message || '费用记录更新失败');
        }
      } else {
        // 创建费用记录
        const response = await constructionAPI.createCost({
          ...values,
          receiptImage
        });

        if (response.status === 'success' || response.id) {
          message.success('费用记录创建成功');
          fetchData();
          closeCostModal();
        } else {
          message.error(response.message || '费用记录创建失败');
        }
      }
    } catch (error) {
      message.error('操作失败，请检查网络');
      console.error('Submit cost error:', error);
      setError('操作失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 删除施工进度
  const deleteConstruction = async (id) => {
    try {
      setLoading(true);
      setError(null);

      // 使用封装的API服务删除施工进度
      const response = await constructionAPI.delete(id);

      if (response.status === 'success' || response.message === '删除成功') {
        message.success('施工进度删除成功');
        fetchData();
      } else {
        message.error(response.message || '施工进度删除失败');
      }
    } catch (error) {
      message.error('删除失败，请检查网络');
      console.error('Delete construction error:', error);
      setError('删除失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 删除费用记录
  const deleteCost = async (id) => {
    try {
      setLoading(true);
      setError(null);

      // 使用封装的API服务删除费用记录
      const response = await constructionAPI.deleteCost(id);

      if (response.status === 'success' || response.message === '删除成功') {
        message.success('费用记录删除成功');
        fetchData();
      } else {
        message.error(response.message || '费用记录删除失败');
      }
    } catch (error) {
      message.error('删除失败，请检查网络');
      console.error('Delete cost error:', error);
      setError('删除失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 施工进度表格列配置
  const constructionColumns = [
    {
      title: '施工阶段',
      dataIndex: 'stage',
      key: 'stage'
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '项目',
      dataIndex: 'projectName',
      key: 'projectName'
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (text) => (
        <Progress percent={text} size="small" status={text === 100 ? 'success' : 'active'} />
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text) => {
        let color = '';
        let textMap = {
          'not_started': '未开始',
          'in_progress': '进行中',
          'completed': '已完成'
        };

        switch (text) {
          case 'not_started':
            color = 'default';
            break;
          case 'in_progress':
            color = 'blue';
            break;
          case 'completed':
            color = 'green';
            break;
          default:
            color = 'default';
        }

        return <span style={{ color }}>{textMap[text] || text}</span>;
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
            title="确定删除该施工进度吗？"
            description="删除后不可恢复"
            onConfirm={() => deleteConstruction(record.id)}
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

  // 费用记录表格列配置
  const costColumns = [
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
      title: '项目',
      dataIndex: 'projectName',
      key: 'projectName'
    },
    {
      title: '金额(元)',
      dataIndex: 'amount',
      key: 'amount',
      render: (text) => new Intl.NumberFormat('zh-CN').format(text)
    },
    {
      title: '支付日期',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (text) => text ? new Date(text).toLocaleDateString() : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text) => {
        let color = '';
        let textMap = {
          'pending': '待支付',
          'paid': '已支付',
          'refunded': '已退款'
        };

        switch (text) {
          case 'pending':
            color = 'orange';
            break;
          case 'paid':
            color = 'green';
            break;
          case 'refunded':
            color = 'blue';
            break;
          default:
            color = 'default';
        }

        return <span style={{ color }}>{textMap[text] || text}</span>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => openEditCostModal(record)}>
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

  // 计算总费用
  const totalCost = costs.reduce((sum, cost) => sum + cost.amount, 0);

  return (
    <div className="construction-management-container" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>施工管理</Title>
        <Paragraph>管理装修项目的施工进度和费用记录，实时监控工程进展</Paragraph>
      </div>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}

      <Tabs defaultActiveKey="construction">
        <TabPane tab="施工进度" key="construction">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Typography.Text strong>施工进度列表</Typography.Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              style={{ borderRadius: '8px' }}
            >
              添加施工进度
            </Button>
          </div>

          <Card
            hoverable
            style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
          >
            <Table
              columns={constructionColumns}
              dataSource={constructions}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: '暂无施工进度信息' }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="费用管理" key="cost">
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col flex="auto">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateCostModal}
                style={{ borderRadius: '8px' }}
              >
                添加费用记录
              </Button>
            </Col>
            <Col>
              <Card style={{ borderRadius: '8px' }}>
                <Statistic title="总费用" value={totalCost} prefix={<DollarOutlined />} suffix="元" precision={2} />
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Card
                title="费用分布"
                style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
              >
                <div id="costChart" style={{ width: '100%', height: 300 }}></div>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                hoverable
                style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
              >
                <Table
                  columns={costColumns}
                  dataSource={costs}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: '暂无费用记录信息' }}
                  scroll={{ x: 1000 }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* 创建/编辑施工进度弹窗 */}
      <Modal
        title={editingConstruction ? '编辑施工进度' : '添加施工进度'}
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
          <Form.Item
            name="name"
            label="施工进度名称"
            rules={[{ required: true, message: '请输入施工进度名称' }]}
          >
            <Input placeholder="请输入施工进度名称" size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="projectId"
                label="项目"
                rules={[{ required: true, message: '请选择项目' }]}
              >
                <Select placeholder="请选择项目" size="large" style={{ width: '100%', borderRadius: '8px' }}>
                  {/* 这里需要动态获取项目列表 */}
                  <Option value="1">项目A</Option>
                  <Option value="2">项目B</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="stage"
                label="施工阶段"
                rules={[{ required: true, message: '请选择施工阶段' }]}
              >
                <Select placeholder="请选择施工阶段" size="large" style={{ width: '100%', borderRadius: '8px' }}>
                  <Option value="拆改">拆改</Option>
                  <Option value="水电">水电</Option>
                  <Option value="泥瓦">泥瓦</Option>
                  <Option value="木工">木工</Option>
                  <Option value="油漆">油漆</Option>
                  <Option value="安装">安装</Option>
                  <Option value="软装">软装</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入施工进度描述"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="progress"
            label="进度(%)"
            rules={[{ required: true, message: '请输入进度' }]}
          >
            <InputNumber
              min={0}
              max={100}
              style={{ width: '100%', borderRadius: '8px' }}
              placeholder="请输入进度"
              size="large"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="plannedStartDate"
                label="计划开始日期"
              >
                <DatePicker
                  style={{ width: '100%', borderRadius: '8px' }}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="plannedEndDate"
                label="计划结束日期"
              >
                <DatePicker
                  style={{ width: '100%', borderRadius: '8px' }}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="actualStartDate"
                label="实际开始日期"
              >
                <DatePicker
                  style={{ width: '100%', borderRadius: '8px' }}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="actualEndDate"
                label="实际结束日期"
              >
                <DatePicker
                  style={{ width: '100%', borderRadius: '8px' }}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态" size="large" style={{ width: '100%', borderRadius: '8px' }}>
              <Option value="not_started">未开始</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="施工进度图片"
          >
            <Upload
              fileList={fileList}
              customRequest={({ file, onSuccess, onError }) => {
                handleFileUpload(file).then(result => {
                  if (result.status === 'done') {
                    setFileList([result]);
                    onSuccess(result);
                  } else {
                    onError(new Error('上传失败'));
                  }
                });
              }}
              onRemove={() => setFileList([])}
              maxCount={1}
              accept=".jpg,.jpeg,.png"
            >
              <Button
                icon={<UploadOutlined />}
                size="large"
                style={{ borderRadius: '8px' }}
              >
                上传图片
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注"
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入备注信息"
              size="large"
              style={{ borderRadius: '8px' }}
            />
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
                {editingConstruction ? '更新' : '创建'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* 创建/编辑费用记录弹窗 */}
      <Modal
        title={editingCost ? '编辑费用记录' : '添加费用记录'}
        open={costVisible}
        onCancel={closeCostModal}
        footer={null}
        width={800}
        style={{
          borderRadius: '8px'
        }}
      >
        <Form
          form={costForm}
          layout="vertical"
          onFinish={handleCostSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="projectId"
                label="项目"
                rules={[{ required: true, message: '请选择项目' }]}
              >
                <Select placeholder="请选择项目" size="large" style={{ width: '100%', borderRadius: '8px' }}>
                  {/* 这里需要动态获取项目列表 */}
                  <Option value="1">项目A</Option>
                  <Option value="2">项目B</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="费用类别"
                rules={[{ required: true, message: '请选择费用类别' }]}
              >
                <Select placeholder="请选择费用类别" size="large" style={{ width: '100%', borderRadius: '8px' }}>
                  <Option value="人工">人工</Option>
                  <Option value="物料">物料</Option>
                  <Option value="设计">设计</Option>
                  <Option value="杂费">杂费</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="subcategory"
            label="子类别"
            rules={[{ required: true, message: '请输入子类别' }]}
          >
            <Input placeholder="请输入子类别" size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            name="amount"
            label="金额(元)"
            rules={[{ required: true, message: '请输入金额' }]}
          >
            <InputNumber
              min={0.01}
              step={0.01}
              precision={2}
              style={{ width: '100%', borderRadius: '8px' }}
              placeholder="请输入金额"
              size="large"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="paymentDate"
                label="支付日期"
                rules={[{ required: true, message: '请选择支付日期' }]}
              >
                <DatePicker
                  style={{ width: '100%', borderRadius: '8px' }}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
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
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态" size="large" style={{ width: '100%', borderRadius: '8px' }}>
              <Option value="pending">待支付</Option>
              <Option value="paid">已支付</Option>
              <Option value="refunded">已退款</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="收据图片"
          >
            <Upload
              fileList={receiptFileList}
              customRequest={({ file, onSuccess, onError }) => {
                handleFileUpload(file).then(result => {
                  if (result.status === 'done') {
                    setReceiptFileList([result]);
                    onSuccess(result);
                  } else {
                    onError(new Error('上传失败'));
                  }
                });
              }}
              onRemove={() => setReceiptFileList([])}
              maxCount={1}
              accept=".jpg,.jpeg,.png"
            >
              <Button
                icon={<UploadOutlined />}
                size="large"
                style={{ borderRadius: '8px' }}
              >
                上传收据
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="description"
            label="备注"
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入备注信息"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button
                onClick={closeCostModal}
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



export default ConstructionManagement;