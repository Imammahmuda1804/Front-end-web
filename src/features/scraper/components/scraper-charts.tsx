'use client';

import type { ElementType, ReactNode } from 'react';
import { Activity, BarChart3 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function StatusDistributionChart({ data }: { data: Array<{ status: string; name: string; value: number; color: string }> }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <ChartShell title="Scraping Status Donut" description="Distribusi status job untuk membaca kesehatan pipeline." icon={Activity}>
      {data.length === 0 ? (
        <ChartEmpty label="Belum ada job scraping." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-center">
          <div className="relative h-56 min-h-56 w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height={224} minWidth={1} minHeight={1}>
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={58} outerRadius={86} paddingAngle={3} stroke="none">
                  {data.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Total</span>
              <span className="text-3xl font-black text-slate-950">{total}</span>
            </div>
          </div>
          <div className="space-y-2">
            {data.map((item) => (
              <div key={item.status} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="flex items-center gap-2 text-sm font-black text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="text-sm font-black text-slate-950">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartShell>
  );
}

export function ReviewYieldChart({ data }: { data: Array<{ name: string; reviews: number }> }) {
  return (
    <ChartShell title="Review Yield Bar" description="Job dengan hasil review terbesar sebagai acuan scraping." icon={BarChart3}>
      {data.length === 0 ? (
        <ChartEmpty label="Belum ada job selesai dengan review." />
      ) : (
        <div className="relative h-72 min-h-72 w-full min-w-0 overflow-hidden">
          <ResponsiveContainer width="100%" height={288} minWidth={1} minHeight={1}>
            <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={110} axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 11, fontWeight: 800 }} />
              <Tooltip contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Bar dataKey="reviews" name="Review" fill="var(--success)" radius={[0, 10, 10, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartShell>
  );
}

function ChartShell({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: ElementType;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">{title}</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{description}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {children}
    </section>
  );
}

function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-500">
      {label}
    </div>
  );
}
