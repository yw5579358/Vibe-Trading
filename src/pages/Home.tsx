import { Link } from 'react-router-dom';
import { MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { PageHero } from '../components/Layout';
import { Card, FlowDiagram, Stat, Callout, Pill } from '../components/ui';

export function Home() {
  return (
    <>
      <PageHero
        eyebrow="一份通俗的学习指南"
        title="Vibe-Trading：一句话让 AI 帮你做金融研究"
        desc={
          <>
            它是一个开源的金融 AI agent。你用自然语言提问（比如「分析茅台近一年走势并回测一个 RSI 策略」），
            它会自己调用行情数据、跑回测、算因子、生成报告——<strong>把过去需要写一堆代码的事，变成一句话</strong>。
          </>
        }
      />

      <div className="flex flex-wrap gap-2 mb-10">
        <Pill tone="brand">AI Agent</Pill>
        <Pill tone="emerald">量化回测</Pill>
        <Pill tone="violet">多市场行情</Pill>
        <Pill tone="amber">实盘交易(可选)</Pill>
        <Pill>开源 · Python · React</Pill>
      </div>

      {/* 心智模型：一句话怎么变出一堆能力 */}
      <Card title="它到底在做什么？" icon={<Sparkles size={18} />} accent="brand" className="mb-10">
        <p className="mb-4">
          核心是一个 <strong>ReAct 循环</strong>（Reasoning + Acting）：模型先「想」要做什么，
          再「调」一个工具（取行情/跑回测/算指标），看到结果后继续想，直到给你完整答案。
          你的自然语言，被翻译成一连串工具调用。
        </p>
        <FlowDiagram
          boxes={[
            { label: '你的提问', sub: '自然语言', tone: 'brand' },
            { label: 'AI Agent', sub: '想 + 调工具', tone: 'violet' },
            { label: '75+ 工具', sub: '行情/回测/因子', tone: 'emerald' },
            { label: '答案/报告', sub: '图表 + 数据', tone: 'amber' },
          ]}
        />
      </Card>

      {/* 核心数字 */}
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">能力一览</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <Stat value="75+" label="内置工具" sub="行情/回测/因子/交易" />
        <Stat value="18" label="数据源" sub="A股/美股/加密/期货" />
        <Stat value="455" label="量化因子" sub="Alpha101+191+158" />
        <Stat value="11" label="券商连接器" sub="盈透/雪盈/Alpaca…" />
        <Stat value="16" label="IM 渠道" sub="微信/电报/飞书…" />
        <Stat value="29" label="Swarm 团队" sub="多 agent 协作" />
        <Stat value="7" label="回测引擎" sub="A股/美股/加密…" />
        <Stat value="14" label="LLM 接入" sub="通义/OpenAI/Ollama…" />
      </div>

      <Callout type="tip" title="这份指南怎么读">
        <div className="space-y-1.5">
          <div>① <Link to="/architecture" className="text-brand-600 dark:text-brand-400 font-medium">技术架构</Link> — 它内部是怎么搭起来的（agent 循环、工具、多模型）</div>
          <div>② <Link to="/quant" className="text-brand-600 dark:text-brand-400 font-medium">量化研究</Link> — 因子库、回测引擎、评价指标，偏金融业务</div>
          <div>③ <Link to="/trading" className="text-brand-600 dark:text-brand-400 font-medium">交易与风控</Link> — 实盘下单的安全机制、影子账户、多 agent 协作</div>
          <div>④ <Link to="/operations" className="text-brand-600 dark:text-brand-400 font-medium">上手操作</Link> — 怎么装、怎么配、典型工作流</div>
        </div>
      </Callout>

      {/* 快速开始卡片 */}
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-10 mb-4">从一句话开始</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <Card title="研究分析" accent="brand">
          <p className="text-sm mb-2 text-slate-600 dark:text-slate-400">你说：</p>
          <div className="flex items-start gap-2 text-sm bg-slate-100 dark:bg-slate-800 rounded p-2.5">
            <MessageSquare size={15} className="mt-0.5 shrink-0 text-brand-500" />
            <span>对比茅台和五粮液近 3 年表现，谁更适合长期持有？</span>
          </div>
        </Card>
        <Card title="策略回测" accent="emerald">
          <p className="text-sm mb-2 text-slate-600 dark:text-slate-400">你说：</p>
          <div className="flex items-start gap-2 text-sm bg-slate-100 dark:bg-slate-800 rounded p-2.5">
            <MessageSquare size={15} className="mt-0.5 shrink-0 text-emerald-500" />
            <span>在沪深 300 上回测双均线策略，2020 至今，看夏普比率</span>
          </div>
        </Card>
        <Card title="因子挖掘" accent="violet">
          <p className="text-sm mb-2 text-slate-600 dark:text-slate-400">你说：</p>
          <div className="flex items-start gap-2 text-sm bg-slate-100 dark:bg-slate-800 rounded p-2.5">
            <MessageSquare size={15} className="mt-0.5 shrink-0 text-violet-500" />
            <span>评测动量类因子在 A 股的有效性，分层回测</span>
          </div>
        </Card>
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          to="/architecture"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 font-medium transition-colors"
        >
          从技术架构开始 <ArrowRight size={18} />
        </Link>
      </div>
    </>
  );
}
