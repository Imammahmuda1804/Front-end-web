'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  breakdown: { scraped: number; user_submitted: number };
}

export default function ReviewSourceMixChart({ breakdown }: Props) {
  const total = breakdown.scraped + breakdown.user_submitted;
  const data = [
    { name: 'Google Maps', value: breakdown.scraped, color: '#2D82B5' },
    { name: 'Pengguna', value: breakdown.user_submitted, color: '#FF7B54' },
  ];
  const userRatio = total > 0 ? Math.round((breakdown.user_submitted / total) * 100) : 0;

  return (
    <Card className="rounded-[1.75rem] border border-slate-200 bg-white py-0 shadow-sm">
      <CardHeader className="border-b border-slate-100 p-6">
        <CardTitle className="text-lg font-black text-slate-950">Komposisi Sumber Ulasan</CardTitle>
        <CardDescription className="mt-1 font-semibold">Perbandingan hasil scraping dan kontribusi pengguna.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-5 rounded-2xl border border-orange-100 bg-orange-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Kontribusi pengguna</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{userRatio}%</p>
          <p className="mt-1 text-sm font-semibold text-slate-600">Dari total {total.toLocaleString()} ulasan</p>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 8, right: 18, left: 18, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#334155', fontWeight: 800 }} width={88} />
              <Tooltip contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
