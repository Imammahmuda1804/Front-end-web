import type { ElementType, ReactNode } from 'react';
import { BarChart2, Download, GitCompare, Heart, Star, Tags, Target, TrendingUp } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DestinationAnalytics } from '@/services/admin/analytics.service';
import type { DestinationOption, MetricRow, Tone } from './CompareClient';
import { CustomTooltip, DEST_A_COLOR, DEST_B_COLOR, formatMetric, sentimentRate, sentimentTotal } from './CompareClient';
export function CompareAnalysisView({
  dA,
  dB,
  selectedA,
  selectedB,
  recommendationWinner,
  metricRows,
  biggestDelta,
  radarData,
  sentimentCompareData,
  mergedTopicData,
  mergedTrendData,
  onExport,
}: {
  dA?: DestinationAnalytics;
  dB?: DestinationAnalytics;
  selectedA?: DestinationOption;
  selectedB?: DestinationOption;
  recommendationWinner: DestinationAnalytics | null;
  metricRows: MetricRow[];
  biggestDelta: MetricRow | null;
  radarData: Array<{ subject: string; A: number; B: number; fullMark: number }>;
  sentimentCompareData: Array<{ name: string; Positif: number; Netral: number; Negatif: number }>;
  mergedTopicData: Array<{ name: string; A: number; B: number }>;
  mergedTrendData: Array<{ name: string; A?: number; B?: number }>;
  onExport: () => void;
}) {
  if (!dA || !dB) {
    return <EmptyState title="Pilih dua destinasi berbeda" description="Ringkasan pemenang, delta metrik, chart, dan tabel akan muncul di sini." />;
  }

  const winnerCards = [
    { label: 'Sentimen', value: sentimentRate(dA) >= sentimentRate(dB) ? dA.name : dB.name, helper: `${sentimentRate(dA)}% vs ${sentimentRate(dB)}%`, tone: 'emerald' as Tone, icon: Heart },
    { label: 'Rating User', value: (dA.rating.user || 0) >= (dB.rating.user || 0) ? dA.name : dB.name, helper: `${(dA.rating.user || 0).toFixed(1)} vs ${(dB.rating.user || 0).toFixed(1)}`, tone: 'amber' as Tone, icon: Star },
    { label: 'Skor AI', value: (dA.recommendation_score || 0) >= (dB.recommendation_score || 0) ? dA.name : dB.name, helper: `${(dA.recommendation_score || 0).toFixed(2)} vs ${(dB.recommendation_score || 0).toFixed(2)}`, tone: 'orange' as Tone, icon: TrendingUp },
    { label: 'Volume', value: sentimentTotal(dA) >= sentimentTotal(dB) ? dA.name : dB.name, helper: `${sentimentTotal(dA)} vs ${sentimentTotal(dB)} ulasan`, tone: 'blue' as Tone, icon: BarChart2 },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Executive summary</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950 md:text-3xl">
              {recommendationWinner ? `${recommendationWinner.name} unggul sebagai rekomendasi` : 'Kedua destinasi relatif seimbang'}
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
              Gunakan ringkasan pemenang, selisih terbesar, volume ulasan, dan tren positif untuk menentukan prioritas kurasi atau tindak lanjut admin.
            </p>
          </div>
          <button onClick={onExport} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-black text-white transition-colors hover:bg-primary/90">
            <Download className="h-4 w-4" />
            Ekspor CSV
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {winnerCards.map((card) => <MetricCard key={card.label} {...card} />)}
        </div>

        {biggestDelta && (
          <div className="mt-5 rounded-3xl border border-sky-100 bg-sky-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Selisih terbesar</p>
            <p className="mt-1 text-xl font-black text-slate-950">{biggestDelta.label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              {selectedA?.name || dA.name}: {formatMetric(biggestDelta.a, biggestDelta.format)} / {selectedB?.name || dB.name}: {formatMetric(biggestDelta.b, biggestDelta.format)}
            </p>
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(20rem,0.7fr)_minmax(0,1.3fr)]">
        <ChartCard title="Radar Performa" icon={Target}>
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name={dA.name} dataKey="A" stroke={DEST_A_COLOR} fill={DEST_A_COLOR} fillOpacity={0.3} strokeWidth={3} />
              <Radar name={dB.name} dataKey="B" stroke={DEST_B_COLOR} fill={DEST_B_COLOR} fillOpacity={0.25} strokeWidth={3} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontWeight: 700, fontSize: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Sentimen 100% Stacked" icon={Heart}>
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={sentimentCompareData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#0f172a', fontSize: 12, fontWeight: 800 }} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontWeight: 700, fontSize: '12px' }} />
              <Bar dataKey="Positif" stackId="a" fill="#10b981" radius={[6, 0, 0, 6]} />
              <Bar dataKey="Netral" stackId="a" fill="#94a3b8" />
              <Bar dataKey="Negatif" stackId="a" fill="#ef4444" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Topic Overlap" icon={Tags}>
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart layout="vertical" data={mergedTopicData} margin={{ top: 10, right: 16, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} width={96} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontWeight: 700, fontSize: '12px' }} />
              <Bar dataKey="A" name={dA.name} fill={DEST_A_COLOR} radius={[0, 6, 6, 0]} barSize={10} />
              <Bar dataKey="B" name={dB.name} fill={DEST_B_COLOR} radius={[0, 6, 6, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tren Rasio Positif" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <AreaChart data={mergedTrendData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="compareA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={DEST_A_COLOR} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={DEST_A_COLOR} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="compareB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={DEST_B_COLOR} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={DEST_B_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="A" name={dA.name} stroke={DEST_A_COLOR} strokeWidth={3} fill="url(#compareA)" />
              <Area type="monotone" dataKey="B" name={dB.name} stroke={DEST_B_COLOR} strokeWidth={3} fill="url(#compareB)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ActionableVarianceTable rows={metricRows} nameA={dA.name} nameB={dB.name} />
    </div>
  );
}

export function MetricCard({ icon: Icon, label, value, helper, tone }: { icon: ElementType; label: string; value: string; helper: string; tone: Tone }) {
  const toneClass = {
    orange: 'border-orange-100 bg-orange-50 text-primary',
    blue: 'border-sky-100 bg-sky-50 text-ai',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
    slate: 'border-slate-200 bg-white text-slate-700',
  }[tone];

  return (
    <article className={`rounded-[1.5rem] border p-5 shadow-sm ${toneClass}`}>
      <Icon className="mb-4 h-5 w-5" />
      <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-2 line-clamp-1 text-2xl font-black leading-none text-slate-950">{value}</p>
      <p className="mt-2 text-xs font-bold leading-5 opacity-80">{helper}</p>
    </article>
  );
}

export function ChartCard({ title, icon: Icon, children, heightClass = 'h-[20rem]' }: { title: string; icon: ElementType; children: ReactNode; heightClass?: string }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-black text-slate-950">{title}</h3>
        </div>
      </div>
      <p className="sr-only">{title} ditampilkan sebagai chart untuk membantu admin membaca pola data.</p>
      <div className={heightClass}>{children}</div>
    </section>
  );
}

export function ActionableVarianceTable({ rows, nameA, nameB }: { rows: MetricRow[]; nameA: string; nameB: string }) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Actionable variance table</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Perbandingan Metrik Detail</h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="sticky left-0 bg-slate-50 p-4">Metrik</th>
              <th className="p-4 text-primary">{nameA}</th>
              <th className="p-4 text-ai">{nameB}</th>
              <th className="p-4 text-right">Delta</th>
              <th className="p-4 text-right">Pemenang</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const Icon = row.icon;
              const delta = row.a - row.b;
              const winner = delta >= 0 ? nameA : nameB;
              return (
                <tr key={row.label} className="hover:bg-slate-50/70">
                  <td className="sticky left-0 bg-white p-4 font-black text-slate-800">
                    <span className="inline-flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      {row.label}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-700">{formatMetric(row.a, row.format)}</td>
                  <td className="p-4 font-bold text-slate-700">{formatMetric(row.b, row.format)}</td>
                  <td className={`p-4 text-right font-black ${delta >= 0 ? 'text-primary' : 'text-ai'}`}>
                    {delta > 0 ? '+' : ''}{formatMetric(delta, row.format)}
                  </td>
                  <td className="p-4 text-right">
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${delta >= 0 ? 'bg-orange-50 text-primary' : 'bg-sky-50 text-ai'}`}>
                      {winner}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <section className="flex min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-200 bg-white p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-primary">
        <GitCompare className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm font-semibold leading-7 text-slate-500">{description}</p>
    </section>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6" aria-label="Memuat compare analytics">
      <div className="h-36 animate-pulse rounded-[1.75rem] bg-orange-100/70" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-32 animate-pulse rounded-[1.5rem] bg-white ring-1 ring-slate-200" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-[1.75rem] bg-white ring-1 ring-slate-200" />
        <div className="h-80 animate-pulse rounded-[1.75rem] bg-white ring-1 ring-slate-200" />
      </div>
    </div>
  );
}

