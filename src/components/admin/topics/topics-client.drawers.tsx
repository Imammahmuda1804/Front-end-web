import Link from 'next/link';
import { MessageSquareText, Star, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type {
  TopicDestinationItem,
  TopicItem,
  TopicReviewItem,
  TopicReviewSentiment,
} from '@/services/admin/topic.service';

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

export function TopicReviewsDrawer({
  topic,
  data,
  meta,
  summary,
  loading,
  page,
  sentiment,
  onSentimentChange,
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
  onSentimentChange: (value: TopicReviewSentiment | 'all') => void;
  onPageChange: (page: number) => void;
  onClose: () => void;
}) {
  if (!topic) return null;

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
                Ulasan topik
              </p>
              <h2 className="mt-3 truncate text-2xl font-black text-slate-950">{topic.topic_name}</h2>
              <p className="mt-1 text-sm font-bold text-slate-500">
                {meta?.total ?? 0} ulasan ditemukan untuk inspeksi kualitas taxonomy.
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
                aria-pressed={sentiment === filter.value}
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
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-32 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm font-bold text-slate-500">
              Belum ada ulasan pada filter ini.
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((review) => (
                <article key={review.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Destinasi topic</p>
            <h2 className="mt-1 truncate text-2xl font-black text-slate-950">{topic.topic_name}</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">{meta?.total ?? topic.total_destinations} destinasi terkait</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup daftar destinasi topic" className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm font-bold text-slate-500">
              Belum ada destinasi untuk topik ini.
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((destination) => (
                <article key={destination.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-black text-slate-950">{destination.name}</p>
                      <p className="mt-1 text-sm font-bold text-slate-500">{destination.city || '-'}{destination.province ? `, ${destination.province}` : ''}</p>
                    </div>
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-primary">
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
            <Button type="button" variant="outline" className="rounded-full" disabled={page <= 1 || loading} onClick={() => onPageChange(Math.max(1, page - 1))}>
              Sebelumnya
            </Button>
            <Button type="button" variant="outline" className="rounded-full" disabled={page >= (meta?.total_pages || 1) || loading} onClick={() => onPageChange(page + 1)}>
              Berikutnya
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
