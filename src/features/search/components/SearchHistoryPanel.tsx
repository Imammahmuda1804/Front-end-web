import { History, Trash2 } from 'lucide-react';

import type { SearchHistoryItem } from '../types/search.types';

export function SearchHistoryPanel({
  history,
  onClearHistory,
  onHistoryClick,
  onDeleteHistoryItem,
}: {
  history: SearchHistoryItem[];
  onClearHistory: () => void;
  onHistoryClick: (keyword: string) => void;
  onDeleteHistoryItem: (item: SearchHistoryItem) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-black uppercase tracking-[0.16em] text-slate-700">Riwayat</h2>
        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
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
                onClick={() => onHistoryClick(item.keyword)}
                className="flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-ai-container "
              >
                <History className="h-4 w-4 shrink-0 " />
                <span className="truncate">{item.keyword}</span>
              </button>
              {item.id && (
                <button
                  type="button"
                  onClick={() => onDeleteHistoryItem(item)}
                  aria-label={`Hapus riwayat ${item.keyword}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-danger-container hover:text-danger"
                >
                  <Trash2 className=" h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm leading-6 text-slate-500">Belum ada riwayat pencarian.</p>
      )}
    </div>
  );
}
