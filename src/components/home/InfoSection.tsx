'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BrainCircuit, MessageSquareText, Tags, TrendingUp } from 'lucide-react';

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const sentimentMeters = [
  { label: 'Positif', value: '82%', width: '82%', color: 'bg-emerald-600' },
  { label: 'Netral', value: '48%', width: '48%', color: 'bg-ai' },
  { label: 'Perlu perhatian', value: '28%', width: '28%', color: 'bg-rose-500' },
];

const signals = [
  {
    icon: MessageSquareText,
    title: 'Rangkum ribuan ulasan',
    body: 'Komentar yang berulang diubah menjadi sinyal yang bisa dipindai dengan cepat.',
  },
  {
    icon: Tags,
    title: 'Kenali karakter tempat',
    body: 'Topik menunjukkan pengalaman yang menonjol, bukan hanya kategori destinasi.',
  },
  {
    icon: TrendingUp,
    title: 'Bandingkan dengan konteks',
    body: 'Rating, sentimen, dan risiko dibaca bersama sebelum menentukan pilihan.',
  },
];

export function InfoSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="border-y border-slate-200/80 bg-white/92 py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:px-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 18 }}
          whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.46, ease: easeOutExpo }}
          className="lg:sticky lg:top-28 lg:h-fit"
        >
          <p className="editorial-kicker">Cara membaca RANAHINSIGHT</p>
          <h2 className="mt-4 text-4xl font-extrabold leading-[1.03] tracking-tight text-slate-950 md:text-5xl">
            Dari suara wisatawan menjadi keputusan perjalanan
          </h2>
          <p className="mt-5 max-w-xl text-base font-medium leading-8 text-slate-600">
            Sistem tidak menggantikan pengalaman manusia. Ia menyusun pola dari ulasan agar Anda tahu apa yang disukai, apa yang perlu dicek, dan destinasi mana yang paling relevan.
          </p>

          <div className="mt-9 border-t border-slate-200">
            {signals.map(({ icon: Icon, title, body }, index) => (
              <div key={title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-b border-slate-200 py-5">
                <span className="text-sm font-bold text-primary">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-500" />
                    <h3 className="font-bold text-slate-950">{title}</h3>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 22 }}
          whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: prefersReduced ? 0 : 0.06, ease: easeOutExpo }}
          className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-white"
        >
          <div className="grid gap-8 border-b border-white/10 p-6 md:grid-cols-[1fr_auto] md:p-9">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-orange-300">Contoh pembacaan sentimen</p>
              <h3 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight md:text-4xl">
                Ringkasan rasa yang tetap menunjukkan ketidakpastian
              </h3>
            </div>
            <BrainCircuit className="h-10 w-10 text-primary" />
          </div>

          <div className="p-6 md:p-9">
            <div className="space-y-6">
              {sentimentMeters.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <span className="font-semibold text-slate-200">{item.label}</span>
                    <span className="font-bold text-white">{item.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden bg-white/10">
                    <motion.div
                      initial={prefersReduced ? false : { scaleX: 0 }}
                      whileInView={prefersReduced ? undefined : { scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, ease: easeOutExpo }}
                      className={`h-full origin-left ${item.color}`}
                      style={{ width: item.width }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-3">
              {['Pemandangan menenangkan', 'Akses perlu dicek', 'Cocok untuk keluarga'].map((topic) => (
                <div key={topic} className="bg-slate-950 p-4">
                  <p className="text-xs font-semibold leading-5 text-slate-300">{topic}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
