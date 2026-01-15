import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Input, Select, DatePicker, InputNumber, message, Typography, Space, Popconfirm, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { projectAPI } from '../services/api';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  // 获取项目列表
  useEffect(() => {
    fetchProjects();
  }, []);

  // 获取项目列表
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // 使用封装的API服务获取项目列表
      const response = await projectAPI.getAll();
      // 处理数据，转换字段名以匹配前端显示
      const projects = (response.data || response || []).map(project => ({
        ...project,
        houseType: project.type,
        budget: project.totalBudget
      }));
      setProjects(projects);
    } catch (error) {
      message.error('获取项目列表失败');
      console.error('Fetch projects error:', error);
      setError('获取项目列表失败，请检查网络连接');

      // 模拟数据（用于演示）
      setProjects([
        { id: 1, name: '三居室装修', houseType: '三室两厅', area: 120, budget: 150000, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), description: '新房装修' },
        { id: 2, name: '办公室改造', houseType: '办公空间', area: 200, budget: 300000, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), description: '办公室翻新' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 打开创建项目弹窗
  const openCreateModal = () => {
    setEditingProject(null);
    form.resetFields();
    setVisible(true);
  };

  // 打开编辑项目弹窗
  const openEditModal = (project) => {
    setEditingProject(project);
    form.setFieldsValue({
      name: project.name,
      houseType: project.type || project.houseType,
      area: project.area,
      address: project.address,
      budget: project.totalBudget || project.budget,
      startDate: project.startDate ? [project.startDate, project.expectedEndDate || project.endDate] : null,
      description: project.description
    });
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
      setError(null);

      // 处理日期范围
      const startDate = values.startDate ? values.startDate[0].toISOString() : null;
      const expectedEndDate = values.startDate ? values.startDate[1].toISOString() : null;

      const projectData = {
        name: values.name,
        type: values.houseType,
        area: values.area,
        address: values.address || '',
        totalBudget: values.budget,
        startDate,
        expectedEndDate,
        description: values.description
      };

      if (editingProject) {
        // 更新项目
        const response = await projectAPI.update(editingProject.id, projectData);

        if (response.status === 'success' || response.id) {
          message.success('项目更新成功');
          fetchProjects();
          closeModal();
        } else {
          message.error(response.message || '项目更新失败');
        }
      } else {
        // 创建项目
        const response = await projectAPI.create(projectData);

        if (response.status === 'success' || response.id) {
          message.success('项目创建成功');
          fetchProjects();
          closeModal();
        } else {
          message.error(response.message || '项目创建失败');
        }
      }
    } catch (error) {
      message.error('操作失败，请检查网络');
      console.error('Submit project error:', error);
      setError('操作失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 删除项目
  const deleteProject = async (id) => {
    try {
      setLoading(true);
      setError(null);

      // 使用封装的API服务删除项目
      const response = await projectAPI.delete(id);

      if (response.status === 'success' || response.message === '删除成功') {
        message.success('项目删除成功');
        fetchProjects();
      } else {
        message.error(response.message || '项目删除失败');
      }
    } catch (error) {
      message.error('删除失败，请检查网络');
      console.error('Delete project error:', error);
      setError('删除失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 表格列配置
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
      title: '面积(㎡)',
      dataIndex: 'area',
      key: 'area',
      render: (text) => <Text>{text} ㎡</Text>
    },
    {
      title: '预算(元)',
      dataIndex: 'budget',
      key: 'budget',
      render: (text, record) => {
        const budget = text || record.totalBudget || 0;
        return <Text>{new Intl.NumberFormat('zh-CN').format(budget)}</Text>;
      }
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (text) => text ? new Date(text).toLocaleDateString() : '-'
    },
    {
      title: '结束日期',
      dataIndex: 'expectedEndDate',
      key: 'expectedEndDate',
      render: (text, record) => {
        const endDate = text || record.expectedEndDate || record.endDate;
        return endDate ? new Date(endDate).toLocaleDateString() : '-';
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
            title="确定删除该项目吗？"
            description="删除后不可恢复"
            onConfirm={() => deleteProject(record.id)}
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
    <div className="project-management-container" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>项目管理</Title>
        <Paragraph>管理您的装修项目，包括创建、编辑和删除项目</Paragraph>
      </div>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Text strong>项目列表</Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          创建项目
        </Button>
      </div>

      <Card
        hoverable
        style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
      >
        <Table
          columns={columns}
          dataSource={projects}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: '暂无项目，点击右上角创建新项目' }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 创建/编辑项目弹窗 */}
      <Modal
        title={editingProject ? '编辑项目' : '创建项目'}
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
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            name="houseType"
            label="户型"
            rules={[{ required: true, message: '请选择户型' }]}
          >
            <Select placeholder="请选择户型" size="large" style={{ borderRadius: '8px' }}>
              <Option value="一室一厅">一室一厅</Option>
              <Option value="两室一厅">两室一厅</Option>
              <Option value="两室两厅">两室两厅</Option>
              <Option value="三室一厅">三室一厅</Option>
              <Option value="三室两厅">三室两厅</Option>
              <Option value="四室及以上">四室及以上</Option>
              <Option value="复式">复式</Option>
              <Option value="别墅">别墅</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="area"
            label="面积(㎡)"
            rules={[{ required: true, message: '请输入面积' }]}
          >
            <InputNumber min={1} style={{ width: '100%', borderRadius: '8px' }} placeholder="请输入面积" size="large" />
          </Form.Item>

          <Form.Item
            name="address"
            label="地址"
            rules={[{ required: true, message: '请输入地址' }]}
          >
            <Input placeholder="请输入项目地址" size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            name="budget"
            label="预算(元)"
            rules={[{ required: true, message: '请输入预算' }]}
          >
            <InputNumber min={1} style={{ width: '100%', borderRadius: '8px' }} placeholder="请输入预算" size="large" />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="项目周期"
          >
            <RangePicker size="large" style={{ width: '100%', borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            name="description"
            label="项目描述"
          >
            <Input.TextArea rows={4} placeholder="请输入项目描述" size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button onClick={closeModal} size="large">
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                {editingProject ? '更新' : '创建'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectManagement;