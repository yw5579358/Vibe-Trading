import { type ReactNode, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, Cpu, TrendingUp, Wallet, Terminal, Moon, Sun, Menu, X, BookOpen,
} from 'lucide-react';

const NAV = [
  { to: '/', label: '首页', desc: '项目是什么', icon: Home },
  { to: '/architecture', label: '技术架构', desc: '怎么实现的', icon: Cpu },
  { to: '/quant', label: '量化研究', desc: '因子与回测', icon: TrendingUp },
  { to: '/trading', label: '交易与风控', desc: '实盘·影子·Swarm', icon: Wallet },
  { to: '/finance', label: '金融知识', desc: '指标·概念·估值', icon: BookOpen },
  { to: '/operations', label: '上手操作', desc: '配置与工作流', icon: Terminal },
];

function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('vt-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('vt-theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, setDark] as const;
}

export function Layout({ children }: { children: ReactNode }) {
  const [dark, setDark] = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const loc = useLocation();

  // 切换路由时滚到顶部 & 关闭移动菜单
  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileOpen(false);
  }, [loc.pathname]);

  return (
    <div className="min-h-screen">
      {/* 顶栏 */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="菜单"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <NavLink to="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white shrink-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white text-sm">📊</span>
            <span className="hidden sm:inline">Vibe-Trading 学习指南</span>
          </NavLink>
          <div className="flex-1" />
          <a
            href="https://github.com/HKUDS/Vibe-Trading"
            target="_blank" rel="noreferrer"
            className="p-2 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400"
            title="GitHub"
          >
            <span className="text-base leading-none">🐙</span>
          </a>
          <button
            onClick={() => setDark(d => !d)}
            className="p-2 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400"
            title={dark ? '切换亮色' : '切换暗色'}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex gap-8">
        {/* 侧边导航 */}
        <aside
          className={`${mobileOpen ? 'block' : 'hidden'} lg:block fixed lg:sticky top-14 lg:top-14
                      left-0 z-30 w-64 lg:w-56 shrink-0 h-[calc(100vh-3.5rem)] overflow-y-auto
                      bg-white dark:bg-slate-950 lg:bg-transparent border-r lg:border-r-0
                      border-slate-200 dark:border-slate-800 p-4`}
        >
          <nav className="space-y-1">
            {NAV.map(({ to, label, desc, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon size={18} className="mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs opacity-70">{desc}</div>
                </div>
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 px-3 text-xs text-slate-400 dark:text-slate-600 leading-relaxed">
            一份面向金融工程师的<br />通俗学习指南
          </div>
        </aside>

        {/* 遮罩（移动端） */}
        {mobileOpen && (
          <div
            className="lg:hidden fixed inset-0 top-14 z-20 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* 正文 */}
        <main className="flex-1 min-w-0 py-8 sm:py-12 animate-fade-in">{children}</main>
      </div>

      <footer className="border-t border-slate-200 dark:border-slate-800 mt-12">
        <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-slate-500 dark:text-slate-500 flex flex-col sm:flex-row gap-2 justify-between">
          <span>Vibe-Trading 学习指南 · 基于源码梳理，以学习为目的</span>
          <span>技术栈：Python · FastAPI · LangChain · React · SQLite</span>
        </div>
      </footer>
    </div>
  );
}

/* 页面顶部 hero 标题 */
export function PageHero({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc: ReactNode;
}) {
  return (
    <div className="mb-10">
      <div className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">
        {eyebrow}
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
        {title}
      </h1>
      <p className="mt-4 lead max-w-2xl">{desc}</p>
    </div>
  );
}
