import { useState } from 'react';
import { MessageSquareText, FileText, Layers, AlertTriangle, Zap, RefreshCw, BookOpen, Target } from 'lucide-react';
import { PageHero } from '../components/Layout';
import { Section, Card, Callout, KV, SubHeading, Pill, Modal, CodeSnippet } from '../components/ui';

/* =========================================================================
 *  数据：所有提示词（按触发时机分类）
 * ===================================================================== */
type Prompt = {
  name: string;
  location: string;
  trigger: string;
  type: 'system' | 'compact' | 'worker' | 'goal' | 'filter' | 'nudge' | 'skill' | 'other';
  size: string;
  desc: string;
  content?: string;
};

const PROMPTS: Prompt[] = [
  // 会话开始时注入
  {
    name: '_SYSTEM_PROMPT',
    location: 'agent/src/agent/context.py:23',
    trigger: '每次会话开始，注入 system message',
    type: 'system',
    size: '~4000 字符（~1000 token）',
    desc: 'Agent 的角色定义、能力边界、行为规则。注入 tool_count/skill_count/tool_descriptions/skill_descriptions 等动态变量。是整个 Agent 的「人格」和「操作手册」。',
    content: `_SYSTEM_PROMPT 是一个超长的模板字符串，定义了 Agent 的身份：
"You are a finance research agent with {skill_count} specialist skills,
 {tool_count} tools, {data_source_count} data sources..."

动态注入变量：
- {tool_count} / {skill_count} / {data_source_count}：数字
- {tool_descriptions}：68 个工具的 name + description + parameters
- {skill_descriptions}：79 个技能的按类别分组一行摘要
- {current_datetime}：当前日期

核心指令（摘录）：
- "Load the relevant skill BEFORE starting any task"
- "NEVER fabricate data"
- 数据引用纪律、执行规则、回测后归因分析流程`,
  },
  // 上下文压缩时
  {
    name: '_STRUCTURED_SUMMARY_PROMPT',
    location: 'agent/src/agent/loop.py:364',
    trigger: 'Layer 3 auto_compact 首次压缩时（token > 40000）',
    type: 'compact',
    size: '~1800 字符',
    desc: '结构化摘要模板，强制保留 10 个固定段落（Goal/Constraints/Progress/Decisions/Files 等）。告诉 LLM "This summary is the ONLY context available — omitted information is lost."',
    content: `强制保留的 10 个段落：
## Goal — 用户目标
## Constraints & Preferences — 风险偏好/策略参数
## Progress — Done + In Progress
## Key Decisions — 决策及理由
## Resolved Questions — 已答问题（防重复）
## Pending User Asks — 待办
## Relevant Files — 文件路径
## Remaining Work — 剩余工作
## Critical Context — 关键数字/参数
## Tools & Patterns — 工具成败

关键指令："Preserve ALL specific numbers, file paths, and parameter values."`,
  },
  {
    name: '_ITERATIVE_UPDATE_PROMPT',
    location: 'agent/src/agent/loop.py:415',
    trigger: 'Layer 5 第 N 次压缩（_previous_summary 非空时）',
    type: 'compact',
    size: '~800 字符',
    desc: '增量更新模板。不从头总结，而是把上次摘要作为 PREVIOUS SUMMARY 喂回，只合并增量对话。规则："PRESERVE all existing information"、"Do NOT drop any critical context"。',
    content: `规则：
- PRESERVE all existing information from the previous summary.
- ADD new progress, decisions, and findings.
- Move "In Progress" items to "Done" when completed.
- Move answered questions to "Resolved Questions".
- Keep the same section structure.
- Do NOT drop any critical context from the previous summary.`,
  },
  {
    name: '_FOCUS_SECTION',
    location: 'agent/src/agent/loop.py:409',
    trigger: 'Layer 4 compact 工具被调用且模型指定了 focus_topic',
    type: 'compact',
    size: '~200 字符',
    desc: '当模型主动调用 compact 工具并传入 focus_topic 时，附加到摘要 prompt——告诉 LLM 把 60-70% 的摘要预算花在该主题上。',
    content: `FOCUS TOPIC: {topic}
Allocate 60-70% of the summary budget to content related to this topic.
Aggressively compress unrelated content to make room.`,
  },
  // 迭代催促
  {
    name: 'wrap-up nudge',
    location: 'agent/src/agent/loop.py:639-649',
    trigger: '迭代到 80% 时（如 max_iterations=50，第 40 轮触发）',
    type: 'nudge',
    size: '~150 字符',
    desc: '当 Agent 用了 80% 的迭代预算还没结束时，注入一条系统消息催促它「别再调工具了，赶紧总结」。',
    content: `[SYSTEM] You have {remaining} iterations remaining.
Stop calling tools and provide your final answer now.
Summarize what you have found.`,
  },
  // 内容过滤
  {
    name: 'CONTENT_FILTER_SKIP_MESSAGE',
    location: 'agent/src/providers/content_filter.py:26',
    trigger: 'LLM 响应被内容审查拦截时（未达熔断阈值）',
    type: 'filter',
    size: '~120 字符',
    desc: '当 DashScope/Qwen 内容过滤拦截了一条响应但还没到连续 10 次熔断时，注入这条消息让模型跳过当前项继续。',
    content: `[SYSTEM] The previous response was blocked by content moderation.
Skip the current item and continue with the next one.
Do not retry the same content.`,
  },
  // Swarm worker
  {
    name: 'build_worker_prompt',
    location: 'agent/src/swarm/worker.py:178-290',
    trigger: '每个 Swarm worker 启动时构建其 system prompt',
    type: 'worker',
    size: '~3000 字符（含数据引用纪律+执行规则）',
    desc: 'Swarm 子 Agent 的 system prompt 构建器。注入 Role + {upstream_context} + Ground Truth 数据 + Data Citation Discipline（硬规则）+ Execution Rules（3 阶段：plan/execute/summarize）。',
    content: `关键组成部分：
1. ## Role — agent_spec.role（如 "Bull-side Researcher"）
2. agent_spec.system_prompt（含 {upstream_context} 占位，用 .replace 注入上游 summary）
3. ## Ground Truth — Recent Market Data（grounding 预取的真实行情）
4. Data Citation Discipline (HARD RULE):
   "Any specific number must be traceable to (a) a tool call in this session,
    (b) the Ground Truth block, or (c) Upstream Context.
    Otherwise call a tool to fetch it or omit and state 'unverified'."
5. Execution Rules:
   - Hard limit: 20 tool calls
   - 3 phases: plan → execute → summarize
   - Deliverable contract: must produce substantive analysis`,
  },
  {
    name: 'investment_committee system_prompts',
    location: 'agent/src/swarm/presets/investment_committee.yaml',
    trigger: '运行投资委员会 Swarm 预设时（4 个角色各自的 prompt）',
    type: 'worker',
    size: '每个 ~1500-2500 字符，共 4 个',
    desc: '投资委员会 4 个 Agent 的角色 prompt：bull_advocate（系统性构建多头论点）/ bear_advocate（挖掘空头风险）/ risk_officer（独立风险审查）/ portfolio_manager（加权决策，不是数人头）。',
  },
  // Goal 续轮
  {
    name: 'goal continuation prompt',
    location: 'agent/src/goal/context.py:134-156',
    trigger: '研究目标需要自动续轮时（goal_needs_continuation 返回 true）',
    type: 'goal',
    size: '~400 字符',
    desc: '当 Agent 完成一轮但研究目标未完成且还有续轮预算（默认 3 次）时，注入这条提示让模型继续研究。用 <goal-continuation> XML 标签包裹。',
    content: `<goal-continuation>
The research goal is not yet complete. Continue your analysis.
Current criteria status: {criteria_checklist}
What remains: {pending_criteria}
</goal-continuation>`,
  },
  {
    name: 'goal context block',
    location: 'agent/src/goal/context.py:23 (format_goal_context)',
    trigger: '每轮对话（如果有活跃的研究目标）',
    type: 'goal',
    size: '~600 字符（取决于目标内容）',
    desc: '当有活跃研究目标时，每轮注入 <current-research-goal> 块到 user message，让 Agent 在上下文压缩后仍记得目标。含状态/目标/标准清单/证据数。',
  },
  // 技能
  {
    name: '79 个 SKILL.md',
    location: 'agent/src/skills/*/SKILL.md',
    trigger: '模型调用 load_skill(name) 时按需加载',
    type: 'skill',
    size: '平均 11K 字符/个，总 ~893K 字符',
    desc: '技能的操作手册。system prompt 只注入一行摘要（name: description），模型需要时调 load_skill 拉取全文。tushare 最大（127K 字符，含 229 个参考文件）。',
  },
  // 用户消息包裹
  {
    name: 'recalled-memories 注入',
    location: 'agent/src/agent/context.py:235-246',
    trigger: '每轮 user message（如果有相关记忆）',
    type: 'other',
    size: '可变（最多 3 条记忆，每条 body 截到 500 字符）',
    desc: 'auto-recall：每轮根据 user message 关键词匹配跨会话记忆，把相关记忆包进 <recalled-memories> 标签注入 user message（不进 system prompt，保 prompt cache）。',
    content: `<recalled-memories>
- **{title}** ({type}): {body[:500]}
- **{title}** ({type}): {body[:500]}
</recalled-memories>

{user_message}`,
  },
  {
    name: 'user-message 隔离标签',
    location: 'agent/src/agent/loop.py:549-554',
    trigger: '有 goal context 时，包裹 user message',
    type: 'other',
    size: '~标签开销',
    desc: '用 <user-message> XML 标签包裹用户输入，让模型区分「系统注入的上下文」vs「用户输入」——轻量的 prompt injection 防御。',
  },
];

const TYPE_META: Record<Prompt['type'], { label: string; tone: 'brand' | 'emerald' | 'amber' | 'rose' | 'violet' | 'slate'; icon: typeof MessageSquareText }> = {
  system: { label: '系统提示', tone: 'brand', icon: MessageSquareText },
  compact: { label: '上下文压缩', tone: 'violet', icon: RefreshCw },
  worker: { label: 'Swarm Worker', tone: 'emerald', icon: Layers },
  goal: { label: '研究目标', tone: 'amber', icon: Target },
  filter: { label: '内容过滤', tone: 'rose', icon: AlertTriangle },
  nudge: { label: '迭代催促', tone: 'amber', icon: Zap },
  skill: { label: '技能文档', tone: 'brand', icon: BookOpen },
  other: { label: '其他', tone: 'slate', icon: FileText },
};

export function Prompts() {
  const [selected, setSelected] = useState<Prompt | null>(null);

  return (
    <>
      <PageHero
        eyebrow="Prompt 工程"
        title="所有提示词全览：Agent 的每一句话从哪来"
        desc={
          <>
            一个 Agent 系统的「智能」不只来自模型，还来自<strong>提示词工程</strong>——
            什么时候注入什么提示、格式是什么、怎么防 prompt injection。这里列出 Vibe-Trading 所有的提示词，从系统提示到压缩模板到 Swarm 角色定义。
          </>
        }
      />

      <Callout type="info" title="提示词的两种形态">
        <strong>写死的字符串常量</strong>（context.py / loop.py 里的 _SYSTEM_PROMPT 等，代码里硬编码）和
        <strong>文件类型的技能文档</strong>（79 个 SKILL.md，按需 load_skill 加载）。
        两者共同构成 Agent 的「知识层」。
      </Callout>

      {/* 提示词清单 */}
      <Section
        eyebrow={`${PROMPTS.length} 个提示词`}
        title="按触发时机分类"
        intro="每条提示词在特定时机注入——理解时机就理解了 Agent 的运行节奏。"
      >
        <div className="space-y-3">
          {PROMPTS.map(p => {
            const meta = TYPE_META[p.type];
            const Icon = meta.icon;
            return (
              <button
                key={p.name}
                onClick={() => setSelected(p)}
                className="w-full text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <Icon size={18} className="mt-0.5 shrink-0 text-slate-500" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <code className="text-[14px] font-semibold text-brand-600 dark:text-brand-400">{p.name}</code>
                      <Pill tone={meta.tone}>{meta.label}</Pill>
                      <span className="text-xs text-slate-400">{p.size}</span>
                    </div>
                    <p className="text-[14px] text-slate-600 dark:text-slate-400 leading-snug">{p.desc}</p>
                    <p className="text-[12px] text-slate-400 mt-1.5 flex items-center gap-1">
                      <Zap size={11} className="text-amber-500" />
                      触发：{p.trigger}
                      <span className="ml-2 text-slate-300 dark:text-slate-600">|</span>
                      <code className="!text-[11px] !px-1 !py-0">{p.location}</code>
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* 设计要点 */}
      <Section
        eyebrow="Prompt 工程亮点"
        title="值得学习的 5 个设计"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Card title="① Prompt Cache 友好" accent="brand" icon={<RefreshCw size={16} />}>
            <strong>memory snapshot 在 session 内冻结</strong>，system prompt 保持稳定 → 命中 provider 的 prompt cache → 省 50%+ 输入 token。auto-recall 的记忆注入 user message 而非 system prompt，就是为了不破坏 cache。
          </Card>
          <Card title="② XML 标签隔离" accent="emerald" icon={<FileText size={16} />}>
            用户输入用 <code>&lt;user-message&gt;</code> 包裹、记忆用 <code>&lt;recalled-memories&gt;</code>、目标用 <code>&lt;current-research-goal&gt;</code>。轻量但有效地让模型区分「系统上下文」vs「用户输入」，是 prompt injection 防御的第一道防线。
          </Card>
          <Card title="③ 结构化摘要防信息丢失" accent="violet" icon={<Layers size={16} />}>
            压缩摘要用<strong>固定 10 段结构</strong>（Goal/Progress/Decisions/Files...），并明确告诉 LLM "omitted information is lost"。增量更新（L5）强制 "PRESERVE all existing information"。
          </Card>
          <Card title="④ Data Citation Discipline 硬规则" accent="amber" icon={<AlertTriangle size={16} />}>
            Swarm worker 的 prompt 里有一条不可违反的规则：任何具体数字必须可追溯到 tool call / Ground Truth / Upstream Context，否则必须调工具取或声明"unverified"。这是防幻觉的 prompt 级手段。
          </Card>
          <Card title="⑤ 迭代催促（wrap-up nudge）" accent="rose" icon={<Zap size={16} />}>
            到 80% 迭代预算时注入催促消息，防止 Agent 沉迷调工具不收敛。这是「让 Agent 知道何时该停」的优雅设计。
          </Card>
          <Card title="⑥ 不依赖 prompt 做 安全" accent="brand" icon={<ShieldCheckIcon />}>
            <strong>真正的安全在代码层</strong>（AST 沙箱/mandate/kill switch），不靠 prompt 说「别做坏事」。prompt 只负责引导，代码负责兜底。这是「不信任 LLM 遵守 prompt」的工程哲学。
          </Card>
        </div>
      </Section>

      {/* 弹窗 */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? <><code className="!text-brand-600 dark:!text-brand-400">{selected.name}</code></> : ''}
        subtitle={selected ? `${TYPE_META[selected.type].label} · ${selected.location}` : ''}
      >
        {selected && (
          <>
            <KV
              rows={[
                ['触发时机', selected.trigger],
                ['大小', selected.size],
                ['类型', TYPE_META[selected.type].label],
                ['位置', <code key="loc" className="!text-[12px]">{selected.location}</code>],
              ]}
            />
            <SubHeading>说明</SubHeading>
            <p>{selected.desc}</p>
            {selected.content && (
              <>
                <SubHeading>内容 / 关键片段</SubHeading>
                <CodeSnippet label="原文（可能截断）">{selected.content}</CodeSnippet>
              </>
            )}
            <Callout type="tip" title="怎么验证">
              在原项目 <code>{selected.location.split(':')[0]}</code> 里搜索 <code>{selected.name}</code> 可以看到完整原文。
            </Callout>
          </>
        )}
      </Modal>
    </>
  );
}

/* 小图标组件（避免 import 冲突） */
function ShieldCheckIcon() {
  return <span className="text-base">🛡️</span>;
}
