import React, { useState, useEffect } from 'react';
import { Card, Button, List, Modal, Form, Input, Select, message, Typography, Space, Tag, Upload, Image } from 'antd';
import { PlusOutlined, BulbOutlined, EditOutlined, WarningOutlined, CheckSquareOutlined, PictureOutlined, DeleteOutlined } from '@ant-design/icons';
import { noteAPI } from '../services/api';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

/**
 * 装修笔记 - 整合随手记、灵感收集、避坑指南
 * 灵活记录装修过程中的所有想法、问题、注意事项
 */
const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form] = Form.useForm();

  // 笔记分类
  const CATEGORIES = [
    { value: 'inspiration', label: '💡 灵感想法', icon: <BulbOutlined />, color: 'blue', description: '收集装修灵感、喜欢的风格' },
    { value: 'daily', label: '📝 施工笔记', icon: <EditOutlined />, color: 'green', description: '记录每天的进展、问题' },
    { value: 'warning', label: '⚠️ 避坑指南', icon: <WarningOutlined />, color: 'red', description: '记录踩过的坑、注意事项' },
    { value: 'todo', label: '📋 待办事项', icon: <CheckSquareOutlined />, color: 'orange', description: '需要处理的事情' }
  ];

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, selectedCategory]);

  // 获取笔记列表
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await noteAPI.getAll();
      setNotes(response.data || response || []);
    } catch (error) {
      message.error('获取笔记失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 筛选笔记
  const filterNotes = () => {
    if (selectedCategory === 'all') {
      setFilteredNotes(notes);
    } else {
      setFilteredNotes(notes.filter(note => note.category === selectedCategory));
    }
  };

  // 打开创建/编辑弹窗
  const openModal = (note = null) => {
    setEditingNote(note);
    if (note) {
      form.setFieldsValue(note);
    } else {
      form.resetFields();
      form.setFieldsValue({ category: 'inspiration' });
    }
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
      if (editingNote) {
        await noteAPI.update(editingNote.id, values);
        message.success('笔记更新成功');
      } else {
        await noteAPI.create(values);
        message.success('笔记创建成功');
      }
      fetchNotes();
      closeModal();
    } catch (error) {
      message.error('操作失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 删除笔记
  const deleteNote = async (id) => {
    try {
      setLoading(true);
      await noteAPI.delete(id);
      message.success('笔记删除成功');
      fetchNotes();
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 获取分类信息
  const getCategoryInfo = (category) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[0];
  };

  // 统计各分类数量
  const getCategoryCount = (category) => {
    return notes.filter(note => note.category === category).length;
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>📝 装修笔记</Title>
        <Paragraph>记录装修过程中的灵感、问题、经验和待办</Paragraph>
      </div>

      {/* 分类卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <Card
          hoverable
          style={{
            borderColor: selectedCategory === 'all' ? '#1890ff' : undefined,
            borderWidth: selectedCategory === 'all' ? 2 : 1
          }}
          onClick={() => setSelectedCategory('all')}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{notes.length}</div>
            <div style={{ color: '#666' }}>全部笔记</div>
          </div>
        </Card>

        {CATEGORIES.map(category => (
          <Card
            key={category.value}
            hoverable
            style={{
              borderColor: selectedCategory === category.value ? category.color : undefined,
              borderWidth: selectedCategory === category.value ? 2 : 1
            }}
            onClick={() => setSelectedCategory(category.value)}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{category.label.split(' ')[0]}</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: category.color }}>
                {getCategoryCount(category.value)}
              </div>
              <div style={{ color: '#666' }}>{category.label.split(' ')[1]}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* 操作按钮 */}
      <div style={{ marginBottom: '16px', textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          写笔记
        </Button>
      </div>

      {/* 笔记列表 */}
      <List
        loading={loading}
        dataSource={filteredNotes}
        renderItem={(note) => {
          const categoryInfo = getCategoryInfo(note.category);
          return (
            <Card
              key={note.id}
              style={{ marginBottom: '16px' }}
              extra={
                <Space>
                  <Button size="small" onClick={() => openModal(note)}>编辑</Button>
                  <Button size="small" danger onClick={() => deleteNote(note.id)}>删除</Button>
                </Space>
              }
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                <div style={{ fontSize: '32px' }}>{categoryInfo.label.split(' ')[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong style={{ fontSize: '16px' }}>{note.title}</Text>
                    <Tag color={categoryInfo.color} style={{ marginLeft: '8px' }}>
                      {categoryInfo.label}
                    </Tag>
                  </div>
                  <Paragraph style={{ marginBottom: '8px' }}>{note.content}</Paragraph>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}
                  </Text>
                </div>
              </div>
            </Card>
          );
        }}
        locale={{ emptyText: '暂无笔记，点击「写笔记」开始记录' }}
      />

      {/* 创建/编辑笔记弹窗 */}
      <Modal
        title={editingNote ? '编辑笔记' : '写笔记'}
        open={visible}
        onCancel={closeModal}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select size="large">
              {CATEGORIES.map(category => (
                <Option key={category.value} value={category.value}>
                  <Space>
                    <span style={{ fontSize: '20px' }}>{category.label.split(' ')[0]}</span>
                    <span>{category.label}</span>
                    <Text type="secondary" style={{ fontSize: '12px' }}>- {category.description}</Text>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input size="large" placeholder="简短标题" />
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <Input.TextArea
              rows={8}
              placeholder="详细记录...&#10;&#10;💡 灵感想法：记录喜欢的设计、颜色搭配等&#10;📝 施工笔记：今天的工作进展、遇到的问题&#10;⚠️ 避坑指南：踩过的坑、需要注意的地方&#10;📋 待办事项：需要购买的材料、需要联系的人"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={closeModal}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingNote ? '更新' : '保存'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Notes;
