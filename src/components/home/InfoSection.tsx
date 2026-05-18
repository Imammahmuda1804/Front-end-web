'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BrainCircuit, Fingerprint, MessageSquareText, Tags, TrendingUp } from 'lucide-react';

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const reveal = {
  hidden: { opacity: 0, y: 26 },
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

const sentimentMeters = [
  { label: 'Positif', value: 'Kuat', width: '82%', color: 'bg-primary' },
  { label: 'Netral', value: 'Seimbang', width: '48%', color: 'bg-secondary' },
  { label: 'Negatif', value: 'Perlu cek', width: '28%', color: 'bg-slate-400' },
];

const vibeTopics = ['Budaya', 'Alam', 'Kuliner', 'Keluarga', 'Petualangan', 'Tenang'];

export function InfoSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="bg-slate-50 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <motion.div
          variants={stagger}
          initial={prefersReduced ? false : 'hidden'}
          whileInView={prefersReduced ? undefined : 'visible'}
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto mb-14 max-w-4xl text-center md:mb-16"
        >
          <motion.span variants={reveal} className="mb-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-slate-950">Kecerdasan di balik perjalanan</motion.span>
          <motion.h2 variants={reveal} className="text-4xl font-black leading-none tracking-tight text-slate-900 md:text-6xl">
            Baca pola ulasan tanpa tenggelam di banyak komentar
          </motion.h2>
          <motion.p variants={reveal} className="mt-5 text-base leading-8 text-slate-600 md:text-lg">
            RANAHINSIGHT membantu merangkum rasa perjalanan dari ulasan wisatawan: emosi yang dominan,
            topik yang sering muncul, dan karakter destinasi yang lebih mudah dibandingkan.
          </motion.p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 34, scale: 0.985 }}
            whileInView={prefersReduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.64, ease: easeOutExpo }}
            whileHover={prefersReduced ? undefined : { y: -4 }}
            className="rounded-[2rem] border-4 border-white bg-primary p-6 text-slate-950 shadow-xl shadow-orange-900/10 md:p-8 lg:p-10"
          >
            <div className="flex flex-col gap-8 md:flex-row md:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-primary">
                <BrainCircuit className="h-7 w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-slate-800">Sentiment Intelligence</p>
                <h3 className="mb-4 text-3xl font-black leading-none tracking-tight text-slate-950 md:text-4xl">
                  Ringkasan rasa, bukan sekadar rating
                </h3>
                <p className="max-w-2xl text-base font-semibold leading-8 text-slate-800">
                  Lihat apakah sebuah destinasi lebih sering dibicarakan dengan nada positif, netral,
                  atau perlu ditinjau lagi sebelum masuk itinerary.
                </p>

                <div className="mt-8 space-y-4 rounded-2xl border-2 border-slate-950 bg-white p-5">
                  {sentimentMeters.map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <span className="text-sm font-bold text-slate-800">{item.label}</span>
                        <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{item.value}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={prefersReduced ? false : { scaleX: 0 }}
                          whileInView={prefersReduced ? undefined : { scaleX: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.85, ease: easeOutExpo }}
                          className={`h-full origin-left rounded-full ${item.color}`}
                          style={{ width: item.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-2xl border-2 border-slate-950 bg-white p-4">
                    <MessageSquareText className="mt-0.5 h-5 w-5 text-secondary" />
                    <p className="text-sm font-semibold leading-6 text-slate-700">Membantu membaca tema ulasan yang berulang.</p>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border-2 border-slate-950 bg-white p-4">
                    <TrendingUp className="mt-0.5 h-5 w-5 text-primary" />
                    <p className="text-sm font-semibold leading-6 text-slate-700">Memudahkan prioritas destinasi untuk dibandingkan.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 34, scale: 0.985 }}
            whileInView={prefersReduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.64, delay: prefersReduced ? 0 : 0.12, ease: easeOutExpo }}
            whileHover={prefersReduced ? undefined : { y: -4 }}
            className="rounded-[2rem] border-4 border-white bg-secondary p-6 text-white shadow-xl shadow-blue-900/10 md:p-8 lg:p-10"
          >
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-secondary">
              <Fingerprint className="h-7 w-7" />
            </div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-white/75">Vibe Mapping</p>
            <h3 className="mb-4 text-3xl font-black leading-none tracking-tight text-white md:text-4xl">
              Taxonomy untuk menemukan karakter destinasi
            </h3>
            <p className="text-base font-semibold leading-8 text-blue-50">
              Topik ulasan dikelompokkan menjadi bahasa yang lebih praktis untuk wisatawan:
              suasana, aktivitas, dan konteks kunjungan.
            </p>

            <div className="mt-8 rounded-3xl border-2 border-white bg-white p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-black text-slate-800">
                <Tags className="h-4 w-4 text-secondary" />
                Kategori vibe
              </div>
              <motion.div
                variants={stagger}
                initial={prefersReduced ? false : 'hidden'}
                whileInView={prefersReduced ? undefined : 'visible'}
                viewport={{ once: true }}
                className="flex flex-wrap gap-3"
              >
                {vibeTopics.map((tag) => (
                  <motion.span key={tag} variants={reveal} className="rounded-full border-2 border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-800">
                    {tag}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 16 }}
              whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: prefersReduced ? 0 : 0.22, ease: easeOutExpo }}
              className="mt-6 rounded-3xl border-2 border-white bg-slate-950 px-5 py-5 text-white"
            >
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">Output yang dicari</p>
              <p className="mt-2 text-lg font-black leading-snug">Destinasi yang terasa cocok sebelum Anda berangkat.</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
