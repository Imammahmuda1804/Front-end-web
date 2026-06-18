import type { SearchMode } from '../types/search.types';

export function SearchLoadingGrid({
  count = 6,
  searchMode,
  prefersReduced,
}: {
  count?: number;
  searchMode: SearchMode;
  prefersReduced: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => {
        const item = index + 1;
        const imageTone =
          searchMode === 'semantic'
            ? item % 2 === 0
              ? 'bg-ai-container'
              : 'bg-surface-cool'
            : item % 2 === 0
              ? 'bg-explore-container'
              : 'bg-surface-warning';
        const pulseClass = prefersReduced ? '' : 'motion-safe:animate-pulse';

        return (
          <div
            key={item}
            className="grid min-h-48 grid-cols-[9rem_minmax(0,1fr)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/60 md:grid-cols-[11rem_minmax(0,1fr)] xl:min-h-52"
          >
            <div className={`h-full ${imageTone} ${pulseClass}`} />
            <div className="space-y-3 p-4 md:p-5">
              <div className={`h-6 w-3/4 rounded bg-slate-200 ${pulseClass}`} />
              <div className={`h-4 w-1/3 rounded bg-slate-200 ${pulseClass}`} />
              <div className="grid grid-cols-2 gap-2">
                <div className={`h-11 rounded-lg bg-orange-100 ${pulseClass}`} />
                <div className={`h-11 rounded-lg bg-blue-100 ${pulseClass}`} />
              </div>
              <div className={`h-9 w-24 rounded-full bg-slate-200 ${pulseClass}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
