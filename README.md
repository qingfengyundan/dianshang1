# 电商智能运营中台

一个基于 AI 和本地智能体技术的 SaaS 多租户电商运营管理平台。

## 项目概述

本平台旨在帮助电商公司实现：
- **多店铺数据汇总与 AI 分析** - 整合淘宝、拼多多、抖音等平台数据，提供智能分析建议
- **电商工作流知识库管理** - 建设和持续优化电商岗位工作流的"中央大脑"
- **本地智能体自动化执行** - 通过 Codex 和 WorkBuddy 实现商品管理、广告投放、设计生成等自动化

## 核心功能

### 系统后台
- 商家管理
- 通用知识库管理（Skill）
- 系统监控
- 套餐配置

### 商家后台
- 数据看板与 AI 分析
- 我的知识库（下载/自定义）
- 智能体控制中心
- 设计工作台
- 竞品监测

## 技术栈

### 前端
- React 18 + TypeScript
- Ant Design 5.x
- ECharts 5.x
- Zustand
- React Router v6

### 后端
- Node.js + NestJS
- PostgreSQL 14+
- Redis 7.x
- Prisma
- Bull (任务队列)

### AI 与智能体
- Claude API (Anthropic)
- Codex Agent (JSON-RPC)
- WorkBuddy Agent (REST API)

## 项目文档

- [产品开发方案](./产品开发方案.md) - 完整的产品设计文档
- [开发规范文档](./开发规范文档.md) - 团队开发规范和流程
- [开发任务清单](./开发任务清单.md) - 详细的任务分解和进度追踪

## 快速开始

### 前置要求

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 7.x
- Git

### 环境配置

```bash
# 1. 克隆仓库
git clone <repository-url>
cd dianshang1

# 2. 安装依赖（待创建项目后）
cd frontend && npm install
cd ../backend && npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填写必要的配置

# 4. 启动数据库（Docker）
docker-compose up -d

# 5. 运行数据库迁移
cd backend && npx prisma migrate dev

# 6. 启动开发服务器
npm run dev
```

## 项目结构

```
dianshang1/
├── frontend/           # 前端项目
├── backend/            # 后端项目
├── shared/             # 前后端共享代码
├── docs/               # 文档
├── scripts/            # 脚本
├── docker/             # Docker 配置
├── .github/            # GitHub 配置
├── 产品开发方案.md     # 产品方案
├── 开发规范文档.md     # 开发规范
└── 开发任务清单.md     # 任务清单
```

## 开发进度

当前阶段：**阶段 0 - 项目准备**

- [x] 初始化 Git 仓库
- [x] 创建项目文档
- [ ] 环境准备
- [ ] 项目脚手架搭建
- [ ] 开发环境配置

详细进度请查看 [开发任务清单](./开发任务清单.md)

## 贡献指南

请遵循 [开发规范文档](./开发规范文档.md) 中的规范：

1. 从 `develop` 分支创建功能分支
2. 提交信息遵循 Angular 规范
3. 提交前运行测试和代码检查
4. 创建 Pull Request 并等待 Code Review

## 开发团队

- 项目负责人：待定
- 开发团队：待定

## 许可证

待定

## 联系方式

- 项目仓库：待定
- 问题反馈：待定

---

**版本**: v1.0  
**最后更新**: 2026-09-16  
**状态**: 开发中
