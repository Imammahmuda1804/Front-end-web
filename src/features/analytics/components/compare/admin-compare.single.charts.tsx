'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { CustomTooltip, DEST_A_COLOR, SENTIMENT_COLORS } from './CompareClient';

export function SentimentPieChart({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  return (
    <div className="relative h-80 min-h-80 w-full min-w-0 overflow-hidden">
      <ResponsiveContainer width="100%" height={320} minWidth={1} minHeight={1}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={68} outerRadius={92} paddingAngle={5} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopicBarChartPanel({
  data,
}: {
  data: Array<{ name: string; Percentage: number }>;
}) {
  return (
    <div className="relative h-80 min-h-80 w-full min-w-0 overflow-hidden">
      <ResponsiveContainer width="100%" height={320} minWidth={1} minHeight={1}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 123, 84, 0.08)' }} />
          <Bar dataKey="Percentage" name="Persentase" fill={DEST_A_COLOR} radius={[8, 8, 0, 0]} barSize={42} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlySentimentLineChart({
  data,
}: {
  data: Array<{ name: string; year?: string; Positif: number; Netral: number; Negatif: number; PosRate: number }>;
}) {
  return (
    <div className="relative h-72 min-h-72 w-full min-w-0 overflow-hidden">
      <ResponsiveContainer width="100%" height={288} minWidth={1} minHeight={1}>
        <LineChart data={data} margin={{ top: 10, right: 18, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={32} />
          <Line type="monotone" dataKey="Positif" name="Positif" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="Netral" name="Netral" stroke="#94a3b8" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="Negatif" name="Negatif" stroke="#f43f5e" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
