'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type TopicRisk = {
  topic_name: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  risk_ratio: number;
};

interface Props {
  topics: TopicRisk[];
}

function cleanTopic(name: string) {
  return name.replace(/^Topic \d+:\s*/, '').split(' ').slice(0, 4).join(' ');
}

export default function TopicRiskMatrix({ topics }: Props) {
  const data = topics.map((topic) => ({
    ...topic,
    topic_name: cleanTopic(topic.topic_name),
    risk_percent: Math.round(topic.risk_ratio * 100),
  }));

  return (
    <Card className="rounded-[1.75rem] border border-slate-200 bg-white py-0 shadow-sm">
      <CardHeader className="border-b border-slate-100 p-6">
        <CardTitle className="text-xl font-black text-slate-950">Topic Risk Matrix</CardTitle>
        <CardDescription className="mt-1 font-semibold">Topik dengan porsi sentimen negatif tertinggi untuk dipantau admin.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {data.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-3xl border border-dashed border-slate-200 text-sm font-bold text-slate-400">
            Data risiko topik belum tersedia.
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} />
                  <YAxis dataKey="topic_name" type="category" width={118} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#334155', fontWeight: 800 }} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Risiko negatif']} contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Bar dataKey="risk_percent" radius={[0, 10, 10, 0]} barSize={18}>
                    {data.map((entry) => (
                      <Cell key={entry.topic_name} fill={entry.risk_percent >= 35 ? '#f43f5e' : entry.risk_percent >= 20 ? '#f59e0b' : '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {data.slice(0, 5).map((topic) => (
                <div key={topic.topic_name} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-black text-slate-950">{topic.topic_name}</p>
                    <span className="text-sm font-black text-rose-600">{topic.risk_percent}%</span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {topic.negative} negatif dari {topic.total} ulasan topik
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
