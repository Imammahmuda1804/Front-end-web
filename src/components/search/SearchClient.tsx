'use client';

import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  History,
  Landmark,
  MapPin,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Type,
  Utensils,
  Waves,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { NativeSelect } from '@/components/ui/native-select';
import { DESTINATION_CATEGORIES, getDestinationCategoryLabel } from '@/lib/destination-categories';
import SearchResultCard, { getDestinationMatch, type SearchDestination } from './SearchResultCard';

type Destination = SearchDestination;

interface SearchHistoryItem {
  id?: number;
  keyword: string;
  createdAt?: string;
}

type SearchMode = 'keyword' | 'semantic';
type SemanticSort = 'relevance' | 'hybrid';
type CategoryOption = { value: string; label: string };
type RawCategoryOption = { value?: unknown; label?: unknown };
type DestinationSearchParams = {
  limit: number;
  search?: string;
  city?: string;
  category?: string;
};

const easeOutExpo = [0.16, 1, 0.3, 1] as const;
const panelMotion = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};
const railMotion = {
  hidden: { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0 },
};
// Prompt cepat untuk memulai pencarian semantik.
const quickPrompts = [
  { label: 'Pantai tenang', query: 'pantai tenang untuk keluarga', mode: 'semantic', icon: Waves, tone: 'text-ai bg-ai-container border-ai/15' },
  { label: 'Wisata budaya', query: 'wisata budaya Minangkabau', mode: 'semantic', icon: Landmark, tone: 'text-explore bg-explore-container border-explore/15' },
  { label: 'Kuliner lokal', query: 'kuliner lokal yang ramai dibahas', mode: 'semantic', icon: Utensils, tone: 'text-success bg-success-container border-success/15' },
] as const;
const subscribeToHydration = () => () => {};
const getHydratedSnapshot = () => true;
const getServerHydratedSnapshot = () => false;

const isSearchMode = (value: string | null): value is SearchMode => value === 'keyword' || value === 'semantic';
const isSemanticSort = (value: string | null): value is SemanticSort => value === 'relevance' || value === 'hybrid';

// Mengelola state pencarian, filter, history, dan hasil destinasi.
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
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>(initialMode);
  const [semanticSort, setSemanticSort] = useState<SemanticSort>(initialSort);
  const [showModeInfo, setShowModeInfo] = useState(false);
  const [activePromptQuery, setActivePromptQuery] = useState('');

  const [results, setResults] = useState<Destination[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([...DESTINATION_CATEGORIES]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState('');
  const activePromptTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (activePromptTimeout.current) clearTimeout(activePromptTimeout.current);
    };
  }, []);

  useEffect(() => {
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

    fetchCities();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/api/destinations/categories');
        const raw = res.data?.data ?? res.data;
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        const normalized = (list as RawCategoryOption[])
          .map((item) => ({
            value: String(item?.value ?? ''),
            label: String(item?.label ?? item?.value ?? ''),
          }))
          .filter((item) => item.value && item.label);

        if (normalized.length > 0) setCategoryOptions(normalized);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };

    fetchCategories();
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setHistory([]);
      return;
    }

    try {
      const res = await api.get('/api/search/history');
      setHistory(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch search history', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchHistory();
    });
  }, [fetchHistory]);

  // Menjalankan keyword search atau semantic search sesuai mode aktif.
  const executeSearch = useCallback(
    async (searchQuery: string, city: string, category: string, mode: SearchMode, sort: SemanticSort = 'hybrid') => {
      setIsLoading(true);
      setHasSearched(true);
      setSearchError('');

      try {
        if (searchQuery && mode === 'semantic') {
          const res = await api.post('/api/search', {
            query: searchQuery,
            sort,
            ...(city ? { city } : {}),
            ...(category ? { category } : {}),
          });
          setResults(res.data.data || []);
          setTotalResults(res.data.data?.length || 0);
          setActiveQuery(searchQuery);
        } else if (searchQuery || city || category) {
          const params: DestinationSearchParams = { limit: 20 };
          if (searchQuery) params.search = searchQuery;
          if (city) params.city = city;
          if (category) params.category = category;

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
      executeSearch(initialQuery, '', '', initialMode, initialSort);
    }
  }, [initialQuery, initialMode, initialSort, executeSearch]);

  const buildSearchUrl = (searchQuery: string, mode: SearchMode, sort: SemanticSort) =>
    `/search?q=${encodeURIComponent(searchQuery)}&mode=${mode}${mode === 'semantic' ? `&sort=${sort}` : ''}`;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    executeSearch(trimmed, selectedCity, selectedCategory, searchMode, semanticSort);
    router.push(buildSearchUrl(trimmed, searchMode, semanticSort));
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    executeSearch(query.trim(), city, selectedCategory, searchMode, semanticSort);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    executeSearch(query.trim(), selectedCity, category, searchMode, semanticSort);
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    executeSearch(historyQuery, selectedCity, selectedCategory, searchMode, semanticSort);
    router.push(buildSearchUrl(historyQuery, searchMode, semanticSort));
  };

  const handleDeleteHistoryItem = async (item: SearchHistoryItem) => {
    if (!item.id) return;

    try {
      await api.delete(`/api/search/history/${item.id}`);
      setHistory((current) => current.filter((entry) => entry.id !== item.id));
      toast.success('Riwayat dihapus');
    } catch {
      toast.error('Gagal menghapus riwayat');
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Hapus semua riwayat pencarian?')) return;

    try {
      await api.delete('/api/search/history');
      setHistory([]);
      toast.success('Riwayat pencarian dibersihkan');
    } catch {
      toast.error('Gagal membersihkan riwayat');
    }
  };

  const handleModeSwitch = (mode: SearchMode) => {
    setSearchMode(mode);
    if (activeQuery) {
      executeSearch(activeQuery, selectedCity, selectedCategory, mode, semanticSort);
      router.push(buildSearchUrl(activeQuery, mode, semanticSort));
    }
  };

  const handleSortChange = (newSort: SemanticSort) => {
    setSemanticSort(newSort);
    if (activeQuery && searchMode === 'semantic') {
      executeSearch(activeQuery, selectedCity, selectedCategory, 'semantic', newSort);
      router.push(buildSearchUrl(activeQuery, 'semantic', newSort));
    }
  };

  const handleQuickPrompt = (prompt: (typeof quickPrompts)[number]) => {
    if (activePromptTimeout.current) clearTimeout(activePromptTimeout.current);
    setActivePromptQuery(prompt.query);
    activePromptTimeout.current = setTimeout(() => setActivePromptQuery(''), 900);
    setQuery(prompt.query);
    setSearchMode(prompt.mode);
    executeSearch(prompt.query, selectedCity, selectedCategory, prompt.mode, semanticSort);
    router.push(buildSearchUrl(prompt.query, prompt.mode, semanticSort));
  };

  const clearAllFilters = () => {
    setQuery('');
    setActiveQuery('');
    setSelectedCity('');
    setSelectedCategory('');
    setResults([]);
    setTotalResults(0);
    setHasSearched(false);
    setSearchError('');
    router.push('/search');
  };

  const retrySearch = () => {
    executeSearch(activeQuery || query.trim(), selectedCity, selectedCategory, searchMode, semanticSort);
  };

  const activeFilterCount = (selectedCategory ? 1 : 0) + (selectedCity ? 1 : 0) + (activeQuery ? 1 : 0);

  const resultSummary = totalResults > results.length ? `${results.length} dari ${totalResults}` : `${results.length}`;
  const shouldFeatureFirstResult =
    searchMode === 'semantic' &&
    results[0] &&
    (semanticSort === 'relevance' || (getDestinationMatch(results[0]) ?? 0) >= 0.7);
  const ActiveModeIcon = searchMode === 'semantic' ? Brain : Type;

  return (
    <div className="space-y-6">
      <motion.section
        initial={shouldReduceMotion ? false : 'hidden'}
        animate={shouldReduceMotion ? undefined : 'visible'}
        variants={panelMotion}
        transition={{ duration: 0.36, ease: easeOutExpo }}
        className="relative overflow-hidden rounded-3xl border border-explore/15 bg-surface-warm p-4 text-slate-950 shadow-sm shadow-orange-900/5 md:p-6"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-40 w-56 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255, 123, 84, 0.22) 1px, transparent 0)',
            backgroundSize: '16px 16px',
            maskImage: 'linear-gradient(135deg, black, transparent 72%)',
          }}
        />
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-explore">Pusat pencarian</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">Eksplorasi Destinasi</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-700 md:text-base">
              Cari destinasi berdasarkan nama, kota, kategori, atau suasana perjalanan.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-black shadow-sm ${
              searchMode === 'semantic'
                ? 'border-ai/15 bg-ai-container text-ai shadow-blue-900/5'
                : 'border-explore/15 bg-white text-explore shadow-orange-900/5'
            }`}>
              <ActiveModeIcon className="h-4 w-4" />
              Mode aktif: {searchMode === 'semantic' ? 'Semantik' : 'Kata kunci'}
            </div>
            <div className="flex rounded-full border border-explore/15 bg-white p-1 shadow-sm shadow-orange-900/5">
              <button
                type="button"
                onClick={() => handleModeSwitch('keyword')}
                aria-pressed={searchMode === 'keyword'}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-black transition-colors sm:flex-none ${
                  searchMode === 'keyword' ? 'bg-explore text-white shadow-sm shadow-orange-900/15' : 'text-slate-600 hover:bg-explore-container hover:text-explore'
                }`}
              >
                <Type className="h-4 w-4" />
                Kata kunci
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('semantic')}
                aria-pressed={searchMode === 'semantic'}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-black transition-colors sm:flex-none ${
                  searchMode === 'semantic' ? 'bg-ai text-white shadow-sm shadow-blue-900/15' : 'text-slate-600 hover:bg-ai-container hover:text-ai'
                }`}
              >
                <Brain className="h-4 w-4" />
                Semantik
              </button>
            </div>
            <motion.button
              type="button"
              onClick={() => setShowModeInfo((value) => !value)}
              aria-label="Tampilkan informasi mode pencarian"
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
              className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition-colors hover:border-explore/30 hover:bg-explore-container hover:text-explore"
            >
              <Sparkles className="h-4 w-4" />
              Bedanya apa?
            </motion.button>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit}>
          <label htmlFor="search-main" className="sr-only">Cari destinasi</label>
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <div className="relative">
              {searchMode === 'semantic' ? (
                <Brain className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-ai" />
              ) : (
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              )}
              <input
                id="search-main"
                type="text"
                placeholder={searchMode === 'semantic' ? 'Contoh: pantai tenang untuk keluarga' : 'Contoh: Jam Gadang atau Bukittinggi'}
                className="min-h-16 w-full rounded-xl border-2 border-explore/15 bg-white py-3 pl-13 pr-4 text-base font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-explore focus:bg-white focus:ring-4 focus:ring-explore/20"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <motion.button
              type="submit"
              disabled={isLoading || !query.trim()}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              className="flex min-h-16 items-center justify-center gap-2 rounded-xl bg-explore px-8 text-sm font-black text-white shadow-sm shadow-primary/20 transition-all motion-safe:hover:-translate-y-0.5 hover:bg-explore/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
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
          className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-explore/15 bg-white px-3 text-xs font-black uppercase tracking-[0.12em] text-explore shadow-sm shadow-orange-900/5">
              <Sparkles className="h-3.5 w-3.5" />
              Rekomendasi cepat
            </span>
            {quickPrompts.map((prompt, index) => {
              const PromptIcon = prompt.icon;
              const isActivePrompt = activePromptQuery === prompt.query;

              return (
                <motion.button
                  key={prompt.query}
                  type="button"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: 0.16 + index * 0.04, ease: easeOutExpo }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                  onClick={() => handleQuickPrompt(prompt)}
                  aria-pressed={isActivePrompt}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-sm font-black shadow-sm transition-all ${
                    isActivePrompt
                      ? 'border-primary bg-primary text-white shadow-primary/20'
                      : `text-slate-700 hover:border-explore hover:bg-explore-container hover:text-explore ${prompt.tone}`
                  }`}
                >
                  {isActivePrompt ? <CheckCircle2 className="h-4 w-4" /> : <PromptIcon className="h-4 w-4" />}
                  {prompt.label}
                </motion.button>
              );
            })}
          </div>
          <p className="max-w-md text-sm font-semibold leading-6 text-slate-600 lg:text-right">
            Pilih prompt, lalu sesuaikan kata kuncinya dengan mood perjalanan Anda.
          </p>
        </motion.div>

        <AnimatePresence>
          {showModeInfo && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: easeOutExpo }}
              className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm shadow-slate-200/60 md:grid-cols-2"
            >
              <div className="rounded-xl bg-explore-container p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-900">
                  <Type className="h-4 w-4 text-slate-600" />
                  Pencarian kata kunci
                </div>
                <p className="text-sm leading-6 text-slate-600">Cocok untuk nama destinasi atau kota yang sudah Anda tahu.</p>
              </div>
              <div className="rounded-xl bg-ai-container p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-900">
                  <Brain className="h-4 w-4 text-ai" />
                  Pencarian semantik
                </div>
                <p className="text-sm leading-6 text-slate-600">Cocok untuk mencari berdasarkan suasana, aktivitas, atau konteks perjalanan.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)] lg:items-start 2xl:grid-cols-[20rem_minmax(0,1fr)]">
        <motion.aside
          initial={shouldReduceMotion ? false : 'hidden'}
          whileInView={shouldReduceMotion ? undefined : 'visible'}
          viewport={{ once: true, margin: '-60px' }}
          variants={railMotion}
          transition={{ duration: 0.3, ease: easeOutExpo }}
          className="space-y-4 lg:sticky lg:top-24"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-sm shadow-slate-200/70">
            <div className="mb-5 flex items-center justify-between gap-3 rounded-xl bg-explore-container px-3 py-2">
              <h2 className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-explore">
                <Search className="h-4 w-4" />
                Filter
              </h2>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex min-h-11 items-center rounded-full bg-slate-100 px-3 text-xs font-black text-slate-700 transition-colors hover:bg-explore hover:text-white"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="city-filter" className="mb-2 flex items-center gap-2 text-sm font-black text-slate-950">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ai-container text-ai">
                    <MapPin className="h-3.5 w-3.5" />
                  </span>
                  Kota
                </label>
                <NativeSelect
                  aria-label="Filter kota"
                  value={selectedCity}
                  onValueChange={handleCityChange}
                  leftIcon={<MapPin className="h-4 w-4" />}
                  className="rounded-xl border-slate-200 bg-slate-50 focus:ring-primary/20"
                  options={[
                    { value: '', label: 'Semua Kota', description: 'Tampilkan semua lokasi' },
                    ...cities.map((city) => ({ value: city, label: city })),
                  ]}
                />
              </div>

              <div>
                <label htmlFor="category-filter" className="mb-2 flex items-center gap-2 text-sm font-black text-slate-950">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success-container text-success">
                    <Type className="h-3.5 w-3.5" />
                  </span>
                  Kategori
                </label>
                <NativeSelect
                  aria-label="Filter kategori destinasi"
                  value={selectedCategory}
                  onValueChange={handleCategoryChange}
                  leftIcon={<Type className="h-4 w-4" />}
                  className="rounded-xl border-slate-200 bg-slate-50 focus:ring-primary/20"
                  options={[
                    { value: '', label: 'Semua Kategori', description: 'Tampilkan semua jenis destinasi' },
                    ...categoryOptions.map((category) => ({
                      value: category.value,
                      label: category.label,
                    })),
                  ]}
                />
              </div>
            </div>
          </div>

          {hasMounted && isAuthenticated && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-black uppercase tracking-[0.16em] text-slate-700">Riwayat</h2>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="inline-flex min-h-9 items-center rounded-full bg-slate-100 px-3 text-xs font-black text-slate-600 transition-colors hover:bg-danger-container hover:text-danger"
                  >
                    Bersihkan
                  </button>
                )}
              </div>
              {history.length > 0 ? (
                <ul className="space-y-2">
                  {history.slice(0, 5).map((item, index) => (
                    <li key={item.id ?? `${item.keyword}-${index}`} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleHistoryClick(item.keyword)}
                        className="flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-ai-container hover:text-ai"
                      >
                        <History className="h-4 w-4 shrink-0 text-ai" />
                        <span className="truncate">{item.keyword}</span>
                      </button>
                      {item.id && (
                        <button
                          type="button"
                          onClick={() => handleDeleteHistoryItem(item)}
                          aria-label={`Hapus riwayat ${item.keyword}`}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-danger-container hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
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
              className="mb-5 flex flex-col gap-3 rounded-2xl border border-danger/15 bg-surface-danger p-4 text-sm font-semibold text-danger sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <span>{searchError}</span>
              </div>
              <button
                type="button"
                onClick={retrySearch}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-black text-danger transition-colors hover:bg-danger-container"
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
              className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70"
            >
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-explore">Hasil pencarian</p>
                  <h2 className="mt-1 truncate text-2xl font-black leading-tight tracking-tight text-slate-900 md:text-3xl">
                    {activeQuery ? `"${activeQuery}"` : selectedCity || selectedCategory ? 'Filter aktif' : 'Belum ada query'}
                  </h2>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-500">
                    {searchMode === 'semantic' ? <Brain className="h-4 w-4 text-ai" /> : <Search className="h-4 w-4 text-slate-400" />}
                    {resultSummary} hasil, mode {searchMode === 'semantic' ? 'semantik' : 'kata kunci'}.
                  </p>
                </div>

                {searchMode === 'semantic' && (
                  <div className="w-full rounded-xl border border-ai/15 bg-ai-container p-2 shadow-sm shadow-blue-900/5 sm:w-auto">
                    <span className="mb-2 block px-2 text-[11px] font-black uppercase tracking-[0.14em] text-ai">Urutan hasil</span>
                    <div className="grid grid-cols-2 gap-1" role="group" aria-label="Urutan hasil semantik">
                      <button
                        type="button"
                        onClick={() => handleSortChange('hybrid')}
                        aria-pressed={semanticSort === 'hybrid'}
                        className={`min-h-11 rounded-xl px-3 text-sm font-black transition-colors ${
                          semanticSort === 'hybrid' ? 'bg-explore text-white shadow-sm shadow-orange-900/15' : 'text-slate-700 hover:bg-white hover:text-explore'
                        }`}
                      >
                        Rekomendasi
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSortChange('relevance')}
                        aria-pressed={semanticSort === 'relevance'}
                        className={`min-h-11 rounded-xl px-3 text-sm font-black transition-colors ${
                          semanticSort === 'relevance' ? 'bg-ai text-white shadow-sm shadow-blue-900/15' : 'text-slate-700 hover:bg-white hover:text-ai'
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
                    <motion.span layout className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-explore-container px-3 text-sm font-bold text-explore">
                      {searchMode === 'semantic' && <Brain className="h-3.5 w-3.5" />}
                      {activeQuery}
                      <button
                        type="button"
                        aria-label="Hapus query aktif"
                        onClick={() => {
                          setQuery('');
                          setActiveQuery('');
                          executeSearch('', selectedCity, selectedCategory, searchMode, semanticSort);
                          router.push('/search');
                        }}
                        className="-mr-3 flex h-11 w-11 items-center justify-center rounded-full hover:bg-explore/10"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.span>
                  )}
                  {selectedCity && (
                    <motion.span layout className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-ai-container px-3 text-sm font-bold text-ai">
                      <MapPin className="h-3.5 w-3.5" />
                      {selectedCity}
                      <button
                        type="button"
                        aria-label="Hapus filter kota"
                        onClick={() => handleCityChange('')}
                        className="-mr-3 flex h-11 w-11 items-center justify-center rounded-full hover:bg-ai/10"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.span>
                  )}
                  {selectedCategory && (
                    <motion.span layout className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-success-container px-3 text-sm font-bold text-success">
                      <Type className="h-3.5 w-3.5" />
                      {getDestinationCategoryLabel(selectedCategory)}
                      <button
                        type="button"
                        aria-label="Hapus filter kategori"
                        onClick={() => handleCategoryChange('')}
                        className="-mr-3 flex h-11 w-11 items-center justify-center rounded-full hover:bg-success/10"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.span>
                  )}
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="min-h-11 rounded-full px-3 text-sm font-black text-slate-500 transition-colors hover:bg-slate-100 hover:text-danger"
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
                  className="grid min-h-48 grid-cols-[9rem_minmax(0,1fr)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60 md:grid-cols-[11rem_minmax(0,1fr)] xl:min-h-52"
                >
                  <div className={`h-full motion-safe:animate-pulse ${
                    searchMode === 'semantic'
                      ? item % 2 === 0 ? 'bg-ai-container' : 'bg-surface-cool'
                      : item % 2 === 0 ? 'bg-explore-container' : 'bg-surface-warning'
                  }`} />
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
              {shouldFeatureFirstResult && (
                <SearchResultCard
                  destination={results[0]}
                  index={0}
                  searchMode={searchMode}
                  prefersReduced={shouldReduceMotion}
                  featured
                />
              )}
              {(shouldFeatureFirstResult ? results.length > 1 : results.length > 0) && (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  {(shouldFeatureFirstResult ? results.slice(1) : results).map((destination, index) => (
                    <SearchResultCard
                      key={destination.id}
                      destination={destination}
                      index={shouldFeatureFirstResult ? index + 1 : index}
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
              className="rounded-3xl border border-explore/15 bg-surface-warm p-8 text-center text-slate-950 shadow-sm shadow-orange-900/5 md:p-12"
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
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-explore px-5 text-sm font-black text-white transition-colors hover:bg-explore/90"
                >
                  {searchMode === 'semantic' ? <Type className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                  Ganti mode
                </button>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-explore/20 bg-white px-5 text-sm font-black text-slate-900 transition-colors hover:bg-explore-container"
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
