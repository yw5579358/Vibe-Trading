import {
  ShieldCheck, Lock, Zap, GitBranch, AlertTriangle, FileText, Eye, Bot,
} from 'lucide-react';
import { PageHero } from '../components/Layout';
import {
  Section, Card, Callout, Steps, FlowDiagram, CompareTable, KV, SubHeading, Details, CodeBlock,
} from '../components/ui';

export function Trading() {
  return (
    <>
      <PageHero
        eyebrow="第三部分 · 交易与风控"
        title="从研究到实盘：安全是第一原则"
        desc={
          <>
            前两页讲的是「研究」（不涉及真钱）。这一页讲 Vibe-Trading 最严肃的部分：
            <strong>怎么让 AI 安全地碰真钱</strong>。核心是一套「有界自治」的授权与风控体系。
          </>
        }
      />

      {/* 1. 研究端 vs 实盘端 */}
      <Section
        eyebrow="先分清边界"
        title="三档风险：研究 · 影子 · 实盘"
        intro="不是所有功能都涉及真钱。项目把能力分成三档，安全级别完全不同。"
      >
        <CompareTable
          head={['', '研究', '影子账户', '实盘交易']}
          rows={[
            ['碰真钱', '❌', '❌', '✅'],
            ['连券商', '❌', '❌', '✅'],
            ['风控授权', '不需要', '不需要', 'Mandate 9 道关'],
            ['审计日志', '对话记录', '本地文件', '三份合规账本'],
            ['用途', '回测、因子分析', '复现你的历史交易风格', '真的下单'],
          ]}
        />
        <Callout type="info" title="默认是安全的">
          你日常用的回测、因子分析、聊天——<strong>全部是研究端，零风险</strong>。
          实盘交易需要你显式配置券商、走授权流程才会启用。
          不配置，它永远不会碰你的账户。
        </Callout>
      </Section>

      {/* 2. Mandate */}
      <Section
        eyebrow="实盘核心"
        title="Mandate：AI 碰真钱的「授权契约」"
        intro="让 AI 自动下单很危险。Mandate（授权书）是一份用户签的、AI 只能读不能改的规则，框死了 AI 能做什么、不能做什么。"
      >
        <SubHeading>Mandate 限定了什么</SubHeading>
        <div className="grid md:grid-cols-2 gap-4">
          <Card title="硬上限（HardCaps）" accent="rose" icon={<Lock size={16} />}>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>账户最大注资额（如 $10000）</li>
              <li>单笔订单最大金额</li>
              <li>总持仓敞口上限</li>
              <li>最大杠杆倍数</li>
              <li>允许交易的标的清单</li>
              <li>每日最大下单次数</li>
            </ul>
          </Card>
          <Card title="标的范围（Universe）" accent="amber" icon={<Eye size={16} />}>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>允许的资产类别（美股/港股/加密…）</li>
              <li>最小市值门槛（避开小盘股）</li>
              <li>最小成交额门槛（保证流动性）</li>
              <li>排除清单（黑名单）</li>
            </ul>
          </Card>
        </div>

        <SubHeading>最关键的设计：AI 永远改不了它</SubHeading>
        <Callout type="warning" title="结构性信任，而非提示词信任">
          Mandate 的写入路径，<strong>从代码结构上就隔离在 agent 之外</strong>。
          AI 调用的所有工具里，没有任何一个能修改 Mandate。
          它只能通过网页/API（由人操作）提交，且必须勾选「我同意」。
          这不是靠「告诉 AI 别乱来」（提示词级别的约束，可被绕过），
          而是靠<strong>代码结构</strong>保证——AI 物理上够不到改写权限。
        </Callout>
        <FlowDiagram
          boxes={[
            { label: '用户', sub: '网页勾选同意', tone: 'brand' },
            { label: 'API 提交', sub: '唯一写入路径', tone: 'violet' },
            { label: 'Mandate 文件', sub: '只读', tone: 'emerald' },
            { label: 'AI Agent', sub: '只能读不能改', tone: 'amber' },
          ]}
        />

        <Details summary="源码级：Mandate 的字段、写入路径、校验逻辑全细节" level="deepest">
          <SubHeading>Mandate 的完整字段（model.py）</SubHeading>
          <KV
            rows={[
              ['account_funding_usd', '账户最大注资额（如 $10000）—— 杠杆分母'],
              ['max_order_notional_usd', '单笔订单最大名义额'],
              ['max_total_exposure_usd', '所有持仓加总的最大敞口'],
              ['max_leverage', '最大杠杆倍数（post_exposure / funding）'],
              ['allowed_instruments', '允许的标的白名单（equity/etf/option/crypto）'],
              ['max_trades_per_day', '每日最大下单次数（UTC 日计数）'],
              ['asset_classes', '允许的资产类别（us_equity/hk_equity/cn_equity/crypto）'],
              ['min_market_cap_usd', '最小市值门槛（避开小盘股）'],
              ['min_avg_daily_volume_usd', '最小日均成交额（保证流动性）'],
              ['exclude_symbols', '排除黑名单'],
              ['consent_token_sha256', '用户授权 token 的哈希（问责）'],
              ['expires_at', '过期时间（默认 30 天）'],
              ['flatten_on_halt', 'halt 时是否平仓（默认 False=只撤单不平仓）'],
            ]}
          />

          <SubHeading>commit_mandate：唯一写路径的安全设计</SubHeading>
          <p>位于 <code>commit.py:312</code>，<strong>不是工具、不能被 agent import</strong>。只能从 API surface <code>POST /mandate/commit</code> 触发，且必须 <code>consent_ack=True</code>。写入流程：</p>
          <Steps
            items={[
              { title: '重校 profile fit', desc: '确认选择的 broker profile 仍匹配用户当时看到的快照' },
              { title: '防 alias 绕过', desc: '_normalize_limits 把 account_funding/accountFunding/Account Funding 都折叠成同一字段，防别名走私放宽限制' },
              { title: '只窄化调整', desc: '新 mandate 不能比之前更宽松，只能更严' },
              { title: '原子写 0600', desc: '写 ~/.vibe-trading/live/<broker>/mandate.json，权限 0600，临时文件 + rename 原子操作' },
              { title: '失效 proposal', desc: '让刚才的 proposal 永远不能被重放（防重放攻击）' },
            ]}
          />

          <SubHeading>load_mandate：fail-closed 读取</SubHeading>
          <p><code>store.py:42</code> 是<strong>唯一读取入口</strong>。fail-closed 语义：文件缺失/损坏/schema 不认识 → 返回 None → 下单守卫直接拒绝。绝不"宽松放行"。</p>
          <Callout type="warning" title="为什么 Mandate 用 frozen dataclass 而非 Pydantic">
            故意不用 Pydantic（model.py 注释明说）。为了<strong>最小化 agent 能利用的校验面</strong>——Pydantic 的自动 coercion/validator 可能被精心构造的输入利用，frozen dataclass 是死字段，没有"智能"行为可被攻击。
          </Callout>
        </Details>
      </Section>

      {/* 3. 9 道关 */}
      <Section
        eyebrow="下单流程"
        title="实盘下单的 9 道关"
        intro="AI 想下一个实盘单，要连过 9 道检查，任何一关不过就拒绝（fail-closed）。这是金融系统「宁可不做，不可做错」的体现。"
      >
        <Steps
          items={[
            { title: '加载 Mandate', desc: '没有有效的授权书 → 拒绝', icon: <Lock size={14} /> },
            { title: '检查是否过期', desc: 'Mandate 默认 30 天有效，过期 → 拒绝', icon: <AlertTriangle size={14} /> },
            { title: '检查紧急停止开关', desc: 'HALT 文件存在（kill switch 被拉）→ 立即拒绝', icon: <Zap size={14} /> },
            { title: '解析订单意图', desc: '把「买100股苹果」解析成结构化订单，解析不出 → 拒绝', icon: <FileText size={14} /> },
            { title: '规范化金额', desc: '防止用「数量」绕过「金额」限制（防旁路）', icon: <ShieldCheck size={14} /> },
            { title: '查真实持仓和余额', desc: '从券商读真实账户状态', icon: <Eye size={14} /> },
            { title: 'Mandate 合规检查', desc: '标的允许？金额超限？杠杆过高？日次数用完？', icon: <ShieldCheck size={14} /> },
            { title: '风险决策', desc: '违规标的/工具 → 直接拒绝；金额超标 → 暂停要重新授权', icon: <AlertTriangle size={14} /> },
            { title: '全部通过 → 才下单', desc: '同时写三份审计账本', icon: <FileText size={14} /> },
          ]}
        />
        <Callout type="tip" title="kill switch 是物理开关">
          紧急停止（HALT）是一个<strong>文件系统层面的开关</strong>，独立于 AI 和程序逻辑。
          它的存在完全不受 AI 控制——你创建一个 HALT 文件，所有交易立刻停止。
          这种「物理隔离」是金融系统应对失控的最后手段。
        </Callout>

        <Details summary="源码级：物理 kill switch（HALT）的完整工作机制" level="deepest">
          <SubHeading>HALT 文件的精确路径</SubHeading>
          <CodeBlock title="halt.py:40,46-69">
{`_HALT_FILENAME = "HALT"

# 全局：一刀切所有 broker
~/.vibe-trading/live/HALT

# 单 broker：只停某一个
~/.vibe-trading/live/<broker>/HALT`}
          </CodeBlock>
          <p><code>halt_flag_set(broker)</code>（halt.py:135-163）是<strong>纯文件存在检查</strong>——不查 LLM、不查进程状态。全局 HALT 存在即所有 broker 都 halt；非法 broker key 走 fail-closed 返回 True（宁可错杀）。</p>

          <SubHeading>三处检查点（轮询，非文件事件）</SubHeading>
          <KV
            rows={[
              ['① Runner 每 tick 起始', 'run_once() 第一步查 HALT（runner.py:428），触发预防性扫单'],
              ['② 下单守卫每次下单', 'OrderGuard.execute() 在真实下单前查（order_guard.py:151-156）——即使 runner 卡住，agent 想下单也被拒'],
              ['③ Runner 启动时', 'api_server.py:3251，HALT 存在则 HTTP 409 拒绝启动'],
            ]}
          />

          <SubHeading>HALT 后的预防性扫单（flatten）</SubHeading>
          <p>关键顺序：<strong>先撤所有挂单，再（仅 mandate 允许时）平仓</strong>（flatten.py:61-127）。为什么撤单必须在平仓前？因为挂单可能在你平仓时成交重新建仓——先撤干净才能真平。</p>
          <KV
            rows={[
              ['flatten_on_halt 默认', 'False = 只撤挂单，不平仓（安全默认）'],
              ['想平仓', '必须在 propose mandate 时显式声明 flatten_on_halt=True'],
              ['扫单 latch', '_flatten_fired 标志，每个 runner 生命周期只扫一次（防反复 tick 重复下单）'],
              ['broker 调用 no-retry', '撤单/平仓失败绝不重试（flatten.py:27-30）——重试可能造成重复下单'],
            ]}
          />

          <SubHeading>触发与恢复</SubHeading>
          <p><code>trip_halt(by, reason, broker)</code>（halt.py:72-108）原子写 HALT 文件，payload 是小 JSON（tripped_at/by/reason）。<code>by</code> 只能是 cli/frontend/file 三者之一。API 层 <code>POST /live/halt</code>（api_server.py:2817）和 <code>POST /live/resume</code>（:2842）是特权 surface action，<strong>永不暴露成 agent tool</strong>——agent 自己拉不了也清不了 kill switch。</p>
          <Callout type="info" title="为什么触发和动作解耦">
            因为用户/watchdog 可以直接 <code>touch</code> 文件绕过 <code>trip_halt</code>，所以 broker 副作用<strong>永远不能耦合进 flag 写入</strong>。runtime 观察到 sentinel（哨兵文件）才是唯一驱动 preemptive 动作的地方。这是"不信任写入路径"的防御设计。
          </Callout>
        </Details>

        <Details summary="源码级：行为追踪——三份审计账本" level="deepest">
          <p>金融合规的核心是可追溯。每个实盘动作同时写进<strong>三个地方</strong>（audit.py:182-238），用<strong>同一个脱敏后的 dict</strong>保证一致性。</p>
          <CompareTable
            head={['Sink', '路径', '解决什么', '生命周期']}
            rows={[
              ['① 合规账本', '~/.vibe-trading/live/audit.jsonl', '"show me everything the agent did with real money" 的权威答案', '持久，不被 run 清理删除'],
              ['② 运行轨迹', 'sessions/{id}/trace.jsonl (type=live_action)', '把 live 动作和同轮的 tool_call 上下文对齐，单次 run 因果追踪', '随 run 目录清理'],
              ['③ 实时事件', 'SSE live.action', 'CLI/前端实时内联渲染，让用户盯着看', '转发即丢，无持久'],
            ]}
          />

          <SubHeading>记录的 7 种事件</SubHeading>
          <div className="flex flex-wrap gap-2 my-3">
            {['order_placed', 'order_cancelled', 'order_rejected', 'mandate_committed', 'breach', 'halt_tripped', 'halt_cleared'].map(k => (
              <span key={k} className="rounded bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 text-xs font-mono">{k}</span>
            ))}
          </div>

          <SubHeading>问责链：每笔操作追溯到用户点击</SubHeading>
          <p>每条审计记录有两个关键字段（audit.py:122-125）：</p>
          <KV
            rows={[
              ['mandate_snapshot_ref', '指向哪个 mandate 文件授权了这个动作（live/<broker>/mandate.json）'],
              ['consent_record_ref', '指向哪次用户点击授权了那个 mandate'],
            ]}
          />
          <p>合起来：每一笔真金白银的操作，都能追溯到<strong>确切的用户授权点击</strong>。这就是合规审计能通过的关键。</p>

          <SubHeading>脱敏：写入前先过一遍</SubHeading>
          <p>所有 broker_request/broker_response 在写任何 sink 之前，统一过 <code>redact_payload</code>（redaction.py）。键名折叠匹配（<code>accountNumber</code>/<code>account-number</code>/<code>Account Number</code> 都捕获），值替换成 <code>[redacted]</code>。注意 <code>account_ref</code>（mandate 来源的 opaque 引用）<strong>故意不脱敏</strong>——它是问责链的一部分必须保留。</p>
        </Details>

        <Details summary="源码级：诊断怎么做——没有单点工具，多重防线" level="deepest">
          <p>项目<strong>没有名为 "diagnose" 的单点工具</strong>，诊断能力分散在多个子系统里。</p>

          <SubHeading>① TraceWriter：agent 行为黑匣子</SubHeading>
          <p><code>trace.jsonl</code>（trace.py）按时间顺序记录 agent 每一步的 tool_call/tool_result/live_action/error，每条带 <code>iter</code> 和 <code>elapsed_ms</code>。大字段（&gt;50KB）offload 到 <code>trace-blobs/</code> sidecar 文件，主记录只留 preview。能定位「卡在哪一步」「哪步慢」「哪步出错」。</p>

          <SubHeading>② inspect_preset：swarm 预设 dry-run 校验</SubHeading>
          <p>不启动 worker、不调 LLM，纯静态校验（presets.py:99-211）：检查重复 id、task 引用的 agent 是否存在、<code>input_from</code> 引用的 task 是否在 DAG 上游、<code>validate_dag</code> 环检测（三色 DFS）、<code>topological_layers</code> Kahn 分层。返回真实调度计划（layers 数组），让你预览会怎么跑。</p>

          <SubHeading>③ 多重超时防线检测卡死</SubHeading>
          <KV
            rows={[
              ['Swarm worker in-loop', '每迭代查 elapsed > timeout（默认 300s）+ token > 60000'],
              ['Layer deadline', 'as_completed(timeout=layer_budget+60)，防 worker 卡 C 扩展绕过 in-loop 检查'],
              ['Heartbeat reaper', '心跳每 3s 一次，缺 10 次（≈30s）判 host 死亡，三层阈值 clamp（60s 下限 / retry ceiling 上限）'],
              ['Live runner heartbeat', '每 tick 写 heartbeat 文件，stale = runner 死了但没清理'],
              ['SSE 空闲 90s', '前端无事件超时，提示"执行超时"'],
            ]}
          />

          <SubHeading>④ 回测诊断：run_card 可复现</SubHeading>
          <p><code>run_card.json/.md</code>（run_card.py）记录 config_hash + strategy_hash（SHA-256），锁定配置和策略文件版本。NaN metric 会因 <code>allow_nan=False</code> 直接抛错——本身就是数据质量诊断信号。</p>
        </Details>
      </Section>

      {/* 4. 连接器 */}
      <Section
        eyebrow="券商对接"
        title="11 个券商连接器"
        intro="项目对接了主流券商和加密交易所，统一抽象成「连接器」概念，但实盘下单能力因券商而异。"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            ['盈透 IBKR', '只读为主'],
            ['Robinhood', '需 OAuth'],
            ['雪盈 Tiger', '支持实盘'],
            ['Alpaca', '支持实盘'],
            ['OKX', '加密'],
            ['Binance', '加密'],
            ['富途 Futu', '支持实盘'],
            ['Longbridge', '模拟为主'],
            ['Dhan', '印度'],
            ['Shoonya', '印度'],
            ['Trading212', '只读'],
          ].map(([name, note]) => (
            <div key={name} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
              <div className="font-medium text-sm text-slate-900 dark:text-white">{name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{note}</div>
            </div>
          ))}
        </div>
        <Callout type="info" title="三种连接方式">
          <strong>本地 TWS</strong>（连你电脑上的盈透客户端）、
          <strong>券商 SDK</strong>（直接调券商 API）、
          <strong>远程 MCP</strong>（通过中间服务）。不同券商用不同方式，但对外接口统一。
        </Callout>
      </Section>

      {/* 5. Shadow Account */}
      <Section
        eyebrow="研究功能"
        title="影子账户：从你的交易日志里「学」你"
        intro="这是一个有趣的功能：把你过去的交易记录喂给它，它会用机器学习提炼出你的交易模式，变成可回测的策略。"
      >
        <FlowDiagram
          boxes={[
            { label: '你的交易日志', sub: '历史买卖记录', tone: 'slate' },
            { label: '配对 + 过滤', sub: 'FIFO 找出盈利单', tone: 'brand' },
            { label: '聚类 + 决策树', sub: '提炼模式', tone: 'violet' },
            { label: '可回测策略', sub: 'signal_engine', tone: 'emerald' },
          ]}
        />
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Card title="它能告诉你什么" accent="brand">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>你盈利的单子有什么共同特征</li>
              <li>你的交易风格被量化成什么样</li>
              <li>你「错过」和「乱做」的单子亏了多少（归因）</li>
            </ul>
          </Card>
          <Card title="它的边界" accent="amber">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>纯研究，不碰真钱</strong>，无券商连接</li>
              <li>需要你提供至少 5 笔盈利的完整交易</li>
              <li>提炼的策略未必真的有效，仍需回测验证</li>
            </ul>
          </Card>
        </div>
      </Section>

      {/* 6. Swarm */}
      <Section
        eyebrow="多 agent 协作"
        title="Swarm：一群 AI 开投资委员会"
        intro="复杂问题一个 agent 搞不定。Swarm 让多个扮演不同角色的 agent 协作——像真实的投委会一样辩论。"
      >
        <SubHeading>投资委员会 DAG</SubHeading>
        <p className="mb-4">最经典的预设：四个 agent 扮演不同立场，依次发言，最后由基金经理决策。</p>
        <FlowDiagram
          direction="col"
          boxes={[
            { label: '牛市倡导者', sub: '找利好理由', tone: 'emerald' },
            { label: '熊市倡导者', sub: '找利空理由', tone: 'rose' },
            { label: '风控官', sub: '评估风险', tone: 'amber' },
            { label: '基金经理', sub: '综合决策', tone: 'brand' },
          ]}
        />
        <Callout type="info" title="为什么要多角色辩论">
          单个 agent 容易「一根筋」——你问它某股票好不好，它可能顺着你的话头说好。
          多角色强制从不同立场分析，<strong>模拟真实投研团队的制衡</strong>，
          减少单一视角的偏差。29 个预设覆盖研究、交易、风控、事件驱动等场景。
        </Callout>
        <KV
          rows={[
            ['协作方式', 'DAG 任务图：上游结论作为下游输入，非消息传递'],
            ['并行调度', '同一层的任务并行跑（最多 4 个），层间串行'],
            ['防幻觉', '提前拉取真实行情数据（grounding），避免编造价格'],
            ['投研/交易台', 'funding/liquidation/flow 分析师 → 风险经理 综合判断'],
          ]}
        />

        <Details summary="源码级：Swarm 多 Agent 交互——主子 Agent、DAG 注入、辩论全流程" level="deepest">
          <SubHeading>主 Agent 怎么触发 Swarm</SubHeading>
          <p>主 AgentLoop 调 <code>run_swarm</code> 工具（swarm_tool.py:624-818）：</p>
          <Steps
            items={[
              { title: '解析预设', desc: '显式 preset_name 或关键词打分匹配 29 个预设（中英文 keyword + weight）' },
              { title: '构造 SwarmRuntime', desc: 'agent_config 从磁盘/env 读（boot-time trusted），绝不来自 LLM prompt（安全 R-06）' },
              { title: 'start_run 起 daemon 线程', desc: '立即返回，执行在后台；先 reap_stale 清理僵尸 run，再 validate_dag' },
              { title: '主 Agent 轮询等待', desc: '每 5s 轮询 store + reconcile，预算 1800s 用尽不取消（保留后台），返回让 Agent 决定' },
            ]}
          />

          <SubHeading>子 Agent 怎么交互：DAG 单向注入，不是消息传递</SubHeading>
          <Callout type="warning" title="关键：子 Agent 之间不直接通信">
            数据流是<strong>单向的 DAG 注入</strong>。上游 task 的 <code>summary</code> 被注入下游 prompt 的 <code>&#123;upstream_context&#125;</code> 占位符。子 Agent 互相不知道对方存在，只看到「上游上下文」。
          </Callout>
          <p><code>worker.py:199-212</code> 的 <code>build_worker_prompt</code>：用<strong>纯字符串 <code>.replace()</code></strong>（不是 <code>str.format</code>，避免其他 <code>&#123;var&#125;</code> 冲突）把 upstream sections 注入。下游看到的格式：</p>
          <CodeBlock>
{`## Upstream Context (from previous agents)

### bull_report
<task-bull 的 summary 全文>

### bear_report
<task-bear 的 summary 全文>`}
          </CodeBlock>

          <SubHeading>investment_committee 辩论 DAG 详析</SubHeading>
          <p>4 个 Agent 扮演对抗角色（presets/investment_committee.yaml）：</p>
          <FlowDiagram
            direction="col"
            boxes={[
              { label: 'Layer 0（并行）', sub: 'bull_advocate + bear_advocate 独立研究', tone: 'emerald' },
              { label: 'Layer 1', sub: 'risk_officer（input_from: bull+bear）独立审查', tone: 'amber' },
              { label: 'Layer 2', sub: 'portfolio_manager（input_from: risk）加权决策', tone: 'brand' },
            ]}
          />
          <KV
            rows={[
              ['bull_advocate', '系统构建多头论点（技术/基本面/情绪三维），每观点必数据支撑'],
              ['bear_advocate', '系统挖掘空头风险（破位/估值泡沫/基本面恶化/波动率）'],
              ['risk_officer', '独立于多空，做有效性审查（查确认偏差/过度悲观/盲点）+ 仓位建议 + 三档压力情景'],
              ['portfolio_manager', '加权而非数人头（"weighting, not head-count voting"），加宏观/时机/回测验证，出可执行决策'],
            ]}
          />
          <Callout type="info" title="依赖门控（safety-critical）">
            上游 task 没成功完成 → 下游被标记 <code>blocked</code> 不调度（runtime.py:518-547）。risk_officer 失败时 PM <strong>不能在没风险输入下做决策</strong>——这是金融场景的安全硬要求。
          </Callout>

          <SubHeading>Worker 的轻量 ReAct vs 主 AgentLoop</SubHeading>
          <KV
            rows={[
              ['不实例化 AgentLoop', '直接 ChatLLM.stream_chat + 手写 for 循环（worker.py:403），agent core 不变'],
              ['自己 build registry', 'build_swarm_registry 按 agent_spec.tools 白名单投影'],
              ['micro-compact', '保留最近 3 条 tool result，老的清成 [cleared]'],
              ['多档退出', 'timeout / token_limit(>60000) / 80% 迭代催促 / 最后一轮强制纯文本 / 内容过滤熔断'],
              ['deliverable 合约', '_classify_deliverable 检查产出实质（防 plan-only stub / 捏造数据 / 原始信封）'],
            ]}
          />

          <SubHeading>incomplete ≠ failed：交付物合约</SubHeading>
          <p>Worker 跑完没异常但没产出实质交付物 → <code>WorkerStatus.incomplete</code>（不是 failed）。<code>_classify_deliverable</code>（worker.py:872-906）判定标准：拒绝空 deliverable / 未解析 tool-call 标记 / 明确的 mock/fabricated/placeholder data / 原始 tool-result 信封 / plan-only stub。<strong>绝不把 incomplete 并入 completed</strong>（P01/P03）。</p>

          <SubHeading>grounding 预取防幻觉</SubHeading>
          <p>LLM 会自信引用训练数据里的过时价格。<code>grounding.py</code> 在 run 开始时预取每个标的最近 30 天真实 OHLCV（max 8 个标的），渲染成 markdown 表注入所有 worker prompt，并叠加「Data Citation Discipline (HARD RULE)」：任何具体数字必须可追溯到 tool call / Ground Truth / Upstream Context，否则调 tool 取或声明"未验证"。</p>
        </Details>
      </Section>

      {/* 7. 审计 */}
      <Section
        eyebrow="可追溯"
        title="三份审计账本：每个动作都有据可查"
        intro="金融合规的核心是可追溯。实盘的每一个动作，都同时写进三个地方，谁也删不掉。"
      >
        <div className="grid md:grid-cols-3 gap-4">
          <Card title="合规账本" accent="rose" icon={<FileText size={16} />}>
            <code>live/audit.jsonl</code><br />
            <span className="text-sm">永久追加，所有实盘动作（下单/撤单/拒单/熔断）都记录，含授权快照引用</span>
          </Card>
          <Card title="运行轨迹" accent="violet" icon={<GitBranch size={16} />}>
            每次会话的 trace<br />
            <span className="text-sm">记录这次 agent 怎么想的、调了什么工具、为什么下单</span>
          </Card>
          <Card title="实时事件流" accent="brand" icon={<Bot size={16} />}>
            SSE 推送<br />
            <span className="text-sm">前端实时显示，你可以盯着看 agent 每一步在干嘛</span>
          </Card>
        </div>
        <Callout type="warning" title="绝不自动重发">
          如果对账时发现状态对不上（比如下单了但券商没确认），系统<strong>从不自动补单</strong>，
          而是触发紧急停止，等人来查。自动补单可能造成重复下单——金融系统宁可停下来等，也不冒险。
        </Callout>
      </Section>

      <Section eyebrow="小结" title="交易篇要点">
        <div className="grid md:grid-cols-2 gap-3">
          {[
            ['三档风险', '研究 / 影子 / 实盘 分级'],
            ['Mandate 契约', 'AI 物理上改不了授权'],
            ['9 道检查关', 'fail-closed 宁可不做'],
            ['物理 kill switch', '文件层独立于 AI'],
            ['11 个券商', '统一抽象，能力各异'],
            ['三份审计账本', '可追溯是合规核心'],
          ].map(([t, d]) => (
            <div key={t} className="flex items-start gap-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
              <ShieldCheck size={16} className="mt-0.5 text-rose-500 shrink-0" />
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
