import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, Sparkles, Star, ThumbsUp } from 'lucide-react';

import { getDestinationCategoryLabel } from '@/lib/destination-categories';
import { getImageUrl } from '@/lib/utils';
import type { SearchDestination, SearchDestinationTopic } from './SearchResultCard';

function getImage(destination: SearchDestination) {
  const image = destination.thumbnailUrl || destination.thumbnail_url;
  return image ? getImageUrl(image) : '/images/auth-bg.jpg';
}

function getTopicLabel(topic: SearchDestinationTopic) {
  return topic.topic_name?.replace(/Topic \d+: /, '') || topic.name || 'Topik';
}

function formatRatio(value?: number) {
  if (value === undefined) return '-';
  return `${Math.round(value * 100)}%`;
}

export function SearchResultCardStatic({ destination }: { destination: SearchDestination }) {
  const topics = destination.topics?.slice(0, 3) || [];
  const positiveRatio = destination.positiveRatio ?? destination.positive_ratio;
  const score = destination.recommendationScore ?? destination.recommendation_score;
  const rating = destination.googleRating ?? destination.google_rating;
  const slug = destination.slug || String(destination.id);

  return (
    <article className="group flex h-full min-h-[34rem] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-sm shadow-slate-200/60 backdrop-blur transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/60">
      <div className="relative aspect-[16/10] shrink-0 bg-slate-100">
        <Image
          src={getImage(destination)}
          alt={destination.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/5 to-transparent" />
        <span className="absolute left-3 top-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-black text-slate-800 shadow-sm">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">{destination.city}</span>
        </span>
        <span className="absolute bottom-3 left-3 rounded-lg bg-orange-50/95 px-3 py-1 text-xs font-black text-primary shadow-sm">
          {getDestinationCategoryLabel(destination.category)}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-sky-50 px-3 py-1 text-xs font-black text-ai">AI score {score ? Math.round(score * 100) : '-'}</span>
        </div>

        <h3 className="mt-3 line-clamp-2 min-h-[3.5rem] text-2xl font-black leading-tight text-slate-950">{destination.name}</h3>
        <p className="mt-2 line-clamp-2 min-h-[3rem] text-sm font-semibold leading-6 text-slate-600">
          {destination.shortDescription || destination.short_description || destination.description || 'Deskripsi destinasi belum tersedia.'}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Metric icon={Star} label="Rating" value={rating ? rating.toFixed(1) : '-'} tone="text-amber-700 bg-amber-50" />
          <Metric icon={ThumbsUp} label="Positif" value={formatRatio(positiveRatio)} tone="text-emerald-700 bg-emerald-50" />
          <Metric icon={Sparkles} label="Topik" value={String(topics.length)} tone="text-ai bg-ai-container" />
        </div>

        <div className="mt-4 flex h-[4.5rem] flex-wrap content-start gap-2 overflow-hidden">
          {topics.length > 0 ? (
            topics.map((topic, index) => (
              <span key={`${destination.id}-${topic.id}-${index}`} className="max-w-full truncate rounded-lg border border-sky-100 bg-sky-50 px-2.5 py-1 text-[11px] font-black text-ai">
                {getTopicLabel(topic)}
              </span>
            ))
          ) : (
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-500">Topik belum tersedia</span>
          )}
        </div>

        <div className="mt-auto pt-5">
          <Link href={`/destinations/${slug}`} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-black text-white transition hover:bg-primary/90">
            Lihat detail
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Star;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className={`rounded-lg px-3 py-2 ${tone}`}>
      <div className="mb-1 flex items-center gap-1">
        <Icon className="h-3.5 w-3.5" />
        <span className="truncate text-[9px] font-black uppercase tracking-[0.08em] opacity-75">{label}</span>
      </div>
      <span className="block text-base font-black leading-none">{value}</span>
    </div>
  );
}
