# 电商数据分析平台 - MVP 开发总结

## 🎉 项目完成情况

### 已完成的核心功能

> ⚠️ **本文档已于 2026-09-17 按代码实测校准**。原版本存在若干与实现不符的描述
> （表数量、Refresh Token、角色名、支持平台），已逐项修正并标注实际状态。
> 详细进度与技术债务请以 [开发任务清单.md](开发任务清单.md) 为准。

#### 1. **基础架构** ✅
- ✅ **数据库设计**: 12 个模型的 Prisma Schema
  - 已投入使用 (4): `Tenant` / `User` / `Shop` / `Metric`
  - 已建表但**代码零使用** (8): `SystemSkill` / `SkillVersion` / `MerchantSkill` / `AiAnalysis` / `AgentTask` / `Competitor` / `CompetitorSnapshot` / `CompetitorAlert`
  - 注: 无 `Product` / `Order` / `Customer` 模型，指标以 `Metric` 按「店铺 × 日期」粒度存储
- ✅ **多租户架构**: 租户级数据隔离
  - 实现方式为各 Service 手写 `where: { tenantId }`，**非** Prisma 中间件/扩展自动注入
  - ⚠️ 漏写一处即越权，且目前无测试覆盖
- 🟡 **JWT 认证系统**: 注册 / 登录 / `GET /auth/profile` 可用
  - ⚠️ **无 Token 刷新机制**：登录时会签发 `refreshToken`，但后端未提供刷新端点，
    前端 [api.ts:43](frontend/src/services/api.ts#L43) 仍是 TODO，401 时直接跳登录页
- ✅ **角色权限控制**: `system_admin` / `merchant_admin` / `merchant_user` 三级权限
  - 注: 角色以 `String @db.VarChar(20)` 存储，无 Prisma enum 约束；不存在 `operator` 角色
- ✅ **Docker 环境**: PostgreSQL 14 + Redis 7 + pgAdmin 容器化部署 (`docker/docker-compose.yml`)
  - ⚠️ Redis 已配置但**尚无消费方**（AI 缓存目前用进程内 `Map`）

#### 2. **后端 API** ✅
- ✅ **认证模块** (`/api/v1/auth`)
  - 用户注册、登录
  - JWT Guard + Roles Guard
  - 租户隔离中间件

- ✅ **租户管理** (`/api/v1/tenant`)
  - CRUD 完整实现
  - 配置管理 (maxShops, features)

- ✅ **店铺管理** (`/api/v1/shop`)
  - 店铺 CRUD + 激活/停用（删除为软删除，置 `isActive: false`）
  - 平台字段为自由字符串，schema 注释约定 `taobao` / `pinduoduo` / `douyin` 三个平台
  - ⚠️ [shop.service.ts](backend/src/modules/shop/shop.service.ts) 对 `platform` **不做取值校验**，
    任意字符串都能写入；京东/小红书既未建模也未验证，谈不上"支持"

- ✅ **数据看板** (`/api/v1/dashboard`)
  - 多维度指标汇总 (GMV/订单/UV/转化率)
  - 店铺分组统计
  - 日趋势分析
  - 环比增长计算

- ✅ **AI 分析** (`/api/v1/ai`) — 阶段 3 新增
  - `GET /ai/insights` 数据洞察（3-5 条，含优先级与分类）
  - `POST /ai/report` 周报/月报生成（Markdown）
  - `POST /ai/chat` 对话式数据问答（单轮无状态）
  - 未配置 `OPENAI_API_KEY` 时返回 503，平台其余功能不受影响
  - ⚠️ 结果缓存为进程内 `Map`（15 分钟），重启失效、多实例不共享
  - ⚠️ `AiAnalysis` 表未写入，报告与洞察生成后无法回看

#### 3. **前端页面** ✅
- ✅ **登录页面**: 响应式设计 + 表单验证
- ✅ **数据看板**:
  - 核心指标卡片 (4个关键KPI)
  - ECharts 销售趋势图 (柱状图 + 双轴折线图)
  - 店铺GMV占比饼图
  - 店铺明细表 (可排序、进度条展示)
  - 时间维度切换 (7/14/30/60天)
  - AI 洞察卡片 + 报告弹窗 + 问答弹窗
- ⚠️ **仅此 2 个页面**：无店铺管理界面（后端 API 已完备，只缺 UI），
  无系统后台界面（新商户目前只能靠 seed 脚本创建）

#### 4. **数据填充** ✅
- ✅ **演示账号**: admin, merchant1
- ✅ **模拟数据**: 183条历史指标数据 (3店铺 × 61天)
- ✅ **真实波动**: 周末流量高峰 + 增长趋势 + 随机抖动

---

## 📊 数据统计

> 以下数字为 2026-09-17 实测统计（`git rev-list --count HEAD`、`wc -l` 等），非估算。

| 指标 | 数量 | 说明 |
|------|------|------|
| Prisma 模型 | 12 个 | 4 个已使用，8 个已建表但零代码引用 |
| 后端 API 端点 | 18 个 | auth 3 / tenant / shop / dashboard / ai 3 |
| 前端页面 | 2 个 | 登录页、数据看板（含 3 个 AI 弹窗组件） |
| 前端路由 | 3 条 | `/login`、`/merchant/dashboard`、`/` 重定向 |
| 代码文件 | 48 个 | `.ts` + `.tsx`，不含配置与文档 |
| 代码行数 | 3,242 行 | `backend/src` + `frontend/src` + `shared` |
| 测试文件 | 2 个 | `ai.service.spec.ts` (9 用例) + 脚手架自带 |
| Git 提交 | 8 次 | |

---

## 🏗️ 技术架构

### 后端技术栈
```
NestJS 12
├── Prisma ORM 5.22 (PostgreSQL)
├── JWT + Passport
├── OpenAI SDK (Chat Completions，兼容任意 OpenAI 协议服务)
├── Class-validator + Class-transformer
└── TypeScript ESM 模块 (moduleResolution: nodenext，相对导入需带 .js 后缀)
```

### 前端技术栈
```
React 19 + TypeScript
├── Vite 8 (构建工具)
├── Ant Design 6 (UI组件库)
├── ECharts + echarts-for-react (图表)
├── react-markdown (AI 报告渲染)
├── Zustand (状态管理)
├── @tanstack/react-query (数据请求)
├── Axios (HTTP客户端)
└── React Router 6
```

### 基础设施
```
Docker Compose (docker/docker-compose.yml)
├── PostgreSQL 14-alpine
├── Redis 7-alpine  ⚠️ 已配置但暂无消费方
└── pgAdmin 4 (:5050)
```

---

## 🚀 核心亮点

1. **多租户隔离已打通**: 每个商户只能访问自己的数据
   （实现为各 Service 手写 `where: { tenantId }`，不是数据库级 RLS，也不是 Prisma 自动注入）
2. **数据 → 洞察闭环可演示**: 看板聚合 + AI 洞察/报告/问答三个端点已端到端验证通过
3. **AI 降级友好**: 未配置 `OPENAI_API_KEY` 时 AI 接口返回 503，平台其余功能完全可用
4. **类型安全**: 前后端全量 TypeScript，`shared/types.ts` 共享类型定义
5. **开发体验**: 热重载 + ESM + Prisma Studio 可视化
6. **可扩展的数据模型**: 已为技能库、智能体任务、竞品监测预留 8 个模型
   （注: 目前均未接代码，属于设计预留而非已实现能力）

---

## 📈 演示数据展示

### 最近7天核心指标 (merchant1)
- **总销售额**: ¥655,833 (环比 +15.5%)
- **总订单量**: 2,823 单 (环比 +12.6%)
- **平均转化率**: 3.17%
- **日均访客**: 12,432 人

### 店铺占比
- 抖音小店: 54.5% GMV
- 淘宝旗舰店: 31.2% GMV
- 拼多多官方店: 14.3% GMV

---

## 🔐 测试账号

| 用户名 | 密码 | 角色 | 可访问功能 |
|--------|------|------|------------|
| admin | admin123 | `system_admin` | 租户管理 API；⚠️ 无归属租户，调用看板/AI 接口会返回 403 |
| merchant1 | merchant123 | `merchant_admin` | 数据看板 + AI 分析 + 店铺管理 API（店铺无前端页面） |

---

## 🎯 下一步规划

### 中期 (AI 集成) — ✅ 已完成
- [x] OpenAI API 对接 (数据洞察建议)
- [x] 自动生成周报/月报
- [ ] 异常指标预警（需定时任务 + 通知渠道，未开始）

### 短期 (MVP+) — 当前优先级
- [ ] **店铺管理前端页面**（最高优先级：后端 API 已完备，只缺 UI；
      没有这个页面，「多店铺汇总」的卖点在产品上走不通）
- [ ] **多租户隔离测试**（唯一会造成跨商户数据泄露的技术债，优先级高于新功能）
- [ ] **AI 结果持久化**（写入 `AiAnalysis` 表，支持历史报告回看；缓存换 Redis）
- [ ] **数据库迁移版本化**（当前无 `prisma/migrations/`，无法回滚）
- [ ] 数据手动录入/导入功能
- [ ] 更多图表类型 (转化率漏斗、商品TOP榜)

### 长期 (智能体 + 自动化)
- [ ] Claude Code 智能体集成
- [ ] 电商平台 API 自动采集数据
- [ ] 工作流知识库构建

---

## 🐛 已知限制

1. **数据源**: 当前使用模拟数据（seed 脚本），未对接真实电商 API
2. **租户隔离无测试**: 隔离靠各 Service 手写 `where: { tenantId }`，漏写即越权，**零测试覆盖**（风险最高的一项）
3. **测试覆盖极低**: 仅 `ai.service.spec.ts` (9 用例) + 脚手架自带用例；
   认证、租户、店铺、看板均无回归保护
4. **无 Token 刷新**: 后端未提供刷新端点，前端 401 时直接跳登录页
5. **AI 结果不落库**: `AiAnalysis` 表已建但零使用，报告与洞察无法回看，Token 重复消耗
6. **AI 缓存不可靠**: 进程内 `Map`，重启失效、多实例不共享
7. **AI 问答无上下文**: 后端单轮无状态，前端显示历史但不回传，追问会丢上文
8. **无数据库迁移**: 无 `prisma/migrations/` 目录，schema 无版本化、无法回滚
9. **无系统后台界面**: 新商户只能靠 seed 脚本创建，开户流程无法自助
10. **无店铺管理界面**: 后端 API 完备但无 UI
11. **权限细化**: 只有角色级权限，未做到功能级
12. **店铺凭证未加密**: 平台授权信息以明文存储
13. **无日志系统**: winston 已安装但从未引用；`TenantInterceptor` 已创建但未注册
14. **无部署配置**: 无 CI/CD、无生产 Dockerfile

---

## 🔧 开发环境信息

- Node.js: v18+
- PostgreSQL: 14-alpine (Docker)
- Redis: 7-alpine (Docker)
- Docker Desktop（必须先启动，否则后端报 Prisma P1001 连接失败）
- macOS / Linux

---

## 📝 启动步骤回顾

```bash
# 1. 启动数据库（注意 compose 文件在 docker/ 子目录）
docker compose -f docker/docker-compose.yml up -d

# 2. 后端启动
cd backend
npm install
npx prisma db push    # 当前无 migrations 目录，用 db push 同步 schema
npx tsx src/database/seeds/seed.ts
npm run start:dev  # http://localhost:3000

# 3. 前端启动
cd frontend
npm install
npm run dev  # http://localhost:5173

# 4. 登录测试
# 访问 http://localhost:5173
# 使用 merchant1 / merchant123 登录
```

---

## 🎊 结语

**MVP 的核心价值链路已跑通：数据汇总 → 可视化 → AI 洞察。**

已完成:
- 项目脚手架、多租户 SaaS 架构、前后端分离全栈开发
- 数据看板（4 项 KPI + 趋势图 + 占比图 + 明细表）
- AI 洞察 / 报告 / 问答三个端点，端到端验证通过
- 真实波动的模拟数据（3 店铺 × 61 天 = 183 条）

当前版本的真实定位:
✅ **可演示**：`merchant1` 登录后看板与 AI 功能均可完整走通
✅ 结构清晰、全量 TypeScript、文档齐备
⚠️ **尚不可上生产**：租户隔离无测试（存在越权风险）、schema 无迁移版本化、
无日志系统、店铺凭证明文存储、无部署配置
对照 8 阶段主计划，整体进度约 **25-30%**，位于 M1 与 M3 之间；
阶段 2（系统后台）被有意跳过，以先打通商家侧价值链路。
完整核对结果与技术债务清单见 [开发任务清单.md](开发任务清单.md)。

下一步建议优先做**店铺管理前端**与**多租户隔离测试**：
前者补齐产品闭环，后者消除唯一的数据泄露风险。
之后再推进自动化数据采集与智能体管理等高级功能。

---

**开发时间**: 2026-09-16（阶段 1-2）· 2026-09-17（阶段 3 AI + 文档校准）  
**版本**: MVP v1.1  
**状态**: ✅ 可演示 / ⚠️ 未达生产就绪
