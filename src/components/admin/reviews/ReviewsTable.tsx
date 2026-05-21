'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { NativeSelectOption } from '@/components/ui/native-select';
import { GetAdminReviewsResponse, Review, adminReviewsService } from '@/services/admin/reviews.service';
import { ReviewBulkToolbar, ReviewFilterBar } from './reviews-table.controls';
import { DeleteReviewDialog, ReviewDataTable, ReviewPreviewDrawer } from './reviews-table.data';
import { ReviewHealthOverviewCards, ReviewLegendPanel, ReviewPriorityQueue } from './reviews-table.panels';

interface ReviewsTableProps {
    destinationId: number;
}

export type SentimentFilter = 'positive' | 'negative' | 'neutral' | '';
export type NlpStatusFilter = 'all' | 'processed' | 'unprocessed';
export type SortFilter = 'newest' | 'oldest';

export type DeleteTarget =
    | { type: 'single'; review: Review }
    | { type: 'selected'; reviews: Review[] }
    | { type: 'category'; category: 'all' | 'processed' | 'unprocessed'; label: string }
    | null;

const LIMIT = 10;

export const sentimentOptions: NativeSelectOption[] = [
    { value: '', label: 'Semua sentimen', description: 'Positif, negatif, dan netral' },
    { value: 'positive', label: 'Positif', description: 'Review bernada baik' },
    { value: 'negative', label: 'Negatif', description: 'Review yang perlu diprioritaskan' },
    { value: 'neutral', label: 'Netral', description: 'Review tanpa sinyal kuat' },
];

export const nlpOptions: NativeSelectOption[] = [
    { value: 'all', label: 'Semua NLP' },
    { value: 'processed', label: 'Sudah diproses' },
    { value: 'unprocessed', label: 'Belum diproses' },
];

export const sortOptions: NativeSelectOption[] = [
    { value: 'newest', label: 'Terbaru dulu' },
    { value: 'oldest', label: 'Terlama dulu' },
];

function getErrorMessage(error: unknown, fallback: string) {
    if (typeof error !== 'object' || error === null) return fallback;
    const maybeError = error as { response?: { data?: { message?: string } }; message?: string };
    return maybeError.response?.data?.message || maybeError.message || fallback;
}

export function formatDate(date: string | null) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function isProcessed(review: Review) {
    return Boolean(review.cleanedText || review.sentiment || review.topic);
}

export function getSentimentLabel(sentiment: string | null) {
    if (sentiment === 'positive') return 'Positif';
    if (sentiment === 'negative') return 'Negatif';
    if (sentiment === 'neutral') return 'Netral';
    return 'N/A';
}

export function sentimentClass(sentiment: string | null) {
    if (sentiment === 'positive') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (sentiment === 'negative') return 'border-rose-200 bg-rose-50 text-rose-700';
    if (sentiment === 'neutral') return 'border-sky-200 bg-sky-50 text-sky-700';
    return 'border-slate-200 bg-slate-50 text-slate-500';
}

export function formatConfidence(confidence: number | null) {
    if (typeof confidence !== 'number') return '-';
    return `${Math.round(confidence * 100)}%`;
}

export function confidenceLevel(confidence: number | null) {
    if (typeof confidence !== 'number') return { label: 'Belum ada', className: 'border-slate-200 bg-slate-50 text-slate-500', width: 0 };
    if (confidence >= 0.8) return { label: 'Tinggi', className: 'border-emerald-200 bg-emerald-50 text-emerald-700', width: Math.round(confidence * 100) };
    if (confidence >= 0.65) return { label: 'Sedang', className: 'border-amber-200 bg-amber-50 text-amber-700', width: Math.round(confidence * 100) };
    return { label: 'Rendah', className: 'border-rose-200 bg-rose-50 text-rose-700', width: Math.round(confidence * 100) };
}

export function hasLowConfidence(review: Review) {
    return typeof review.sentimentConfidence === 'number' && review.sentimentConfidence < 0.65;
}

function exportReviewsCsv(reviews: Review[]) {
    const headers = ['ID', 'Reviewer', 'Rating', 'Sentiment', 'Confidence', 'Topic', 'Review Date', 'Review Text', 'Cleaned Text'];
    const rows = reviews.map((review) => [
        review.id,
        review.reviewerName,
        review.rating ?? '',
        review.sentiment ?? '',
        formatConfidence(review.sentimentConfidence),
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

// Mengelola tabel review admin, filter, preview, bulk action, dan export.
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


