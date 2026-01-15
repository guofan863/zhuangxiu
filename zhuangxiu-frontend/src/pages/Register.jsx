import React from 'react';
import { Card, Form, Input, Button, message, Typography, Space, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, UserAddOutlined } from '@ant-design/icons';
import { authAPI } from '../services/api';

const { Title, Paragraph, Text } = Typography;

const Register = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError(null);

      // 使用封装的API服务注册
      const response = await authAPI.register({
        username: values.username,
        password: values.password,
        email: values.email,
        phone: values.phone
      });

      if (response.status === 'success') {
        message.success(response.message || '注册成功，请登录');
        // 延迟跳转，让用户看到成功消息
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        message.error(response.message || '注册失败');
      }
    } catch (error) {
      message.error('注册失败，请检查网络或输入信息');
      console.error('Register error:', error);
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
        <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>注册账号</Title>
        <Paragraph style={{ marginBottom: 0 }}>创建账号后开始管理您的装修项目</Paragraph>
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
          name="register"
          initialValues={{ agree: false }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              placeholder="请输入用户名"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入正确的邮箱格式' }]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#1890ff' }} />}
              placeholder="请输入邮箱"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}
          >
            <Input
              prefix={<PhoneOutlined style={{ color: '#1890ff' }} />}
              placeholder="请输入手机号"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码长度至少为6位' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#1890ff' }} />}
              placeholder="请输入密码"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#1890ff' }} />}
              placeholder="请确认密码"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<UserAddOutlined />}
              style={{
                width: '100%',
                height: '40px',
                fontSize: '16px',
                borderRadius: '8px'
              }}
            >
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', fontSize: '14px' }}>
            <a href="/login" style={{ color: '#1890ff' }}>已有账号？立即登录</a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;