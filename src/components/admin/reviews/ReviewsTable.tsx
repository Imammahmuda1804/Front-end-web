'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CircleHelp,
    Download,
    Eye,
    FileText,
    Hash,
    Loader2,
    MessageSquare,
    RotateCcw,
    Search,
    SlidersHorizontal,
    Star,
    Tags,
    ThumbsUp,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { GetAdminReviewsResponse, Review, adminReviewsService } from '@/services/admin/reviews.service';

interface ReviewsTableProps {
    destinationId: number;
}

type SentimentFilter = 'positive' | 'negative' | 'neutral' | '';
type NlpStatusFilter = 'all' | 'processed' | 'unprocessed';
type SortFilter = 'newest' | 'oldest';

type DeleteTarget =
    | { type: 'single'; review: Review }
    | { type: 'selected'; reviews: Review[] }
    | { type: 'category'; category: 'all' | 'processed' | 'unprocessed'; label: string }
    | null;

const LIMIT = 10;

const sentimentOptions: NativeSelectOption[] = [
    { value: '', label: 'Semua sentimen', description: 'Positif, negatif, dan netral' },
    { value: 'positive', label: 'Positif', description: 'Review bernada baik' },
    { value: 'negative', label: 'Negatif', description: 'Review yang perlu diprioritaskan' },
    { value: 'neutral', label: 'Netral', description: 'Review tanpa sinyal kuat' },
];

const nlpOptions: NativeSelectOption[] = [
    { value: 'all', label: 'Semua NLP' },
    { value: 'processed', label: 'Sudah diproses' },
    { value: 'unprocessed', label: 'Belum diproses' },
];

const sortOptions: NativeSelectOption[] = [
    { value: 'newest', label: 'Terbaru dulu' },
    { value: 'oldest', label: 'Terlama dulu' },
];

function getErrorMessage(error: unknown, fallback: string) {
    if (typeof error !== 'object' || error === null) return fallback;
    const maybeError = error as { response?: { data?: { message?: string } }; message?: string };
    return maybeError.response?.data?.message || maybeError.message || fallback;
}

function formatDate(date: string | null) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function isProcessed(review: Review) {
    return Boolean(review.cleanedText || review.sentiment || review.topic);
}

function getSentimentLabel(sentiment: string | null) {
    if (sentiment === 'positive') return 'Positif';
    if (sentiment === 'negative') return 'Negatif';
    if (sentiment === 'neutral') return 'Netral';
    return 'N/A';
}

function sentimentClass(sentiment: string | null) {
    if (sentiment === 'positive') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (sentiment === 'negative') return 'border-rose-200 bg-rose-50 text-rose-700';
    if (sentiment === 'neutral') return 'border-sky-200 bg-sky-50 text-sky-700';
    return 'border-slate-200 bg-slate-50 text-slate-500';
}

function exportReviewsCsv(reviews: Review[]) {
    const headers = ['ID', 'Reviewer', 'Rating', 'Sentiment', 'Topic', 'Review Date', 'Review Text', 'Cleaned Text'];
    const rows = reviews.map((review) => [
        review.id,
        review.reviewerName,
        review.rating ?? '',
        review.sentiment ?? '',
        review.topic?.topicName ?? '',
        review.reviewDate ?? '',
        review.reviewText ?? '',
        review.cleanedText ?? '',
    ]);
    const csv = [headers, ...rows]
        .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `review-admin-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

export function ReviewsTable({ destinationId }: ReviewsTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page') || 1);
    const sentimentFilter = (searchParams.get('sentiment') || '') as SentimentFilter;
    const sortBy = (searchParams.get('sort') || 'newest') as SortFilter;
    const nlpStatus = (searchParams.get('nlp_status') || 'all') as NlpStatusFilter;
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const topicId = searchParams.get('topic_id') || '';
    const query = searchParams.get('query') || '';
    const [queryTerm, setQueryTerm] = React.useState(query);
    const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
    const [previewReview, setPreviewReview] = React.useState<Review | null>(null);
    const [deleteTarget, setDeleteTarget] = React.useState<DeleteTarget>(null);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const updateQuery = React.useCallback(
        (updates: Record<string, string | number | null>) => {
            const params = new URLSearchParams(searchParams.toString());
            Object.entries(updates).forEach(([key, value]) => {
                if (
                    value === null ||
                    value === '' ||
                    value === 'all' ||
                    (key === 'page' && Number(value) === 1) ||
                    (key === 'sort' && value === 'newest')
                ) {
                    params.delete(key);
                } else {
                    params.set(key, String(value));
                }
            });
            params.set('destinationId', String(destinationId));
            const next = params.toString();
            router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
        },
        [destinationId, pathname, router, searchParams],
    );

    React.useEffect(() => {
        const handler = window.setTimeout(() => {
            if (queryTerm !== query) {
                updateQuery({ query: queryTerm.trim(), page: 1 });
            }
        }, 450);

        return () => window.clearTimeout(handler);
    }, [query, queryTerm, updateQuery]);

    const { data, isLoading, isFetching, refetch } = useQuery<GetAdminReviewsResponse>({
        queryKey: ['admin-reviews', destinationId, page, sentimentFilter, sortBy, nlpStatus, dateFrom, dateTo, topicId],
        queryFn: () =>
            adminReviewsService.getReviewsByDestination(destinationId, {
                page,
                limit: LIMIT,
                sentiment: sentimentFilter,
                sort_by: sortBy,
                nlp_status: nlpStatus,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
                topic_id: topicId ? Number(topicId) : '',
            }),
    });

    const reviews = React.useMemo(() => data?.data || [], [data?.data]);
    const meta = data?.meta || { totalPages: 1, page: 1, total: 0, limit: LIMIT };
    const topicOptions = React.useMemo<NativeSelectOption[]>(() => {
        const topics = Array.from(
            new Map(
                reviews
                    .filter((review) => review.topic)
                    .map((review) => [review.topic?.id, review.topic?.topicName] as const),
            ),
        ).filter(([id]) => Boolean(id));
        return [
            { value: '', label: 'Semua topik', description: 'Topik dari data halaman ini' },
            ...topics.map(([id, name]) => ({ value: String(id), label: name || `Topik ${id}` })),
        ];
    }, [reviews]);

    const visibleReviews = React.useMemo(() => {
        if (!query) return reviews;
        const q = query.toLowerCase();
        return reviews.filter((review) =>
            [
                review.reviewerName,
                review.reviewText,
                review.cleanedText,
                review.topic?.topicName,
                review.source,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(q)),
        );
    }, [query, reviews]);

    const selectedReviews = React.useMemo(
        () => reviews.filter((review) => selectedIds.includes(review.id)),
        [reviews, selectedIds],
    );

    const hasActiveFilters = Boolean(sentimentFilter || nlpStatus !== 'all' || dateFrom || dateTo || topicId || query);
    const allVisibleSelected = visibleReviews.length > 0 && visibleReviews.every((review) => selectedIds.includes(review.id));

    const toggleSelectAll = () => {
        if (allVisibleSelected) {
            setSelectedIds((current) => current.filter((id) => !visibleReviews.some((review) => review.id === id)));
            return;
        }
        setSelectedIds((current) => Array.from(new Set([...current, ...visibleReviews.map((review) => review.id)])));
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    };

    const resetFilters = () => {
        setQueryTerm('');
        updateQuery({
            page: 1,
            sentiment: '',
            nlp_status: 'all',
            date_from: '',
            date_to: '',
            topic_id: '',
            query: '',
            sort: 'newest',
        });
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);

        try {
            if (deleteTarget.type === 'category') {
                const result = await adminReviewsService.deleteBulk(destinationId, deleteTarget.category);
                toast.success(result.message || 'Review berhasil dihapus masal');
            } else {
                const targets = deleteTarget.type === 'single' ? [deleteTarget.review] : deleteTarget.reviews;
                await Promise.all(targets.map((review) => adminReviewsService.deleteReview(review.id)));
                toast.success(targets.length === 1 ? 'Review berhasil dihapus' : `${targets.length} review berhasil dihapus`);
                setSelectedIds((current) => current.filter((id) => !targets.some((review) => review.id === id)));
            }

            setPreviewReview(null);
            setDeleteTarget(null);
            refetch();
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Gagal menghapus review'));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-5">
            <ReviewHealthOverviewCards reviews={reviews} total={meta.total} />
            <ReviewPriorityQueue reviews={reviews} onPreview={setPreviewReview} />
            <ReviewLegendPanel />

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
                <div className="border-b border-slate-100 p-4">
                    <ReviewFilterBar
                        queryTerm={queryTerm}
                        setQueryTerm={setQueryTerm}
                        sentimentFilter={sentimentFilter}
                        nlpStatus={nlpStatus}
                        sortBy={sortBy}
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        topicId={topicId}
                        topicOptions={topicOptions}
                        hasActiveFilters={hasActiveFilters}
                        onChange={updateQuery}
                        onReset={resetFilters}
                        onCategoryDelete={(category, label) => setDeleteTarget({ type: 'category', category, label })}
                    />
                </div>

                {selectedReviews.length > 0 && (
                    <ReviewBulkToolbar
                        selectedCount={selectedReviews.length}
                        onClear={() => setSelectedIds([])}
                        onExport={() => exportReviewsCsv(selectedReviews)}
                        onDelete={() => setDeleteTarget({ type: 'selected', reviews: selectedReviews })}
                    />
                )}

                <ReviewDataTable
                    reviews={visibleReviews}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    selectedIds={selectedIds}
                    allVisibleSelected={allVisibleSelected}
                    hasActiveFilters={hasActiveFilters}
                    onSelectAll={toggleSelectAll}
                    onSelect={toggleSelect}
                    onPreview={setPreviewReview}
                    onDelete={(review) => setDeleteTarget({ type: 'single', review })}
                    onReset={resetFilters}
                />

                <div className="flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-slate-500" aria-live="polite">
                        Halaman <span className="font-semibold text-slate-800">{meta.page}</span> dari{' '}
                        <span className="font-semibold text-slate-800">{Math.max(1, meta.totalPages)}</span>.{' '}
                        {visibleReviews.length} review terlihat dari {reviews.length} data halaman ini.
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => updateQuery({ page: Math.max(1, page - 1) })}
                            disabled={page === 1 || isLoading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => updateQuery({ page: Math.min(meta.totalPages, page + 1) })}
                            disabled={page === meta.totalPages || isLoading || meta.totalPages === 0}
                        >
                            Selanjutnya
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </section>

            <ReviewPreviewDrawer
                review={previewReview}
                open={Boolean(previewReview)}
                onOpenChange={(open) => !open && setPreviewReview(null)}
                onDelete={(review) => setDeleteTarget({ type: 'single', review })}
            />
            <DeleteReviewDialog
                target={deleteTarget}
                isDeleting={isDeleting}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                onConfirm={confirmDelete}
            />
        </div>
    );
}

function ReviewHealthOverviewCards({ reviews, total }: { reviews: Review[]; total: number }) {
    const stats = React.useMemo(() => {
        const negative = reviews.filter((review) => review.sentiment === 'negative').length;
        const unprocessed = reviews.filter((review) => !isProcessed(review)).length;
        const noText = reviews.filter((review) => !review.reviewText).length;
        const rated = reviews.filter((review) => typeof review.rating === 'number');
        const avgRating = rated.length
            ? (rated.reduce((sum, review) => sum + (review.rating || 0), 0) / rated.length).toFixed(1)
            : '-';

        return [
            { label: 'Total review', value: total || reviews.length, hint: 'Semua review hasil filter server', icon: MessageSquare, tone: 'text-slate-700 bg-slate-100' },
            { label: 'Negatif', value: negative, hint: 'Prioritas moderasi', icon: AlertTriangle, tone: 'text-rose-700 bg-rose-50' },
            { label: 'Belum NLP', value: unprocessed, hint: 'Belum punya cleaned text/topik', icon: FileText, tone: 'text-amber-700 bg-amber-50' },
            { label: 'Tanpa teks', value: noText, hint: 'Rating saja atau data kosong', icon: Hash, tone: 'text-sky-700 bg-sky-50' },
            { label: 'Rating avg', value: avgRating, hint: 'Rata-rata halaman ini', icon: Star, tone: 'text-orange-700 bg-orange-50' },
        ];
    }, [reviews, total]);

    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p>
                                <p className="mt-3 text-3xl font-semibold text-slate-950">{stat.value}</p>
                            </div>
                            <div className={`rounded-full p-2 ${stat.tone}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-slate-500">{stat.hint}</p>
                    </div>
                );
            })}
        </div>
    );
}

function ReviewPriorityQueue({ reviews, onPreview }: { reviews: Review[]; onPreview: (review: Review) => void }) {
    const priorityReviews = React.useMemo(
        () =>
            reviews
                .filter((review) => review.sentiment === 'negative' || (review.rating || 0) <= 2 || !isProcessed(review) || !review.reviewText)
                .slice(0, 4),
        [reviews],
    );

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="font-semibold text-slate-950">Priority queue</h3>
                    <p className="text-sm text-slate-500">Review negatif, rating rendah, belum NLP, atau tanpa teks muncul lebih dulu.</p>
                </div>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                    {priorityReviews.length} item
                </span>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {priorityReviews.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                        Tidak ada review prioritas pada halaman ini.
                    </div>
                ) : (
                    priorityReviews.map((review) => (
                        <button
                            key={review.id}
                            type="button"
                            onClick={() => onPreview(review)}
                            className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-left transition-colors hover:border-orange-200 hover:bg-orange-50"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="truncate text-sm font-semibold text-slate-900">{review.reviewerName}</span>
                                <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${sentimentClass(review.sentiment)}`}>
                                    {getSentimentLabel(review.sentiment)}
                                </span>
                            </div>
                            <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                                {review.reviewText || review.cleanedText || 'Review tanpa teks.'}
                            </p>
                        </button>
                    ))
                )}
            </div>
        </section>
    );
}

function ReviewLegendPanel() {
    const items = [
        { label: 'Positif', description: 'Sentimen baik', icon: CheckCircle2, className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
        { label: 'Negatif', description: 'Prioritas cek', icon: AlertTriangle, className: 'border-rose-200 bg-rose-50 text-rose-700' },
        { label: 'Netral', description: 'Nada campuran', icon: CircleHelp, className: 'border-sky-200 bg-sky-50 text-sky-700' },
        { label: 'Belum NLP', description: 'Cleaned text/topik kosong', icon: FileText, className: 'border-amber-200 bg-amber-50 text-amber-700' },
        { label: 'Dibalas', description: 'Owner reply tersedia', icon: MessageSquare, className: 'border-indigo-200 bg-indigo-50 text-indigo-700' },
        { label: 'Rating', description: 'Skor Google Maps', icon: Star, className: 'border-orange-200 bg-orange-50 text-orange-700' },
    ];

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-slate-950">Legenda review</h3>
                    <p className="mt-1 text-sm text-slate-500">Arti badge yang muncul di tabel dan preview drawer.</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {items.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.label} className={`flex items-start gap-2 rounded-xl border p-2.5 ${item.className}`}>
                                <div className="rounded-lg bg-white/80 p-1.5">
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-semibold">{item.label}</div>
                                    <div className="mt-0.5 text-xs opacity-80">{item.description}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function ReviewFilterBar({
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

function ReviewBulkToolbar({
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

function ReviewDataTable({
    reviews,
    isLoading,
    isFetching,
    selectedIds,
    allVisibleSelected,
    hasActiveFilters,
    onSelectAll,
    onSelect,
    onPreview,
    onDelete,
    onReset,
}: {
    reviews: Review[];
    isLoading: boolean;
    isFetching: boolean;
    selectedIds: number[];
    allVisibleSelected: boolean;
    hasActiveFilters: boolean;
    onSelectAll: () => void;
    onSelect: (id: number) => void;
    onPreview: (review: Review) => void;
    onDelete: (review: Review) => void;
    onReset: () => void;
}) {
    return (
        <div className="relative">
            {isFetching && !isLoading && (
                <div className="absolute right-4 top-3 z-10 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Sinkronisasi
                </div>
            )}
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="w-10 px-4">
                            <input
                                type="checkbox"
                                aria-label="Pilih semua review yang terlihat"
                                checked={allVisibleSelected}
                                onChange={onSelectAll}
                                className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                            />
                        </TableHead>
                        <TableHead>Reviewer</TableHead>
                        <TableHead>Review</TableHead>
                        <TableHead>NLP</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <SkeletonRows />
                    ) : reviews.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6}>
                                <EmptyState hasActiveFilters={hasActiveFilters} onReset={onReset} />
                            </TableCell>
                        </TableRow>
                    ) : (
                        reviews.map((review) => (
                            <TableRow key={review.id} data-state={selectedIds.includes(review.id) ? 'selected' : undefined}>
                                <TableCell className="px-4">
                                    <input
                                        type="checkbox"
                                        aria-label={`Pilih review dari ${review.reviewerName}`}
                                        checked={selectedIds.includes(review.id)}
                                        onChange={() => onSelect(review.id)}
                                        className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                                    />
                                </TableCell>
                                <TableCell className="min-w-[180px]">
                                    <button type="button" className="text-left" onClick={() => onPreview(review)}>
                                        <span className="block truncate font-semibold text-slate-950">{review.reviewerName}</span>
                                        <span className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                            <Star className="h-3 w-3 text-amber-500" />
                                            {review.rating ?? '-'} rating
                                        </span>
                                        <span className="mt-1 block text-xs text-slate-400">{formatDate(review.reviewDate)}</span>
                                    </button>
                                </TableCell>
                                <TableCell className="min-w-[320px] max-w-[520px]">
                                    <p className="line-clamp-2 text-sm leading-relaxed text-slate-700">
                                        {review.reviewText || <span className="italic text-slate-400">Teks ulasan kosong</span>}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {review.likesCount ? <SmallPill icon={<ThumbsUp className="h-3 w-3" />} label={`${review.likesCount} like`} /> : null}
                                        {review.ownerReply ? <SmallPill icon={<MessageSquare className="h-3 w-3" />} label="Dibalas" tone="indigo" /> : null}
                                        {review.source ? <SmallPill label={review.source} /> : null}
                                    </div>
                                </TableCell>
                                <TableCell className="min-w-[220px]">
                                    <div className="flex flex-wrap gap-1.5">
                                        <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${isProcessed(review) ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                                            {isProcessed(review) ? 'Processed' : 'Belum NLP'}
                                        </span>
                                        {review.topic ? (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                                                <Tags className="h-3 w-3" />
                                                {review.topic.topicName}
                                            </span>
                                        ) : (
                                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-500">
                                                Tanpa topik
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-2 line-clamp-1 text-xs text-slate-500">
                                        {review.cleanedText || 'Cleaned text belum tersedia.'}
                                    </p>
                                </TableCell>
                                <TableCell>
                                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${sentimentClass(review.sentiment)}`}>
                                        {getSentimentLabel(review.sentiment)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" aria-label={`Preview review dari ${review.reviewerName}`} onClick={() => onPreview(review)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" aria-label={`Hapus review dari ${review.reviewerName}`} onClick={() => onDelete(review)}>
                                            <Trash2 className="h-4 w-4 text-rose-600" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function SmallPill({ label, icon, tone = 'slate' }: { label: string; icon?: React.ReactNode; tone?: 'slate' | 'indigo' }) {
    const className = tone === 'indigo' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-600';
    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>
            {icon}
            {label}
        </span>
    );
}

function SkeletonRows() {
    return (
        <>
            {Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index}>
                    <TableCell colSpan={6}>
                        <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
}

function EmptyState({ hasActiveFilters, onReset }: { hasActiveFilters: boolean; onReset: () => void }) {
    return (
        <div className="flex min-h-56 flex-col items-center justify-center px-4 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-950">
                {hasActiveFilters ? 'Tidak ada review yang cocok' : 'Belum ada review'}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
                {hasActiveFilters ? 'Coba longgarkan filter atau reset untuk melihat review lain.' : 'Review akan muncul setelah scraping atau upload data selesai.'}
            </p>
            {hasActiveFilters && (
                <Button variant="outline" className="mt-4 rounded-full" onClick={onReset}>
                    Reset filter
                </Button>
            )}
        </div>
    );
}

function ReviewPreviewDrawer({
    review,
    open,
    onOpenChange,
    onDelete,
}: {
    review: Review | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete: (review: Review) => void;
}) {
    if (!review) return <Sheet open={open} onOpenChange={onOpenChange} />;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                <SheetHeader className="border-b border-slate-100 pr-12">
                    <SheetTitle>{review.reviewerName}</SheetTitle>
                    <SheetDescription>
                        Rating {review.rating ?? '-'} pada {formatDate(review.reviewDate)}
                    </SheetDescription>
                </SheetHeader>
                <div className="space-y-5 p-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <PreviewMetric label="Sentimen" value={getSentimentLabel(review.sentiment)} />
                        <PreviewMetric label="NLP" value={isProcessed(review) ? 'Processed' : 'Belum NLP'} />
                        <PreviewMetric label="Topik" value={review.topic?.topicName || '-'} />
                    </div>
                    <PreviewBlock title="Teks asli" value={review.reviewText || 'Teks ulasan kosong.'} />
                    <PreviewBlock title="Cleaned text" value={review.cleanedText || 'Cleaned text belum tersedia.'} />
                    {review.ownerReply && <PreviewBlock title="Balasan pemilik" value={review.ownerReply} />}
                    <section className="rounded-2xl border border-slate-200 p-4">
                        <h4 className="font-semibold text-slate-950">Metadata</h4>
                        <div className="mt-3 space-y-2 text-sm">
                            <InfoRow label="Source" value={review.source || '-'} />
                            <InfoRow label="Likes" value={String(review.likesCount ?? 0)} />
                            <InfoRow label="Scraping job" value={review.scrapingJobId ? `#${review.scrapingJobId}` : '-'} />
                            <InfoRow label="Created" value={formatDate(review.createdAt)} />
                        </div>
                    </section>
                </div>
                <SheetFooter className="border-t border-slate-100">
                    <Button variant="destructive" className="rounded-full" onClick={() => onDelete(review)}>
                        <Trash2 className="h-4 w-4" />
                        Hapus review
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1 truncate text-lg font-semibold text-slate-950">{value}</p>
        </div>
    );
}

function PreviewBlock({ title, value }: { title: string; value: string }) {
    return (
        <section className="rounded-2xl border border-slate-200 p-4">
            <h4 className="font-semibold text-slate-950">{title}</h4>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{value}</p>
        </section>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">{label}</span>
            <span className="truncate text-right font-medium text-slate-800">{value}</span>
        </div>
    );
}

function DeleteReviewDialog({
    target,
    isDeleting,
    onOpenChange,
    onConfirm,
}: {
    target: DeleteTarget;
    isDeleting: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}) {
    const title =
        target?.type === 'single'
            ? `Hapus review dari ${target.review.reviewerName}?`
            : target?.type === 'selected'
                ? `Hapus ${target.reviews.length} review terpilih?`
                : target?.type === 'category'
                    ? `Hapus ${target.label}?`
                    : 'Hapus review?';

    return (
        <Dialog open={Boolean(target)} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Aksi ini menghapus data review dari database admin. Pastikan data tidak lagi diperlukan untuk analitik.
                    </DialogDescription>
                </DialogHeader>
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
                    {target?.type === 'category'
                        ? 'Kategori bulk delete akan memakai endpoint penghapusan masal yang sudah tersedia.'
                        : 'Review terpilih akan dihapus satu per satu.'}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
                        Batal
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Hapus
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
