'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminReviewsService } from '@/services/admin/reviews.service';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, MessageSquare, RotateCcw, SlidersHorizontal, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewsTableProps {
    destinationId: number;
}

export function ReviewsTable({ destinationId }: ReviewsTableProps) {
    const [page, setPage] = useState(1);
    const [sentimentFilter, setSentimentFilter] = useState<'positive' | 'negative' | 'neutral' | ''>('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
    const [nlpStatus, setNlpStatus] = useState<'all' | 'processed' | 'unprocessed'>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const limit = 10;

    const hasActiveFilters =
        sentimentFilter !== '' ||
        nlpStatus !== 'all' ||
        dateFrom !== '' ||
        dateTo !== '';

    const resetFilters = () => {
        setSentimentFilter('');
        setSortBy('newest');
        setNlpStatus('all');
        setDateFrom('');
        setDateTo('');
        setPage(1);
    };

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['admin-reviews', destinationId, page, sentimentFilter, sortBy, nlpStatus, dateFrom, dateTo],
        queryFn: () =>
            adminReviewsService.getReviewsByDestination(destinationId, {
                page,
                limit,
                sentiment: sentimentFilter,
                sort_by: sortBy,
                nlp_status: nlpStatus,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            }),
    });

    const handleDelete = async (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus review ini? Tindakan ini tidak dapat dibatalkan.')) {
            try {
                await adminReviewsService.deleteReview(id);
                toast.success('Review berhasil dihapus');
                refetch();
            } catch {
                toast.error('Gagal menghapus review');
            }
        }
    };

    const handleBulkDelete = async (category: 'all' | 'processed' | 'unprocessed') => {
        let confirmMessage = 'Apakah Anda yakin ingin menghapus ';
        if (category === 'all') confirmMessage += 'SELURUH review untuk destinasi ini?';
        else if (category === 'processed') confirmMessage += 'semua review yang SUDAH DIPROSES (memiliki hasil NLP)?';
        else confirmMessage += 'semua review yang BELUM DIPROSES?';

        if (confirm(confirmMessage + '\nTindakan ini tidak dapat dibatalkan.')) {
            try {
                const result = await adminReviewsService.deleteBulk(destinationId, category);
                toast.success(result.message || 'Review berhasil dihapus masal');
                refetch();
            } catch {
                toast.error('Gagal menghapus review secara masal');
            }
        }
    };

    const reviews = data?.data || [];
    const meta = data?.meta || { totalPages: 1, page: 1, total: 0 };

    const getSentimentBadge = (sentiment: string | null) => {
        if (!sentiment) return <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">N/A</span>;
        if (sentiment === 'positive') return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium">Positif</span>;
        if (sentiment === 'negative') return <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-md text-xs font-medium">Negatif</span>;
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">Netral</span>;
    };

    return (
        <div className="space-y-4">
            {/* Header Row: Title + Bulk Delete */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-slate-900">Daftar Review</h3>
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                        {meta.total} Total
                    </span>
                    {hasActiveFilters && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
                            Filter aktif
                        </span>
                    )}
                </div>

                <div className="relative flex-shrink-0">
                    <select
                        className="h-9 px-3 pr-8 appearance-none rounded-md border border-rose-200 bg-rose-50 text-rose-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent cursor-pointer hover:bg-rose-100 transition-colors"
                        value=""
                        onChange={(e) => {
                            if (e.target.value) handleBulkDelete(e.target.value as 'all' | 'processed' | 'unprocessed');
                        }}
                    >
                        <option value="" disabled>Hapus Masal...</option>
                        <option value="all">Hapus Semua Data</option>
                        <option value="unprocessed">Hapus Belum Diproses</option>
                        <option value="processed">Hapus Sudah Diproses</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-rose-700">
                        <Trash2 className="h-3.5 w-3.5" />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="flex flex-wrap items-end gap-3">
                    {/* Icon Label */}
                    <div className="flex items-center gap-1.5 text-slate-500 mr-1 self-end pb-1">
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Filter</span>
                    </div>

                    {/* Sentiment Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Sentimen</label>
                        <select
                            className="h-8 px-2 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent min-w-[120px]"
                            value={sentimentFilter}
                            onChange={(e) => {
                                setSentimentFilter(e.target.value as '' | 'positive' | 'negative' | 'neutral');
                                setPage(1);
                            }}
                        >
                            <option value="">Semua</option>
                            <option value="positive">Positif</option>
                            <option value="negative">Negatif</option>
                            <option value="neutral">Netral</option>
                        </select>
                    </div>

                    {/* NLP Status Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Status NLP</label>
                        <select
                            className="h-8 px-2 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent min-w-[140px]"
                            value={nlpStatus}
                            onChange={(e) => {
                                setNlpStatus(e.target.value as 'all' | 'processed' | 'unprocessed');
                                setPage(1);
                            }}
                        >
                            <option value="all">Semua</option>
                            <option value="processed">Sudah Diproses</option>
                            <option value="unprocessed">Belum Diproses</option>
                        </select>
                    </div>

                    {/* Sort Order */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Urutan</label>
                        <select
                            className="h-8 px-2 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent min-w-[130px]"
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value as 'newest' | 'oldest');
                                setPage(1);
                            }}
                        >
                            <option value="newest">Terbaru Dulu</option>
                            <option value="oldest">Terlama Dulu</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" /> Dari Tanggal
                        </label>
                        <input
                            type="date"
                            className="h-8 px-2 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                            value={dateFrom}
                            onChange={(e) => {
                                setDateFrom(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" /> Sampai Tanggal
                        </label>
                        <input
                            type="date"
                            className="h-8 px-2 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                            value={dateTo}
                            min={dateFrom || undefined}
                            onChange={(e) => {
                                setDateTo(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>

                    {/* Reset Button */}
                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="h-8 px-3 self-end flex items-center gap-1.5 rounded-md border border-slate-300 bg-white text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border border-slate-200 overflow-hidden">
                <Table className="table-fixed w-full">
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[200px]">Reviewer</TableHead>
                            <TableHead>Ulasan & NLP</TableHead>
                            <TableHead className="w-[120px]">Status</TableHead>
                            <TableHead className="text-right w-[80px]">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-32 text-slate-500">
                                    Memuat data review...
                                </TableCell>
                            </TableRow>
                        ) : reviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-32">
                                    <div className="flex flex-col items-center justify-center text-slate-500">
                                        <MessageSquare className="h-8 w-8 text-slate-300 mb-2" />
                                        <p className="font-medium">Tidak ada review ditemukan</p>
                                        {hasActiveFilters && (
                                            <p className="text-xs text-slate-400 mt-1">
                                                Coba ubah atau{' '}
                                                <button onClick={resetFilters} className="text-primary underline underline-offset-2">
                                                    reset filter
                                                </button>
                                            </p>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            reviews.map((review) => (
                                <TableRow key={review.id} className="hover:bg-slate-50/50">
                                    {/* Reviewer Info */}
                                    <TableCell className="align-top">
                                        <div className="font-medium text-slate-900">{review.reviewerName}</div>
                                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                            <span>Rating:</span>
                                            <span className="font-semibold text-amber-500">{review.rating || '-'}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-400 mt-1">
                                            {review.reviewDate
                                                ? new Date(review.reviewDate).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })
                                                : '-'}
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            {review.likesCount ? (
                                                <span
                                                    className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm"
                                                    title="Jumlah Like"
                                                >
                                                    👍 {review.likesCount}
                                                </span>
                                            ) : null}
                                            {review.ownerReply && (
                                                <span
                                                    className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-sm"
                                                    title="Sudah Dibalas Pemilik"
                                                >
                                                    Dibalas
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Content & NLP */}
                                    <TableCell className="align-top overflow-hidden">
                                        <div className="text-sm text-slate-700 leading-relaxed mb-3 break-words whitespace-pre-wrap">
                                            {review.reviewText ? (
                                                <p className="break-words">{review.reviewText}</p>
                                            ) : (
                                                <span className="text-slate-400 italic">Teks ulasan kosong</span>
                                            )}
                                        </div>

                                        <div className="bg-slate-50 rounded-md border border-slate-200 p-3 mt-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    Hasil NLP
                                                </span>
                                                {review.topic ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        {review.topic.topicName}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                                        Topik Belum Dideteksi
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-600 italic break-words whitespace-pre-wrap">
                                                {review.cleanedText || (
                                                    <span className="text-slate-400">
                                                        Teks belum diproses (Cleaned Text kosong).
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </TableCell>

                                    {/* Status / Sentiment */}
                                    <TableCell className="align-top">
                                        <div className="flex flex-col gap-2">
                                            {getSentimentBadge(review.sentiment)}
                                        </div>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="align-top text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(review.id)}
                                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 h-8 w-8"
                                            title="Hapus Review"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-slate-500">
                    Halaman{' '}
                    <span className="font-medium text-slate-900">{meta.page}</span> dari{' '}
                    <span className="font-medium text-slate-900">{meta.totalPages}</span>
                    {hasActiveFilters && (
                        <span className="ml-2 text-amber-600">({meta.total} hasil terfilter)</span>
                    )}
                </div>
                <div className="space-x-2 flex">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || isLoading}
                        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                        Sebelumnya
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                        disabled={page === meta.totalPages || isLoading || meta.totalPages === 0}
                        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                        Selanjutnya
                    </Button>
                </div>
            </div>
        </div>
    );
}
