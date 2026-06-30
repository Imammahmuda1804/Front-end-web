'use client';

import type { ElementType, ReactNode } from 'react';
import { BarChart3, Layers3 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type TopicCoverageItem = {
  id: number;
  topic_name: string;
  total_destinations: number;
};

type DistributionBucket = {
  name: string;
  count: number;
};

const DEST_A_COLOR = 'var(--success)';
const DEST_B_COLOR = 'var(--success)';

function ChartShell({ title, description, icon: Icon, children }: { title: string; description: string; icon: ElementType; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-black text-slate-950">{title}</h3>
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      <p className="sr-only">{title} adalah visualisasi untuk membantu admin membaca kualitas pengelompokan topik.</p>
      {children}
    </section>
  );
}

export function TopicCoverageParetoChart({ topics, maxDestinations }: { topics: TopicCoverageItem[]; maxDestinations: number }) {
  const data = topics.map((topic) => ({
    name: topic.topic_name.trim()
      ? topic.topic_name.length > 28 ? `${topic.topic_name.slice(0, 26)}...` : topic.topic_name
      : `Topik ${topic.id}`,
    destinations: topic.total_destinations,
  }));

  return (
    <ChartShell title="Topik paling dominan" description="Pembahasan dengan relasi destinasi terbesar. Gunakan untuk menemukan topik yang terlalu luas atau perlu dipecah." icon={BarChart3}>
      <div className="relative h-96 min-h-96 w-full min-w-0 overflow-hidden">
        <ResponsiveContainer width="100%" height={384} minWidth={1} minHeight={1}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 20, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" domain={[0, Math.max(maxDestinations, 1)]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
            <YAxis type="category" dataKey="name" width={150} axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 11, fontWeight: 800 }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            <Bar dataKey="destinations" name="Destinasi" fill={DEST_A_COLOR} radius={[0, 10, 10, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}

export function CoverageDistributionChart({ data }: { data: DistributionBucket[] }) {
  return (
    <ChartShell title="Sebaran cakupan topik" description="Sebaran jumlah destinasi per topik untuk melihat pembahasan yang terlalu kecil atau terlalu besar." icon={Layers3}>
      <div className="relative h-72 min-h-72 w-full min-w-0 overflow-hidden">
        <ResponsiveContainer width="100%" height={288} minWidth={1} minHeight={1}>
          <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 800 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            <Bar dataKey="count" name="Jumlah topik" radius={[10, 10, 0, 0]} barSize={44}>
              {data.map((entry, index) => (
                <Cell key={`${entry.name || 'bucket'}-${index}`} fill={index === 0 ? DEST_B_COLOR : index === 3 ? DEST_A_COLOR : index > 3 ? DEST_A_COLOR : DEST_B_COLOR} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}

