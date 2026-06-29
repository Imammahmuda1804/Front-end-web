'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Loader2 } from 'lucide-react';

import { adminService } from '@/features/admin/services/admin.service';
import { NativeSelect } from '@/components/ui/native-select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Period = 'daily' | 'weekly' | 'monthly';
type TrendPoint = {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
};
type ChartTrendPoint = TrendPoint & {
  positiveRate: number;
  neutralRate: number;
  negativeRate: number;
};

const periodOptions = [
  { value: 'daily', label: '30 hari', description: 'Agregasi harian' },
  { value: 'weekly', label: '12 minggu', description: 'Agregasi mingguan' },
  { value: 'monthly', label: '12 bulan', description: 'Agregasi bulanan' },
];

export default function MonthlySentimentChart() {
  const [period, setPeriod] = useState<Period>('monthly');

  const { data, isLoading } = useQuery<{ period: Period; trends: TrendPoint[] }>({
    queryKey: ['admin', 'dashboard', 'trends', period],
    queryFn: async () => {
      const data = await adminService.getDashboardTrends(period);
      return data.data;
    },
  });

  const trends = data?.trends || [];
  const chartTrends: ChartTrendPoint[] = trends.map((trend) => {
    const total = trend.total || trend.positive + trend.neutral + trend.negative || 1;
    return {
      ...trend,
      positiveRate: Math.round((trend.positive / total) * 100),
      neutralRate: Math.round((trend.neutral / total) * 100),
      negativeRate: Math.round((trend.negative / total) * 100),
    };
  });
  const latest = trends[trends.length - 1];
  const previous = trends[trends.length - 2];
  const negativeDelta = latest && previous ? latest.negative - previous.negative : 0;

  return (
    <Card className="rounded-lg border border-slate-200 bg-white py-0 shadow-sm">
      <CardHeader className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle className="text-xl font-black text-slate-950">Tren Sentimen</CardTitle>
          <CardDescription className="mt-1 font-semibold">
            Rasio positif, netral, dan negatif per periode agar perubahan dominasi mudah terlihat.
          </CardDescription>
        </div>
        <div className="w-full sm:w-48">
          <NativeSelect
            aria-label="Pilih periode tren sentimen"
            value={period}
            onValueChange={(value) => setPeriod(value as Period)}
            options={periodOptions}
          />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex h-[320px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
          </div>
        ) : trends.length === 0 ? (
          <div className="flex h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center">
            <p className="text-sm font-bold text-slate-500">Data tren sentimen belum tersedia.</p>
          </div>
        ) : (
          <>
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <TrendStat label="Total terbaru" value={latest?.total || 0} tone="slate" />
              <TrendStat label="Positif terbaru" value={latest?.positive || 0} tone="emerald" />
              <TrendStat label="Delta negatif" value={negativeDelta} tone={negativeDelta > 0 ? 'rose' : 'slate'} signed />
            </div>
            <p className="sr-only">Grafik garis menampilkan rasio ulasan positif, netral, dan negatif per periode. Garis dapat saling bersinggungan untuk memperlihatkan perubahan dominasi sentimen.</p>
            <div className="relative h-[320px] min-h-[320px] w-full min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height={320} minWidth={1} minHeight={1}>
                <LineChart data={chartTrends} margin={{ top: 8, right: 18, left: -12, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} dy={10} />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} />
                  <Tooltip content={<TrendTooltip />} />
                  <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, fontWeight: 800, paddingTop: 8 }} />
                  <Line type="monotone" dataKey="positiveRate" name="Positif" stroke="#10b981" strokeWidth={3} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="neutralRate" name="Netral" stroke="#64748b" strokeWidth={3} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="negativeRate" name="Negatif" stroke="#f43f5e" strokeWidth={3} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
              Grafik memakai persentase per periode, bukan jumlah mentah, supaya garis positif, netral, dan negatif berada pada skala yang sama dan perubahan arah lebih terbaca.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TrendTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey?: string; value?: number; payload?: ChartTrendPoint }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  const rows = [
    { key: 'positiveRate', label: 'Positif', count: point.positive, color: 'text-emerald-700' },
    { key: 'neutralRate', label: 'Netral', count: point.neutral, color: 'text-slate-700' },
    { key: 'negativeRate', label: 'Negatif', count: point.negative, color: 'text-rose-700' },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-xl">
      <p className="font-black text-slate-950">{label}</p>
      <p className="mt-1 font-bold text-slate-500">{point.total.toLocaleString()} ulasan</p>
      <div className="mt-2 space-y-1.5">
        {rows.map((row) => {
          const value = payload.find((item) => item.dataKey === row.key)?.value ?? 0;
          return (
            <div key={row.key} className="flex min-w-40 items-center justify-between gap-4">
              <span className={`font-black ${row.color}`}>{row.label}</span>
              <span className="font-bold text-slate-600">{value}% ({row.count})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrendStat({ label, value, tone, signed }: { label: string; value: number; tone: 'emerald' | 'rose' | 'slate'; signed?: boolean }) {
  const toneClass = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  }[tone];

  return (
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">
        {signed && value > 0 ? `+${value}` : value.toLocaleString()}
      </p>
    </div>
  );
}

