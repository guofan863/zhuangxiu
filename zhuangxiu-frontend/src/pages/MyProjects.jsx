import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Input, Select, DatePicker, InputNumber, message, Typography, Space, Popconfirm, Tabs, Tag, Progress, Steps, Timeline, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, HomeOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { projectAPI, constructionAPI, acceptanceAPI } from '../services/api';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Step } = Steps;

/**
 * 我的项目 - 整合项目管理、施工进度、验收
 * 以项目为中心，集中管理所有相关信息
 */
const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [constructions, setConstructions] = useState([]);
  const [acceptances, setAcceptances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  // 施工阶段定义
  const CONSTRUCTION_STAGES = [
    { key: 'planning', name: '规划设计', icon: '📋' },
    { key: 'demolition', name: '拆改', icon: '🔨' },
    { key: 'hydropower', name: '水电', icon: '💡' },
    { key: 'masonry', name: '泥瓦', icon: '🧱' },
    { key: 'carpentry', name: '木工', icon: '🪚' },
    { key: 'painting', name: '油漆', icon: '🎨' },
    { key: 'installation', name: '安装', icon: '🔧' },
    { key: 'completed', name: '完工', icon: '✅' }
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectDetails(selectedProject.id);
    }
  }, [selectedProject]);

  // 获取项目列表
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getAll();
      const projects = (response.data || response || []).map(project => ({
        ...project,
        houseType: project.type,
        budget: project.totalBudget
      }));
      setProjects(projects);
    } catch (error) {
      message.error('获取项目列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 获取项目详情
  const fetchProjectDetails = async (projectId) => {
    try {
      setLoading(true);
      const [constructionData, acceptanceData] = await Promise.all([
        constructionAPI.getAll(),
        acceptanceAPI.getAll()
      ]);

      // 筛选当前项目的数据
      setConstructions((constructionData.data || constructionData || []).filter(c => c.projectId === projectId));
      setAcceptances((acceptanceData.data || acceptanceData || []).filter(a => a.projectId === projectId));
    } catch (error) {
      console.error('获取项目详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 打开项目详情
  const openProjectDetail = (project) => {
    setSelectedProject(project);
  };

  // 关闭项目详情
  const closeProjectDetail = () => {
    setSelectedProject(null);
  };

  // 打开创建/编辑弹窗
  const openModal = (project = null) => {
    setEditingProject(project);
    if (project) {
      form.setFieldsValue({
        name: project.name,
        houseType: project.type || project.houseType,
        area: project.area,
        address: project.address,
        budget: project.totalBudget || project.budget,
        startDate: project.startDate && project.expectedEndDate ? [
          dayjs(project.startDate),
          dayjs(project.expectedEndDate)
        ] : null,
        description: project.description
      });
    } else {
      form.resetFields();
    }
    setVisible(true);
  };

  // 关闭弹窗
  const closeModal = () => {
    setVisible(false);
    setEditingProject(null);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const projectData = {
        name: values.name,
        type: values.houseType,
        area: values.area,
        address: values.address || '',
        totalBudget: values.budget,
        startDate: values.startDate && values.startDate[0] ? values.startDate[0].format('YYYY-MM-DD') : null,
        expectedEndDate: values.startDate && values.startDate[1] ? values.startDate[1].format('YYYY-MM-DD') : null,
        description: values.description
      };

      if (editingProject) {
        await projectAPI.update(editingProject.id, projectData);
        message.success('项目更新成功');
      } else {
        await projectAPI.create(projectData);
        message.success('项目创建成功');
      }

      fetchProjects();
      closeModal();
    } catch (error) {
      message.error('操作失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 删除项目
  const deleteProject = async (id) => {
    try {
      setLoading(true);
      await projectAPI.delete(id);
      message.success('项目删除成功');
      fetchProjects();
      if (selectedProject && selectedProject.id === id) {
        closeProjectDetail();
      }
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 计算项目进度
  const calculateProgress = (projectId) => {
    const projectConstructions = constructions.filter(c => c.projectId === projectId);
    if (projectConstructions.length === 0) return 0;
    const avgProgress = projectConstructions.reduce((sum, c) => sum + (c.progress || 0), 0) / projectConstructions.length;
    return Math.round(avgProgress);
  };

  // 获取项目状态
  const getProjectStatus = (project) => {
    const progress = calculateProgress(project.id);
    if (progress === 100) return { text: '已完工', color: 'success' };
    if (progress > 0) return { text: '施工中', color: 'processing' };
    return { text: '未开始', color: 'default' };
  };

  // 表格列
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: '户型',
      dataIndex: 'houseType',
      key: 'houseType'
    },
    {
      title: '面积',
      dataIndex: 'area',
      key: 'area',
      render: (text) => `${text} ㎡`
    },
    {
      title: '预算',
      dataIndex: 'budget',
      key: 'budget',
      render: (text, record) => {
        const budget = text || record.totalBudget || 0;
        return `¥${new Intl.NumberFormat('zh-CN').format(budget)}`;
      }
    },
    {
      title: '进度',
      key: 'progress',
      render: (_, record) => {
        const progress = calculateProgress(record.id);
        return <Progress percent={progress} size="small" />;
      }
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => {
        const status = getProjectStatus(record);
        return <Tag color={status.color}>{status.text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openProjectDetail(record)}>查看详情</Button>
          <Button type="link" onClick={() => openModal(record)}>编辑</Button>
          <Popconfirm
            title="确定删除?"
            onConfirm={() => deleteProject(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>📁 我的项目</Title>
        <Paragraph>项目全生命周期管理：从规划到完工</Paragraph>
      </div>

      {!selectedProject ? (
        // 项目列表视图
        <>
          <div style={{ marginBottom: '16px', textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              创建项目
            </Button>
          </div>
          <Card>
            <Table
              columns={columns}
              dataSource={projects}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </>
      ) : (
        // 项目详情视图
        <>
          <Button onClick={closeProjectDetail} style={{ marginBottom: '16px' }}>
            ← 返回项目列表
          </Button>

          <Card title={`项目：${selectedProject.name}`} extra={<Button onClick={() => openModal(selectedProject)}>编辑项目</Button>}>
            <Tabs defaultActiveKey="info">
              <TabPane tab="📋 基本信息" key="info">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <Text type="secondary">户型：</Text>
                    <Text strong>{selectedProject.houseType || selectedProject.type}</Text>
                  </div>
                  <div>
                    <Text type="secondary">面积：</Text>
                    <Text strong>{selectedProject.area} ㎡</Text>
                  </div>
                  <div>
                    <Text type="secondary">地址：</Text>
                    <Text strong>{selectedProject.address}</Text>
                  </div>
                  <div>
                    <Text type="secondary">预算：</Text>
                    <Text strong>¥{new Intl.NumberFormat('zh-CN').format(selectedProject.budget || selectedProject.totalBudget)}</Text>
                  </div>
                  <div>
                    <Text type="secondary">开始日期：</Text>
                    <Text strong>{selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : '-'}</Text>
                  </div>
                  <div>
                    <Text type="secondary">预计完工：</Text>
                    <Text strong>{selectedProject.expectedEndDate ? new Date(selectedProject.expectedEndDate).toLocaleDateString() : '-'}</Text>
                  </div>
                </div>
                {selectedProject.description && (
                  <div style={{ marginTop: '16px' }}>
                    <Text type="secondary">项目描述：</Text>
                    <Paragraph>{selectedProject.description}</Paragraph>
                  </div>
                )}
              </TabPane>

              <TabPane tab="🔨 施工进度" key="construction">
                <Steps current={constructions.length} style={{ marginBottom: '24px' }}>
                  {CONSTRUCTION_STAGES.map((stage, index) => (
                    <Step key={stage.key} title={`${stage.icon} ${stage.name}`} />
                  ))}
                </Steps>

                <Timeline mode="left">
                  {constructions.map((construction, index) => (
                    <Timeline.Item
                      key={construction.id}
                      color={construction.status === 'completed' ? 'green' : 'blue'}
                      dot={construction.status === 'completed' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                    >
                      <div>
                        <Text strong>{construction.stage || construction.name}</Text>
                        <div>
                          <Progress percent={construction.progress || 0} size="small" style={{ width: '200px' }} />
                        </div>
                        <Text type="secondary">{construction.actualStartDate ? `开始于 ${new Date(construction.actualStartDate).toLocaleDateString()}` : ''}</Text>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>

                {constructions.length === 0 && (
                  <Alert message="暂无施工记录" description="项目施工开始后，在「施工管控」页面记录进度" type="info" showIcon />
                )}
              </TabPane>

              <TabPane tab="✅ 验收状态" key="acceptance">
                {acceptances.length > 0 ? (
                  <Table
                    dataSource={acceptances}
                    rowKey="id"
                    pagination={false}
                    columns={[
                      { title: '阶段', dataIndex: 'stage', key: 'stage' },
                      { title: '空间', dataIndex: 'space', key: 'space' },
                      { title: '验收日期', dataIndex: 'acceptanceDate', key: 'acceptanceDate', render: (date) => date ? new Date(date).toLocaleDateString() : '-' },
                      {
                        title: '状态',
                        dataIndex: 'status',
                        key: 'status',
                        render: (status) => {
                          const statusMap = {
                            passed: { text: '通过', color: 'success' },
                            failed: { text: '未通过', color: 'error' },
                            pending: { text: '待验收', color: 'default' }
                          };
                          const statusInfo = statusMap[status] || { text: status, color: 'default' };
                          return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
                        }
                      },
                      { title: '备注', dataIndex: 'notes', key: 'notes' }
                    ]}
                  />
                ) : (
                  <Alert message="暂无验收记录" description="各阶段完工后，在「验收对比」页面进行验收" type="info" showIcon />
                )}
              </TabPane>
            </Tabs>
          </Card>
        </>
      )}

      {/* 创建/编辑项目弹窗 */}
      <Modal
        title={editingProject ? '编辑项目' : '创建项目'}
        open={visible}
        onCancel={closeModal}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
            <Input placeholder="例如：三居室装修" />
          </Form.Item>

          <Form.Item name="houseType" label="户型" rules={[{ required: true, message: '请选择户型' }]}>
            <Select placeholder="请选择户型">
              <Option value="一室一厅">一室一厅</Option>
              <Option value="两室一厅">两室一厅</Option>
              <Option value="两室两厅">两室两厅</Option>
              <Option value="三室一厅">三室一厅</Option>
              <Option value="三室两厅">三室两厅</Option>
              <Option value="四室及以上">四室及以上</Option>
            </Select>
          </Form.Item>

          <Form.Item name="area" label="面积(㎡)" rules={[{ required: true, message: '请输入面积' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="address" label="地址" rules={[{ required: true, message: '请输入地址' }]}>
            <Input placeholder="请输入项目地址" />
          </Form.Item>

          <Form.Item name="budget" label="预算(元)" rules={[{ required: true, message: '请输入预算' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="startDate" label="项目周期">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="description" label="项目描述">
            <Input.TextArea rows={4} placeholder="项目简介、特殊要求等" />
          </Form.Item>

          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={closeModal}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingProject ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyProjects;
