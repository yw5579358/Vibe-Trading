import { type ReactNode, useState } from 'react';
import { Lightbulb, AlertTriangle, Info, CheckCircle2, Zap, ChevronRight } from 'lucide-react';

/* =========================================================================
 *  Section — 一页内的主区块
 * ===================================================================== */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-10 border-t border-slate-200 dark:border-slate-800 first:border-t-0">
      {(eyebrow || title) && (
        <header className="mb-6">
          {eyebrow && (
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">
              {eyebrow}
            </div>
          )}
          {title && (
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h2>
          )}
          {intro && <div className="mt-3 lead">{intro}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

/* =========================================================================
 *  Card — 通用卡片
 * ===================================================================== */
export function Card({
  title,
  icon,
  children,
  className = '',
  accent = 'brand',
}: {
  title?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  accent?: 'brand' | 'emerald' | 'amber' | 'rose' | 'violet' | 'slate';
}) {
  const accents: Record<string, string> = {
    brand: 'before:bg-brand-500',
    emerald: 'before:bg-emerald-500',
    amber: 'before:bg-amber-500',
    rose: 'before:bg-rose-500',
    violet: 'before:bg-violet-500',
    slate: 'before:bg-slate-400',
  };
  return (
    <div
      className={`relative rounded-xl bg-white dark:bg-slate-900 border border-slate-200
                  dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow
                  before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1
                  before:rounded-full ${accents[accent]} ${className}`}
    >
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-3 ml-2">
          {icon && <span className="text-brand-600 dark:text-brand-400">{icon}</span>}
          {title && <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>}
        </div>
      )}
      <div className="ml-2 text-[15px] text-slate-700 dark:text-slate-300">{children}</div>
    </div>
  );
}

/* =========================================================================
 *  Callout — 提示框（info / tip / warning / success）
 * ===================================================================== */
const calloutStyles = {
  info: { wrap: 'bg-brand-50 dark:bg-brand-900/30 border-brand-200 dark:border-brand-800', icon: <Info size={18} />, ic: 'text-brand-600 dark:text-brand-400' },
  tip: { wrap: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800', icon: <Lightbulb size={18} />, ic: 'text-emerald-600 dark:text-emerald-400' },
  warning: { wrap: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800', icon: <AlertTriangle size={18} />, ic: 'text-amber-600 dark:text-amber-400' },
  success: { wrap: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800', icon: <CheckCircle2 size={18} />, ic: 'text-emerald-600 dark:text-emerald-400' },
};
export function Callout({
  type = 'info',
  title,
  children,
}: {
  type?: 'info' | 'tip' | 'warning' | 'success';
  title?: string;
  children: ReactNode;
}) {
  const s = calloutStyles[type];
  return (
    <div className={`my-5 rounded-lg border p-4 flex gap-3 ${s.wrap}`}>
      <div className={`shrink-0 mt-0.5 ${s.ic}`}>{s.icon}</div>
      <div className="min-w-0 flex-1 text-[15px] text-slate-700 dark:text-slate-300">
        {title && <div className="font-semibold mb-1 text-slate-900 dark:text-white">{title}</div>}
        {children}
      </div>
    </div>
  );
}

/* =========================================================================
 *  Steps — 步骤列表（横向流程感）
 * ===================================================================== */
export function Steps({
  items,
}: {
  items: { title: string; desc?: ReactNode; icon?: ReactNode }[];
}) {
  return (
    <ol className="relative space-y-4 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
      {items.map((it, i) => (
        <li key={i} className="relative pl-10">
          <span className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white text-sm font-semibold ring-4 ring-brand-50 dark:ring-slate-900">
            {it.icon ?? i + 1}
          </span>
          <div className="pt-1">
            <div className="font-semibold text-slate-900 dark:text-white">{it.title}</div>
            {it.desc && <div className="mt-1 text-[15px] text-slate-600 dark:text-slate-400">{it.desc}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* =========================================================================
 *  Stat — 数字 + 标签
 * ===================================================================== */
export function Stat({ value, label, sub }: { value: ReactNode; label: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 text-center">
      <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">{value}</div>
      <div className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">{sub}</div>}
    </div>
  );
}

/* =========================================================================
 *  Pill / Tag — 小标签
 * ===================================================================== */
export function Pill({
  children,
  tone = 'slate',
}: {
  children: ReactNode;
  tone?: 'slate' | 'brand' | 'emerald' | 'amber' | 'rose' | 'violet';
}) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

/* =========================================================================
 *  KV — 键值对（属性表，比 table 轻）
 * ===================================================================== */
export function KV({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <dl className="divide-y divide-slate-200 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      {rows.map(([k, v], i) => (
        <div key={i} className="grid grid-cols-3 gap-3 px-4 py-2.5 bg-white dark:bg-slate-900 text-[15px]">
          <dt className="font-medium text-slate-600 dark:text-slate-400">{k}</dt>
          <dd className="col-span-2 text-slate-800 dark:text-slate-200">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* =========================================================================
 *  CompareTable — 简洁对比表
 * ===================================================================== */
export function CompareTable({
  head,
  rows,
}: {
  head: ReactNode[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-800/60">
            {head.map((h, i) => (
              <th key={i} className="px-3 py-2.5 text-left font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {rows.map((r, ri) => (
            <tr key={ri} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40">
              {r.map((c, ci) => (
                <td key={ci} className={`px-3 py-2.5 align-top text-slate-700 dark:text-slate-300 ${ci === 0 ? 'font-medium text-slate-900 dark:text-white' : ''}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================================
 *  FlowDiagram — 纯 div/CSS 流程图（不依赖 mermaid）
 *  boxes: [{label, sub?, tone?}]
 * ===================================================================== */
const flowTones: Record<string, string> = {
  brand: 'bg-brand-50 border-brand-300 text-brand-800 dark:bg-brand-900/40 dark:border-brand-700 dark:text-brand-200',
  emerald: 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-700 dark:text-emerald-200',
  amber: 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-200',
  violet: 'bg-violet-50 border-violet-300 text-violet-800 dark:bg-violet-900/40 dark:border-violet-700 dark:text-violet-200',
  slate: 'bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300',
};
export function FlowDiagram({
  boxes,
  direction = 'row',
}: {
  boxes: { label: string; sub?: string; tone?: keyof typeof flowTones }[];
  direction?: 'row' | 'col';
}) {
  const isRow = direction === 'row';
  return (
    <div className={`flex ${isRow ? 'flex-row flex-wrap items-stretch' : 'flex-col'} gap-2 my-5`}>
      {boxes.map((b, i) => (
        <div key={i} className="contents">
          <div className={`rounded-lg border px-4 py-3 min-w-[120px] flex-1 ${flowTones[b.tone ?? 'slate']}`}>
            <div className="font-semibold text-sm">{b.label}</div>
            {b.sub && <div className="text-xs mt-0.5 opacity-80">{b.sub}</div>}
          </div>
          {i < boxes.length - 1 && (
            <div className={`flex items-center justify-center text-slate-400 ${isRow ? 'px-1' : 'py-1 rotate-90'}`}>
              {isRow ? '→' : '↓'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* =========================================================================
 *  CodeBlock — 带标题的代码块（克制使用）
 * ===================================================================== */
export function CodeBlock({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <figure className="my-5">
      {title && (
        <figcaption className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
          <Zap size={13} className="text-amber-500" />
          {title}
        </figcaption>
      )}
      <pre className="!bg-slate-900 dark:!bg-black"><code>{children}</code></pre>
    </figure>
  );
}

/* =========================================================================
 *  SubHeading — 次级小标题
 * ===================================================================== */
export function SubHeading({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h3 id={id} className="scroll-mt-24 text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-3">
      {children}
    </h3>
  );
}

/* =========================================================================
 *  Details — 可折叠的「深挖」面板（点击展开看细节）
 *  summary：标题；level：deep/deepest 控制视觉强调
 * ===================================================================== */
export function Details({
  summary,
  children,
  level = 'deep',
  defaultOpen = false,
}: {
  summary: ReactNode;
  children: ReactNode;
  level?: 'deep' | 'deepest';
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const wrap =
    level === 'deepest'
      ? 'border-l-2 border-violet-300 dark:border-violet-700 bg-violet-50/40 dark:bg-violet-900/10'
      : 'border-l-2 border-brand-300 dark:border-brand-700 bg-brand-50/40 dark:bg-brand-900/10';
  return (
    <div className={`my-4 rounded-r-lg border border-slate-200 dark:border-slate-800 border-l-0 ${wrap}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-[15px] font-medium text-slate-800 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/30 transition-colors"
        aria-expanded={open}
      >
        <ChevronRight
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`}
        />
        <span className="flex-1">{summary}</span>
        <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
          深挖
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 text-[15px] text-slate-700 dark:text-slate-300 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

