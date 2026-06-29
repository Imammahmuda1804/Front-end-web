import Image from 'next/image';
import { motion } from 'framer-motion';
import { AlertTriangle, MapPin, Navigation, PlayCircle, Sparkles } from 'lucide-react';
import type { ComponentProps } from 'react';

import type { DestinationDetail } from './detail.types';
import { ratingText } from './detail.utils';
import { MetricCard } from './detail.ui';

export function DestinationHeroSection({
  destination,
  thumbUrl,
  tags,
  heroDescription,
  aiScore,
  positivePercentage,
  googleRating,
  hasMapsUrl,
  motionProps,
}: {
  destination: DestinationDetail;
  thumbUrl: string | null;
  tags: string[];
  heroDescription: string;
  aiScore: number | null;
  positivePercentage: string;
  googleRating: number;
  hasMapsUrl: boolean;
  motionProps: ComponentProps<typeof motion.section>;
}) {
  return (
    <motion.section
      {...motionProps}
      className="overflow-hidden rounded-lg border border-orange-200 bg-orange-50/60 shadow-xl shadow-orange-100/50"
      aria-labelledby="destination-title"
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.12fr)_minmax(26rem,0.88fr)]">
        <div className="relative min-h-[21rem] overflow-hidden bg-slate-200 sm:min-h-[28rem] lg:min-h-[35rem]">
          <Image
            src={thumbUrl || '/images/auth-bg.jpg'}
            alt={destination.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/45 to-transparent" />
          <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-md bg-white px-3 py-1.5 text-xs font-extrabold text-slate-800 shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-8 p-6 sm:p-8 lg:p-10">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-orange-200">
              <Sparkles className="h-4 w-4" />
              Ringkasan Destinasi
            </div>

            <div className="max-w-2xl">
              <h1 id="destination-title" className="text-4xl font-black leading-[0.98] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                {destination.name}
              </h1>
              <p className="mt-4 flex items-center gap-2 text-base font-bold text-white sm:text-lg">
                <MapPin className="h-5 w-5 text-amber-500" />
                {destination.city}, {destination.province}
              </p>
            </div>

            <p className="line-clamp-2 max-w-2xl text-base font-medium leading-8 text-slate-700">
              {heroDescription}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="Skor AI" value={aiScore !== null ? String(aiScore) : 'N/A'} tone="amber" suffix={aiScore !== null ? '/100' : undefined} />
            <MetricCard label="Sentimen positif" value={positivePercentage} tone="emerald" />
            <MetricCard label="Rating Google" value={ratingText(googleRating)} tone="amber" suffix="/5" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {hasMapsUrl ? (
              <a
                href={destination.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-primary/20"
              >
                <Navigation className="h-4 w-4" />
                Buka Google Maps
              </a>
            ) : (
              <div className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-6 py-3 text-center text-sm font-black text-slate-500">
                <AlertTriangle className="h-4 w-4" />
                Maps belum tersedia
              </div>
            )}
            {destination.youtubeUrl && (
              <a
                href="#trailer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-sky-200 bg-white px-6 py-3 text-sm font-bold text-red-500 shadow-sm transition-[border-color,background-color,transform] duration-150 hover:border-ai active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-sky-100"
              >
                <PlayCircle className="h-4 w-4" />
                Lihat Trailer
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

