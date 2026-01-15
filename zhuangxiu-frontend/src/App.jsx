import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { Layout, Menu, Button } from 'antd'
import { UserOutlined, HomeOutlined, TeamOutlined, FileTextOutlined, PictureOutlined, BarChartOutlined, CheckCircleOutlined, RocketOutlined } from '@ant-design/icons'
import './App.css'

// 页面组件
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'

// 新的整合页面（推荐使用）
import MyProjects from './pages/MyProjects'
import Notes from './pages/Notes'
import CompanySelection from './pages/CompanySelection'

// 原有页面（保留兼容）
import ProjectManagement from './pages/ProjectManagement'
import CompanyComparison from './pages/CompanyComparison'
import ContractManagement from './pages/ContractManagement'
import DesignComparison from './pages/DesignComparison'
import ConstructionManagement from './pages/ConstructionManagement'
import AcceptanceComparison from './pages/AcceptanceComparison'
import NoteManagement from './pages/NoteManagement'
import MaterialManagement from './pages/MaterialManagement'
import BudgetManagement from './pages/BudgetManagement'

const { Header, Sider, Content } = Layout

// 私有路由组件
const PrivateRoute = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(!!localStorage.getItem('token'))
  const [user, setUser] = React.useState(JSON.parse(localStorage.getItem('user')))
  const location = useLocation()

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsLoggedIn(false)
  }

  // 根据当前路径计算menu key
  const getCurrentMenuKey = () => {
    const path = location.pathname
    switch (path) {
      case '/':
        return '1'
      case '/my-projects':
        return '2'
      case '/notes':
        return '3'
      case '/company-selection':
        return '4'
      case '/budget':
        return '5'
      case '/design':
        return '6'
      case '/construction':
        return '7'
      // 旧路由兼容
      case '/project':
        return '2'
      case '/company':
        return '4'
      case '/contract':
        return '4'
      case '/acceptance':
        return '2'
      case '/materials':
        return '5'
      default:
        return '1'
    }
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider width={200} style={{ background: '#001529', overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0 }}>
        <div className="logo" style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
          装修追踪系统
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getCurrentMenuKey()]}
          style={{ height: 'calc(100vh - 64px)', borderRight: 0, overflowY: 'auto' }}
          items={[
            { key: '1', icon: <HomeOutlined />, label: <a href="/">🏠 首页</a> },
            { key: '2', icon: <TeamOutlined />, label: <a href="/my-projects">📁 我的项目</a> },
            { key: '3', icon: <FileTextOutlined />, label: <a href="/notes">📝 装修笔记</a> },
            { key: '4', icon: <FileTextOutlined />, label: <a href="/company-selection">🏢 公司选择</a> },
            { key: '5', icon: <BarChartOutlined />, label: <a href="/budget">💰 预算管家</a> },
            { key: '6', icon: <PictureOutlined />, label: <a href="/design">📊 装修对比</a> },
            { key: '7', icon: <RocketOutlined />, label: <a href="/construction">🚀 施工管控</a> },
          ]}
        />
      </Sider>
      <Layout className="site-layout" style={{ marginLeft: 200, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Header className="site-layout-header" style={{ background: '#fff', padding: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: '24px', flexShrink: 0 }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>欢迎，{user.name}</span>
              <Button type="primary" danger onClick={handleLogout}>退出登录</Button>
            </div>
          )}
        </Header>
        <Content style={{ margin: '24px', padding: '24px', background: '#fff', overflow: 'auto', flex: 1 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

function App() {
  // 处理登录
  const handleLogin = (userInfo) => {
    // 登录成功后会在Login组件中设置localStorage
    // 这里不需要额外处理，因为PrivateRoute组件会在渲染时重新读取localStorage
  }

  return (
    <Router>
      <Routes>
        {/* 公共路由 */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />

        {/* 私有路由 */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Home />} />

          {/* 新的整合页面（推荐） */}
          <Route path="/my-projects" element={<MyProjects />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/company-selection" element={<CompanySelection />} />
          <Route path="/budget" element={<BudgetManagement />} />
          <Route path="/design" element={<DesignComparison />} />

          {/* 旧路由（兼容保留） */}
          <Route path="/project" element={<ProjectManagement />} />
          <Route path="/company" element={<CompanyComparison />} />
          <Route path="/contract" element={<ContractManagement />} />
          <Route path="/construction" element={<ConstructionManagement />} />
          <Route path="/acceptance" element={<AcceptanceComparison />} />
          <Route path="/materials" element={<MaterialManagement />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App