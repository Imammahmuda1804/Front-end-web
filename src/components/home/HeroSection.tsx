'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Compass } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function HeroSection() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <section className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/20 to-white z-10" />
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="/images/auth-bg.jpg" 
          alt="West Sumatra Landscape" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-20 w-full max-w-5xl mx-auto px-6 text-center mt-[-10vh]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block py-1.5 px-4 rounded-full bg-white/80 backdrop-blur-sm border border-white text-primary font-bold text-sm tracking-widest uppercase mb-6 shadow-sm">
            AI-Powered Tourism
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-lg tracking-tight leading-[1.1] mb-8">
            Temukan <span className="text-primary-fixed">Vibe</span> Liburan<br/>
            di Sumatera Barat
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center bg-white/90 backdrop-blur-md p-3 rounded-full shadow-2xl border border-white/50 gap-2">
            <div className="flex items-center flex-1 w-full px-6 py-2">
              <Compass className="w-6 h-6 text-primary mr-4" />
              <input 
                type="text" 
                placeholder="Ingin vibe seperti apa hari ini? (Misal: 'Keluarga dan alam')" 
                className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-500 font-medium text-lg focus:ring-0"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              className="w-full md:w-auto bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              <span>Cari</span>
            </button>
          </form>
          
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            <span className="text-white drop-shadow-md font-medium text-sm">Coba cari:</span>
            {['Pantai tersembunyi', 'Kuliner pedas', 'Tempat bersejarah', 'Staycation tenang'].map((tag) => (
              <button 
                key={tag}
                onClick={() => setQuery(tag)}
                className="text-xs font-bold text-slate-800 bg-white/80 hover:bg-white px-3 py-1.5 rounded-full transition-colors shadow-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Decorative Wave at the bottom to blend into the next white section */}
      <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
          <path fill="#ffffff" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>
    </section>
  );
}
