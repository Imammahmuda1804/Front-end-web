'use client';

import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarClock, ImageOff, LineChart, XCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Freshness = {
  latest_completed_job?: { createdAt?: string; finishedAt?: string; destination?: { name?: string; city?: string } } | null;
  latest_failed_job?: { createdAt?: string; errorMessage?: string | null; destination?: { name?: string; city?: string } } | null;
  destinations_without_thumbnail: number;
  destinations_without_trends: number;
};

interface Props {
  freshness?: Freshness;
}

function relativeTime(value?: string) {
  if (!value) return 'Belum ada data';
  return formatDistanceToNow(new Date(value), { addSuffix: true, locale: id });
}

export default function DataFreshnessPanel({ freshness }: Props) {
  return (
    <Card className="rounded-lg border border-slate-200 bg-white py-0 shadow-sm">
      <CardHeader className="border-b border-slate-100 p-6">
        <CardTitle className="text-lg font-black text-slate-950">Kesegaran Data</CardTitle>
        <CardDescription className="mt-1 font-semibold">Sinyal apakah data destinasi siap dianalisis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-6">
        <FreshnessRow
          icon={CalendarClock}
          label="Scraping sukses terakhir"
          value={relativeTime(freshness?.latest_completed_job?.finishedAt || freshness?.latest_completed_job?.createdAt)}
          helper={freshness?.latest_completed_job?.destination?.name || 'Belum ada job sukses'}
          tone="emerald"
        />
        <FreshnessRow
          icon={XCircle}
          label="Job gagal terakhir"
          value={relativeTime(freshness?.latest_failed_job?.createdAt)}
          helper={freshness?.latest_failed_job?.errorMessage || freshness?.latest_failed_job?.destination?.name || 'Tidak ada kegagalan terbaru'}
          tone="rose"
        />
        <FreshnessRow
          icon={ImageOff}
          label="Tanpa thumbnail"
          value={String(freshness?.destinations_without_thumbnail ?? 0)}
          helper="Destinasi perlu cover visual"
          tone="amber"
        />
        <FreshnessRow
          icon={LineChart}
          label="Tanpa tren sentimen"
          value={String(freshness?.destinations_without_trends ?? 0)}
          helper="Butuh reprocess atau scraping"
          tone="blue"
        />
      </CardContent>
    </Card>
  );
}

function FreshnessRow({
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
  tone: 'emerald' | 'rose' | 'amber' | 'blue';
}) {
  const toneClass = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    blue: 'bg-sky-50 text-ai border-sky-100',
  }[tone];

  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
        <p className="mt-0.5 truncate text-xs font-bold text-slate-500">{helper}</p>
      </div>
    </div>
  );
}

