'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ImageIcon, MapPin, Sparkles, Star } from 'lucide-react';

import { getDestinationCategoryLabel } from '@/lib/destination-categories';
import { getImageUrl } from '@/lib/utils';

export interface SearchDestinationTopic {
  id: number;
  name?: string;
  topic_name?: string;
}

export interface SearchDestination {
  id: number;
  name: string;
  slug: string;
  city: string;
  category?: string | null;
  description?: string;
  short_description?: string;
  shortDescription?: string;
  thumbnail_url?: string;
  thumbnailUrl?: string;
  hybrid_score?: number;
  similarity?: number;
  positive_ratio?: number;
  positiveRatio?: number;
  recommendation_score?: number;
  recommendationScore?: number;
  google_rating?: number;
  googleRating?: number;
  topics?: SearchDestinationTopic[];
}

type SearchResultCardProps = {
  destination: SearchDestination;
  index: number;
  searchMode: 'keyword' | 'semantic';
  prefersReduced: boolean;
  featured?: boolean;
};

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const getDestinationImage = (destination: SearchDestination) =>
  destination.thumbnail_url || destination.thumbnailUrl ? getImageUrl(destination.thumbnail_url || destination.thumbnailUrl) : '/images/auth-bg.jpg';

const getDestinationPositiveRatio = (destination: SearchDestination) => destination.positive_ratio ?? destination.positiveRatio;
const getDestinationScore = (destination: SearchDestination) => destination.recommendation_score ?? destination.recommendationScore;
export const getDestinationMatch = (destination: SearchDestination) => destination.hybrid_score ?? destination.similarity;

const getDestinationTopicLabel = (topic: SearchDestinationTopic) =>
  topic.topic_name?.replace(/Topic \d+: /, '') || topic.name || 'Nuansa';

const getDestinationDescription = (destination: SearchDestination) => {
  const rawDescription = destination.short_description || destination.shortDescription || destination.description;
  const cleanDescription = rawDescription?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

  if (cleanDescription) return cleanDescription;

  const topicNames = destination.topics?.slice(0, 2).map(getDestinationTopicLabel).join(' dan ');
  return topicNames
    ? `${destination.name} berada di ${destination.city}, cocok untuk pencarian dengan nuansa ${topicNames.toLowerCase()}.`
    : `${destination.name} berada di ${destination.city}, cocok untuk dijelajahi lebih lanjut berdasarkan pola ulasan dan relevansi pencarian Anda.`;
};

const formatPercent = (value?: number) => (value !== undefined ? `${(value * 100).toFixed(0)}%` : 'N/A');

export default function SearchResultCard({
  destination,
  index,
  searchMode,
  prefersReduced,
  featured = false,
}: SearchResultCardProps) {
  const positiveRatio = getDestinationPositiveRatio(destination);
  const recommendationScore = getDestinationScore(destination);
  const matchScore = getDestinationMatch(destination);
  const description = getDestinationDescription(destination);
  const topTopics = destination.topics?.slice(0, 3) || [];

  return (
    <motion.article
      initial={prefersReduced ? false : { opacity: 0, y: 18 }}
      animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: Math.min(index * 0.04, 0.16), ease: easeOutExpo }}
      className={`group overflow-hidden rounded-lg border bg-white shadow-sm shadow-slate-200/60 transition-[border-color,box-shadow] duration-200 hover:border-orange-200 hover:shadow-md hover:shadow-slate-200/70 ${
        featured ? 'border-explore/20 bg-surface-warm' : 'border-slate-200'
      }`}
    >
      <Link href={`/destinations/${destination.slug}`} className="block h-full">
        <div className={`${featured ? 'xl:grid xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-stretch' : 'grid h-full min-h-48 grid-cols-[9rem_minmax(0,1fr)] md:grid-cols-[11rem_minmax(0,1fr)] xl:min-h-52'}`}>
          <div className={`relative overflow-hidden ${featured ? 'h-56 xl:h-full xl:min-h-[300px]' : 'min-h-48 xl:min-h-52'}`}>
            <Image
              src={getDestinationImage(destination)}
              alt={destination.name}
              fill
              sizes={featured ? '(max-width: 1280px) 100vw, 55vw' : '(max-width: 768px) 35vw, 12vw'}
              className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
            />
            {!featured && (
              <div className="absolute inset-x-2 bottom-2 rounded-lg bg-white/95 px-2 py-1 text-center text-[11px] font-black text-emerald-500 shadow-sm">
                {searchMode === 'semantic' && matchScore !== undefined ? `${formatPercent(matchScore)} sesuai` : 'Detail'}
              </div>
            )}
            <div className={`absolute flex flex-wrap gap-2 ${featured ? 'left-4 top-4' : 'left-2 top-2'}`}>
              {featured && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-white bg-explore px-3 py-1.5 text-xs font-black text-white shadow-sm">
                  {searchMode === 'semantic' ? <Sparkles className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5 fill-white" />}
                  {searchMode === 'semantic' ? 'Paling sesuai' : 'Hasil teratas'}
                </span>
              )}
              {searchMode === 'semantic' && matchScore !== undefined && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-white bg-ai px-3 py-1.5 text-xs font-black text-white shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                  {(matchScore * 100).toFixed(0)}% sesuai
                </span>
              )}
            </div>
          </div>

          <div className={`min-w-0 flex flex-1 flex-col ${featured ? 'p-5 md:p-6 xl:min-h-[300px]' : 'p-4 md:p-5'}`}>
            <div className={`${featured ? 'mb-3' : 'mb-2'} flex items-start justify-between gap-3`}>
              <div className="min-w-0">
                <h3 className={`line-clamp-2 font-black leading-tight tracking-tight text-slate-900 ${featured ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`}>
                  {destination.name}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">{destination.city}</span>
                </p>
              </div>

              {recommendationScore !== undefined && featured && (
                <div className="shrink-0 rounded-lg bg-ai-container px-2.5 py-1.5 text-right text-amber-500">
                  <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-amber/75">Skor rekomendasi</span>
                  <span className={`${featured ? 'text-2xl' : 'text-xl'} font-black leading-none text-emerald-400`}>{(recommendationScore * 100).toFixed(0)}</span>
                </div>
              )}
            </div>

            <div className={`${featured ? 'mb-4' : 'mb-3'} flex flex-wrap gap-1.5`}>
              <span className="rounded-lg border border-explore/15 bg-explore-container px-2.5 py-1 text-[11px] font-black text-explore">
                {getDestinationCategoryLabel(destination.category)}
              </span>
              {topTopics.map((topic, topicIndex) => (
                <span key={`${destination.id}-top-topic-${topic.id}-${topicIndex}`} className="max-w-full truncate rounded-lg border border-ai/15 bg-white px-2.5 py-1 text-[11px] font-extrabold text-amber-500">
                  {topicIndex === 0 ? 'Paling dibahas: ' : ''}
                  {getDestinationTopicLabel(topic)}
                </span>
              ))}
            </div>

            {featured && (
              <p className="mb-4 line-clamp-4 text-sm font-semibold leading-7 text-slate-600 md:text-[15px]">
                {description}
              </p>
            )}

            <div className={`${featured ? 'border-t border-slate-100 pt-3' : ''} mt-auto flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success-container">
                  <Star className="h-3.5 w-3.5 fill-success text-success" />
                </div>
                <span>
                  Positif: <span className="font-black text-slate-900">{formatPercent(positiveRatio)}</span>
                </span>
              </div>
              <span className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-lg bg-amber-200 px-3.5 text-sm font-black text-amber-400 transition-colors group-hover:bg-amber-500/10 group-hover:text-amber-500">
                <ImageIcon className="h-4 w-4" />
                {featured ? 'Lihat detail' : 'Buka'}
                <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
