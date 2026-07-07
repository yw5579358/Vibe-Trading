import {
  Rocket, Settings, Terminal, MessageSquare, Play, KeyRound,
} from 'lucide-react';
import { PageHero } from '../components/Layout';
import {
  Section, Card, Callout, Steps, Pill, CompareTable, KV, SubHeading, CodeBlock, FlowDiagram,
} from '../components/ui';

export function Operations() {
  return (
    <>
      <PageHero
        eyebrow="第四部分 · 怎么用"
        title="上手操作：从安装到跑通"
        desc={
          <>
            这一页是实操指南。讲清楚怎么装、怎么配、几个典型工作流怎么走通。
            命令和配置都可直接复制。
          </>
        }
      />

      {/* 1. 安装 */}
      <Section
        eyebrow="起步"
        title="三步跑起来"
        intro="开发模式下，用 conda 建环境，装依赖，启动服务。你的环境已经按这套配好了（vibe-trading 环境 + Qwen3.7-Max）。"
      >
        <Steps
          items={[
            {
              title: '创建 conda 环境',
              desc: 'Python 3.11（项目最低要求）',
              icon: <Rocket size={14} />,
            },
            {
              title: '安装项目（开发模式）',
              desc: 'pip install -e ".[dev]" 把项目装成可编辑，改代码立即生效',
              icon: <Settings size={14} />,
            },
            {
              title: '启动后端 + 前端',
              desc: 'vibe-trading serve 起后端（8899），前端 npm run dev 起开发服务器（5899）',
              icon: <Play size={14} />,
            },
          ]}
        />
        <CodeBlock title="启动命令（你当前在用的）">
{`# 后端（API 服务）
/opt/anaconda3/envs/vibe-trading/bin/vibe-trading serve --host 127.0.0.1 --port 8899

# 前端（开发服务器，代理到后端）
cd frontend && npm run dev   # → http://localhost:5899

# 或一键启动两者
vibe-trading dev`}
        </CodeBlock>
        <Callout type="info" title="端口号速记">
          <strong>8899</strong> = 后端 API &nbsp;·&nbsp;
          <strong>5899</strong> = 前端开发服务器 &nbsp;·&nbsp;
          <strong>8900</strong> = MCP SSE &nbsp;·&nbsp;
          <strong>11434</strong> = Ollama（本地模型）
        </Callout>
      </Section>

      {/* 2. 配置 */}
      <Section
        eyebrow="配置"
        title="核心配置：一个 .env 文件搞定"
        intro="所有配置都集中在 ~/.vibe-trading/.env。最重要的是 LLM 配置——决定用哪个模型。"
      >
        <SubHeading>你当前的配置（Qwen3.7-Max + 思考）</SubHeading>
        <CodeBlock title="~/.vibe-trading/.env">
{`# 通义千问 Qwen3.7-Max，开启思考模式
LANGCHAIN_PROVIDER=dashscope
LANGCHAIN_MODEL_NAME=qwen3.7-max
DASHSCOPE_API_KEY=sk-你的密钥
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LANGCHAIN_TEMPERATURE=0.5
TIMEOUT_SECONDS=300

# 开启思考（项目通过 extra_body 注入 enable_thinking）
VIBE_TRADING_DASHSCOPE_ENABLE_THINKING=1`}
        </CodeBlock>

        <SubHeading>换模型只改两个变量</SubHeading>
        <KV
          rows={[
            ['LANGCHAIN_PROVIDER', '供应商：dashscope / openai / deepseek / ollama …'],
            ['LANGCHAIN_MODEL_NAME', '模型名：qwen3.7-max / gpt-4o / deepseek-v3 …'],
            ['对应的 _API_KEY', '每个供应商有自己的 key 变量名（DASHSCOPE_API_KEY / OPENAI_API_KEY …）'],
            ['对应的 _BASE_URL', '一般有默认值，特殊代理才需要改'],
          ]}
        />
        <Callout type="tip" title="本地模型也能用">
          配 <code>LANGCHAIN_PROVIDER=ollama</code>，
          指向 <code>OLLAMA_BASE_URL=http://localhost:11434</code>，
          就能用本地跑的开源模型（如 qwen2.5），完全离线、零成本、数据不出本机。
        </Callout>
      </Section>

      {/* 3. 数据源 token */}
      <Section
        eyebrow="数据配置（可选）"
        title="数据源 token：按需开启"
        intro="基础行情（腾讯/Yahoo/OKX）免费免配置。要更深数据才需要申请 token。"
      >
        <CompareTable
          head={['Token', '用途', '是否必需']}
          rows={[
            ['TUSHARE_TOKEN', 'A股深度数据（专业版）', '可选，akshare 免费替代'],
            ['FRED_API_KEY', '美联储宏观数据（利率/GDP）', '可选'],
            ['FINNHUB/FMP/TIINGO', '美股数据 fallback', '可选'],
            ['（无需）', '腾讯/Yahoo/OKX 公开行情', '默认可用'],
          ]}
        />
      </Section>

      {/* 4. 典型工作流 */}
      <Section
        eyebrow="实战"
        title="三个典型工作流"
        intro="看看一句话怎么变成完整的研究/回测结果。"
      >
        <SubHeading>① 自然语言回测</SubHeading>
        <Card accent="brand" className="mb-4">
          <div className="flex items-start gap-2 mb-3">
            <MessageSquare size={16} className="mt-0.5 shrink-0 text-brand-500" />
            <span className="text-sm">「对贵州茅台用 RSI 策略回测，2023 全年」</span>
          </div>
          <FlowDiagram
            boxes={[
              { label: '理解意图', tone: 'slate' },
              { label: '取行情', sub: '茅台 K 线', tone: 'brand' },
              { label: '写策略代码', sub: 'RSI 信号', tone: 'violet' },
              { label: '跑回测', sub: 'ChinaAEngine', tone: 'emerald' },
              { label: '返回指标', sub: '夏普/回撤', tone: 'amber' },
            ]}
          />
        </Card>

        <SubHeading>② 因子批量评测</SubHeading>
        <Card accent="violet" className="mb-4">
          <div className="flex items-start gap-2 mb-3">
            <MessageSquare size={16} className="mt-0.5 shrink-0 text-violet-500" />
            <span className="text-sm">「在沪深 300 上评测所有动量类因子」</span>
          </div>
          <p className="text-sm">
            agent 调 <code>alpha_bench</code> 工具，并行计算每个因子的 IC/IR，
            按 <strong>alive（有效）/ reversed（反向）/ dead（无效）</strong>分类，
            还会做随机对照过滤假阳性。
          </p>
        </Card>

        <SubHeading>③ 多 agent 投研</SubHeading>
        <Card accent="emerald">
          <div className="flex items-start gap-2 mb-3">
            <MessageSquare size={16} className="mt-0.5 shrink-0 text-emerald-500" />
            <span className="text-sm">「用投资委员会分析 NVDA」</span>
          </div>
          <p className="text-sm">
            agent 调 <code>run_swarm</code> 启动 investment_committee 预设，
            牛市/熊市/风控/基金经理四个 agent 依次发言辩论，最后给出综合结论。
          </p>
        </Card>
      </Section>

      {/* 5. CLI 速查 */}
      <Section
        eyebrow="命令行"
        title="常用命令速查"
        intro="日常用得最多的是这几个。完整命令见项目 README。"
      >
        <div className="space-y-3">
          {[
            ['vibe-trading serve', '启动 API 服务（网页/IM 都靠它）'],
            ['vibe-trading dev', '一键启动后端 + 前端开发服务器'],
            ['vibe-trading chat', '命令行交互式聊天'],
            ['vibe-trading run "你的问题"', '一次性提问，拿答案就退出'],
            ['vibe-trading list / show <id>', '看历史回测 / 看某个回测详情'],
            ['vibe-trading connector list', '看可用的交易连接器'],
            ['vibe-trading memory list', '看 agent 记住了什么'],
          ].map(([cmd, desc]) => (
            <div key={cmd} className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
              <code className="text-brand-600 dark:text-brand-400 !bg-slate-100 dark:!bg-slate-800 !px-2 !py-1 rounded text-sm whitespace-nowrap">{cmd}</code>
              <span className="text-sm text-slate-600 dark:text-slate-400">{desc}</span>
            </div>
          ))}
        </div>
        <Callout type="info" title="交互式聊天里有斜杠命令">
          在 <code>vibe-trading chat</code> 里，输入 <code>/</code> 会弹出命令：
          <code>/memory</code>（看记忆）、<code>/swarm</code>（跑多 agent）、
          <code>/skill</code>（加载技能）、<code>/clear</code>（清空）等。
          支持模糊匹配，不用记全。
        </Callout>
      </Section>

      {/* 6. 三种使用入口 */}
      <Section
        eyebrow="怎么用"
        title="三种入口，同一套能力"
        intro="无论你偏好哪种交互方式，底层都是同一个 agent。"
      >
        <div className="grid md:grid-cols-3 gap-4">
          <Card title="🌐 网页" accent="brand" icon={<Terminal size={16} />}>
            <strong>最适合日常使用。</strong>图形界面，流式显示思考过程，
            工具调用可视化，回测结果直接出图表。
            <Pill tone="brand">推荐</Pill>
          </Card>
          <Card title="⌨️ 命令行" accent="emerald" icon={<KeyRound size={16} />}>
            <strong>适合脚本化和极客。</strong>
            <code>vibe-trading run "..."</code> 可嵌入自动化流程，
            SSH 到服务器也能用。
          </Card>
          <Card title="💬 IM 机器人" accent="violet" icon={<MessageSquare size={16} />}>
            <strong>适合移动场景。</strong>把 agent 接到微信/电报/飞书，
            出门在外用手机就能问它行情、跑研究。16 个平台可选。
          </Card>
        </div>
      </Section>

      {/* 7. MCP */}
      <Section
        eyebrow="进阶"
        title="把 Vibe-Trading 当工具给别人用"
        intro="MCP（Model Context Protocol）让它能被 Claude Desktop、Cursor 等其他 AI 客户端调用——Vibe-Trading 反过来变成别的 AI 的「金融工具箱」。"
      >
        <Callout type="tip" title="一个有趣的玩法">
          你在 Claude Desktop 里配置 Vibe-Trading 的 MCP 服务，
          然后让 Claude 帮你做金融研究——Claude 负责「想」，Vibe-Trading 提供 54 个金融工具（行情/回测/因子…）负责「做」。
          两个 AI 各取所长。
        </Callout>
      </Section>

      {/* 故障排查 */}
      <Section
        eyebrow="遇到问题"
        title="常见问题速查"
      >
        <div className="space-y-3">
          <Card title="启动时 LLM 检查失败" accent="amber">
            preflight 会 TCP 探测模型 API 是否可达。检查 <code>DASHSCOPE_API_KEY</code> 是否正确、
            网络能否连通 <code>dashscope.aliyuncs.com</code>。
          </Card>
          <Card title="思考过程不显示" accent="amber">
            确认 <code>VIBE_TRADING_DASHSCOPE_ENABLE_THINKING=1</code> 已设。
            这一项同时控制「发送 enable_thinking」和「捕获思考链」两件事，缺一不可。
          </Card>
          <Card title="回测报错或超时" accent="amber">
            回测在子进程跑，300 秒超时。常见原因：策略代码语法错（看 stderr）、
            数据源取不到数（换 source）、AST 扫描拒绝（策略里有危险 import）。
          </Card>
          <Card title="yfinance 限流" accent="amber">
            美股数据偶发限流。项目有多源 fallback（Yahoo→Stooq→新浪…），会自动换源，不用管。
          </Card>
        </div>
      </Section>

      <Callout type="success" title="到此你已经掌握全貌">
        <div className="space-y-1.5">
          <div>✅ <strong>架构篇</strong>：理解了 agent 怎么想、怎么调工具、怎么压缩上下文</div>
          <div>✅ <strong>量化篇</strong>：理解了因子、回测、评价指标的业务含义</div>
          <div>✅ <strong>交易篇</strong>：理解了实盘的安全机制和多 agent 协作</div>
          <div>✅ <strong>操作篇</strong>：知道怎么装、怎么配、怎么用</div>
        </div>
        <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800">
          接下来最好的学习方式：<strong>动手试</strong>。打开网页，问它一个真实的金融问题，
          观察它怎么拆解、调哪些工具。纸上得来终觉浅。
        </div>
      </Callout>
    </>
  );
}
