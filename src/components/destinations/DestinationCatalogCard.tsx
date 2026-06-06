import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, GitCompareArrows, MapPin, Plus, Route as RouteIcon, Sparkles, Star, ThumbsUp } from 'lucide-react';
import { getDestinationCategoryLabel } from '@/lib/destination-categories';
import { getImageUrl } from '@/lib/utils';
import type { SearchDestination, SearchDestinationTopic } from '@/components/search/SearchResultCard';

type DestinationCatalogCardProps = {
  destination: SearchDestination;
  index: number;
};

const getImage = (destination: SearchDestination) =>
  destination.thumbnailUrl || destination.thumbnail_url
    ? getImageUrl(destination.thumbnailUrl || destination.thumbnail_url)
    : '/images/auth-bg.jpg';

const getTopicLabel = (topic: SearchDestinationTopic) =>
  topic.topic_name?.replace(/Topic \d+: /, '') || topic.name || 'Vibe';

const getDescription = (destination: SearchDestination) => {
  const raw = destination.shortDescription || destination.short_description || destination.description;
  const clean = raw?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (clean) return clean;
  return `${destination.name} di ${destination.city} siap dijelajahi lewat insight ulasan, topik, dan rekomendasi AI.`;
};

const formatPercent = (value?: number) => (value !== undefined ? `${Math.round(value * 100)}%` : 'N/A');
const formatScore = (value?: number) => (value !== undefined ? Math.round(value * 100).toString() : '-');

export function DestinationCatalogCard({ destination, index }: DestinationCatalogCardProps) {
  const topics = destination.topics?.slice(0, 2) || [];
  const positiveRatio = destination.positiveRatio ?? destination.positive_ratio;
  const score = destination.recommendationScore ?? destination.recommendation_score;
  const isFeatured = index === 0;

  return (
    <article className={`group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white/95 shadow-sm shadow-slate-900/[0.04] transition-[border-color,box-shadow] duration-200 hover:border-orange-200 hover:shadow-md ${
      isFeatured ? 'md:col-span-2 xl:col-span-2' : ''
    }`}>
      <div className={`relative overflow-hidden bg-slate-100 ${isFeatured ? 'aspect-[16/8]' : 'aspect-[4/3]'}`}>
        <Image
          src={getImage(destination)}
          alt={destination.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-[420ms] ease-[var(--ease-ui-out)] motion-safe:group-hover:scale-[1.025]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-xs font-black text-primary shadow-sm">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-black text-slate-800 shadow-sm">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {destination.city}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="mb-2 inline-flex rounded-lg bg-orange-50 px-3 py-1 text-xs font-black text-primary">
            {getDestinationCategoryLabel(destination.category)}
          </p>
          <h2 className={`line-clamp-2 font-extrabold leading-tight tracking-tight text-white drop-shadow-sm ${isFeatured ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
            {destination.name}
          </h2>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="line-clamp-3 min-h-[4.5rem] text-sm font-semibold leading-6 text-slate-600">{getDescription(destination)}</p>

        <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200 py-3">
          <Metric icon={Sparkles} label="Skor" value={formatScore(score)} tone="text-ai bg-ai-container" />
          <Metric icon={ThumbsUp} label="Positif" value={formatPercent(positiveRatio)} tone="text-emerald-700 bg-emerald-50" />
          <Metric icon={Star} label="Rating" value={(destination.googleRating ?? destination.google_rating)?.toFixed(1) || '-'} tone="text-amber-700 bg-amber-50" />
        </div>

        <div className="mt-4 h-7 overflow-hidden">
          {topics.length > 0 ? (
            <span className="block max-w-full truncate rounded-md border border-sky-100 bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-ai" title={getTopicLabel(topics[0])}>
              Topik utama: {getTopicLabel(topics[0])}
            </span>
          ) : (
            <span className="w-fit rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">Topik belum tersedia</span>
          )}
        </div>

        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-5">
          <Link href={`/destinations/${destination.slug}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white transition-colors hover:bg-primary/90">
            Detail
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`/compare?d1=${destination.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-sky-100 bg-sky-50 px-4 text-sm font-bold text-ai transition-colors hover:border-ai/30">
            <GitCompareArrows className="h-4 w-4" />
            <span className="sr-only">Bandingkan {destination.name}</span>
          </Link>
        </div>
        <Link href={`/routes/new?destinationId=${destination.id}`} className="mt-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-orange-100 bg-orange-50 px-4 text-xs font-bold text-primary transition-colors hover:border-primary/30">
          <RouteIcon className="h-4 w-4" />
          <Plus className="h-3.5 w-3.5" />
          Tambahkan ke rute
        </Link>
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
  icon: typeof Sparkles;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="px-3 first:pl-0 last:pr-0">
      <div className={`mb-1 flex items-center gap-1 ${tone.split(' ')[0]}`}>
        <Icon className="h-3.5 w-3.5" />
        <span className="truncate text-[10px] font-semibold text-slate-500">{label}</span>
      </div>
      <span className="block text-base font-extrabold leading-none text-slate-950">{value}</span>
    </div>
  );
}
