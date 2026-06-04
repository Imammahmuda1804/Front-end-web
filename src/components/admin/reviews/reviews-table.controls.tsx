import { CalendarDays, Download, RotateCcw, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect, type NativeSelectOption } from '@/components/ui/native-select';
import { nlpOptions, sentimentOptions, sortOptions, type NlpStatusFilter, type SentimentFilter, type SortFilter } from './ReviewsTable';
export function ReviewFilterBar({
    queryTerm,
    setQueryTerm,
    sentimentFilter,
    nlpStatus,
    sortBy,
    dateFrom,
    dateTo,
    topicId,
    topicOptions,
    hasActiveFilters,
    onChange,
    onReset,
    onCategoryDelete,
}: {
    queryTerm: string;
    setQueryTerm: (value: string) => void;
    sentimentFilter: SentimentFilter;
    nlpStatus: NlpStatusFilter;
    sortBy: SortFilter;
    dateFrom: string;
    dateTo: string;
    topicId: string;
    topicOptions: NativeSelectOption[];
    hasActiveFilters: boolean;
    onChange: (updates: Record<string, string | number | null>) => void;
    onReset: () => void;
    onCategoryDelete: (category: 'all' | 'processed' | 'unprocessed', label: string) => void;
}) {
    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h3 className="flex items-center gap-2 font-semibold text-slate-950">
                        <SlidersHorizontal className="h-4 w-4 text-orange-500" />
                        Moderasi review
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                        Search bersifat cepat pada data halaman ini. Filter lain dikirim ke API dan tersimpan di URL.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {hasActiveFilters && (
                        <Button variant="outline" className="rounded-full" onClick={onReset}>
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </Button>
                    )}
                    <Button
                        variant="destructive"
                        className="rounded-full"
                        onClick={() => onCategoryDelete('unprocessed', 'review belum diproses')}
                    >
                        <Trash2 className="h-4 w-4" />
                        Hapus belum NLP
                    </Button>
                </div>
            </div>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        aria-label="Cari reviewer atau teks review"
                        className="h-12 rounded-full border-slate-200 bg-slate-50 pl-9"
                        placeholder="Cari reviewer, teks, topik..."
                        value={queryTerm}
                        onChange={(event) => setQueryTerm(event.target.value)}
                    />
                </div>
                <NativeSelect
                    aria-label="Filter sentimen review"
                    value={sentimentFilter}
                    options={sentimentOptions}
                    onValueChange={(value) => onChange({ sentiment: value, page: 1 })}
                    className="rounded-xl"
                />
                <NativeSelect
                    aria-label="Filter status NLP"
                    value={nlpStatus}
                    options={nlpOptions}
                    onValueChange={(value) => onChange({ nlp_status: value, page: 1 })}
                    className="rounded-xl"
                />
                <NativeSelect
                    aria-label="Urutkan review"
                    value={sortBy}
                    options={sortOptions}
                    onValueChange={(value) => onChange({ sort: value, page: 1 })}
                    className="rounded-xl"
                />
                <NativeSelect
                    aria-label="Filter topik review"
                    value={topicId}
                    options={topicOptions}
                    onValueChange={(value) => onChange({ topic_id: value, page: 1 })}
                    className="rounded-xl"
                />
                <label className="space-y-1">
                    <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <CalendarDays className="h-3 w-3" />
                        Dari
                    </span>
                    <Input
                        type="date"
                        value={dateFrom}
                        onChange={(event) => onChange({ date_from: event.target.value, page: 1 })}
                        className="h-12 rounded-xl border-slate-200 bg-slate-50"
                    />
                </label>
                <label className="space-y-1">
                    <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <CalendarDays className="h-3 w-3" />
                        Sampai
                    </span>
                    <Input
                        type="date"
                        value={dateTo}
                        min={dateFrom || undefined}
                        onChange={(event) => onChange({ date_to: event.target.value, page: 1 })}
                        className="h-12 rounded-xl border-slate-200 bg-slate-50"
                    />
                </label>
                <NativeSelect
                    aria-label="Hapus masal kategori review"
                    value=""
                    options={[
                        { value: '', label: 'Hapus kategori...', description: 'Aksi destruktif dengan konfirmasi' },
                        { value: 'processed', label: 'Sudah diproses' },
                        { value: 'unprocessed', label: 'Belum diproses' },
                        { value: 'all', label: 'Semua review' },
                    ]}
                    onValueChange={(value) => {
                        if (value === 'all' || value === 'processed' || value === 'unprocessed') {
                            onCategoryDelete(value, value === 'all' ? 'semua review' : value === 'processed' ? 'review sudah diproses' : 'review belum diproses');
                        }
                    }}
                    className="rounded-xl border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300"
                />
            </div>
        </div>
    );
}

export function ReviewBulkToolbar({
    selectedCount,
    onClear,
    onExport,
    onDelete,
}: {
    selectedCount: number;
    onClear: () => void;
    onExport: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="flex flex-col gap-3 border-b border-orange-100 bg-orange-50/80 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <div className="text-sm font-semibold text-orange-900">{selectedCount} review dipilih</div>
                <p className="mt-0.5 text-xs text-orange-800/80">Export untuk audit manual, hapus untuk moderasi terpilih.</p>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="rounded-full bg-white" onClick={onExport}>
                    <Download className="h-4 w-4" />
                    Export CSV
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



