import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Typography, Space, Checkbox, Alert } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const { Title, Paragraph, Text } = Typography;

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError(null);

      // 使用封装的API服务登录
      const response = await authAPI.login({
        username: values.username,
        password: values.password
      });

      if (response.status === 'success' && response.data) {
        message.success(response.message || '登录成功');
        // 保存token到localStorage
        const token = response.data.token;
        const user = response.data.user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        // 调用父组件的登录回调
        onLogin(user);
        // 跳转到首页
        navigate('/');
      } else {
        message.error(response.message || '登录失败');
      }
    } catch (error) {
      message.error('登录失败，请检查网络或账号密码');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: '0 auto',
      padding: '48px 0',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>装修追踪系统</Title>
        <Paragraph style={{ marginBottom: 0 }}>登录后开始管理您的装修项目</Paragraph>
      </div>

      <Card
        style={{
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
          border: 'none'
        }}
      >
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名/邮箱"
            rules={[{ required: true, message: '请输入用户名或邮箱' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              placeholder="请输入用户名或邮箱"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#1890ff' }} />}
              placeholder="请输入密码"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox style={{ fontSize: '14px' }}>记住我</Checkbox>
              </Form.Item>
              <a href="#" style={{ fontSize: '14px', color: '#1890ff' }}>忘记密码?</a>
            </Space>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                width: '100%',
                height: '40px',
                fontSize: '16px',
                borderRadius: '8px'
              }}
              loading={loading}
              icon={<LoginOutlined />}
            >
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', fontSize: '14px' }}>
            还没有账号? <a href="/register" style={{ color: '#1890ff' }}>立即注册</a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;