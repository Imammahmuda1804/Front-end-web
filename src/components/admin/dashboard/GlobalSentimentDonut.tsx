'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface GlobalSentimentDonutProps {
  distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export default function GlobalSentimentDonut({ distribution }: GlobalSentimentDonutProps) {
  const data = [
    { name: 'Positif', value: distribution.positive, color: '#10b981' },
    { name: 'Negatif', value: distribution.negative, color: '#f43f5e' },
    { name: 'Netral', value: distribution.neutral, color: '#94a3b8' },
  ].filter(item => item.value > 0);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const positiveRatio = total > 0 ? Math.round((distribution.positive / total) * 100) : 0;

  return (
    <Card className="rounded-[1.75rem] border border-slate-200 bg-white py-0 shadow-sm">
      <CardHeader className="border-b border-slate-100 p-6 text-center lg:text-left">
        <CardTitle className="text-lg font-black text-slate-950">Sentimen Global</CardTitle>
        <CardDescription className="mt-1 font-semibold">Komposisi seluruh ulasan yang sudah diproses.</CardDescription>
      </CardHeader>
      <CardContent className="relative flex flex-col items-center justify-center p-6">
        {data.length > 0 ? (
          <>
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', fontWeight: 700 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-8">
                <span className="text-xs font-black tracking-[0.14em] text-slate-400">POSITIF</span>
                <span className="text-3xl font-black leading-tight text-slate-950">{positiveRatio}%</span>
                <span className="text-[10px] font-bold text-slate-400">{total.toLocaleString()} ulasan</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-[220px] items-center justify-center rounded-3xl border border-dashed border-slate-200 text-sm font-bold text-slate-400">
            Data sentimen belum tersedia.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
