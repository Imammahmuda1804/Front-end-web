import Image from 'next/image';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { Star } from 'lucide-react';

import type { UserReview } from './detail.types';

dayjs.locale('id');

export function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
      <p className="mt-2 text-sm font-semibold leading-7 text-slate-600 sm:text-base">{description}</p>
    </div>
  );
}

export function MetricCard({ label, value, suffix, tone }: { label: string; value: string; suffix?: string; tone: 'orange' | 'blue' | 'emerald' }) {
  const toneClass = {
    orange: 'border-orange-200 bg-white text-primary',
    blue: 'border-sky-200 bg-white text-ai',
    emerald: 'border-emerald-200 bg-white text-emerald-600',
  }[tone];

  return (
    <div className={`rounded-lg border p-4 shadow-sm ${toneClass}`}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <div className="mt-2 flex items-end gap-1">
        <span className="text-3xl font-black leading-none">{value}</span>
        {suffix && <span className="text-sm font-black text-slate-500">{suffix}</span>}
      </div>
    </div>
  );
}

export function InfoTile({
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
  tone: 'orange' | 'blue' | 'emerald' | 'slate';
}) {
  const toneClass = {
    orange: 'bg-orange-50 text-primary border-orange-100',
    blue: 'bg-sky-50 text-ai border-sky-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-200',
  }[tone];

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-5">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg border ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{helper}</p>
    </div>
  );
}

export function InsightPill({
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
  tone: 'emerald' | 'blue' | 'amber';
}) {
  const toneClass = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-sky-50 text-ai border-sky-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
  }[tone];

  return (
    <div className={`rounded-lg border p-3 ${toneClass}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] opacity-80">{label}</p>
          <p className="mt-1 truncate text-sm font-black text-slate-950">{value}</p>
          <p className="text-xs font-bold opacity-80">{helper}</p>
        </div>
      </div>
    </div>
  );
}

export function ReviewCard({ review }: { review: UserReview }) {
  const profileSrc = review.user.profilePicture
    ? review.user.profilePicture.startsWith('http')
      ? review.user.profilePicture
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${review.user.profilePicture.startsWith('/') ? '' : '/'}${review.user.profilePicture}`
    : null;

  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50/70 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-sm font-black text-primary">
            {profileSrc ? (
              <Image src={profileSrc} alt={review.user.name} width={44} height={44} className="h-full w-full object-cover" />
            ) : (
              review.user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-black text-slate-950">{review.user.name}</p>
            <p className="text-xs font-bold text-slate-500">{dayjs(review.createdAt).format('DD MMMM YYYY')}</p>
          </div>
        </div>
        <div className="flex shrink-0">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-orange-400 text-orange-400' : 'fill-slate-200 text-slate-200'}`} />
          ))}
        </div>
      </div>
      <p className="mt-4 line-clamp-4 text-sm font-medium leading-7 text-slate-700">
        {review.reviewText || 'Pengguna memberikan rating tanpa menulis ulasan.'}
      </p>
    </article>
  );
}
