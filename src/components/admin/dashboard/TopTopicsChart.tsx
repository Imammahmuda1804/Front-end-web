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
  // Define a nice color palette for the bars
  const colors = ['#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  return (
    <Card className="bg-white border-none shadow-sm rounded-[24px]">
      <CardHeader className="pb-6">
        <CardTitle className="text-lg font-bold text-slate-900">Top Topic Clusters</CardTitle>
        <CardDescription>Most frequently discussed topics across all destinations</CardDescription>
      </CardHeader>
      <CardContent>
        {topics && topics.length > 0 ? (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
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
                  tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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
          <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm">
            No topic data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
