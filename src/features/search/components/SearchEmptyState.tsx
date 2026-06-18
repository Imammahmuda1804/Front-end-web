import { Brain, RotateCcw, Search, Type } from 'lucide-react';

import type { SearchMode } from '../types/search.types';

export function SearchEmptyState({
  searchMode,
  onSwitchMode,
  onResetFilters,
}: {
  searchMode: SearchMode;
  onSwitchMode: () => void;
  onResetFilters: () => void;
}) {
  return (
    <div className="rounded-lg border border-explore/15 bg-surface-warm p-8 text-center text-slate-950 shadow-sm shadow-orange-900/5 md:p-12">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-white">
        <Search className="h-8 w-8" />
      </div>
      <h3 className="text-3xl font-black tracking-tight text-slate-950">Tidak ada hasil ditemukan</h3>
      <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-7 text-slate-700">
        Coba ubah kata kunci, ganti mode pencarian, atau reset filter yang sedang aktif.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onSwitchMode}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-explore px-5 text-sm font-black text-white transition-colors hover:bg-explore/90"
        >
          {searchMode === 'semantic' ? <Type className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
          Ganti mode
        </button>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-explore/20 bg-white px-5 text-sm font-black text-slate-900 transition-colors hover:bg-explore-container"
        >
          <RotateCcw className="h-4 w-4" />
          Reset filter
        </button>
      </div>
    </div>
  );
}
