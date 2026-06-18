import { FileSpreadsheet, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import type { AdminDestination } from '@/features/admin';
import type { ScrapingHistoryItem } from '../services/scraper.service';
import { formatDate } from './ScraperClient';

export function ScrapingHistoryPanel({
  histories,
  destinations,
  selectedDestination,
  meta,
  loading,
  error,
  onDestinationChange,
  onPageChange,
  onRefresh,
}: {
  histories: ScrapingHistoryItem[];
  destinations: AdminDestination[];
  selectedDestination: string;
  meta: { page: number; limit: number; total: number; total_pages: number };
  loading: boolean;
  error: string;
  onDestinationChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-blue-50/60 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Review hasil scraping</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Scraping History</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">File dan batch review yang sudah pernah dihasilkan scraper.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <NativeSelect
            aria-label="Filter history scraping berdasarkan destinasi"
            value={selectedDestination}
            onValueChange={onDestinationChange}
            options={[
              { value: '', label: 'Semua destinasi' },
              ...destinations.map((destination) => ({
                value: String(destination.id),
                label: destination.name,
                description: destination.city || undefined,
              })),
            ]}
            searchable
            searchPlaceholder="Cari destinasi..."
            wrapperClassName="min-w-64"
            className="bg-white"
          />
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-blue-100 bg-white px-4 text-sm font-black text-ai transition hover:bg-ai-container"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="m-4 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Destinasi</th>
              <th className="p-4">Job</th>
              <th className="p-4">Review</th>
              <th className="p-4">File</th>
              <th className="p-4">Dibuat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={6} className="p-3">
                    <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                  </td>
                </tr>
              ))
            ) : histories.length === 0 ? (
              <tr>
                <td colSpan={6} className="h-44 text-center">
                  <FileSpreadsheet className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                  <p className="font-black text-slate-700">Belum ada history scraping</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Mulai job scraping untuk membuat history baru.</p>
                </td>
              </tr>
            ) : (
              histories.map((history) => (
                <tr key={history.id} className="hover:bg-slate-50/70">
                  <td className="p-4 font-mono text-xs font-bold text-slate-400">#{history.id}</td>
                  <td className="p-4 font-black text-slate-900">{history.destination?.name || '-'}</td>
                  <td className="p-4 font-mono text-xs font-bold text-slate-500">{history.jobId ? `#${history.jobId}` : '-'}</td>
                  <td className="p-4 font-black text-slate-800">{history.totalReviews ?? history.reviewsCount ?? history.job?.totalReviews ?? '-'}</td>
                  <td className="p-4 text-xs font-bold text-slate-500">{history.fileName || history.filePath || '-'}</td>
                  <td className="p-4 text-sm font-bold text-slate-500">{formatDate(history.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 p-4">
        <p className="text-sm font-bold text-slate-500">
          Total {meta.total || 0} history
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={meta.page <= 1 || loading}
            onClick={() => onPageChange(Math.max(1, meta.page - 1))}
          >
            Sebelumnya
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={meta.page >= meta.total_pages || loading}
            onClick={() => onPageChange(meta.page + 1)}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </section>
  );
}
