# 电商数据分析平台 MVP

一个基于 NestJS + React + PostgreSQL 的多租户电商数据汇总与分析平台。

## 📋 项目概述

### 核心功能
1. **多租户架构** - 支持多个电商商户独立管理数据
2. **多店铺管理** - 汇总淘宝/拼多多/抖音等平台店铺数据
3. **数据看板** - 实时展示 GMV、订单量、转化率等核心指标
4. **趋势分析** - 可视化销售趋势、店铺占比、环比增长
5. **AI 数据分析** - 自动生成数据洞察、周报/月报，并支持对话式数据问答

### 技术栈
- **后端**: NestJS + Prisma ORM + PostgreSQL + Redis + JWT
- **前端**: React 18 + TypeScript + Vite + Ant Design + ECharts
- **AI**: OpenAI Chat Completions API（兼容任意 OpenAI 协议服务）
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
# compose 文件在 docker/ 子目录下，不在仓库根目录
docker compose -f docker/docker-compose.yml up -d
```

### 3. 后端启动
```bash
cd backend
npm install
npx prisma db push            # 同步数据库结构（当前尚无 migrations 目录）
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
- [x] 数据库设计 (12 个 Prisma 模型；已投入使用 4 个: Tenant / User / Shop / Metric)
- [x] JWT 认证与授权系统
- [x] 多租户隔离中间件
- [x] Prisma ORM 集成

### ✅ 阶段 2: 核心业务
- [x] 租户管理 API (CRUD)
- [x] 店铺管理 API (支持淘宝/拼多多/抖音，响应已剥离凭证字段)
- [x] 数据看板 API (汇总指标/店铺分组/日趋势)
- [x] 前端登录页面
- [x] 前端数据看板页面
- [x] 前端店铺管理页面（列表 + 新增/编辑/启用停用，含商家后台侧边导航）

### ✅ 阶段 3: AI 数据分析
- [x] 集成 OpenAI API 进行数据洞察（自动识别趋势/异常/机会/预警）
- [x] 自动生成周报/月报（Markdown 格式，支持下载）
- [x] 对话式数据问答助手
- [x] 结果内存缓存 15 分钟，降低 Token 消耗
- [x] 未配置 API Key 时 AI 接口返回 503，其余功能不受影响

> AI 功能需在 `backend/.env` 中配置 `OPENAI_API_KEY`。
> 未配置时平台其余功能正常可用，仅 AI 相关接口返回 503 提示。

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
│   │   │       ├── Layout.tsx      # 商家后台侧边导航布局
│   │   │       ├── Dashboard/      # 数据看板
│   │   │       └── Shops/          # 店铺管理
│   │   ├── services/       # API 服务层
│   │   ├── store/          # Zustand 状态管理
│   │   └── constants/
│   └── package.json
│
├── shared/                  # 前后端共享类型
│   └── types/
│       └── index.ts
│
├── docker/
│   └── docker-compose.yml   # PostgreSQL + Redis + pgAdmin
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
> 路由前缀为 `/shops`（复数）。响应**已剥离凭证字段**（`apiKey` / `apiSecret` / `accessToken` 不返回）。
> 新增/修改权限: `merchant_admin` / `system_admin`；查看权限: 三个角色均可。
> 商户管理员新增时 `tenantId` 由 token 自动注入，无需（也不应）在 body 中传。

- `GET /api/v1/shops` - 获取当前租户的所有店铺
- `POST /api/v1/shops` - 添加店铺（`platform` 限 `taobao` / `pinduoduo` / `douyin`）
- `PUT /api/v1/shops/:id` - 更新店铺信息（含 `isActive` 启用/停用）
- `DELETE /api/v1/shops/:id` - 停用店铺（软删除，置 `isActive: false`）

### 数据看板接口
- `GET /api/v1/dashboard/summary?days=7` - 获取汇总指标
  - 参数: `days` (7/14/30/60)
  - 返回: 总GMV、订单量、UV、转化率、店铺分组、日趋势、环比增长

### AI 接口
> 均需登录；未配置 `OPENAI_API_KEY` 时返回 503。

- `GET /api/v1/ai/insights?days=7` - 获取 AI 数据洞察
  - 权限: `merchant_admin` / `merchant_user`
  - 返回: 3-5 条洞察，含 `title` / `description` / `suggestion` / `priority` / `category`
- `POST /api/v1/ai/report` - 生成智能周报/月报
  - 权限: `merchant_admin`
  - 参数: `{ "type": "weekly" | "monthly", "startDate": "2026-09-09", "endDate": "2026-09-16" }`
  - 返回: Markdown 格式报告正文
- `POST /api/v1/ai/chat` - 对话式数据问答
  - 权限: `merchant_admin` / `merchant_user`
  - 参数: `{ "question": "哪个店铺转化最好？", "days": 7 }`（问题上限 500 字，`days` 上限 90）

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
# 所有命令都要加 -f docker/docker-compose.yml（compose 文件不在仓库根目录）
docker compose -f docker/docker-compose.yml up -d          # 启动服务
docker compose -f docker/docker-compose.yml down           # 停止服务
docker compose -f docker/docker-compose.yml logs postgres  # 查看 PostgreSQL 日志
```

服务端口: PostgreSQL `5432` · Redis `6379` · pgAdmin `5050`

---

## 🛣️ 后续规划

> 阶段 3 已完成，详见上方「已实现功能」。剩余待办：
- [ ] 异常数据主动预警（定时任务 + 通知渠道）
- [ ] AI 结果持久化，支持历史报告回看

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

# AI（可选，不配置则 AI 接口返回 503，其余功能正常）
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

### 前端 (`frontend/.env`)
```env
# 只填服务地址，不要带 /api/v1，前缀由代码自动追加
VITE_API_BASE_URL=http://localhost:3000
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
