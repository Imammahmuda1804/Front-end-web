'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, GitCompare, Map, UserPlus } from 'lucide-react';
import Link from 'next/link';

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export function BentoGrid() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="bg-[oklch(0.23_0.025_255)] py-20 text-white md:py-28">
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 20 }}
        whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: easeOutExpo }}
        className="mx-auto max-w-7xl px-6 md:px-12"
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-orange-300">Mulai menyusun perjalanan</p>
            <h2 className="mt-4 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-tight md:text-6xl">
              Pilih dengan data, lalu tetap beri ruang untuk rasa penasaran
            </h2>
            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-slate-300">
              Eksplorasi destinasi, bandingkan karakter, dan susun rute yang dapat digunakan kembali saat perjalanan dimulai.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link
              href="/search"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-white transition-[background-color,transform] duration-150 ease-[var(--ease-ui-out)] hover:bg-primary/90 active:scale-[0.98]"
            >
              Mulai eksplorasi
              <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/25 px-6 text-sm font-bold text-white transition-colors duration-150 hover:bg-white/[0.08]"
            >
              <UserPlus className="h-4 w-4" />
              Buat akun
            </Link>
          </div>
        </div>

        <div className="mt-12 grid border-y border-white/12 md:grid-cols-2">
          <Link href="/compare" className="group flex items-start gap-4 border-b border-white/12 py-6 md:border-b-0 md:border-r md:pr-8">
            <GitCompare className="mt-1 h-5 w-5 text-primary" />
            <span>
              <span className="flex items-center gap-2 text-lg font-bold">
                Bandingkan destinasi
                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </span>
              <span className="mt-2 block text-sm font-medium leading-6 text-slate-400">
                Lihat perbedaan sentimen, risiko, dan karakter perjalanan.
              </span>
            </span>
          </Link>
          <Link href="/routes" className="group flex items-start gap-4 py-6 md:pl-8">
            <Map className="mt-1 h-5 w-5 text-primary" />
            <span>
              <span className="flex items-center gap-2 text-lg font-bold">
                Gunakan rute perjalanan
                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </span>
              <span className="mt-2 block text-sm font-medium leading-6 text-slate-400">
                Simpan urutan kunjungan dan tandai tempat yang sudah didatangi.
              </span>
            </span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
