'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Compass, Search } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const heroCopy = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: easeOutExpo },
  },
};

const heroGroup = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.12 },
  },
};

export function HeroSection() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const prefersReduced = useReducedMotion();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedQuery = query.trim();
    router.push(normalizedQuery ? `/search?q=${encodeURIComponent(normalizedQuery)}` : '/search');
  };

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden bg-slate-950">
      <div className="absolute inset-0">
        <Image
          src="/images/sumbar-tourism-bg-optimized.jpg"
          alt="Bentang alam Sumatera Barat"
          fill
          priority
          sizes="100vw"
          className={`object-cover ${prefersReduced ? '' : 'animate-[hero-zoom_1.5s_ease-out_forwards]'}`}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,18,32,0.84)_0%,rgba(10,18,32,0.62)_48%,rgba(10,18,32,0.2)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(0deg,rgba(248,250,252,0.96)_0%,rgba(248,250,252,0)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-7xl items-center px-6 pb-24 pt-28 md:px-12 md:pb-28">
        <motion.div
          variants={heroGroup}
          initial={prefersReduced ? false : 'hidden'}
          animate={prefersReduced ? undefined : 'visible'}
          className="max-w-4xl"
        >
          <motion.p variants={heroCopy} className="mb-5 text-sm font-bold text-orange-200">
            Insight wisata dari ulasan nyata
          </motion.p>
          <motion.h1 variants={heroCopy} className="max-w-4xl text-5xl font-extrabold leading-[1.02] tracking-tight text-white drop-shadow-sm md:text-7xl xl:text-8xl">
            Temukan perjalanan yang terasa tepat
          </motion.h1>
          <motion.p variants={heroCopy} className="mt-6 max-w-2xl text-base font-medium leading-7 text-slate-100 md:text-xl md:leading-8">
            Jelajahi destinasi Sumatera Barat melalui sentimen, topik ulasan, dan rekomendasi yang mudah dibandingkan.
          </motion.p>

          <motion.form
            variants={heroCopy}
            onSubmit={handleSearch}
            className="mt-9 flex max-w-3xl flex-col gap-2 rounded-xl border border-white/70 bg-white/95 p-2 shadow-2xl shadow-slate-950/25 sm:flex-row sm:items-center"
          >
            <div className="flex min-h-14 flex-1 items-center px-3 sm:px-4">
              <Compass className="mr-3 h-5 w-5 shrink-0 text-primary" />
              <label htmlFor="hero-search" className="sr-only">Cari destinasi wisata</label>
              <input
                id="hero-search"
                type="search"
                placeholder="Cari suasana, aktivitas, atau nama destinasi"
                className="w-full bg-transparent text-base font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-white transition-[transform,background-color] duration-150 hover:bg-primary/90 active:scale-[0.98]"
            >
              <Search className="h-4 w-4" />
              Eksplorasi
            </button>
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
}
