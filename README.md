# 电商数据分析平台 MVP

一个基于 NestJS + React + PostgreSQL 的多租户电商数据汇总与分析平台。

## 📋 项目概述

### 核心功能
1. **多租户架构** - 支持多个电商商户独立管理数据
2. **多店铺管理** - 汇总淘宝/拼多多/抖音等平台店铺数据
3. **数据看板** - 实时展示 GMV、订单量、转化率等核心指标
4. **趋势分析** - 可视化销售趋势、店铺占比、环比增长

### 技术栈
- **后端**: NestJS + Prisma ORM + PostgreSQL + Redis + JWT
- **前端**: React 18 + TypeScript + Vite + Ant Design + ECharts
- **基础设施**: Docker Compose

---

## 🚀 快速开始

### 前置要求
- Node.js >= 18
- Docker Desktop (用于 PostgreSQL 和 Redis)

### 1. 克隆项目
```bash
git clone <repo-url>
cd dianshang1
```

### 2. 启动数据库服务
```bash
docker-compose up -d
```

### 3. 后端启动
```bash
cd backend
npm install
npx prisma migrate dev        # 执行数据库迁移
npx tsx src/database/seeds/seed.ts  # 填充演示数据
npm run start:dev             # 启动后端 (http://localhost:3000)
```

### 4. 前端启动
```bash
cd frontend
npm install
npm run dev                   # 启动前端 (http://localhost:5173)
```

---

## 🔐 演示账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 系统管理员 | admin | admin123 |
| 商户管理员 | merchant1 | merchant123 |

---

## 📊 已实现功能

### ✅ 阶段 1: 基础架构
- [x] 数据库设计 (11张表: User, Tenant, Shop, Metric 等)
- [x] JWT 认证与授权系统
- [x] 多租户隔离中间件
- [x] Prisma ORM 集成

### ✅ 阶段 2: 核心业务
- [x] 租户管理 API (CRUD)
- [x] 店铺管理 API (支持淘宝/拼多多/抖音)
- [x] 数据看板 API (汇总指标/店铺分组/日趋势)
- [x] 前端登录页面
- [x] 前端数据看板页面

### 📦 演示数据
- 1 个演示租户 (演示电商商户)
- 3 个店铺 (淘宝/拼多多/抖音)
- 183 条历史数据 (61天 × 3店铺，包含真实波动)

---

## 🏗️ 项目结构

```
dianshang1/
├── backend/                 # NestJS 后端
│   ├── prisma/
│   │   └── schema.prisma   # 数据库模型定义
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/       # 认证模块
│   │   │   ├── tenant/     # 租户管理
│   │   │   ├── shop/       # 店铺管理
│   │   │   └── dashboard/  # 数据看板
│   │   ├── common/
│   │   │   ├── guards/     # JWT守卫 + 角色守卫
│   │   │   ├── decorators/ # 租户注入装饰器
│   │   │   └── middlewares/# 租户隔离中间件
│   │   └── database/
│   │       └── seeds/      # 数据种子脚本
│   └── package.json
│
├── frontend/                # React 前端
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login/      # 登录页
│   │   │   └── merchant/
│   │   │       └── Dashboard/  # 数据看板
│   │   ├── services/       # API 服务层
│   │   ├── store/          # Zustand 状态管理
│   │   └── constants.ts
│   └── package.json
│
├── shared/                  # 前后端共享类型
│   └── types.ts
│
├── docker-compose.yml       # PostgreSQL + Redis
└── README.md
```

---

## 🔌 API 文档

### 认证接口
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录

### 租户接口
- `GET /api/v1/tenant` - 获取租户列表 (系统管理员)
- `POST /api/v1/tenant` - 创建租户

### 店铺接口
- `GET /api/v1/shop` - 获取当前租户的所有店铺
- `POST /api/v1/shop` - 添加店铺
- `PATCH /api/v1/shop/:id` - 更新店铺信息
- `DELETE /api/v1/shop/:id` - 删除店铺

### 数据看板接口
- `GET /api/v1/dashboard/summary?days=7` - 获取汇总指标
  - 参数: `days` (7/14/30/60)
  - 返回: 总GMV、订单量、UV、转化率、店铺分组、日趋势、环比增长

---

## 📈 数据看板截图

访问 `http://localhost:5173` 使用 `merchant1 / merchant123` 登录后可查看:

- 📊 **核心指标卡片**: GMV、订单量、转化率、日均UV（含环比增长）
- 📉 **销售趋势图**: 柱状图 + 折线图组合（销售额 + 订单量 + UV）
- 🥧 **店铺占比饼图**: 各店铺 GMV 贡献占比
- 📋 **店铺明细表**: 可排序的店铺数据对比

---

## 🔧 开发命令

### 后端
```bash
npm run start:dev     # 开发模式（热重载）
npm run build         # 构建生产版本
npx prisma studio     # 可视化数据库管理界面
```

### 前端
```bash
npm run dev           # 开发服务器
npm run build         # 构建生产版本
npm run preview       # 预览生产构建
```

### Docker
```bash
docker-compose up -d          # 启动服务
docker-compose down           # 停止服务
docker-compose logs postgres  # 查看 PostgreSQL 日志
```

---

## 🛣️ 后续规划

### 阶段 3: AI 数据分析
- [ ] 集成 OpenAI API 进行数据洞察
- [ ] 自动生成周报/月报
- [ ] 异常数据预警

### 阶段 4: 智能体管理
- [ ] 集成 Claude Code 智能体
- [ ] 工作流自动化编排
- [ ] 知识库构建与检索

### 阶段 5: 数据采集
- [ ] 电商平台 API 对接（淘宝/拼多多/抖音）
- [ ] 自动化数据同步任务
- [ ] 历史数据回填

---

## 📝 环境变量

### 后端 (`backend/.env`)
```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/ecommerce_platform?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=30d
```

### 前端 (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT

---

## 💡 联系方式

如有问题请联系项目负责人。
