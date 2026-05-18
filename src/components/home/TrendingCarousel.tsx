'use client';

import * as React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Star, TrendingUp } from 'lucide-react';
import { useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

import { getImageUrl } from '@/lib/utils';

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const sectionReveal = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: easeOutExpo },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09 },
  },
};

interface Destination {
  id: number;
  name: string;
  slug: string;
  city: string;
  thumbnailUrl: string;
  positiveRatio: number;
  userRating: number;
}

interface TrendingCarouselProps {
  destinations: Destination[];
}

export function TrendingCarousel({ destinations }: TrendingCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  const prefersReduced = useReducedMotion();

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!destinations || destinations.length === 0) {
    return null;
  }

  return (
    <section aria-label="Destinasi dengan sentimen terbaik" className="relative overflow-hidden bg-[#FFF3EC] py-24 md:py-28">
      <div className="pointer-events-none absolute -right-12 top-10 hidden rounded-[3rem] bg-primary px-10 py-6 text-7xl font-black tracking-tighter text-slate-950/10 md:block">
        SENTIMEN  
      </div>
      <div className="mx-auto mb-10 flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-end md:justify-between md:px-12">
        <motion.div
          variants={stagger}
          initial={prefersReduced ? false : 'hidden'}
          whileInView={prefersReduced ? undefined : 'visible'}
          viewport={{ once: true }}
        >
          <motion.span variants={sectionReveal} className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-primary">Pilihan berbasis ulasan</motion.span>
          <motion.h2 variants={sectionReveal} className="mt-5 max-w-4xl text-4xl font-black leading-none tracking-tight text-slate-900 md:text-6xl">
            Destinasi dengan sentimen terbaik
          </motion.h2>
          <motion.p variants={sectionReveal} className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Mulai dari destinasi yang sedang punya pola respons positif, lalu baca detailnya sebelum menentukan rute perjalanan.
          </motion.p>
        </motion.div>

        <div className="flex items-center gap-3">
          <Link href="/search" className="hidden rounded-full border-2 border-slate-900 bg-white px-5 py-3 text-sm font-black text-slate-900 transition-colors hover:bg-slate-900 hover:text-primary md:inline-flex">
            Lihat semua
          </Link>
          <motion.button
            onClick={scrollPrev}
            aria-label="Destinasi sebelumnya"
            whileHover={prefersReduced ? undefined : { y: -2 }}
            whileTap={prefersReduced ? undefined : { scale: 0.94 }}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-900 bg-white text-slate-900 transition-all hover:bg-slate-900 hover:text-primary active:scale-95"
          >
            <ChevronLeft className="h-6 w-6" />
          </motion.button>
          <motion.button
            onClick={scrollNext}
            aria-label="Destinasi berikutnya"
            whileHover={prefersReduced ? undefined : { y: -2 }}
            whileTap={prefersReduced ? undefined : { scale: 0.94 }}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-900 bg-primary text-slate-950 shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
          >
            <ChevronRight className="h-6 w-6" />
          </motion.button>
        </div>
      </div>

      <div className="overflow-hidden px-6 pb-12 md:px-12" ref={emblaRef}>
        <div className="flex gap-6">
          {destinations.map((dest, index) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReduced ? 0 : 0.5, delay: prefersReduced ? 0 : Math.min(index * 0.08, 0.24) }}
              key={dest.id}
              className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0"
            >
              <motion.div
                whileHover={prefersReduced ? undefined : { y: -6, scale: 1.01 }}
                transition={{ duration: 0.32, ease: easeOutExpo }}
              >
              <Link href={`/destinations/${dest.slug}`} className="group relative block h-[500px] overflow-hidden rounded-[2rem] border-4 border-white bg-slate-900 shadow-xl shadow-orange-900/10 transition-shadow duration-500 hover:shadow-2xl">
                <Image
                  src={dest.thumbnailUrl ? getImageUrl(dest.thumbnailUrl) : '/images/auth-bg.jpg'}
                  alt={dest.name}
                  fill
                  sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 30vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/5" />

                <div className="absolute inset-0 flex flex-col justify-between p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                      <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                      <span className="text-sm font-black text-slate-900">{dest.userRating ? dest.userRating.toFixed(1) : 'Baru'}</span>
                    </div>
                    <span className="rounded-full border border-slate-900 bg-primary px-3 py-1.5 text-xs font-black uppercase tracking-wider text-slate-950">
                      AI pick
                    </span>
                  </div>

                  <div>
                    <h3 className="mb-2 text-3xl font-black leading-none text-white drop-shadow-md">{dest.name}</h3>
                    <div className="mb-4 flex items-center text-sm font-semibold text-white/85">
                      <MapPin className="mr-1 h-4 w-4" />
                      <span>{dest.city}</span>
                    </div>

                    <div className="rounded-2xl border-2 border-white bg-slate-700 p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-white/70">
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                          Sentimen
                        </span>
                        <span className="text-sm font-black text-emerald-300">{((dest.positiveRatio || 0) * 100).toFixed(0)}% positif</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                        <motion.div
                          initial={prefersReduced ? false : { scaleX: 0 }}
                          whileInView={prefersReduced ? undefined : { scaleX: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.7, delay: prefersReduced ? 0 : 0.2, ease: easeOutExpo }}
                          className="h-full origin-left rounded-full bg-emerald-400"
                          style={{ width: `${Math.min(100, Math.max(0, (dest.positiveRatio || 0) * 100))}%` }}
                        />
                      </div>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-white">
                        Lihat detail <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
