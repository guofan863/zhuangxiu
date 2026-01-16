import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Table, Modal, Form, Input, Select, DatePicker, InputNumber, Upload, message, Typography, Space, Popconfirm, Tabs, Row, Col, Progress, Alert, Statistic, Timeline, Tag, Empty, Skeleton } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, UploadOutlined, BarChartOutlined, DollarOutlined, ClockCircleOutlined, CheckCircleOutlined, LoadingOutlined, RocketOutlined, ThunderboltOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { constructionAPI, uploadAPI } from '../services/api';

const { Title, Paragraph, Text } = Typography;
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
    if (costs.length > 0 && chartRef.current) {
      // 延迟一下确保DOM已渲染
      const timer = setTimeout(() => {
        drawCostChart();
      }, 100);
      
      return () => {
        clearTimeout(timer);
      };
    } else if (costs.length === 0 && chartInstanceRef.current) {
      // 如果没有数据，清理图表
      if (chartInstanceRef.current && !chartInstanceRef.current.isDisposed()) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    }
  }, [costs]);

  // 获取数据
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 获取施工进度
      const constructionResponse = await constructionAPI.getAll();
      const constructionData = constructionResponse.data || constructionResponse || [];
      setConstructions(Array.isArray(constructionData) ? constructionData : []);

      // 获取费用记录
      const costResponse = await constructionAPI.getCosts();
      const costData = costResponse.data || costResponse || [];
      setCosts(Array.isArray(costData) ? costData : []);
    } catch (error) {
      // 不显示错误消息，只记录日志，保持数据为空数组
      console.error('获取数据失败:', error);
      setConstructions([]);
      setCosts([]);
    } finally {
      setLoading(false);
    }
  };

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // 绘制费用统计图表
  const drawCostChart = () => {
    if (!chartRef.current || costs.length === 0) {
      // 如果没有数据，清理图表实例
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
      return;
    }

    // 如果已存在图表实例，先清理
    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispose();
    }

    // 创建新的图表实例
    const myChart = echarts.init(chartRef.current);
    chartInstanceRef.current = myChart;

    // 计算费用统计
    const categoryStats = costs.reduce((acc, cost) => {
      if (!acc[cost.category]) {
        acc[cost.category] = 0;
      }
      acc[cost.category] += cost.amount || 0;
      return acc;
    }, {});

    const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'];

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ¥{c}<br/>占比: {d}%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#333',
        borderWidth: 0,
        textStyle: {
          color: '#fff'
        }
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        textStyle: {
          fontSize: 12
        }
      },
      color: colors,
      series: [
        {
          name: '费用',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}\n¥{c}',
            fontSize: 12
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            },
            itemStyle: {
              shadowBlur: 15,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          },
          data: Object.entries(categoryStats).map(([category, amount]) => ({
            value: amount,
            name: category
          }))
        }
      ]
    };

    myChart.setOption(option);

    // 响应式处理
    const handleResize = () => {
      if (myChart && !myChart.isDisposed()) {
        myChart.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    // 返回清理函数（虽然这里不会自动执行，但可以在 useEffect 中使用）
    return () => {
      window.removeEventListener('resize', handleResize);
      if (myChart && !myChart.isDisposed()) {
        myChart.dispose();
      }
    };
  };

  // 组件卸载时清理图表
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current && !chartInstanceRef.current.isDisposed()) {
        chartInstanceRef.current.dispose();
      }
      // 清理 resize 监听器
      const handleResize = () => {};
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
      const response = await uploadAPI.uploadSingle(file);
      
      if (response.status === 'success' || response.url) {
        message.success('文件上传成功');
        return {
          uid: file.uid,
          name: file.name,
          status: 'done',
          url: response.url || response.data?.url
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
      render: (text) => {
        const progress = text || 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress 
              percent={progress} 
              size="small" 
              status={progress === 100 ? 'success' : 'active'}
              strokeColor={progress === 100 ? '#52c41a' : '#1890ff'}
              style={{ flex: 1, maxWidth: 200 }}
            />
            <Text type="secondary" style={{ fontSize: '12px', minWidth: 40 }}>
              {progress}%
            </Text>
          </div>
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text) => {
        const statusMap = {
          'not_started': { label: '未开始', color: 'default' },
          'in_progress': { label: '进行中', color: 'processing' },
          'completed': { label: '已完成', color: 'success' }
        };
        const status = statusMap[text] || { label: text, color: 'default' };
        return <Tag color={status.color}>{status.label}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small"
            icon={<EditOutlined />} 
            onClick={() => openEditModal(record)}
            style={{ borderRadius: '6px' }}
          >
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
            <Button 
              danger 
              size="small"
              icon={<DeleteOutlined />}
              style={{ borderRadius: '6px' }}
            >
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
      render: (text) => {
        const amount = text || 0;
        return (
          <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
            ¥{new Intl.NumberFormat('zh-CN').format(amount)}
          </Text>
        );
      }
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
        const statusMap = {
          'pending': { label: '待支付', color: 'warning' },
          'paid': { label: '已支付', color: 'success' },
          'refunded': { label: '已退款', color: 'default' }
        };
        const status = statusMap[text] || { label: text, color: 'default' };
        return <Tag color={status.color}>{status.label}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small"
            icon={<EditOutlined />} 
            onClick={() => openEditCostModal(record)}
            style={{ borderRadius: '6px' }}
          >
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
            <Button 
              danger 
              size="small"
              icon={<DeleteOutlined />}
              style={{ borderRadius: '6px' }}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 计算总费用
  const totalCost = costs.reduce((sum, cost) => sum + cost.amount, 0);

  // 装修施工流程步骤
  const constructionSteps = [
    {
      key: 'design',
      title: '设计阶段',
      icon: <BarChartOutlined />,
      color: '#1890ff',
      duration: '7-15天',
      description: '量房设计、方案确认、预算核算',
      subSteps: [
        '现场量房测量',
        '设计方案制定',
        '方案审核确认',
        '预算报价核算',
        '合同签订'
      ]
    },
    {
      key: 'preparation',
      title: '前期准备',
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
      duration: '3-7天',
      description: '材料采购、工人安排、场地准备',
      subSteps: [
        '主材采购',
        '辅材采购',
        '工人班组安排',
        '施工场地清理',
        '水电材料到位'
      ]
    },
    {
      key: 'water_electric',
      title: '水电改造',
      icon: <LoadingOutlined />,
      color: '#faad14',
      duration: '10-15天',
      description: '水管、电路重新布局安装',
      subSteps: [
        '水电线路规划',
        '墙体开槽',
        '水管安装',
        '电路布线',
        '强弱电安装',
        '水电验收'
      ]
    },
    {
      key: 'masonry',
      title: '泥瓦工程',
      icon: <ClockCircleOutlined />,
      color: '#722ed1',
      duration: '15-25天',
      description: '墙体砌筑、地面基层处理',
      subSteps: [
        '墙体砌筑',
        '防水施工',
        '地面找平',
        '墙面基层处理',
        '阳台防水'
      ]
    },
    {
      key: 'woodworking',
      title: '木工制作',
      icon: <CheckCircleOutlined />,
      color: '#13c2c2',
      duration: '12-18天',
      description: '橱柜、门窗、吊顶制作安装',
      subSteps: [
        '门窗制作安装',
        '吊顶制作安装',
        '橱柜制作安装',
        '鞋柜制作安装',
        '护墙板安装'
      ]
    },
    {
      key: 'painting',
      title: '油漆工程',
      icon: <LoadingOutlined />,
      color: '#eb2f96',
      duration: '8-12天',
      description: '墙面涂刷、地面铺贴',
      subSteps: [
        '墙面基层处理',
        '乳胶漆涂刷',
        '地面砖铺贴',
        '踢脚线安装',
        '墙面修补'
      ]
    },
    {
      key: 'installation',
      title: '安装工程',
      icon: <ClockCircleOutlined />,
      color: '#fa541c',
      duration: '5-10天',
      description: '五金、电器、洁具安装',
      subSteps: [
        '开关插座安装',
        '灯具安装',
        '洁具安装',
        '五金件安装',
        '电器设备安装'
      ]
    },
    {
      key: 'final',
      title: '收尾验收',
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
      duration: '3-7天',
      description: '清洁、验收、交付使用',
      subSteps: [
        '卫生清洁',
        '电器调试',
        '门窗调试',
        '客户验收',
        '交付使用'
      ]
    }
  ];

  // 获取当前施工阶段状态
  const getStepStatus = (stepKey) => {
    // 查找正在进行的施工项目
    const inProgressConstructions = constructions.filter(c => c.status === 'in_progress');
    const completedConstructions = constructions.filter(c => c.status === 'completed');

    if (inProgressConstructions.length === 0 && completedConstructions.length === 0) return 'wait';

    // 根据施工阶段判断状态
    const stageMap = {
      '水电': 'water_electric',
      '泥瓦': 'masonry',
      '木工': 'woodworking',
      '油漆': 'painting',
      '安装': 'installation'
    };

    // 获取所有已完成的阶段
    const completedStages = completedConstructions.map(c => stageMap[c.stage]).filter(Boolean);
    const inProgressStages = inProgressConstructions.map(c => stageMap[c.stage]).filter(Boolean);

    if (completedStages.includes(stepKey)) return 'finish';
    if (inProgressStages.includes(stepKey)) return 'process';

    // 如果有进行中的项目，判断当前阶段
    if (inProgressStages.length > 0) {
      const currentStepIndex = constructionSteps.findIndex(step => inProgressStages.includes(step.key));
      const targetStepIndex = constructionSteps.findIndex(step => step.key === stepKey);

      if (targetStepIndex < currentStepIndex) return 'finish';
      if (targetStepIndex === currentStepIndex) return 'process';
    }

    return 'wait';
  };

  // 计算整体施工进度
  const calculateOverallProgress = () => {
    const totalSteps = constructionSteps.length;
    const completedSteps = constructionSteps.filter(step => getStepStatus(step.key) === 'finish').length;
    const inProgressSteps = constructionSteps.filter(step => getStepStatus(step.key) === 'process').length;

    return Math.round(((completedSteps + inProgressSteps * 0.5) / totalSteps) * 100);
  };

  return (
    <div className="construction-management-container" style={{ 
      padding: '24px', 
      backgroundColor: '#f0f2f5', 
      minHeight: 'calc(100vh - 112px)' 
    }}>
      {/* 顶部标题区域 */}
      <div style={{
        marginBottom: '32px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '32px',
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Title level={2} style={{ color: 'white', marginBottom: '8px', fontWeight: 'bold' }}>
            <RocketOutlined style={{ marginRight: '12px' }} />
            施工管控中心
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.95)', fontSize: '16px', margin: 0 }}>
            查看完整的装修施工流程，管理项目进度和费用记录，实时监控工程进展
          </Paragraph>
        </div>
      </div>

      <Tabs defaultActiveKey="construction">
        <TabPane tab="施工进度" key="construction">
          {/* 施工流程时间线 */}
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{ color: '#1890ff' }} />
                装修施工流程
                <Tag color="blue" style={{ borderRadius: '12px' }}>
                  {constructionSteps.filter(step => getStepStatus(step.key) === 'finish').length}/{constructionSteps.length} 阶段
                </Tag>
              </Space>
            }
            style={{ marginBottom: 24, borderRadius: '16px', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)', border: 'none' }}
            bodyStyle={{ padding: '24px' }}
            extra={
              <Space direction="vertical" size={0}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  总工期约 60-100 天
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Progress
                    percent={calculateOverallProgress()}
                    size="small"
                    strokeColor="#1890ff"
                    style={{ width: '80px' }}
                    showInfo={false}
                  />
                  <Text strong style={{ fontSize: '12px', color: '#1890ff' }}>
                    {calculateOverallProgress()}%
                  </Text>
                </div>
              </Space>
            }
          >
            <Timeline
              mode="alternate"
              style={{ paddingTop: '20px' }}
            >
              {constructionSteps.map((step, index) => {
                const status = getStepStatus(step.key);
                const dotColor = status === 'finish' ? step.color :
                               status === 'process' ? '#faad14' : '#d9d9d9';

                return (
                  <Timeline.Item
                    key={step.key}
                    color={dotColor}
                    dot={
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: dotColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}>
                        {step.icon}
                      </div>
                    }
                  >
                    <Card
                      size="small"
                      style={{
                        borderRadius: '8px',
                        border: status === 'process' ? `2px solid ${step.color}` : '1px solid #f0f0f0',
                        background: status === 'process' ? `${step.color}08` : 'white',
                        boxShadow: status === 'process' ? `0 0 12px ${step.color}20` : 'none'
                      }}
                    >
                      <div style={{ padding: '8px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <Text strong style={{ fontSize: '16px', color: step.color }}>
                            {step.title}
                          </Text>
                          <Tag color={status === 'finish' ? 'green' : status === 'process' ? 'orange' : 'default'}>
                            {status === 'finish' ? '已完成' : status === 'process' ? '进行中' : '待开始'}
                          </Tag>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            预计 {step.duration}
                          </Text>
                        </div>
                        <Paragraph style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                          {step.description}
                        </Paragraph>
                        <div style={{ marginTop: '12px' }}>
                          <Text strong style={{ fontSize: '13px', color: '#333' }}>主要工作：</Text>
                          <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {step.subSteps.map((subStep, subIndex) => (
                              <Tag
                                key={subIndex}
                                size="small"
                                style={{
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  margin: 0
                                }}
                              >
                                {subStep}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Timeline.Item>
                );
              })}
            </Timeline>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <Typography.Text strong style={{ fontSize: '16px' }}>施工进度列表</Typography.Text>
              <br />
              <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                记录和管理具体的施工任务进度
              </Typography.Text>
            </div>
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
            style={{ 
              borderRadius: '16px', 
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
              border: 'none'
            }}
          >
            {constructions.length === 0 && !loading ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                      暂无施工进度信息
                    </Text>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={openCreateModal}
                      style={{ borderRadius: '8px' }}
                    >
                      添加第一条施工进度
                    </Button>
                  </div>
                }
              />
            ) : (
              <Table
                columns={constructionColumns}
                dataSource={constructions}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: '暂无数据' }}
                scroll={{ x: 1000 }}
              />
            )}
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
              <Card 
                style={{ 
                  borderRadius: '16px',
                  boxShadow: '0 4px 16px rgba(82, 196, 26, 0.12)',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)'
                }}
              >
                <Statistic 
                  title="总费用" 
                  value={totalCost} 
                  prefix={<DollarOutlined />} 
                  suffix="元" 
                  precision={2}
                  valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Card
                title={
                  <Space>
                    <BarChartOutlined style={{ color: '#52c41a' }} />
                    <span>费用分布</span>
                  </Space>
                }
                style={{ 
                  borderRadius: '16px', 
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                  border: 'none'
                }}
              >
                {costs.length > 0 ? (
                  <div ref={chartRef} style={{ width: '100%', height: 320 }}></div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无费用数据"
                    style={{ padding: '40px 0' }}
                  />
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card
                hoverable
                style={{ 
                  borderRadius: '16px', 
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                  border: 'none'
                }}
              >
                {costs.length === 0 && !loading ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                          暂无费用记录信息
                        </Text>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={openCreateCostModal}
                          style={{ borderRadius: '8px' }}
                        >
                          添加第一条费用记录
                        </Button>
                      </div>
                    }
                  />
                ) : (
                  <Table
                    columns={costColumns}
                    dataSource={costs}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: '暂无数据' }}
                    scroll={{ x: 1000 }}
                  />
                )}
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