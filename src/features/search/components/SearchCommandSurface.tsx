import { AnimatePresence, motion } from 'framer-motion';
import { Brain, CheckCircle2, Search, Sparkles, Type } from 'lucide-react';
import type { FormEvent } from 'react';

import { quickPrompts, type QuickPrompt } from '../constants/search.constants';
import type { SearchMode } from '../types/search.types';
// ponytail: motion constants inlined

export function SearchCommandSurface({
  query,
  searchMode,
  isLoading,
  showModeInfo,
  activePromptQuery,
  shouldReduceMotion,
  onModeSwitch,
  onToggleModeInfo,
  onSubmit,
  onQueryChange,
  onQuickPrompt,
}: {
  query: string;
  searchMode: SearchMode;
  isLoading: boolean;
  showModeInfo: boolean;
  activePromptQuery: string;
  shouldReduceMotion: boolean;
  onModeSwitch: (mode: SearchMode) => void;
  onToggleModeInfo: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onQueryChange: (value: string) => void;
  onQuickPrompt: (prompt: QuickPrompt) => void;
}) {
  const ActiveModeIcon = searchMode === 'semantic' ? Brain : Type;

  return (
    <motion.section
      initial={shouldReduceMotion ? false : 'hidden'}
      animate={shouldReduceMotion ? undefined : 'visible'}
      variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-lg border border-white/60 bg-white/90 p-4 text-slate-950 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-xl md:p-6"
    >
      <div
        aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-40 w-56 opacity-45"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255, 123, 84, 0.18) 1px, transparent 0)',
          backgroundSize: '18px 18px',
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
          <div className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-black bg-amber-400 shadow-sm ${
            searchMode === 'semantic'
              ? 'border-ai/20 bg-ai-container text-ai shadow-amber-900/5'
              : 'border-explore/20 bg-white text-explore shadow-amber-900/5'
          }`}>
            <ActiveModeIcon className="h-4 w-4" />
            Mode aktif: {searchMode === 'semantic' ? 'Semantik' : 'Kata kunci'}
          </div>
          <div className="flex rounded-lg border border-slate-200 bg-white/95 p-1 shadow-sm shadow-orange-900/5">
            <button
              type="button"
              onClick={() => onModeSwitch('keyword')}
              aria-pressed={searchMode === 'keyword' ? "true" : "false"}
              className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md px-4 text-sm font-black transition-colors sm:flex-none ${
                searchMode === 'keyword' ? 'bg-explore text-white shadow-sm shadow-amber-900/15' : 'text-slate-600 hover:bg-explore-container hover:text-explore'
              }`}
            >
              <Type className="h-4 w-4" />
              Kata kunci
            </button>
            <button
              type="button"
              onClick={() => onModeSwitch('semantic')}
              aria-pressed={searchMode === 'semantic' ? "true" : "false"}
              className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md px-4 text-sm font-black  sm:flex-none ${
                searchMode === 'semantic' ? 'bg-amber-400 text-white shadow-sm shadow-amber-900/15' : 'text-slate-600 hover:bg-amber-400 hover:text-ai'
              }`}
            >
              <Brain className="h-4 w-4" />
              Semantik
            </button>
          </div>
          <motion.button
            type="button"
            onClick={onToggleModeInfo}
            aria-label="Tampilkan informasi mode pencarian"
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition-colors hover:border-explore/30 hover:bg-explore-container hover:text-explore"
          >
            <Sparkles className="h-4 w-4" />
            Bedanya apa?
          </motion.button>
        </div>
      </div>

      <form onSubmit={onSubmit}>
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
              className="min-h-16 w-full rounded-lg border-2 border-slate-200 bg-white/95 py-3 pl-13 pr-4 text-base font-bold text-slate-900 outline-none transition-[color,background-color,border-color,box-shadow,transform,opacity] placeholder:text-slate-400 focus:border-explore focus:bg-white focus:ring-4 focus:ring-explore/20"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
            />
          </div>
          <motion.button
            type="submit"
            disabled={isLoading || !query.trim()}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            className="flex min-h-16 items-center justify-center gap-2 rounded-lg bg-explore px-8 text-sm font-black text-white shadow-sm shadow-primary/20 transition-[color,background-color,border-color,box-shadow,transform,opacity] motion-safe:hover:-translate-y-0.5 hover:bg-explore/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <Search className="h-4 w-4" />
            Cari destinasi
          </motion.button>
        </div>
      </form>

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-explore/15 bg-white px-3 text-xs font-black uppercase tracking-[0.12em] text-explore shadow-sm shadow-orange-900/5">
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
                transition={{ duration: 0.24, delay: 0.16 + index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                onClick={() => onQuickPrompt(prompt)}
                aria-pressed={isActivePrompt ? "true" : "false"}
                className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-black shadow-sm transition-[color,background-color,border-color,box-shadow,transform,opacity] ${
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
          Cari berdasarkan mood perjalanan.
        </p>
      </motion.div>

      <AnimatePresence>
        {showModeInfo && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 text-slate-900 shadow-sm shadow-slate-200/60 md:grid-cols-2"
          >
            <div className="rounded-lg bg-explore-container p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-900">
                <Type className="h-4 w-4 text-slate-600" />
                Pencarian kata kunci
              </div>
              <p className="text-sm leading-6 text-slate-600">Cocok untuk nama destinasi atau kota yang sudah Anda tahu.</p>
            </div>
            <div className="rounded-lg bg-ai-container p-4">
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
  );
}
