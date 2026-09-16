# 电商智能运营中台 - 开发环境搭建指南

## 前置要求

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+ (或使用 Docker)
- Redis 7.x (或使用 Docker)
- Git

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd dianshang1
```

### 2. 启动 Docker 服务

**注意**: 如果 Docker Desktop 未运行，请先启动 Docker Desktop。

```bash
cd docker
docker-compose up -d

# 验证服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

服务列表：
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- pgAdmin: `http://localhost:5050` (用户名: admin@example.com, 密码: admin123)

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local，填写必要的配置
# 特别是 CLAUDE_API_KEY
```

### 4. 安装依赖

**前端:**
```bash
cd frontend
npm install
```

**后端:**
```bash
cd backend
npm install
```

### 5. 初始化数据库

```bash
cd backend

# 生成 Prisma Client
npx prisma generate

# 执行数据库迁移（创建表）
npx prisma migrate dev --name init

# (可选) 查看数据库
npx prisma studio
```

### 6. 启动开发服务器

**后端** (终端 1):
```bash
cd backend
npm run start:dev

# 服务运行在 http://localhost:3000
```

**前端** (终端 2):
```bash
cd frontend
npm run dev

# 服务运行在 http://localhost:5173
```

## 验证安装

### 1. 检查后端 API

```bash
curl http://localhost:3000
# 应该返回: Hello World!
```

### 2. 访问前端

浏览器打开: http://localhost:5173

### 3. 检查数据库连接

访问 pgAdmin: http://localhost:5050

或使用 Prisma Studio:
```bash
cd backend
npx prisma studio
# 浏览器会自动打开 http://localhost:5555
```

## 常见问题

### 1. Docker 服务启动失败

**问题**: `Cannot connect to the Docker daemon`

**解决**:
- 确保 Docker Desktop 正在运行
- MacOS: 打开 Docker Desktop 应用
- Windows: 启动 Docker Desktop

### 2. 端口被占用

**问题**: `Port 5432 is already in use`

**解决**:
```bash
# 查找占用端口的进程
lsof -i :5432

# 停止本地 PostgreSQL（如果有）
brew services stop postgresql@14

# 或修改 docker-compose.yml 中的端口映射
```

### 3. 数据库迁移失败

**问题**: `prisma migrate dev` 失败

**解决**:
```bash
# 1. 确保 Docker 容器正在运行
docker ps

# 2. 检查环境变量
cat .env.local | grep DATABASE_URL

# 3. 手动连接测试
psql postgresql://postgres:postgres123@localhost:5432/ecommerce_platform

# 4. 重置数据库（谨慎使用）
npx prisma migrate reset
```

### 4. npm install 失败

**问题**: 依赖安装超时或失败

**解决**:
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json

# 使用淘宝镜像
npm install --registry=https://registry.npmmirror.com

# 或使用 legacy-peer-deps
npm install --legacy-peer-deps
```

## 项目结构

```
dianshang1/
├── frontend/           # 前端项目 (React + Vite)
│   ├── src/
│   │   ├── pages/      # 页面组件
│   │   ├── components/ # 公共组件
│   │   ├── services/   # API 服务
│   │   └── ...
│   └── package.json
├── backend/            # 后端项目 (NestJS)
│   ├── src/
│   │   ├── modules/    # 业务模块
│   │   ├── common/     # 公共模块
│   │   └── ...
│   ├── prisma/         # Prisma Schema
│   └── package.json
├── docker/             # Docker 配置
│   └── docker-compose.yml
├── shared/             # 前后端共享类型
└── docs/               # 文档
```

## 开发命令

### 前端

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
npm run lint         # 代码检查
```

### 后端

```bash
npm run start:dev    # 启动开发服务器（热重载）
npm run start:debug  # 启动调试模式
npm run build        # 构建
npm run start:prod   # 启动生产版本
npm run test         # 运行测试
npm run lint         # 代码检查
```

### 数据库

```bash
npx prisma generate       # 生成 Prisma Client
npx prisma migrate dev    # 创建并应用迁移
npx prisma migrate reset  # 重置数据库
npx prisma studio         # 打开数据库 GUI
npx prisma db pull        # 从数据库生成 schema
npx prisma db push        # 直接推送 schema 到数据库（不创建迁移）
```

### Docker

```bash
docker-compose up -d          # 启动所有服务
docker-compose down           # 停止所有服务
docker-compose ps             # 查看服务状态
docker-compose logs -f        # 查看日志
docker-compose restart        # 重启服务
```

## 下一步

1. 查看 [产品开发方案.md](../../产品开发方案.md) 了解产品设计
2. 查看 [开发规范文档.md](../../开发规范文档.md) 了解开发规范
3. 查看 [开发任务清单.md](../../开发任务清单.md) 了解开发计划
4. 开始开发第一个功能模块

## 获取帮助

- 项目文档: `docs/` 目录
- API 文档: 启动后端后访问 http://localhost:3000/api (待配置 Swagger)
- 问题反馈: 创建 GitHub Issue

---

**最后更新**: 2026-09-16
