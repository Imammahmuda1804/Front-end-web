'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRightLeft,
  BarChart3,
  Brain,
  Compass,
  MapPin,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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
import DestinationSelect from './DestinationSelect';
import { getImageUrl } from '@/lib/utils';

const CHART_COLORS = {
  dest1: 'var(--explore)',
  dest2: 'var(--ai)',
  positive: '#10b981',
  neutral: '#94a3b8',
  negative: '#ef4444',
};

interface DestinationMinimal {
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
}

interface ComparedDestination {
  id: number;
  name: string;
  city?: string;
  slug?: string;
  thumbnail?: string;
  imageUrl?: string;
  image_url?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  recommendation_score?: number | null;
  positive_ratio?: number | null;
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
}

interface CompareResult {
  destination1: ComparedDestination;
  destination2: ComparedDestination;
  comparison: {
    recommendation_winner: number | null;
    score_difference: number;
  };
}

interface CompareClientProps {
  availableDestinations: DestinationMinimal[];
}

type TooltipPayload = {
  color?: string;
  name?: string;
  value?: number | string;
};

function normalizeScore(value?: number | null) {
  return Math.round((value || 0) * 100);
}

function formatPercent(value?: number | null) {
  return `${Math.round((value || 0) * 100)}%`;
}

function totalReviews(dest: ComparedDestination) {
  return dest.sentiment.positive + dest.sentiment.neutral + dest.sentiment.negative;
}

function cleanTopicName(name: string) {
  return name.replace(/^Topic \d+:\s*/, '').trim();
}

function topicChips(dest: ComparedDestination) {
  return (dest.topics || [])
    .slice(0, 4)
    .map((topic) => cleanTopicName(topic.topic_name).split(',').map((word) => word.trim()).filter(Boolean).slice(0, 2).join(', '))
    .filter(Boolean);
}

function imageUrl(dest: Partial<DestinationMinimal | ComparedDestination>) {
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
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/analytics/compare`, {
        params: { destination1: dest1Id, destination2: dest2Id },
      });
      return res.data.data;
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
        ? 'Kedua destinasi punya sinyal yang cukup seimbang. Gunakan vibe dan topik ulasan untuk menentukan pilihan akhir.'
        : `${winner?.name} lebih kuat pada skor rekomendasi, sentimen positif, dan sinyal ulasan yang tersedia.`,
    };
  }, [compareData]);

  const motionProps = reduceMotion
    ? { initial: false, animate: undefined, transition: undefined }
    : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45 } };

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 pt-24 pb-24">
      <div className="mx-auto max-w-[100rem] space-y-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/search"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-orange-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm shadow-orange-100/50 transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Pencarian
        </Link>

        <motion.section
          {...motionProps}
          className="relative z-30 overflow-visible rounded-[2rem] border border-orange-200 bg-orange-50/70 p-6 shadow-xl shadow-orange-100/50 md:p-8 lg:p-10"
          aria-labelledby="compare-title"
        >
          <div className="grid gap-8 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:items-end">
            <div className="min-w-0">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white shadow-sm shadow-orange-900/10">
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Compare Command
              </span>
              <h1 id="compare-title" className="max-w-3xl text-4xl font-black leading-none tracking-tight text-slate-950 md:text-6xl">
                Bandingkan Destinasi
              </h1>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-700">
                Letakkan dua destinasi berdampingan, baca pola sentimen, lihat vibe dominan, lalu pilih yang paling cocok untuk rencana perjalanan Anda.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Sentimen', icon: Brain },
                  { label: 'Rating', icon: Star },
                  { label: 'Vibe', icon: Compass },
                ].map(({ label, icon: Icon }) => (
                  <div key={label} className="flex min-h-14 items-center gap-3 rounded-2xl border border-orange-200 bg-white px-4 text-sm font-black text-slate-800 shadow-sm">
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-0 rounded-[1.75rem] border border-orange-200 bg-white p-4 shadow-sm md:p-5">
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
                  className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-ai transition-all hover:-translate-y-0.5 hover:border-ai disabled:cursor-not-allowed disabled:opacity-40 md:mt-7"
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
                  tone="blue"
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
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 text-sm font-black text-primary transition-colors hover:bg-orange-100 focus:outline-none focus:ring-4 focus:ring-primary/15"
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
          <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-red-700">
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
                  className="inline-flex min-h-11 items-center rounded-full bg-red-600 px-4 text-sm font-black text-white transition-colors hover:bg-red-700"
                >
                  Coba lagi
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex min-h-11 items-center rounded-full border border-red-200 bg-white px-4 text-sm font-black text-red-700 transition-colors hover:bg-red-100"
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
              <div className="rounded-[1.75rem] border border-orange-200 bg-white p-6 shadow-sm md:p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Ringkasan keputusan</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                      {decision.balanced ? 'Dua destinasi ini cukup seimbang' : `${decision.winner?.name} paling kuat untuk dipilih`}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600 md:text-base">{decision.reason}</p>
                  </div>
                  <div className="rounded-3xl bg-orange-50 px-5 py-4 text-primary">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-primary/70">Selisih skor</p>
                    <p className="mt-1 text-3xl font-black">{decision.scoreGap.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <DestinationResultCard dest={compareData.destination1} fallback={selectedDest1} tone="orange" label="Destinasi A" />
                  <DestinationResultCard dest={compareData.destination2} fallback={selectedDest2} tone="blue" label="Destinasi B" />
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-sky-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-ai">Cocok untuk</p>
                <div className="mt-4 space-y-4">
                  {[compareData.destination1, compareData.destination2].map((dest, idx) => (
                    <div key={dest.id}>
                      <p className={`mb-2 text-sm font-black ${idx === 0 ? 'text-primary' : 'text-ai'}`}>{dest.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {topicChips(dest).length > 0 ? topicChips(dest).map((topic) => (
                          <span key={topic} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-700">
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

            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <SectionHeader
                eyebrow="Detail metrik"
                title="Bandingkan sinyal utama"
                description="Grafik membantu membaca perbedaan rating, sentimen, dan skor rekomendasi. Ringkasan angka tetap ditampilkan di kartu destinasi agar keputusan lebih mudah dipindai."
              />
              <p className="sr-only">
                Grafik radar membandingkan skor AI, sentimen positif, dan rating. Grafik bar membandingkan jumlah ulasan positif, netral, dan negatif.
              </p>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <ChartPanel icon={Target} title="Skor rekomendasi dan rating">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 800 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '16px', fontWeight: 800, fontSize: '12px' }} />
                      <Radar name={compareData.destination1.name} dataKey="dest1" stroke={CHART_COLORS.dest1} fill={CHART_COLORS.dest1} fillOpacity={0.32} strokeWidth={3} />
                      <Radar name={compareData.destination2.name} dataKey="dest2" stroke={CHART_COLORS.dest2} fill={CHART_COLORS.dest2} fillOpacity={0.28} strokeWidth={3} />
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
            </section>

            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <SectionHeader
                eyebrow="Vibe Mapping"
                title="Topik dominan dari masing-masing destinasi"
                description="Topik ini berasal dari pola ulasan yang paling sering muncul, berguna untuk memilih suasana perjalanan yang paling sesuai."
              />
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <VibeCard dest={compareData.destination1} tone="orange" />
                <VibeCard dest={compareData.destination2} tone="blue" />
              </div>
            </section>
          </motion.div>
        )}
      </div>
    </main>
  );
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
      <p className="mt-2 text-sm font-semibold leading-7 text-slate-600 sm:text-base">{description}</p>
    </div>
  );
}

function DestinationResultCard({ dest, fallback, tone, label }: { dest: ComparedDestination; fallback: DestinationMinimal | null; tone: 'orange' | 'blue'; label: string }) {
  const accent = tone === 'orange' ? 'text-primary bg-orange-50 border-orange-200' : 'text-ai bg-sky-50 border-sky-200';
  const detailTarget = dest.slug || fallback?.slug || String(dest.id);
  const detailHref = `/destinations/${detailTarget}`;
  const thumbnailSource = imageUrl({ ...fallback, ...dest });

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/70">
      <div className="relative h-44 bg-slate-200">
        <Image src={thumbnailSource} alt={dest.name} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
        <div className={`absolute left-4 top-4 rounded-full border px-3 py-1.5 text-xs font-black ${accent}`}>{label}</div>
      </div>
      <div className="p-5">
        <h3 className="line-clamp-2 text-xl font-black text-slate-950">{dest.name}</h3>
        {dest.city && (
          <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-500">
            <MapPin className="h-4 w-4" />
            {dest.city}
          </p>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2">
          <MiniMetric label="Skor AI" value={String(normalizeScore(dest.recommendation_score))} />
          <MiniMetric label="Positif" value={formatPercent(dest.positive_ratio)} />
          <MiniMetric label="Rating" value={dest.rating.user ? dest.rating.user.toFixed(1) : '-'} />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-500">{totalReviews(dest)} ulasan dianalisis</span>
          <Link
            href={detailHref}
            className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-black transition-colors ${
              tone === 'orange' ? 'bg-primary text-white hover:bg-primary/90' : 'bg-ai text-white hover:bg-ai/90'
            }`}
          >
            Lihat detail
          </Link>
        </div>
      </div>
    </article>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function ChartPanel({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-black text-slate-950">{title}</h3>
      </div>
      <div className="h-[320px] w-full">{children}</div>
    </div>
  );
}

function VibeCard({ dest, tone }: { dest: ComparedDestination; tone: 'orange' | 'blue' }) {
  const accent = tone === 'orange' ? 'text-primary bg-orange-50 border-orange-200' : 'text-ai bg-sky-50 border-sky-200';

  return (
    <article className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
      <h3 className="text-lg font-black text-slate-950">{dest.name}</h3>
      {dest.topics && dest.topics.length > 0 ? (
        <div className="mt-4 space-y-3">
          {dest.topics.slice(0, 5).map((topic) => {
            const words = cleanTopicName(topic.topic_name).split(',').map((word) => word.trim()).filter(Boolean);
            return (
              <div key={`${dest.id}-${topic.topic_name}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black capitalize text-slate-900">{words.slice(0, 2).join(', ') || 'Topik perjalanan'}</p>
                    {words.length > 2 && <p className="mt-1 text-xs font-semibold text-slate-500">{words.slice(2).join(', ')}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${accent}`}>
                    {topic.total_reviews} ulasan
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-semibold text-slate-500">Data topik belum tersedia.</p>
        </div>
      )}
    </article>
  );
}

function EmptyCompareState({
  selectedDest1,
  selectedDest2,
  destinations,
  onPickPair,
}: {
  selectedDest1: DestinationMinimal | null;
  selectedDest2: DestinationMinimal | null;
  destinations: DestinationMinimal[];
  onPickPair: (first: number, second: number) => void;
}) {
  const quickPair = destinations.slice(0, 2);

  return (
    <section className="rounded-[1.75rem] border border-dashed border-orange-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-primary">
        <BarChart3 className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-black text-slate-950">
        {selectedDest1 || selectedDest2 ? 'Pilih satu pembanding lagi' : 'Mulai dari dua destinasi'}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-7 text-slate-600">
        Hasil perbandingan akan muncul sebagai ringkasan keputusan, kartu metrik, chart, dan vibe mapping setelah dua destinasi dipilih.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {quickPair.length === 2 && (
          <button
            type="button"
            onClick={() => onPickPair(quickPair[0].id, quickPair[1].id)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-black text-white transition-colors hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" />
            Coba pasangan pertama
          </button>
        )}
        <Link
          href="/search"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-5 text-sm font-black text-primary transition-colors hover:bg-orange-100"
        >
          <Search className="h-4 w-4" />
          Cari destinasi
        </Link>
      </div>
    </section>
  );
}

function CompareSkeleton() {
  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.45fr)]" aria-label="Memuat hasil perbandingan">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="h-4 w-44 rounded-full bg-orange-100 motion-safe:animate-pulse" />
        <div className="mt-4 h-10 w-3/4 rounded-xl bg-slate-200 motion-safe:animate-pulse" />
        <div className="mt-3 h-5 w-2/3 rounded bg-slate-200 motion-safe:animate-pulse" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="h-80 rounded-3xl bg-slate-100 motion-safe:animate-pulse" />
          <div className="h-80 rounded-3xl bg-slate-100 motion-safe:animate-pulse" />
        </div>
      </div>
      <div className="h-80 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm motion-safe:animate-pulse" />
    </section>
  );
}
