import React from 'react';
import { Eye, Gauge, Loader2, MessageSquare, Star, Tags, ThumbsUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Review } from '@/services/admin/reviews.service';
import { confidenceLevel, formatConfidence, formatDate, getSentimentLabel, isProcessed, sentimentClass, type DeleteTarget } from './ReviewsTable';
export function ReviewDataTable({
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
                                    <div className="space-y-2">
                                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${sentimentClass(review.sentiment)}`}>
                                            {getSentimentLabel(review.sentiment)}
                                        </span>
                                        <ConfidenceBadge confidence={review.sentimentConfidence} />
                                    </div>
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

export function SmallPill({ label, icon, tone = 'slate' }: { label: string; icon?: React.ReactNode; tone?: 'slate' | 'indigo' }) {
    const className = tone === 'indigo' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-600';
    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>
            {icon}
            {label}
        </span>
    );
}

export function ConfidenceBadge({ confidence }: { confidence: number | null }) {
    const level = confidenceLevel(confidence);
    return (
        <div className="min-w-28 space-y-1">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${level.className}`}>
                <Gauge className="h-3 w-3" />
                {formatConfidence(confidence)}
            </span>
            {typeof confidence === 'number' && (
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100" aria-label={`Confidence sentimen ${formatConfidence(confidence)}`}>
                    <div
                        className={`h-full rounded-full ${confidence < 0.65 ? 'bg-rose-500' : confidence < 0.8 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${level.width}%` }}
                    />
                </div>
            )}
        </div>
    );
}

export function SkeletonRows() {
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

export function EmptyState({ hasActiveFilters, onReset }: { hasActiveFilters: boolean; onReset: () => void }) {
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

export function ReviewPreviewDrawer({
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
                    <div className="grid gap-3 sm:grid-cols-4">
                        <PreviewMetric label="Sentimen" value={getSentimentLabel(review.sentiment)} />
                        <PreviewMetric label="Confidence" value={`${formatConfidence(review.sentimentConfidence)} ${confidenceLevel(review.sentimentConfidence).label}`} />
                        <PreviewMetric label="NLP" value={isProcessed(review) ? 'Processed' : 'Belum NLP'} />
                        <PreviewMetric label="Topik" value={review.topic?.topicName || '-'} />
                    </div>
                    {typeof review.sentimentConfidence === 'number' && (
                        <section className="rounded-xl border border-violet-100 bg-violet-50/60 p-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-full bg-white p-2 text-violet-700">
                                    <Gauge className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-950">Kualitas prediksi sentimen</h4>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Confidence menunjukkan seberapa yakin model terhadap label sentimen. Review dengan confidence rendah sebaiknya dicek manual sebelum dipakai sebagai dasar keputusan.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                                <div
                                    className={`h-full rounded-full ${review.sentimentConfidence < 0.65 ? 'bg-rose-500' : review.sentimentConfidence < 0.8 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.round(review.sentimentConfidence * 100)}%` }}
                                />
                            </div>
                        </section>
                    )}
                    <PreviewBlock title="Teks asli" value={review.reviewText || 'Teks ulasan kosong.'} />
                    <PreviewBlock title="Cleaned text" value={review.cleanedText || 'Cleaned text belum tersedia.'} />
                    {review.ownerReply && <PreviewBlock title="Balasan pemilik" value={review.ownerReply} />}
                    <section className="rounded-xl border border-slate-200 p-4">
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

export function PreviewMetric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1 truncate text-lg font-semibold text-slate-950">{value}</p>
        </div>
    );
}

export function PreviewBlock({ title, value }: { title: string; value: string }) {
    return (
        <section className="rounded-xl border border-slate-200 p-4">
            <h4 className="font-semibold text-slate-950">{title}</h4>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{value}</p>
        </section>
    );
}

export function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">{label}</span>
            <span className="truncate text-right font-medium text-slate-800">{value}</span>
        </div>
    );
}

export function DeleteReviewDialog({
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
                <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
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


