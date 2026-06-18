'use client';

import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { DESTINATION_CATEGORIES } from '@/lib/destination-categories';
import { SearchCommandSurface } from './SearchCommandSurface';
import { SearchFilterPanel } from './SearchFilterPanel';
import { SearchHistoryPanel } from './SearchHistoryPanel';
import SearchResultCard, { getDestinationMatch } from './SearchResultCard';
import { SearchResultSummary } from './SearchResultSummary';
import { SearchEmptyState } from './SearchEmptyState';
import { SearchLoadingGrid } from './SearchLoadingGrid';
import {
  clearSearchHistory,
  deleteSearchHistoryItem,
  fetchSearchCategories,
  fetchSearchCities,
  fetchSearchHistory,
} from './search.api';
import type { QuickPrompt } from './search.constants';
import type {
  CategoryOption,
  Destination,
  DestinationSearchParams,
  SearchHistoryItem,
  SearchMode,
  SemanticSort,
} from './search.types';
import {
  easeOutExpo,
  getHydratedSnapshot,
  getServerHydratedSnapshot,
  isSearchMode,
  isSemanticSort,
  railMotion,
  subscribeToHydration,
} from './search.utils';
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
        const list = await fetchSearchCities();
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
        setCategoryOptions(await fetchSearchCategories());
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
      setHistory(await fetchSearchHistory());
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
      await deleteSearchHistoryItem(item.id);
      setHistory((current) => current.filter((entry) => entry.id !== item.id));
      toast.success('Riwayat dihapus');
    } catch {
      toast.error('Gagal menghapus riwayat');
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Hapus semua riwayat pencarian?')) return;

    try {
      await clearSearchHistory();
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

  const handleQuickPrompt = (prompt: QuickPrompt) => {
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

  return (
    <div className="space-y-6">
      <SearchCommandSurface
        query={query}
        searchMode={searchMode}
        isLoading={isLoading}
        showModeInfo={showModeInfo}
        activePromptQuery={activePromptQuery}
        shouldReduceMotion={shouldReduceMotion}
        onModeSwitch={handleModeSwitch}
        onToggleModeInfo={() => setShowModeInfo((value) => !value)}
        onSubmit={handleSearchSubmit}
        onQueryChange={setQuery}
        onQuickPrompt={handleQuickPrompt}
      />

      <div className="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)] lg:items-start 2xl:grid-cols-[20rem_minmax(0,1fr)]">
        <motion.aside
          initial={shouldReduceMotion ? false : 'hidden'}
          whileInView={shouldReduceMotion ? undefined : 'visible'}
          viewport={{ once: true, margin: '-60px' }}
          variants={railMotion}
          transition={{ duration: 0.3, ease: easeOutExpo }}
          className="space-y-4 lg:sticky lg:top-24"
        >
          <SearchFilterPanel
            activeFilterCount={activeFilterCount}
            cities={cities}
            categoryOptions={categoryOptions}
            selectedCity={selectedCity}
            selectedCategory={selectedCategory}
            onCityChange={handleCityChange}
            onCategoryChange={handleCategoryChange}
            onClearAll={clearAllFilters}
          />

          {hasMounted && isAuthenticated && (
            <SearchHistoryPanel
              history={history}
              onClearHistory={handleClearHistory}
              onHistoryClick={handleHistoryClick}
              onDeleteHistoryItem={handleDeleteHistoryItem}
            />
          )}
        </motion.aside>

        <section className="min-w-0">
          {searchError && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: easeOutExpo }}
              className="mb-5 flex flex-col gap-3 rounded-lg border border-danger/15 bg-surface-danger p-4 text-sm font-semibold text-danger sm:flex-row sm:items-center sm:justify-between"
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
            >
              <SearchResultSummary
                activeQuery={activeQuery}
                selectedCity={selectedCity}
                selectedCategory={selectedCategory}
                searchMode={searchMode}
                semanticSort={semanticSort}
                resultSummary={resultSummary}
                activeFilterCount={activeFilterCount}
                onSortChange={handleSortChange}
                onClearQuery={() => {
                  setQuery('');
                  setActiveQuery('');
                  executeSearch('', selectedCity, selectedCategory, searchMode, semanticSort);
                  router.push('/search');
                }}
                onCityChange={handleCityChange}
                onCategoryChange={handleCategoryChange}
                onClearAll={clearAllFilters}
              />
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: easeOutExpo }}
            >
              <SearchLoadingGrid searchMode={searchMode} prefersReduced={shouldReduceMotion} />
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
            >
              <SearchEmptyState
                searchMode={searchMode}
                onSwitchMode={() => handleModeSwitch(searchMode === 'semantic' ? 'keyword' : 'semantic')}
                onResetFilters={clearAllFilters}
              />
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}

