'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TopTopicsChartProps {
  topics: Array<{
    topic_name: string;
    count: number;
  }>;
}

export default function TopTopicsChart({ topics }: TopTopicsChartProps) {
  return (
    <Card className="rounded-lg border border-slate-200 bg-white py-0 shadow-sm">
      <CardHeader className="border-b border-slate-100 p-6">
        <CardTitle className="text-xl font-black text-slate-950">Topik Paling Sering Dibahas</CardTitle>
        <CardDescription className="mt-1 font-semibold">Topik dominan dari ulasan lintas destinasi.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {topics && topics.length > 0 ? (
          <div className="relative h-[250px] min-h-[250px] w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height={250} minWidth={1} minHeight={1}>
              <BarChart
                data={topics}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="topic_name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#334155', fontSize: 12, fontWeight: 800 }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 18px 35px -25px rgb(15 23 42 / 0.35)', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[12, 12, 12, 12]} barSize={20}>
                  {topics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[250px] items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm font-bold text-slate-400">
            Data topik belum tersedia.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

