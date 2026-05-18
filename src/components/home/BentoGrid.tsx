'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Compass, GitCompare, Map, UserPlus } from 'lucide-react';
import Link from 'next/link';

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const reveal = {
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
    transition: { staggerChildren: 0.1 },
  },
};

const ctaPanels = [
  {
    icon: GitCompare,
    title: 'Bandingkan vibe',
    body: 'Letakkan beberapa destinasi berdampingan untuk melihat perbedaan sentimen dan topik utama.',
  },
  {
    icon: Map,
    title: 'Susun shortlist',
    body: 'Gunakan hasil eksplorasi untuk memilih tempat yang paling cocok dengan gaya perjalanan Anda.',
  },
];

export function BentoGrid() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="bg-[#F7F8FA] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <motion.div
          variants={stagger}
          initial={prefersReduced ? false : 'hidden'}
          whileInView={prefersReduced ? undefined : 'visible'}
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
        >
          <motion.div
            variants={reveal}
            whileHover={prefersReduced ? undefined : { y: -4 }}
            className="rounded-[2rem] border-4 border-white bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/15 md:p-10 lg:p-12"
          >
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-slate-950">
              <Compass className="h-7 w-7" />
            </div>
            <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-primary">Mulai eksplorasi</p>
            <h2 className="max-w-3xl text-4xl font-black leading-none tracking-tight text-white md:text-6xl">
              Temukan destinasi yang cocok dengan rasa perjalanan Anda
            </h2>
            <p className="mt-6 max-w-2xl text-base font-semibold leading-8 text-slate-300 md:text-lg">
              Baca pola ulasan, bandingkan vibe, lalu pilih destinasi yang cocok tanpa perlu
              membuka terlalu banyak tab dan komentar satu per satu.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/search"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-black text-slate-950 shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-md"
              >
                Mulai eksplorasi
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-white bg-white px-7 py-3 text-sm font-black text-slate-900 transition-colors hover:bg-orange-50 hover:text-primary"
              >
                <UserPlus className="h-4 w-4" />
                Buat akun
              </Link>
            </div>
          </motion.div>

          <div className="grid gap-6">
            {ctaPanels.map((panel, index) => {
              const Icon = panel.icon;

              return (
                <motion.div
                  key={panel.title}
                  variants={reveal}
                  whileHover={prefersReduced ? undefined : { y: -4, boxShadow: '0 18px 45px rgba(15, 23, 42, 0.10)' }}
                  transition={{ duration: 0.32, delay: prefersReduced ? 0 : 0.05 * index, ease: easeOutExpo }}
                  className={`rounded-[2rem] border-4 border-white p-6 shadow-xl md:p-8 ${
                    index === 0 ? 'bg-primary text-slate-950 shadow-orange-900/10' : 'bg-secondary text-white shadow-blue-900/10'
                  }`}
                >
                  <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${
                    index === 0 ? 'bg-slate-950 text-primary' : 'bg-white text-secondary'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-black leading-none tracking-tight">{panel.title}</h3>
                  <p className={`mt-4 text-sm font-semibold leading-7 ${index === 0 ? 'text-slate-800' : 'text-blue-50'}`}>{panel.body}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
