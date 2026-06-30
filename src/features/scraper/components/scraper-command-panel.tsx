import { AlignLeft, BarChart3, CalendarClock, ChevronRight, Database, Globe2, LinkIcon, Loader2, Lock, MapPin, Play, RefreshCw, Search, Star, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import type { AdminDestination } from '@/features/admin';
import type { PlaceResult, ScraperOverview } from '../services/scraper.service';

export function ScraperCommandPanel({
  destinations,
  destinationsError,
  selectedDestination,
  mapsUrl,
  maxReviews,
  fetchAllReviews,
  mapsSearchQuery,
  mapsSearchResults,
  isSearchingMaps,
  scraperOverview,
  isLoadingOverview,
  overviewError,
  isStarting,
  onDestinationChange,
  onMapsUrlChange,
  onMaxReviewsChange,
  onFetchAllReviewsChange,
  onMapsSearchQueryChange,
  onSearchMaps,
  onRefreshOverview,
  onSelectMapsResult,
  onStart,
}: {
  destinations: AdminDestination[];
  destinationsError: string;
  selectedDestination: string;
  mapsUrl: string;
  maxReviews: number;
  fetchAllReviews: boolean;
  mapsSearchQuery: string;
  mapsSearchResults: PlaceResult[];
  isSearchingMaps: boolean;
  scraperOverview: ScraperOverview | null;
  isLoadingOverview: boolean;
  overviewError: string;
  isStarting: boolean;
  onDestinationChange: (value: string) => void;
  onMapsUrlChange: (value: string) => void;
  onMaxReviewsChange: (value: number) => void;
  onFetchAllReviewsChange: (value: boolean) => void;
  onMapsSearchQueryChange: (value: string) => void;
  onSearchMaps: () => void;
  onRefreshOverview: () => void;
  onSelectMapsResult: (place: PlaceResult) => void;
  onStart: () => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-primary">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Scraper command</p>
          <h2 className="text-xl font-black text-slate-950">Scraping Job Baru</h2>
        </div>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-600">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Destinasi
          </span>
          <NativeSelect
            aria-label="Pilih destinasi untuk scraping"
            value={selectedDestination}
            onValueChange={onDestinationChange}
            options={destinations.map((destination) => ({
              value: String(destination.id),
              label: destination.name,
              description: destination.city || undefined,
            }))}
            placeholder={destinationsError || 'Pilih destinasi wisata'}
            searchable
            searchPlaceholder="Cari nama destinasi..."
          />
        </label>

        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
          <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-blue-400">
            <Search className="h-3.5 w-3.5" />
            Cari tempat Maps
          </span>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Input
              value={mapsSearchQuery}
              onChange={(event) => onMapsSearchQueryChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  onSearchMaps();
                }
              }}
              placeholder="Nama destinasi di Google Maps"
              className="min-h-11 rounded-xl border-blue-100 bg-white text-sm font-bold"
            />
            <Button
              type="button"
              onClick={onSearchMaps}
              disabled={isSearchingMaps}
              className="min-h-11 rounded-xl bg-ai px-4 font-black text-amber-500 hover:bg-ai/90"
            >
              {isSearchingMaps ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Cari
            </Button>
          </div>
          {mapsSearchResults.length > 0 && (
            <div className="mt-3 space-y-2">
              {mapsSearchResults.slice(0, 4).map((place, index) => (
                <button
                  key={`${place.placeId || place.url || place.title}-${index}`}
                  type="button"
                  onClick={() => onSelectMapsResult(place)}
                  className="flex w-full items-start gap-3 rounded-xl border border-blue-100 bg-white p-3 text-left transition hover:border-ai/40 hover:bg-ai-container"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ai" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-slate-900">{place.title || 'Tempat Maps'}</span>
                    <span className="mt-1 line-clamp-2 text-xs font-semibold text-slate-500">{place.address || place.url || 'Pilih untuk memakai URL Maps'}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-600">
            <LinkIcon className="h-3.5 w-3.5 text-ai" />
            URL Google Maps
          </span>
          <Input
            value={mapsUrl}
            onChange={(event) => onMapsUrlChange(event.target.value)}
            placeholder="https://maps.google.com/..."
            className="min-h-12 rounded-xl border-slate-200 bg-slate-50 font-mono text-xs"
          />
          <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">Opsional. Kosongkan untuk memakai URL yang tersimpan pada data destinasi.</p>
        </label>

        {selectedDestination && (
          <ScraperOverviewPanel
            overview={scraperOverview}
            loading={isLoadingOverview}
            error={overviewError}
            onRefresh={onRefreshOverview}
          />
        )}

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={fetchAllReviews}
              onChange={(event) => onFetchAllReviewsChange(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>
              <span className="block text-sm font-black text-slate-950">Ambil seluruh ulasan berteks</span>
              <span className="mt-1 block text-xs font-semibold leading-5 text-slate-600">
                Scraper akan mencoba mengambil semua review dari Maps, lalu tetap menyimpan hanya ulasan yang punya teks. Job bisa berjalan lebih lama dan memakai kuota Apify lebih besar.
              </span>
            </span>
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-600">Batas ulasan</span>
          <Input
            type="number"
            min={1}
            max={5000}
            value={maxReviews}
            onChange={(event) => onMaxReviewsChange(Math.max(1, Number(event.target.value) || 100))}
            disabled={fetchAllReviews}
            className="min-h-12 rounded-xl border-slate-200 bg-slate-50 font-black disabled:cursor-not-allowed disabled:opacity-60"
          />
          <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
            {fetchAllReviews ? 'Diabaikan karena mode seluruh ulasan aktif.' : 'Batas hanya berlaku saat mode seluruh ulasan tidak aktif.'}
          </p>
        </label>

        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
            <Lock className="h-3.5 w-3.5" />
            Filter dikunci
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterPill icon={<CalendarClock className="h-3 w-3" />} label="Terbaru" />
            <FilterPill icon={<Star className="h-3 w-3" />} label="Semua bintang" />
            <FilterPill icon={<AlignLeft className="h-3 w-3" />} label="Hanya berteks" />
          </div>
        </div>

        <Button
          className="min-h-12 w-full rounded-full bg-emerald-500 px-5 font-black text-white shadow-sm shadow-white hover:bg-emerald/90"
          onClick={onStart}
          disabled={isStarting}
        >
          {isStarting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
          {isStarting ? 'Memulai...' : 'Mulai Scraping'}
          {!isStarting && <ChevronRight className="ml-auto h-4 w-4 opacity-70" />}
        </Button>
      </div>
    </section>
  );
}

function FilterPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-black text-primary">{icon}{label}</span>;
}

function ScraperOverviewPanel({
  overview,
  loading,
  error,
  onRefresh,
}: {
  overview: ScraperOverview | null;
  loading: boolean;
  error: string;
  onRefresh: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
            <Globe2 className="h-3.5 w-3.5 text-ai" />
            Ringkasan Maps
          </span>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
            Angka review total diambil live dari Google Maps, bukan dari database.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh ringkasan Google Maps"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-ai/40 hover:text-ai disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800">
          {error}
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <OverviewMetric
          icon={<Globe2 className="h-4 w-4" />}
          label="Review di Maps"
          value={loading ? '...' : formatOverviewNumber(overview?.live_google.total_reviews)}
          helper={overview?.live_google.rating ? `Rating ${overview.live_google.rating}` : 'Live via Apify'}
        />
        <OverviewMetric
          icon={<Database className="h-4 w-4" />}
          label="Ulasan tersimpan"
          value={loading ? '...' : formatOverviewNumber(overview?.database.stored_text_reviews)}
          helper={`${formatOverviewPercent(overview?.coverage.stored_text_reviews_percent)} dari live`}
        />
        <OverviewMetric
          icon={<BarChart3 className="h-4 w-4" />}
          label="Sudah diproses"
          value={loading ? '...' : formatOverviewNumber(overview?.database.processed_reviews)}
          helper={`${formatOverviewPercent(overview?.coverage.processed_reviews_percent)} punya NLP`}
        />
        <OverviewMetric
          icon={<RefreshCw className="h-4 w-4" />}
          label="Job terakhir"
          value={loading ? '...' : overview?.database.latest_scraping_job?.status ?? '-'}
          helper={overview?.database.latest_scraping_job ? `Job #${overview.database.latest_scraping_job.id}` : 'Belum ada job'}
        />
      </div>

      {overview?.text_filter_note && (
        <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">{overview.text_filter_note}</p>
      )}
    </div>
  );
}

function OverviewMetric({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-lg border border-white bg-white px-3 py-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
        <span className="text-ai">{icon}</span>
        {label}
      </div>
      <p className="text-lg font-black text-slate-950">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-500">{helper}</p>
    </div>
  );
}

function formatOverviewNumber(value?: number | null) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
  return value.toLocaleString('id-ID');
}

function formatOverviewPercent(value?: number | null) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
  return `${value.toLocaleString('id-ID')}%`;
}
