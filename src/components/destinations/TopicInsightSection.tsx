'use client';

import * as React from 'react';
import { useCallback, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Hash,
  Loader2,
  MessageSquare,
  Minus,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

import type { FineTopicDetail, SentimentBreakdown, TopicData, TopicGroupData, TopicReview } from './topic-insight.types';
import {
  API_BASE,
  cleanTopicName,
  getSentimentBucket,
  getSentimentColor,
  getSentimentCrowd,
  getSentimentPercentages,
} from './topic-insight.utils';

dayjs.locale('id');

interface Props {
  destinationId: number;
  topics: TopicData[];
  sentimentBreakdown: Record<number, SentimentBreakdown>;
  topicGroups?: TopicGroupData[];
}

function highlightKeywords(text: string, keywords: string[]): React.ReactNode {
  if (!keywords || keywords.length === 0) return text;
  const escaped = keywords.map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (regex.test(part)) {
      return <mark key={i} className="rounded bg-primary/15 px-0.5 font-bold text-primary">{part}</mark>;
    }
    return part;
  });
}

function SentimentDot({ sentiment }: { sentiment: string | null }) {
  const normalized = (sentiment || '').toLowerCase();
  if (normalized === 'positive' || normalized === 'positif') return <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" title="Positif" />;
  if (normalized === 'negative' || normalized === 'negatif') return <span className="inline-block h-2 w-2 rounded-full bg-red-500" title="Negatif" />;
  return <span className="inline-block h-2 w-2 rounded-full bg-amber-400" title="Netral" />;
}

export default function TopicInsightSection({ destinationId, topics, sentimentBreakdown, topicGroups }: Props) {
  const [expandedTopicId, setExpandedTopicId] = useState<number | null>(null);
  const [topicReviews, setTopicReviews] = useState<TopicReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewMeta, setReviewMeta] = useState<{ total: number; page: number; totalPages: number } | null>(null);
  const [activeKeywords, setActiveKeywords] = useState<string[]>([]);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const reduceMotion = useReducedMotion();

  const loadReviews = useCallback(async (topicId: number, page = 1, mode: 'topic' | 'group' = 'topic') => {
    setLoading(true);
    try {
      const endpoint = mode === 'group'
        ? `${API_BASE}/api/destinations/${destinationId}/reviews-by-topic-group?groupId=${topicId}&page=${page}&limit=5`
        : `${API_BASE}/api/destinations/${destinationId}/reviews-by-topic?topicId=${topicId}&page=${page}&limit=5`;
      const res = await fetch(endpoint);
      const json = await res.json();
      const reviews = Array.isArray(json.data) ? json.data : [];
      const meta = json.meta || null;
      if (page === 1) {
        setTopicReviews(reviews);
      } else {
        setTopicReviews((prev) => [...prev, ...reviews]);
      }
      setReviewMeta(meta);
    } catch (error: unknown) {
      console.error('Failed to load topic reviews', error);
    } finally {
      setLoading(false);
    }
  }, [destinationId]);

  const handleTopicClick = useCallback((topicId: number, keywords: string[] | null, mode: 'topic' | 'group' = 'topic') => {
    if (expandedTopicId === topicId) {
      setExpandedTopicId(null);
      setTopicReviews([]);
      setReviewMeta(null);
      return;
    }

    setExpandedTopicId(topicId);
    setActiveKeywords(keywords || []);
    loadReviews(topicId, 1, mode);
  }, [expandedTopicId, loadReviews]);

  const groupedTopics: TopicData[] = (topicGroups || []).map((group) => ({
    id: group.groupId,
    totalReviews: group.totalReviews,
    topic: {
      id: group.groupId,
      topicName: group.groupName,
      keywords: group.topics.map((topic) => cleanTopicName(topic.topicName)),
    },
    isGroup: true,
    fineTopics: group.topics,
    groupSentimentBreakdown: group.sentimentBreakdown,
  }));

  const sorted = (groupedTopics.length > 0 ? groupedTopics : topics)
    .sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0));
  const fineTopicDetails: FineTopicDetail[] = topicGroups?.length
    ? topicGroups.flatMap((group) =>
      group.topics.map((topic) => ({
        id: topic.id,
        topicName: topic.topicName,
        totalReviews: topic.totalReviews,
        groupName: group.groupName,
      })),
    )
    : topics.map((item) => ({
      id: item.topic.id,
      topicName: item.topic.topicName,
      totalReviews: item.totalReviews,
  }));
  const sortedFineTopics = fineTopicDetails.sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0));
  const detailPreview = sortedFineTopics.slice(0, 10);
  const sentimentClouds = [
    {
      id: 'positive',
      title: 'Condong positif',
      description: 'Topik kecil yang paling banyak dibaca sebagai pengalaman baik.',
      icon: ThumbsUp,
      shell: 'border-emerald-100 bg-emerald-50/70',
      chip: 'border-emerald-100 bg-white text-emerald-700',
      topics: detailPreview.filter((topic) => getSentimentBucket(sentimentBreakdown[topic.id]) === 'positive'),
    },
    {
      id: 'mixed',
      title: 'Netral / campuran',
      description: 'Topik dengan opini seimbang atau belum cukup kuat arahnya.',
      icon: Minus,
      shell: 'border-amber-100 bg-amber-50/70',
      chip: 'border-amber-100 bg-white text-amber-700',
      topics: detailPreview.filter((topic) => getSentimentBucket(sentimentBreakdown[topic.id]) === 'mixed'),
    },
    {
      id: 'negative',
      title: 'Condong negatif',
      description: 'Topik kecil yang perlu dibaca lebih hati-hati sebelum berkunjung.',
      icon: ThumbsDown,
      shell: 'border-red-100 bg-red-50/70',
      chip: 'border-red-100 bg-white text-red-600',
      topics: detailPreview.filter((topic) => getSentimentBucket(sentimentBreakdown[topic.id]) === 'negative'),
    },
  ];

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
        <Hash className="mx-auto mb-3 h-10 w-10 text-slate-300" />
        <p className="font-bold text-slate-500">Belum ada topik yang teridentifikasi dari ulasan.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-ai">
            <Sparkles className="h-3.5 w-3.5" />
            Peta Topik
          </div>
          <h3 className="text-2xl font-black tracking-tight text-slate-950">Peta vibe dari ulasan</h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">Klik topik untuk membaca contoh ulasan yang membentuk sentimen.</p>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">Cloud sentimen topik detail</h4>
            <p className="mt-1 text-sm font-semibold text-slate-600">Topik kecil dipecah menjadi tiga arah sentimen, terpisah dari topic group utama.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-black text-ai">
            <Sparkles className="h-3.5 w-3.5" />
            Fine topics
          </span>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {sentimentClouds.map((bucket) => {
            const BucketIcon = bucket.icon;

            return (
              <section key={bucket.id} className={`min-h-44 rounded-lg border p-3 ${bucket.shell}`}>
                <div className="mb-3 flex items-start gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                    <BucketIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-950">{bucket.title}</h5>
                    <p className="mt-1 text-xs font-bold leading-5 text-slate-600">{bucket.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {bucket.topics.length > 0 ? bucket.topics.map((topic) => {
                    const percentages = getSentimentPercentages(sentimentBreakdown[topic.id]);
                    const topicLabel = cleanTopicName(topic.topicName);
                    return (
                      <span
                        key={`${bucket.id}-${topic.id}`}
                        className={`max-w-full truncate rounded-lg border px-2.5 py-1.5 text-[11px] font-black ${bucket.chip}`}
                        title={`${topicLabel}: ${percentages.positive}% positif, ${percentages.neutral}% netral, ${percentages.negative}% negatif`}
                      >
                        {topicLabel}
                        <span className="ml-1 font-bold opacity-70">({topic.totalReviews || 0})</span>
                      </span>
                    );
                  }) : (
                    <span className="rounded-lg border border-white/70 bg-white/70 px-2.5 py-1.5 text-[11px] font-black text-slate-500">
                      Tidak ada topik
                    </span>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <div className="hidden">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">Arah sentimen topik detail</h4>
            <p className="mt-1 text-sm font-semibold text-slate-600">Topik kecil di dalam group, dipisahkan dari kartu topic group di bawah.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-black text-ai">
            <Sparkles className="h-3.5 w-3.5" />
            Detail sentiment
          </span>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          {detailPreview.map((topic) => {
            const breakdown = sentimentBreakdown[topic.id];
            const percentages = getSentimentPercentages(breakdown);
            const crowd = getSentimentCrowd(breakdown);
            const CrowdIcon = crowd.icon;
            const topicLabel = cleanTopicName(topic.topicName);

            return (
              <div key={`topic-detail-${topic.id}`} className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950" title={topicLabel}>{topicLabel}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {topic.groupName ? `${topic.groupName} • ` : ''}{topic.totalReviews || 0} ulasan terkait
                    </p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-black ${crowd.tone}`}>
                    <CrowdIcon className="h-3 w-3" />
                    {crowd.label}
                  </span>
                </div>
                <div
                  className="mt-3 h-2 overflow-hidden rounded-full bg-white"
                  role="img"
                  aria-label={`${topicLabel}: ${percentages.positive}% positif, ${percentages.neutral}% netral, ${percentages.negative}% negatif`}
                >
                  <div className="flex h-full w-full">
                    <span className="bg-emerald-500" style={{ width: `${percentages.positive}%` }} />
                    <span className="bg-slate-400" style={{ width: `${percentages.neutral}%` }} />
                    <span className="bg-red-500" style={{ width: `${percentages.negative}%` }} />
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-[11px] font-black">
                  <span className="text-emerald-600">{percentages.positive}% positif</span>
                  <span className="text-slate-500">{percentages.neutral}% netral</span>
                  <span className="text-red-500">{percentages.negative}% negatif</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h4 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">Topic group utama</h4>
          <p className="mt-1 text-sm font-semibold text-slate-600">Kartu group di bawah bisa diklik untuk membuka contoh ulasan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(showAllTopics ? sorted : sorted.slice(0, 4)).map((dt) => {
          const breakdown = dt.groupSentimentBreakdown || sentimentBreakdown[dt.topic.id];
          const sentiment = getSentimentColor(breakdown);
          const percentages = getSentimentPercentages(breakdown);
          const SentimentIcon = sentiment.icon;
          const isExpanded = expandedTopicId === dt.topic.id;
          const topicLabel = cleanTopicName(dt.topic.topicName);

          return (
            <React.Fragment key={dt.id}>
              <button
                type="button"
                onClick={() => handleTopicClick(dt.topic.id, dt.topic.keywords, dt.isGroup ? 'group' : 'topic')}
                aria-expanded={isExpanded}
                className={`group w-full cursor-pointer rounded-xl border p-5 text-left transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/15 ${
                  isExpanded
                    ? 'border-orange-200 bg-orange-50/70 shadow-sm shadow-orange-100/60'
                    : 'border-slate-200 bg-slate-50/70 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-white hover:shadow-sm'
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <span className="line-clamp-2 text-base font-black leading-snug text-slate-950">{topicLabel}</span>
                  <div className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-black ${sentiment.bg} ${sentiment.text} ${sentiment.border}`}>
                    <SentimentIcon className="h-3 w-3" />
                    <span className="hidden sm:inline">{sentiment.label}</span>
                  </div>
                </div>

                {dt.isGroup && dt.fineTopics && dt.fineTopics.length > 0 && (
                  <div className="mb-4 flex min-w-0 flex-wrap items-center gap-1.5">
                    {dt.fineTopics.slice(0, 3).map((topic) => (
                      <span key={topic.id} className="max-w-full truncate rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-extrabold text-ai ring-1 ring-sky-100">
                        {cleanTopicName(topic.topicName)}
                      </span>
                    ))}
                    {dt.fineTopics.length > 3 && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">
                        +{dt.fineTopics.length - 3} topik
                      </span>
                    )}
                  </div>
                )}

                {!dt.isGroup && dt.topic.keywords && dt.topic.keywords.length > 0 && (
                  <p className="mb-4 line-clamp-1 text-xs font-semibold text-slate-500">
                    Kata kunci: {dt.topic.keywords.slice(0, 3).join(', ')}
                  </p>
                )}

                <div
                  className="mb-3 h-2 overflow-hidden rounded-full bg-slate-200"
                  role="img"
                  aria-label={`Sentimen ${topicLabel}: ${percentages.positive}% positif, ${percentages.neutral}% netral, ${percentages.negative}% negatif`}
                >
                  <div className="flex h-full w-full">
                    <span className="bg-emerald-500" style={{ width: `${percentages.positive}%` }} />
                    <span className="bg-slate-400" style={{ width: `${percentages.neutral}%` }} />
                    <span className="bg-red-500" style={{ width: `${percentages.negative}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">{dt.totalReviews || 0} ulasan terkait</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />}
                </div>
              </button>

              {isExpanded && (
                <div className="col-span-1 sm:col-span-2">
                  <AnimatePresence>
                    <motion.div
                      initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mb-2 overflow-hidden rounded-xl border border-orange-200 bg-white p-5 shadow-sm"
                    >
                      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <span className="text-sm font-black text-slate-900">Ulasan tentang &ldquo;{topicLabel}&rdquo;</span>
                        {breakdown && (
                          <div className="flex flex-wrap gap-3 text-xs font-black sm:ml-auto">
                            <span className="text-emerald-600">{breakdown.positive} positif</span>
                            <span className="text-red-500">{breakdown.negative} negatif</span>
                            <span className="text-slate-400">{breakdown.neutral} netral</span>
                          </div>
                        )}
                      </div>

                      {loading && topicReviews.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
                          <span className="text-sm font-semibold text-slate-500">Memuat ulasan...</span>
                        </div>
                      ) : topicReviews.length === 0 ? (
                        <p className="py-6 text-center text-sm font-semibold text-slate-400">Tidak ada ulasan untuk topik ini.</p>
                      ) : (
                        <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1">
                          {topicReviews.map((review) => (
                            <div key={review.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-xs font-black text-primary">
                                    ?
                                  </div>
                                  <div>
                                    <span className="text-xs font-black text-slate-800">Pengguna Anonim</span>
                                    {review.reviewDate && (
                                      <span className="ml-2 text-[10px] font-bold text-slate-400">{dayjs(review.reviewDate).format('DD MMM YYYY')}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <SentimentDot sentiment={review.sentiment} />
                                  {review.rating !== null && (
                                    <div className="flex items-center gap-0.5" aria-label={`Rating ${review.rating} dari 5`}>
                                      <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                                      <span className="text-xs font-black text-slate-700">{review.rating}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {review.reviewText && (
                                <p className="text-xs font-medium leading-6 text-slate-600">
                                  {highlightKeywords(review.reviewText, activeKeywords)}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {reviewMeta && reviewMeta.page < reviewMeta.totalPages && (
                        <button
                          type="button"
                          onClick={() => loadReviews(dt.topic.id, reviewMeta.page + 1, dt.isGroup ? 'group' : 'topic')}
                          disabled={loading}
                          aria-label={`Muat ulasan tambahan untuk topik ${topicLabel}`}
                          className="mt-3 min-h-11 w-full cursor-pointer rounded-full border border-orange-200 bg-orange-50 text-center text-xs font-black text-primary transition-colors hover:bg-orange-100 disabled:text-slate-400"
                        >
                          {loading ? 'Memuat...' : `Lihat Lebih Banyak (${reviewMeta.total - topicReviews.length} lagi)`}
                        </button>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {sorted.length > 4 && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowAllTopics(!showAllTopics)}
            aria-expanded={showAllTopics}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-black text-slate-600 transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
          >
            {showAllTopics ? (
              <>Tampilkan Lebih Sedikit <ChevronUp className="h-4 w-4" /></>
            ) : (
              <>Lihat Semua Topik ({sorted.length}) <ChevronDown className="h-4 w-4" /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

