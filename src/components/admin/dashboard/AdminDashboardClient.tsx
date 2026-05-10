'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Loader2 } from 'lucide-react';
import SummaryCards from './SummaryCards';
import MonthlySentimentChart from './MonthlySentimentChart';
import TopTopicsChart from './TopTopicsChart';
import GlobalSentimentDonut from './GlobalSentimentDonut';
import TopDestinationsList from './TopDestinationsList';
import RecentActivityFeed from './RecentActivityFeed';

export function AdminDashboardClient() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['admin', 'dashboard', 'summary'],
    queryFn: async () => {
      const res = await api.get('/api/admin/dashboard/summary');
      return res.data.data;
    },
  });

  const { data: activity, isLoading: loadingActivity } = useQuery({
    queryKey: ['admin', 'dashboard', 'activity'],
    queryFn: async () => {
      const res = await api.get('/api/admin/dashboard/activity');
      return res.data.data;
    },
  });

  if (loadingSummary || loadingActivity) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!summary || !activity) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Gagal memuat data dasbor.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Overview</h1>
        <p className="text-slate-500">
          High-level insights and system status across all VibeTravel destinations.
        </p>
      </div>

      <SummaryCards
        totalUsers={summary.total_users}
        totalDestinations={summary.total_destinations}
        totalReviews={summary.total_reviews}
        totalJobs={summary.total_scraping_jobs}
        destinationsBreakdown={summary.destinations_breakdown}
        reviewsBreakdown={summary.reviews_breakdown}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MonthlySentimentChart />
          <TopTopicsChart topics={summary.top_topics} />
        </div>
        <div className="space-y-6">
          <GlobalSentimentDonut distribution={summary.sentiment_distribution} />
          <TopDestinationsList destinations={summary.top_destinations} />
        </div>
      </div>

      <RecentActivityFeed activity={activity} />
    </div>
  );
}
