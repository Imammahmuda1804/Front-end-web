import { Brain, MapPin, Search, Type, X } from 'lucide-react';
import { motion } from 'framer-motion';

import { getDestinationCategoryLabel } from '@/lib/destination-categories';
import type { SearchMode, SemanticSort } from '../types/search.types';

export function SearchResultSummary({
  activeQuery,
  selectedCity,
  selectedCategory,
  searchMode,
  semanticSort,
  resultSummary,
  activeFilterCount,
  onSortChange,
  onClearQuery,
  onCityChange,
  onCategoryChange,
  onClearAll,
}: {
  activeQuery: string;
  selectedCity: string;
  selectedCategory: string;
  searchMode: SearchMode;
  semanticSort: SemanticSort;
  resultSummary: string;
  activeFilterCount: number;
  onSortChange: (sort: SemanticSort) => void;
  onClearQuery: () => void;
  onCityChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClearAll: () => void;
}) {
  return (
    <div className="mb-5 rounded-lg border border-white/60 bg-white/92 p-4 shadow-sm shadow-slate-900/10 backdrop-blur-xl">
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
          <div className="w-full rounded-lg border border-ai/15 bg-ai-container p-2 shadow-sm shadow-blue-900/5 sm:w-auto">
            <span className="mb-2 block px-2 text-[11px] font-black uppercase tracking-[0.14em] text-ai">Urutan hasil</span>
            <div className="grid grid-cols-2 gap-1" role="group" aria-label="Urutan hasil semantik">
              <button
                type="button"
                onClick={() => onSortChange('hybrid')}
                aria-pressed={semanticSort === 'hybrid'}
                className={`min-h-11 rounded-lg px-3 text-sm font-black transition-colors ${
                  semanticSort === 'hybrid' ? 'bg-explore text-white shadow-sm shadow-orange-900/15' : 'text-slate-700 hover:bg-white hover:text-explore'
                }`}
              >
                Rekomendasi
              </button>
              <button
                type="button"
                onClick={() => onSortChange('relevance')}
                aria-pressed={semanticSort === 'relevance'}
                className={`min-h-11 rounded-lg px-3 text-sm font-black transition-colors ${
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
            <motion.span layout className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-explore-container px-3 text-sm font-bold text-explore">
              {searchMode === 'semantic' && <Brain className="h-3.5 w-3.5" />}
              {activeQuery}
              <button
                type="button"
                aria-label="Hapus query aktif"
                onClick={onClearQuery}
                className="-mr-3 flex h-11 w-11 items-center justify-center rounded-lg hover:bg-explore/10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.span>
          )}
          {selectedCity && (
            <motion.span layout className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-ai-container px-3 text-sm font-bold text-ai">
              <MapPin className="h-3.5 w-3.5" />
              {selectedCity}
              <button
                type="button"
                aria-label="Hapus filter kota"
                onClick={() => onCityChange('')}
                className="-mr-3 flex h-11 w-11 items-center justify-center rounded-lg hover:bg-ai/10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.span>
          )}
          {selectedCategory && (
            <motion.span layout className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-success-container px-3 text-sm font-bold text-success">
              <Type className="h-3.5 w-3.5" />
              {getDestinationCategoryLabel(selectedCategory)}
              <button
                type="button"
                aria-label="Hapus filter kategori"
                onClick={() => onCategoryChange('')}
                className="-mr-3 flex h-11 w-11 items-center justify-center rounded-lg hover:bg-success/10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.span>
          )}
          <button
            type="button"
            onClick={onClearAll}
            className="min-h-11 rounded-lg px-3 text-sm font-black text-slate-500 transition-colors hover:bg-slate-100 hover:text-danger"
          >
            Hapus semua
          </button>
        </motion.div>
      )}
    </div>
  );
}
