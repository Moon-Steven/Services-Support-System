# 服务支持系统 (SSS)

> 一站式客户全生命周期管理与广告投放服务支持平台

**线上预览:** [https://service-support-system.vercel.app](https://service-support-system.vercel.app)

---

## 技术栈

| 技术 | 版本 |
|------|------|
| Next.js | 16 (App Router + Turbopack) |
| TypeScript | 6.0 (strict mode) |
| React | 19 |
| Tailwind CSS | 4 + CSS 变量设计令牌 |
| Chart.js | 4.5 + react-chartjs-2 |

## 功能模块

### 客户流程

- **Onboarding 看板** — 可视化客户入驻流水线，按阶段分列展示任务进度（客户触达 → 需求沟通 → 测试期 → 转正续约 → 终止/退款）
- **客户列表** — 全量客户浏览，支持搜索、筛选、排序，包含健康度指标与阶段概览
- **客户详情** — 单客户 360 度视图，涵盖基本信息、评级、投放数据、IO 单、操作日志
- **审批工作台** — 统一处理客户入驻、IO 单、评级变更等多类型审批任务

### 业务管理

- **IO 单管理** — IO 单全生命周期管理（新建 → 审批 → 打款 → 投放 → 完结），支持多步骤审批链
- **投放数据** — KPI 仪表盘，含 CPA/ROAS/花费趋势图表、Top 素材与受众分析
- **投放提案** — 客户投放方案的创建、审核与归档管理

### 交付运营

- **资产管理** — 客户投放资产（账户、Pixel、素材）的集中管理
- **变更管理** — 变更请求发起与审批流转，支持数据留痕
- **Clock 配置** — 客户投放时间轴配置，含出价、监控、策略、创意四类条目管理
- **学习笔记** — 投放经验沉淀，支持 Live Campaign、A/B 测试结果、优化洞察等笔记类型

### 财务 & 系统

- **财务工作台** — 收入、成本、利润率追踪
- **权限配置** — 系统角色与权限管理
- **评级变更** — 客户评级变更审批流（销售发起 → 运营审批 → CEO 确认）

## 设计系统

项目采用统一的设计令牌体系，定义在 `app/globals.css`：

- **主色:** `#00B1A2` (Cyan)
- **间距:** 4px 基准递增（4/8/12/16/20/24/32px）
- **圆角:** xs(2px) ~ round(9999px) 共 7 级
- **排版:** 10px ~ 24px 共 10 个预设类（如 `.text-14-bold`、`.text-12-medium`）

组件库包含 15+ 通用 UI 组件：Button、Card、Dialog、Badge、Table、Tabs、Toggle、Avatar、Stepper 等。

## 项目结构

```
app/                      # Next.js App Router 页面
  layout.tsx              # 根布局 (Sidebar + TopNav)
  globals.css             # 设计令牌 + 排版工具类
  kanban/                 # Onboarding 看板
  clients/                # 客户列表
  client/[id]/            # 客户详情
  dashboard/              # 投放数据仪表盘
  approvals/              # 审批工作台
  io-orders/              # IO 单管理
  clock-config/           # Clock 配置
  learning-notes/         # 学习笔记
  ...
components/
  ui/                     # 通用 UI 组件
  layout/                 # 布局组件 (Sidebar, TopNav)
  kanban/                 # 看板组件
  dashboard/              # 仪表盘组件
  intake/                 # 客户录入步骤组件
  icons/                  # 图标组件
lib/
  data.ts                 # 类型定义 + Mock 数据
  client-context.tsx      # 全局客户上下文
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器 (Turbopack)
npm run dev

# 生产构建
npm run build

# 启动生产服务
npm start
```

访问 [http://localhost:3000](http://localhost:3000) 查看本地预览。

## 部署

项目通过 GitHub 推送自动部署至 Vercel：

- **仓库:** [github.com/Moon-Steven/Lanbow-App](https://github.com/Moon-Steven/Lanbow-App)
- **线上地址:** [service-support-system.vercel.app](https://service-support-system.vercel.app)
