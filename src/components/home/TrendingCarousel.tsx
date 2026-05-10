'use client';

import * as React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Heart, MapPin, Star } from 'lucide-react';
import { useCallback } from 'react';
import { motion } from 'framer-motion';

import { getImageUrl } from '@/lib/utils';

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

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!destinations || destinations.length === 0) {
    return null; // or empty state
  }

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs">Trending Now</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-2 tracking-tight">Rekomendasi Teratas AI</h2>
          <p className="text-slate-500 mt-3 max-w-xl text-lg">Destinasi dengan skor sentimen positif tertinggi dari ribuan ulasan wisatawan bulan ini.</p>
        </motion.div>
        
        <div className="flex gap-3">
          <button 
            onClick={scrollPrev}
            className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary hover:text-primary hover:bg-orange-50 transition-all active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={scrollNext}
            className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Embla Viewport */}
      <div className="overflow-hidden px-6 md:px-12 pb-12" ref={emblaRef}>
        <div className="flex gap-6">
          {destinations.map((dest, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              key={dest.id} 
              className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0"
            >
              <div className="group relative h-[450px] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer">
                {/* Background Image */}
                <img 
                  src={dest.thumbnailUrl ? getImageUrl(dest.thumbnailUrl) : '/images/auth-bg.jpg'} 
                  alt={dest.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                
                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  {/* Top: Score */}
                  <div className="flex justify-between items-start">
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                      <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                      <span className="font-bold text-slate-900 text-sm">{dest.userRating?.toFixed(1) || '4.5'}</span>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Bottom: Info */}
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl font-black text-white mb-1 drop-shadow-md">{dest.name}</h3>
                    <div className="flex items-center text-white/80 text-sm mb-4">
                      <MapPin className="w-4 h-4 mr-1" />
                      {dest.city}
                    </div>
                    
                    {/* AI Insight Box */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-white/70 text-xs font-bold uppercase tracking-wider">AI Sentiment</span>
                         <span className="text-green-400 font-bold text-sm">{(dest.positiveRatio * 100).toFixed(0)}% Positif</span>
                       </div>
                       <div className="w-full bg-white/20 rounded-full h-1.5">
                         <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${dest.positiveRatio * 100}%` }}></div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
