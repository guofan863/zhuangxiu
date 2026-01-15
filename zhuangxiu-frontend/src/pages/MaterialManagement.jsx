import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, message, Card, Typography, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { materialAPI } from '../services/api';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const MaterialManagement = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // 获取材料列表
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await materialAPI.getAll();
      if (response.status === 'success') {
        setMaterials(response.data);
      } else {
        message.error('获取材料列表失败');
      }
    } catch (error) {
      message.error('获取材料列表失败');
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // 打开添加材料模态框
  const handleAdd = () => {
    setEditingMaterial(null);
    form.resetFields();
    setVisible(true);
  };

  // 打开编辑材料模态框
  const handleEdit = (material) => {
    setEditingMaterial(material);
    form.setFieldsValue({
      ...material,
      projectId: material.projectId.toString(),
      quantity: parseFloat(material.quantity),
      price: parseFloat(material.price),
      totalPrice: parseFloat(material.totalPrice),
      orderDate: material.orderDate ? new Date(material.orderDate) : null,
      deliveryDate: material.deliveryDate ? new Date(material.deliveryDate) : null
    });
    setVisible(true);
  };

  // 提交表单
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // 计算总价
      const totalPrice = values.quantity * values.price;
      const materialData = {
        ...values,
        totalPrice,
        projectId: parseInt(values.projectId)
      };

      let response;
      if (editingMaterial) {
        response = await materialAPI.update(editingMaterial.id, materialData);
      } else {
        response = await materialAPI.create(materialData);
      }

      if (response.status === 'success') {
        message.success(editingMaterial ? '材料更新成功' : '材料添加成功');
        setVisible(false);
        fetchMaterials();
      } else {
        message.error(editingMaterial ? '材料更新失败' : '材料添加失败');
      }
    } catch (error) {
      message.error(editingMaterial ? '材料更新失败' : '材料添加失败');
      console.error('Error submitting material:', error);
    } finally {
      setLoading(false);
    }
  };

  // 删除材料
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await materialAPI.delete(id);
      if (response.status === 'success') {
        message.success('材料删除成功');
        fetchMaterials();
      } else {
        message.error('材料删除失败');
      }
    } catch (error) {
      message.error('材料删除失败');
      console.error('Error deleting material:', error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索功能
  const filteredMaterials = materials.filter(material => 
    material.name.toLowerCase().includes(searchText.toLowerCase()) ||
    material.category.toLowerCase().includes(searchText.toLowerCase()) ||
    material.supplier?.toLowerCase().includes(searchText.toLowerCase())
  );

  // 材料状态标签
  const getStatusTag = (status) => {
    switch (status) {
      case 'pending':
        return <span style={{ color: '#faad14' }}>待采购</span>;
      case 'ordered':
        return <span style={{ color: '#1890ff' }}>已下单</span>;
      case 'delivered':
        return <span style={{ color: '#52c41a' }}>已送达</span>;
      case 'used':
        return <span style={{ color: '#13c2c2' }}>已使用</span>;
      default:
        return <span>{status}</span>;
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '材料名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record) => `${text} ${record.unit}`,
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      render: (text) => `¥${text.toFixed(2)}`,
    },
    {
      title: '总价',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (text) => `¥${text.toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      render: (text) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)} 
            size="small"
          />
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            onClick={() => handleDelete(record.id)} 
            size="small"
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>材料管理</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAdd}
            >
              添加材料
            </Button>
          </div>
        }
      >
        {/* 搜索框 */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Input
            placeholder="搜索材料名称、分类或供应商"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        {/* 材料列表 */}
        <Table 
          columns={columns} 
          dataSource={filteredMaterials} 
          rowKey="id" 
          loading={loading}
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            defaultPageSize: 10,
          }}
        />
      </Card>

      {/* 材料编辑模态框 */}
      <Modal
        title={editingMaterial ? '编辑材料' : '添加材料'}
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="projectId"
            label="项目ID"
            rules={[{ required: true, message: '请输入项目ID' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>

          <Form.Item
            name="name"
            label="材料名称"
            rules={[{ required: true, message: '请输入材料名称' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择材料分类' }]}
          >
            <Select>
              <Option value="瓷砖">瓷砖</Option>
              <Option value="地板">地板</Option>
              <Option value="涂料">涂料</Option>
              <Option value="门窗">门窗</Option>
              <Option value="水电">水电</Option>
              <Option value="木工">木工</Option>
              <Option value="五金">五金</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="数量"
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0.1} step={0.1} />
          </Form.Item>

          <Form.Item
            name="unit"
            label="单位"
            rules={[{ required: true, message: '请输入单位' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="price"
            label="单价"
            rules={[{ required: true, message: '请输入单价' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0.01} step={0.01} />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="pending">待采购</Option>
              <Option value="ordered">已下单</Option>
              <Option value="delivered">已送达</Option>
              <Option value="used">已使用</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="supplier"
            label="供应商"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="orderDate"
            label="下单日期"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="deliveryDate"
            label="送达日期"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button onClick={() => setVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingMaterial ? '更新' : '添加'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MaterialManagement;