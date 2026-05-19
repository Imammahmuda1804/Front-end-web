'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Loader2 } from 'lucide-react';

import { api } from '@/lib/axios';
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
      const res = await api.get(`/api/admin/dashboard/trends?period=${period}`);
      return res.data.data;
    },
  });

  const trends = data?.trends || [];
  const latest = trends[trends.length - 1];
  const previous = trends[trends.length - 2];
  const negativeDelta = latest && previous ? latest.negative - previous.negative : 0;

  return (
    <Card className="rounded-[1.75rem] border border-slate-200 bg-white py-0 shadow-sm">
      <CardHeader className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle className="text-xl font-black text-slate-950">Tren Sentimen</CardTitle>
          <CardDescription className="mt-1 font-semibold">
            Pergerakan positif, netral, negatif, dan total ulasan dari waktu ke waktu.
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
          <div className="flex h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
            <p className="text-sm font-bold text-slate-500">Data tren sentimen belum tersedia.</p>
          </div>
        ) : (
          <>
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <TrendStat label="Total terbaru" value={latest?.total || 0} tone="slate" />
              <TrendStat label="Positif terbaru" value={latest?.positive || 0} tone="emerald" />
              <TrendStat label="Delta negatif" value={negativeDelta} tone={negativeDelta > 0 ? 'rose' : 'slate'} signed />
            </div>
            <p className="sr-only">
              Grafik area bertumpuk menampilkan jumlah ulasan positif, netral, negatif, dan garis total per periode.
            </p>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <AreaChart data={trends} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 18px 35px -25px rgb(15 23 42 / 0.35)', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="positive" name="Positif" stackId="sentiment" stroke="#10b981" fill="#10b981" fillOpacity={0.28} strokeWidth={2} />
                  <Area type="monotone" dataKey="neutral" name="Netral" stackId="sentiment" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.24} strokeWidth={2} />
                  <Area type="monotone" dataKey="negative" name="Negatif" stackId="sentiment" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.24} strokeWidth={2} />
                  <Area type="monotone" dataKey="total" name="Total" stroke="#2D82B5" fill="transparent" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TrendStat({ label, value, tone, signed }: { label: string; value: number; tone: 'emerald' | 'rose' | 'slate'; signed?: boolean }) {
  const toneClass = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">
        {signed && value > 0 ? `+${value}` : value.toLocaleString()}
      </p>
    </div>
  );
}
