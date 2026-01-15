# 装修追踪系统后端

## 环境配置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 文件为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置以下配置：

```env
# 服务器配置
PORT=5001
NODE_ENV=development

# JWT配置（重要：生产环境请修改为强密码）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRES_IN=7d

# 数据库配置
DB_STORAGE=./db.sqlite

# 天气API配置（可选，默认使用内置密钥）
WEATHER_API_KEY=SgY8VJE-FquQ_9tFA
```

**重要提示**：生产环境部署时，请务必修改 `JWT_SECRET` 为一个强随机字符串。

### 3. 启动服务

开发模式（自动重启）：

```bash
npm run dev
```

生产模式：

```bash
npm start
```

服务将在 `http://localhost:5001` 启动。

## API 接口

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息（需要认证）
- `PUT /api/auth/update` - 更新用户信息（需要认证）
- `PUT /api/auth/password` - 修改密码（需要认证）

### 项目管理接口

- `GET /api/projects` - 获取项目列表（需要认证）
- `POST /api/projects` - 创建项目（需要认证）
- `GET /api/projects/:id` - 获取项目详情（需要认证）
- `PUT /api/projects/:id` - 更新项目（需要认证）
- `DELETE /api/projects/:id` - 删除项目（需要认证）

### 装修公司对比接口

- `GET /api/companies` - 获取装修公司列表（需要认证）
- `POST /api/companies` - 创建装修公司（需要认证）
- `GET /api/companies/:id` - 获取装修公司详情（需要认证）
- `PUT /api/companies/:id` - 更新装修公司（需要认证）
- `DELETE /api/companies/:id` - 删除装修公司（需要认证）
- `PUT /api/companies/:id/favorite` - 切换收藏状态（需要认证）

### 合同管理接口

- `GET /api/contracts` - 获取合同列表（需要认证）
- `POST /api/contracts` - 创建合同（需要认证）
- `GET /api/contracts/:id` - 获取合同详情（需要认证）
- `PUT /api/contracts/:id` - 更新合同（需要认证）
- `DELETE /api/contracts/:id` - 删除合同（需要认证）

### 文件上传接口

- `POST /api/upload/single` - 单文件上传（需要认证）
- `POST /api/upload/multiple` - 多文件上传（需要认证）
- `DELETE /api/upload/:filename` - 删除文件（需要认证）

## 数据库

项目使用 SQLite 数据库，数据库文件位于 `./db.sqlite`。

数据库会在首次启动时自动创建表结构。

## 注意事项

1. 确保 `uploads` 目录存在，用于存储上传的文件
2. 生产环境请修改 JWT_SECRET
3. 数据库文件 `db.sqlite` 请定期备份
