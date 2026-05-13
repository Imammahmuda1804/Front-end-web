'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/axios';
import { getImageUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { Search, History, Sparkles, MapPin, Star, ArrowRight, X, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Types
interface Destination {
  id: number;
  name: string;
  slug: string;
  city: string;
  thumbnail_url?: string;
  thumbnailUrl?: string;
  hybrid_score?: number;
  similarity?: number;
  positive_ratio?: number;
  positiveRatio?: number;
  recommendation_score?: number;
  recommendationScore?: number;
  topics?: Array<{ id: number; name: string }>;
}

interface Topic {
  id: number;
  topic_name: string;
  keywords?: string[];
}

interface SearchHistoryItem {
  keyword: string;
  createdAt?: string;
}

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  
  const { isAuthenticated } = useAuthStore();

  const [query, setQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  
  const [results, setResults] = useState<Destination[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch Topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await api.get('/api/topics');
        setTopics(res.data.data || []);
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };
    fetchTopics();
  }, []);

  // Fetch History (only if authenticated)
  useEffect(() => {
    const fetchHistory = async () => {
      if (isAuthenticated) {
        try {
          const res = await api.get('/api/search/history');
          setHistory(res.data.data || []);
        } catch (error) {
          console.error('Error fetching history:', error);
        }
      }
    };
    fetchHistory();
  }, [isAuthenticated]);

  // Execute Search
  const executeSearch = useCallback(async (searchQuery: string, topicId: number | null) => {
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      if (searchQuery) {
        // Semantic Search
        const res = await api.post('/api/search', { query: searchQuery });
        setResults(res.data.data || []);
        setActiveQuery(searchQuery);
        setSelectedTopicId(null);
      } else if (topicId) {
        // Filter by Topic
        const res = await api.get(`/api/destinations?topic_id=${topicId}`);
        setResults(res.data.data || []);
        setActiveQuery('');
        setSelectedTopicId(topicId);
        setQuery('');
      } else {
        setResults([]);
        setHasSearched(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load search if query exists
  const initialSearchDone = React.useRef(false);
  useEffect(() => {
    if (initialQuery && !initialSearchDone.current) {
      initialSearchDone.current = true;
      executeSearch(initialQuery, null);
    }
  }, [initialQuery, executeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      executeSearch(query, null);
      // Update URL without reload
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleTopicClick = (topicId: number) => {
    if (selectedTopicId === topicId) {
      // Toggle off
      setSelectedTopicId(null);
      setResults([]);
      setHasSearched(false);
      router.push('/search');
    } else {
      executeSearch('', topicId);
      router.push('/search');
    }
  };

  const handleHistoryClick = (histQuery: string) => {
    setQuery(histQuery);
    executeSearch(histQuery, null);
    router.push(`/search?q=${encodeURIComponent(histQuery)}`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
        
        {/* Recent Searches (Authenticated only) */}
        {isAuthenticated && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Pencarian Terakhir</h3>
            {history.length > 0 ? (
              <ul className="space-y-3">
                {history.slice(0, 5).map((item, idx) => (
                  <li key={idx}>
                    <button 
                      onClick={() => handleHistoryClick(item.keyword)}
                      className="flex items-center text-sm text-slate-600 hover:text-primary transition-colors text-left w-full group"
                    >
                      <History className="w-4 h-4 mr-3 text-slate-400 group-hover:text-primary transition-colors" />
                      <span className="truncate">{item.keyword}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic">Belum ada riwayat.</p>
            )}
          </div>
        )}

        {/* Vibe Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Vibe Filters</h3>
          <div role="group" aria-label="Filter berdasarkan vibe">
            <ul className="space-y-3">
              {topics.map((topic) => (
                <li key={topic.id}>
                  <button
                    type="button"
                    aria-pressed={selectedTopicId === topic.id}
                    onClick={() => handleTopicClick(topic.id)}
                    className="flex items-center cursor-pointer group w-full text-left"
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${
                      selectedTopicId === topic.id ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'
                    }`}>
                      {selectedTopicId === topic.id && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm transition-colors ${selectedTopicId === topic.id ? 'font-bold text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                      {topic.topic_name && !topic.topic_name.startsWith('Topic ') ? topic.topic_name : topic.keywords ? `#${topic.keywords.slice(0, 2).join(', ')}` : topic.topic_name?.replace(/Topic \d+: /, '')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="mb-8">
          <label htmlFor="search-main" className="sr-only">Cari destinasi berdasarkan vibe</label>
          <div className="relative flex items-center">
            <Search className="absolute left-6 text-slate-400 w-6 h-6" />
            <input 
              id="search-main"
              type="text" 
              placeholder="Cari berdasarkan vibe (contoh: 'pantai tenang' atau 'kuliner pedas')" 
              className="w-full bg-white border border-slate-200 rounded-full py-4 pl-16 pr-32 text-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-2 bottom-2 bg-primary text-white rounded-full px-6 font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Cari
            </button>
          </div>
        </form>

        {/* Active filter indicator with reset */}
        {hasSearched && (activeQuery || selectedTopicId) && (
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-slate-500 font-medium">Filter aktif:</span>
            {activeQuery && (
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-bold">
                &ldquo;{activeQuery}&rdquo;
                <button
                  type="button"
                  onClick={() => { setQuery(''); setActiveQuery(''); setResults([]); setHasSearched(false); router.push('/search'); }}
                  aria-label="Hapus filter pencarian"
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {selectedTopicId && (
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-bold">
                {(() => { const t = topics.find(t => t.id === selectedTopicId); return t?.topic_name && !t.topic_name.startsWith('Topic ') ? t.topic_name : `#${t?.keywords?.slice(0, 1).join('') || 'Vibe'}`; })()}
                <button
                  type="button"
                  onClick={() => { setSelectedTopicId(null); setResults([]); setHasSearched(false); router.push('/search'); }}
                  aria-label="Hapus filter topik"
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results Header */}
        {hasSearched && (
          <div className="mb-8">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
              Menampilkan Hasil Untuk
            </p>
            {activeQuery ? (
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">"{activeQuery}"</h2>
                <p className="flex items-center text-sm text-slate-500">
                  <Sparkles className="w-4 h-4 text-primary mr-2" />
                  Menganalisis destinasi berdasarkan kemiripan semantik AI.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 capitalize">
                  {(() => { const t = topics.find(t => t.id === selectedTopicId); return t?.topic_name && !t.topic_name.startsWith('Topic ') ? t.topic_name : `#${t?.keywords?.slice(0, 2).join(', ') || t?.topic_name?.replace(/Topic \d+: /, '')}`; })()}
                </h2>
                <p className="flex items-center text-sm text-slate-500">
                  <Sparkles className="w-4 h-4 text-primary mr-2" />
                  Menampilkan destinasi berdasarkan kategori topik ini.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-white rounded-3xl h-[400px] animate-pulse border border-slate-100 p-4">
                <div className="w-full h-48 bg-slate-200 rounded-2xl mb-4"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-8"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && hasSearched && results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {results.map((dest, index) => {
              const isFeatured = index === 0;
              return (
              <motion.div 
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group ${
                  isFeatured ? 'md:col-span-2 md:flex-row' : ''
                }`}
              >
                {/* Image Section */}
                <div className={`relative overflow-hidden ${
                  isFeatured ? 'md:w-1/2 h-56 md:h-auto md:min-h-[320px]' : 'h-56'
                }`}>
                  <Image 
                    src={dest.thumbnail_url || dest.thumbnailUrl ? getImageUrl(dest.thumbnail_url || dest.thumbnailUrl) : '/images/auth-bg.jpg'} 
                    alt={dest.name}
                    fill
                    sizes={isFeatured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 50vw'}
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {isFeatured && (
                    <div className="absolute top-4 left-4 bg-primary px-3 py-1.5 rounded-full shadow-sm text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      Top Match
                    </div>
                  )}
                  {(dest.hybrid_score !== undefined || dest.similarity !== undefined) && (
                    <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full shadow-sm text-xs font-bold text-slate-800 flex items-center border border-slate-200">
                      <Sparkles className="w-3 h-3 mr-1.5 text-primary" />
                      {((dest.hybrid_score ?? dest.similarity ?? 0) * 100).toFixed(0)}% Match
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className={`p-6 flex flex-col flex-1 ${isFeatured ? 'md:p-8' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`font-black text-slate-900 mb-1 ${isFeatured ? 'text-3xl' : 'text-2xl'}`}>{dest.name}</h3>
                      <p className="flex items-center text-sm text-slate-500 font-medium">
                        <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                        {dest.city}
                      </p>
                    </div>
                    {(dest.recommendation_score !== undefined || dest.recommendationScore !== undefined) && (
                      <div className="text-right" title="Skor rekomendasi AI berdasarkan sentimen dan relevansi">
                        <span className="block text-xs font-bold text-slate-400 uppercase">Skor AI</span>
                        <span className={`font-black text-primary ${isFeatured ? 'text-3xl' : 'text-2xl'}`}>{((dest.recommendation_score ?? dest.recommendationScore ?? 0) * 100).toFixed(0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {dest.topics?.slice(0, isFeatured ? 5 : 3).map(topic => (
                      <span key={topic.id} className="bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md text-xs font-bold text-slate-600 capitalize">
                        #{(topic as any).topic_name?.replace(/Topic \d+: /, '') || (topic as any).name || 'Vibe'}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center mr-2">
                        <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                      </div>
                      <span className="text-slate-600 font-medium">
                        Rasio Positif: <span className="font-bold text-slate-900">{(dest.positive_ratio ?? dest.positiveRatio) !== undefined ? `${((dest.positive_ratio ?? dest.positiveRatio ?? 0) * 100).toFixed(0)}%` : 'N/A'}</span>
                      </span>
                    </div>
                    <Link 
                      href={`/destinations/${dest.slug}`}
                      className="text-primary font-bold text-sm flex items-center group-hover:text-slate-900 transition-colors"
                    >
                      Lihat Detail <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
            })}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && hasSearched && results.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Tidak ada hasil ditemukan</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Tidak ada hasil. Coba kata kunci lain atau pilih vibe filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
