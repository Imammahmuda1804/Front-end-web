'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Fingerprint } from 'lucide-react';

export function InfoSection() {
  return (
    <section className="py-32 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-20">
          <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Intelligence Behind Your Trip</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Teknologi yang Memahami Keinginan Anda</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Sentiment Analysis Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group bg-white p-8 md:p-12 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -mr-20 -mt-20 transition-transform group-hover:scale-150 duration-700"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-orange-100 text-primary rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Analisis Sentimen</h3>
              <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                Kami tidak hanya melihat rating bintang. Mesin AI kami memproses ribuan ulasan untuk menangkap emosi sebenarnya—memberikan Anda gambaran mendalam tentang suatu destinasi.
              </p>
              
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700">Akurasi Deteksi Emosi</span>
                    <span className="text-sm font-black text-primary">94%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '94%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Topic Modelling Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group bg-white p-8 md:p-12 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 transition-transform group-hover:scale-150 duration-700"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-100 text-secondary rounded-2xl flex items-center justify-center mb-8 group-hover:bg-secondary group-hover:text-white transition-colors duration-300 shadow-sm">
                <Fingerprint className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Topic Modelling</h3>
              <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                Melalui pemodelan topik laten, kami mengkategorikan destinasi berdasarkan 'vibe'. Temukan tempat yang sesuai dengan persona liburan Anda dengan sangat presisi.
              </p>
              
              <div className="flex flex-wrap gap-3">
                {['#CULTURE', '#NATURE', '#GASTRONOMY', '#ADVENTURE', '#HEALING'].map((tag, i) => (
                  <span key={tag} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-600 tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
