'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Clock, Database, ShieldCheck } from 'lucide-react';

import { api } from '@/lib/axios';
import SummaryCards from './SummaryCards';
import TopDestinationsList from './TopDestinationsList';
import RecentActivityFeed, { type ActivityData } from './RecentActivityFeed';
import DataFreshnessPanel from './DataFreshnessPanel';
import AdminActionQueue from './AdminActionQueue';

const DashboardChartSkeleton = ({ height = 'h-80' }: { height?: string }) => (
  <div className={`${height} animate-pulse rounded-[1.75rem] bg-white ring-1 ring-slate-200`} />
);

const MonthlySentimentChart = dynamic(() => import('./MonthlySentimentChart'), {
  ssr: false,
  loading: () => <DashboardChartSkeleton height="h-[25rem]" />,
});
const TopTopicsChart = dynamic(() => import('./TopTopicsChart'), {
  ssr: false,
  loading: () => <DashboardChartSkeleton />,
});
const GlobalSentimentDonut = dynamic(() => import('./GlobalSentimentDonut'), {
  ssr: false,
  loading: () => <DashboardChartSkeleton />,
});
const ScrapingJobHealthChart = dynamic(() => import('./ScrapingJobHealthChart'), {
  ssr: false,
  loading: () => <DashboardChartSkeleton />,
});
const ReviewSourceMixChart = dynamic(() => import('./ReviewSourceMixChart'), {
  ssr: false,
  loading: () => <DashboardChartSkeleton />,
});
const TopicRiskMatrix = dynamic(() => import('./TopicRiskMatrix'), {
  ssr: false,
  loading: () => <DashboardChartSkeleton />,
});
const DestinationQualityMatrix = dynamic(() => import('./DestinationQualityMatrix'), {
  ssr: false,
  loading: () => <DashboardChartSkeleton height="h-[25rem]" />,
});

type DashboardSummary = {
  total_users: number;
  users_breakdown?: Record<string, number>;
  total_destinations: number;
  destinations_breakdown: { active: number; deleted: number };
  total_reviews: number;
  reviews_breakdown: { scraped: number; user_submitted: number };
  total_scraping_jobs: number;
  scraping_jobs_breakdown?: Record<string, number>;
  sentiment_distribution: { positive: number; negative: number; neutral: number };
  top_destinations: Array<{
    id: number;
    name: string;
    city: string;
    recommendationScore: number | null;
    positiveRatio: number | null;
    googleRating: number | null;
  }>;
  top_topics: Array<{ topic_name: string; count: number }>;
  data_freshness?: {
    latest_completed_job?: { createdAt?: string; finishedAt?: string; destination?: { name?: string; city?: string } } | null;
    latest_failed_job?: { createdAt?: string; errorMessage?: string | null; destination?: { name?: string; city?: string } } | null;
    destinations_without_thumbnail: number;
    destinations_without_trends: number;
  };
  action_queue?: {
    failed_jobs: number;
    pending_jobs: number;
    destinations_without_thumbnail: number;
    destinations_without_trends: number;
    recent_negative_reviews: Array<{
      id: number;
      rating: number | null;
      reviewText: string | null;
      createdAt: string;
      destination: { id: number; name: string; city: string };
    }>;
  };
  topic_risk_matrix?: Array<{
    topic_name: string;
    positive: number;
    neutral: number;
    negative: number;
    total: number;
    risk_ratio: number;
  }>;
  destination_quality_matrix?: Array<{
    id: number;
    name: string;
    city: string;
    google_rating: number | null;
    google_review_count: number | null;
    recommendation_score: number | null;
    positive_ratio: number | null;
  }>;
};

function sentimentRatio(distribution: DashboardSummary['sentiment_distribution']) {
  const total = distribution.positive + distribution.negative + distribution.neutral;
  return total > 0 ? Math.round((distribution.positive / total) * 100) : 0;
}

// Mengambil data dashboard admin dan menyusun panel analytics.
export function AdminDashboardClient() {
  const { data: summary, isLoading: loadingSummary, isError: summaryError } = useQuery<DashboardSummary>({
    queryKey: ['admin', 'dashboard', 'summary'],
    queryFn: async () => {
      const res = await api.get('/api/admin/dashboard/summary');
      return res.data.data;
    },
  });

  const { data: activity, isLoading: loadingActivity, isError: activityError } = useQuery<ActivityData>({
    queryKey: ['admin', 'dashboard', 'activity'],
    queryFn: async () => {
      const res = await api.get('/api/admin/dashboard/activity');
      return res.data.data;
    },
  });

  const isLoading = loadingSummary || loadingActivity;
  const isError = summaryError || activityError || !summary || !activity;

  const insightCards = useMemo(() => {
    if (!summary) return [];
    const failedJobs = summary.action_queue?.failed_jobs ?? 0;
    const pendingJobs = summary.action_queue?.pending_jobs ?? 0;
    const staleDestinations = summary.data_freshness?.destinations_without_trends ?? 0;

    return [
      {
        label: 'Rasio positif',
        value: `${sentimentRatio(summary.sentiment_distribution)}%`,
        helper: 'Dari seluruh ulasan terklasifikasi',
        icon: ShieldCheck,
        tone: 'emerald' as const,
      },
      {
        label: 'Job bermasalah',
        value: String(failedJobs),
        helper: `${pendingJobs} job menunggu`,
        icon: AlertTriangle,
        tone: failedJobs > 0 ? 'rose' as const : 'slate' as const,
      },
      {
        label: 'Data belum segar',
        value: String(staleDestinations),
        helper: 'Destinasi tanpa tren sentimen',
        icon: Database,
        tone: staleDestinations > 0 ? 'amber' as const : 'slate' as const,
      },
    ];
  }, [summary]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-[1.75rem] border border-red-100 bg-red-50 p-8 text-center">
        <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-red-500" />
        <h1 className="text-xl font-black text-red-900">Gagal memuat dashboard</h1>
        <p className="mt-2 text-sm font-semibold text-red-600">Periksa koneksi API atau sesi admin, lalu muat ulang halaman.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-orange-100 bg-orange-50/70 p-6 shadow-sm shadow-orange-100/50">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-primary shadow-sm">
              <Clock className="h-3.5 w-3.5" />
              Admin intelligence
            </p>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Dashboard Operasional</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-600 md:text-base">
              Pantau kualitas data, kesehatan scraping, sentimen ulasan, dan prioritas tindakan admin dalam satu ruang analisis.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3 xl:min-w-[42rem]">
            {insightCards.map((card) => (
              <InsightCard key={card.label} {...card} />
            ))}
          </div>
        </div>
      </section>

      <SummaryCards
        totalUsers={summary.total_users}
        totalDestinations={summary.total_destinations}
        totalReviews={summary.total_reviews}
        totalJobs={summary.total_scraping_jobs}
        destinationsBreakdown={summary.destinations_breakdown}
        reviewsBreakdown={summary.reviews_breakdown}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.8fr)]">
        <div className="space-y-6">
          <MonthlySentimentChart />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ScrapingJobHealthChart breakdown={summary.scraping_jobs_breakdown || {}} />
            <ReviewSourceMixChart breakdown={summary.reviews_breakdown} />
          </div>
          <DestinationQualityMatrix destinations={summary.destination_quality_matrix || []} />
          <TopicRiskMatrix topics={summary.topic_risk_matrix || []} />
        </div>

        <aside className="space-y-6">
          <GlobalSentimentDonut distribution={summary.sentiment_distribution} />
          <DataFreshnessPanel freshness={summary.data_freshness} />
          <AdminActionQueue queue={summary.action_queue} />
          <TopDestinationsList destinations={summary.top_destinations} />
        </aside>
      </div>

      <TopTopicsChart topics={summary.top_topics} />
      <RecentActivityFeed activity={activity} />
    </div>
  );
}

function InsightCard({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  helper: string;
  tone: 'emerald' | 'rose' | 'amber' | 'slate';
}) {
  const toneClass = {
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    slate: 'border-slate-200 bg-white text-slate-700',
  }[tone];

  return (
    <div className={`rounded-3xl border p-4 shadow-sm ${toneClass}`}>
      <Icon className="mb-3 h-5 w-5" />
      <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold opacity-80">{helper}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Memuat dashboard admin">
      <div className="h-44 animate-pulse rounded-[2rem] bg-orange-100/70" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-36 animate-pulse rounded-[1.5rem] bg-white ring-1 ring-slate-200" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.8fr)]">
        <div className="space-y-6">
          <div className="h-[25rem] animate-pulse rounded-[1.75rem] bg-white ring-1 ring-slate-200" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-80 animate-pulse rounded-[1.75rem] bg-white ring-1 ring-slate-200" />
            <div className="h-80 animate-pulse rounded-[1.75rem] bg-white ring-1 ring-slate-200" />
          </div>
        </div>
        <div className="h-[42rem] animate-pulse rounded-[1.75rem] bg-white ring-1 ring-slate-200" />
      </div>
    </div>
  );
}
