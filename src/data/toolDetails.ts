/* 工具详情数据：15 个重点工具的执行逻辑、底层模块、特殊设计。
 * 来源：派 explore agent 从原项目源码逐个 Read 确认。
 * 未在此列表的工具，弹窗只显示基本信息（名称/描述/参数/读写/可重复）。
 */
export type ToolDetail = {
  name: string;
  execLogic: string;      // execute 方法核心逻辑（人话）
  modules: string[];      // 调用的底层模块
  special: { k: string; v: string }[];  // 特殊设计要点
};

export const TOOL_DETAILS: Record<string, ToolDetail> = {
  get_market_data: {
    name: 'get_market_data',
    execLogic: '工具本身无校验，直接透传给 fetch_market_data_json(codes, start, end, source, interval, max_rows)。source=auto 时按 detect_source(code) 正则匹配符号后缀分组路由到不同数据源。',
    modules: [
      'src.market_data.fetch_market_data_json / fetch_market_data',
      'src.market_data.detect_source — 按正则匹配符号后缀推断数据源',
      'backtest.loaders.registry.get_loader_cls_with_fallback',
    ],
    special: [
      { k: '智能路由', v: 'auto 模式按符号后缀(.US/.HK/.SH/数字开头/BTC- 等)正则分组路由到对应数据源' },
      { k: 'Fallback Chain', v: '指定 loader 不可用时，按 FALLBACK_CHAINS 自动降级：A 股 7 级链(腾讯→mootdx→东财→baostock→akshare→tushare→local)，美股 11 级链' },
      { k: '失败隔离', v: '单个 loader.fetch() 抛异常被 try/except 吞掉，该 code 进 _unresolved 列表，不影响其他 code' },
      { k: '截断策略', v: 'max_rows 截断时用 even-stride 抽样并固定最后一根 bar，返回 {rows, returned, truncated, policy}' },
    ],
  },
  get_dragon_tiger: {
    name: 'get_dragon_tiger',
    execLogic: '1) _compact_date 规范日期；2) _bare_code 剥离代码后缀；3) _collect() 调东财 datacenter API 拼装上榜清单+营业部席位；4) 异常→error 信封。',
    modules: ['backtest.loaders.eastmoney_client.get_json（走共享节流客户端）'],
    special: [
      { k: '数据源', v: 'Eastmoney datacenter-web API，两个 reportName：上榜清单 + 营业部席位明细' },
      { k: '结果上限', v: '_MAX_APPEARANCES=200, _MAX_SEATS=30，防宽市场日返回无界 payload' },
      { k: '字段投影', v: '只取关键字段（代码/收盘价/涨跌幅/净额/原因 + 营业部名/买卖方向/净额/排名）' },
    ],
  },
  get_northbound_flow: {
    name: 'get_northbound_flow',
    execLogic: '1) clamp_lookback 限定 [1,250]；2) 并发两次 get_json：realtime + history；3) 解析 hk2sh/hk2sz 的 netBuyAmt 求和；4) 解析历史 klines 取尾部 N 天。',
    modules: ['backtest.loaders.eastmoney_client.get_json'],
    special: [
      { k: '双端点', v: 'realtime 端点取实时净流入，history 端点取日 K 线历史（klt=101 日线）' },
      { k: '数值容错', v: '_coerce_float 把 Eastmoney 的 "-"/空格/None 转为 None（表示缺失）' },
      { k: '市场级聚合', v: '返回的是全市场北向总额，分沪股通/深股通，不是个股级别' },
    ],
  },
  get_financial_statements: {
    name: 'get_financial_statements',
    execLogic: '1) _classify_market 按后缀分 a_share/us/hk；2) US→SEC EDGAR companyfacts，A/HK→东财 F10 财务接口；3) 嵌套失败提升为顶层 ok:false（防掩盖错误）。',
    modules: [
      'backtest.loaders.eastmoney_client（A 股/港股）',
      'backtest.loaders.sec_edgar_client（美股 SEC XBRL）',
    ],
    special: [
      { k: '三市场路由', v: 'A 股(.SH/.SZ/.BJ)→东财 RPT_F10_FINANCE_*，港股(.HK)→东财 RPT_HKF10_FN_*，美股(.US)→SEC EDGAR companyfacts XBRL' },
      { k: '年报过滤', v: '东财返回年报+季报混合，annual 时客户端过滤 REPORT_DATE 以 -12-31 结尾' },
      { k: 'SEC XBRL', v: '按 us-gaap concept 名取数据，按 (end,fy,fp,form) 聚合成 period' },
      { k: '上下文防护', v: '_MAX_PERIODS=40, _MAX_FIELDS_PER_PERIOD=200，防撑爆 LLM 上下文' },
    ],
  },
  backtest: {
    name: 'backtest',
    execLogic: '1) safe_run_dir 路径校验防越狱；2) 读 config.json 校验 source ∈ VALID_SOURCES；3) 检查 signal_engine.py 存在；4) Runner(timeout=300).execute() 启动子进程；5) 收集 artifacts。',
    modules: [
      'src.core.runner.Runner — 子进程封装（timeout=300s）',
      'backtest.runner — 真正的引擎入口（含 AST 扫描）',
      'src.tools.path_utils.safe_run_dir',
    ],
    special: [
      { k: '子进程隔离', v: 'subprocess.run + 环境变量白名单（_RUNTIME_ENV_KEYS），剥离 LLM/API/broker 凭证，只留 OS 基础+行情 token' },
      { k: 'AST 安全扫描', v: 'import 时拒绝执行性语句（只允许 import/docstring/常量赋值/函数/类）、检测循环自导入、拒绝装饰器/非字面默认值' },
      { k: '契约校验', v: 'inspect 校验 SignalEngine() 无参构造 + generate(data_map) 可调用' },
      { k: '输出截断', v: 'stdout/stderr 各取末尾 2000 字符返回，防溢出' },
      { k: '硬超时', v: '5 分钟（subprocess.run timeout=300），超时强杀子进程' },
    ],
  },
  scaffold_signal_engine: {
    name: 'scaffold_signal_engine',
    execLogic: '1) safe_run_dir 校验；2) 从 HypothesisRegistry 取假设；3) 若 signal_engine.py 已存在且 overwrite=false 则报错；4) _SIGNAL_ENGINE_TEMPLATE.format() 填入假设信息；5) write_text 写入 code/signal_engine.py。',
    modules: ['src.hypotheses.HypothesisRegistry', 'src.tools.path_utils.safe_run_dir'],
    special: [
      { k: '契约正确', v: '生成的存根满足 backtest 引擎契约：无参 __init__ + generate(data_map)→dict[str,pd.Series]，默认返回全 0（无仓位），可直接 smoke 测试' },
      { k: 'docstring 内嵌', v: '假设的 signal_definition 嵌进 generate 的 docstring，便于 agent 后续填逻辑' },
      { k: '防覆盖', v: '默认 overwrite=false，已存在即报错' },
    ],
  },
  pattern: {
    name: 'pattern',
    execLogic: '1) safe_run_dir；2) glob artifacts/ohlcv_*.csv（无则报错"run backtest first"）；3) 按 patterns 参数选检测函数；4) 对每个 csv 调检测函数；5) 返回结果。',
    modules: ['numpy/pandas（纯本地计算，无网络）'],
    special: [
      { k: '8 种形态', v: 'peaks_valleys / candlestick（十字星/锤子线/吞没）/ support_resistance / trend_slope / head_and_shoulders / double_top_bottom / triangle / broadening' },
      { k: '峰谷检测', v: '2*window+1 滑窗，中心点是窗内 max→peak、min→valley' },
      { k: '输入依赖', v: '必须先跑 backtest 生成 ohlcv_*.csv' },
    ],
  },
  alpha_bench: {
    name: 'alpha_bench',
    execLogic: '1) 校验 universe/period；2) get_default_registry() 取因子库；3) _select_alpha_ids 选单个/整组；4) _load_universe_panel 加载宽表面（带缓存）；5) 循环 compute IC 统计；6) 按 IR 降序取 top；7) _render_html 写报告。',
    modules: [
      'src.factors.registry.get_default_registry',
      'src.factors.factor_analysis_core.compute_ic_series',
      'backtest.loaders.registry.resolve_loader',
    ],
    special: [
      { k: 'universe 加载', v: 'csi300→Tushare index_weight（需 token），sp500→Wikipedia 表+yfinance，btc-usdt→OKX。各有 fallback 蓝筹清单' },
      { k: '缓存完整性', v: 'pickle + .sha256 sidecar，hmac.compare_digest 常量时间比对，mismatch 拒绝' },
      { k: '幸存者偏差警告', v: 'sp500 用 Wikipedia 当前成分（非时点快照），panel 塞 survivorship_bias=True 警告' },
      { k: '失败隔离', v: '单 alpha 抛异常只记入 failures 列表不中断整体' },
    ],
  },
  alpha_zoo: {
    name: 'alpha_zoo',
    execLogic: '1) 校验 action ∈ {list_alphas, get_alpha, health}；2) Registry() 懒加载；3) 分发：list→按 zoo/theme/universe 过滤截断，get_alpha→取 meta 字段，health→registry.health()。',
    modules: ['src.factors.registry.Registry（懒 import）'],
    special: [
      { k: '单工具多 action', v: '用 action 鉴别器而非三个独立工具，保持 LLM 工具目录紧凑' },
      { k: '源码不暴露', v: '只返回 metadata（formula_latex/columns_required/universe 等），不返回 compute 源码（payload 太大）' },
      { k: '截断标记', v: 'list_alphas 返回 {total, returned, truncated} 明确告知是否截断' },
    ],
  },
  trading_place_order: {
    name: 'trading_place_order',
    execLogic: '1) profile_by_id 取 profile；2) transport 必须 broker_sdk；3) readonly 则拒；4) paper→直接 module.place_order；5) live→走 mandate gate（execute_live_order）。',
    modules: [
      'src.trading.service.place_order',
      'src.live.enforcement.OrderIntent',
      'src.live.sdk_order_gate.execute_live_order',
    ],
    special: [
      { k: '重复禁止', v: 'repeatable=False — 注释明确 "an order must never be silently re-issued"' },
      { k: '资产类别推断', v: '_order_classification 按符号后缀推断（.HK→HK_EQUITY, .US→US_EQUITY, .SH→CN_EQUITY），未知→只 DENY 不放宽' },
      { k: 'live mandate gate', v: 'live 走 9 道检查关：mandate + kill switch + fail-closed pre-trade + audit ledger' },
      { k: 'transport 限制', v: '只支持 broker_sdk 直连；Robinhood 走 MCP gate，IBKR 保持只读' },
    ],
  },
  trading_check: {
    name: 'trading_check',
    execLogic: '调 check_connection(profile) → 按 transport 分发：local_tws→check_local_status，broker_sdk→module.check_status，remote_mcp→_remote_status。',
    modules: ['src.trading.service.check_connection', 'src.trading.profiles'],
    special: [
      { k: '纯连通性探测', v: 'description 强调 "never places orders"' },
      { k: '三种 transport', v: 'local_tws（IBKR 本地）/ broker_sdk（券商直连）/ remote_mcp（远程）各有检查逻辑' },
    ],
  },
  remember: {
    name: 'remember',
    execLogic: 'action=save→PersistentMemory.add(title, content, type) 写盘；action=recall→find_relevant(query) 关键词打分返回（body 截 2000 字）；action=forget→remove(title)。',
    modules: ['src.memory.persistent.PersistentMemory.add/find_relevant/remove'],
    special: [
      { k: '三种操作合一', v: '单工具用 action 鉴别 save/recall/forget' },
      { k: '类型分类', v: 'memory_type: user/feedback/project/reference，默认 project' },
      { k: 'recall 截断', v: '单条 body 取前 2000 字防溢出' },
    ],
  },
  session_search: {
    name: 'session_search',
    execLogic: '1) max_results=min(int,10) 强制上限；2) get_shared_index().search(query) 懒加载 FTS5 索引；3) 无匹配→ok+提示消息；4) 有匹配→ok+results。',
    modules: ['src.session.search.get_shared_index（单例 SQLite FTS5 索引）'],
    special: [
      { k: 'FTS5 全文检索', v: '底层 SQLite FTS5 跨会话关键词检索（非简单 LIKE），BM25 相关性排序，snippet 高亮' },
      { k: '懒加载', v: 'import 在 execute 内部，避免工具 import 时就初始化索引' },
      { k: '空结果友好', v: '无匹配也返回 status:ok + 提示消息，区分于真错误' },
    ],
  },
  compact: {
    name: 'compact',
    execLogic: '极简：直接返回 {status:ok, message:"Compression triggered"}。真正的压缩逻辑由 AgentLoop 拦截该 tool_call 后执行（工具本身只是触发信号）。',
    modules: [],
    special: [
      { k: '信号工具', v: 'execute 体几乎空壳，压缩动作由 loop.py _process_tool_calls 拦截后调用 _auto_compact(focus_topic=...)' },
      { k: 'focus_topic', v: '模型可选传入主题，让压缩把 60-70% 预算花在该主题上' },
    ],
  },
  load_skill: {
    name: 'load_skill',
    execLogic: '1) 取 name；2) SkillsLoader.get_content(name) 取技能全文；3) 失败返回 "Error:..." 字符串（不抛异常）；4) 返回 {status, content}。',
    modules: ['src.agent.skills.SkillsLoader.get_content'],
    special: [
      { k: '错误约定', v: '失败返回 "Error: ..." 字符串前缀协议而非抛异常' },
      { k: 'XML 包裹', v: '内容包在 <skill name="...">...</skill> 里返回给模型' },
      { k: 'Progressive Disclosure', v: 'system prompt 只注入一行摘要，此工具按需拉取全文——省 token 的关键设计' },
    ],
  },
};
