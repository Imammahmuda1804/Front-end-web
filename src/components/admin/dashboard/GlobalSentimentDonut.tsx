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
    { name: 'Positive', value: distribution.positive, color: '#10b981' },
    { name: 'Negative', value: distribution.negative, color: '#ef4444' },
    { name: 'Neutral', value: distribution.neutral, color: '#cbd5e1' },
  ].filter(item => item.value > 0);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="bg-white border-none shadow-sm rounded-[24px]">
      <CardHeader className="pb-2 text-center lg:text-left">
        <CardTitle className="text-lg font-bold text-slate-900">Global Sentiment</CardTitle>
        <CardDescription>Overall breakdown of all processed reviews</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center relative mt-4">
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
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-8">
                <span className="text-xs text-slate-400 font-medium tracking-wide">TOTAL</span>
                <span className="text-3xl font-bold text-slate-800 leading-tight">{total.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400">Reviews</span>
              </div>
            </div>
          </>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
            No sentiment data
          </div>
        )}
      </CardContent>
    </Card>
  );
}
