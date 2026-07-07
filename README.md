# 📊 Vibe-Trading 学习指南

> 一份面向金融工程师的通俗学习指南 —— 把 Vibe-Trading 这个开源 AI 交易 Agent 的技术架构、量化研究、实盘风控、金融知识讲清楚。

🌐 **在线阅读**：https://yw5579358.github.io/Vibe-Trading/

📥 **仓库地址**：

| 仓库 | 说明 |
|---|---|
| 🏠 [本项目仓库（学习指南）](https://github.com/yw5579358/Vibe-Trading) | 学习指南的前端站点源码 |
| 📦 [Vibe-Trading 原项目](https://github.com/HKUDS/Vibe-Trading) | 被讲解的原始项目（HKUDS/Vibe-Trading） |

---

## 这是什么

[Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) 是一个开源的金融 AI Agent —— 你用自然语言提问（比如「分析茅台近一年走势并回测一个 RSI 策略」），它会自己调用行情数据、跑回测、算因子、生成报告。

这个仓库是一份**讲解它的学习指南**，把项目的「技术怎么实现」「金融业务怎么映射」「怎么用」拆开讲透。不是 Vibe-Trading 本身的代码，而是基于其源码梳理出的、面向金融工程师的通俗读物。

## 6 个章节

| 章节 | 内容 |
|---|---|
| 🏠 **首页** | 一句话定义、心智模型、能力一览（75+ 工具 / 455 因子 / 11 券商 / 16 IM 渠道） |
| 🏗️ **技术架构** | 自研 ReAct 循环、5 层上下文压缩、工具系统、LLM Provider 抽象、Agent Harness 工程化（取消/超时/安全沙箱/审计） |
| 📈 **量化研究** | 量化因子体系（Alpha101/GTJA191/Qlib158）、回测引擎、横截面算子、IC 评价、市场规则差异 |
| 💰 **交易与风控** | Mandate 授权契约、9 道检查关、物理 kill switch、Shadow Account、Swarm 多 Agent 协作 |
| 📚 **金融知识** | 技术指标（MACD/RSI/KDJ/BOLL）、量价关系、估值方法、风险管理（带搜索过滤） |
| ⚙️ **上手操作** | 安装配置、典型工作流、命令速查、故障排查 |

技术内容全部基于源码梳理，关键点带 `file:line` 引用；金融知识部分结合行业实务和学术背景。

## 技术栈

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS 3**（暗色模式，记忆偏好）
- **React Router 7**（HashRouter，刷新不 404）
- **lucide-react** 图标

部署在 **GitHub Pages**，通过 **GitHub Actions** 自动构建发布，零成本、无需服务器。

## 本地开发

```bash
# 安装依赖
npm install

# 开发模式（热更新，默认 http://localhost:5173）
npm run dev

# 构建生产产物到 dist/
npm run build

# 本地预览构建产物
npm run preview
```

## 目录结构

```
.
├── src/
│   ├── components/
│   │   ├── ui.tsx          # UI 组件库（Card / Callout / Steps / Details / FlowDiagram ...）
│   │   └── Layout.tsx      # 布局（顶栏 + 侧边导航 + 暗色切换）
│   ├── pages/
│   │   ├── Home.tsx        # 首页
│   │   ├── Architecture.tsx# 技术架构
│   │   ├── Quant.tsx       # 量化研究
│   │   ├── Trading.tsx     # 交易与风控
│   │   ├── Finance.tsx     # 金融知识
│   │   └── Operations.tsx  # 操作指南
│   ├── App.tsx             # 路由
│   ├── main.tsx
│   └── index.css           # Tailwind 入口 + 全局样式
├── docs/
│   └── *.md                # 更详尽的 markdown 源文档（内容备份）
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions：push 到 main 自动构建部署
├── index.html              # Vite 入口模板
├── vite.config.ts          # Vite 配置（base path 自动适配 GitHub Pages）
├── tailwind.config.js
└── package.json
```

## 部署机制

推送到 `main` 分支时，`.github/workflows/deploy.yml` 会自动：
1. 安装依赖 + 构建（CI 环境自动用 `/<repo>/` 作为 base path）
2. 生成 SPA 兼容的 404.html
3. 上传到 GitHub Pages artifact
4. 部署到 `https://yw5579358.github.io/Vibe-Trading/`

首次部署前需在 GitHub 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**（本项目已配置完成）。

## 内容来源与致谢

- 技术内容基于 [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) 项目源码梳理
- 金融知识部分结合公开学术资料和行业实务
- 本仓库仅用于学习交流，原始项目版权归 HKUDS 所有

## License

学习指南内容（本仓库的 markdown / React 源码）按 MIT 协议开源。
原 Vibe-Trading 项目的版权归其原作者所有，请遵守其 LICENSE。
