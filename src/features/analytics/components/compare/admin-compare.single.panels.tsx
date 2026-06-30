import { Activity, AlertTriangle, CheckCircle2, ClipboardList, Gauge, Megaphone, ShieldAlert, Tags, Target, TrendingUp } from 'lucide-react';

import type { Tone } from './admin-compare.types';
import { formatSigned } from './admin-compare.utils';
import type { OperationalSignal, SituationCardItem } from './admin-compare.single.utils';

export type ActionItem = {
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
    <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Kekuatan sinyal</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">{label}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-600">{reviewVolume} review terklasifikasi</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
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
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-warning">Risiko sentimen</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">{label}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-600">Komposisi sentimen untuk prioritas monitoring admin.</p>
        </div>
        <div className="rounded-xl border border-rose-100 bg-white px-4 py-3 text-right">
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

export function SituationOverviewPanel({ cards }: { cards: SituationCardItem[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Gambaran situasi</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Apa kondisi destinasi saat ini?</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            Ringkasan cepat untuk membaca apakah destinasi siap dipromosikan, perlu dipantau, atau butuh validasi lapangan.
          </p>
        </div>
        <Gauge className="h-5 w-5 text-primary" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {cards.map((card) => (
          <SituationCard key={card.label} item={card} />
        ))}
      </div>
    </section>
  );
}

function SituationCard({ item }: { item: SituationCardItem }) {
  const toneClass = {
    blue: 'border-sky-100 bg-sky-50 text-ai',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
  }[item.tone];

  return (
    <article className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{item.label}</p>
      <p className="mt-2 text-xl font-black text-slate-950">{item.value}</p>
      <p className="mt-2 text-sm font-semibold leading-6 opacity-85">{item.helper}</p>
    </article>
  );
}

export function MonthlySituationPanel({
  latestMonth,
  latestVolume,
  positiveRate,
  negativeRate,
  volumeDelta,
  positiveDelta,
  negativeDelta,
}: {
  latestMonth?: string;
  latestVolume: number;
  positiveRate?: number;
  negativeRate?: number;
  volumeDelta: number | null;
  positiveDelta: number | null;
  negativeDelta: number | null;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">Snapshot bulanan</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">{latestMonth || 'Belum ada tren'}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Periode terbaru untuk membaca perubahan situasi dari bulan sebelumnya.</p>
        </div>
        <Activity className="h-5 w-5 text-ai" />
      </div>
      <div className="grid gap-3">
        <MonthlyStat label="Volume ulasan" value={latestMonth ? String(latestVolume) : '-'} delta={volumeDelta === null ? 'Belum cukup data' : formatSigned(volumeDelta)} />
        <MonthlyStat label="Rasio positif" value={positiveRate === undefined ? '-' : `${positiveRate}%`} delta={positiveDelta === null ? 'Belum cukup data' : formatSigned(positiveDelta, '%')} />
        <MonthlyStat label="Rasio negatif" value={negativeRate === undefined ? '-' : `${negativeRate}%`} delta={negativeDelta === null ? 'Belum cukup data' : formatSigned(negativeDelta, '%')} />
      </div>
    </section>
  );
}

function MonthlyStat({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
        <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
      </div>
      <span className="rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm">{delta}</span>
    </div>
  );
}

export function TopicSituationPanel({
  topics,
}: {
  topics: Array<{ name: string; reviews: number; percentage: number }>;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Pembicaraan utama</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Hal yang paling sering dibahas pengunjung</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            Topik ini membantu admin memahami fokus perhatian pengunjung sebelum membaca ulasan satu per satu.
          </p>
        </div>
        <ClipboardList className="h-5 w-5 text-primary" />
      </div>
      {topics.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm font-bold text-slate-500">Belum ada topik detail untuk destinasi ini.</div>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => (
            <div key={topic.name} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="line-clamp-1 font-black text-slate-950">{topic.name}</p>
                <span className="w-fit rounded-lg bg-white px-3 py-1.5 text-xs font-black text-amber-400 shadow-sm">{topic.reviews} ulasan</span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.min(topic.percentage, 100)}%` }} />
                </div>
                <span className="w-12 text-right text-sm font-black text-slate-700">{topic.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function OperationalSignalsPanel({ signals }: { signals: OperationalSignal[] }) {
  const toneClass = {
    blue: 'border-sky-100 bg-sky-50 text-ai',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-warning">Sinyal operasional</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Apa yang bisa ditindaklanjuti?</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Saran ringkas untuk promosi, monitoring, validasi lapangan, dan kelengkapan data.</p>
        </div>
        <Megaphone className="h-5 w-5 text-ai" />
      </div>
      <div className="space-y-3">
        {signals.map((signal) => (
          <article key={signal.label} className={`rounded-xl border p-4 ${toneClass[signal.tone]}`}>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">
                {signal.tone === 'rose' ? <ShieldAlert className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-black text-slate-950">{signal.label}</p>
                  <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-black shadow-sm">{signal.status}</span>
                </div>
                <p className="mt-2 text-sm font-semibold leading-6 opacity-85">{signal.helper}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function TrendDeltaCard({ label, value, delta, tone }: { label: string; value: string; delta: string; tone: Tone }) {
  const toneClass = {
    orange: 'border-orange-100 bg-orange-50 text-primary',
    blue: 'border-sky-100 bg-sky-50 text-blue-600',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
  }[tone];

  return (
    <article className={`rounded-xl border p-4 ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{label}</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
        </div>
        <TrendingUp className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-black">{delta}</p>
      <p className="mt-1 text-xs font-bold opacity-75 ">vs periode sebelumnya</p>
    </article>
  );
}

export function TopicPriorityPanel({ topics }: { topics: Array<{ name: string; Percentage: number }> }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Prioritas topik</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Topik dengan dampak operasional</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Diurutkan dari porsi pembahasan terbesar agar admin tahu area kurasi yang paling terlihat di review.</p>
        </div>
        <Tags className="h-5 w-5 text-primary" />
      </div>
      {topics.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm font-bold text-slate-500">Belum ada topik yang bisa diprioritaskan.</div>
      ) : (
        <div className="space-y-3">
          {topics.map((topic, index) => {
            const priority = topic.Percentage >= 25 ? 'Prioritas tinggi' : topic.Percentage >= 12 ? 'Prioritas sedang' : 'Long-tail';
            return (
              <div key={`${topic.name}-${index}`} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-black text-slate-900">{topic.name}</p>
                  <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-black text-primary shadow-sm">{priority}</span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.min(topic.Percentage, 100)}%` }} />
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
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-400">Checklist tindakan</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Prioritas tindakan admin</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Tindak lanjut dari sinyal analitik.</p>
        </div>
        <Target className="h-5 w-5 text-emerald" />
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className={`rounded-xl border p-4 ${toneClass[item.tone]}`}>
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
