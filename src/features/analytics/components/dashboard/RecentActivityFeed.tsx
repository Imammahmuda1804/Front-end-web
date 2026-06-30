'use client';

import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertCircle, CheckCircle2, Clock, Globe, MessageSquareText, UserPlus } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ScrapingJobActivity {
  id: number;
  status: string;
  reviewsFound?: number;
  totalReviews?: number | null;
  createdAt: string;
  destination?: { name?: string | null };
}

export interface UserReviewActivity {
  id: number;
  rating: number;
  createdAt: string;
  user?: { name?: string | null };
  destination?: { name?: string | null };
}

export interface RegistrationActivity {
  id: number;
  name: string;
  role: string;
  createdAt: string;
}

export interface ActivityData {
  recent_scraping_jobs: ScrapingJobActivity[];
  recent_scraped_reviews: unknown[];
  recent_user_reviews: UserReviewActivity[];
  recent_registrations: RegistrationActivity[];
}

interface RecentActivityFeedProps {
  activity: ActivityData;
}

type ActivityItem = {
  type: 'job' | 'user_review' | 'registration';
  id: string;
  title: string;
  description: string;
  date: Date;
  status: string;
};

export default function RecentActivityFeed({ activity }: RecentActivityFeedProps) {
  const allActivities: ActivityItem[] = [
    ...activity.recent_scraping_jobs.map((job) => ({
      type: 'job' as const,
      id: `job-${job.id}`,
      title: `Scraping: ${job.destination?.name || 'Destinasi'}`,
      description: `Status ${job.status}. ${job.reviewsFound ?? job.totalReviews ?? 0} ulasan ditemukan.`,
      date: new Date(job.createdAt),
      status: job.status,
    })),
    ...activity.recent_user_reviews.map((review) => ({
      type: 'user_review' as const,
      id: `urev-${review.id}`,
      title: `Ulasan baru oleh ${review.user?.name || 'Pengguna'}`,
      description: `Rating ${review.rating}/5 untuk ${review.destination?.name || 'destinasi'}.`,
      date: new Date(review.createdAt),
      status: 'success',
    })),
    ...activity.recent_registrations.map((user) => ({
      type: 'registration' as const,
      id: `reg-${user.id}`,
      title: 'Registrasi pengguna baru',
      description: `${user.name} bergabung sebagai ${user.role}.`,
      date: new Date(user.createdAt),
      status: 'success',
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8);

  const getIcon = (type: string, status: string) => {
    if (type === 'registration') return <UserPlus className="h-4 w-4 text-ai" />;
    if (type === 'user_review') return <MessageSquareText className="h-4 w-4 text-emerald-600" />;
    if (type === 'job') {
      if (status === 'COMPLETED' || status === 'completed') return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      if (status === 'FAILED' || status === 'failed') return <AlertCircle className="h-4 w-4 text-rose-600" />;
      return <Globe className="h-4 w-4 text-amber-600" />;
    }
    return <Clock className="h-4 w-4 text-slate-400" />;
  };

  const getIconBg = (type: string, status: string) => {
    if (type === 'registration') return 'bg-blue-300 border-blue-100';
    if (type === 'user_review') return 'bg-emerald-50 border-emerald-100';
    if (type === 'job') {
      if (status === 'COMPLETED' || status === 'completed') return 'bg-emerald-50 border-emerald-100';
      if (status === 'FAILED' || status === 'failed') return 'bg-rose-50 border-rose-100';
      return 'bg-amber-50 border-amber-100';
    }
    return 'bg-slate-50 border-slate-200';
  };

  return (
    <Card className="overflow-hidden rounded-lg border border-slate-200 bg-white py-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-6">
        <CardTitle className="text-xl font-black text-slate-950">Aktivitas Terbaru</CardTitle>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          Terkini
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {allActivities.length > 0 ? (
          <div className="space-y-3">
            {allActivities.map((item) => (
              <div key={item.id} className="flex flex-col justify-between gap-4 rounded-lg border border-transparent bg-slate-50 p-3 transition-colors hover:border-orange-100 hover:bg-orange-50/60 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${getIconBg(item.type, item.status)}`}>
                    {getIcon(item.type, item.status)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-black text-slate-900">{item.title}</h4>
                    <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-slate-500">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {formatDistanceToNow(item.date, { addSuffix: true, locale: id })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm font-bold text-slate-400">
            Belum ada aktivitas terbaru.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

