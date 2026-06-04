'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BarChart3, Compass, MapPinned, Search, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const heroCopy = {
  hidden: { opacity: 0, y: 34 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: easeOutExpo },
  },
};

const heroGroup = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.18 },
  },
};

const trustCard = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
};

export function HeroSection() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const prefersReduced = useReducedMotion();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const trustItems = [
    { icon: Sparkles, label: 'AI sentiment', detail: 'Membaca pola ulasan' },
    { icon: BarChart3, label: 'Topic modelling', detail: 'Mengelompokkan vibe' },
    { icon: MapPinned, label: 'Sumatera Barat', detail: 'Fokus destinasi lokal' },
  ];

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-slate-950 pt-16">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://asset.kompas.com/crops/btQSNsdM_nKr0mxO79y2rx-VDN4=/0x0:739x493/1200x800/data/photo/2020/06/12/5ee30a504d889.jpg"
          alt="Pemandangan wisata Sumatera Barat"
          fill
          priority
          sizes="100vw"
          className={`object-cover ${!prefersReduced ? 'animate-[hero-zoom_1.5s_ease-out_forwards]' : ''}`}
          style={{ transform: prefersReduced ? 'scale(1)' : undefined }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.82)_0%,rgba(15,23,42,0.55)_44%,rgba(15,23,42,0.16)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(0deg,rgb(248,250,252)_0%,rgba(248,250,252,0)_100%)]" />
      </div>

      <div className="relative z-20 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col justify-center px-6 pb-16 pt-20 md:px-12">
        <motion.aside
          initial={prefersReduced ? false : { opacity: 0, x: 36, rotate: 2 }}
          animate={prefersReduced ? undefined : { opacity: 1, x: 0, rotate: -2 }}
          transition={{ duration: 0.72, delay: 0.72, ease: easeOutExpo }}
          className="absolute right-4 top-[56%] hidden w-[300px] -translate-y-1/2 rounded-[2rem] border-4 border-white bg-primary p-6 text-slate-950 shadow-2xl shadow-slate-950/25 2xl:right-12 2xl:block 2xl:w-[340px]"
        >
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-800/70">Trip signal</p>
          <p className="mt-3 text-3xl font-black leading-none tracking-tight">Ulasan jadi arah perjalanan.</p>
          <div className="mt-6 space-y-3">
            {['Sentimen dominan', 'Topik yang sering muncul', 'Vibe untuk dibandingkan'].map((item, index) => (
              <div key={item} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-900">
                <span>{item}</span>
                <span className="text-primary">{String(index + 1).padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </motion.aside>

        <motion.div
          variants={heroGroup}
          initial={prefersReduced ? false : 'hidden'}
          animate={prefersReduced ? undefined : 'visible'}
          className="max-w-5xl 2xl:max-w-[760px]"
        >
          <motion.span variants={heroCopy} className="mb-6 inline-flex items-center rounded-full border-2 border-white bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-slate-950 shadow-sm">
            AI Tourism Intelligence
          </motion.span>
          <motion.h1 variants={heroCopy} className="max-w-5xl text-5xl font-black leading-[0.98] tracking-tight text-white drop-shadow-md md:text-7xl xl:text-8xl 2xl:max-w-[760px]">
            Pilih destinasi dari rasa perjalanan yang Anda cari
          </motion.h1>
          <motion.p variants={heroCopy} className="mt-7 max-w-2xl text-lg font-semibold leading-8 text-slate-100 md:text-xl">
            RANAHINSIGHT membantu membaca pola ulasan, memetakan vibe, dan mengarahkan Anda ke destinasi Sumatera Barat yang paling cocok.
          </motion.p>
        </motion.div>

        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 24, scale: 0.98 }}
          animate={prefersReduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.64, delay: 0.58, ease: easeOutExpo }}
          className="mt-10 max-w-5xl 2xl:max-w-[760px]"
        >
          <motion.form
            onSubmit={handleSearch}
            transition={{ duration: 0.24, ease: easeOutExpo }}
            className="flex flex-col gap-3 rounded-[2rem] border-4 border-white bg-white p-3 shadow-2xl shadow-slate-950/25 transition-all duration-300 focus-within:-translate-y-0.5 focus-within:shadow-slate-950/30 md:flex-row md:items-center md:rounded-full"
          >
            <div className="flex min-h-14 w-full flex-1 items-center px-4 md:px-6">
              <Compass className="mr-4 h-6 w-6 shrink-0 text-primary" />
              <label htmlFor="hero-search" className="sr-only">Cari destinasi wisata</label>
              <input
                id="hero-search"
                type="text"
                placeholder="Coba: keluarga dan alam, kuliner pedas, tempat tenang"
                className="w-full bg-transparent text-base font-semibold text-slate-800 outline-none placeholder:text-slate-400 md:text-lg"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-black text-slate-950 shadow-md shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/90 active:scale-95 md:w-auto"
            >
              <Search className="h-5 w-5" />
              <span>Mulai eksplorasi</span>
            </button>
          </motion.form>

          <motion.div
            initial={prefersReduced ? false : 'hidden'}
            animate={prefersReduced ? undefined : 'visible'}
            variants={heroGroup}
            className="mt-5 flex flex-wrap items-center gap-3"
          >
            <motion.span variants={trustCard} className="text-sm font-bold text-white drop-shadow-sm">Coba cari:</motion.span>
            {['Pantai tersembunyi', 'Kuliner pedas', 'Tempat bersejarah', 'Staycation tenang'].map((tag) => (
              <motion.button
                key={tag}
                variants={trustCard}
                type="button"
                onClick={() => setQuery(tag)}
                whileHover={prefersReduced ? undefined : { y: -2 }}
                whileTap={prefersReduced ? undefined : { scale: 0.96 }}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
              >
                {tag}
              </motion.button>
            ))}
            <motion.div variants={trustCard}>
              <Link href="/compare" className="inline-flex items-center gap-1 rounded-full bg-secondary px-4 py-1.5 text-xs font-black text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-secondary/90">
                Bandingkan destinasi <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={heroGroup}
          initial={prefersReduced ? false : 'hidden'}
          animate={prefersReduced ? undefined : 'visible'}
          className="mt-12 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                variants={trustCard}
                whileHover={prefersReduced ? undefined : { y: -4, boxShadow: '0 18px 45px rgba(15, 23, 42, 0.14)' }}
                className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{item.label}</p>
                  <p className="text-xs font-semibold text-slate-500">{item.detail}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
