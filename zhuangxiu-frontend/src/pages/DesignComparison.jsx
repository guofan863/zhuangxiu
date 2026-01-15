import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Input, Select, Upload, message, Typography, Space, Popconfirm, Tabs, Row, Col, Image, Slider, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, UploadOutlined, PictureOutlined } from '@ant-design/icons';
import { designAPI, projectAPI, uploadAPI } from '../services/api';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const DesignComparison = () => {
  const [designs, setDesigns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [comparisonVisible, setComparisonVisible] = useState(false);
  const [editingDesign, setEditingDesign] = useState(null);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();
  const [designFileList, setDesignFileList] = useState([]);
  const [effectFileList, setEffectFileList] = useState([]);
  const [actualFileList, setActualFileList] = useState([]);
  const [opacity, setOpacity] = useState(50);

  // 获取设计图列表和项目列表
  useEffect(() => {
    fetchDesigns();
    fetchProjects();
  }, []);

  // 获取设计图列表
  const fetchDesigns = async () => {
    try {
      setLoading(true);
      setError(null);

      // 使用封装的API服务获取设计图列表
      const response = await designAPI.getAll();
      setDesigns(response.data || response || []);
    } catch (error) {
      message.error('获取设计图列表失败');
      console.error('Fetch designs error:', error);
      setError('获取设计图列表失败，请检查网络连接');

      // 模拟数据（用于演示）
      setDesigns([
        {
          id: 1,
          name: '客厅设计',
          projectName: '三居室装修',
          spaceType: '客厅',
          constructionStage: '木工',
          designImage: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=modern%20living%20room%20design%20with%20minimalist%20style&size=800x600',
          effectImage: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=modern%20living%20room%20rendering%20with%20minimalist%20style&size=800x600',
          actualImage: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=real%20modern%20living%20room%20with%20minimalist%20style&size=800x600'
        },
        {
          id: 2,
          name: '卧室设计',
          projectName: '三居室装修',
          spaceType: '卧室',
          constructionStage: '油漆',
          designImage: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=modern%20bedroom%20design%20with%20warm%20colors&size=800x600',
          effectImage: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=modern%20bedroom%20rendering%20with%20warm%20colors&size=800x600',
          actualImage: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=real%20modern%20bedroom%20with%20warm%20colors&size=800x600'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 获取项目列表
  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      const projectsList = response.data || response || [];
      setProjects(Array.isArray(projectsList) ? projectsList : []);
    } catch (error) {
      console.error('Fetch projects error:', error);
      setProjects([]);
    }
  };

  // 打开创建设计图弹窗
  const openCreateModal = () => {
    setEditingDesign(null);
    form.resetFields();
    setDesignFileList([]);
    setEffectFileList([]);
    setActualFileList([]);
    setVisible(true);
  };

  // 打开编辑设计图弹窗
  const openEditModal = (design) => {
    setEditingDesign(design);
    form.setFieldsValue({
      projectId: design.projectId,
      spaceType: design.spaceType,
      constructionStage: design.constructionStage,
      name: design.name,
      description: design.description
    });
    setDesignFileList(design.designImage ? [{ url: design.designImage, name: '设计图' }] : []);
    setEffectFileList(design.effectImage ? [{ url: design.effectImage, name: '效果图' }] : []);
    setActualFileList(design.actualImage ? [{ url: design.actualImage, name: '实拍图' }] : []);
    setVisible(true);
  };

  // 打开对比弹窗
  const openComparisonModal = (design) => {
    setSelectedDesign(design);
    setOpacity(50);
    setComparisonVisible(true);
  };

  // 关闭弹窗
  const closeModal = () => {
    setVisible(false);
    setEditingDesign(null);
    form.resetFields();
    setDesignFileList([]);
    setEffectFileList([]);
    setActualFileList([]);
  };

  // 关闭对比弹窗
  const closeComparisonModal = () => {
    setComparisonVisible(false);
    setSelectedDesign(null);
  };

  // 处理文件上传
  const handleFileUpload = async (file) => {
    try {
      const response = await uploadAPI.uploadSingle(file);

      if (response.status === 'success' && response.data) {
        message.success('文件上传成功');
        return {
          uid: file.uid,
          name: file.name,
          status: 'done',
          url: response.data.url
        };
      } else {
        message.error(response.message || '文件上传失败');
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
      const designImage = designFileList.length > 0 ? designFileList[0].url : editingDesign?.designImage;
      const effectImage = effectFileList.length > 0 ? effectFileList[0].url : editingDesign?.effectImage;
      const actualImage = actualFileList.length > 0 ? actualFileList[0].url : editingDesign?.actualImage;

      if (editingDesign) {
        // 更新设计图
        const response = await designAPI.update(editingDesign.id, {
          ...values,
          designImage,
          effectImage,
          actualImage
        });

        if (response.status === 'success' || response.id) {
          message.success('设计图更新成功');
          fetchDesigns();
          closeModal();
        } else {
          message.error(response.message || '设计图更新失败');
        }
      } else {
        // 创建设计图
        const response = await designAPI.create({
          ...values,
          designImage,
          effectImage,
          actualImage
        });

        if (response.status === 'success' || response.id) {
          message.success('设计图创建成功');
          fetchDesigns();
          fetchProjects(); // 刷新项目列表
          closeModal();
        } else {
          message.error(response.message || '设计图创建失败');
        }
      }
    } catch (error) {
      message.error('操作失败，请检查网络');
      console.error('Submit design error:', error);
      setError('操作失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 删除设计图
  const deleteDesign = async (id) => {
    try {
      setLoading(true);
      setError(null);

      // 使用封装的API服务删除设计图
      const response = await designAPI.delete(id);

      if (response.status === 'success' || response.message === '删除成功') {
        message.success('设计图删除成功');
        fetchDesigns();
      } else {
        message.error(response.message || '设计图删除失败');
      }
    } catch (error) {
      message.error('删除失败，请检查网络');
      console.error('Delete design error:', error);
      setError('删除失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 表格列配置
  const columns = [
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
      title: '空间类型',
      dataIndex: 'spaceType',
      key: 'spaceType'
    },
    {
      title: '施工阶段',
      dataIndex: 'constructionStage',
      key: 'constructionStage'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Button icon={<PictureOutlined />} onClick={() => openComparisonModal(record)}>
            对比
          </Button>
          <Popconfirm
            title="确定删除该设计图吗？"
            description="删除后不可恢复"
            onConfirm={() => deleteDesign(record.id)}
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
    <div className="design-comparison-container" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>设计对比</Title>
        <Paragraph>对比设计图、效果图和实拍图，评估装修效果与设计的一致性</Paragraph>
      </div>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Typography.Text strong>设计图列表</Typography.Text>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
          style={{ borderRadius: '8px' }}
        >
          添加设计图
        </Button>
      </div>

      <Card
        hoverable
        style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
      >
        <Table
          columns={columns}
          dataSource={designs}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: '暂无设计图信息' }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 创建/编辑设计图弹窗 */}
      <Modal
        title={editingDesign ? '编辑设计图' : '添加设计图'}
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
            label="名称"
            rules={[{ required: true, message: '请输入设计图名称' }]}
          >
            <Input placeholder="请输入设计图名称" size="large" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="projectId"
                label="项目"
                rules={[{ required: true, message: '请选择项目' }]}
              >
                <Select placeholder="请选择项目" size="large" style={{ width: '100%', borderRadius: '8px' }}>
                  {projects.map(project => (
                    <Option key={project.id} value={project.id}>
                      {project.name || `项目${project.id}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="spaceType"
                label="空间类型"
                rules={[{ required: true, message: '请选择空间类型' }]}
              >
                <Select placeholder="请选择空间类型" size="large" style={{ width: '100%', borderRadius: '8px' }}>
                  <Option value="客厅">客厅</Option>
                  <Option value="卧室">卧室</Option>
                  <Option value="厨房">厨房</Option>
                  <Option value="卫生间">卫生间</Option>
                  <Option value="阳台">阳台</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="constructionStage"
            label="施工阶段"
            rules={[{ required: true, message: '请选择施工阶段' }]}
          >
            <Select placeholder="请选择施工阶段" size="large" style={{ width: '100%', borderRadius: '8px' }}>
              <Option value="水电">水电</Option>
              <Option value="泥瓦">泥瓦</Option>
              <Option value="木工">木工</Option>
              <Option value="油漆">油漆</Option>
              <Option value="软装">软装</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="设计图"
            rules={[editingDesign && editingDesign.designImage ? {} : { required: true, message: '请上传设计图' }]}
          >
            <Upload
              fileList={designFileList}
              customRequest={({ file, onSuccess, onError }) => {
                handleFileUpload(file).then(result => {
                  if (result.status === 'done') {
                    setDesignFileList([result]);
                    onSuccess(result);
                  } else {
                    onError(new Error('上传失败'));
                  }
                });
              }}
              onRemove={() => setDesignFileList([])}
              maxCount={1}
              accept=".jpg,.jpeg,.png"
            >
              <Button
                icon={<UploadOutlined />}
                size="large"
                style={{ borderRadius: '8px' }}
              >
                上传设计图
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="效果图"
          >
            <Upload
              fileList={effectFileList}
              customRequest={({ file, onSuccess, onError }) => {
                handleFileUpload(file).then(result => {
                  if (result.status === 'done') {
                    setEffectFileList([result]);
                    onSuccess(result);
                  } else {
                    onError(new Error('上传失败'));
                  }
                });
              }}
              onRemove={() => setEffectFileList([])}
              maxCount={1}
              accept=".jpg,.jpeg,.png"
            >
              <Button
                icon={<UploadOutlined />}
                size="large"
                style={{ borderRadius: '8px' }}
              >
                上传效果图
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="实拍图"
          >
            <Upload
              fileList={actualFileList}
              customRequest={({ file, onSuccess, onError }) => {
                handleFileUpload(file).then(result => {
                  if (result.status === 'done') {
                    setActualFileList([result]);
                    onSuccess(result);
                  } else {
                    onError(new Error('上传失败'));
                  }
                });
              }}
              onRemove={() => setActualFileList([])}
              maxCount={1}
              accept=".jpg,.jpeg,.png"
            >
              <Button
                icon={<UploadOutlined />}
                size="large"
                style={{ borderRadius: '8px' }}
              >
                上传实拍图
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
                {editingDesign ? '更新' : '创建'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* 对比弹窗 */}
      {selectedDesign && (
        <Modal
          title="设计图对比"
          open={comparisonVisible}
          onCancel={closeComparisonModal}
          footer={null}
          width={1000}
          style={{
            borderRadius: '8px'
          }}
        >
          <Tabs defaultActiveKey="side">
            <TabPane tab="并列对比" key="side">
              <Row gutter={16}>
                {selectedDesign.designImage && (
                  <Col span={8}>
                    <Card
                      title="设计图"
                      style={{ borderRadius: '8px' }}
                    >
                      <Image src={selectedDesign.designImage} alt="设计图" style={{ width: '100%' }} />
                    </Card>
                  </Col>
                )}
                {selectedDesign.effectImage && (
                  <Col span={8}>
                    <Card
                      title="效果图"
                      style={{ borderRadius: '8px' }}
                    >
                      <Image src={selectedDesign.effectImage} alt="效果图" style={{ width: '100%' }} />
                    </Card>
                  </Col>
                )}
                {selectedDesign.actualImage && (
                  <Col span={8}>
                    <Card
                      title="实拍图"
                      style={{ borderRadius: '8px' }}
                    >
                      <Image src={selectedDesign.actualImage} alt="实拍图" style={{ width: '100%' }} />
                    </Card>
                  </Col>
                )}
              </Row>
            </TabPane>
            <TabPane tab="叠加对比" key="overlay">
              {selectedDesign.designImage && selectedDesign.actualImage && (
                <div>
                  <Card
                    title="设计图 vs 实拍图"
                    style={{ borderRadius: '8px' }}
                  >
                    <div style={{ position: 'relative', width: '100%', height: 500 }}>
                      <Image src={selectedDesign.designImage} alt="设计图" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      <Image
                        src={selectedDesign.actualImage}
                        alt="实拍图"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          opacity: opacity / 100
                        }}
                      />
                    </div>
                    <div style={{ marginTop: 20 }}>
                      <Paragraph>调整透明度：{opacity}%</Paragraph>
                      <Slider
                        value={opacity}
                        onChange={setOpacity}
                        min={0}
                        max={100}
                      />
                    </div>
                  </Card>
                </div>
              )}
            </TabPane>
          </Tabs>
        </Modal>
      )}
    </div>
  );
};

export default DesignComparison;