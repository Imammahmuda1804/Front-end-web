import { AlertTriangle, BarChart2, CheckCircle2, FileDown, Heart, Star, Tags, Target, ThumbsUp, TrendingUp } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { DestinationAnalytics, TopicData } from '@/services/admin/analytics.service';
import type { Tone } from './CompareClient';
import { cleanTopicName, CustomTooltip, DEST_A_COLOR, SENTIMENT_COLORS, formatSigned, percent, sentimentRate, sentimentTotal } from './CompareClient';
import { ChartCard, EmptyState, MetricCard } from './admin-compare.result';
export function SingleAnalysisView({
  data,
  pieData,
  trendData,
  topicData,
  topics,
  completeness,
  onExport,
}: {
  data: DestinationAnalytics | null;
  pieData: Array<{ name: string; value: number }>;
  trendData: Array<{ name: string; Positif: number; Netral: number; Negatif: number; PosRate: number }>;
  topicData: Array<{ name: string; Percentage: number }>;
  topics: TopicData[];
  completeness: number;
  onExport: () => void;
}) {
  if (!data) {
    return <EmptyState title="Pilih destinasi untuk dianalisis" description="Dashboard analitik tunggal akan muncul setelah destinasi dipilih." />;
  }

  const totalReviews = sentimentTotal(data);
  const negativeRatio = totalReviews > 0 ? Math.round(((data.sentiment.negative || 0) / totalReviews) * 100) : 0;
  const neutralRatio = totalReviews > 0 ? Math.round(((data.sentiment.neutral || 0) / totalReviews) * 100) : 0;
  const latestTrend = trendData.at(-1);
  const previousTrend = trendData.at(-2);
  const latestVolume = latestTrend ? latestTrend.Positif + latestTrend.Netral + latestTrend.Negatif : 0;
  const previousVolume = previousTrend ? previousTrend.Positif + previousTrend.Netral + previousTrend.Negatif : 0;
  const trendDelta = latestTrend && previousTrend ? latestTrend.PosRate - previousTrend.PosRate : 0;
  const volumeDelta = latestTrend && previousTrend ? latestVolume - previousVolume : 0;
  const negativeLatestRate = latestTrend && latestVolume > 0 ? Math.round((latestTrend.Negatif / latestVolume) * 100) : 0;
  const negativePreviousRate = previousTrend && previousVolume > 0 ? Math.round((previousTrend.Negatif / previousVolume) * 100) : 0;
  const negativeDelta = latestTrend && previousTrend ? negativeLatestRate - negativePreviousRate : 0;
  const healthLabel = completeness >= 80 ? 'Sinyal kuat' : completeness >= 60 ? 'Cukup terbaca' : 'Data terbatas';
  const riskLabel = negativeRatio >= 25 ? 'Risiko tinggi' : negativeRatio >= 12 ? 'Perlu dipantau' : 'Risiko rendah';
  const priorityTopics = topicData.slice(0, 5);
  const actionItems = [
    {
      label: riskLabel === 'Risiko tinggi' ? 'Audit review negatif terbaru' : 'Pantau sentimen negatif',
      helper: `${negativeRatio}% ulasan bernada negatif dari data terklasifikasi.`,
      tone: riskLabel === 'Risiko tinggi' ? 'rose' : 'amber',
      done: riskLabel === 'Risiko rendah',
    },
    {
      label: topics.length > 0 ? `Validasi topik: ${cleanTopicName(topics[0].topic_name)}` : 'Lengkapi pemetaan topik',
      helper: topics.length > 0 ? 'Topik dominan bisa dipakai untuk prioritas konten dan kurasi.' : 'Belum ada topik untuk membantu membaca pola ulasan.',
      tone: topics.length > 0 ? 'blue' : 'amber',
      done: topics.length > 0,
    },
    {
      label: trendData.length > 1 ? 'Review perubahan tren bulanan' : 'Kumpulkan tren bulanan',
      helper: trendData.length > 1 ? `Rasio positif bulan terakhir ${formatSigned(trendDelta, '%')} dari periode sebelumnya.` : 'Butuh minimal dua periode agar delta tren lebih bermakna.',
      tone: trendDelta < 0 ? 'rose' : 'emerald',
      done: trendData.length > 1 && trendDelta >= 0,
    },
    {
      label: completeness >= 80 ? 'Data siap untuk keputusan admin' : 'Perkuat kelengkapan data',
      helper: `Kelengkapan sinyal saat ini ${completeness}%.`,
      tone: completeness >= 80 ? 'emerald' : 'amber',
      done: completeness >= 80,
    },
  ] satisfies ActionItem[];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Rasio Positif" value={`${percent(data.positive_ratio)}%`} helper="Dari seluruh ulasan" icon={Heart} tone="emerald" />
        <MetricCard label="Rating User" value={(data.rating.user || 0).toFixed(1)} helper="Skala 1-5" icon={Star} tone="amber" />
        <MetricCard label="Skor AI" value={(data.recommendation_score || 0).toFixed(2)} helper="Sinyal rekomendasi" icon={ThumbsUp} tone="orange" />
        <MetricCard label="Volume Ulasan" value={String(sentimentTotal(data))} helper="Terklasifikasi" icon={BarChart2} tone="blue" />
        <MetricCard label="Kelengkapan" value={`${completeness}%`} helper="Tren, topik, rating" icon={CheckCircle2} tone="slate" />
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Single destination cockpit</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{data.name}</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
              Ringkasan operasional untuk membaca kesehatan sinyal, risiko sentimen, perubahan tren, dan topik yang paling layak diprioritaskan.
            </p>
          </div>
          <button onClick={onExport} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-black text-white transition-colors hover:bg-primary/90">
            <FileDown className="h-4 w-4" />
            Ekspor CSV
          </button>
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]">
          <SignalHealthPanel
            completeness={completeness}
            label={healthLabel}
            hasRating={Boolean(data.rating.google || data.rating.user)}
            hasTrends={trendData.length > 0}
            hasTopics={topics.length > 0}
            reviewVolume={totalReviews}
          />
          <SentimentRiskPanel
            positiveRatio={sentimentRate(data)}
            neutralRatio={neutralRatio}
            negativeRatio={negativeRatio}
            label={riskLabel}
          />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <TrendDeltaCard label="Rasio positif" value={latestTrend ? `${latestTrend.PosRate}%` : '-'} delta={trendData.length > 1 ? formatSigned(trendDelta, '%') : 'Belum cukup data'} tone={trendDelta < 0 ? 'rose' : 'emerald'} />
          <TrendDeltaCard label="Volume review" value={latestTrend ? String(latestVolume) : '-'} delta={trendData.length > 1 ? formatSigned(volumeDelta) : 'Belum cukup data'} tone={volumeDelta < 0 ? 'amber' : 'blue'} />
          <TrendDeltaCard label="Rasio negatif" value={latestTrend ? `${negativeLatestRate}%` : '-'} delta={trendData.length > 1 ? formatSigned(negativeDelta, '%') : 'Belum cukup data'} tone={negativeDelta > 0 ? 'rose' : 'emerald'} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <TopicPriorityPanel topics={priorityTopics} />
        <AdminActionChecklist items={actionItems} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(18rem,0.6fr)_minmax(0,1.4fr)]">
        <ChartCard title="Distribusi Sentimen" icon={Heart}>
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={68} outerRadius={92} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => <Cell key={entry.name} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Topik Teratas" icon={Tags}>
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={topicData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 123, 84, 0.08)' }} />
              <Bar dataKey="Percentage" name="Persentase" fill={DEST_A_COLOR} radius={[8, 8, 0, 0]} barSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Tren Sentimen Bulanan" icon={TrendingUp} heightClass="h-[22rem]">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <AreaChart data={trendData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="adminSingleTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="PosRate" name="Rasio Positif" stroke="#10b981" strokeWidth={3} fill="url(#adminSingleTrend)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

type ActionItem = {
  label: string;
  helper: string;
  tone: Extract<Tone, 'blue' | 'emerald' | 'amber' | 'rose'>;
  done: boolean;
};

export function SignalHealthPanel({
  completeness,
  label,
  hasRating,
  hasTrends,
  hasTopics,
  reviewVolume,
}: {
  completeness: number;
  label: string;
  hasRating: boolean;
  hasTrends: boolean;
  hasTopics: boolean;
  reviewVolume: number;
}) {
  const checks = [
    { label: 'Rating', active: hasRating },
    { label: 'Tren', active: hasTrends },
    { label: 'Topik', active: hasTopics },
    { label: 'Review', active: reviewVolume > 0 },
  ];

  return (
    <div className="rounded-[1.5rem] border border-orange-100 bg-orange-50/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Signal health</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">{label}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-600">{reviewVolume} review terklasifikasi</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
          <CheckCircle2 className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-primary" style={{ width: `${completeness}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {checks.map((check) => (
          <span
            key={check.label}
            className={`inline-flex min-h-10 items-center justify-center rounded-full border px-3 text-xs font-black ${
              check.active ? 'border-emerald-100 bg-white text-emerald-700' : 'border-amber-100 bg-white text-amber-700'
            }`}
          >
            {check.label}: {check.active ? 'Ada' : 'Kosong'}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SentimentRiskPanel({
  positiveRatio,
  neutralRatio,
  negativeRatio,
  label,
}: {
  positiveRatio: number;
  neutralRatio: number;
  negativeRatio: number;
  label: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Sentiment risk</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">{label}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-600">Komposisi sentimen untuk prioritas monitoring admin.</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-white px-4 py-3 text-right">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-500">Negatif</p>
          <p className="text-2xl font-black text-slate-950">{negativeRatio}%</p>
        </div>
      </div>
      <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
        <div className="bg-emerald-500" style={{ width: `${positiveRatio}%` }} />
        <div className="bg-slate-300" style={{ width: `${neutralRatio}%` }} />
        <div className="bg-rose-500" style={{ width: `${negativeRatio}%` }} />
      </div>
      <div className="mt-4 grid gap-2 text-xs font-black sm:grid-cols-3">
        <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700">Positif {positiveRatio}%</span>
        <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-600">Netral {neutralRatio}%</span>
        <span className="rounded-full bg-rose-50 px-3 py-2 text-rose-700">Negatif {negativeRatio}%</span>
      </div>
    </div>
  );
}

export function TrendDeltaCard({ label, value, delta, tone }: { label: string; value: string; delta: string; tone: Tone }) {
  const toneClass = {
    orange: 'border-orange-100 bg-orange-50 text-primary',
    blue: 'border-sky-100 bg-sky-50 text-ai',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
  }[tone];

  return (
    <article className={`rounded-[1.35rem] border p-4 ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{label}</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
        </div>
        <TrendingUp className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-black">{delta}</p>
      <p className="mt-1 text-xs font-bold opacity-75">vs periode sebelumnya</p>
    </article>
  );
}

export function TopicPriorityPanel({ topics }: { topics: Array<{ name: string; Percentage: number }> }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Topic priority</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Topik dengan dampak operasional</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Diurutkan dari porsi pembahasan terbesar agar admin tahu area kurasi yang paling terlihat di review.</p>
        </div>
        <Tags className="h-5 w-5 text-primary" />
      </div>
      {topics.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm font-bold text-slate-500">Belum ada topik yang bisa diprioritaskan.</div>
      ) : (
        <div className="space-y-3">
          {topics.map((topic, index) => {
            const priority = topic.Percentage >= 25 ? 'Prioritas tinggi' : topic.Percentage >= 12 ? 'Prioritas sedang' : 'Long-tail';
            return (
              <div key={`${topic.name}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-black text-slate-900">{topic.name}</p>
                  <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-black text-primary shadow-sm">{priority}</span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(topic.Percentage, 100)}%` }} />
                  </div>
                  <span className="w-12 text-right text-sm font-black text-slate-700">{topic.Percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function AdminActionChecklist({ items }: { items: ActionItem[] }) {
  const toneClass = {
    blue: 'border-sky-100 bg-sky-50 text-ai',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
  };

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Action checklist</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Prioritas tindakan admin</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Checklist ini merangkum tindak lanjut yang paling masuk akal dari sinyal analitik tunggal.</p>
        </div>
        <Target className="h-5 w-5 text-ai" />
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className={`rounded-2xl border p-4 ${toneClass[item.tone]}`}>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
                {item.done ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              </span>
              <div>
                <p className="font-black text-slate-950">{item.label}</p>
                <p className="mt-1 text-sm font-semibold leading-6 opacity-80">{item.helper}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


