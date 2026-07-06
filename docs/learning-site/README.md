# Vibe-Trading 学习指南（前端站点）

一份面向金融工程师的通俗学习指南，把 Vibe-Trading 项目的技术架构、量化研究、交易风控、金融知识讲清楚。

🌐 **在线访问**：https://yw5579358.github.io/Vibe-Trading/

## 技术栈

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS 3**（暗色模式）
- **React Router 7**（HashRouter，刷新不 404）
- **lucide-react** 图标

## 页面结构

| 路由 | 内容 |
|---|---|
| `/` | 首页：项目一句话定义、心智模型、能力一览 |
| `/architecture` | 技术架构：ReAct 循环、5 层上下文压缩、工具系统、Provider 抽象、Agent Harness 工程化 |
| `/quant` | 量化研究：因子、回测引擎、评价指标、横截面算子 |
| `/trading` | 交易与风控：Mandate 授权、9 道检查关、kill switch、Shadow Account、Swarm 多 Agent |
| `/finance` | 金融知识库：技术指标（MACD/RSI/KDJ）、量价关系、估值方法、风险管理（带搜索过滤） |
| `/operations` | 上手操作：安装、配置、典型工作流、命令速查 |

## 本地开发

```bash
cd docs/learning-site
npm install
npm run dev      # 开发模式，热更新（默认 http://localhost:5173）
npm run build    # 构建生产产物到 dist/
npm run preview  # 本地预览构建产物
```

## 部署

通过 GitHub Actions 自动部署到 GitHub Pages（见 `.github/workflows/deploy-pages.yml`）。
推送到 `main` 分支且改动 `docs/learning-site/**` 时自动触发。

首次部署前需在 GitHub 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。

## 目录结构

```
docs/learning-site/
├── src/
│   ├── components/
│   │   ├── ui.tsx        # UI 组件库（Card/Callout/Steps/Details/FlowDiagram 等）
│   │   └── Layout.tsx    # 布局（顶栏 + 侧边导航 + 暗色切换）
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Architecture.tsx
│   │   ├── Quant.tsx
│   │   ├── Trading.tsx
│   │   ├── Finance.tsx
│   │   └── Operations.tsx
│   ├── App.tsx           # 路由
│   ├── main.tsx
│   └── index.css         # Tailwind 入口 + 全局样式
├── index.html            # Vite 入口模板
├── vite.config.ts        # Vite 配置（base path 动态适配）
├── tailwind.config.js
└── package.json
```

## 内容来源

所有技术内容基于 Vibe-Trading 项目源码梳理，关键点带 `file:line` 引用。
金融知识部分结合行业实务和学术背景。`docs/learning-guide/` 下保留有更详尽的 markdown 源文档。
