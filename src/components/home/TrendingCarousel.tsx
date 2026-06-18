'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, Star, TrendingUp } from 'lucide-react';

import { getImageUrl } from '@/lib/utils';

interface Destination {
  id: number;
  name: string;
  slug: string;
  city: string;
  thumbnailUrl?: string | null;
  description?: string | null;
  positiveRatio?: number | null;
  userRating?: number | null;
  isFallback?: boolean;
}

interface TrendingCarouselProps {
  destinations: Destination[];
}

function destinationImage(destination?: Destination) {
  return destination?.thumbnailUrl ? getImageUrl(destination.thumbnailUrl) : '/images/auth-bg.jpg';
}

function destinationDescription(destination?: Destination) {
  return destination?.description?.trim() || 'Deskripsi destinasi belum tersedia.';
}

function percentLabel(value?: number | null) {
  return `${Math.round(Math.max(0, Math.min(1, value || 0)) * 100)}%`;
}

const fallbackDestinations: Destination[] = [
  {
    id: -1,
    name: 'Ngarai Sianok',
    slug: '',
    city: 'Bukittinggi',
    thumbnailUrl: '/images/landing-motion/ngarai-sianok.png',
    description: 'Panorama lembah hijau yang cocok untuk wisata alam, foto, dan perjalanan santai.',
    positiveRatio: 0.9,
    userRating: 4.8,
    isFallback: true,
  },
  {
    id: -2,
    name: 'Lembah Harau',
    slug: '',
    city: 'Lima Puluh Kota',
    thumbnailUrl: '/images/landing-motion/lembah-harau.jpg',
    description: 'Tebing tinggi, sawah, dan suasana tenang untuk wisata keluarga maupun petualangan ringan.',
    positiveRatio: 0.88,
    userRating: 4.7,
    isFallback: true,
  },
  {
    id: -3,
    name: 'Istano Basa Pagaruyung',
    slug: '',
    city: 'Tanah Datar',
    thumbnailUrl: '/images/landing-motion/istano-basa-pagaruyung.jpg',
    description: 'Ikon budaya Minangkabau dengan arsitektur rumah gadang yang kuat secara visual.',
    positiveRatio: 0.86,
    userRating: 4.6,
    isFallback: true,
  },
  {
    id: -4,
    name: 'Masjid Raya Sumatera Barat',
    slug: '',
    city: 'Padang',
    thumbnailUrl: '/images/landing-motion/masjid-raya-sumbar.jpg',
    description: 'Destinasi arsitektur dan religi yang mudah diakses di pusat kota Padang.',
    positiveRatio: 0.84,
    userRating: 4.7,
    isFallback: true,
  },
];

function destinationHref(destination: Destination) {
  return destination.isFallback || !destination.slug ? '/destinations' : `/destinations/${destination.slug}`;
}

export function TrendingCarousel({ destinations }: TrendingCarouselProps) {
  const items = useMemo(() => {
    const source = destinations.length > 0 ? destinations : fallbackDestinations;
    return source.slice(0, 7);
  }, [destinations]);
  const [activeId, setActiveId] = useState(items[0]?.id);
  const active = items.find((item) => item.id === activeId) || items[0];

  if (!active) return null;

  return (
    <section aria-labelledby="destination-rail-title" className="bg-[oklch(0.975_0.01_62)] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <header className="mb-10 grid gap-5 border-b border-slate-300/70 pb-7 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-end">
          <div>
            <p className="editorial-kicker">Pilihan berdasarkan ulasan wisatawan</p>
            <h2
              id="destination-rail-title"
              className="mt-3 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-tight text-slate-950 md:text-6xl"
            >
              Destinasi yang layak masuk perjalanan berikutnya
            </h2>
          </div>
          <p className="max-w-lg text-sm font-medium leading-7 text-slate-600 md:text-base">
            Kurasi ini memadukan sentimen, rating, dan pola topik. Pilih satu destinasi untuk membaca konteksnya tanpa kehilangan daftar pilihan lain.
          </p>
        </header>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.65fr)] lg:gap-10">
          <article className="group relative min-h-[34rem] overflow-hidden rounded-lg bg-slate-950 md:min-h-[42rem]">
            <Image
              key={active.id}
              src={destinationImage(active)}
              alt={active.name}
              fill
              priority={false}
              sizes="(max-width: 1024px) 100vw, 68vw"
              className="object-cover transition-[opacity,transform] duration-[480ms] ease-[var(--ease-ui-out)] motion-safe:group-hover:scale-[1.015]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_20%,rgba(15,23,42,0.9)_100%)]" />

            <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-9">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-white/82">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  {active.city}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {active.userRating?.toFixed(1) || 'Baru'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  {percentLabel(active.positiveRatio)} ulasan positif
                </span>
              </div>

              <h3 className="mt-4 max-w-3xl text-4xl font-extrabold leading-none tracking-tight md:text-6xl">
                {active.name}
              </h3>
              <p className="mt-4 line-clamp-3 max-w-2xl text-sm font-medium leading-7 text-slate-200 md:text-base">
                {destinationDescription(active)}
              </p>
              <Link
                href={destinationHref(active)}
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-white transition-[background-color,transform] duration-150 ease-[var(--ease-ui-out)] hover:bg-primary/90 active:scale-[0.98]"
              >
                {active.isFallback ? 'Lihat katalog destinasi' : 'Baca detail destinasi'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>

          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between border-b border-slate-300/70 pb-3">
              <p className="text-sm font-bold text-slate-950">Daftar kurasi</p>
              <p className="text-xs font-semibold text-slate-500">{items.length} destinasi</p>
            </div>

            <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible">
              {items.map((destination, index) => {
                const selected = destination.id === active.id;
                return (
                  <button
                    key={destination.id}
                    type="button"
                    onClick={() => setActiveId(destination.id)}
                    aria-pressed={selected}
                    className={`group/rail grid min-w-[17rem] grid-cols-[4.75rem_minmax(0,1fr)_auto] items-center gap-3 border-b px-2 py-3 text-left transition-[background-color,border-color,color] duration-150 ease-[var(--ease-ui-out)] lg:min-w-0 ${
                      selected
                        ? 'border-primary bg-orange-50/80'
                        : 'border-slate-200/80 hover:border-orange-200 hover:bg-white/65'
                    }`}
                  >
                    <span className="relative aspect-square overflow-hidden rounded-md bg-slate-200">
                      <Image
                        src={destinationImage(destination)}
                        alt=""
                        fill
                        sizes="76px"
                        className="object-cover transition-transform duration-300 ease-[var(--ease-ui-out)] motion-safe:group-hover/rail:scale-[1.03]"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-bold text-primary">
                        {String(index + 1).padStart(2, '0')} - {destination.city}
                      </span>
                      <span className="mt-1 block line-clamp-2 text-base font-bold leading-snug text-slate-900">
                        {destination.name}
                      </span>
                      <span className="mt-1 block text-xs font-medium text-slate-500">
                        {percentLabel(destination.positiveRatio)} positif
                      </span>
                    </span>
                    <ArrowRight
                      className={`h-4 w-4 transition-transform duration-150 ${
                        selected ? 'translate-x-0 text-primary' : '-translate-x-1 text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
