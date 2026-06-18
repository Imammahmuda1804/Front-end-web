import type { ElementType, ReactNode } from 'react';
import { BarChart2 } from 'lucide-react';

import type { Tone } from './admin-compare.types';

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <section className="rounded-lg border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 text-primary">
        <BarChart2 className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-xl font-black text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">{description}</p>
    </section>
  );
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: ElementType;
  label: string;
  value: string;
  helper: string;
  tone: Tone;
}) {
  const toneClass = {
    orange: 'border-orange-100 bg-orange-50 text-primary',
    blue: 'border-sky-100 bg-sky-50 text-ai',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
    slate: 'border-slate-200 bg-white text-slate-700',
  }[tone];

  return (
    <article className={`rounded-lg border p-5 shadow-sm ${toneClass}`}>
      <Icon className="mb-4 h-5 w-5" />
      <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-2 line-clamp-1 text-2xl font-black leading-none text-slate-950">{value}</p>
      <p className="mt-2 text-xs font-bold leading-5 opacity-80">{helper}</p>
    </article>
  );
}

export function ChartCard({
  title,
  icon: Icon,
  children,
  heightClass = 'h-[20rem]',
}: {
  title: string;
  icon: ElementType;
  children: ReactNode;
  heightClass?: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-black text-slate-950">{title}</h3>
        </div>
      </div>
      <p className="sr-only">{title} ditampilkan sebagai chart untuk membantu admin membaca pola data.</p>
      <div className={heightClass}>{children}</div>
    </section>
  );
}

export function ChartLoading() {
  return (
    <div className="h-full min-h-[14rem] animate-pulse rounded-lg border border-slate-100 bg-slate-50" />
  );
}
