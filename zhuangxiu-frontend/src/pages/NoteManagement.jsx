import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Input, Select, message, Typography, Space, Popconfirm, Alert, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { noteAPI } from '../services/api';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const NoteManagement = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  // 获取随手记列表
  useEffect(() => {
    fetchNotes();
  }, []);

  // 获取随手记列表
  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);

      // 使用封装的API服务获取随手记列表
      const response = await noteAPI.getAll();
      setNotes(response.data || response || []);
    } catch (error) {
      message.error('获取随手记列表失败');
      console.error('Fetch notes error:', error);
      setError('获取随手记列表失败，请检查网络连接');

      // 模拟数据（用于演示）
      setNotes([
        {
          id: 1,
          title: '客厅装修需求',
          content: '客厅需要安装投影仪和音响系统，注意预留电源和信号线',
          category: '装修需求',
          priority: 'high',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: '厨房设计',
          content: '厨房需要增加一个水槽，方便清洗食材',
          category: '设计需求',
          priority: 'normal',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 打开创建随手记弹窗
  const openCreateModal = () => {
    setEditingNote(null);
    form.resetFields();
    setVisible(true);
  };

  // 打开编辑随手记弹窗
  const openEditModal = (note) => {
    setEditingNote(note);
    form.setFieldsValue(note);
    setVisible(true);
  };

  // 关闭弹窗
  const closeModal = () => {
    setVisible(false);
    setEditingNote(null);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError(null);

      if (editingNote) {
        // 更新随手记
        const response = await noteAPI.update(editingNote.id, values);

        if (response.status === 'success' || response.id) {
          message.success('随手记更新成功');
          fetchNotes();
          closeModal();
        } else {
          message.error(response.message || '随手记更新失败');
        }
      } else {
        // 创建随手记
        const response = await noteAPI.create(values);

        if (response.status === 'success' || response.id) {
          message.success('随手记创建成功');
          fetchNotes();
          closeModal();
        } else {
          message.error(response.message || '随手记创建失败');
        }
      }
    } catch (error) {
      message.error('操作失败，请检查网络');
      console.error('Submit note error:', error);
      setError('操作失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 删除随手记
  const deleteNote = async (id) => {
    try {
      setLoading(true);
      setError(null);

      // 使用封装的API服务删除随手记
      const response = await noteAPI.delete(id);

      if (response.status === 'success' || response.message === '删除成功') {
        message.success('随手记删除成功');
        fetchNotes();
      } else {
        message.error(response.message || '随手记删除失败');
      }
    } catch (error) {
      message.error('删除失败，请检查网络');
      console.error('Delete note error:', error);
      setError('删除失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      render: (text) => <Text ellipsis={{ rows: 2 }}>{text}</Text>
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (text) => text ? <Tag color="blue">{text}</Tag> : <Tag color="default">未分类</Tag>
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (text) => {
        let color = '';
        switch (text) {
          case 'high':
            color = 'red';
            break;
          case 'medium':
            color = 'orange';
            break;
          case 'low':
            color = 'green';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{text === 'high' ? '高' : text === 'medium' ? '中' : text === 'low' ? '低' : '普通'}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text) => {
        let color = '';
        switch (text) {
          case 'active':
            color = 'green';
            break;
          case 'completed':
            color = 'blue';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{text === 'active' ? '活跃' : text === 'completed' ? '已完成' : text}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => text ? new Date(text).toLocaleString() : '-'
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
            title="确定删除该随手记吗？"
            description="删除后不可恢复"
            onConfirm={() => deleteNote(record.id)}
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
    <div className="note-management-container" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>随手记</Title>
        <Paragraph>记录装修过程中随时想到的需求和想法</Paragraph>
      </div>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Text strong>随手记列表</Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          添加随手记
        </Button>
      </div>

      <Card
        hoverable
        style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
      >
        <Table
          columns={columns}
          dataSource={notes}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: '暂无随手记，点击右上角添加新的随手记' }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 创建/编辑随手记弹窗 */}
      <Modal
        title={editingNote ? '编辑随手记' : '添加随手记'}
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
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入标题" size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextArea rows={4} placeholder="请输入内容" size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
          >
            <Input placeholder="请输入分类，如：装修需求、设计需求等" size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
          >
            <Select placeholder="请选择优先级" size="large" style={{ width: '100%', borderRadius: '8px' }}>
              <Option value="high">高</Option>
              <Option value="medium">中</Option>
              <Option value="low">低</Option>
              <Option value="normal">普通</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
          >
            <Select placeholder="请选择状态" size="large" style={{ width: '100%', borderRadius: '8px' }}>
              <Option value="active">活跃</Option>
              <Option value="completed">已完成</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button onClick={closeModal} size="large">
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                {editingNote ? '更新' : '创建'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NoteManagement;