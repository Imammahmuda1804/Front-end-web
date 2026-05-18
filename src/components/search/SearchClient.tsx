'use client';

import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Brain,
  History,
  ImageIcon,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Type,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { api } from '@/lib/axios';
import { getImageUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { NativeSelect } from '@/components/ui/native-select';

interface DestinationTopic {
  id: number;
  name?: string;
  topic_name?: string;
}

interface Destination {
  id: number;
  name: string;
  slug: string;
  city: string;
  description?: string;
  short_description?: string;
  shortDescription?: string;
  thumbnail_url?: string;
  thumbnailUrl?: string;
  hybrid_score?: number;
  similarity?: number;
  positive_ratio?: number;
  positiveRatio?: number;
  recommendation_score?: number;
  recommendationScore?: number;
  topics?: DestinationTopic[];
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

type SearchMode = 'keyword' | 'semantic';
type SemanticSort = 'relevance' | 'hybrid';
type DestinationSearchParams = {
  limit: number;
  search?: string;
  topic_ids?: string;
  city?: string;
};

const MAX_VISIBLE_TOPICS = 8;
const easeOutExpo = [0.16, 1, 0.3, 1] as const;
const panelMotion = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};
const railMotion = {
  hidden: { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0 },
};
const quickPrompts = [
  { label: 'Pantai tenang', query: 'pantai tenang untuk keluarga', mode: 'semantic' },
  { label: 'Wisata budaya', query: 'wisata budaya Minangkabau', mode: 'semantic' },
  { label: 'Kuliner lokal', query: 'kuliner lokal yang ramai dibahas', mode: 'semantic' },
] as const;
const subscribeToHydration = () => () => {};
const getHydratedSnapshot = () => true;
const getServerHydratedSnapshot = () => false;

const isSearchMode = (value: string | null): value is SearchMode => value === 'keyword' || value === 'semantic';
const isSemanticSort = (value: string | null): value is SemanticSort => value === 'relevance' || value === 'hybrid';

const getDestinationImage = (destination: Destination) =>
  destination.thumbnail_url || destination.thumbnailUrl ? getImageUrl(destination.thumbnail_url || destination.thumbnailUrl) : '/images/auth-bg.jpg';

const getDestinationPositiveRatio = (destination: Destination) => destination.positive_ratio ?? destination.positiveRatio;
const getDestinationScore = (destination: Destination) => destination.recommendation_score ?? destination.recommendationScore;
const getDestinationMatch = (destination: Destination) => destination.hybrid_score ?? destination.similarity;

const getDestinationTopicLabel = (topic: DestinationTopic) =>
  topic.topic_name?.replace(/Topic \d+: /, '') || topic.name || 'Vibe';

const getDestinationDescription = (destination: Destination) => {
  const rawDescription = destination.short_description || destination.shortDescription || destination.description;
  const cleanDescription = rawDescription?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

  if (cleanDescription) return cleanDescription;

  const topicNames = destination.topics?.slice(0, 2).map(getDestinationTopicLabel).join(' dan ');
  return topicNames
    ? `${destination.name} berada di ${destination.city}, cocok untuk pencarian dengan nuansa ${topicNames.toLowerCase()}.`
    : `${destination.name} berada di ${destination.city}, cocok untuk dijelajahi lebih lanjut berdasarkan pola ulasan dan relevansi pencarian Anda.`;
};

const formatPercent = (value?: number) => (value !== undefined ? `${(value * 100).toFixed(0)}%` : 'N/A');

const getTopicLabel = (topic: Topic) => {
  if (topic.topic_name && !topic.topic_name.startsWith('Topic ')) return topic.topic_name;
  if (topic.keywords?.length) return topic.keywords.slice(0, 2).join(', ');
  return topic.topic_name?.replace(/Topic \d+: /, '') || 'Topik';
};

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const hasMounted = React.useSyncExternalStore(subscribeToHydration, getHydratedSnapshot, getServerHydratedSnapshot);
  const shouldReduceMotion = !hasMounted || Boolean(prefersReduced);
  const { isAuthenticated } = useAuthStore();

  const modeParam = searchParams.get('mode');
  const sortParam = searchParams.get('sort');
  const initialQuery = searchParams.get('q') || '';
  const initialMode: SearchMode = isSearchMode(modeParam) ? modeParam : 'keyword';
  const initialSort: SemanticSort = isSemanticSort(sortParam) ? sortParam : 'hybrid';

  const [query, setQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>(initialMode);
  const [semanticSort, setSemanticSort] = useState<SemanticSort>(initialSort);
  const [showModeInfo, setShowModeInfo] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);

  const [results, setResults] = useState<Destination[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await api.get('/api/topics');
        setTopics(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch topics', error);
      }
    };

    const fetchCities = async () => {
      try {
        const res = await api.get('/api/destinations/cities');
        const raw = res.data?.data;
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        setCities(list);
      } catch (error) {
        console.error('Failed to fetch cities', error);
      }
    };

    fetchTopics();
    fetchCities();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchHistory = async () => {
      try {
        const res = await api.get('/api/search/history');
        setHistory(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch search history', error);
      }
    };

    fetchHistory();
  }, [isAuthenticated]);

  const executeSearch = useCallback(
    async (searchQuery: string, topicIds: number[], city: string, mode: SearchMode, sort: SemanticSort = 'hybrid') => {
      setIsLoading(true);
      setHasSearched(true);
      setSearchError('');

      try {
        if (searchQuery && mode === 'semantic') {
          const res = await api.post('/api/search', { query: searchQuery, sort });
          setResults(res.data.data || []);
          setTotalResults(res.data.data?.length || 0);
          setActiveQuery(searchQuery);
        } else if (searchQuery || topicIds.length > 0 || city) {
          const params: DestinationSearchParams = { limit: 20 };
          if (searchQuery) params.search = searchQuery;
          if (topicIds.length > 0) params.topic_ids = topicIds.join(',');
          if (city) params.city = city;

          const res = await api.get('/api/destinations', { params });
          setResults(res.data.data || []);
          setTotalResults(res.data.meta?.total || res.data.data?.length || 0);
          setActiveQuery(searchQuery);
        } else {
          setResults([]);
          setTotalResults(0);
          setHasSearched(false);
          setActiveQuery('');
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setTotalResults(0);
        setSearchError('Gagal memuat hasil pencarian. Periksa koneksi atau coba kata kunci lain.');
        toast.error('Gagal memuat hasil pencarian');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const initialSearchDone = React.useRef(false);
  useEffect(() => {
    if (initialQuery && !initialSearchDone.current) {
      initialSearchDone.current = true;
      executeSearch(initialQuery, [], '', initialMode, initialSort);
    }
  }, [initialQuery, initialMode, initialSort, executeSearch]);

  const buildSearchUrl = (searchQuery: string, mode: SearchMode, sort: SemanticSort) =>
    `/search?q=${encodeURIComponent(searchQuery)}&mode=${mode}${mode === 'semantic' ? `&sort=${sort}` : ''}`;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    executeSearch(trimmed, selectedTopicIds, selectedCity, searchMode, semanticSort);
    router.push(buildSearchUrl(trimmed, searchMode, semanticSort));
  };

  const handleTopicToggle = (topicId: number) => {
    const newIds = selectedTopicIds.includes(topicId)
      ? selectedTopicIds.filter((id) => id !== topicId)
      : [...selectedTopicIds, topicId];
    setSelectedTopicIds(newIds);
    executeSearch(query.trim(), newIds, selectedCity, searchMode, semanticSort);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    executeSearch(query.trim(), selectedTopicIds, city, searchMode, semanticSort);
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    executeSearch(historyQuery, selectedTopicIds, selectedCity, searchMode, semanticSort);
    router.push(buildSearchUrl(historyQuery, searchMode, semanticSort));
  };

  const handleModeSwitch = (mode: SearchMode) => {
    setSearchMode(mode);
    if (activeQuery) {
      executeSearch(activeQuery, selectedTopicIds, selectedCity, mode, semanticSort);
      router.push(buildSearchUrl(activeQuery, mode, semanticSort));
    }
  };

  const handleSortChange = (newSort: SemanticSort) => {
    setSemanticSort(newSort);
    if (activeQuery && searchMode === 'semantic') {
      executeSearch(activeQuery, selectedTopicIds, selectedCity, 'semantic', newSort);
      router.push(buildSearchUrl(activeQuery, 'semantic', newSort));
    }
  };

  const handleQuickPrompt = (prompt: (typeof quickPrompts)[number]) => {
    setQuery(prompt.query);
    setSearchMode(prompt.mode);
    executeSearch(prompt.query, selectedTopicIds, selectedCity, prompt.mode, semanticSort);
    router.push(buildSearchUrl(prompt.query, prompt.mode, semanticSort));
  };

  const clearAllFilters = () => {
    setQuery('');
    setActiveQuery('');
    setSelectedTopicIds([]);
    setSelectedCity('');
    setResults([]);
    setTotalResults(0);
    setHasSearched(false);
    setSearchError('');
    router.push('/search');
  };

  const retrySearch = () => {
    executeSearch(activeQuery || query.trim(), selectedTopicIds, selectedCity, searchMode, semanticSort);
  };

  const visibleTopics = showAllTopics ? topics : topics.slice(0, MAX_VISIBLE_TOPICS);
  const hiddenCount = Math.max(0, topics.length - MAX_VISIBLE_TOPICS);
  const activeFilterCount = selectedTopicIds.length + (selectedCity ? 1 : 0) + (activeQuery ? 1 : 0);

  const resultSummary = totalResults > results.length ? `${results.length} dari ${totalResults}` : `${results.length}`;

  return (
    <div className="space-y-6">
      <motion.section
        initial={shouldReduceMotion ? false : 'hidden'}
        animate={shouldReduceMotion ? undefined : 'visible'}
        variants={panelMotion}
        transition={{ duration: 0.36, ease: easeOutExpo }}
        className="relative overflow-hidden rounded-[2.25rem] border border-orange-200 bg-[#FFF3EC] p-5 text-slate-950 md:p-8"
      >
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, x: 24, rotate: -10 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0, rotate: -7 }}
          transition={{ duration: 0.42, delay: 0.1, ease: easeOutExpo }}
          className="pointer-events-none absolute -right-10 top-5 hidden rounded-[2rem] border border-orange-200 bg-primary px-10 py-5 text-6xl font-black tracking-tighter text-orange-950/20 shadow-xl shadow-orange-900/10 xl:block 2xl:right-4"
        >
          SEARCH
        </motion.div>
        <div className="relative z-10 mb-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white shadow-sm shadow-orange-900/10">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Search command
            </span>
            <h1 className="max-w-3xl text-4xl font-black leading-none tracking-tight text-slate-950 md:text-6xl">Eksplorasi Destinasi</h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-700">
              Cari destinasi berdasarkan nama, kota, topik, atau deskripsi vibe yang Anda inginkan.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex rounded-full border border-orange-200 bg-white p-1 shadow-sm shadow-orange-900/5">
              <button
                type="button"
                onClick={() => handleModeSwitch('keyword')}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-black transition-colors sm:flex-none ${
                  searchMode === 'keyword' ? 'bg-primary text-white shadow-sm shadow-orange-900/15' : 'text-slate-600 hover:bg-orange-50 hover:text-primary'
                }`}
              >
                <Type className="h-4 w-4" />
                Biasa
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('semantic')}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-black transition-colors sm:flex-none ${
                  searchMode === 'semantic' ? 'bg-secondary text-white shadow-sm shadow-blue-900/15' : 'text-slate-600 hover:bg-blue-50 hover:text-secondary'
                }`}
              >
                <Brain className="h-4 w-4" />
                Semantic
              </button>
            </div>
            <motion.button
              type="button"
              onClick={() => setShowModeInfo((value) => !value)}
              aria-label="Tampilkan informasi mode pencarian"
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
              className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm shadow-orange-900/5 transition-colors hover:bg-orange-50 hover:text-primary"
            >
              <Sparkles className="h-4 w-4" />
              Bantuan mode
            </motion.button>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative z-10">
          <label htmlFor="search-main" className="sr-only">Cari destinasi</label>
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <div className="relative">
              {searchMode === 'semantic' ? (
                <Brain className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
              ) : (
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              )}
              <input
                id="search-main"
                type="text"
                placeholder={searchMode === 'semantic' ? 'Contoh: pantai tenang untuk keluarga' : 'Contoh: Jam Gadang atau Bukittinggi'}
                className="min-h-16 w-full rounded-2xl border-2 border-white bg-white py-3 pl-13 pr-4 text-base font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/25"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <motion.button
              type="submit"
              disabled={isLoading || !query.trim()}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              className="flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-primary px-8 text-sm font-black text-white shadow-lg shadow-primary/25 transition-all motion-safe:hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <Search className="h-4 w-4" />
              Cari destinasi
            </motion.button>
          </div>
        </form>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.12, ease: easeOutExpo }}
          className="relative z-10 mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-orange-200 bg-white px-3 text-xs font-black uppercase tracking-[0.12em] text-primary shadow-sm shadow-orange-900/5">
              <Sparkles className="h-3.5 w-3.5" />
              Coba cepat
            </span>
            {quickPrompts.map((prompt, index) => (
              <motion.button
                key={prompt.query}
                type="button"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: 0.16 + index * 0.04, ease: easeOutExpo }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                onClick={() => handleQuickPrompt(prompt)}
                className="inline-flex min-h-9 items-center rounded-full border border-orange-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm shadow-orange-900/5 transition-colors hover:border-primary hover:bg-orange-50 hover:text-primary"
              >
                {prompt.label}
              </motion.button>
            ))}
          </div>
          <p className="max-w-md text-sm font-semibold leading-6 text-slate-600 lg:text-right">
            Pilih prompt, lalu sempurnakan kata kuncinya sesuai mood perjalanan Anda.
          </p>
        </motion.div>

        <AnimatePresence>
          {showModeInfo && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: easeOutExpo }}
              className="relative z-10 mt-5 grid gap-3 rounded-2xl border border-orange-200 bg-white p-4 text-slate-900 shadow-sm shadow-orange-900/5 md:grid-cols-2"
            >
              <div className="rounded-xl bg-orange-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-900">
                  <Type className="h-4 w-4 text-slate-600" />
                  Pencarian Biasa
                </div>
                <p className="text-sm leading-6 text-slate-600">Cocok untuk nama destinasi atau kota yang sudah Anda tahu.</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-900">
                  <Brain className="h-4 w-4 text-secondary" />
                  Semantic Search
                </div>
                <p className="text-sm leading-6 text-slate-600">Cocok untuk mencari berdasarkan suasana, aktivitas, atau konteks perjalanan.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start 2xl:grid-cols-[22rem_minmax(0,1fr)]">
        <motion.aside
          initial={shouldReduceMotion ? false : 'hidden'}
          whileInView={shouldReduceMotion ? undefined : 'visible'}
          viewport={{ once: true, margin: '-60px' }}
          variants={railMotion}
          transition={{ duration: 0.3, ease: easeOutExpo }}
          className="space-y-4 lg:sticky lg:top-24"
        >
          <div className="rounded-[1.75rem] border border-orange-200 bg-[#FFF3EC] p-5 text-slate-950 shadow-xl shadow-orange-900/10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-primary">Filter</h2>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="rounded-full bg-primary px-3 py-1.5 text-xs font-black text-white transition-colors hover:bg-primary/90"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="city-filter" className="mb-2 block text-sm font-black text-slate-950">Kota</label>
                <NativeSelect
                  aria-label="Filter kota"
                  value={selectedCity}
                  onValueChange={handleCityChange}
                  leftIcon={<MapPin className="h-4 w-4" />}
                  className="border-orange-200 bg-white shadow-orange-100/50 focus:ring-primary/20"
                  options={[
                    { value: '', label: 'Semua Kota', description: 'Tampilkan semua lokasi' },
                    ...cities.map((city) => ({ value: city, label: city })),
                  ]}
                />
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black text-slate-950">Topik</h3>
                  {selectedTopicIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTopicIds([]);
                        executeSearch(query.trim(), [], selectedCity, searchMode, semanticSort);
                      }}
                      className="rounded-full bg-white px-2 py-1 text-xs font-black text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                      Hapus topik
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {visibleTopics.map((topic) => {
                    const isActive = selectedTopicIds.includes(topic.id);
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => handleTopicToggle(topic.id)}
                        className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border-2 px-3 text-sm font-black transition-all ${
                          isActive
                            ? 'border-primary bg-primary text-white shadow-sm'
                            : 'border-orange-200 bg-white text-slate-800 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {isActive && <X className="h-3.5 w-3.5" />}
                        {getTopicLabel(topic)}
                      </button>
                    );
                  })}
                  {hiddenCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAllTopics((value) => !value)}
                      className="inline-flex min-h-10 items-center rounded-full border border-orange-200 bg-white px-3 text-sm font-black text-slate-800 transition-colors hover:border-primary hover:text-primary"
                    >
                      {showAllTopics ? 'Sembunyikan' : `+${hiddenCount} lainnya`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {hasMounted && isAuthenticated && (
            <div className="rounded-[1.75rem] border border-blue-100 bg-blue-50 p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-secondary">Riwayat</h2>
              {history.length > 0 ? (
                <ul className="space-y-2">
                  {history.slice(0, 5).map((item, index) => (
                    <li key={`${item.keyword}-${index}`}>
                      <button
                        type="button"
                        onClick={() => handleHistoryClick(item.keyword)}
                        className="flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-white hover:text-secondary"
                      >
                        <History className="h-4 w-4 shrink-0 text-secondary" />
                        <span className="truncate">{item.keyword}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-6 text-slate-500">Belum ada riwayat pencarian.</p>
              )}
            </div>
          )}
        </motion.aside>

        <section className="min-w-0">
          {searchError && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: easeOutExpo }}
              className="mb-5 flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <span>{searchError}</span>
              </div>
              <button
                type="button"
                onClick={retrySearch}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-black text-red-700 transition-colors hover:bg-red-100"
              >
                <RotateCcw className="h-4 w-4" />
                Coba lagi
              </button>
            </motion.div>
          )}

          {hasSearched && (
            <motion.div
              layout
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.26, ease: easeOutExpo }}
              className="mb-6 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/70 md:p-5"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Hasil pencarian</p>
                  <h2 className="mt-1 text-3xl font-black leading-none tracking-tight text-slate-900 md:text-4xl">
                    {activeQuery ? `"${activeQuery}"` : selectedCity || selectedTopicIds.length > 0 ? 'Filter aktif' : 'Belum ada query'}
                  </h2>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-500">
                    {searchMode === 'semantic' ? <Brain className="h-4 w-4 text-secondary" /> : <Search className="h-4 w-4 text-slate-400" />}
                    Menampilkan {resultSummary} hasil dengan mode {searchMode === 'semantic' ? 'semantic' : 'biasa'}.
                  </p>
                </div>

                {searchMode === 'semantic' && (
                  <div className="w-full rounded-2xl border border-blue-100 bg-blue-50 p-2 shadow-lg shadow-blue-900/5 sm:w-auto">
                    <span className="mb-2 block px-2 text-[11px] font-black uppercase tracking-[0.14em] text-secondary">Urutan hasil</span>
                    <div className="grid grid-cols-2 gap-1" role="group" aria-label="Urutan hasil semantic">
                      <button
                        type="button"
                        onClick={() => handleSortChange('hybrid')}
                        className={`min-h-10 rounded-xl px-3 text-sm font-black transition-colors ${
                          semanticSort === 'hybrid' ? 'bg-primary text-white shadow-sm shadow-orange-900/15' : 'text-slate-700 hover:bg-white hover:text-primary'
                        }`}
                      >
                        Rekomendasi
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSortChange('relevance')}
                        className={`min-h-10 rounded-xl px-3 text-sm font-black transition-colors ${
                          semanticSort === 'relevance' ? 'bg-secondary text-white shadow-sm shadow-blue-900/15' : 'text-slate-700 hover:bg-white hover:text-secondary'
                        }`}
                      >
                        Paling sesuai
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {activeFilterCount > 0 && (
                <motion.div layout className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                  <span className="text-sm font-bold text-slate-500">Filter aktif:</span>
                  {activeQuery && (
                    <motion.span layout className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-orange-50 px-3 text-sm font-bold text-primary">
                      {searchMode === 'semantic' && <Brain className="h-3.5 w-3.5" />}
                      {activeQuery}
                      <button
                        type="button"
                        aria-label="Hapus query aktif"
                        onClick={() => {
                          setQuery('');
                          setActiveQuery('');
                          executeSearch('', selectedTopicIds, selectedCity, searchMode, semanticSort);
                          router.push('/search');
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-primary/10"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.span>
                  )}
                  {selectedCity && (
                    <motion.span layout className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-blue-50 px-3 text-sm font-bold text-secondary">
                      <MapPin className="h-3.5 w-3.5" />
                      {selectedCity}
                      <button
                        type="button"
                        aria-label="Hapus filter kota"
                        onClick={() => handleCityChange('')}
                        className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-secondary/10"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.span>
                  )}
                  {selectedTopicIds.map((id) => {
                    const topic = topics.find((item) => item.id === id);
                    if (!topic) return null;
                    return (
                      <motion.span key={id} layout className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-slate-100 px-3 text-sm font-bold text-slate-700">
                        {getTopicLabel(topic)}
                        <button
                          type="button"
                          aria-label={`Hapus topik ${getTopicLabel(topic)}`}
                          onClick={() => handleTopicToggle(id)}
                          className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-slate-200"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </motion.span>
                    );
                  })}
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="min-h-9 rounded-full px-3 text-sm font-black text-slate-500 transition-colors hover:bg-slate-100 hover:text-red-600"
                  >
                    Hapus semua
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: easeOutExpo }}
              className="grid grid-cols-1 gap-5 xl:grid-cols-2"
            >
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <motion.div
                  key={item}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: Math.min(item * 0.03, 0.12), ease: easeOutExpo }}
                  className="grid min-h-48 grid-cols-[9rem_minmax(0,1fr)] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/60 md:grid-cols-[11rem_minmax(0,1fr)] xl:min-h-52"
                >
                  <div className="h-full bg-slate-200 motion-safe:animate-pulse" />
                  <div className="space-y-3 p-4 md:p-5">
                    <div className="h-6 w-3/4 rounded bg-slate-200 motion-safe:animate-pulse" />
                    <div className="h-4 w-1/3 rounded bg-slate-200 motion-safe:animate-pulse" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-11 rounded-xl bg-orange-100 motion-safe:animate-pulse" />
                      <div className="h-11 rounded-xl bg-blue-100 motion-safe:animate-pulse" />
                    </div>
                    <div className="h-9 w-24 rounded-full bg-slate-200 motion-safe:animate-pulse" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!isLoading && hasSearched && results.length > 0 && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1 }}
              className="space-y-5"
            >
              <ResultCard
                destination={results[0]}
                index={0}
                searchMode={searchMode}
                prefersReduced={shouldReduceMotion}
                featured
              />
              {results.length > 1 && (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  {results.slice(1).map((destination, index) => (
                    <ResultCard
                      key={destination.id}
                      destination={destination}
                      index={index + 1}
                      searchMode={searchMode}
                      prefersReduced={shouldReduceMotion}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {!isLoading && hasSearched && results.length === 0 && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: easeOutExpo }}
              className="rounded-[2rem] border border-orange-200 bg-[#FFF3EC] p-8 text-center text-slate-950 shadow-2xl shadow-orange-900/10 md:p-12"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-black tracking-tight text-slate-950">Tidak ada hasil ditemukan</h3>
              <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-7 text-slate-700">
                Coba ubah kata kunci, ganti mode pencarian, atau reset filter yang sedang aktif.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => handleModeSwitch(searchMode === 'semantic' ? 'keyword' : 'semantic')}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-black text-white transition-colors hover:bg-primary/90"
                >
                  {searchMode === 'semantic' ? <Type className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                  Ganti mode
                </button>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-5 text-sm font-black text-slate-900 transition-colors hover:bg-orange-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset filter
                </button>
              </div>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}

function ResultCard({
  destination,
  index,
  searchMode,
  prefersReduced,
  featured = false,
}: {
  destination: Destination;
  index: number;
  searchMode: SearchMode;
  prefersReduced: boolean;
  featured?: boolean;
}) {
  const positiveRatio = getDestinationPositiveRatio(destination);
  const recommendationScore = getDestinationScore(destination);
  const matchScore = getDestinationMatch(destination);
  const isFeatured = featured;
  const description = getDestinationDescription(destination);
  const visibleTopics = destination.topics?.slice(0, isFeatured ? 5 : 2) || [];

  return (
    <motion.article
      initial={prefersReduced ? false : { opacity: 0, y: 18 }}
      animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: Math.min(index * 0.04, 0.16), ease: easeOutExpo }}
      className={`group overflow-hidden rounded-[1.5rem] border bg-white shadow-lg shadow-slate-200/50 transition-all duration-300 motion-safe:hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70 ${
        isFeatured ? 'border-orange-200 bg-[#FFFDFB]' : 'border-slate-200'
      }`}
    >
      <Link href={`/destinations/${destination.slug}`} className="block h-full">
        <div className={`${isFeatured ? 'xl:grid xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-stretch' : 'grid h-full min-h-48 grid-cols-[9rem_minmax(0,1fr)] md:grid-cols-[11rem_minmax(0,1fr)] xl:min-h-52'}`}>
          <div className={`relative overflow-hidden ${isFeatured ? 'h-56 xl:h-full xl:min-h-[300px]' : 'min-h-48 xl:min-h-52'}`}>
            <Image
              src={getDestinationImage(destination)}
              alt={destination.name}
              fill
              sizes={isFeatured ? '(max-width: 1280px) 100vw, 55vw' : '(max-width: 768px) 35vw, 12vw'}
              className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
            />
            {!isFeatured && (
              <div className="absolute inset-x-2 bottom-2 rounded-full bg-white/95 px-2 py-1 text-center text-[11px] font-black text-secondary shadow-sm">
                {searchMode === 'semantic' && matchScore !== undefined ? `${formatPercent(matchScore)} match` : 'Detail'}
              </div>
            )}
            <div className={`absolute flex flex-wrap gap-2 ${isFeatured ? 'left-4 top-4' : 'left-2 top-2'}`}>
              {isFeatured && (
                <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-primary px-3 py-1.5 text-xs font-black text-white shadow-sm">
                  {searchMode === 'semantic' ? <Sparkles className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5 fill-white" />}
                  {searchMode === 'semantic' ? 'Top Match' : 'Hasil Teratas'}
                </span>
              )}
              {searchMode === 'semantic' && matchScore !== undefined && (
                <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-secondary px-3 py-1.5 text-xs font-black text-white shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                  {(matchScore * 100).toFixed(0)}% match
                </span>
              )}
            </div>
          </div>

          <div className={`min-w-0 flex flex-1 flex-col ${isFeatured ? 'p-5 md:p-6 xl:min-h-[300px]' : 'p-4 md:p-5'}`}>
            <div className={`${isFeatured ? 'mb-3' : 'mb-2'} flex items-start justify-between gap-3`}>
              <div className="min-w-0">
                <h3 className={`line-clamp-2 font-black leading-tight tracking-tight text-slate-900 ${isFeatured ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`}>
                  {destination.name}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">{destination.city}</span>
                </p>
              </div>

              {recommendationScore !== undefined && isFeatured && (
                <div className="shrink-0 rounded-xl bg-orange-50 px-2.5 py-1.5 text-right text-primary">
                  <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-primary/75">Skor AI</span>
                  <span className={`${isFeatured ? 'text-2xl' : 'text-xl'} font-black leading-none text-primary`}>{(recommendationScore * 100).toFixed(0)}</span>
                </div>
              )}
            </div>

            <div className={`${isFeatured ? 'mb-4' : 'mb-3'} flex flex-wrap gap-1.5`}>
              {visibleTopics.map((topic) => (
                <span key={topic.id} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-black capitalize text-slate-700">
                  {getDestinationTopicLabel(topic)}
                </span>
              ))}
            </div>

            {isFeatured && (
              <p className="mb-4 line-clamp-4 text-sm font-semibold leading-7 text-slate-600 md:text-[15px]">
                {description}
              </p>
            )}

            <div className={`${isFeatured ? 'border-t border-slate-100 pt-3' : ''} mt-auto flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-50">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                </div>
                <span>
                  Positif:{' '}
                  <span className="font-black text-slate-900">
                    {formatPercent(positiveRatio)}
                  </span>
                </span>
              </div>
              <span className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1 rounded-full bg-secondary px-3.5 text-sm font-black text-white transition-colors group-hover:bg-primary group-hover:text-white">
                <ImageIcon className="h-4 w-4" />
                {isFeatured ? 'Lihat detail' : 'Buka'}
                <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
