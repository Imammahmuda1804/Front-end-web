'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, ImageOff, LineChart, MessageSquareWarning, TimerReset } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Queue = {
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

interface Props {
  queue?: Queue;
}

export default function AdminActionQueue({ queue }: Props) {
  const actions = [
    {
      label: 'Scraping gagal',
      value: queue?.failed_jobs ?? 0,
      href: '/admin/scraper',
      icon: AlertTriangle,
      tone: 'rose',
    },
    {
      label: 'Job menunggu',
      value: queue?.pending_jobs ?? 0,
      href: '/admin/scraper',
      icon: TimerReset,
      tone: 'amber',
    },
    {
      label: 'Thumbnail kosong',
      value: queue?.destinations_without_thumbnail ?? 0,
      href: '/admin/destinations',
      icon: ImageOff,
      tone: 'blue',
    },
    {
      label: 'Tren kosong',
      value: queue?.destinations_without_trends ?? 0,
      href: '/admin/nlp-processing',
      icon: LineChart,
      tone: 'slate',
    },
  ] as const;

  return (
    <Card className="rounded-xl border border-slate-200 bg-white py-0 shadow-sm">
      <CardHeader className="border-b border-slate-100 p-6">
        <CardTitle className="text-lg font-black text-slate-950">Antrian Tindakan</CardTitle>
        <CardDescription className="mt-1 font-semibold">Prioritas kerja yang dapat langsung ditindak admin.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            const toneClass = {
              rose: 'bg-rose-50 text-rose-700 border-rose-100',
              amber: 'bg-amber-50 text-amber-700 border-amber-100',
              blue: 'bg-sky-50 text-ai border-sky-100',
              slate: 'bg-slate-50 text-slate-700 border-slate-200',
            }[action.tone];

            return (
              <Link key={action.label} href={action.href} className={`rounded-xl border p-3 transition-transform hover:-translate-y-0.5 ${toneClass}`}>
                <Icon className="mb-3 h-5 w-5" />
                <p className="text-2xl font-black text-slate-950">{action.value}</p>
                <p className="text-xs font-black uppercase tracking-[0.12em] opacity-80">{action.label}</p>
              </Link>
            );
          })}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-black text-slate-950">
            <MessageSquareWarning className="h-4 w-4 text-rose-500" />
            Ulasan negatif terbaru
          </div>
          {(queue?.recent_negative_reviews || []).length > 0 ? (
            queue?.recent_negative_reviews.slice(0, 3).map((review) => (
              <Link key={review.id} href={`/admin/destinations/${review.destination.id}`} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-3 transition-colors hover:bg-orange-50">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">{review.destination.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                    {review.reviewText || `Rating ${review.rating ?? '-'} tanpa teks ulasan`}
                  </p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            ))
          ) : (
            <p className="rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-500">Tidak ada ulasan negatif terbaru.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

