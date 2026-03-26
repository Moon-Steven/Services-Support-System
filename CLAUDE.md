# Lanbow 3.0 - 项目规范

## 技术栈

- **框架**: Next.js 16 (App Router, Turbopack)
- **语言**: TypeScript (strict mode)
- **样式**: Tailwind CSS 4 + CSS 变量设计令牌
- **图表**: Chart.js + react-chartjs-2
- **运行时**: React 19

## 项目结构

```
app/                   # Next.js App Router 页面
  layout.tsx           # 根布局 (Sidebar + TopNav)
  globals.css          # 设计令牌 + 排版工具类
  [page]/page.tsx      # 各功能页面
components/
  ui/                  # 通用 UI 组件 (Button, Card, Input, etc.)
  layout/              # 布局组件 (Sidebar, TopNav)
lib/
  data.ts              # Mock 数据 + 类型
  client-context.tsx   # 全局客户上下文
```

## 样式规范

### 首选顺序

1. **Tailwind 工具类** — 布局、间距、尺寸、颜色、圆角
2. **自定义排版 class** — `.text-14-bold`, `.text-12-medium` 等 (定义在 globals.css)
3. **CSS 变量引用** — 仅在 Tailwind 无法表达时使用 `var(--token)`
4. **inline style** — 仅限动态计算值（如 SVG 动画偏移量）

### 禁止

- 不要使用硬编码 px 值，使用设计令牌: `var(--space-*)`, `var(--height-*)`, `var(--size-*)`
- 不要使用硬编码颜色 hex/rgba，使用 `bg-l-cyan`, `text-grey-06` 或 `var(--cyan-tint-08)` 等令牌
- 不要使用 `color-mix()` — 使用预定义的 tint 令牌

### 设计令牌映射

| 用途 | Tailwind 类 / CSS 变量 |
|------|----------------------|
| 主色 | `bg-l-cyan`, `text-l-cyan` |
| 文字色 | `text-grey-01`(标题) / `text-grey-06`(次要) / `text-grey-08`(辅助) |
| 背景 | `bg-white`(卡片) / `bg-bg`(页面) / `bg-selected`(悬停) |
| 边框 | `border-stroke`(细) / `border-grey-12`(明显) |
| 危险 | `text-red`, `bg-red-tint-08` |
| 警告 | `text-orange`, `bg-orange-tint-10` |
| 成功 | `text-l-cyan`, `bg-cyan-tint-08` |
| 遮罩 | `bg-overlay` |

### 间距令牌

| 变量 | 值 | Tailwind 用法 |
|------|-----|---------------|
| `--space-1` | 4px | `gap-[var(--space-1)]` |
| `--space-2` | 8px | `gap-[var(--space-2)]` |
| `--space-3` | 12px | `gap-[var(--space-3)]` |
| `--space-4` | 16px | `gap-[var(--space-4)]` |
| `--space-5` | 20px | `p-[var(--space-5)]` |
| `--space-6` | 24px | `p-[var(--space-6)]` |
| `--space-8` | 32px | `gap-[var(--space-8)]` |

### 排版类

| Class | 用途 |
|-------|------|
| `.text-24-bold` | 页面大标题 |
| `.text-20-bold` | 区域标题 |
| `.text-16-bold` | 卡片标题 |
| `.text-14-bold` | 列表项标题 |
| `.text-14-medium` | 按钮、导航 |
| `.text-14-regular` | 正文 |
| `.text-12-medium` | 标签 |
| `.text-12-regular` | 辅助文字 |
| `.text-10-regular` | 小字、分组标题 |

## 组件使用规范

### UI 组件

| 组件 | 何时使用 |
|------|---------|
| `Button` | 所有操作按钮，variant: primary/secondary/ghost/destructive |
| `Card` | 内容容器卡片，padding: standard(20px)/large(24px)/none |
| `Input` | 文本输入，支持 label + error |
| `Select` | 下拉选择，支持 label + error |
| `Dialog` | 模态弹窗，支持自定义 width，自带 ESC 关闭和 body 滚动锁 |
| `Badge` | 状态标签，variant: cyan/grey/red/orange/dark |
| `Table` | 数据表格，泛型支持 |
| `Toggle` | 开关切换 |
| `Avatar` | 用户头像，size: sm(24)/md(32)/lg(40) |
| `Tabs` | 选项卡，带 aria 属性 |
| `FormField` | 表单字段包装，统一 label + error 样式 |
| `Stepper` | 步骤指示器，显示进度 |

### 创建新组件前

1. 先检查是否已有可复用组件
2. 如需新组件，放入 `components/ui/`
3. 组件必须支持 `className` 透传
4. 使用设计令牌而非硬编码值
5. 添加必要的 aria 属性

## Figma 实现约定

从 Figma 实现设计时：

1. Figma 颜色值映射到 `globals.css` 中最近的设计令牌
2. Figma 间距值映射到 `--space-*` 令牌 (4px 为基准)
3. Figma 圆角值映射到 `--radius-*` 令牌
4. 优先复用已有 UI 组件，不要重新实现
5. 排版使用自定义 class (`.text-*-*`)，不要硬编码 font-size
6. 从 Figma 下载的资产放入 `public/assets/`

## 无障碍要求

- Dialog 必须有 `role="dialog"`, `aria-modal`, `aria-label`
- Tab 必须有 `role="tablist"`, `role="tab"`, `aria-selected`
- Toggle 必须有 `role="switch"`, `aria-checked`
- 表单元素必须有关联的 `<label>`
- 错误提示使用 `role="alert"` + `aria-describedby`
