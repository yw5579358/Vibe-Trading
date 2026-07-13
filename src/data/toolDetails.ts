/* 工具详情数据：全部 72 个工具的执行逻辑、底层模块、特殊设计。
 * 来源：派 explore agent 从原项目源码逐个 Read execute 方法确认。
 */
export type ToolDetail = {
  name: string;
  execLogic: string;
  modules: string[];
  special: { k: string; v: string }[];
};

export const TOOL_DETAILS: Record<string, ToolDetail> = {
  "add_goal_evidence": {
    "name": "add_goal_evidence",
    "execLogic": "解析 criterion → _trace_fields_from_runtime 推导 run_id/artifact_path/hash → GoalStore.append_evidence → 发 goal.evidence。",
    "modules": [
      "src.goal.GoalStore",
      "src.tools.path_utils.safe_run_dir"
    ],
    "special": [
      {
        "k": "auto artifact hash",
        "v": "artifact 文件自动 sha256 哈希"
      },
      {
        "k": "run_dir 相对路径安全",
        "v": "相对 artifact 针对运行目录解析，逃逸则拒绝"
      },
      {
        "k": "index 或 id",
        "v": "接受 criterion_id 或 1 基 criterion_index"
      }
    ]
  },
  "alpha_bench": {
    "name": "alpha_bench",
    "execLogic": "校验 universe/period → get_default_registry() → 加载 universe panel（带缓存）→ 循环 compute IC 统计 → 按 IR 排序 → HTML 报告。",
    "modules": [
      "src.factors.registry.get_default_registry",
      "src.factors.factor_analysis_core.compute_ic_series"
    ],
    "special": [
      {
        "k": "universe 加载",
        "v": "csi300→Tushare, sp500→Wikipedia+yfinance, btc→OKX，各有 fallback"
      },
      {
        "k": "缓存完整性",
        "v": "pickle + .sha256 sidecar，hmac.compare_digest 常量时间比对"
      },
      {
        "k": "失败隔离",
        "v": "单 alpha 抛异常只记入 failures 不中断"
      }
    ]
  },
  "alpha_compare": {
    "name": "alpha_compare",
    "execLogic": "规整 alpha_ids（list 或逗号分隔）→ compare_alphas 在 universe+period 上 bench → 按 sort(默认 ir)排名 → 返回 winner+排名表。",
    "modules": [
      "src.factors.compare_runner.compare_alphas"
    ],
    "special": [
      {
        "k": "id 输入容错",
        "v": "同时接受 list 和 'a,b c' 字符串"
      },
      {
        "k": "显式只读",
        "v": "is_readonly=True（不写文件不下单）"
      }
    ]
  },
  "alpha_zoo": {
    "name": "alpha_zoo",
    "execLogic": "校验 action → Registry() 懒加载 → 分发：list→按条件过滤截断，get_alpha→取 meta，health→registry.health()。",
    "modules": [
      "src.factors.registry.Registry（懒 import）"
    ],
    "special": [
      {
        "k": "单工具多 action",
        "v": "用 action 鉴别器而非三个独立工具"
      },
      {
        "k": "源码不暴露",
        "v": "只返回 metadata，不返回 compute 源码"
      },
      {
        "k": "截断标记",
        "v": "返回 {total, returned, truncated} 明确告知"
      }
    ]
  },
  "analyze_trade_journal": {
    "name": "analyze_trade_journal",
    "execLogic": "验证路径+扩展名 → parse_file 解析 → 转 DataFrame → 可选 filter → 返回 profile（FIFO 往返+胜率）和/或 behavior（4 种偏差检测）。",
    "modules": [
      "src.tools.trade_journal_parsers.parse_file",
      "pandas"
    ],
    "special": [
      {
        "k": "FIFO 往返配对",
        "v": "双端队列比例分配费用匹配买卖"
      },
      {
        "k": "4 种偏差检测",
        "v": "处置效应/过度交易/追逐动量/锚定（各带 severity）"
      },
      {
        "k": "filter 微语法",
        "v": "支持 'YYYY-MM to YYYY-MM'/'symbol=X'/'market=china_a'"
      }
    ]
  },
  "background_run": {
    "name": "background_run",
    "execLogic": "BackgroundManager.run() 生成 8 字符 task_id，启动 daemon 后台线程执行 shell 命令（超时 300s，截断 50000），立即返回 task_id。",
    "modules": [
      "BackgroundManager (threading + subprocess)"
    ],
    "special": [
      {
        "k": "通知队列",
        "v": "_notifications + Lock，drain_notifications 一次性消费"
      },
      {
        "k": "状态枚举",
        "v": "running/completed/timeout/error"
      }
    ]
  },
  "backtest": {
    "name": "backtest",
    "execLogic": "safe_run_dir 路径校验 → 校验 config.json → 检查 signal_engine.py → Runner(timeout=300) 启动子进程 → 收集 artifacts。",
    "modules": [
      "src.core.runner.Runner",
      "backtest.runner（含 AST 扫描）"
    ],
    "special": [
      {
        "k": "子进程隔离",
        "v": "环境变量白名单剥离 LLM/API/broker 凭证"
      },
      {
        "k": "AST 安全扫描",
        "v": "import 时拒绝执行性语句/装饰器/非字面默认值/循环自导入"
      },
      {
        "k": "契约校验",
        "v": "inspect 校验 SignalEngine() 无参 + generate() 可调用"
      },
      {
        "k": "硬超时",
        "v": "5 分钟 subprocess.run timeout=300"
      }
    ]
  },
  "bash": {
    "name": "bash",
    "execLogic": "subprocess.run(shell=True) 执行命令，cwd=run_dir，timeout=120s；截断 stdout/stderr 至 50000，按 returncode 返回。",
    "modules": [
      "subprocess"
    ],
    "special": [
      {
        "k": "超时捕获",
        "v": "TimeoutExpired 单独捕获返回 error，不抛异常"
      },
      {
        "k": "输出截断",
        "v": "50000 字符上限"
      }
    ]
  },
  "check_background": {
    "name": "check_background",
    "execLogic": "调 BackgroundManager.check(task_id)：传 task_id 返回该任务状态+结果；不传返回所有任务列表。",
    "modules": [
      "BackgroundManager"
    ],
    "special": [
      {
        "k": "可重复",
        "v": "True，可反复查询"
      }
    ]
  },
  "compact": {
    "name": "compact",
    "execLogic": "极简：返回 {status:ok}。真正的压缩由 AgentLoop 拦截 tool_call 后执行——工具本身只是触发信号。",
    "modules": [],
    "special": [
      {
        "k": "信号工具",
        "v": "execute 空壳，压缩动作由 loop.py 拦截后调 _auto_compact"
      },
      {
        "k": "focus_topic",
        "v": "模型可选传入主题，让压缩把 60-70% 预算花在该主题"
      }
    ]
  },
  "create_hypothesis": {
    "name": "create_hypothesis",
    "execLogic": "调 HypothesisRegistry().create(title, thesis, status='exploring', ...) → 返回 to_dict()。",
    "modules": [
      "src.hypotheses.HypothesisRegistry"
    ],
    "special": [
      {
        "k": "持久化注册表",
        "v": "本地注册表，跨会话存在"
      },
      {
        "k": "研究专用",
        "v": "不下单不调 live trading API"
      }
    ]
  },
  "delete_skill": {
    "name": "delete_skill",
    "execLogic": "解析 slug → 验证用户技能目录存在 → shutil.rmtree 删除整个技能目录树。",
    "modules": [
      "src.agent.skills.USER_SKILLS_DIR",
      "shutil"
    ],
    "special": [
      {
        "k": "user_only",
        "v": "仅在 USER_SKILLS_DIR 操作，不能删捆绑"
      },
      {
        "k": "递归删除",
        "v": "rmtree 删除 SKILL.md + references/templates/examples/assets 全部"
      }
    ]
  },
  "edit_file": {
    "name": "edit_file",
    "execLogic": "resolve_safe_path 路径校验 → 读文件 → 首次出现的 old_text 替换为 new_text（count=1）→ 写回。",
    "modules": [
      "path_utils.resolve_safe_path / allowed_write_roots"
    ],
    "special": [
      {
        "k": "首次匹配替换",
        "v": "str.replace(old, new, 1) 仅替换第一处避免误改"
      },
      {
        "k": "路径安全",
        "v": "在 allowed_write_roots 白名单内解析"
      }
    ]
  },
  "extract_shadow_strategy": {
    "name": "extract_shadow_strategy",
    "execLogic": "验证 journal_path → extract_shadow_profile 从盈利往返交易挖掘 if-then 规则 → save_profile 持久化 → 返回 shadow_id+规则预览。",
    "modules": [
      "src.shadow_account.extract_shadow_profile/save_profile"
    ],
    "special": [
      {
        "k": "min_support=3",
        "v": "规则必须≥3 次盈利往返支持"
      },
      {
        "k": "max_rules=5",
        "v": "上限 5 条规则保持可解释性"
      }
    ]
  },
  "factor_analysis": {
    "name": "factor_analysis",
    "execLogic": "读 factor_csv/return_csv → compute_ic_series 算 IC 序列 → compute_group_equity 做分层回测 → 输出到 output_dir。",
    "modules": [
      "pandas",
      "src.factors.factor_analysis_core.compute_ic_series/compute_group_equity"
    ],
    "special": [
      {
        "k": "IC 失败阈值",
        "v": "每日需≥5 个共有资产才算 IC"
      },
      {
        "k": "自动建输出目录",
        "v": "mkdir(parents=True)"
      }
    ]
  },
  "generate_backtest_config": {
    "name": "generate_backtest_config",
    "execLogic": "读假设 → universe 解析为 ticker 代码 → 校验 data_sources → 写 config.json 到 autopilot_<hash>/ 目录。",
    "modules": [
      "src.hypotheses.HypothesisRegistry",
      "backtest.loaders.registry.VALID_SOURCES"
    ],
    "special": [
      {
        "k": "universe_alias_map",
        "v": "'csi 300'→['000300.SH'] 等友好名转换"
      },
      {
        "k": "hashed_run_dir",
        "v": "sha256(id)[:12] 确定性目录，重复运行会覆盖"
      }
    ]
  },
  "get_block_trades": {
    "name": "get_block_trades",
    "execLogic": "解析 A 股 symbol → 东财 datacenter RPT_DATA_BLOCKTRADE → 规范化为 trade_date/deal_price/buyer_seat 等。",
    "modules": [
      "backtest.loaders.eastmoney_client.get_json"
    ],
    "special": [
      {
        "k": "限 A 股",
        "v": "通过 resolve_secid 返回的 market 必须 in (0,1)"
      },
      {
        "k": "硬上限",
        "v": "_MAX_RECORDS=200, _MAX_DAYS=365"
      }
    ]
  },
  "get_dragon_tiger": {
    "name": "get_dragon_tiger",
    "execLogic": "规范日期 → 剥离代码后缀 → 调东财 datacenter API 拼装上榜清单+营业部席位明细。",
    "modules": [
      "backtest.loaders.eastmoney_client.get_json"
    ],
    "special": [
      {
        "k": "数据源",
        "v": "东财 datacenter-web API，两个 reportName：上榜清单 + 营业部席位"
      },
      {
        "k": "结果上限",
        "v": "_MAX_APPEARANCES=200, _MAX_SEATS=30 防无界 payload"
      },
      {
        "k": "字段投影",
        "v": "只取关键字段（代码/收盘价/涨跌幅/净额/原因 + 营业部名/方向/净额/排名）"
      }
    ]
  },
  "get_financial_statements": {
    "name": "get_financial_statements",
    "execLogic": "按后缀分 a_share/us/hk → US 走 SEC EDGAR XBRL，A/HK 走东财 F10 → 返回三大报表或关键指标。",
    "modules": [
      "backtest.loaders.eastmoney_client",
      "backtest.loaders.sec_edgar_client"
    ],
    "special": [
      {
        "k": "三市场路由",
        "v": "A 股→东财 RPT_F10_FINANCE_*，港股→东财 RPT_HKF12_*，美股→SEC EDGAR XBRL"
      },
      {
        "k": "年报过滤",
        "v": "annual 时客户端过滤 REPORT_DATE 以 -12-31 结尾"
      },
      {
        "k": "上下文防护",
        "v": "_MAX_PERIODS=40, _MAX_FIELDS_PER_PERIOD=200 防撑爆 LLM"
      }
    ]
  },
  "get_fund_flow": {
    "name": "get_fund_flow",
    "execLogic": "对每个 symbol 调东财 fflow endpoint，解析主力/超大/大/中/小单净额（CNY），批量处理单 symbol 失败不影响其他。",
    "modules": [
      "backtest.loaders.eastmoney_client.get_json"
    ],
    "special": [
      {
        "k": "5 桶净流入",
        "v": "main/small/medium/large/super_large"
      },
      {
        "k": "多市场",
        "v": "A 股/HK/US 均支持"
      }
    ]
  },
  "get_lockup_expiry": {
    "name": "get_lockup_expiry",
    "execLogic": "传 code 查全历史解禁（倒序）；不传按 [today, today+horizon] 窗口查全市场解禁日历（正序）。",
    "modules": [
      "backtest.loaders.eastmoney_client.get_json"
    ],
    "special": [
      {
        "k": "双模式",
        "v": "single_code 全历史 / market_calendar 未来窗口"
      },
      {
        "k": "horizon_days",
        "v": "默认 90，clamp [1,365]"
      }
    ]
  },
  "get_macro_series": {
    "name": "get_macro_series",
    "execLogic": "读 FRED_API_KEY → series_id 大写 → FRED observations 端点（经节流）→ '.' 缺失值转 None → 保留最近 limit 条。",
    "modules": [
      "backtest.loaders._http.throttled_get_json"
    ],
    "special": [
      {
        "k": "check_available",
        "v": "类方法检测 FRED_API_KEY 不存在则从注册表排除"
      },
      {
        "k": "缺失值处理",
        "v": "FRED 用 '.' 标缺失转 None"
      }
    ]
  },
  "get_margin_trading": {
    "name": "get_margin_trading",
    "execLogic": "归约 6 位 A 股裸码 → 东财 RPTA_WEB_RZRQ_GGMX → 映射 financing_balance/short_balance 等。",
    "modules": [
      "backtest.loaders.eastmoney_client.get_json"
    ],
    "special": [
      {
        "k": "限 A 股 SH/SZ",
        "v": "HK/US 拒绝"
      },
      {
        "k": "硬上限",
        "v": "_MAX_DAYS=250"
      }
    ]
  },
  "get_market_data": {
    "name": "get_market_data",
    "execLogic": "智能路由 + Fallback Chain 取标准化 OHLCV 行情。source=auto 时按符号后缀正则路由，单个 loader 失败自动降级。",
    "modules": [
      "src.market_data.fetch_market_data_json",
      "backtest.loaders.registry.get_loader_cls_with_fallback"
    ],
    "special": [
      {
        "k": "智能路由",
        "v": "auto 模式按符号后缀(.US/.HK/.SH/BTC-)正则分组路由"
      },
      {
        "k": "Fallback Chain",
        "v": "指定 loader 不可用时按 FALLBACK_CHAINS 自动降级：A 股 7 级链，美股 11 级链"
      },
      {
        "k": "失败隔离",
        "v": "单个 loader 抛异常被吞掉，该 code 进 _unresolved，不影响其他"
      },
      {
        "k": "截断策略",
        "v": "max_rows 截断用 even-stride 抽样并固定最后一根 bar"
      }
    ]
  },
  "get_northbound_flow": {
    "name": "get_northbound_flow",
    "execLogic": "并发调东财 realtime + history 端点 → 解析 hk2sh/hk2sz 的 netBuyAmt 求和 → 返回市场级北向总额。",
    "modules": [
      "backtest.loaders.eastmoney_client.get_json"
    ],
    "special": [
      {
        "k": "双端点",
        "v": "realtime 取实时净流入，history 取日 K 线历史"
      },
      {
        "k": "数值容错",
        "v": "Eastmoney 的 '-'/' '/None 转为 None"
      },
      {
        "k": "市场级聚合",
        "v": "返回全市场北向总额，分沪股通/深股通"
      }
    ]
  },
  "get_options_chain": {
    "name": "get_options_chain",
    "execLogic": "校验 ticker → yahoo_client.get_options → 按 _CONTRACT_FIELDS 映射为 snake_case，每边最多 60 条。",
    "modules": [
      "backtest.loaders.yahoo_client.get_options"
    ],
    "special": [
      {
        "k": "expiration 可选",
        "v": "Unix epoch，省略取最近到期"
      },
      {
        "k": "每边 60 条",
        "v": "_MAX_CONTRACTS_PER_SIDE=60 防 context 爆"
      }
    ]
  },
  "get_research_goal": {
    "name": "get_research_goal",
    "execLogic": "调 GoalStore.get_current_snapshot(session_id) → 原样返回快照或 not_found error。",
    "modules": [
      "src.goal.GoalStore"
    ],
    "special": [
      {
        "k": "纯透传",
        "v": "无转换无副作用"
      },
      {
        "k": "not_found envelope",
        "v": "返回结构化 error_type='not_found' 区分'没目标'和'错误'"
      }
    ]
  },
  "get_research_reports": {
    "name": "get_research_reports",
    "execLogic": "东财 reportapi 取卖方研报 + best-effort 调同花顺 consensus EPS（THS 失败降级为空不阻断）。",
    "modules": [
      "backtest.loaders.eastmoney_client.get_json",
      "backtest.loaders._http.throttled_get"
    ],
    "special": [
      {
        "k": "双源拼接",
        "v": "东财研报 + 同花顺一致预期 EPS"
      },
      {
        "k": "best-effort",
        "v": "THS 异常被捕获降级，不中断研报主流程"
      }
    ]
  },
  "get_sec_filings": {
    "name": "get_sec_filings",
    "execLogic": "ticker→CIK→submissions 取 filing 列表（按 form 过滤截断）；可选 metric→companyfacts 取 XBRL 时间序列。",
    "modules": [
      "backtest.loaders.sec_edgar_client.cik_for/get_submissions/get_company_facts"
    ],
    "special": [
      {
        "k": "二合一",
        "v": "filing 列表 + 可选 XBRL metric 时间序列"
      },
      {
        "k": "URL 构造",
        "v": "去零 CIK + 去横线 accession 拼 sec.gov URL"
      }
    ]
  },
  "get_sector_info": {
    "name": "get_sector_info",
    "execLogic": "双模式：membership（按 code 查所属板块）/ ranking（全市场板块按涨跌幅排序）。",
    "modules": [
      "backtest.loaders.eastmoney_client.get_json"
    ],
    "special": [
      {
        "k": "双模式",
        "v": "membership 需 code / ranking 按 limit（默认 30 上限 100）"
      },
      {
        "k": "diff 兼容",
        "v": "push2 有时返回 dict 自动 list(values())"
      }
    ]
  },
  "get_shareholder_count": {
    "name": "get_shareholder_count",
    "execLogic": "校验 A 股后缀 → 东财 RPT_HOLDERNUMLATEST → 规范化 end_date/holder_count/环比变化/户均持股。",
    "modules": [
      "backtest.loaders.eastmoney_client.get_json"
    ],
    "special": [
      {
        "k": "限 A 股",
        "v": "_A_SHARE_SUFFIXES=(SH,SZ,BJ)"
      },
      {
        "k": "最多 24 期",
        "v": "_MAX_PERIODS=24"
      }
    ]
  },
  "get_stock_news": {
    "name": "get_stock_news",
    "execLogic": "scope=global 查东财财经；scope=stock 按 SH/SZ/BJ 走东财，US/HK 走 Yahoo search（返回 matches 不是文章）。",
    "modules": [
      "backtest.loaders.eastmoney_client.get_json",
      "backtest.loaders.yahoo_client.search"
    ],
    "special": [
      {
        "k": "JSONP 解码",
        "v": "兼容 dict/str(含 callback 包裹)"
      },
      {
        "k": "诚实标注",
        "v": "US/HK 返回 matches 而非冒充 articles"
      }
    ]
  },
  "get_stock_profile": {
    "name": "get_stock_profile",
    "execLogic": "调 Yahoo quoteSummary 一次性取回 → 按 sections 参数投影为紧凑行（_raw 解包 {raw,fmt}）。",
    "modules": [
      "backtest.loaders.yahoo_client.get_quote_summary"
    ],
    "special": [
      {
        "k": "6 sections",
        "v": "key_stats/financials/earnings_trend/institution_ownership/insider_holders/recommendation_trend"
      },
      {
        "k": "_raw 解包",
        "v": "Yahoo 数字以 {raw,fmt} 包裹，统一取 raw"
      }
    ]
  },
  "iwencai_search": {
    "name": "iwencai_search",
    "execLogic": "读 VIBE_TRADING_IWENCAI_KEY → 问财 get-robot-data 端点 → 深度解析嵌套结构 → 每行按列名透传（最多 40 列）。",
    "modules": [
      "backtest.loaders._http.throttled_get_json"
    ],
    "special": [
      {
        "k": "深度嵌套防御解析",
        "v": "多层 if isinstance 防御"
      },
      {
        "k": "check_available",
        "v": "检测 IWENCAI_KEY 不存在则排除"
      }
    ]
  },
  "link_autopilot_backtest": {
    "name": "link_autopilot_backtest",
    "execLogic": "safe_run_dir 定位 run_card.json → 解析提取 metrics → HypothesisRegistry.link_backtest 链接到假设。",
    "modules": [
      "src.hypotheses.HypothesisRegistry",
      "src.tools.path_utils.safe_run_dir"
    ],
    "special": [
      {
        "k": "自动读 metrics",
        "v": "自动从 run_card.json 提取指标，免手动"
      },
      {
        "k": "missing 容忍",
        "v": "run_card 无 metrics 时仍链接+warning"
      }
    ]
  },
  "link_backtest": {
    "name": "link_backtest",
    "execLogic": "调 HypothesisRegistry().link_backtest(id, run_card_path/run_dir, metrics, notes) → 附加回测工件。",
    "modules": [
      "src.hypotheses.HypothesisRegistry"
    ],
    "special": [
      {
        "k": "灵活引用",
        "v": "接受 run_card_path（直接 json）或 backtest_run_dir"
      },
      {
        "k": "metrics 可选旁路",
        "v": "可手动传 metrics 或让 link_autopilot 自动提取"
      }
    ]
  },
  "load_skill": {
    "name": "load_skill",
    "execLogic": "取 name → SkillsLoader.get_content(name) 取全文 → 失败返回 'Error:...' 前缀 → 返回 {status, content}。",
    "modules": [
      "src.agent.skills.SkillsLoader.get_content"
    ],
    "special": [
      {
        "k": "Progressive Disclosure",
        "v": "system prompt 只注入一行摘要，此工具按需拉取全文"
      },
      {
        "k": "XML 包裹",
        "v": "内容包在 <skill name='...'> 里返回"
      },
      {
        "k": "错误前缀协议",
        "v": "失败返回 'Error:...' 字符串而非抛异常"
      }
    ]
  },
  "options_pricing": {
    "name": "options_pricing",
    "execLogic": "校验输入 → Black-Scholes 公式算 price/delta/gamma/theta/vega（theta 转日 vega 转 1%）；T=0 标 degenerate。",
    "modules": [
      "numpy",
      "scipy.stats.norm"
    ],
    "special": [
      {
        "k": "T=0 退化",
        "v": "返回内在价值，delta 取 0/1/-1"
      },
      {
        "k": "纯计算",
        "v": "无网络调用，全部本地"
      }
    ]
  },
  "patch_skill": {
    "name": "patch_skill",
    "execLogic": "用户目录优先找 → 捆绑的先 copy 到用户目录 → 读内容 → 验证 find 存在 → 替换第一次出现 → 写回。",
    "modules": [
      "src.agent.skills.USER_SKILLS_DIR"
    ],
    "special": [
      {
        "k": "copy_on_patch_bundled",
        "v": "打补丁捆绑技能先复制到用户目录保持原始不变"
      },
      {
        "k": "single_replace",
        "v": "replace(find, replace, 1) 仅第一次出现"
      },
      {
        "k": "find 必须存在",
        "v": "不存在硬失败不给静默无操作"
      }
    ]
  },
  "pattern": {
    "name": "pattern",
    "execLogic": "safe_run_dir → glob ohlcv_*.csv → 按 patterns 参数选检测函数 → 对每个 csv 调检测 → 返回结果。",
    "modules": [
      "numpy/pandas（纯本地计算）"
    ],
    "special": [
      {
        "k": "8 种形态",
        "v": "peaks_valleys/candlestick/support_resistance/trend_slope/head_and_shoulders/double_top_bottom/triangle/broadening"
      },
      {
        "k": "输入依赖",
        "v": "必须先跑 backtest 生成 ohlcv_*.csv"
      },
      {
        "k": "峰谷检测",
        "v": "2*window+1 滑窗，中心点是窗内 max→peak、min→valley"
      }
    ]
  },
  "propose_mandate_profiles": {
    "name": "propose_mandate_profiles",
    "execLogic": "验证 broker+ceilings → 合成 2-4 个编号 profile（稳健/均衡/激进）→ save_proposal 持久化（仅提案不授权）。",
    "modules": [
      "src.live.mandate.commit.save_proposal"
    ],
    "special": [
      {
        "k": "propose_not_commit",
        "v": "is_readonly=True，仅写提案零交易权限"
      },
      {
        "k": "clamp_down_only",
        "v": "profile 只能向下限制不能突破 ceiling"
      },
      {
        "k": "breach_reauth_bias",
        "v": "可选 reauth_for 偏向违规水平仍限在 ceiling 下"
      }
    ]
  },
  "read_document": {
    "name": "read_document",
    "execLogic": "按扩展名分发：PDF(pypdfium2+OCR fallback)/DOCX/XLSX/PPTX/图片(OCR)/文本；统一 15000 字符上限。",
    "modules": [
      "pypdfium2",
      "python-docx",
      "pandas",
      "python-pptx",
      "rapidocr_onnxruntime"
    ],
    "special": [
      {
        "k": "PDF OCR fallback",
        "v": "每页文字<50 字符触发 300dpi 渲染+OCR"
      },
      {
        "k": "15000 字符上限",
        "v": "超出截断并标 truncated=true"
      },
      {
        "k": "多格式支持",
        "v": "PDF/Word/Excel/PPT/图片全支持"
      }
    ]
  },
  "read_file": {
    "name": "read_file",
    "execLogic": "在多个 allowed_roots（run_dir/skills/VIBE_TRADING_ALLOWED_FILE_ROOTS）中查找文件 → 读全文 → 按 limit 截断。",
    "modules": [
      "path_utils.safe_path / allowed_file_roots"
    ],
    "special": [
      {
        "k": "多 root 容错",
        "v": "遍历所有 allowed_roots 找第一个存在的文件"
      },
      {
        "k": "skills/ 前缀剥离",
        "v": "LLM 误加 skills/ 前缀时自动重试"
      }
    ]
  },
  "read_url": {
    "name": "read_url",
    "execLogic": "校验 URL（拒绝 localhost/私网/非 http(s)）→ Jina Reader(r.jina.ai) 抓取转 Markdown → 截断 8000 字符。",
    "modules": [
      "requests",
      "Jina Reader API"
    ],
    "special": [
      {
        "k": "SSRF 防护",
        "v": "_url_allowed 拒绝私网/loopback/本地/.local"
      },
      {
        "k": "no_cache 选项",
        "v": "header x-no-cache: true 强制新鲜抓取"
      }
    ]
  },
  "remember": {
    "name": "remember",
    "execLogic": "save→PersistentMemory.add 写盘；recall→find_relevant 关键词打分（body 截 2000 字）；forget→remove。",
    "modules": [
      "src.memory.persistent.PersistentMemory"
    ],
    "special": [
      {
        "k": "三种操作合一",
        "v": "单工具用 action 鉴别 save/recall/forget"
      },
      {
        "k": "类型分类",
        "v": "user/feedback/project/reference，默认 project"
      },
      {
        "k": "recall 截断",
        "v": "单条 body 取前 2000 字防溢出"
      }
    ]
  },
  "render_shadow_report": {
    "name": "render_shadow_report",
    "execLogic": "load_profile → load_cached_result（缓存优先）→ 可选 scan_today_signals → render_shadow_report 生成 HTML+PDF。",
    "modules": [
      "src.shadow_account.render_shadow_report",
      "src.shadow_account.backtester.load_cached_result"
    ],
    "special": [
      {
        "k": "cache_first",
        "v": "有缓存不重跑回测"
      },
      {
        "k": "优雅降级",
        "v": "重新运行失败用零值合成 stub 仍渲染"
      }
    ]
  },
  "run_research_autopilot": {
    "name": "run_research_autopilot",
    "execLogic": "通过 ID 读假设 → 构建客观模板 → GoalStore.replace_goal 替换当前会话研究目标 → 返回目标快照+假设摘要+next_step。",
    "modules": [
      "src.hypotheses.HypothesisRegistry",
      "src.goal.GoalStore"
    ],
    "special": [
      {
        "k": "replace_not_create",
        "v": "replace_goal 会销毁会话的先前目标"
      },
      {
        "k": "hardcoded_criteria",
        "v": "标准固定为 4 步回测工作流"
      }
    ]
  },
  "run_shadow_backtest": {
    "name": "run_shadow_backtest",
    "execLogic": "load_profile → 默认 [today-1y, today] 全四市场 → run_shadow_backtest → 返回每市场结果+组合+delta_pnl+归因。",
    "modules": [
      "src.shadow_account.run_shadow_backtest/load_profile"
    ],
    "special": [
      {
        "k": "多市场默认",
        "v": "默认跑 china_a/hk/us/crypto 四市场"
      },
      {
        "k": "归因分解",
        "v": "missed_signals/noise/early_exit/late_exit/overtrading"
      }
    ]
  },
  "run_swarm": {
    "name": "run_swarm",
    "execLogic": "解析预设（显式名或关键词评分）→ 构建 variables → SwarmRuntime.start_run → 每 5s 轮询直到完成或 1800s 超时。",
    "modules": [
      "src.swarm.runtime.SwarmRuntime",
      "src.swarm.store.SwarmStore"
    ],
    "special": [
      {
        "k": "关键词评分路由",
        "v": "26 个预设中英文关键词+权重，平局默认 equity_research_team"
      },
      {
        "k": "continuation_guard",
        "v": "检测'continue/继续'拒绝自动路由"
      },
      {
        "k": "超时不取消",
        "v": "超时后台继续跑，Agent 可用 run_id 重查"
      },
      {
        "k": "config 从磁盘读",
        "v": "LLM 无法注入配置路径（R-06）"
      }
    ]
  },
  "save_skill": {
    "name": "save_skill",
    "execLogic": "清理名称→slug → mkdir 技能目录 → 自动补 frontmatter（如缺）→ 写 SKILL.md。",
    "modules": [
      "src.agent.skills.USER_SKILLS_DIR"
    ],
    "special": [
      {
        "k": "auto_frontmatter",
        "v": "缺 --- 自动注入 name/description/category"
      },
      {
        "k": "slug 清理",
        "v": "小写+非字母数字替换-+截 60 字符防目录遍历"
      },
      {
        "k": "幂等覆盖",
        "v": "mkdir(exist_ok=True)+覆盖"
      }
    ]
  },
  "scaffold_signal_engine": {
    "name": "scaffold_signal_engine",
    "execLogic": "取假设 → _SIGNAL_ENGINE_TEMPLATE.format() 填入假设信息 → write_text 写入 code/signal_engine.py。",
    "modules": [
      "src.hypotheses.HypothesisRegistry"
    ],
    "special": [
      {
        "k": "契约正确",
        "v": "生成的存根满足引擎契约：无参 __init__ + generate→dict，默认全 0 可 smoke 测试"
      },
      {
        "k": "docstring 内嵌",
        "v": "假设的 signal_definition 嵌进 docstring"
      },
      {
        "k": "防覆盖",
        "v": "默认 overwrite=false，已存在即报错"
      }
    ]
  },
  "scan_shadow_signals": {
    "name": "scan_shadow_signals",
    "execLogic": "load_profile → scan_today_signals 列出今天符合入场节奏的标的 → 返回+「仅供研究」免责声明。",
    "modules": [
      "src.shadow_account.scanner.scan_today_signals"
    ],
    "special": [
      {
        "k": "research_disclaimer",
        "v": "硬编码免责声明嵌入每个响应"
      },
      {
        "k": "per_market_cap",
        "v": "每市场默认 3 个防信号泛滥"
      }
    ]
  },
  "screen_market": {
    "name": "screen_market",
    "execLogic": "校验 market+sort_by+top_n → 东财 push2 clist 端点（服务端按 fid 降序排好）→ 规范化每行。",
    "modules": [
      "backtest.loaders.eastmoney_client.get_json"
    ],
    "special": [
      {
        "k": "服务端排序",
        "v": "po=1 降序，按 fid 字段 id 排序"
      },
      {
        "k": "三市场 fs 选择器",
        "v": "A 股含 SH/SZ/创业板/北交所；US 含 NASDAQ/NYSE/AMEX"
      }
    ]
  },
  "search_hypotheses": {
    "name": "search_hypotheses",
    "execLogic": "调 HypothesisRegistry().search(query, status, limit=10) → 返回计数+匹配假设。",
    "modules": [
      "src.hypotheses.HypothesisRegistry"
    ],
    "special": [
      {
        "k": "文本+状态正交过滤",
        "v": "自由文本和状态过滤器可独立或组合"
      },
      {
        "k": "默认 limit=10",
        "v": "保持 payload 可管理"
      }
    ]
  },
  "search_symbol": {
    "name": "search_symbol",
    "execLogic": "并行 fan-out 三源（东财 suggest/Yahoo search/SEC EDGAR）→ 统一规范化 → 按 symbol 去重合并 → 截 limit。",
    "modules": [
      "backtest.loaders.eastmoney_client.get_json",
      "backtest.loaders.yahoo_client.search",
      "backtest.loaders.sec_edgar_client.cik_for"
    ],
    "special": [
      {
        "k": "单源失败不致命",
        "v": "每个源失败记入 sources 状态，其余仍返回"
      },
      {
        "k": "多源去重+provenance",
        "v": "同 symbol 合并，second source 记入 also_from"
      }
    ]
  },
  "session_search": {
    "name": "session_search",
    "execLogic": "max_results=min(int,10) → get_shared_index().search(query) 懒加载 FTS5 → 返回匹配的会话+snippet。",
    "modules": [
      "src.session.search.get_shared_index（单例 SQLite FTS5）"
    ],
    "special": [
      {
        "k": "FTS5 全文检索",
        "v": "SQLite FTS5 跨会话关键词检索，BM25 排序，snippet 高亮"
      },
      {
        "k": "懒加载",
        "v": "import 在 execute 内部"
      },
      {
        "k": "空结果友好",
        "v": "无匹配返回 ok+提示，区分于真错误"
      }
    ]
  },
  "skill_file": {
    "name": "skill_file",
    "execLogic": "验证技能存在 → action 分发：list(rglob 所有文件)/write(校验在白名单子目录+防遍历+写入)/remove(拒删 SKILL.md+unlink)。",
    "modules": [
      "src.agent.skills.USER_SKILLS_DIR"
    ],
    "special": [
      {
        "k": "子目录白名单",
        "v": "_ALLOWED_SUBDIRS={references,templates,examples,assets}"
      },
      {
        "k": "路径遍历防护",
        "v": "resolve().relative_to() 验证不逃逸"
      },
      {
        "k": "保护 SKILL.md",
        "v": "remove 拒绝删 SKILL.md（必须用 delete_skill）"
      }
    ]
  },
  "start_research_goal": {
    "name": "start_research_goal",
    "execLogic": "解析 session_id → 强制 criteria 为列表或默认 → GoalStore.replace_goal 创建/替换目标 → 发 goal.created 事件。",
    "modules": [
      "src.goal.GoalStore"
    ],
    "special": [
      {
        "k": "research_only",
        "v": "risk_tier 限制为研究级，不支持 live trading"
      },
      {
        "k": "triple_budget",
        "v": "可选 token/turn/time 预算限制运行成本"
      }
    ]
  },
  "trading_account": {
    "name": "trading_account",
    "execLogic": "调 get_account(connection, **overrides) 读取账户摘要。",
    "modules": [
      "src.trading.service.get_account"
    ],
    "special": [
      {
        "k": "只读",
        "v": "标记为只读"
      },
      {
        "k": "参数复用",
        "v": "仅 TRADING_COMMON_PARAMETERS"
      }
    ]
  },
  "trading_cancel_order": {
    "name": "trading_cancel_order",
    "execLogic": "调 cancel_order(order_id, connection, symbol?, **overrides) 取消未完成订单。",
    "modules": [
      "src.trading.service.cancel_order"
    ],
    "special": [
      {
        "k": "risk_reducing",
        "v": "取消降低风险，绕过 mandate gate（仍写审计）"
      },
      {
        "k": "not_repeatable",
        "v": "repeatable=False 取消绝不能静默重发"
      },
      {
        "k": "crypto 需 symbol",
        "v": "OKX/Binance 需要 symbol 消歧 order_id"
      }
    ]
  },
  "trading_check": {
    "name": "trading_check",
    "execLogic": "调 check_connection(profile) → 按 transport 分发（local_tws/broker_sdk/remote_mcp）→ 返回连接器就绪状态。",
    "modules": [
      "src.trading.service.check_connection"
    ],
    "special": [
      {
        "k": "纯连通性探测",
        "v": "description 强调 never places orders"
      },
      {
        "k": "三 transport",
        "v": "local_tws（IBKR）/broker_sdk（券商直连）/remote_mcp（远程）"
      }
    ]
  },
  "trading_connections": {
    "name": "trading_connections",
    "execLogic": "调 list_profiles() + load_selected_profile_id() → 返回所有 profile 带 selected 标志。",
    "modules": [
      "src.trading.profiles.list_profiles"
    ],
    "special": [
      {
        "k": "selected_flag",
        "v": "每个 profile 带 selected 布尔值供 UI 高亮"
      }
    ]
  },
  "trading_history": {
    "name": "trading_history",
    "execLogic": "调 get_history(symbol, ...) 同时承载 IBKR 参数(duration/bar_size)和 SDK 参数(period/limit)。",
    "modules": [
      "src.trading.service.get_history"
    ],
    "special": [
      {
        "k": "双 connector 参数",
        "v": "IBKR(local_tws)和 SDK(broker_sdk)参数共存，服务层选择"
      },
      {
        "k": "只读",
        "v": "标记为只读"
      }
    ]
  },
  "trading_orders": {
    "name": "trading_orders",
    "execLogic": "调 get_open_orders(connection, include_executions, **overrides) 读取未完成订单，可选含成交记录。",
    "modules": [
      "src.trading.service.get_open_orders"
    ],
    "special": [
      {
        "k": "include_executions",
        "v": "可选布尔，默认 False"
      },
      {
        "k": "只读",
        "v": "标记为只读"
      }
    ]
  },
  "trading_place_order": {
    "name": "trading_place_order",
    "execLogic": "取 profile → transport 必须 broker_sdk → readonly 则拒 → paper 直接下单 → live 走 mandate gate。",
    "modules": [
      "src.trading.service.place_order",
      "src.live.sdk_order_gate.execute_live_order"
    ],
    "special": [
      {
        "k": "重复禁止",
        "v": "repeatable=False — 订单绝不能被静默重发"
      },
      {
        "k": "资产类别推断",
        "v": "按符号后缀推断（.HK→HK_EQUITY 等），未知只 DENY"
      },
      {
        "k": "live mandate gate",
        "v": "走 9 道检查关：mandate + kill switch + fail-closed + audit"
      }
    ]
  },
  "trading_positions": {
    "name": "trading_positions",
    "execLogic": "调 get_positions(connection, **overrides) 读取当前持仓。",
    "modules": [
      "src.trading.service.get_positions"
    ],
    "special": [
      {
        "k": "只读",
        "v": "标记为只读"
      }
    ]
  },
  "trading_quote": {
    "name": "trading_quote",
    "execLogic": "调 get_quote(symbol, connection, exchange='SMART', currency='USD', sec_type='STK') 读取报价快照。",
    "modules": [
      "src.trading.service.get_quote"
    ],
    "special": [
      {
        "k": "IBKR 默认",
        "v": "exchange='SMART', currency='USD', sec_type='STK'"
      },
      {
        "k": "只读",
        "v": "标记为只读"
      }
    ]
  },
  "trading_select_connection": {
    "name": "trading_select_connection",
    "execLogic": "profile_by_id 查找 → save_selected_profile_id 持久化 → 返回 selected_profile。",
    "modules": [
      "src.trading.profiles.profile_by_id/save_selected_profile_id"
    ],
    "special": [
      {
        "k": "更改默认",
        "v": "改变后续 trading_* 调用的默认 profile"
      },
      {
        "k": "查找不到→error",
        "v": "profile_by_id 引发转 error 信封"
      }
    ]
  },
  "update_hypothesis": {
    "name": "update_hypothesis",
    "execLogic": "弹 hypothesis_id → 过滤 None 值 → HypothesisRegistry().update(id, **updates) → 返回更新后假设。",
    "modules": [
      "src.hypotheses.HypothesisRegistry"
    ],
    "special": [
      {
        "k": "none_filter",
        "v": "丢弃 None 值防误清空"
      },
      {
        "k": "部分更新",
        "v": "支持只传变化的字段"
      }
    ]
  },
  "update_research_goal_status": {
    "name": "update_research_goal_status",
    "execLogic": "解析 goal_id → expected_goal_id 陈旧保护 → GoalStore.update_status + 强制审计行 → 发 goal.updated。",
    "modules": [
      "src.goal.GoalStore"
    ],
    "special": [
      {
        "k": "陈旧写保护",
        "v": "expected_goal_id 不匹配→StaleGoalError"
      },
      {
        "k": "审计必需",
        "v": "complete 需每条 criterion 的已验证证据"
      }
    ]
  },
  "web_search": {
    "name": "web_search",
    "execLogic": "ddgs 跨多引擎（DuckDuckGo/Google/Bing/Brave）查询，最多 3 次重试+指数退避，映射为 {title,url,snippet}。",
    "modules": [
      "ddgs / duckduckgo_search"
    ],
    "special": [
      {
        "k": "引擎 fallback",
        "v": "VIBE_TRADING_SEARCH_BACKENDS 可配置引擎顺序"
      },
      {
        "k": "空结果不报错",
        "v": "'no results' 返回空数组而非失败"
      }
    ]
  },
  "write_file": {
    "name": "write_file",
    "execLogic": "resolve_safe_path 路径校验 → mkdir(parents=True) 建父目录 → write_text 写入。",
    "modules": [
      "path_utils.resolve_safe_path"
    ],
    "special": [
      {
        "k": "自动建父目录",
        "v": "mkdir(parents=True, exist_ok=True)"
      },
      {
        "k": "路径安全",
        "v": "在 allowed_write_roots 白名单内解析"
      }
    ]
  }
};
