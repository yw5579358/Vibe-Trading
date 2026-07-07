# 📊 Vibe-Trading 学习指南

> 一份面向金融工程师的通俗学习指南 —— 把 Vibe-Trading 这个开源 AI 交易 Agent 的功能全貌、技术架构、量化研究、实盘风控、金融知识讲清楚。

🌐 **在线阅读**：https://yw5579358.github.io/Vibe-Trading/

📥 **仓库地址**：

| 仓库 | 说明 |
|---|---|
| 🏠 [本项目（学习指南）](https://github.com/yw5579358/Vibe-Trading) | 学习指南的前端站点 |
| 📦 [Vibe-Trading 原项目](https://github.com/HKUDS/Vibe-Trading) | 被讲解的原始项目（HKUDS/Vibe-Trading） |

---

## 这是什么

[Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) 是香港大学数据科学实验室（HKUDS）开源的金融 AI Agent —— 用一句自然语言就能让 AI 帮你完成行情分析、策略回测、因子挖掘、生成研究报告，甚至（在严格风控下）执行实盘交易。

> 例如你问它：「对比茅台和五粮液近 3 年表现，谁更适合长期持有？」
> 它会自己取行情、算指标、做对比、给出结论——把过去需要写一堆代码的事，变成一句话。

这个仓库不是 Vibe-Trading 本身的代码，而是一份**基于其源码逐行梳理、面向金融工程师的通俗讲解**。无论你是想评估这个项目、想学习它的设计、还是准备面试深挖 agent 工程化，都能在这里找到答案。

---

## Vibe-Trading 原项目能做什么

在深入讲解之前，先看看原项目的能力全貌——这也是本指南讲解的全部内容来源。

### 🧠 AI 研究大脑
- **自研 ReAct 循环**：不是用现成的 LangGraph，而是自研了一个「边想边调工具」的循环。模型先推理要做什么，再调用工具（取行情/跑回测/算因子），看到结果后继续想，直到给出完整答案
- **5 层上下文压缩**：金融研究常常是「调回测→看指标→改因子→再回测」的几十轮长链路。自研的 5 层压缩能精细控制 token，让长对话不爆窗口（L1 微压缩清旧结果 → L2 折叠长文本 → L3 LLM 结构化摘要 → L4 模型主动触发 → L5 增量更新零衰减）
- **75+ 内置工具**：行情、回测、因子、A股特色数据、美股数据、衍生品、交易、记忆……工具自动发现、只读并行/写串行调度
- **80+ 渐进式技能（Skills）**：缠论、艾略特波浪、一目均衡、SMC、谐波、期权策略……系统 prompt 只注入一行摘要，按需加载全文，避免 token 浪费

### 📈 量化研究体系
- **455 个量化因子库（Alpha Zoo）**：内置学术界和业界最经典的因子集——Alpha101（Kakushadze 2015 论文）、GTJA191（国泰君安 191 个 A 股因子）、Qlib158（微软）、10 个学术经典（Amihud 流动性、Fama-French 五因子、52 周高点等）
- **横截面算子库**：rank/scale/ts_corr/decay_linear 等 14 个可组合的算子，像搭乐高一样构造因子，严格防前视偏差
- **严肃的回测引擎**：7 类市场引擎（A股 T+1/美股/加密/外汇/期货/期权/复合），信号强制延迟一根 bar 防偷看未来，含手续费/滑点/涨跌停模拟
- **因子评价**：IC（信息系数）、分层回测、信息比率，还用**随机对照 + 样本外测试**过滤假阳性（防 data snooping）
- **投资组合优化器**：均值方差（Markowitz）、风险平价、最大分散化、等波动

### 💰 实盘交易与风控（核心创新）
- **11 个券商连接器**：盈透 IBKR、Robinhood、雪盈 Tiger、Alpaca、OKX、Binance、富途、Longbridge、Dhan、Shoonya、Trading212
- **Mandate 授权契约**：让 AI 碰真钱的「不可变规则」。硬上限（账户注资/单笔金额/总敞口/杠杆/允许标的/日交易数）+ 标的范围（资产类别/最小市值/最小成交额/排除清单）。**关键：AI 物理上改不了它**——写入路径从代码结构上隔离在 agent 之外
- **9 道检查关**：每笔实盘下单要连过 9 道检查（mandate→过期→kill switch→订单意图→金额规范→查仓位→合规→风险决策→下单），任何一关不过就拒绝（fail-closed）
- **物理 kill switch**：HALT 文件系统层开关，独立于 AI 和程序。一个文件存在，所有交易立刻停止
- **三份审计账本**：合规账本/运行轨迹/实时事件，每个实盘动作三处留痕，可追溯到用户授权点击
- **Shadow Account（影子账户）**：从你的交易日志用机器学习（KMeans+决策树）提炼出可回测的策略，纯研究不碰真钱

### 🤖 多 Agent 协作（Swarm）
- **29 个预设团队**：投资委员会、加密交易台、股票研究团队、宏观利率 desk、ML 量化实验室、风险委员会、事件驱动 task force 等
- **投资委员会 DAG**：牛市倡导者 + 熊市倡导者并行研究 → 风险官独立审查 → 基金经理加权决策（不是数人头投票）。强制多视角制衡，减少单一偏见
- **grounding 防幻觉**：提前拉取真实行情数据注入，避免 agent 引用过时训练数据里的价格

### 📊 数据与渠道
- **18 个数据源 + fallback chain**：A股（腾讯/mootdx/东方财富/BaoStock/akshare/tushare）、美股（Yahoo/Stooq/新浪/Tiingo/FMP）、港股、加密（OKX/ccxt）、期货、外汇——按 IP 封禁风险排序自动切换
- **A股特色数据**：龙虎榜、北向资金、融资融券、大宗交易、限售解禁、股东户数
- **16 个 IM 渠道**：微信/Telegram/Discord/Slack/飞书/钉钉/QQ/WhatsApp/邮件……把 agent 接到任何聊天工具
- **14+ LLM 接入**：通义千问/OpenAI/DeepSeek/Gemini/Moonshot/Ollama 等，统一抽象换模型只改一行配置
- **MCP 协议**：把 Vibe-Trading 反过来当工具箱，给 Claude Desktop、Cursor 等 AI 客户端调用

---

## 本指南讲了什么（6 个章节详解）

### 🏠 首页
项目一句话定义、心智模型（你的自然语言怎么变成一连串工具调用）、8 个核心数字（75+ 工具 / 18 数据源 / 455 因子 / 11 券商 / 16 IM / 29 Swarm / 7 引擎 / 14 LLM）、三种用法示例。

### 🏗️ 技术架构（最深的一章）
把「AI 怎么想、怎么调工具、怎么不爆 token」讲透：

- **四层架构**：接入层（Web/CLI/IM/MCP）→ 会话层 → Agent 层（ReAct 循环）→ 能力层（75+ 工具），各司其职
- **5 层上下文压缩**：每层的精确触发条件、阈值（20000/28000/40000 token 三级阶梯）、头尾保留多少字符（前 900 + 后 500）、L3 结构化摘要保留的 10 个固定段落（Goal/Progress/Decisions/Files…）、为什么 L5 增量更新能信息零衰减
- **工具系统 7 层防错链**：schema 转换 → DSML 兜底解析 → 找不到返回 error → try/except 兜底 → `_called_ok` 防重复下单 → 结果截断脱敏 → readonly 并行/write 串行
- **LLM Provider 抽象**：14+ 供应商如何统一映射到 OpenAI 格式、思考链（reasoning_content）怎么捕获、DashScope 开启 thinking 的原理
- **会话与记忆**：append-only + fsync 防丢、SQLite FTS5 全文搜索（每条消息实时索引）、跨会话持久记忆（frozen snapshot 保 prompt cache、auto-recall 每轮注入）、中文按字分词零依赖
- **Skill 渐进式加载**：两层（一行摘要始终注入 + load_skill 按需拉取）、用户 skill 覆盖 bundled、references 知识树（tushare 有 229 个文件）
- **安全纵深**：通配符拒绝（live broker 禁通配符）、内容过滤熔断（连续 10 次 fail-stop）、AST 沙箱（防 LLM 生成恶意代码的 import 期 RCE）
- **Agent Harness 工程化（面试深挖点）**：合作式取消三 checkpoint（含 stream 中途取消）、readonly 可杀/write 只警告等完成、trace 黑匣子 + HeartbeatTimer、EventBus 跨线程通信、超时分层（18 个超时点）、崩溃恢复（Swarm zombie 三层阈值 clamp）

每个技术点都带 `file:line` 源码引用，并有「深挖」可折叠面板展开源码级细节（精确阈值、关键代码、设计动机）。

### 📈 量化研究
偏金融业务，把因子、回测、评价讲通俗：

- **因子是什么**：横截面 vs 时序的区别、动量/反转/波动率/质量/价值等 11 类因子的经济直觉
- **Alpha Zoo 四大体系**：Alpha101（公式化可复现）、GTJA191（A 股本土）、Qlib158（ml-friendly）、学术经典（每个有论文背书）
- **回测防前视**：为什么信号必须 shift(1)（明天才执行），7 个市场引擎规则差异表（A股 T+1/±10%/100 股 vs 加密 7×24/资金费/爆仓）
- **评价指标人话**：年化、最大回撤、Sharpe（>1 不错 >2 好 >3 存疑）、Calmar、Sortino、为什么 Sharpe 3.0 要先怀疑过拟合
- **IC + 分层回测**：判断因子有效性的标准方法、严格版用随机对照过滤假阳性
- **18 个数据源 fallback**：按 IP 封禁风险排序自动切换、A股特色数据（龙虎榜/北向/两融）的业务含义
- **算子库**：14 个算子逐个公式+加速倍数（sliding_window_view 45x、bottleneck 350x）、NaN 纪律（禁 fillna(0)）

### 💰 交易与风控
讲实盘安全的设计哲学：

- **三档风险**：研究 / 影子 / 实盘 分级，默认全研究端零风险
- **Mandate 授权**：硬上限 + 标的范围 13 个字段、commit_mandate 唯一写路径的 5 步安全流程、为什么用 frozen dataclass 不用 Pydantic
- **9 道检查关**：每关防什么、kill switch 物理开关机制（文件系统层独立于 AI、扫单顺序先撤后平 + latch + no-retry）
- **三份审计账本**：7 种事件类型、mandate→consent 问责链、脱敏机制
- **Shadow Account**：FIFO 配对 → 特征工程 → KMeans+决策树提取策略、归因分解（missed_signals/noise/early_exit…）
- **Swarm 投委会**：4 角色对抗辩论 DAG 详析、依赖门控（risk_officer 失败 PM 不能决策）、Worker 轻量 ReAct、grounding 防幻觉
- **诊断机制**：trace 黑匣子、inspect_preset dry-run、多重超时防线

### 📚 金融知识库（带搜索过滤）
不是量化专属，是**所有金融从业者该掌握的核心概念**，每个讲「是什么 / 怎么看 / 实战意义」三段：

- **技术指标**：MACD、RSI、KDJ、BOLL、均线系统、成交量、VWAP、ATR
- **核心概念**：蓝筹股、放量缩量、换手率、涨停、T+1/T+0、做多做空、杠杆保证金
- **资金流向**：北向资金、龙虎榜、融资融券、大宗交易
- **基本面估值**：PE、PB、ROE、PEG、股息率
- **策略风格**：价值投资、成长投资、动量、均值回归
- **专题**：量价关系 7 种组合（放量上涨/缩量阴跌…）、估值方法（相对估值 vs DCF + 价值陷阱）、风险管理（仓位/止损/分散 + 回撤算术）

### ⚙️ 上手操作
实操指南：三步安装、配置（你当前用的 Qwen3.7-Max + thinking 就是范例）、数据源 token、三个典型工作流（自然语言回测/因子评测/Swarm 投研）、CLI 速查、三种入口（Web/CLI/IM）、MCP 集成、实盘安全流程、故障排查。

---

## 内容来源与致谢

- 技术内容基于 [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) 项目源码逐行梳理，关键点带 `file:line` 引用
- 金融知识部分结合公开学术资料（Kakushadze 2015、Fama-French、Markowitz、Harvey-Liu-Zhu 多重检验等）和行业实务
- 本仓库仅用于学习交流，原始项目版权归 HKUDS 所有，请遵守其 LICENSE

## License

学习指南内容（本仓库的 React 源码与 markdown 文档）按 MIT 协议开源。
原 Vibe-Trading 项目的版权归其原作者所有。
