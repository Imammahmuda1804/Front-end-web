'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Target, TrendingUp } from 'lucide-react';

import { ChartPanel } from '@/components/charts/ChartPanel';

const CHART_COLORS = {
  dest1: 'var(--explore)',
  dest2: 'var(--ai)',
  positive: '#10b981',
  neutral: '#94a3b8',
  negative: '#ef4444',
};

type TooltipPayload = {
  color?: string;
  name?: string;
  value?: number | string;
};

export type CompareRadarRow = {
  subject: string;
  dest1: number;
  dest2: number;
  fullMark: number;
};

export type CompareSentimentRow = {
  name: string;
  Positif: number;
  Netral: number;
  Negatif: number;
};

type CompareChartsProps = {
  radarData: CompareRadarRow[];
  sentimentData: CompareSentimentRow[];
  destination1Name: string;
  destination2Name: string;
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60">
      <p className="mb-2 text-sm font-black text-slate-950">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="flex items-center text-sm font-semibold">
            <div className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="mr-2 text-slate-600">{entry.name}:</span>
            <span className="font-black text-slate-950">{typeof entry.value === 'number' ? entry.value.toFixed(0) : entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CompareCharts({ radarData, sentimentData, destination1Name, destination2Name }: CompareChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartPanel icon={Target} title="Skor rekomendasi dan rating">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 800 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '16px', fontWeight: 800, fontSize: '12px' }} />
            <Radar name={destination1Name} dataKey="dest1" stroke={CHART_COLORS.dest1} fill={CHART_COLORS.dest1} fillOpacity={0.32} strokeWidth={3} />
            <Radar name={destination2Name} dataKey="dest2" stroke={CHART_COLORS.dest2} fill={CHART_COLORS.dest2} fillOpacity={0.28} strokeWidth={3} />
          </RadarChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel icon={TrendingUp} title="Distribusi sentimen ulasan">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sentimentData} margin={{ top: 16, right: 16, left: -12, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#0f172a', fontWeight: 800, fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 123, 84, 0.08)' }} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '16px', fontWeight: 800, fontSize: '12px' }} />
            <Bar dataKey="Positif" stackId="a" fill={CHART_COLORS.positive} radius={[0, 0, 6, 6]} barSize={54} />
            <Bar dataKey="Netral" stackId="a" fill={CHART_COLORS.neutral} />
            <Bar dataKey="Negatif" stackId="a" fill={CHART_COLORS.negative} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>
    </div>
  );
}
