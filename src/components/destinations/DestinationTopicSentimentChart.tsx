'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type DestinationTopicSentimentRow = {
  name: string;
  Positif: number;
  Netral: number;
  Negatif: number;
  total: number;
};

type DestinationTopicSentimentChartProps = {
  data: DestinationTopicSentimentRow[];
};

export default function DestinationTopicSentimentChart({ data }: DestinationTopicSentimentChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }} barSize={14}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
        <XAxis
          type="number"
          domain={[0, 100]}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
          tickFormatter={(val) => `${val}%`}
        />
        <YAxis
          type="category"
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#334155', fontWeight: 800 }}
          width={82}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 18px 35px -25px rgb(15 23 42 / 0.35)',
            fontSize: '12px',
          }}
          formatter={(value) => [`${value}%`]}
          cursor={{ fill: 'rgba(255, 123, 84, 0.08)' }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px', fontWeight: 700 }} />
        <Bar dataKey="Positif" stackId="a" fill="#10b981" />
        <Bar dataKey="Netral" stackId="a" fill="#94a3b8" />
        <Bar dataKey="Negatif" stackId="a" fill="#f43f5e" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
