import { MapPin, Search, Type } from 'lucide-react';

import { NativeSelect } from '@/components/ui/native-select';
import type { CategoryOption } from '../types/search.types';

export function SearchFilterPanel({
  activeFilterCount,
  cities,
  categoryOptions,
  selectedCity,
  selectedCategory,
  onCityChange,
  onCategoryChange,
  onClearAll,
}: {
  activeFilterCount: number;
  cities: string[];
  categoryOptions: CategoryOption[];
  selectedCity: string;
  selectedCategory: string;
  onCityChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClearAll: () => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 text-slate-950 shadow-sm shadow-slate-200/70">
      <div className="mb-5 flex items-center justify-between gap-3 rounded-lg bg-explore-container px-3 py-2">
        <h2 className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-explore">
          <Search className="h-4 w-4" />
          Filter
        </h2>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex min-h-11 items-center rounded-lg bg-slate-100 px-3 text-xs font-black text-slate-700 transition-colors hover:bg-explore hover:text-white"
          >
            Reset
          </button>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="city-filter" className="mb-2 flex items-center gap-2 text-sm font-black text-slate-950">
            <span className="flex h-7 w-7 items-center justify-center rounded-md text-ai border-amber-100 bg-amber-400">
              <MapPin className="h-3.5 w-3.5" />
            </span>
            Kota
          </label>
          <NativeSelect
            aria-label="Filter kota"
            value={selectedCity}
            onValueChange={onCityChange}
            leftIcon={<MapPin className="h-4 w-4" />}
            className="rounded-lg border-slate-200 bg-slate-50 focus:ring-primary/20"
            options={[
              { value: '', label: 'Semua Kota', description: 'Tampilkan semua lokasi' },
              ...cities.map((city) => ({ value: city, label: city })),
            ]}
          />
        </div>

        <div>
          <label htmlFor="category-filter" className="mb-2 flex items-center gap-2 text-sm font-black text-slate-950">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-success-container text-success">
              <Type className="h-3.5 w-3.5" />
            </span>
            Kategori
          </label>
          <NativeSelect
            aria-label="Filter kategori destinasi"
            value={selectedCategory}
            onValueChange={onCategoryChange}
            leftIcon={<Type className="h-4 w-4" />}
            className="rounded-lg border-slate-200 bg-slate-50 focus:ring-primary/20"
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
  );
}
