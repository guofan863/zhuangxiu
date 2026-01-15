import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Input, Select, DatePicker, Upload, message, Typography, Space, Popconfirm, Tabs, Row, Col, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, UploadOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { acceptanceAPI, uploadAPI } from '../services/api';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const AcceptanceComparison = () => {
  const [acceptances, setAcceptances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingAcceptance, setEditingAcceptance] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  // 获取验收记录列表
  useEffect(() => {
    fetchAcceptances();
  }, []);

  // 获取验收记录列表
  const fetchAcceptances = async () => {
    try {
      setLoading(true);
      const response = await acceptanceAPI.getAll();
      setAcceptances(response.data || response || []);
    } catch (error) {
      message.error('获取验收记录列表失败');
      console.error('Fetch acceptances error:', error);

      // 模拟数据（用于演示）
      setAcceptances([
        { id: 1, name: '水电验收', projectName: '三居室装修', stage: '水电', inspectionDate: new Date().toISOString(), passStatus: 'pass' },
        { id: 2, name: '泥瓦验收', projectName: '三居室装修', stage: '泥瓦', inspectionDate: new Date().toISOString(), passStatus: 'pending' },
        { id: 3, name: '木工验收', projectName: '办公室改造', stage: '木工', inspectionDate: new Date().toISOString(), passStatus: 'fail' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 打开创建验收记录弹窗
  const openCreateModal = () => {
    setEditingAcceptance(null);
    form.resetFields();
    setFileList([]);
    setVisible(true);
  };

  // 打开编辑验收记录弹窗
  const openEditModal = (acceptance) => {
    setEditingAcceptance(acceptance);
    form.setFieldsValue({
      projectId: acceptance.projectId,
      stage: acceptance.stage,
      name: acceptance.name,
      description: acceptance.description,
      expectedStandard: acceptance.expectedStandard,
      actualCondition: acceptance.actualCondition,
      passStatus: acceptance.passStatus,
      inspectionDate: acceptance.inspectionDate,
      inspector: acceptance.inspector,
      issues: acceptance.issues,
      rectificationDeadline: acceptance.rectificationDeadline,
      notes: acceptance.notes
    });
    setFileList(acceptance.images ? [{ url: acceptance.images, name: '验收图片' }] : []);
    setVisible(true);
  };

  // 关闭弹窗
  const closeModal = () => {
    setVisible(false);
    setEditingAcceptance(null);
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

      // 处理文件
      const images = fileList.length > 0 ? fileList[0].url : editingAcceptance?.images;

      const acceptanceData = {
        ...values,
        images,
        projectName: '三居室装修' // 模拟项目名称
      };

      if (editingAcceptance) {
        // 更新验收记录
        const response = await acceptanceAPI.update(editingAcceptance.id, acceptanceData);

        if (response.status === 'success' || response.id) {
          message.success('验收记录更新成功');
          fetchAcceptances();
          closeModal();
        } else {
          message.error(response.message || '验收记录更新失败');
        }
      } else {
        // 创建验收记录
        const response = await acceptanceAPI.create(acceptanceData);

        if (response.status === 'success' || response.id) {
          message.success('验收记录创建成功');
          fetchAcceptances();
          closeModal();
        } else {
          message.error(response.message || '验收记录创建失败');
        }
      }
    } catch (error) {
      message.error('操作失败，请检查网络');
      console.error('Submit acceptance error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 删除验收记录
  const deleteAcceptance = async (id) => {
    try {
      setLoading(true);
      const response = await acceptanceAPI.delete(id);

      if (response.status === 'success' || response.message === '删除成功') {
        message.success('验收记录删除成功');
        fetchAcceptances();
      } else {
        message.error(response.message || '验收记录删除失败');
      }
    } catch (error) {
      message.error('删除失败，请检查网络');
      console.error('Delete acceptance error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '验收项目',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '项目',
      dataIndex: 'projectName',
      key: 'projectName'
    },
    {
      title: '施工阶段',
      dataIndex: 'stage',
      key: 'stage'
    },
    {
      title: '验收日期',
      dataIndex: 'inspectionDate',
      key: 'inspectionDate',
      render: (text) => text ? new Date(text).toLocaleDateString() : '-'
    },
    {
      title: '验收结果',
      dataIndex: 'passStatus',
      key: 'passStatus',
      render: (text) => {
        let color = '';
        let textMap = {
          'pass': '通过',
          'fail': '不通过',
          'pending': '待验收'
        };

        switch (text) {
          case 'pass':
            color = 'green';
            break;
          case 'fail':
            color = 'red';
            break;
          case 'pending':
            color = 'orange';
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
            title="确定删除该验收记录吗？"
            description="删除后不可恢复"
            onConfirm={() => deleteAcceptance(record.id)}
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
    <div className="acceptance-comparison-container" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>验收对比</Title>
        <Paragraph>管理您的装修验收记录，包括添加、编辑和删除验收信息</Paragraph>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          添加验收记录
        </Button>
      </div>

      <Tabs defaultActiveKey="all">
        <TabPane tab="全部验收" key="all">
          <Card
            hoverable
            style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
          >
            <Table
              columns={columns}
              dataSource={acceptances}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: '暂无验收记录信息' }}
              scroll={{ x: 800 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="未通过验收" key="fail">
          <Card
            hoverable
            style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
          >
            <Table
              columns={columns}
              dataSource={acceptances.filter(item => item.passStatus === 'fail')}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: '暂无未通过验收记录信息' }}
              scroll={{ x: 800 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="待验收" key="pending">
          <Card
            hoverable
            style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
          >
            <Table
              columns={columns}
              dataSource={acceptances.filter(item => item.passStatus === 'pending')}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: '暂无待验收记录信息' }}
              scroll={{ x: 800 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 创建/编辑验收记录弹窗 */}
      <Modal
        title={editingAcceptance ? '编辑验收记录' : '添加验收记录'}
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
            label="验收项目名称"
            rules={[{ required: true, message: '请输入验收项目名称' }]}
          >
            <Input placeholder="请输入验收项目名称" size="large" style={{ borderRadius: '8px' }} />
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
                  <Option value="1">三居室装修</Option>
                  <Option value="2">办公室改造</Option>
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
            <Input.TextArea rows={3} placeholder="请输入验收项目描述" size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            name="expectedStandard"
            label="预期标准"
            rules={[{ required: true, message: '请输入预期标准' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入预期标准" size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            name="actualCondition"
            label="实际情况"
            rules={[{ required: true, message: '请输入实际情况' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入实际情况" size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="inspectionDate"
                label="验收日期"
                rules={[{ required: true, message: '请选择验收日期' }]}
              >
                <DatePicker style={{ width: '100%', borderRadius: '8px' }} size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="inspector"
                label="验收人"
                rules={[{ required: true, message: '请输入验收人' }]}
              >
                <Input placeholder="请输入验收人" size="large" style={{ borderRadius: '8px' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="passStatus"
                label="验收结果"
                rules={[{ required: true, message: '请选择验收结果' }]}
              >
                <Select placeholder="请选择验收结果" size="large" style={{ width: '100%', borderRadius: '8px' }}>
                  <Option value="pass">通过</Option>
                  <Option value="fail">不通过</Option>
                  <Option value="pending">待验收</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="rectificationDeadline"
                label="整改期限"
              >
                <DatePicker style={{ width: '100%', borderRadius: '8px' }} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="issues"
            label="问题描述"
          >
            <Input.TextArea rows={3} placeholder="请输入问题描述" size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            label="验收图片"
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
              <Button icon={<UploadOutlined />} size="large">
                上传验收图片
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注"
          >
            <Input.TextArea rows={3} placeholder="请输入备注信息" size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button onClick={closeModal} size="large">
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                {editingAcceptance ? '更新' : '创建'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AcceptanceComparison;