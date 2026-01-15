import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Statistic, Progress, List, Typography, Button, message, Space, Skeleton, Tag, Tooltip, Divider } from 'antd';
import {
  DollarOutlined, CheckCircleOutlined, HomeOutlined, BarChartOutlined,
  PlusOutlined, CloudOutlined, ThunderboltOutlined, FileTextOutlined,
  AlertOutlined, ReloadOutlined, RocketOutlined, TeamOutlined,
  FileProtectOutlined, BulbOutlined, SettingOutlined
} from '@ant-design/icons';
import * as echarts from 'echarts';
import { projectAPI, constructionAPI, weatherAPI, noteAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [constructions, setConstructions] = useState([]);
  const [costs, setCosts] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [beijingWeather, setBeijingWeather] = useState(null);
  const [luoyangWeather, setLuoyangWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const chartRef = useRef(null);

  // 获取问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了';
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    if (hour < 22) return '晚上好';
    return '夜深了';
  };

  // 初始化数据
  useEffect(() => {
    fetchData();
    fetchWeatherData();
  }, []);

  // 绘制费用统计图表
  useEffect(() => {
    if (costs.length > 0 && chartRef.current) {
      drawCostChart();
    }
  }, [costs]);

  // 获取数据
  const fetchData = async () => {
    try {
      setLoading(true);

      // 使用封装的API服务获取数据
      const [projectData, constructionData, costData, noteData] = await Promise.all([
        projectAPI.getAll(),
        constructionAPI.getAll(),
        constructionAPI.getCosts(),
        noteAPI.getAll()
      ]);

      // 处理数据
      setProjects(projectData.data || projectData || []);
      setConstructions(constructionData.data || constructionData || []);
      setCosts(costData.data || costData || []);
      setNotes(noteData.data || noteData || []);
    } catch (error) {
      message.error('获取数据失败');
      console.error('Fetch data error:', error);

      // 发生错误时使用模拟数据
      setProjects([
        { id: 1, name: '三居室装修', houseType: '三室两厅', area: 120, budget: 150000 },
        { id: 2, name: '办公室改造', houseType: '办公空间', area: 200, budget: 300000 }
      ]);
      setConstructions([
        { id: 1, name: '三居室装修', stage: '水电改造', progress: 80, status: 'in_progress' },
        { id: 2, name: '三居室装修', stage: '瓦工施工', progress: 50, status: 'in_progress' },
        { id: 3, name: '办公室改造', stage: '设计阶段', progress: 100, status: 'completed' }
      ]);
      setCosts([
        { id: 1, category: '材料', amount: 50000 },
        { id: 2, category: '人工', amount: 30000 },
        { id: 3, category: '设计', amount: 10000 },
        { id: 4, category: '其他', amount: 5000 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 获取天气数据（从后端获取，带缓存）
  const fetchWeatherData = async () => {
    try {
      setWeatherLoading(true);

      // 调用后端天气接口（后端会处理缓存，每天只调用一次API）
      const response = await weatherAPI.getAll();

      if (response.status === 'success' && response.data) {
        setBeijingWeather(response.data.beijing);
        setLuoyangWeather(response.data.luoyang);
      } else {
        throw new Error('获取天气数据失败');
      }
    } catch (error) {
      console.error('Fetch weather data error:', error);

      // 发生错误时使用模拟数据
      setBeijingWeather({
        location: { name: '北京' },
        daily: [
          { date: new Date().toISOString().split('T')[0], text_day: '晴', code_day: '0', text_night: '晴', code_night: '0', high: 5, low: -5, precip: 0, wind_direction: '北风', wind_speed: 15, wind_scale: 3 }
        ]
      });
      setLuoyangWeather({
        location: { name: '洛阳' },
        daily: [
          { date: new Date().toISOString().split('T')[0], text_day: '多云', code_day: '4', text_night: '阴', code_night: '9', high: 3, low: -7, precip: 0, wind_direction: '西北风', wind_speed: 10, wind_scale: 2 }
        ]
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  // 刷新所有数据
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchData(), fetchWeatherData()]);
      message.success('数据已刷新');
    } catch (error) {
      message.error('刷新失败');
    } finally {
      setRefreshing(false);
    }
  };

  // 绘制费用统计图表
  const drawCostChart = () => {
    if (!chartRef.current) return;

    const myChart = echarts.init(chartRef.current);

    // 计算费用统计
    const categoryStats = costs.reduce((acc, cost) => {
      if (!acc[cost.category]) {
        acc[cost.category] = 0;
      }
      acc[cost.category] += cost.amount;
      return acc;
    }, {});

    // 更好的配色方案
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

    // 响应式
    const handleResize = () => {
      myChart.resize();
    };

    window.addEventListener('resize', handleResize);

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize);
      myChart.dispose();
    };
  };

  // 计算总费用
  const totalCost = costs.reduce((sum, cost) => sum + cost.amount, 0);

  // 计算平均进度
  const avgProgress = constructions.length > 0
    ? constructions.reduce((sum, item) => sum + item.progress, 0) / constructions.length
    : 0;

  // 计算进行中项目数
  const inProgressProjects = constructions.filter(item => item.status === 'in_progress').length;

  // 计算已完成项目数
  const completedProjects = constructions.filter(item => item.status === 'completed').length;

  // 获取最近的项目（最多3个）
  const recentProjects = projects.slice(0, 3);

  // 获取进行中的施工（最多5个）
  const activeConstructions = constructions
    .filter(item => item.status === 'in_progress')
    .slice(0, 5);

  // 获取最近的笔记（最多5条）
  const recentNotes = notes.slice(0, 5);

  // 笔记分类配置
  const NOTE_CATEGORIES = {
    'inspiration': { label: '💡 灵感想法', color: 'blue' },
    'daily': { label: '📝 施工笔记', color: 'green' },
    'warning': { label: '⚠️ 避坑指南', color: 'red' },
    'todo': { label: '📋 待办事项', color: 'orange' }
  };

  return (
    <div className="home-container" style={{ backgroundColor: '#f0f2f5', minHeight: 'calc(100vh - 112px)' }}>
      {/* 顶部欢迎区域 */}
      <div style={{
        marginBottom: '24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px',
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 装饰性背景元素 */}
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
        <div style={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          filter: 'blur(30px)'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title level={2} style={{ marginBottom: '12px', color: 'white', fontWeight: 'bold', fontSize: '32px' }}>
                <RocketOutlined style={{ marginRight: '12px' }} />
                {getGreeting()}，欢迎回来！
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.95)', fontSize: '16px', marginBottom: '16px', maxWidth: '600px' }}>
                这里是您的装修项目总览，快速了解项目进展和关键数据
              </Paragraph>
              <Space size="middle">
                <Tag color="cyan" style={{ borderRadius: '12px', padding: '4px 12px', fontSize: '13px' }}>
                  {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </Tag>
                <Tag color="purple" style={{ borderRadius: '12px', padding: '4px 12px', fontSize: '13px' }}>
                  {projects.length} 个活跃项目
                </Tag>
              </Space>
            </div>
            <Tooltip title="刷新数据">
              <Button
                type="text"
                icon={<ReloadOutlined spin={refreshing} />}
                onClick={handleRefresh}
                loading={refreshing}
                style={{
                  color: 'white',
                  fontSize: '20px',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none'
                }}
              />
            </Tooltip>
          </div>
        </div>
      </div>

      {/* 快捷操作区 */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
        }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <Text strong style={{ fontSize: '16px', color: '#333' }}>
            <ThunderboltOutlined style={{ color: '#faad14', marginRight: 8 }} />
            快捷操作
          </Text>
          <Space size="middle" wrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/my-projects')}
              style={{ borderRadius: '8px' }}
            >
              新建项目
            </Button>
            <Button
              icon={<FileTextOutlined />}
              onClick={() => navigate('/notes')}
              style={{ borderRadius: '8px' }}
            >
              装修笔记
            </Button>
            <Button
              icon={<TeamOutlined />}
              onClick={() => navigate('/company-selection')}
              style={{ borderRadius: '8px' }}
            >
              公司选择
            </Button>
            <Button
              icon={<BarChartOutlined />}
              onClick={() => navigate('/budget')}
              style={{ borderRadius: '8px' }}
            >
              预算管理
            </Button>
            <Button
              icon={<RocketOutlined />}
              onClick={() => navigate('/construction')}
              style={{ borderRadius: '8px' }}
            >
              施工管控
            </Button>
          </Space>
        </div>
      </Card>

      {/* 核心数据统计 - 突出重点 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(24, 144, 255, 0.12)',
              border: 'none',
              background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            bodyStyle={{ padding: '24px' }}
            onClick={() => navigate('/my-projects')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(24, 144, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(24, 144, 255, 0.12)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
              }}>
                <HomeOutlined style={{ color: 'white', fontSize: '28px' }} />
              </div>
            </div>
            <Statistic
              title={<Text strong style={{ fontSize: '14px', color: '#666' }}>项目总数</Text>}
              value={projects.length}
              suffix="个"
              valueStyle={{ color: '#1890ff', fontSize: '36px', fontWeight: 'bold', lineHeight: 1.2 }}
            />
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                进行中: <Text strong style={{ color: '#faad14' }}>{inProgressProjects}</Text>
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                已完成: <Text strong style={{ color: '#52c41a' }}>{completedProjects}</Text>
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(82, 196, 26, 0.12)',
              border: 'none',
              background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            bodyStyle={{ padding: '24px' }}
            onClick={() => navigate('/budget')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(82, 196, 26, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(82, 196, 26, 0.12)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
              }}>
                <DollarOutlined style={{ color: 'white', fontSize: '28px' }} />
              </div>
            </div>
            <Statistic
              title={<Text strong style={{ fontSize: '14px', color: '#666' }}>总费用</Text>}
              value={totalCost}
              suffix="元"
              precision={0}
              valueStyle={{ color: '#52c41a', fontSize: '36px', fontWeight: 'bold', lineHeight: 1.2 }}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              已支出费用统计
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(250, 173, 20, 0.12)',
              border: 'none',
              background: 'linear-gradient(135deg, #fffbe6 0%, #ffffff 100%)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            bodyStyle={{ padding: '24px' }}
            onClick={() => navigate('/my-projects')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(250, 173, 20, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(250, 173, 20, 0.12)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(250, 173, 20, 0.3)'
              }}>
                <ThunderboltOutlined style={{ color: 'white', fontSize: '28px' }} />
              </div>
            </div>
            <Statistic
              title={<Text strong style={{ fontSize: '14px', color: '#666' }}>平均进度</Text>}
              value={Math.round(avgProgress)}
              suffix="%"
              valueStyle={{ color: '#faad14', fontSize: '36px', fontWeight: 'bold', lineHeight: 1.2 }}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Progress
              percent={Math.round(avgProgress)}
              strokeWidth={8}
              strokeColor={{
                '0%': '#faad14',
                '100%': '#fa8c16',
              }}
              showInfo={false}
              style={{ marginBottom: 4 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(255, 77, 79, 0.12)',
              border: 'none',
              background: 'linear-gradient(135deg, #fff1f0 0%, #ffffff 100%)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            bodyStyle={{ padding: '24px' }}
            onClick={() => navigate('/my-projects')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 77, 79, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 77, 79, 0.12)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255, 77, 79, 0.3)'
              }}>
                <AlertOutlined style={{ color: 'white', fontSize: '28px' }} />
              </div>
            </div>
            <Statistic
              title={<Text strong style={{ fontSize: '14px', color: '#666' }}>进行中施工</Text>}
              value={inProgressProjects}
              suffix="项"
              valueStyle={{ color: '#ff4d4f', fontSize: '36px', fontWeight: 'bold', lineHeight: 1.2 }}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {inProgressProjects > 0 ? '需要关注的施工任务' : '暂无进行中的任务'}
            </Text>
          </Card>
        </Col>
      </Row>

      {/* 主要内容区域 - 两列布局 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* 左侧：项目列表和施工进度 */}
        <Col xs={24} lg={14}>
          {/* 我的项目 - 重点突出 */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  <HomeOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  我的项目
                  {projects.length > 0 && (
                    <Tag color="blue" style={{ marginLeft: 8, borderRadius: '8px' }}>
                      {projects.length}
                    </Tag>
                  )}
                </span>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/my-projects')}
                  style={{ borderRadius: '8px' }}
                >
                  新建项目
                </Button>
              </div>
            }
            style={{
              borderRadius: '16px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
              marginBottom: 16,
              border: 'none'
            }}
            hoverable
          >
            {loading ? (
              <Skeleton active />
            ) : projects.length > 0 ? (
              <List
                dataSource={recentProjects}
                renderItem={(item, index) => (
                  <List.Item
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #f0f0f0',
                      marginBottom: '12px',
                      padding: '16px',
                      background: index === 0 ? '#f6ffed' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onClick={() => navigate('/projects')}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '18px'
                        }}>
                          {item.name?.charAt(0) || '项'}
                        </div>
                      }
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Text strong style={{ fontSize: '16px' }}>{item.name || '未命名项目'}</Text>
                          {index === 0 && <Tag color="green">最新</Tag>}
                        </div>
                      }
                      description={
                        <Space size="large" style={{ marginTop: 8 }}>
                          <Text type="secondary">
                            <FileTextOutlined /> 户型: {item.houseType || item.type || '未知'}
                          </Text>
                          <Text type="secondary">面积: {item.area || 0}㎡</Text>
                          <Text type="secondary" style={{ color: '#52c41a', fontWeight: 'bold' }}>
                            预算: ¥{(item.budget || item.totalBudget || 0).toLocaleString()}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: '暂无项目，点击右上角创建新项目' }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <HomeOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                <Text type="secondary">暂无项目</Text>
                <br />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/projects')}
                  style={{ marginTop: 16 }}
                >
                  创建第一个项目
                </Button>
              </div>
            )}
            {projects.length > 3 && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button type="link" onClick={() => navigate('/projects')}>
                  查看全部项目 ({projects.length})
                </Button>
              </div>
            )}
          </Card>

          {/* 进行中的施工 - 重点突出 */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  <ThunderboltOutlined style={{ marginRight: 8, color: '#faad14' }} />
                  进行中的施工
                  {activeConstructions.length > 0 && (
                    <Tag color="processing" style={{ marginLeft: 8, borderRadius: '8px' }}>
                      {activeConstructions.length}
                    </Tag>
                  )}
                </span>
                <Button
                  type="primary"
                  icon={<RocketOutlined />}
                  onClick={() => navigate('/construction')}
                  style={{ borderRadius: '8px' }}
                >
                  管理施工
                </Button>
              </div>
            }
            style={{
              borderRadius: '16px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
              border: 'none'
            }}
            hoverable
          >
            {loading ? (
              <Skeleton active />
            ) : activeConstructions.length > 0 ? (
              <List
                size="small"
                dataSource={activeConstructions}
                renderItem={item => (
                  <List.Item
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #f0f0f0',
                      marginBottom: '12px',
                      padding: '16px',
                      background: 'white'
                    }}
                  >
                    <List.Item.Meta
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text strong>{item.name || '未命名项目'}</Text>
                          <Tag color="processing">进行中</Tag>
                        </div>
                      }
                      description={
                        <div>
                          <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                            {item.stage || '未指定阶段'}
                          </Text>
                          <Progress
                            percent={item.progress || 0}
                            size="small"
                            status="active"
                            strokeColor={{
                              '0%': '#108ee9',
                              '100%': '#87d068',
                            }}
                          />
                          <Text type="secondary" style={{ fontSize: '12px', marginTop: 4, display: 'block' }}>
                            进度: {item.progress || 0}%
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: '暂无进行中的施工' }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <RocketOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                <div>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                    暂无进行中的施工任务
                  </Text>
                  <Paragraph type="secondary" style={{ fontSize: '12px', marginBottom: 16 }}>
                    项目施工开始后，在「施工管控」页面记录进度
                  </Paragraph>
                  <Button
                    type="primary"
                    icon={<RocketOutlined />}
                    onClick={() => navigate('/construction')}
                    style={{ borderRadius: '8px' }}
                  >
                    去施工管控页面
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* 最近笔记 - 新增 */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  <BulbOutlined style={{ marginRight: 8, color: '#faad14' }} />
                  装修笔记
                  {notes.length > 0 && (
                    <Tag color="orange" style={{ marginLeft: 8, borderRadius: '8px' }}>
                      {notes.length}
                    </Tag>
                  )}
                </span>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/notes')}
                  style={{ borderRadius: '8px' }}
                >
                  写笔记
                </Button>
              </div>
            }
            style={{
              borderRadius: '16px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
              marginTop: 16,
              border: 'none'
            }}
            hoverable
          >
            {loading ? (
              <Skeleton active />
            ) : recentNotes.length > 0 ? (
              <>
                <List
                  size="small"
                  dataSource={recentNotes}
                  renderItem={item => (
                    <List.Item
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0',
                        marginBottom: '12px',
                        padding: '12px 16px',
                        background: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onClick={() => navigate('/notes')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: '8px',
                            background: `linear-gradient(135deg, ${
                              NOTE_CATEGORIES[item.category]?.color === 'blue' ? '#1890ff, #096dd9' :
                              NOTE_CATEGORIES[item.category]?.color === 'green' ? '#52c41a, #389e0d' :
                              NOTE_CATEGORIES[item.category]?.color === 'red' ? '#ff4d4f, #cf1322' :
                              '#faad14, #d48806'
                            })`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px'
                          }}>
                            {NOTE_CATEGORIES[item.category]?.label?.split(' ')[0] || '📝'}
                          </div>
                        }
                        title={
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <Text strong style={{ fontSize: '14px' }} ellipsis>
                              {item.title || '未命名笔记'}
                            </Text>
                            <Tag 
                              color={NOTE_CATEGORIES[item.category]?.color || 'default'} 
                              style={{ fontSize: '11px', borderRadius: '4px', margin: 0 }}
                            >
                              {NOTE_CATEGORIES[item.category]?.label || item.category}
                            </Tag>
                          </div>
                        }
                        description={
                          <div>
                            <Text 
                              type="secondary" 
                              style={{ fontSize: '12px', display: 'block' }}
                              ellipsis={{ rows: 2 }}
                            >
                              {item.content || '无内容'}
                            </Text>
                            {item.createdAt && (
                              <Text type="secondary" style={{ fontSize: '11px', marginTop: 4, display: 'block' }}>
                                {new Date(item.createdAt).toLocaleString('zh-CN', { 
                                  month: 'numeric', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Text>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
                {notes.length > 5 && (
                  <div style={{ textAlign: 'center', marginTop: 12 }}>
                    <Button type="link" onClick={() => navigate('/notes')}>
                      查看全部笔记 ({notes.length})
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <BulbOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                <div>
                  <Text type="secondary">暂无笔记</Text>
                </div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/notes')}
                  style={{ marginTop: 16, borderRadius: '8px' }}
                >
                  写第一条笔记
                </Button>
              </div>
            )}
          </Card>
        </Col>

        {/* 右侧：费用统计和天气 */}
        <Col xs={24} lg={10}>
          {/* 费用分布图表 */}
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  <BarChartOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                  费用分布
                </span>
                {costs.length > 0 && (
                  <Tag color="green" style={{ borderRadius: '8px' }}>
                    总计: ¥{totalCost.toLocaleString()}
                  </Tag>
                )}
              </div>
            }
            style={{
              borderRadius: '16px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
              marginBottom: 16,
              border: 'none'
            }}
            hoverable
          >
            {costs.length > 0 ? (
              <div ref={chartRef} style={{ width: '100%', height: 320 }}></div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <DollarOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
                <div>
                  <Text type="secondary" style={{ fontSize: '16px' }}>暂无费用数据</Text>
                </div>
                <Button
                  type="primary"
                  style={{ marginTop: 16, borderRadius: '8px' }}
                  onClick={() => navigate('/budget')}
                >
                  去添加费用
                </Button>
              </div>
            )}
          </Card>

          {/* 天气信息 - 优化显示 */}
          <Card
            title={
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                <CloudOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                今日天气
              </span>
            }
            style={{
              borderRadius: '16px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
              border: 'none'
            }}
            hoverable
          >
            {weatherLoading ? (
              <Skeleton active />
            ) : (
              <Row gutter={[12, 12]}>
                {beijingWeather && (
                  <Col span={24}>
                    <div style={{
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
                      padding: '20px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 100,
                        height: 100,
                        background: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '50%',
                        filter: 'blur(20px)'
                      }} />
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <Text strong style={{ fontSize: '18px', display: 'block', marginBottom: 8 }}>
                              📍 北京
                            </Text>
                            <Space>
                              <Tag color="blue" style={{ borderRadius: '6px' }}>
                                {beijingWeather.daily?.[0]?.text_day || 'N/A'}
                              </Tag>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {beijingWeather.daily?.[0]?.wind_direction || ''} {beijingWeather.daily?.[0]?.wind_scale || ''}级
                              </Text>
                            </Space>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Text strong style={{ fontSize: '28px', color: '#1890ff', display: 'block', lineHeight: 1 }}>
                              {beijingWeather.daily?.[0]?.high || 'N/A'}°
                            </Text>
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                              / {beijingWeather.daily?.[0]?.low || 'N/A'}°
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                )}
                {luoyangWeather && (
                  <Col span={24}>
                    <div style={{
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)',
                      padding: '20px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 100,
                        height: 100,
                        background: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '50%',
                        filter: 'blur(20px)'
                      }} />
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <Text strong style={{ fontSize: '18px', display: 'block', marginBottom: 8 }}>
                              📍 洛阳
                            </Text>
                            <Space>
                              <Tag color="orange" style={{ borderRadius: '6px' }}>
                                {luoyangWeather.daily?.[0]?.text_day || 'N/A'}
                              </Tag>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {luoyangWeather.daily?.[0]?.wind_direction || ''} {luoyangWeather.daily?.[0]?.wind_scale || ''}级
                              </Text>
                            </Space>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Text strong style={{ fontSize: '28px', color: '#fa8c16', display: 'block', lineHeight: 1 }}>
                              {luoyangWeather.daily?.[0]?.high || 'N/A'}°
                            </Text>
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                              / {luoyangWeather.daily?.[0]?.low || 'N/A'}°
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            )}
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default Home;