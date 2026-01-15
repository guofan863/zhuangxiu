import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Input, Select, Upload, message, Typography, Space, Popconfirm, Tabs, Badge, Row, Col, Alert, DatePicker, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, UploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { contractAPI, uploadAPI } from '../services/api';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const { RangePicker } = DatePicker;

  // 获取合同列表
  useEffect(() => {
    fetchContracts();
  }, []);

  // 获取合同列表
  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);

      // 使用封装的API服务获取合同列表
      const response = await contractAPI.getAll();
      setContracts(response.data || response || []);
    } catch (error) {
      message.error('获取合同列表失败');
      console.error('Fetch contracts error:', error);
      setError('获取合同列表失败，请检查网络连接');

      // 模拟数据（用于演示）
      setContracts([
        {
          id: 1,
          name: '美家装饰合同',
          companyName: '美家装饰',
          projectName: '三居室装修',
          amount: 150000,
          startDate: '2024-01-01',
          endDate: '2024-04-01',
          status: 'signed',
          fileUrl: '',
          fileName: ''
        },
        {
          id: 2,
          name: '宜居装饰合同',
          companyName: '宜居装饰',
          projectName: '办公室改造',
          amount: 300000,
          startDate: '2024-02-01',
          endDate: '2024-04-01',
          status: 'pending',
          fileUrl: '',
          fileName: ''
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 打开创建合同弹窗
  const openCreateModal = () => {
    setEditingContract(null);
    form.resetFields();
    setFileList([]);
    setVisible(true);
  };

  // 打开编辑合同弹窗
  const openEditModal = (contract) => {
    setEditingContract(contract);
    form.setFieldsValue({
      name: contract.name,
      companyId: contract.companyId,
      projectId: contract.projectId,
      amount: contract.amount,
      startDate: contract.startDate,
      endDate: contract.endDate,
      status: contract.status,
      notes: contract.notes
    });
    setFileList(contract.fileUrl ? [{ url: contract.fileUrl, name: contract.fileName }] : []);
    setVisible(true);
  };

  // 关闭弹窗
  const closeModal = () => {
    setVisible(false);
    setEditingContract(null);
    form.resetFields();
    setFileList([]);
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

  // 提交表单
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError(null);

      // 处理文件
      const fileUrl = fileList.length > 0 ? fileList[0].url : editingContract?.fileUrl;
      const fileName = fileList.length > 0 ? fileList[0].name : editingContract?.fileName;

      if (editingContract) {
        // 更新合同
        const response = await contractAPI.update(editingContract.id, {
          ...values,
          fileUrl,
          fileName
        });

        if (response.status === 'success' || response.id) {
          message.success('合同更新成功');
          fetchContracts();
          closeModal();
        } else {
          message.error(response.message || '合同更新失败');
        }
      } else {
        // 创建合同
        const response = await contractAPI.create({
          ...values,
          fileUrl,
          fileName
        });

        if (response.status === 'success' || response.id) {
          message.success('合同创建成功');
          fetchContracts();
          closeModal();
        } else {
          message.error(response.message || '合同创建失败');
        }
      }
    } catch (error) {
      message.error('操作失败，请检查网络');
      console.error('Submit contract error:', error);
      setError('操作失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 删除合同
  const deleteContract = async (id) => {
    try {
      setLoading(true);
      setError(null);

      // 使用封装的API服务删除合同
      const response = await contractAPI.delete(id);

      if (response.status === 'success' || response.message === '删除成功') {
        message.success('合同删除成功');
        fetchContracts();
      } else {
        message.error(response.message || '合同删除失败');
      }
    } catch (error) {
      message.error('删除失败，请检查网络');
      console.error('Delete contract error:', error);
      setError('删除失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 审核合同
  const auditContract = async (contract) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/contracts/${contract.id}/audit`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        message.success('合同审核成功');
        fetchContracts();
      } else {
        message.error(response.data.message || '合同审核失败');
      }
    } catch (error) {
      message.error('审核失败，请检查网络');
      console.error('Audit contract error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '合同名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '装修公司',
      dataIndex: 'companyName',
      key: 'companyName'
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text) => {
        let color = '';
        let textMap = {
          'pending': '待审核',
          'audited': '已审核',
          'signed': '已签署'
        };

        switch (text) {
          case 'pending':
            color = 'orange';
            break;
          case 'audited':
            color = 'blue';
            break;
          case 'signed':
            color = 'green';
            break;
          default:
            color = 'default';
        }

        return <Badge status={color} text={textMap[text] || text} />;
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
          {record.status === 'pending' && (
            <Button icon={<CheckCircleOutlined />} onClick={() => auditContract(record)}>
              审核
            </Button>
          )}
          <Popconfirm
            title="确定删除该合同吗？"
            description="删除后不可恢复"
            onConfirm={() => deleteContract(record.id)}
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
    <div className="contract-management-container" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>合同管理</Title>
        <Paragraph>管理装修项目的合同，包括添加、编辑、审核和删除合同</Paragraph>
      </div>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}

      <Tabs defaultActiveKey="list">
        <TabPane tab="合同列表" key="list">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Typography.Text strong>合同列表</Typography.Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              style={{ borderRadius: '8px' }}
            >
              添加合同
            </Button>
          </div>

          <Card
            hoverable
            style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
          >
            <Table
              columns={columns}
              dataSource={contracts}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: '暂无合同信息' }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="待审核合同" key="pending">
          <Card
            hoverable
            style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
          >
            <Table
              columns={columns}
              dataSource={contracts.filter(item => item.status === 'pending')}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: '暂无待审核合同' }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 创建/编辑合同弹窗 */}
      <Modal
        title={editingContract ? '编辑合同' : '添加合同'}
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
            label="合同名称"
            rules={[{ required: true, message: '请输入合同名称' }]}
          >
            <Input placeholder="请输入合同名称" size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="companyId"
                label="装修公司"
                rules={[{ required: true, message: '请选择装修公司' }]}
              >
                <Select placeholder="请选择装修公司" size="large" style={{ width: '100%', borderRadius: '8px' }}>
                  {/* 这里需要动态获取装修公司列表 */}
                  <Option value="1">装修公司A</Option>
                  <Option value="2">装修公司B</Option>
                </Select>
              </Form.Item>
            </Col>
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
          </Row>

          <Form.Item
            name="amount"
            label="合同金额(元)"
            rules={[{ required: true, message: '请输入合同金额' }]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%', borderRadius: '8px' }}
              placeholder="请输入合同金额"
              size="large"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="开始日期"
                rules={[{ required: true, message: '请选择开始日期' }]}
              >
                <DatePicker
                  style={{ width: '100%', borderRadius: '8px' }}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="结束日期"
                rules={[{ required: true, message: '请选择结束日期' }]}
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
              <Option value="pending">待审核</Option>
              <Option value="audited">已审核</Option>
              <Option value="signed">已签署</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="file"
            label="合同文件"
            rules={[editingContract ? {} : { required: true, message: '请上传合同文件' }]}
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
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            >
              <Button
                icon={<UploadOutlined />}
                size="large"
                style={{ borderRadius: '8px' }}
              >
                上传文件
              </Button>
              <Paragraph type="secondary">支持PDF、Word、图片格式，最大20MB</Paragraph>
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
                {editingContract ? '更新' : '创建'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};



export default ContractManagement;