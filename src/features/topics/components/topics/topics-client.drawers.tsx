import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Layers3, MapPin, MessageSquareText, Star, Target, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type {
  TopicDestinationItem,
  TopicItem,
  TopicReviewItem,
  TopicReviewSentiment,
} from '../../services/topic.service';

function formatReviewDate(value?: string | null) {
  if (!value) return 'Tanggal tidak tersedia';
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getSentimentLabel(value?: string | null) {
  const normalized = (value || '').toLowerCase();
  if (normalized === 'positive' || normalized === 'positif') return 'Positif';
  if (normalized === 'negative' || normalized === 'negatif') return 'Negatif';
  if (normalized === 'neutral' || normalized === 'netral') return 'Netral';
  return 'Belum ada';
}

function getSentimentClass(value?: string | null) {
  const normalized = (value || '').toLowerCase();
  if (normalized === 'positive' || normalized === 'positif') return 'border-emerald-100 bg-emerald-50 text-emerald-700';
  if (normalized === 'negative' || normalized === 'negatif') return 'border-rose-100 bg-rose-50 text-rose-700';
  if (normalized === 'neutral' || normalized === 'netral') return 'border-slate-200 bg-slate-50 text-slate-600';
  return 'border-amber-100 bg-amber-50 text-amber-700';
}

function buildTopicNameMap(topics: TopicItem[], topic: TopicItem | null) {
  const map = new Map<number, string>();
  topics.forEach((item) => map.set(item.id, item.topic_name));
  if (topic) map.set(topic.id, topic.topic_name);
  return map;
}

function topicNameFromMap(topicId: number, topicNameMap: Map<number, string>) {
  return topicNameMap.get(topicId) || `Topik #${topicId}`;
}

function getAssignmentTone(isPrimary: boolean, isOpenedTopic: boolean) {
  if (isOpenedTopic) return 'border-orange-200 bg-orange-50 text-primary';
  if (isPrimary) return 'border-sky-100 bg-sky-50 text-ai';
  return 'border-slate-200 bg-white text-slate-600';
}

function sentimentPhrase(value?: string | null) {
  const label = getSentimentLabel(value).toLowerCase();
  if (label === 'positif') return 'bernada positif';
  if (label === 'negatif') return 'bernada negatif';
  if (label === 'netral') return 'bernada netral';
  return 'belum punya arah sentimen yang kuat';
}

function formatTopicList(items: string[]) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} dan ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`;
}

function getDominantSentiment(summary?: { positive: number; neutral: number; negative: number; unknown: number }) {
  if (!summary) return 'Belum ada sentimen dominan';
  const entries = [
    { label: 'Positif', value: summary.positive },
    { label: 'Netral', value: summary.neutral },
    { label: 'Negatif', value: summary.negative },
  ].sort((a, b) => b.value - a.value);
  return entries[0].value > 0 ? `${entries[0].label} paling dominan` : 'Belum ada sentimen dominan';
}

function getSummaryTotal(summary?: { positive: number; neutral: number; negative: number; unknown: number }) {
  if (!summary) return 0;
  return summary.positive + summary.neutral + summary.negative + summary.unknown;
}

function getPercent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function buildAdminTopicReading(
  summary?: { positive: number; neutral: number; negative: number; unknown: number },
) {
  const total = getSummaryTotal(summary);
  if (!summary || total === 0) {
    return {
      tone: 'amber',
      title: 'Data ulasan belum cukup',
      helper: 'Jangan ubah nama, grup, atau visibility topik hanya dari data kosong. Tambahkan ulasan atau pilih destinasi lain untuk melihat bukti.',
      action: 'Kumpulkan contoh ulasan dulu',
    };
  }

  const positivePct = getPercent(summary.positive, total);
  const negativePct = getPercent(summary.negative, total);
  const neutralPct = getPercent(summary.neutral, total);

  if (negativePct >= 45 && negativePct >= positivePct) {
    return {
      tone: 'rose',
      title: 'Topik ini mengarah ke risiko layanan',
      helper: `Sekitar ${negativePct}% ulasan bernada negatif. Prioritaskan membaca contoh ulasan sebelum menggabungkan topik atau menaruhnya di grup positif.`,
      action: 'Audit keluhan dominan',
    };
  }

  if (positivePct >= 50 && positivePct >= negativePct) {
    return {
      tone: 'emerald',
      title: 'Topik ini kuat sebagai sinyal promosi',
      helper: `Sekitar ${positivePct}% ulasan bernada positif. Topik seperti ini cocok dipertahankan sebagai highlight pengalaman wisata.`,
      action: 'Pertahankan label yang jelas',
    };
  }

  if (neutralPct >= 45) {
    return {
      tone: 'slate',
      title: 'Topik ini masih informatif, belum evaluatif',
      helper: `Sekitar ${neutralPct}% ulasan bernada netral. Gunakan contoh ulasan untuk memastikan nama topik tidak terlalu umum.`,
      action: 'Perjelas nama topik',
    };
  }

  return {
    tone: 'amber',
    title: 'Sentimen topik masih campuran',
    helper: 'Topik ini memuat sinyal positif dan negatif yang relatif seimbang. Cocok dibaca manual sebelum digabung atau dipakai sebagai filter utama.',
    action: 'Baca bukti ulasan',
  };
}

function TopicAdminReadingCard({
  summary,
  total,
}: {
  summary?: { positive: number; neutral: number; negative: number; unknown: number };
  total: number;
}) {
  const reading = buildAdminTopicReading(summary);
  const sentimentTotal = getSummaryTotal(summary);
  const cards = [
    {
      label: 'Positif',
      value: summary?.positive || 0,
      pct: getPercent(summary?.positive || 0, sentimentTotal),
      className: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Netral',
      value: summary?.neutral || 0,
      pct: getPercent(summary?.neutral || 0, sentimentTotal),
      className: 'border-slate-200 bg-white text-slate-700',
    },
    {
      label: 'Negatif',
      value: summary?.negative || 0,
      pct: getPercent(summary?.negative || 0, sentimentTotal),
      className: 'border-rose-100 bg-rose-50 text-rose-700',
    },
  ];
  const toneClass = reading.tone === 'rose'
    ? 'border-rose-200 bg-rose-50 text-rose-700'
    : reading.tone === 'emerald'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : reading.tone === 'slate'
        ? 'border-slate-200 bg-slate-50 text-slate-700'
        : 'border-amber-200 bg-amber-50 text-amber-700';
  const Icon = reading.tone === 'rose' ? AlertTriangle : CheckCircle2;

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        <div className={`rounded-lg border p-3 lg:w-64 ${toneClass}`}>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em]">
            <Icon className="h-4 w-4" />
            Pembacaan cepat
          </div>
          <p className="mt-2 text-sm font-black leading-5">{reading.title}</p>
          <p className="mt-2 text-xs font-bold leading-5 opacity-80">{reading.helper}</p>
          <p className="mt-3 rounded-md bg-white/70 px-2 py-1.5 text-xs font-black">{reading.action}</p>
        </div>

        <div className="grid flex-1 gap-2 sm:grid-cols-3">
          {cards.map((card) => (
            <div key={card.label} className={`rounded-lg border p-3 ${card.className}`}>
              <p className="text-[11px] font-black uppercase tracking-[0.12em] opacity-70">{card.label}</p>
              <div className="mt-2 flex items-end justify-between gap-2">
                <p className="text-2xl font-black">{card.value}</p>
                <p className="text-xs font-black">{card.pct}%</p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/70">
                <div className="h-full rounded-full bg-current" style={{ width: `${Math.max(4, card.pct)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
        Angka ini berasal dari {total} ulasan pada filter aktif. Gunakan sebagai petunjuk kerja, lalu baca contoh ulasan untuk keputusan rename, merge, dan pengelompokan.
      </p>
    </div>
  );
}

function ReviewTopicInsight({
  review,
  topic,
  topicNameMap,
}: {
  review: TopicReviewItem;
  topic: TopicItem;
  topicNameMap: Map<number, string>;
}) {
  const assignments = review.topic_assignments || [];
  if (assignments.length === 0) return null;

  const primary = assignments.find((assignment) => assignment.isPrimary) || assignments[0];
  const selectedAssignment = assignments.find((assignment) => assignment.topicId === topic.id);
  const supporting = assignments.filter((assignment) => assignment.topicId !== primary.topicId).slice(0, 5);
  const primaryName = topicNameFromMap(primary.topicId, topicNameMap);
  const primaryScore = Math.round(Math.max(0, Math.min(primary.score || 0, 1)) * 100);
  const supportingNames = supporting.map((assignment) => topicNameFromMap(assignment.topicId, topicNameMap));
  const sentiment = sentimentPhrase(review.sentiment);
  const meaning = supportingNames.length > 0
    ? `Ulasan ini ${sentiment}, fokus utamanya ${primaryName}, dan ikut menyinggung ${formatTopicList(supportingNames.slice(0, 3))}.`
    : `Ulasan ini ${sentiment} dan fokus utamanya ${primaryName}.`;
  const adminValue = selectedAssignment
    ? 'Cocok untuk memeriksa apakah pembahasan ini sudah tepat pada ulasan asli.'
    : 'Cocok untuk membaca konteks ulasan sebelum mengubah nama, kelompok, atau visibility topik.';

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/85 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-100 bg-white px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-ai">
          <Target className="h-3 w-3" />
          Hal paling terasa
        </span>
        <span
          className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-black text-primary"
          title={`Confidence ${primaryScore}%. Metode: ${primary.assignmentMethod}`}
        >
          <span className="truncate">{primaryName}</span>
          <span className="text-[10px] opacity-75">{primaryScore}%</span>
        </span>
        {selectedAssignment && selectedAssignment.topicId !== primary.topicId ? (
          <span className="inline-flex max-w-full items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-700">
            Relevan dengan topik dibuka: <span className="truncate">{topic.topic_name}</span>
          </span>
        ) : null}
      </div>

      {supporting.length > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
            <Layers3 className="h-3 w-3" />
            Catatan pendukung
          </span>
          {supporting.map((assignment) => {
            const score = Math.round(Math.max(0, Math.min(assignment.score || 0, 1)) * 100);
            const label = topicNameFromMap(assignment.topicId, topicNameMap);
            return (
              <span
                key={`${review.id}-${assignment.topicId}`}
                className={`inline-flex max-w-full items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-bold ${getAssignmentTone(assignment.isPrimary, assignment.topicId === topic.id)}`}
                title={`Confidence ${score}%. Metode: ${assignment.assignmentMethod}`}
              >
                <span className="truncate">{label}</span>
                <span className="opacity-70">{score}%</span>
              </span>
            );
          })}
        </div>
      ) : null}

      <div className="mt-2 rounded-md border border-slate-100 bg-white px-3 py-2">
        <p className="text-xs font-bold leading-5 text-slate-700">{meaning}</p>
        <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-500">{adminValue}</p>
      </div>
    </div>
  );
}

export function TopicReviewsDrawer({
  topic,
  data,
  meta,
  summary,
  loading,
  page,
  sentiment,
  destinationId,
  destinations,
  destinationsLoading,
  topics,
  onSentimentChange,
  onDestinationChange,
  onPageChange,
  onClose,
}: {
  topic: TopicItem | null;
  data: TopicReviewItem[];
  meta?: { page: number; limit: number; total: number; total_pages: number };
  summary?: { positive: number; neutral: number; negative: number; unknown: number };
  loading: boolean;
  page: number;
  sentiment: TopicReviewSentiment | 'all';
  destinationId: number | 'all';
  destinations: TopicDestinationItem[];
  destinationsLoading: boolean;
  topics: TopicItem[];
  onSentimentChange: (value: TopicReviewSentiment | 'all') => void;
  onDestinationChange: (value: number | 'all') => void;
  onPageChange: (page: number) => void;
  onClose: () => void;
}) {
  if (!topic) return null;
  const topicNameMap = buildTopicNameMap(topics, topic);
  const selectedDestination = destinationId === 'all'
    ? null
    : destinations.find((destination) => destination.id === destinationId);
  const filterContext = selectedDestination
    ? `Dibatasi ke ${selectedDestination.name}${selectedDestination.city ? `, ${selectedDestination.city}` : ''}`
    : 'Menampilkan semua destinasi yang memuat topik ini';
  const sentimentContext = sentiment === 'all'
    ? getDominantSentiment(summary)
    : `Filter sentimen aktif: ${getSentimentLabel(sentiment)}`;

  const filters: Array<{ value: TopicReviewSentiment | 'all'; label: string; count: number }> = [
    { value: 'all', label: 'Semua', count: meta?.total || 0 },
    { value: 'positive', label: 'Positif', count: summary?.positive || 0 },
    { value: 'neutral', label: 'Netral', count: summary?.neutral || 0 },
    { value: 'negative', label: 'Negatif', count: summary?.negative || 0 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/30">
      <aside className="ml-auto flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-primary">
                <MessageSquareText className="h-4 w-4" />
                Ulasan pembahasan
              </p>
              <h2 className="mt-3 truncate text-2xl font-black text-slate-950">{topic.topic_name}</h2>
              <p className="mt-1 text-sm font-bold text-slate-500">
                {meta?.total ?? 0} ulasan ditemukan untuk membaca konteks topik dan dampaknya ke destinasi.
              </p>
            </div>
            <button type="button" onClick={onClose} aria-label="Tutup daftar ulasan topik" className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={sentiment === filter.value ? "true" : "false"}
                onClick={() => onSentimentChange(filter.value)}
                className={`rounded-lg border px-3 py-2 text-left text-xs font-black transition ${
                  sentiment === filter.value
                    ? 'border-primary bg-orange-50 text-primary'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200'
                }`}
              >
                <span className="block">{filter.label}</span>
                <span className="mt-1 block text-lg text-slate-950">{filter.count}</span>
              </button>
            ))}
          </div>

          <label className="mt-4 block">
            <span className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              Filter destinasi
            </span>
            <select
              value={destinationId}
              onChange={(event) => {
                const value = event.target.value;
                onDestinationChange(value === 'all' ? 'all' : Number(value));
              }}
              disabled={destinationsLoading}
              className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:cursor-wait disabled:bg-slate-50"
            >
              <option value="all">Semua destinasi yang membahas ini</option>
              {destinations.map((destination) => (
                <option key={destination.id} value={destination.id}>
                  {destination.name}{destination.city ? `, ${destination.city}` : ''}
                </option>
              ))}
            </select>
          </label>

          <TopicAdminReadingCard summary={summary} total={meta?.total ?? 0} />

          <div className="mt-4 grid gap-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Cakupan baca</p>
              <p className="mt-1 text-sm font-black leading-5 text-slate-800">{filterContext}</p>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Arah sentimen</p>
              <p className="mt-1 text-sm font-black leading-5 text-slate-800">{sentimentContext}</p>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Untuk keputusan admin</p>
              <p className="mt-1 text-sm font-black leading-5 text-slate-800">
                Pakai ulasan ini untuk validasi nama topik, kelompok, dan dampaknya ke destinasi.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-32 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm font-bold text-slate-500">
              Belum ada ulasan pada filter ini.
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((review) => (
                <article key={review.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-black text-slate-950">{review.reviewer_name || 'Reviewer'}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {formatReviewDate(review.review_date)} - {review.destination?.city || '-'}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <span className={`rounded-lg border px-2.5 py-1 text-xs font-black ${getSentimentClass(review.sentiment)}`}>
                        {getSentimentLabel(review.sentiment)}
                      </span>
                      {review.rating ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {review.rating}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-4 text-sm font-semibold leading-7 text-slate-600">
                    {review.review_text || 'Teks ulasan tidak tersedia.'}
                  </p>
                  <ReviewTopicInsight review={review} topic={topic} topicNameMap={topicNameMap} />
                  {review.destination?.slug ? (
                    <Link href={`/destinations/${review.destination.slug}`} className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-slate-200 px-3 text-xs font-black text-slate-700 transition hover:border-primary hover:text-primary">
                      {review.destination.name}
                    </Link>
                  ) : (
                    <p className="mt-4 text-xs font-black text-slate-500">{review.destination?.name || 'Destinasi'}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-5">
          <p className="text-sm font-bold text-slate-500">Halaman {page} dari {meta?.total_pages || 1}</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="rounded-lg" disabled={page <= 1 || loading} onClick={() => onPageChange(Math.max(1, page - 1))}>
              Sebelumnya
            </Button>
            <Button type="button" variant="outline" className="rounded-lg" disabled={page >= (meta?.total_pages || 1) || loading} onClick={() => onPageChange(page + 1)}>
              Berikutnya
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function TopicDestinationsDrawer({
  topic,
  data,
  meta,
  loading,
  page,
  onPageChange,
  onClose,
}: {
  topic: TopicItem | null;
  data: TopicDestinationItem[];
  meta?: { page: number; limit: number; total: number; total_pages: number };
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onClose: () => void;
}) {
  if (!topic) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/30">
      <aside className="ml-auto flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Destinasi yang membahas ini</p>
            <h2 className="mt-1 truncate text-2xl font-black text-slate-950">{topic.topic_name}</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">{meta?.total ?? topic.total_destinations} destinasi terkait</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup daftar destinasi topik" className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm font-bold text-slate-500">
              Belum ada destinasi untuk topik ini.
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((destination) => (
                <article key={destination.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-black text-slate-950">{destination.name}</p>
                      <p className="mt-1 text-sm font-bold text-slate-500">{destination.city || '-'}{destination.province ? `, ${destination.province}` : ''}</p>
                    </div>
                    <span className="rounded-md bg-orange-50 px-3 py-1 text-xs font-black text-primary">
                      {destination.total_reviews_in_topic || 0} review
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-5">
          <p className="text-sm font-bold text-slate-500">Halaman {page} dari {meta?.total_pages || 1}</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="rounded-lg" disabled={page <= 1 || loading} onClick={() => onPageChange(Math.max(1, page - 1))}>
              Sebelumnya
            </Button>
            <Button type="button" variant="outline" className="rounded-lg" disabled={page >= (meta?.total_pages || 1) || loading} onClick={() => onPageChange(page + 1)}>
              Berikutnya
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
