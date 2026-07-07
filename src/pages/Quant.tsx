import {
  TrendingUp, Sigma, FlaskConical, BarChart3, Activity, AlertCircle, Target,
} from 'lucide-react';
import { PageHero } from '../components/Layout';
import {
  Section, Card, Callout, Steps, FlowDiagram, CompareTable, KV, SubHeading,
} from '../components/ui';

export function Quant() {
  return (
    <>
      <PageHero
        eyebrow="第二部分 · 量化研究"
        title="因子、回测与评价：把直觉变成可验证的策略"
        desc={
          <>
            量化研究的核心循环是：<strong>假设某个信号能预测涨跌 → 写成因子 → 回测验证 → 看指标</strong>。
            Vibe-Trading 把这套流程工具化了，内置 455 个经典因子和一套严肃的回测引擎。
          </>
        }
      />

      {/* 1. 什么是因子 */}
      <Section
        eyebrow="基础概念"
        title="因子：给股票打分的「信号」"
        intro="因子本质是一个打分规则：根据某些数据（价格、成交量、财务…）给每只股票算一个分，分高的下周更可能涨（或跌）。"
      >
        <SubHeading>两类因子的区别</SubHeading>
        <CompareTable
          head={['', '横截面因子', '时序因子']}
          rows={[
            ['回答什么', '同一时刻，哪些股票更好', '同一只股票，现在该买还是卖'],
            ['典型例子', '动量（近期涨得多的继续涨）', '均线交叉（择时信号）'],
            ['项目里的角色', 'Alpha Zoo 的核心', '回测策略的主要形式'],
          ]}
        />
        <Callout type="info" title="一个直觉例子">
          「动量因子」：过去 20 天涨得最多的股票，未来一周可能继续涨。
          把所有股票按 20 日涨幅排序打分，这就是一个因子。
          如果这个打分和未来收益的相关性稳定为正，这个因子就是「有效的」。
        </Callout>
      </Section>

      {/* 2. Alpha Zoo */}
      <Section
        eyebrow="项目核心资产"
        title="Alpha Zoo：455 个现成的因子库"
        intro="不用从零写因子。项目内置了学术界和业界最经典的几大因子集，拿来就能用、能测。"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Card title="Alpha101（101 个）" accent="brand" icon={<Sigma size={16} />}>
            来自 Kakushadze 2015 年论文《101 Formulaic Alphas》。
            全部用公式定义、可复现，是量化圈的「Hello World」。
            涵盖量价关系的各种组合。
          </Card>
          <Card title="GTJA191（191 个）" accent="emerald" icon={<Sigma size={16} />}>
            国泰君安证券发表的 191 个 alpha，
            <strong>中国本土语境</strong>设计，针对 A 股市场特征优化。
          </Card>
          <Card title="Qlib158（155 个）" accent="violet" icon={<Sigma size={16} />}>
            微软 Qlib 的因子集，
            <strong>为机器学习设计</strong>，特征工程导向，适合喂给模型。
          </Card>
          <Card title="Academic（10 个）" accent="amber" icon={<Sigma size={16} />}>
            学术经典：Amihud 流动性、Fama-French 五因子（SMB/HML/CMA/RMW）、
            52 周高点等。每个都有论文背书。
          </Card>
        </div>
        <SubHeading>因子怎么定义和调用</SubHeading>
        <p className="mb-3">每个因子就是一个 Python 文件，结构非常简单：</p>
        <KV
          rows={[
            ['元数据', '__alpha_meta__：因子 ID、主题、所需数据列、适用市场'],
            ['计算函数', 'compute(panel) → DataFrame：输入价量数据，输出打分'],
            ['自动发现', '系统扫描 zoo/ 目录，AST 解析元数据，懒加载'],
            ['输出校验', '必须与收盘价同形状、无无穷大、缺失率 &lt;95%'],
          ]}
        />
      </Section>

      {/* 3. 回测 */}
      <Section
        eyebrow="验证假设"
        title="回测引擎：用历史数据验证策略"
        intro="回测 = 把策略扔到历史数据上跑一遍，看如果当时这么做，现在会赚多少。听起来简单，但要做到严谨非常难。"
      >
        <SubHeading>一次回测的流程</SubHeading>
        <Steps
          items={[
            { title: '生成策略代码', desc: 'agent 把你的自然语言描述翻译成一个 SignalEngine 类（输出买卖信号）', icon: <FlaskConical size={14} /> },
            { title: '安全扫描', desc: 'AST 检查策略代码，拒绝危险 import，然后放到隔离子进程里跑', icon: <AlertCircle size={14} /> },
            { title: '取历史数据', desc: '按市场自动选数据源（A股→腾讯/东财，美股→Yahoo…），18 个源带 fallback', icon: <BarChart3 size={14} /> },
            { title: '逐 bar 执行', desc: '信号延迟一根 bar（防偷看未来）→ 算目标仓位 → 模拟成交（含手续费/滑点/涨跌停）', icon: <Activity size={14} /> },
            { title: '算指标 + 产出报告', desc: '收益、夏普、回撤、胜率…，附带可复现的 run_card（含策略哈希）', icon: <Target size={14} /> },
          ]}
        />

        <SubHeading>为什么信号要「延迟一根 bar」</SubHeading>
        <Callout type="warning" title="前视偏差（lookahead bias）是量化最大的坑">
          假设你用「今天的收盘价」决定「今天买入」——这是作弊，因为收盘时你并不知道收盘价。
          正确做法是：用<strong>今天的数据产生信号，明天开盘才执行</strong>。
          项目强制把信号 shift(1)（延后一根 bar），从源头杜绝这种自欺欺人。
        </Callout>

        <SubHeading>7 个市场引擎，规则各异</SubHeading>
        <p className="mb-3">不同市场的交易规则差别巨大，项目为每个市场写了专门的引擎：</p>
        <CompareTable
          head={['市场', '关键规则', '引擎']}
          rows={[
            ['A 股', 'T+1（当天买不能卖）、±10% 涨跌停、100 股整手、印花税', 'ChinaAEngine'],
            ['美股', 'T+0、可做空、无涨跌停', 'GlobalEquity'],
            ['加密货币', '7×24、资金费率、分档爆仓', 'CryptoEngine'],
            ['外汇', '点差、隔夜利息（周三 ×3）', 'ForexEngine'],
            ['期货', '合约乘数、保证金', 'FuturesBase'],
            ['期权', 'Black-Scholes 定价', 'OptionsPortfolio'],
          ]}
        />
      </Section>

      {/* 4. 评价指标 */}
      <Section
        eyebrow="看懂结果"
        title="关键指标：怎么判断策略好不好"
        intro="回测会算一堆指标，但真正关键的只有几个。这里讲它们的人话含义，而不是公式本身。"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Card title="年化收益" accent="emerald">
            <strong>把任意周期的收益换算成一年的。</strong>这是最直观的「赚多少」指标。
            但高收益可能伴随高风险，不能只看它。
          </Card>
          <Card title="最大回撤" accent="rose">
            <strong>从最高点到最低点跌了多少。</strong>比如峰值 100 万跌到 60 万，回撤 40%。
            衡量「最痛的时刻有多痛」，比波动率更贴近体感。
          </Card>
          <Card title="夏普比率（Sharpe）" accent="brand">
            <strong>收益 ÷ 波动。</strong>同样赚 20%，稳稳地赚（Sharpe 高）远好于大起大落地赚（Sharpe 低）。
            <strong>经验值：&gt;1 不错，&gt;2 很好，&gt;3 存疑（可能过拟合）</strong>。
          </Card>
          <Card title="Calmar / Sortino" accent="violet">
            Calmar = 年化收益 ÷ 最大回撤（越高越好）；
            Sortino 类似 Sharpe 但只算下行波动（上涨不算风险）。
          </Card>
        </div>
        <Callout type="tip" title="新手最容易犯的错">
          看到 Sharpe 3.0 就兴奋——<strong>先怀疑过拟合</strong>。
          历史上表现完美的策略，未来往往失效。项目用「随机对照 + 样本外测试」
          （bench_runner_strict）来过滤这种假阳性，这是严肃量化和玩具代码的分水岭。
        </Callout>
      </Section>

      {/* 5. 因子评价 */}
      <Section
        eyebrow="判断因子好坏"
        title="IC 与分层回测：因子到底有没有用"
        intro="有了因子，怎么判断它有效？项目用业界标准的两套方法。"
      >
        <SubHeading>IC（信息系数）</SubHeading>
        <Card accent="brand">
          <p className="mb-2">
            每天把全市场股票按因子值排序，再看这个排序和<strong>第二天实际涨幅排序</strong>的相关性。
            这个相关性就是当天的 IC。
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>IC &gt; 0.03</strong>：因子有点效果</li>
            <li><strong>IC 均值 / IC 标准差（IC_IR）</strong>：衡量稳定性，比单看均值更重要</li>
            <li>用 Spearman 秩相关（比 Pearson 更稳健，不受极端值影响）</li>
          </ul>
        </Card>

        <SubHeading>分层回测</SubHeading>
        <Card accent="emerald" className="mt-4">
          <p className="mb-2">
            把股票按因子值分 5 或 10 层（从低到高），看每层的收益。
            <strong>理想因子：分层收益单调递增</strong>（分最高的层收益最高，分最低的层收益最低）。
            实战常做「做多最高层 + 做空最低层」的对冲组合。
          </p>
          <FlowDiagram
            boxes={[
              { label: '分 5 层', sub: '按因子排序', tone: 'slate' },
              { label: 'Top 层', sub: '做多', tone: 'emerald' },
              { label: 'Bottom 层', sub: '做空', tone: 'rose' },
              { label: '多空收益', sub: '看是否稳定', tone: 'brand' },
            ]}
          />
        </Card>
      </Section>

      {/* 6. 数据源 */}
      <Section
        eyebrow="数据从哪来"
        title="18 个数据源：永不罢工的取数"
        intro="量化离不开数据。项目接了 18 个数据源，按「被墙/限流风险」排了优先级，自动 fallback。"
      >
        <CompareTable
          head={['市场', '数据源优先级（从左到右 fallback）']}
          rows={[
            ['A 股', '腾讯 → mootdx → 东方财富 → BaoStock → akshare → tushare'],
            ['美股', 'Yahoo → Stooq → 新浪 → 东方财富 → yfinance → Tiingo/FMP'],
            ['港股', '东方财富 → Yahoo → 富途 → akshare'],
            ['加密', 'OKX → ccxt → yfinance'],
            ['期货/外汇', 'tushare → akshare / akshare → yfinance'],
          ]}
        />
        <Callout type="info" title="A股特色数据">
          除了 K 线，项目还能取 A 股独有的「特色数据」：
          <strong>龙虎榜</strong>（异动个股资金明细）、<strong>北向资金</strong>（外资流向）、
          <strong>融资融券</strong>（杠杆情绪）、<strong>大宗交易</strong>（机构动向）、
          <strong>限售解禁</strong>（减持压力）。这些是 A 股研究的重要信号源。
        </Callout>
      </Section>

      {/* 7. 算子库 */}
      <Section
        eyebrow="积木块"
        title="横截面算子库：因子的乐高"
        intro="写因子时反复要用一些通用操作（排序、滚动均值、相关性…）。项目把它们封装成十几个算子，像搭乐高一样组合出新因子。"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['rank', '截面排序打分'],
            ['scale', '归一化到 1'],
            ['ts_mean', '滚动均值'],
            ['ts_corr', '滚动相关性'],
            ['delta', '变化量（禁前视）'],
            ['decay_linear', '线性衰减加权'],
            ['ts_rank', '滚动排序'],
            ['vwap', '成交量加权价'],
          ].map(([name, desc]) => (
            <div key={name} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
              <code className="text-brand-600 dark:text-brand-400 !bg-transparent !border-0 !px-0">{name}</code>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{desc}</div>
            </div>
          ))}
        </div>
        <Callout type="tip" title="NaN 纪律">
          这些算子有个铁律：<strong>绝不偷偷填 0</strong>。
          数据缺失就是缺失，传 NaN 往下走。偷偷填 0 会让「没数据」伪装成「值为 0」，
          导致因子在缺数期给出错误信号——这是隐蔽而致命的 bug。
        </Callout>
      </Section>

      <Section eyebrow="小结" title="量化篇要点">
        <div className="grid md:grid-cols-2 gap-3">
          {[
            ['因子 = 打分信号', '横截面选股 / 时序择时'],
            ['455 现成因子', 'Alpha101 / GTJA191 / Qlib158 / 学术'],
            ['回测防前视', '信号 shift(1)，明天才执行'],
            ['7 个市场引擎', '各市场规则差异巨大'],
            ['IC + 分层', '判断因子有效性的标准方法'],
            ['严肃防过拟合', '随机对照 + 样本外测试'],
          ].map(([t, d]) => (
            <div key={t} className="flex items-start gap-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
              <TrendingUp size={16} className="mt-0.5 text-emerald-500 shrink-0" />
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
