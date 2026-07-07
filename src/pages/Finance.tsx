import { useState } from 'react';
import { TrendingUp, Activity, BarChart3, BookOpen, Search, Layers } from 'lucide-react';
import { PageHero } from '../components/Layout';
import { Section, Card, Callout, CompareTable, Pill, Details } from '../components/ui';

/* =========================================================================
 *  数据：所有概念条目统一结构
 *  each: { term: 术语, en?: 英文, what: 是什么, how: 怎么看/算, use: 实战意义, cat: 分类 }
 * ===================================================================== */
type Term = {
  term: string;
  en?: string;
  what: string;
  how: string;
  use: string;
  cat: 'indicator' | 'concept' | 'flow' | 'fundamental' | 'strategy';
};

const TERMS: Term[] = [
  // ============ 技术指标（先直觉、后术语，讲人话）============
  {
    term: 'MACD', en: 'Moving Average Convergence Divergence',
    what: '判断「涨跌势头在加速还是衰减」的温度计。核心想法：把最近 12 天的平均价和最近 26 天的比一比——近期 > 中期说明在涨，反之在跌。它不只告诉你方向，还告诉你势头强弱。',
    how: '三个零件：① DIF（快线）= 近12日均价 − 近26日均价，正数=涨势，负数=跌势；② DEA（慢线）= DIF 的 9 日平均，比 DIF 更稳；③ 柱状 = DIF − DEA，衡量「涨/跌的力气在变大还是变小」。DIF 从下往上穿 DEA = 金叉（看涨），反向 = 死叉。',
    use: '柱状缩短是转向的提前预警——价格还在涨但力气衰减。但震荡市里 DIF/DEA 反复缠绕全是假信号，只在有明显趋势时好用。',
    cat: 'indicator',
  },
  {
    term: 'RSI', en: 'Relative Strength Index',
    what: '一个 0-100 的分数，回答「最近涨得猛不猛」。想法很朴素：统计最近 N 天里，上涨的日子占多大优势——涨的日子多且涨得狠，RSI 就高（接近100），说明短期可能涨过头了。',
    how: '常用 14 天。RSI > 70 = 超买（短期涨太多，可能回调）；< 30 = 超卖（跌太多，可能反弹）。最值钱的信号是「背离」：价格创新高但 RSI 没创新高，说明涨势是强弩之末。',
    use: '找短期反转点。但强势趋势中 RSI 可以长期贴在 70 以上不下来（"超买还能超买"），别看到 70 就无脑空。',
    cat: 'indicator',
  },
  {
    term: 'KDJ',
    what: '回答一个具体问题：「今天的收盘价，处在最近 N 天最高最低区间的什么位置？」如果收在区间顶部附近，说明买方强（短期偏热）；收在底部附近，说明卖方强（偏冷）。',
    how: '由 K、D、J 三条线组成：K 和 D 是上面那个"位置值"的平滑版（降噪），J = 3K − 2D（最激进）。J > 100 算超买，J < 0 算超卖。K 上穿 D = 金叉看涨。',
    use: '短期波段操作。KDJ 反应极灵敏，但灵敏的代价是噪声大——趋势市里它容易"钝化"（长期贴顶或贴底不下来），震荡市更好用。',
    cat: 'indicator',
  },
  {
    term: 'BOLL', en: 'Bollinger Bands',
    what: '给价格画一个"上下通道"：中间是一条均线（20日均价），上下各加一个"弹性边界"。边界会随着价格波动自动变宽变窄——波动大通道变宽，平静时通道收窄。',
    how: '中轨 = 20日均价；上轨 = 中轨 + 2 倍标准差；下轨 = 中轨 − 2 倍标准差。价格触上轨=偏贵（可能回调），触下轨=偏便宜（可能反弹）。通道极度收窄（"缩口"）= 现在很平静，但暴风雨将至。',
    use: '两个核心用法：① 触边界做反向（涨到顶轨卖、跌到底轨买）；② 缩口预警——价格长期平静后必有大行情，配合成交量确认方向。',
    cat: 'indicator',
  },
  {
    term: '均线系统', en: 'MA / EMA',
    what: '最朴素的趋势工具：把最近 N 天的收盘价加起来除以 N，得到一条"平均价曲线"。它抹平了每天的波动，让你看清大趋势往哪走。常用 5/10/20/60/120/250 日。',
    how: 'SMA = 简单平均（每天权重相同）；EMA = 指数加权（越近的日子权重越大，反应更快）。短期均线（如5日）上穿长期均线（如20日）= 金叉看多，反向 = 死叉。当 5>10>20>60 日均线从短到长排开 = "多头排列"（强势）。',
    use: '判断趋势方向和支撑/压力位。250 日线（年线）被视为牛熊分界线——价格在年线上方=牛市心态，下方=熊市心态。',
    cat: 'indicator',
  },
  {
    term: '成交量', en: 'Volume',
    what: '一段时间里买卖双方成交了多少股。它本身不预测涨跌，但它能告诉你"现在这个价格变动是真是假"——没人参与的涨跌不可信。行话说"量在价先"，意思是真实的趋势一定有成交量的配合。',
    how: '看相对值而非绝对值：今天的量是近期平均量的多少倍。>1.5 倍 = 放量（人气旺），<0.7 = 缩量（没人玩）。"天量天价"（顶部放出历史大量）、"地量地价"（底部缩到极致）是经典说法。',
    use: '验证价格信号。放量突破 = 真突破（有人真金白银跟进）；缩量突破 = 假突破（没人信）。最危险的是"放量滞涨"——量很大但价格不动了，往往是主力出货。',
    cat: 'indicator',
  },
  {
    term: 'VWAP', en: 'Volume Weighted Average Price',
    what: '回答「今天大家的平均买入成本是多少」——把今天每一笔成交的价格按成交量加权平均。比简单均价更真实，因为成交量大的价位才是"主流成本"。',
    how: 'VWAP = 今天所有"成交价 × 成交量"之和 ÷ 总成交量。机构最看重这个——他们的执行目标是"买入价不要比 VWAP 差太多"（买得好 = 优于 VWAP）。',
    use: '判断当天强弱：价格在 VWAP 上方 = 今天多数人浮盈（偏强）；下方 = 多数人浮亏（偏弱）。机构大单常用 VWAP 作为拆单基准。',
    cat: 'indicator',
  },
  {
    term: 'ATR', en: 'Average True Range',
    what: '衡量「这只股票每天大概会上下窜多少」。它不告诉你方向（涨或跌），只告诉你"脾气有多大"——ATR 大说明波动剧烈，小说明温吞水。',
    how: '每天的真实波幅 True Range = 当天最高−最低（还要考虑跳空缺口），ATR = 最近 14 天的真实波幅平均。一只每天上下窜 5% 的股票，ATR 比一只只窜 1% 的大得多。',
    use: '两个核心用途：① 动态止损——止损距离设为 2×ATR（脾气大的股票止损要宽，否则容易被随机波动洗出去）；② 仓位管理——ATR 大的标的要少买，控制单笔风险。',
    cat: 'indicator',
  },

  // ============ 核心概念（讲人话）============
  {
    term: '蓝筹股', en: 'Blue Chip',
    what: '股市里的"大块头、稳压器"——那些规模巨大、行业龙头、盈利稳定、每年老老实实分红的公司。得名于赌场里最值钱的蓝色筹码。它们的特点是：涨得慢但跌得也少，靠分红+长期增长。',
    how: 'A 股代表：贵州茅台、招商银行、中国平安、长江电力。美股代表：苹果、微软、可口可乐、强生。识别特征：市值千亿以上、连续多年盈利、分红率稳定、机构重仓。',
    use: '适合稳健型和长期投资者。牛市里它们涨幅可能不如题材股（不性感），但熊市里抗跌，长期靠复利跑赢。也是定投和养老组合的底仓首选。',
    cat: 'concept',
  },
  {
    term: '放量与缩量',
    what: '判断"今天有没有人在认真玩"——放量 = 成交明显比平时多（资金在激烈博弈），缩量 = 成交明显比平时少（大家观望）。配合涨跌方向一起看才有意义。',
    how: '和近 5-10 日的平均成交量比：明显放大叫放量，明显萎缩叫缩量。关键不是绝对数字，而是"相对平时的异常"。底部突然放量 = 有大资金进场；高位放量但价格不动 = 主力在出货。',
    use: '最经典口诀：放量上涨=健康（有人追）；缩量上涨=虚（没人跟，随时垮）；放量下跌=恐慌抛售；缩量阴跌=最可怕（温水煮青蛙，无人接盘）。详见下方"量价关系"专题。',
    cat: 'concept',
  },
  {
    term: '换手率', en: 'Turnover Rate',
    what: '今天这只股票的流通股份里，有多少比例"换了手"（被买卖了一次）。它反映这只股票有多活跃——换手率高=交易火爆，低=冷清。',
    how: '换手率 = 今天成交量 ÷ 流通股本 × 100%。经验：<1% 冷清；3-7% 活跃；>10% 异常火爆（要么有大消息，要么在见顶出货）。',
    use: '识别主力和异常：一只平时换手 1% 的股票突然飙升到 15%+涨停 = 有大事发生（消息/主力进场）；高位长期高换手 = 大股东/主力在悄悄派发筹码。',
    cat: 'concept',
  },
  {
    term: '涨停 / 跌停',
    what: 'A 股特有的"限速器"——单日价格涨到一定幅度就封顶（涨停），跌到一定幅度就封底（跌停），当天不能再往上涨/往下跌。目的是防止单日过度投机。',
    how: '幅度按板块不同：主板 ±10%，ST（被特别处理）股 ±5%，创业板/科创板 ±20%，北交所 ±30%。涨停时买单堆积如山叫"封板"，封不住打开叫"炸板"。',
    use: '一字涨停（开盘即封死）= 多头最强势；炸板=多空激烈分歧。注意：跌停时很难卖出（卖单排队，按时间优先成交），所以大跌时往往"卖不出去"——这是 A 股的制度风险。',
    cat: 'concept',
  },
  {
    term: 'T+1 与 T+0',
    what: 'T+1 = 今天买的股票，明天才能卖（不能当天反复交易）；T+0 = 当天买当天就能卖，可以无限次日内交易。这是制度对"能多快兑现"的限制。',
    how: 'A 股主板是 T+1（买了当天不能卖）；可转债、部分 ETF 是 T+0；港股美股 T+0（美股要求账户余额>2.5万美元才能频繁日内）；加密货币 7×24 全天 T+0。',
    use: 'T+1 让你不能"上午买了下午看到不对就跑"，逼你持有更长——既是保护也是束缚。想做日内波段，要么选 T+0 品种（可转债/加密），要么开融资融券。',
    cat: 'concept',
  },
  {
    term: '做多 / 做空',
    what: '做多 = 买入赌它涨（低买高卖赚差价）——这是大多数人理解的"炒股"。做空 = 反过来，赌它跌：先借股票高价卖出，等跌了再低价买回来还回去，赚差价。',
    how: '做空需要先"借券"：A 股通过融资融券账户（开户门槛50万），券源还有限；期货/期权可以直接做空；加密货币有永续合约一键做空。做空的理论亏损是无限的（价格能涨多高没上限）。',
    use: '做空让你在熊市也能赚钱，但风险更大（理论上无限亏损）。A 股做空很难（券少+制度限制），所以 A 股投资者主要靠做多，熊市只能空仓等待。',
    cat: 'concept',
  },
  {
    term: '杠杆与保证金',
    what: '杠杆 = 借钱（或借券）放大你的仓位，赚得多但亏得也多。保证金 = 你自己出的本金占总仓位的比例。1:5 杠杆 = 你出 1 万，操作 5 万的仓位，盈亏都按 5 万算。',
    how: '期货保证金通常 5-15%（相当于 6-20 倍杠杆）；加密永续合约 1-100 倍；融资融券 1-2 倍。亏损一旦吃光保证金，就会被"强平"（爆仓）——平台强制平仓，你可能血本无归。',
    use: '杠杆是双刃剑：赚的时候很爽，亏的时候也很爽（爽快地归零）。铁律：用杠杆必须设止损，否则一次反向波动就爆仓。新手别碰高杠杆（10倍以上）。',
    cat: 'concept',
  },

  // ============ 资金流向 ============
  {
    term: '北向资金',
    what: '通过沪深港通从香港流入 A 股的境外资金（沪股通+深股通）。被视为「聪明钱」和市场情绪风向标。',
    how: '每日公布净买入额。连续多日大额净流入 = 外资看好；大额净流出 = 警惕。重点关注个股的北向持仓变化。',
    use: '北向资金对大盘有领先指示作用。但近年「假外资」争议，参考价值有所下降。项目用 get_northbound_flow 取数。',
    cat: 'flow',
  },
  {
    term: '龙虎榜',
    what: '交易所披露的当日异动股（涨跌幅/换手率达标）的前五大买卖席位明细。看主力资金动向的窗口。',
    how: '当日涨幅±7%/换手>20%等条件触发披露。机构席位（专用席位）= 长线资金；游资营业部 = 短线炒作。',
    use: '机构净买入 = 中长线看好；知名游资（如东方财富拉萨）介入 = 短线题材。项目用 get_dragon_tiger 取数。',
    cat: 'flow',
  },
  {
    term: '融资融券', en: 'Margin Trading',
    what: '融资 = 向券商借钱买股（做多杠杆）；融券 = 借券卖出（做空）。两融余额反映杠杆情绪。',
    how: '融资余额增加 = 杠杆做多情绪升温；融券余额增加 = 看空情绪。两融余额历史高位常对应市场顶部。',
    use: '作为市场情绪的反向指标参考。融资余额极高 = 杠杆资金堆积，一旦下跌可能引发踩踏。项目用 get_margin_trading。',
    cat: 'flow',
  },
  {
    term: '大宗交易',
    what: '达到一定数量/金额的场外大额成交（A 股通常单笔>50万股或>300万元），机构间协商价成交。',
    how: '成交价通常有 5-9 折折价。溢价成交（高于市价）= 机构抢筹看好；大幅折价 = 减持出货。',
    use: '连续大宗交易+折价 = 股东减持信号。关注大宗交易后的股价走势。项目用 get_block_trades 取数。',
    cat: 'flow',
  },

  // ============ 基本面 ============
  {
    term: '市盈率', en: 'PE Ratio',
    what: '股价 / 每股收益。最常用的估值指标——「花多少年能靠盈利回本」。',
    how: '静态PE = 现价/上年EPS；动态PE = 现价/预测今年EPS；TTM PE = 现价/过去12月EPS（最常用）。',
    use: '同行业横向比较。PE 低不一定便宜（可能业绩要下滑），PE 高不一定贵（成长股预期高）。配合成长率看 PEG。',
    cat: 'fundamental',
  },
  {
    term: '市净率', en: 'PB Ratio',
    what: '股价 / 每股净资产。反映「花多少溢价买公司的账面资产」。',
    how: 'PB = 现价 / 每股净资产。PB<1 = 破净（股价低于账面价值，常见于银行/钢铁）。',
    use: '重资产/金融行业用 PB 比较合适。破净股要么是真低估，要么是资产质量差（坏账隐患）。',
    cat: 'fundamental',
  },
  {
    term: 'ROE', en: 'Return on Equity',
    what: '净资产收益率 = 净利润 / 净资产。巴菲特最看重的指标——衡量公司赚钱效率。',
    how: 'ROE = 净利润 / 平均净资产 × 100%。连续 3 年 ROE>15% 算优秀，>20% 卓越。',
    use: '高 ROE + 低 PE + 低负债 = 经典价值股特征。但注意高 ROE 可能来自高杠杆（高负债）而非真盈利能力，要看杜邦分析。',
    cat: 'fundamental',
  },
  {
    term: 'PEG', en: 'PE to Growth',
    what: '市盈率 / 盈利增长率。彼得·林奇最爱——把成长性纳入估值。',
    how: 'PEG = PE / 未来3年预期盈利增速。PEG<1 被认为低估；PEG=1 合理；PEG>1 偏贵。',
    use: '弥补 PE 对成长股的误判。一个 PE=50 的公司，如果增速 50%，PEG=1 仍合理。但「预期增速」难准确预测。',
    cat: 'fundamental',
  },
  {
    term: '股息率', en: 'Dividend Yield',
    what: '每股股息 / 股价。衡量分红回报率，类似「利息」。',
    how: '股息率 = 每股年度股息 / 现价 × 100%。银行/公用事业/能源股股息率高（4-6%），科技股低（0-1%）。',
    use: '熊市/震荡市的防御策略。股息率 > 5% 且分红稳定的蓝筹，提供类债收益+股价上涨潜力。注意区分「分红」和「回购」。',
    cat: 'fundamental',
  },

  // ============ 策略/风格 ============
  {
    term: '价值投资', en: 'Value Investing',
    what: '买入价格低于内在价值的股票，等待价值回归。格雷厄姆/巴菲特流派。',
    how: '核心：安全边际（买入价显著低于计算的价值）。关注 PE/PB/ROE/股息率，寻找被市场低估的好公司。',
    use: '适合长线（年为单位）。难点在「计算内在价值」和「耐心等待」。在牛市后期/科技泡沫期表现最好。',
    cat: 'strategy',
  },
  {
    term: '成长投资', en: 'Growth Investing',
    what: '买入高速增长的公司，即使当前估值高。费雪/彼得·林奇流派。',
    how: '关注营收/利润增速、TAM（总可寻址市场）、竞争壁垒。愿意为高增速付高 PE（看 PEG）。',
    use: '科技/医药/新能源赛道常用。风险是增速不及预期时戴维斯双杀（业绩降+估值杀）。适合牛市和趋势市场。',
    cat: 'strategy',
  },
  {
    term: '动量策略', en: 'Momentum',
    what: '「强者恒强」——买入近期表现最好的，卖出最差的。基于行为金融学的持续效应。',
    how: '横截面动量：买入过去 6-12 月涨幅最高的 10%，做空最低的 10%。时序动量：趋势跟踪。',
    use: '趋势市场有效，震荡/反转市失效。Vibe-Trading 的 Alpha101 里大量因子是动量类。需配合止损防趋势反转。',
    cat: 'strategy',
  },
  {
    term: '均值回归', en: 'Mean Reversion',
    what: '「涨多了会跌，跌多了会涨」——价格终将回归均值。动量的对立面。',
    how: '用布林带/Z-score 等识别偏离均值的极端情况，反向操作。配对交易（pair trading）是典型应用。',
    use: '震荡市有效，趋势市危险（「市场保持非理性的时间可能比您保持偿付能力的时间更长」）。需严格止损。',
    cat: 'strategy',
  },
];

const CAT_META: Record<Term['cat'], { label: string; tone: 'brand' | 'emerald' | 'amber' | 'violet' | 'rose'; icon: typeof TrendingUp }> = {
  indicator: { label: '技术指标', tone: 'brand', icon: Activity },
  concept: { label: '核心概念', tone: 'emerald', icon: BookOpen },
  flow: { label: '资金流向', tone: 'amber', icon: TrendingUp },
  fundamental: { label: '基本面估值', tone: 'violet', icon: BarChart3 },
  strategy: { label: '策略风格', tone: 'rose', icon: Layers },
};

function TermCard({ t }: { t: Term }) {
  const meta = CAT_META[t.cat];
  return (
    <Card title={`${t.term}${t.en ? ` · ${t.en}` : ''}`} accent={meta.tone} className="h-full">
      <div className="mb-2">
        <Pill tone={meta.tone}>{meta.label}</Pill>
      </div>
      <div className="space-y-2 text-[14px]">
        <p><span className="font-semibold text-slate-900 dark:text-white">是什么：</span>{t.what}</p>
        <p><span className="font-semibold text-slate-900 dark:text-white">怎么看：</span>{t.how}</p>
        <p><span className="font-semibold text-slate-900 dark:text-white">实战意义：</span>{t.use}</p>
      </div>
    </Card>
  );
}

export function Finance() {
  const [filter, setFilter] = useState<Term['cat'] | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = TERMS.filter(t => {
    if (filter !== 'all' && t.cat !== filter) return false;
    if (query) {
      const q = query.toLowerCase();
      return t.term.toLowerCase().includes(q) || (t.en?.toLowerCase().includes(q)) ||
             t.what.includes(query) || t.use.includes(query);
    }
    return true;
  });

  return (
    <>
      <PageHero
        eyebrow="金融知识库"
        title="金融投资核心概念：从指标到实战"
        desc={
          <>
            这不是一个量化专属知识库，而是<strong>所有金融投资从业者都该掌握的核心概念</strong>——
            技术指标怎么看、量价关系怎么读、估值怎么算、策略流派有哪些。每个概念讲透「是什么 / 怎么看 / 实战意义」三段。
          </>
        }
      />

      {/* 搜索 + 过滤 */}
      <div className="sticky top-14 z-20 -mx-4 px-4 py-3 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索术语/英文/含义…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'all' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
            >全部 ({TERMS.length})</button>
            {(Object.keys(CAT_META) as Term['cat'][]).map(k => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === k ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
              >{CAT_META[k].label} ({TERMS.filter(t => t.cat === k).length})</button>
            ))}
          </div>
        </div>
      </div>

      {/* 概念卡片网格 */}
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        {filtered.map(t => <TermCard key={t.term} t={t} />)}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          没有匹配「{query}」的条目，换个关键词试试。
        </div>
      )}

      {/* 量价关系专题 */}
      <Section
        eyebrow="最该掌握"
        title="量价关系：技术分析的基石"
        intro="「量在价先」——成交量是价格变动的因，价格是成交量变动的果。读懂量价，就懂了市场的一半。"
      >
        <CompareTable
          head={['组合', '含义', '后续走势']}
          rows={[
            ['放量上涨', '成交量放大 + 价格上涨', '多头强势，趋势健康，可持续'],
            ['放量下跌', '成交量放大 + 价格下跌', '空头强势，恐慌抛售，可能继续跌'],
            ['缩量上涨', '成交量萎缩 + 价格上涨', '上涨乏力，跟风不足，警惕回落'],
            ['缩量下跌', '成交量萎缩 + 价格下跌', '最可怕的阴跌——无人接盘，可能长期下跌'],
            ['放量滞涨', '高位成交量放大但价格不涨', '主力出货信号，见顶概率大'],
            ['地量地价', '成交量极度萎缩 + 价格低位', '卖压衰竭，可能见底（但需催化）'],
            ['天量天价', '历史天量 + 价格高位', '顶部信号，主力大规模出货'],
          ]}
        />
        <Callout type="tip" title="量价分析的精髓">
          量价不是孤立的，要看<strong>位置</strong>。同样的「放量上涨」，在底部是反转信号，在高位可能是诱多。
          永远结合趋势阶段（建仓/拉升/出货）和成交量相对强度（vs 近期均量）一起看。
        </Callout>
      </Section>

      {/* 估值方法 */}
      <Section
        eyebrow="进阶"
        title="估值方法：怎么判断贵不贵"
        intro="估值是投资的核心问题。不同行业用不同方法，没有万能公式。"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Card title="相对估值法" accent="brand">
            <p className="mb-2">用倍数（PE/PB/PS/PCF）和同行、历史比较。最常用。</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>PE</strong>：盈利稳定的行业（消费/制造）</li>
              <li><strong>PB</strong>：重资产行业（银行/钢铁/地产）</li>
              <li><strong>PS</strong>：亏损但增长快的（SaaS/互联网）</li>
              <li><strong>PEG</strong>：成长股，把增速纳入</li>
            </ul>
          </Card>
          <Card title="绝对估值法（DCF）" accent="violet">
            <p className="mb-2">折现现金流：把未来所有现金流折算成今天的价值。</p>
            <p className="text-sm">理论最严谨，但对假设（增长率/折现率）极度敏感，输入微小变化导致结果天差地别。机构用，散户少用。</p>
          </Card>
        </div>
        <Details summary="深入：为什么 PE 低不一定便宜（价值陷阱）">
          <p>「价值陷阱」：PE 看起来低，但其实是因为市场预期公司盈利要下滑。</p>
          <p className="mt-2">例：某周期股在行业顶部时 EPS=5，股价 50，PE=10 看似便宜。但行业下行后 EPS 跌到 1，股价腰斩到 25，PE 反而升到 25——你买在「便宜」其实买在顶部。</p>
          <Callout type="warning" title="避开价值陷阱的几个方法">
            <ul className="list-disc pl-5 space-y-1">
              <li>看<strong>盈利质量</strong>：现金流是否匹配账面利润</li>
              <li>看<strong>行业周期</strong>：周期股要在高 PE 时买（盈利底部）、低 PE 时卖（盈利顶部）</li>
              <li>看<strong>ROE 趋势</strong>：ROE 持续下滑的公司，低 PE 往往是陷阱</li>
              <li>用 <strong>PE-TTM + 预期增速</strong>（PEG）而非单期 PE</li>
            </ul>
          </Callout>
        </Details>
      </Section>

      {/* 风险管理 */}
      <Section
        eyebrow="保命要紧"
        title="风险管理：比赚钱更重要的事"
        intro="「投资的第一条规则是不要亏钱，第二条是记住第一条。」——巴菲特"
      >
        <div className="grid md:grid-cols-3 gap-4">
          <Card title="仓位管理" accent="amber">
            <strong>不要一把梭。</strong>分批建仓（金字塔/倒金字塔），
            单只标的不超过总仓位 20-30%。
            <strong>凯利公式</strong>：f = (bp−q)/b，按胜率和赔率算最优仓位。
          </Card>
          <Card title="止损纪律" accent="rose">
            <strong>错了就认。</strong>预设止损位（如 -5% 或 2×ATR），
            触及<strong>无条件执行</strong>。最大的亏损都来自「等等看」。
            止损是成本，不是失败。
          </Card>
          <Card title="分散与对冲" accent="emerald">
            <strong>别把鸡蛋放一个篮子。</strong>不同资产类别（股/债/商品/现金）、
            不同行业、不同市场分散。
            相关性低的资产组合能降风险不降收益（马科维茨）。
          </Card>
        </div>
        <Callout type="warning" title="回撤的残酷算术">
          亏损 50% 需要盈利 100% 才能回本。亏损 20% 只需 25% 回本。
          <strong>控制回撤比追求收益重要得多</strong>——这是为什么专业机构把最大回撤看得比年化收益还重。
        </Callout>
      </Section>

      <Callout type="info" title="这份知识库会持续生长">
        这里收录的是最核心、最高频的概念。如果你在阅读项目或实战中遇到不懂的术语，
        告诉我，我会补充进来并讲透。金融知识的积累是个长期过程，重要的是<strong>建立框架</strong>——
        技术分析、基本面、资金面、风险管理四大支柱，每个都懂一点，远胜过只钻一个方向。
      </Callout>
    </>
  );
}
