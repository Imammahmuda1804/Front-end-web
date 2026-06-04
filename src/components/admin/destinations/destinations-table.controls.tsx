import { Download, Loader2, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, type NativeSelectOption } from "@/components/ui/native-select";
import { qualityOptions, ratingOptions, sortOptions, type QualityFilter, type RatingFilter, type SortFilter } from "./destinations-table";
export function DestinationFilterBar({
  searchTerm,
  setSearchTerm,
  city,
  cityOptions,
  quality,
  rating,
  sort,
  onChange,
  onReset,
  onAdd,
  hasActiveFilters,
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  city: string;
  cityOptions: NativeSelectOption[];
  quality: QualityFilter;
  rating: RatingFilter;
  sort: SortFilter;
  onChange: (updates: Record<string, string | number | null>) => void;
  onReset: () => void;
  onAdd: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
        Cari memakai nama/kota. Filter kualitas memakai kelengkapan media, Maps, koordinat, dan rating. Semua pilihan tersimpan di URL.
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari destinasi atau kota..."
            className="h-11 rounded-full border-slate-200 bg-slate-50 pl-9"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Cari destinasi atau kota"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {hasActiveFilters && (
            <Button variant="outline" className="h-11 rounded-full" onClick={onReset}>
              <X className="h-4 w-4" />
              Reset
            </Button>
          )}
          <Button className="h-11 rounded-full" onClick={onAdd}>
            <Plus className="h-4 w-4" />
            Tambah Destinasi
          </Button>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <NativeSelect
          aria-label="Filter kota destinasi"
          value={city}
          options={cityOptions}
          onValueChange={(value) => onChange({ city: value, page: 1 })}
          className="rounded-xl"
        />
        <NativeSelect
          aria-label="Filter kualitas data"
          value={quality}
          options={qualityOptions}
          onValueChange={(value) => onChange({ quality: value, page: 1 })}
          className="rounded-xl"
        />
        <NativeSelect
          aria-label="Filter rating destinasi"
          value={rating}
          options={ratingOptions}
          onValueChange={(value) => onChange({ rating: value, page: 1 })}
          className="rounded-xl"
        />
        <NativeSelect
          aria-label="Urutkan destinasi"
          value={sort}
          options={sortOptions}
          onValueChange={(value) => onChange({ sort: value, page: 1 })}
          className="rounded-xl"
        />
      </div>
    </div>
  );
}

export function BulkToolbar({
  selectedCount,
  onClear,
  onExport,
  onDelete,
  onScrape,
  isScraping,
}: {
  selectedCount: number;
  onClear: () => void;
  onExport: () => void;
  onDelete: () => void;
  onScrape: () => void;
  isScraping: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-orange-100 bg-orange-50/80 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm font-medium text-orange-900">{selectedCount} destinasi dipilih</div>
        <p className="mt-0.5 text-xs text-orange-800/80">
          Export untuk rekap, Scrape untuk ambil ulasan Maps, Hapus memakai soft delete.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="rounded-full bg-white" onClick={onExport}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <Button variant="outline" size="sm" className="rounded-full bg-white" onClick={onScrape} disabled={isScraping}>
          {isScraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Scrape
        </Button>
        <Button variant="destructive" size="sm" className="rounded-full" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          Hapus
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full" onClick={onClear}>
          Batal pilih
        </Button>
      </div>
    </div>
  );
}



