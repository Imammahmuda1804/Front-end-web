import React from 'react';
import { AlertTriangle, CheckCircle2, CircleHelp, FileText, Gauge, Hash, MessageSquare, Star } from 'lucide-react';
import type { Review } from '../../services/reviews.service';
import { getSentimentLabel, hasLowConfidence, isProcessed, sentimentClass } from './ReviewsTable';
export function ReviewHealthOverviewCards({ reviews, total }: { reviews: Review[]; total: number }) {
    const stats = React.useMemo(() => {
        const negative = reviews.filter((review) => review.sentiment === 'negative').length;
        const unprocessed = reviews.filter((review) => !isProcessed(review)).length;
        const noText = reviews.filter((review) => !review.reviewText).length;
        const lowConfidence = reviews.filter(hasLowConfidence).length;
        const rated = reviews.filter((review) => typeof review.rating === 'number');
        const avgRating = rated.length
            ? (rated.reduce((sum, review) => sum + (review.rating || 0), 0) / rated.length).toFixed(1)
            : '-';

        return [
            { label: 'Total review', value: total || reviews.length, hint: 'Semua review hasil filter server', icon: MessageSquare, tone: 'text-slate-700 bg-slate-100' },
            { label: 'Negatif', value: negative, hint: 'Prioritas moderasi', icon: AlertTriangle, tone: 'text-rose-700 bg-rose-50' },
            { label: 'Belum NLP', value: unprocessed, hint: 'Belum punya cleaned text/topik', icon: FileText, tone: 'text-amber-700 bg-amber-50' },
            { label: 'Tanpa teks', value: noText, hint: 'Rating saja atau data kosong', icon: Hash, tone: 'text-sky-700 bg-sky-50' },
            { label: 'Confidence rendah', value: lowConfidence, hint: 'Perlu validasi manual', icon: Gauge, tone: 'text-violet-700 bg-violet-50' },
            { label: 'Rating avg', value: avgRating, hint: 'Rata-rata halaman ini', icon: Star, tone: 'text-orange-700 bg-orange-50' },
        ];
    }, [reviews, total]);

    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
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

export function ReviewPriorityQueue({ reviews, onPreview }: { reviews: Review[]; onPreview: (review: Review) => void }) {
    const priorityReviews = React.useMemo(
        () =>
            reviews
                .filter((review) => review.sentiment === 'negative' || (review.rating || 0) <= 2 || !isProcessed(review) || !review.reviewText || hasLowConfidence(review))
                .slice(0, 4),
        [reviews],
    );

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
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
                    <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                        Tidak ada review prioritas pada halaman ini.
                    </div>
                ) : (
                    priorityReviews.map((review) => (
                        <button
                            key={review.id}
                            type="button"
                            onClick={() => onPreview(review)}
                            className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-left transition-colors hover:border-orange-200 hover:bg-orange-50"
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

export function ReviewLegendPanel() {
    const items = [
        { label: 'Positif', description: 'Sentimen baik', icon: CheckCircle2, className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
        { label: 'Negatif', description: 'Prioritas cek', icon: AlertTriangle, className: 'border-rose-200 bg-rose-50 text-rose-700' },
        { label: 'Netral', description: 'Nada campuran', icon: CircleHelp, className: 'border-sky-200 bg-sky-50 text-sky-700' },
        { label: 'Belum NLP', description: 'Cleaned text/topik kosong', icon: FileText, className: 'border-amber-200 bg-amber-50 text-amber-700' },
        { label: 'Confidence', description: 'Keyakinan model sentimen', icon: Gauge, className: 'border-violet-200 bg-violet-50 text-violet-700' },
        { label: 'Dibalas', description: 'Owner reply tersedia', icon: MessageSquare, className: 'border-indigo-200 bg-indigo-50 text-indigo-700' },
        { label: 'Rating', description: 'Skor Google Maps', icon: Star, className: 'border-orange-200 bg-orange-50 text-orange-700' },
    ];

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-slate-950">Legenda review</h3>
                    <p className="mt-1 text-sm text-slate-500">Arti badge yang muncul di tabel dan preview drawer.</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
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



