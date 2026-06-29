'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRightLeft,
  BarChart3,
  Brain,
  Compass,
  RotateCcw,
  Star,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import DestinationSelect from './DestinationSelect';
import { ChartLoadingPanel } from '@/components/charts/ChartPanel';
import { comparisonService } from '../services/comparison.service';
import { getImageUrl } from '@/lib/utils';
import axios, { type AxiosError } from 'axios';
import {
  CompareSkeleton,
  DestinationResultCard,
  EmptyCompareState,
  FactorMatrix,
  HighlightRiskGrid,
  LocationComparePanel,
  SectionHeader,
  SentimentDecisionPanel,
  ExperienceTopicCard,
} from './compare-components';

const CompareCharts = dynamic(() => import('./CompareCharts'), {
  ssr: false,
  loading: () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartLoadingPanel icon={BarChart3} title="Skor rekomendasi dan rating" />
      <ChartLoadingPanel icon={TrendingUp} title="Distribusi sentimen ulasan" />
    </div>
  ),
});

export interface DestinationMinimal {
  id: number;
  name: string;
  city: string;
  slug?: string;
  thumbnail?: string;
  imageUrl?: string;
  image_url?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
}

interface CompareTopic {
  topic_name: string;
  total_reviews: number;
  group_name?: string | null;
}

export type CompareFactorKey = 'access' | 'cost_value' | 'cleanliness' | 'facilities' | 'crowd' | 'view_activity';

export interface ComparedDestination {
  id: number;
  name: string;
  city?: string;
  province?: string;
  category?: string;
  slug?: string;
  thumbnail?: string;
  imageUrl?: string;
  image_url?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  latitude?: number | null;
  longitude?: number | null;
  googleMapsUrl?: string | null;
  recommendation_score?: number | null;
  positive_ratio?: number | null;
  review_count?: number;
  rating: {
    user?: number | null;
    google?: number | null;
  };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topics?: CompareTopic[];
  top_topics?: CompareTopic[];
  topic_groups?: Array<{ group_name: string; total_reviews: number }>;
  travel_traits?: Record<string, number>;
  decision_factors?: Record<CompareFactorKey, number>;
  highlights?: string[];
  risks?: string[];
}

interface CompareResult {
  destination1: ComparedDestination;
  destination2: ComparedDestination;
  comparison: {
    recommendation_winner: number | null;
    score_difference: number;
    insights?: {
      recommended_destination_id?: number | null;
      summary?: string;
      best_for?: string[];
      tradeoffs?: string[];
      score_cards?: Array<{ destination_id: number; label: string; score: number; reasons: string[] }>;
    };
  };
}

interface CompareClientProps {
  availableDestinations: DestinationMinimal[];
}

// Mengubah skor 0-1 menjadi persentase 0-100.
export function normalizeScore(value?: number | null) {
  return Math.round((value || 0) * 100);
}

export function formatPercent(value?: number | null) {
  return `${Math.round((value || 0) * 100)}%`;
}

export function totalReviews(dest: ComparedDestination) {
  return dest.sentiment.positive + dest.sentiment.neutral + dest.sentiment.negative;
}

export function cleanTopicName(name: string) {
  return name.replace(/^Topic \d+:\s*/, '').trim();
}

// Mengambil ringkasan topik dominan untuk kartu compare.
export function topicChips(dest: ComparedDestination) {
  return (dest.topics || [])
    .slice(0, 4)
    .map((topic) => cleanTopicName(topic.topic_name).split(',').map((word) => word.trim()).filter(Boolean).slice(0, 2).join(', '))
    .filter(Boolean);
}

export function imageUrl(dest: Partial<DestinationMinimal | ComparedDestination>) {
  const rawUrl = dest.thumbnailUrl || dest.thumbnail_url || dest.thumbnail || dest.imageUrl || dest.image_url;
  return rawUrl ? getImageUrl(rawUrl) : '/images/auth-bg.jpg';
}

function getFriendlyError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 404) return 'Data destinasi tidak ditemukan.';
    if (err.response?.status === 500) return 'Server sedang bermasalah. Coba beberapa saat lagi.';
  }
  return 'Terjadi kesalahan. Coba pilih destinasi lain.';
}

// Mengelola pilihan dua destinasi dan memuat hasil perbandingan.
export default function CompareClient({ availableDestinations }: CompareClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const initialD1 = searchParams.get('d1') ? Number(searchParams.get('d1')) : null;
  const initialD2 = searchParams.get('d2') ? Number(searchParams.get('d2')) : null;

  const [dest1Id, setDest1Id] = useState<number | null>(initialD1);
  const [dest2Id, setDest2Id] = useState<number | null>(initialD2);

  const selectedDest1 = availableDestinations.find((dest) => dest.id === dest1Id) || null;
  const selectedDest2 = availableDestinations.find((dest) => dest.id === dest2Id) || null;
  const hasOneSelection = Boolean((dest1Id && !dest2Id) || (!dest1Id && dest2Id));

  useEffect(() => {
    const params = new URLSearchParams();
    if (dest1Id) params.set('d1', String(dest1Id));
    if (dest2Id) params.set('d2', String(dest2Id));
    const paramString = params.toString();
    router.replace(paramString ? `/compare?${paramString}` : '/compare', { scroll: false });
  }, [dest1Id, dest2Id, router]);

  const handleReset = () => {
    setDest1Id(null);
    setDest2Id(null);
  };

  const handleSwap = () => {
    setDest1Id(dest2Id);
    setDest2Id(dest1Id);
  };

  const { data: compareData, isLoading, isError, error, refetch } = useQuery<CompareResult | null, AxiosError>({
    queryKey: ['compare', dest1Id, dest2Id],
    queryFn: async () => {
      if (!dest1Id || !dest2Id) return null;
      const data = await comparisonService.getCompareData(dest1Id, dest2Id);
      return data.data;
    },
    enabled: !!dest1Id && !!dest2Id,
  });

  const radarData = useMemo(() => {
    if (!compareData) return [];
    const d1 = compareData.destination1;
    const d2 = compareData.destination2;

    return [
      {
        subject: 'Skor AI',
        dest1: normalizeScore(d1.recommendation_score),
        dest2: normalizeScore(d2.recommendation_score),
        fullMark: 100,
      },
      {
        subject: 'Sentimen Positif',
        dest1: normalizeScore(d1.positive_ratio),
        dest2: normalizeScore(d2.positive_ratio),
        fullMark: 100,
      },
      {
        subject: 'Rating',
        dest1: ((d1.rating.user || 0) / 5) * 100,
        dest2: ((d2.rating.user || 0) / 5) * 100,
        fullMark: 100,
      },
    ];
  }, [compareData]);

  const sentimentData = useMemo(() => {
    if (!compareData) return [];
    return [compareData.destination1, compareData.destination2].map((dest) => ({
      name: dest.name,
      Positif: dest.sentiment.positive,
      Netral: dest.sentiment.neutral,
      Negatif: dest.sentiment.negative,
    }));
  }, [compareData]);

  const decision = useMemo(() => {
    if (!compareData) return null;
    const { destination1, destination2, comparison } = compareData;
    const winner =
      comparison.recommendation_winner === destination1.id
        ? destination1
        : comparison.recommendation_winner === destination2.id
          ? destination2
          : null;
    const balanced = !winner || Math.abs(comparison.score_difference) < 0.01;
    const scoreGap = Math.abs(comparison.score_difference * 100);

    return {
      winner,
      balanced,
      scoreGap,
      reason: balanced
        ? 'Kedua destinasi punya sinyal yang cukup seimbang. Gunakan nuansa pengalaman dan topik ulasan untuk menentukan pilihan akhir.'
        : comparison.insights?.summary || `${winner?.name} lebih kuat pada skor rekomendasi, sentimen positif, dan sinyal ulasan yang tersedia.`,
    };
  }, [compareData]);

  const motionProps = reduceMotion
    ? { initial: false, animate: undefined, transition: undefined }
    : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45 } };

  return (
    <main id="main-content" className="min-h-screen pt-24 pb-24">
      <div className="mx-auto max-w-[100rem] space-y-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/search"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/40 bg-white/78 px-4 text-sm font-black text-slate-800 shadow-[0_10px_26px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-[color,background-color,border-color,box-shadow,transform,opacity] hover:-translate-y-0.5 hover:border-primary hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Pencarian
        </Link>

        <motion.section
          {...motionProps}
          className="relative z-30 overflow-visible rounded-lg border border-white/30 bg-slate-950/42 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.24)] backdrop-blur-xl md:p-8 lg:p-10"
          aria-labelledby="compare-title"
        >
          <div className="grid gap-8 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:items-end">
            <div className="min-w-0">
              <span className="mb-4 inline-flex items-center gap-2 rounded-lg border border-orange-200/40 bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white shadow-sm shadow-orange-900/10">
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Pusat Perbandingan
              </span>
              <h1 id="compare-title" className="on-photo-heading max-w-3xl text-4xl font-black leading-none tracking-tight md:text-6xl">
                Bandingkan Destinasi
              </h1>
              <p className="on-photo-copy mt-4 max-w-2xl text-base font-semibold leading-7">
                Letakkan dua destinasi berdampingan, baca pola sentimen, lihat nuansa dominan, lalu pilih yang paling cocok untuk rencana perjalanan Anda.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Sentimen', icon: Brain },
                  { label: 'Rating', icon: Star },
                  { label: 'Nuansa', icon: Compass },
                ].map(({ label, icon: Icon }) => (
                  <div key={label} className="flex min-h-14 items-center gap-3 rounded-lg border border-white/35 bg-white/82 px-4 text-sm font-black text-slate-800 shadow-sm backdrop-blur-xl">
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-0 rounded-lg border border-white/50 bg-white/90 p-4 shadow-sm backdrop-blur-xl md:p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
                <DestinationSelect
                  label="Destinasi A"
                  placeholder="Pilih destinasi pertama..."
                  destinations={availableDestinations}
                  selectedId={dest1Id}
                  onSelect={setDest1Id}
                  disabledId={dest2Id}
                  tone="orange"
                />

                <button
                  type="button"
                  onClick={handleSwap}
                  disabled={!dest1Id && !dest2Id}
                  aria-label="Tukar destinasi yang dibandingkan"
                  className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 text-black transition-[color,background-color,border-color,box-shadow,transform,opacity] hover:-translate-y-0.5 hover:border-ai disabled:cursor-not-allowed disabled:opacity-40 md:mt-7"
                >
                  <ArrowRightLeft className="h-5 w-5" />
                </button>

                <DestinationSelect
                  label="Destinasi B"
                  placeholder="Pilih destinasi pembanding..."
                  destinations={availableDestinations}
                  selectedId={dest2Id}
                  onSelect={setDest2Id}
                  disabledId={dest1Id}
                  tone="orange"
                />
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold leading-6 text-slate-600">
                  {hasOneSelection ? 'Pilih satu destinasi pembanding untuk membuka hasil perbandingan.' : 'Pilih dua destinasi untuk melihat ringkasan keputusan.'}
                </p>
                {(dest1Id || dest2Id) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 text-sm font-black text-primary transition-colors hover:bg-orange-100 focus:outline-none focus:ring-4 focus:ring-primary/15"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {isLoading && <CompareSkeleton />}

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-6 w-6 shrink-0" />
                <div>
                  <h2 className="text-lg font-black">Gagal memuat data</h2>
                  <p className="mt-1 text-sm font-semibold text-red-600">{getFriendlyError(error)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="inline-flex min-h-11 items-center rounded-lg bg-red-600 px-4 text-sm font-black text-white transition-colors hover:bg-red-700"
                >
                  Coba lagi
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex min-h-11 items-center rounded-lg border border-red-200 bg-white px-4 text-sm font-black text-red-700 transition-colors hover:bg-red-100"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {!dest1Id || !dest2Id ? (
          <EmptyCompareState
            selectedDest1={selectedDest1}
            selectedDest2={selectedDest2}
            destinations={availableDestinations}
            onPickPair={(first, second) => {
              setDest1Id(first);
              setDest2Id(second);
            }}
          />
        ) : null}

        {compareData && !isLoading && !isError && decision && (
          <motion.div {...motionProps} className="space-y-6">
            <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.45fr)]">
              <div className="rounded-lg border border-orange-200 bg-white p-6 shadow-sm md:p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Ringkasan keputusan</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                      {decision.balanced ? 'Dua destinasi ini cukup seimbang' : `${decision.winner?.name} paling kuat untuk dipilih`}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600 md:text-base">{decision.reason}</p>
                  </div>
                  <div className="rounded-lg bg-orange-50 px-5 py-4 text-primary">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-primary/70">Selisih skor</p>
                    <p className="mt-1 text-3xl font-black">{decision.scoreGap.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <DestinationResultCard dest={compareData.destination1} fallback={selectedDest1} tone="orange" label="Destinasi A" />
                  <DestinationResultCard dest={compareData.destination2} fallback={selectedDest2} tone="blue" label="Destinasi B" />
                </div>
              </div>

              <div className="rounded-lg border border-sky-100 bg-white p-6 shadow-sm self-start">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-400">Cocok untuk</p>
                <div className="mt-4 space-y-4">
                  {[compareData.destination1, compareData.destination2].map((dest, idx) => (
                    <div key={dest.id}>
                      <p className={`mb-2 text-sm font-black ${idx === 0 ? 'text-primary' : 'text-primary'}`}>{dest.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {topicChips(dest).length > 0 ? topicChips(dest).map((topic) => (
                          <span key={topic} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-700">
                            {topic}
                          </span>
                        )) : (
                          <span className="text-sm font-semibold text-slate-500">Topik belum tersedia</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <SentimentDecisionPanel destination1={compareData.destination1} destination2={compareData.destination2} />

            <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.45fr)]">
              <FactorMatrix destination1={compareData.destination1} destination2={compareData.destination2} />
              <LocationComparePanel destination1={compareData.destination1} destination2={compareData.destination2} />
            </section>

            <HighlightRiskGrid destination1={compareData.destination1} destination2={compareData.destination2} />

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <SectionHeader
                eyebrow="Detail metrik"
                title="Bandingkan sinyal utama"
                description="Grafik membantu membaca perbedaan rating, sentimen, dan skor rekomendasi. Ringkasan angka tetap ditampilkan di kartu destinasi agar keputusan lebih mudah dipindai."
              />
              <p className="sr-only">
                Grafik radar membandingkan skor AI, sentimen positif, dan rating. Grafik bar membandingkan jumlah ulasan positif, netral, dan negatif.
              </p>

              <div className="mt-6">
                <CompareCharts
                  radarData={radarData}
                  sentimentData={sentimentData}
                  destination1Name={compareData.destination1.name}
                  destination2Name={compareData.destination2.name}
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <SectionHeader
                eyebrow="Pemetaan nuansa"
                title="Topik dominan dari masing-masing destinasi"
                description="Topik ini berasal dari pola ulasan yang paling sering muncul, berguna untuk memilih suasana perjalanan yang paling sesuai."
              />
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <ExperienceTopicCard dest={compareData.destination1} tone="orange" />
                <ExperienceTopicCard dest={compareData.destination2} tone="blue" />
              </div>
            </section>
          </motion.div>
        )}
      </div>
    </main>
  );
}




