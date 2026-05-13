'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Map, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function BentoGrid() {
  return (
    <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          
          {/* Main Large Bento Box */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-primary to-orange-700 rounded-[2.5rem] p-12 relative overflow-hidden flex flex-col justify-end group shadow-2xl"
          >
            <div className="absolute top-10 right-10 opacity-20 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
              <Sparkles className="w-48 h-48" strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <h4 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">Eksplorasi<br/>Tanpa Batas</h4>
              <p className="text-white/80 text-xl max-w-md leading-relaxed">
                Database kami mencakup ratusan destinasi tersembunyi dengan skor sentimen positif yang telah diverifikasi oleh AI.
              </p>
            </div>
          </motion.div>

          {/* Stats Box */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-slate-800/50 rounded-[2.5rem] p-10 flex flex-col justify-center border border-white/10 shadow-xl group hover:bg-slate-800 transition-colors"
          >
            {/* TODO: Replace with actual review count from API */}
            <div className="text-orange-400 font-black text-6xl md:text-7xl mb-4 tracking-tighter group-hover:scale-105 transform origin-left transition-transform">
              1.2M<span className="text-orange-500">+</span>
            </div>
            <p className="font-bold text-slate-400 uppercase tracking-widest text-sm">Data Ulasan Dianalisis</p>
          </motion.div>

          {/* Map Link Box */}
          <Link 
            href="/search"
            className="bg-white text-slate-900 rounded-[2.5rem] p-10 flex flex-col justify-between shadow-xl group hover:-translate-y-2 transition-transform duration-300"
          >
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <Map className="w-8 h-8" />
            </div>
            <div>
              <h5 className="text-2xl font-black mb-4">Cari Berdasarkan Peta</h5>
              <span className="flex items-center gap-2 text-primary font-bold text-lg group-hover:gap-4 transition-all">
                Buka Topic Map <ArrowRight className="w-5 h-5" />
              </span>
            </div>
          </Link>

          {/* Call to Action Box */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-3 bg-secondary rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('/images/auth-bg.jpg')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
            <div className="relative z-10 mb-8 md:mb-0">
              <h4 className="text-3xl md:text-4xl font-black mb-2">Siap Temukan Vibe Anda?</h4>
              <p className="text-white/80 text-lg">Mulai perjalanan emosional Anda hari ini.</p>
            </div>
            <Link 
              href="/register"
              className="relative z-10 bg-white text-secondary px-10 py-5 rounded-full font-black text-lg hover:bg-slate-100 hover:scale-105 transition-all shadow-xl"
            >
              Daftar Sekarang
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
