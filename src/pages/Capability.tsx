import { useState } from 'react';
import { Wrench, BookOpen, Search, ShieldCheck, Zap, TrendingUp, BarChart3, Database, Bot, Brain } from 'lucide-react';
import { PageHero } from '../components/Layout';
import { Section, Card, Callout, CompareTable, SubHeading, Pill, Details, Modal } from '../components/ui';
import { TOOL_DETAILS } from '../data/toolDetails';

/* =========================================================================
 *  数据：72 个工具（按 9 类分组）
 * ===================================================================== */
type Tool = { name: string; desc: string; ro: boolean; rep: boolean; req: string };
type ToolCat = { cat: string; tone: 'brand' | 'emerald' | 'amber' | 'rose' | 'violet' | 'slate'; icon: typeof Wrench; tools: Tool[] };

const TOOL_CATS: ToolCat[] = [
  {
    cat: '行情数据与基本面', tone: 'brand', icon: Database,
    tools: [
      { name: 'get_market_data', desc: '通过数据加载层获取标准化 OHLCV 行情', ro: true, rep: false, req: 'codes, start_date, end_date' },
      { name: 'get_stock_profile', desc: '美股/港股公司概况（Yahoo）', ro: true, rep: false, req: 'ticker' },
      { name: 'get_financial_statements', desc: 'A 股/港股/美股三大财务报表或关键指标', ro: true, rep: false, req: 'code' },
      { name: 'get_sec_filings', desc: '美国 SEC EDGAR 文件列表 + XBRL 指标', ro: true, rep: false, req: 'ticker' },
      { name: 'get_macro_series', desc: '美联储 FRED 宏观经济时间序列', ro: true, rep: false, req: 'series_id' },
      { name: 'get_stock_news', desc: '财经新闻标题（A 股东财/美股 Yahoo）', ro: true, rep: false, req: '（可选 code）' },
      { name: 'get_options_chain', desc: '美股期权链（Yahoo）', ro: true, rep: false, req: 'ticker' },
      { name: 'options_pricing', desc: 'Black-Scholes 理论价格和希腊字母', ro: true, rep: false, req: 'spot, strike, expiry_days, ...' },
      { name: 'search_symbol', desc: '公司名/代码片段 → 候选标的', ro: true, rep: false, req: 'query' },
      { name: 'screen_market', desc: '筛选全市场标的并按指标排名', ro: true, rep: false, req: 'market' },
    ],
  },
  {
    cat: 'A 股特色数据', tone: 'rose', icon: TrendingUp,
    tools: [
      { name: 'get_block_trades', desc: 'A 股大宗交易（东财）', ro: true, rep: false, req: 'code' },
      { name: 'get_dragon_tiger', desc: 'A 股龙虎榜（前五大席位）', ro: true, rep: false, req: 'date' },
      { name: 'get_margin_trading', desc: 'A 股融资融券余额', ro: true, rep: false, req: 'code' },
      { name: 'get_northbound_flow', desc: '北向资金净流入（沪深港通外资）', ro: true, rep: false, req: '（无）' },
      { name: 'get_fund_flow', desc: '个股主力/大/中/小单净流入', ro: true, rep: false, req: 'codes' },
      { name: 'iwencai_search', desc: '问财自然语言 A 股研究搜索', ro: true, rep: true, req: 'query' },
      { name: 'get_lockup_expiry', desc: 'A 股限售解禁数据', ro: true, rep: true, req: '（无）' },
      { name: 'get_shareholder_count', desc: '季度股东户数（筹码集中度）', ro: true, rep: false, req: 'code' },
      { name: 'get_research_reports', desc: '卖方研报 + 一致预期 EPS', ro: true, rep: false, req: 'code' },
      { name: 'get_sector_info', desc: 'A 股板块/概念板信息', ro: true, rep: false, req: '（无）' },
    ],
  },
  {
    cat: '回测与策略', tone: 'emerald', icon: BarChart3,
    tools: [
      { name: 'backtest', desc: '运行回测：验证 config + signal_engine → 引擎', ro: false, rep: true, req: 'run_dir' },
      { name: 'pattern', desc: '对回测数据运行图表形态检测', ro: true, rep: true, req: 'run_dir' },
      { name: 'run_research_autopilot', desc: '从假设启动研究自动驾驶', ro: false, rep: true, req: 'hypothesis_id' },
      { name: 'generate_backtest_config', desc: '从假设生成 config.json', ro: false, rep: true, req: 'hypothesis_id, dates' },
      { name: 'scaffold_signal_engine', desc: '生成 signal_engine.py 存根', ro: false, rep: true, req: 'hypothesis_id, run_dir' },
      { name: 'link_autopilot_backtest', desc: '把回测结果链接回假设', ro: false, rep: true, req: 'hypothesis_id, run_dir' },
      { name: 'extract_shadow_strategy', desc: '从交易日志提取盈利模式', ro: true, rep: true, req: 'journal_path' },
      { name: 'run_shadow_backtest', desc: '影子账户多市场回测 + 归因', ro: true, rep: true, req: 'shadow_id' },
      { name: 'render_shadow_report', desc: '生成影子账户 PDF 报告', ro: true, rep: true, req: 'shadow_id' },
      { name: 'scan_shadow_signals', desc: '扫描今日符合影子策略的股票', ro: true, rep: true, req: 'shadow_id' },
      { name: 'analyze_trade_journal', desc: '分析交易日志（CSV/Excel）', ro: true, rep: true, req: 'file_path' },
    ],
  },
  {
    cat: '因子与 Alpha', tone: 'violet', icon: Zap,
    tools: [
      { name: 'alpha_bench', desc: '单因子/全库基准测试 + IC 报告', ro: false, rep: true, req: 'universe, period' },
      { name: 'alpha_compare', desc: '多因子头对头基准排名', ro: true, rep: true, req: 'alpha_ids, universe, period' },
      { name: 'alpha_zoo', desc: '浏览内置因子库（list/get/health）', ro: true, rep: true, req: 'action' },
      { name: 'factor_analysis', desc: 'IC/IR/分层净值分析', ro: true, rep: false, req: 'factor_csv, return_csv' },
    ],
  },
  {
    cat: '交易连接器', tone: 'amber', icon: ShieldCheck,
    tools: [
      { name: 'trading_connections', desc: '列出可选交易连接器', ro: true, rep: true, req: '（无）' },
      { name: 'trading_select_connection', desc: '选择默认连接器 profile', ro: false, rep: true, req: 'connection' },
      { name: 'trading_check', desc: '检查连接器是否可达', ro: true, rep: true, req: '（无）' },
      { name: 'trading_account', desc: '读取账户摘要', ro: true, rep: true, req: '（无）' },
      { name: 'trading_positions', desc: '读取持仓', ro: true, rep: true, req: '（无）' },
      { name: 'trading_orders', desc: '读取未结订单', ro: true, rep: true, req: '（无）' },
      { name: 'trading_quote', desc: '读取报价快照', ro: true, rep: true, req: 'symbol' },
      { name: 'trading_history', desc: '读取历史 K 线', ro: true, rep: true, req: 'symbol' },
      { name: 'trading_place_order', desc: '下单（沙盒或受 mandate 限制）', ro: false, rep: false, req: 'symbol, side' },
      { name: 'trading_cancel_order', desc: '撤单', ro: false, rep: false, req: 'order_id' },
      { name: 'propose_mandate_profiles', desc: '提出有界自治交易权限配置', ro: true, rep: true, req: 'broker, ceilings' },
    ],
  },
  {
    cat: '文件 / 代码 / Shell', tone: 'slate', icon: Wrench,
    tools: [
      { name: 'read_file', desc: '读取文件（可选行数限制）', ro: true, rep: true, req: 'path' },
      { name: 'write_file', desc: '写入文件', ro: false, rep: true, req: 'path, content' },
      { name: 'edit_file', desc: '查找替换编辑文件', ro: false, rep: true, req: 'path, old_text, new_text' },
      { name: 'bash', desc: '执行 shell 命令', ro: false, rep: true, req: 'command' },
      { name: 'background_run', desc: '后台线程运行命令', ro: false, rep: false, req: 'command' },
      { name: 'check_background', desc: '检查后台任务状态', ro: true, rep: true, req: '（可选 task_id）' },
      { name: 'read_document', desc: '读取 PDF/Word/Excel/PPT/图片', ro: true, rep: true, req: 'file_path' },
      { name: 'compact', desc: '压缩对话历史释放上下文', ro: false, rep: false, req: '（无）' },
    ],
  },
  {
    cat: '记忆与搜索', tone: 'brand', icon: Brain,
    tools: [
      { name: 'remember', desc: '持久化跨会话记忆（save/recall/forget）', ro: false, rep: true, req: 'action' },
      { name: 'session_search', desc: 'FTS5 全文搜索历史会话', ro: true, rep: true, req: 'query' },
      { name: 'web_search', desc: '网页搜索（DuckDuckGo 等）', ro: true, rep: true, req: 'query' },
      { name: 'read_url', desc: '抓取网页转 Markdown', ro: true, rep: true, req: 'url' },
    ],
  },
  {
    cat: '技能管理', tone: 'rose', icon: BookOpen,
    tools: [
      { name: 'load_skill', desc: '加载技能完整文档', ro: true, rep: true, req: 'name' },
      { name: 'save_skill', desc: '保存工作流为可复用技能', ro: false, rep: true, req: 'name, content' },
      { name: 'patch_skill', desc: '查找替换修补技能', ro: false, rep: true, req: 'name, find, replace' },
      { name: 'delete_skill', desc: '删除用户创建的技能', ro: false, rep: false, req: 'name' },
      { name: 'skill_file', desc: '管理技能辅助文件', ro: false, rep: true, req: 'action, skill_name' },
    ],
  },
  {
    cat: 'Swarm / Goal / Hypothesis', tone: 'amber', icon: Bot,
    tools: [
      { name: 'run_swarm', desc: '运行多智能体团队协作', ro: false, rep: true, req: 'prompt' },
      { name: 'start_research_goal', desc: '启动/替换研究目标', ro: false, rep: true, req: 'objective' },
      { name: 'update_research_goal_status', desc: '更新研究目标状态', ro: false, rep: true, req: 'status' },
      { name: 'get_research_goal', desc: '读取当前研究目标', ro: true, rep: true, req: '（无）' },
      { name: 'add_goal_evidence', desc: '追加证据记录', ro: false, rep: true, req: 'text' },
      { name: 'create_hypothesis', desc: '创建持久研究假设', ro: false, rep: true, req: 'title, thesis' },
      { name: 'update_hypothesis', desc: '更新假设状态', ro: false, rep: true, req: 'hypothesis_id' },
      { name: 'link_backtest', desc: '回测链接到假设', ro: false, rep: true, req: 'hypothesis_id' },
      { name: 'search_hypotheses', desc: '搜索假设', ro: true, rep: true, req: '（无）' },
    ],
  },
];

/* =========================================================================
 *  数据：79 个技能（按 8 类分组）
 * ===================================================================== */
type SkillRow = { name: string; desc: string; refs: number; code: boolean };
type SkillCat = { cat: string; tone: 'brand' | 'emerald' | 'amber' | 'rose' | 'violet' | 'slate'; skills: SkillRow[] };

const SKILL_CATS: SkillCat[] = [
  {
    cat: '数据源（9）', tone: 'brand',
    skills: [
      { name: 'data-routing', desc: '数据需求的总路由——任何取数任务前先加载它', refs: 0, code: false },
      { name: 'tushare', desc: 'A 股/基金/期货全数据（需 token）', refs: 229, code: false },
      { name: 'akshare', desc: '免费免 key 全市场聚合数据（18k+ stars）', refs: 0, code: false },
      { name: 'eastmoney', desc: '东方财富免费数据（资金/龙虎榜/两融/大宗）', refs: 12, code: false },
      { name: 'yfinance', desc: '全球行情 + 财务 + 内部人交易', refs: 6, code: false },
      { name: 'ccxt', desc: '100+ 加密交易所统一接口', refs: 0, code: false },
      { name: 'okx-market', desc: 'OKX 加密行情（现/合/指）', refs: 13, code: false },
      { name: 'mootdx', desc: '通达信 TCP 直连 A 股（免 key 免限流）', refs: 0, code: false },
      { name: 'sec-edgar', desc: 'SEC EDGAR 文件抓取（10-K/10-Q/13F）', refs: 4, code: false },
    ],
  },
  {
    cat: '策略（17）', tone: 'emerald',
    skills: [
      { name: 'technical-basic', desc: '核心技术指标集（EMA/ADX/BB/RSI/OBV）', refs: 0, code: true },
      { name: 'chanlun', desc: '缠论形态引擎（czsc 库，笔/中枢/买卖点）', refs: 6, code: true },
      { name: 'elliott-wave', desc: '艾略特波浪（Zigzag + 5 浪/3 浪）', refs: 2, code: true },
      { name: 'ichimoku', desc: '一目均衡（五线 + 云层）', refs: 2, code: true },
      { name: 'smc', desc: 'Smart Money Concepts（订单块/FVG）', refs: 2, code: true },
      { name: 'harmonic', desc: '谐波形态（Gartley/Bat/Butterfly/CRAB）', refs: 2, code: true },
      { name: 'candlestick', desc: '蜡烛图 15 形态识别（纯 pandas）', refs: 0, code: true },
      { name: 'multi-factor', desc: '多因子横截面选股（含 zoo 引擎）', refs: 0, code: true },
      { name: 'pair-trading', desc: '配对交易（价差 Z-score 均值回归）', refs: 0, code: true },
      { name: 'event-driven', desc: '事件驱动（新闻情绪打分）', refs: 0, code: true },
      { name: 'seasonal', desc: '季节性/日历效应策略', refs: 0, code: true },
      { name: 'minute-analysis', desc: '分钟级数据分析和回测', refs: 0, code: true },
      { name: 'volatility', desc: '波动率分位均值回归', refs: 0, code: true },
      { name: 'cross-market-strategy', desc: '跨市场组合策略（A 股+加密）', refs: 0, code: true },
      { name: 'execution-model', desc: '执行建模（滑点公式 TWAP/VWAP）', refs: 0, code: false },
      { name: 'ml-strategy', desc: '机器学习预测（sklearn 滚动训练）', refs: 0, code: false },
      { name: 'strategy-generate', desc: '策略生成/优化工作流', refs: 0, code: false },
    ],
  },
  {
    cat: '分析（17）', tone: 'violet',
    skills: [
      { name: 'valuation-model', desc: '估值方法论（DCF/DDM/SOTP + 相对）', refs: 0, code: false },
      { name: 'risk-analysis', desc: '风险测量（VaR/CVaR/蒙特卡洛）', refs: 0, code: false },
      { name: 'performance-attribution', desc: 'Brinson 业绩归因', refs: 0, code: false },
      { name: 'factor-research', desc: '因子研究框架（IC/IR/分层）', refs: 0, code: false },
      { name: 'sentiment-analysis', desc: '市场情绪（恐贪/PCR/北向/舆情）', refs: 0, code: false },
      { name: 'macro-analysis', desc: '宏观周期定位 + 央行政策', refs: 0, code: false },
      { name: 'global-macro', desc: '全球宏观（央行传导/外汇/地缘）', refs: 0, code: false },
      { name: 'correlation-analysis', desc: '相关性与协整分析', refs: 0, code: false },
      { name: 'quant-statistics', desc: '量化统计（ADF/GARCH/协整检验）', refs: 0, code: false },
      { name: 'dividend-analysis', desc: '股息分析（增长+股东回报）', refs: 0, code: false },
      { name: 'earnings-forecast', desc: '盈利预测 + 一致预期', refs: 0, code: false },
      { name: 'earnings-revision', desc: '分析师预期修正 + PEAD', refs: 0, code: false },
      { name: 'credit-analysis', desc: '固收信用（评级/利差/转债）', refs: 0, code: false },
      { name: 'commodity-analysis', desc: '商品分析（油/金/铜）', refs: 0, code: false },
      { name: 'market-microstructure', desc: '微观结构（买卖价差/VPIN）', refs: 0, code: false },
      { name: 'behavioral-finance', desc: '行为金融应用', refs: 0, code: false },
      { name: 'shadow-account', desc: '影子账户（交割单提炼策略）', refs: 0, code: false },
    ],
  },
  {
    cat: '资产类（9）', tone: 'amber',
    skills: [
      { name: 'asset-allocation', desc: '资产配置（MPT/Black-Litterman/风险预算）', refs: 0, code: false },
      { name: 'sector-rotation', desc: '行业轮动（景气/动量/产业链）', refs: 0, code: false },
      { name: 'etf-analysis', desc: 'ETF 分析（筛选/费率/跟踪误差）', refs: 0, code: false },
      { name: 'fund-analysis', desc: '基金分析（晨星/夏普/风格漂移）', refs: 0, code: false },
      { name: 'options-strategy', desc: '期权策略（BS + Greeks + 多腿）', refs: 0, code: false },
      { name: 'options-advanced', desc: '高级期权（波动率面 SABR/动态对冲）', refs: 0, code: false },
      { name: 'options-payoff', desc: '期权 P&L（盈亏图/盈亏平衡）', refs: 0, code: false },
      { name: 'hedging-strategy', desc: '对冲设计（beta/期权/尾部风险）', refs: 0, code: false },
      { name: 'convertible-bond', desc: 'A 股可转债（三维估值/双低策略）', refs: 0, code: false },
    ],
  },
  {
    cat: '加密（7）', tone: 'brand',
    skills: [
      { name: 'onchain-analysis', desc: '链上数据（活跃地址/鲸鱼/TVL）', refs: 0, code: false },
      { name: 'defi-yield', desc: 'DeFi 收益（借贷/LP/质押/复投）', refs: 0, code: false },
      { name: 'perp-funding-basis', desc: '永续资金费率 + 基差套利', refs: 0, code: false },
      { name: 'crypto-derivatives', desc: '加密衍生品（期限结构/期权）', refs: 0, code: false },
      { name: 'liquidation-heatmap', desc: '爆仓热力图（杠杆集中区）', refs: 0, code: false },
      { name: 'stablecoin-flow', desc: '稳定币流向（铸币/销毁信号）', refs: 0, code: false },
      { name: 'token-unlock-treasury', desc: '代币解锁 + 国库追踪', refs: 0, code: false },
    ],
  },
  {
    cat: '资金流（8）', tone: 'rose',
    skills: [
      { name: 'financial-statement', desc: '财报三表深度（勾稽/造假红旗）', refs: 0, code: false },
      { name: 'fundamental-filter', desc: '基本面筛选（PE/PB/ROE）', refs: 0, code: true },
      { name: 'edgar-sec-filings', desc: 'SEC 文件分析（10-K/Form 4）', refs: 0, code: false },
      { name: 'corporate-events', desc: '公司事件（并购/增减持/激励/定增）', refs: 0, code: false },
      { name: 'hk-connect-flow', desc: '港股通资金流（北上/南下）', refs: 0, code: false },
      { name: 'us-etf-flow', desc: '美股 ETF 资金流（机构仓位）', refs: 0, code: false },
      { name: 'adr-hshare', desc: 'ADR/H 股/A 股跨市场溢价', refs: 0, code: false },
      { name: 'research-goal', desc: '目标驱动研究工作流', refs: 0, code: false },
    ],
  },
  {
    cat: '工具（10）', tone: 'rose',
    skills: [
      { name: 'report-generate', desc: '专业研究报告生成', refs: 0, code: false },
      { name: 'backtest-diagnose', desc: '回测诊断 + 根因定位', refs: 0, code: false },
      { name: 'doc-reader', desc: '读 PDF/Word/Excel/PPT/图片', refs: 0, code: false },
      { name: 'web-reader', desc: '网页转 Markdown', refs: 0, code: false },
      { name: 'trade-journal', desc: '交易日志分析（同花顺/东财/富途）', refs: 0, code: false },
      { name: 'pine-script', desc: '导出 TradingView Pine Script', refs: 0, code: false },
      { name: 'vnpy-export', desc: '导出 vnpy CtaTemplate', refs: 0, code: false },
      { name: 'regulatory-knowledge', desc: '监管知识（涨跌停/PDT/熔断）', refs: 0, code: false },
      { name: 'geopolitical-risk', desc: '地缘风险量化', refs: 0, code: false },
      { name: 'social-media-intelligence', desc: '社媒信号（Twitter/TG/Discord）', refs: 0, code: false },
    ],
  },
  {
    cat: '其他（2）', tone: 'slate',
    skills: [
      { name: 'alpha-zoo', desc: '因子库浏览与基准测试', refs: 0, code: false },
      { name: 'ashare-pre-st-filter', desc: 'A 股 ST/*ST 风险预测', refs: 0, code: false },
    ],
  },
];

/* 统计 */
const totalTools = TOOL_CATS.reduce((s, c) => s + c.tools.length, 0);
const totalSkills = SKILL_CATS.reduce((s, c) => s + c.skills.length, 0);

/* =========================================================================
 *  工具卡片（可点击弹窗）
 * ===================================================================== */
function ToolRow({ t, onClick }: { t: Tool; onClick: () => void }) {
  const hasDetail = !!TOOL_DETAILS[t.name];
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <code className="text-brand-600 dark:text-brand-400 text-[13px] font-semibold">{t.name}</code>
        <div className="flex gap-1 shrink-0">
          {hasDetail && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">详情</span>}
          {t.ro
            ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">只读</span>
            : <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">写</span>}
          {t.rep && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">可重复</span>}
        </div>
      </div>
      <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-snug">{t.desc}</p>
      <p className="text-[11px] text-slate-400 mt-1">必填: <code className="!text-[11px]">{t.req}</code></p>
    </button>
  );
}

/* =========================================================================
 *  主页面
 * ===================================================================== */
export function Capability() {
  const [query, setQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const filterTools = (t: Tool) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q);
  };
  const filterSkills = (s: SkillRow) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q);
  };

  return (
    <>
      <PageHero
        eyebrow="能力全览"
        title={`${totalTools} 个工具 + ${totalSkills} 个技能：Agent 的完整武器库`}
        desc={
          <>
            Vibe-Trading Agent 的能力边界 = 它能调用的工具集合 × 它掌握的技能知识。
            这里列出全部 {totalTools} 个内置工具和 {totalSkills} 个技能，按职能分类，帮你快速理解「这个 Agent 到底能干什么」。
          </>
        }
      />

      {/* 搜索框 */}
      <div className="sticky top-14 z-20 -mx-4 px-4 py-3 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 mb-6">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索工具/技能名或描述…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* 核心认知 */}
      <Section
        eyebrow="先理解"
        title="工具 vs 技能：有什么区别"
        intro="这是最容易混淆的两个概念。理解了它们的分工，就理解了 Agent 的能力架构。"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Card title={`工具（Tools）· ${totalTools} 个`} icon={<Wrench size={18} />} accent="brand">
            <p className="mb-2"><strong>Agent 实际调用的可执行函数。</strong>每个工具是一段 Python 代码，模型决定调用它后，它真的去执行（取行情/跑回测/写文件）并返回结果。</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">类比：工具是 Agent 手里的<strong>锤子、螺丝刀</strong>——拿来就能用，每次调用产生真实效果。工具决定「能不能做」。</p>
          </Card>
          <Card title={`技能（Skills）· ${totalSkills} 个`} icon={<BookOpen size={18} />} accent="violet">
            <p className="mb-2"><strong>Agent 按需加载的知识文档（Markdown）。</strong>技能本身不执行任何操作，它是一份「操作手册」——告诉 Agent「做某件事应该怎么做、注意什么」。</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">类比：技能是一本<strong>说明书</strong>——Agent 遇到缠论分析任务时，先 load_skill('chanlun') 读手册，再用工具执行。技能决定「做得好不好」。</p>
          </Card>
        </div>
        <Callout type="tip" title="Progressive Disclosure：为什么不一次性加载全部技能？">
          {totalSkills} 个技能全文加载会撑爆 token。所以系统 prompt 只注入每个技能的<strong>一行摘要</strong>（让 Agent 知道「有这个能力存在」），需要时才通过 <code>load_skill</code> 工具拉取全文。这叫「渐进式披露」，是控制上下文成本的关键设计。
        </Callout>
      </Section>

      {/* 工具全清单 */}
      <Section
        eyebrow={`${totalTools} 个工具`}
        title="工具全清单（按职能分类）"
        intro="每个工具是一段可执行代码，模型通过 function calling 调用。只读工具并行执行（最多 8 个），写工具串行执行（避免冲突）。"
      >
        <div className="space-y-6">
          {TOOL_CATS.map(tc => {
            const filtered = tc.tools.filter(filterTools);
            if (filtered.length === 0) return null;
            const Icon = tc.icon;
            return (
              <div key={tc.cat}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={18} className="text-slate-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">{tc.cat}</h3>
                  <Pill tone={tc.tone}>{filtered.length} 个</Pill>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filtered.map(t => <ToolRow key={t.name} t={t} onClick={() => setSelectedTool(t)} />)}
                </div>
              </div>
            );
          })}
        </div>

        <Details summary="源码级：工具调度的并行/串行规则（面试深挖点）">
          <p>工具的 <code>is_readonly</code> 属性决定了它的调度方式，这是性能优化的关键：</p>
          <CompareTable
            head={['类型', '判定', '调度', '超时处理', '例子']}
            rows={[
              ['只读工具', 'is_readonly=True（默认）', 'ThreadPoolExecutor 并行（max 8）', '超时强杀，返回 timeout error', 'get_market_data / web_search'],
              ['写工具', 'is_readonly=False', '串行执行（readonly 批次之间）', '只 warn 不杀（无法安全取消）', 'backtest / write_file / trading_place_order'],
            ]}
          />
          <Callout type="warning" title="为什么写工具超时也不杀">
            下单/写文件这类操作中途强杀会留<strong>半成品状态</strong>（订单挂一半/文件写一半）无法回滚。只读工具幂等可重试，杀掉无害。这是「正确性 &gt; 响应性」的取舍。
          </Callout>
          <p className="mt-3"><code>trading_place_order</code> 和 <code>trading_cancel_order</code> 的 <code>repeatable=False</code>——成功后再调会被 <code>_called_ok</code> 拦截返回 <code>{`{skipped:true}`}</code>，防止重复下单。</p>
        </Details>
      </Section>

      {/* 工具详情弹窗 */}
      <Modal
        open={selectedTool !== null}
        onClose={() => setSelectedTool(null)}
        title={selectedTool ? <><code className="!text-brand-600 dark:!text-brand-400">{selectedTool.name}</code>{TOOL_DETAILS[selectedTool.name] && <span className="ml-2 text-xs text-violet-600 dark:text-violet-400">· 有详情</span>}</> : ''}
        subtitle={selectedTool ? `${selectedTool.ro ? '只读' : '写操作'}${selectedTool.rep ? ' · 可重复' : ''} · 必填: ${selectedTool.req}` : ''}
      >
        {selectedTool && (() => {
          const d = TOOL_DETAILS[selectedTool.name];
          if (!d) {
            return (
              <>
                <p className="text-slate-600 dark:text-slate-400">{selectedTool.desc}</p>
                <Callout type="info" title="基础工具">
                  此工具暂无详细执行逻辑分析。完整定义请查原项目源码 <code className="!text-[12px]">agent/src/tools/</code> 目录。
                </Callout>
              </>
            );
          }
          return (
            <>
              <p className="mb-4 text-slate-600 dark:text-slate-400">{selectedTool.desc}</p>

              <SubHeading>执行逻辑</SubHeading>
              <p className="text-[14px]">{d.execLogic}</p>

              {d.modules.length > 0 && (
                <>
                  <SubHeading>底层模块</SubHeading>
                  <ul className="space-y-1 text-[14px]">
                    {d.modules.map(m => <li key={m} className="flex items-start gap-2"><span className="text-brand-500 mt-0.5">▸</span><code className="!text-[12px] !bg-transparent !border-0 !px-0">{m}</code></li>)}
                  </ul>
                </>
              )}

              <SubHeading>特殊设计</SubHeading>
              <div className="space-y-2">
                {d.special.map(s => (
                  <div key={s.k} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
                    <div className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 mb-0.5">{s.k}</div>
                    <div className="text-[13px] text-slate-600 dark:text-slate-400">{s.v}</div>
                  </div>
                ))}
              </div>
            </>
          );
        })()}
      </Modal>

      {/* 技能全清单 */}
      <Section
        eyebrow={`${totalSkills} 个技能`}
        title="技能全清单（按类别分组）"
        intro="技能是 Agent 的知识库——从数据源接入、策略编写、分析方法到报告生成的操作手册。带 example_signal_engine.py 的可直接生成回测策略代码。"
      >
        <div className="space-y-6">
          {SKILL_CATS.map(sc => {
            const filtered = sc.skills.filter(filterSkills);
            if (filtered.length === 0) return null;
            return (
              <div key={sc.cat}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{sc.cat}</h3>
                  <Pill tone={sc.tone}>{filtered.length}</Pill>
                </div>
                <CompareTable
                  head={['技能', '说明', '参考文件', '代码示例']}
                  rows={filtered.map(s => [
                    <code key={s.name} className="!text-[12px] text-brand-600 dark:text-brand-400">{s.name}</code>,
                    s.desc,
                    s.refs > 0 ? `${s.refs} 个` : '—',
                    s.code ? '✅ example' : '—',
                  ])}
                />
              </div>
            );
          })}
        </div>

        <Details summary="深入：几个值得重点关注的技能">
          <SubHeading>data-routing —— 数据需求的总路由</SubHeading>
          <p>这是 9 个数据源技能里最特殊的一个。它的定位是「<strong>任何数据相关任务前先加载它</strong>」——它会告诉你该用哪个数据源、什么参数、怎么 fallback。是数据层的编排技能。</p>

          <SubHeading>带大型 references 树的技能</SubHeading>
          <CompareTable
            head={['技能', '参考文件数', '内容']}
            rows={[
              ['tushare', '229 个', '36 个子目录覆盖现货/宏观/行业/TMT/大模型语料'],
              ['okx-market', '13 个', '现/合/指三组行情'],
              ['eastmoney', '12 个', '财报/资金/研报/龙虎榜/板块'],
              ['chanlun', '6 个', '核心概念(分型/笔/中枢) + 买卖点'],
              ['yfinance', '6 个', '客户端 + 工具用法'],
            ]}
          />

          <SubHeading>带 example_signal_engine.py 的 15 个策略技能</SubHeading>
          <p>这些技能不只讲理论，还附带<strong>可直接运行的 SignalEngine 示例代码</strong>——Agent 读完后能直接生成符合回测引擎接口的策略。<code>multi-factor</code> 更特殊，额外带 <code>zoo_signal_engine.py</code>（因子库专用引擎）。15 个里 14 个属策略类，只有 <code>fundamental-filter</code> 属资金流类。</p>

          <SubHeading>能自我扩展：save_skill / patch_skill</SubHeading>
          <p>Agent 用 <code>save_skill</code> 把成功的工作流保存成新技能，下次类似任务直接复用。用户目录 <code>~/.vibe-trading/skills/user/</code> 的同名技能会覆盖内置技能——这意味着<strong>Agent 能随用随学，越用越聪明</strong>。</p>
        </Details>
      </Section>

      {/* 能力矩阵总结 */}
      <Section
        eyebrow="总结"
        title="能力矩阵：从数据到决策的完整链路"
        intro="把这些工具和技能串起来，你会看到 Vibe-Trading 覆盖了金融研究的完整工作流。"
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { step: '① 取数据', tools: 'get_market_data + 18 数据源技能', desc: 'A 股/美股/加密/期货，自动 fallback' },
            { step: '② 分析', tools: '龙虎榜/北向/财报/估值/情绪 17 分析技能', desc: '从基本面到行为金融全覆盖' },
            { step: '③ 回测', tools: 'backtest + 15 策略技能 + signal_engine', desc: '7 类市场引擎，防前视偏差' },
            { step: '④ 决策', tools: 'run_swarm + goal + hypothesis', desc: '多 Agent 辩论 + 假设管理' },
            { step: '⑤ 执行', tools: '11 个 trading 工具 + mandate', desc: '受 9 道风控关保护的实盘下单' },
            { step: '⑥ 记忆', tools: 'remember + session_search', desc: '跨会话学习，越用越聪明' },
            { step: '⑦ 扩展', tools: 'save_skill + MCP 远程工具', desc: '自创技能 + 接入外部服务' },
            { step: '⑧ 输出', tools: 'report-generate + pine/vnpy 导出', desc: '研究报告 + 跨平台策略导出' },
          ].map(s => (
            <Card key={s.step} title={s.step} accent="brand" className="h-full">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{s.tools}</p>
              <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
            </Card>
          ))}
        </div>
        <Callout type="success" title="这就是「一句话赋能 Agent 全面交易能力」的实现">
          从取数、分析、回测、决策到执行，每个环节都有对应工具 + 技能支撑。自然语言指令被 ReAct 循环翻译成这些工具的有序调用——这正是 Vibe-Trading 的核心价值。
        </Callout>
      </Section>
    </>
  );
}
