'use client';

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  breakdown: Record<string, number>;
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  COMPLETED: { label: 'Selesai', color: '#10b981' },
  completed: { label: 'Selesai', color: '#10b981' },
  FAILED: { label: 'Gagal', color: '#f43f5e' },
  failed: { label: 'Gagal', color: '#f43f5e' },
  PENDING: { label: 'Menunggu', color: '#f59e0b' },
  pending: { label: 'Menunggu', color: '#f59e0b' },
  RUNNING: { label: 'Berjalan', color: 'var(--ai)' },
  running: { label: 'Berjalan', color: 'var(--ai)' },
};

export default function ScrapingJobHealthChart({ breakdown }: Props) {
  const data = Object.entries(breakdown)
    .filter(([, value]) => value > 0)
    .map(([status, value]) => ({
      status,
      name: STATUS_META[status]?.label || status,
      value,
      color: STATUS_META[status]?.color || '#94a3b8',
    }));
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const failed = data.filter((item) => item.color === '#f43f5e').reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="rounded-[1.75rem] border border-slate-200 bg-white py-0 shadow-sm">
      <CardHeader className="border-b border-slate-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-black text-slate-950">Kesehatan Scraping</CardTitle>
            <CardDescription className="mt-1 font-semibold">Distribusi status pipeline pengambilan data.</CardDescription>
          </div>
          {failed > 0 ? <AlertTriangle className="h-5 w-5 text-rose-500" /> : <Activity className="h-5 w-5 text-emerald-600" />}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {data.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-200 text-sm font-bold text-slate-400">
            Belum ada job scraping.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-center">
            <div className="relative h-52">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <PieChart>
                  <Pie data={data} dataKey="value" innerRadius={58} outerRadius={86} paddingAngle={3} stroke="none">
                    {data.map((entry) => <Cell key={entry.status} fill={entry.color} />)}
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
                <div key={item.status} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
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
      </CardContent>
    </Card>
  );
}
