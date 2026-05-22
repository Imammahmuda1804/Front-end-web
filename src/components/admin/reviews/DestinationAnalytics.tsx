'use client';

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line,
} from 'recharts';
import { BarChart3, Download, PieChartIcon, RefreshCw, Smile, Tags, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { adminAnalyticsService, TrendData } from '@/services/admin/analytics.service';

interface DestinationAnalyticsProps {
    destinationId: number;
}

const COLORS = {
    positive: '#10b981',
    negative: '#f43f5e',
    neutral: '#3b82f6',
};

type SentimentDatum = {
    name: string;
    value: number;
    color: string;
};

export function DestinationAnalytics({ destinationId }: DestinationAnalyticsProps) {
    const queryClient = useQueryClient();
    const { data: analytics, isLoading: loadingAnalytics } = useQuery({
        queryKey: ['admin-destination-analytics', destinationId],
        queryFn: () => adminAnalyticsService.getDestinationAnalytics(destinationId),
    });

    const { data: topics, isLoading: loadingTopics } = useQuery({
        queryKey: ['admin-destination-topics', destinationId],
        queryFn: () => adminAnalyticsService.getDestinationTopics(destinationId),
    });

    const { data: trends, isLoading: loadingTrends } = useQuery({
        queryKey: ['admin-destination-trends', destinationId],
        queryFn: () => adminAnalyticsService.getDestinationTrends(destinationId, 'monthly'),
    });

    const recalculateMutation = useMutation({
        mutationFn: () => adminAnalyticsService.recalculateDestination(destinationId),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['admin-destination-analytics', destinationId] }),
                queryClient.invalidateQueries({ queryKey: ['admin-destination-topics', destinationId] }),
                queryClient.invalidateQueries({ queryKey: ['admin-destination-trends', destinationId] }),
            ]);
            toast.success('Analytics berhasil dihitung ulang');
        },
        onError: () => {
            toast.error('Gagal menghitung ulang analytics');
        },
    });

    if (loadingAnalytics || loadingTopics || loadingTrends) {
        return <AnalyticsSkeleton />;
    }

    if (!analytics) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center text-slate-500">
                Data analitik belum tersedia. Jalankan scraping dan NLP terlebih dahulu.
            </div>
        );
    }

    const sentiment = analytics.sentiment || { positive: 0, negative: 0, neutral: 0 };
    const sentimentData: SentimentDatum[] = [
        { name: 'Positif', value: sentiment.positive || 0, color: COLORS.positive },
        { name: 'Negatif', value: sentiment.negative || 0, color: COLORS.negative },
        { name: 'Netral', value: sentiment.neutral || 0, color: COLORS.neutral },
    ].filter((item) => item.value > 0);
    const totalReviewsAnalyzed = sentimentData.reduce((acc, curr) => acc + curr.value, 0);
    const negativeRatio = totalReviewsAnalyzed ? Math.round(((sentiment.negative || 0) / totalReviewsAnalyzed) * 100) : 0;
    const dominantSentiment = [...sentimentData].sort((a, b) => b.value - a.value)[0]?.name || '-';
    const topTopic = (topics || [])[0];
    const formattedTrends = (trends || []).map((trend: TrendData) => ({
        ...trend,
        dateFormatted: new Date(trend.date).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
    }));

    const handleExport = () => {
        window.open(adminAnalyticsService.getExportCsvUrl(destinationId), '_blank');
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-950">Analitik review: {analytics.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        Skor rekomendasi {((analytics.recommendation_score || 0) * 100).toFixed(1)}%, {totalReviewsAnalyzed} review dianalisis.
                    </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                        onClick={() => recalculateMutation.mutate()}
                        disabled={recalculateMutation.isPending}
                        variant="outline"
                        className="rounded-full"
                    >
                        <RefreshCw className={`h-4 w-4 ${recalculateMutation.isPending ? 'animate-spin' : ''}`} />
                        Hitung ulang
                    </Button>
                    <Button onClick={handleExport} variant="outline" className="rounded-full">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <InsightCard icon={PieChartIcon} label="Dominan" value={dominantSentiment} hint="Sentimen terbesar" tone="slate" />
                <InsightCard icon={Tags} label="Topik utama" value={topTopic?.topic_name || '-'} hint={`${topTopic?.total_reviews || 0} review`} tone="indigo" />
                <InsightCard icon={TrendingDown} label="Rasio negatif" value={`${negativeRatio}%`} hint="Perlu dipantau admin" tone="rose" />
                <InsightCard icon={Smile} label="Positif" value={String(sentiment.positive || 0)} hint="Sinyal kepuasan" tone="emerald" />
            </div>

            <AnalyticsLegend />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <ChartPanel title="Distribusi Sentimen" description="Komposisi sentimen untuk review yang sudah dianalisis.">
                    {totalReviewsAnalyzed === 0 ? (
                        <ChartEmptyState label="Belum ada data sentimen" />
                    ) : (
                        <ResponsiveContainer width="100%" height={260} minWidth={1} minHeight={1}>
                            <PieChart>
                                <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={62} outerRadius={84} paddingAngle={5} dataKey="value">
                                    {sentimentData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value: unknown) => [`${Number(value ?? 0)} review`, 'Jumlah']}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 12px 24px rgb(15 23 42 / 0.10)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </ChartPanel>

                <ChartPanel title="Topik Paling Sering Dibicarakan" description="Topik dengan volume review terbesar." className="lg:col-span-2">
                    {(!topics || topics.length === 0) ? (
                        <ChartEmptyState label="Belum ada data topik" />
                    ) : (
                        <ResponsiveContainer width="100%" height={260} minWidth={1} minHeight={1}>
                            <BarChart data={topics.slice(0, 7)} layout="vertical" margin={{ top: 0, right: 24, left: 44, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="topic_name" type="category" axisLine={false} tickLine={false} fontSize={12} width={104} />
                                <RechartsTooltip
                                    formatter={(value: unknown) => [`${Number(value ?? 0)} review`, 'Jumlah']}
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                />
                                <Bar dataKey="total_reviews" fill="#f97316" radius={[0, 6, 6, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartPanel>

                <ChartPanel title="Tren Sentimen Bulanan" description="Perubahan sentimen dari waktu ke waktu." className="lg:col-span-3">
                    {formattedTrends.length === 0 ? (
                        <ChartEmptyState label="Belum ada data tren" />
                    ) : (
                        <ResponsiveContainer width="100%" height={320} minWidth={1} minHeight={1}>
                            <LineChart data={formattedTrends} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="dateFormatted" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dx={-10} />
                                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 12px 24px rgb(15 23 42 / 0.10)' }} />
                                <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '20px' }} />
                                <Line type="monotone" name="Positif" dataKey="positive" stroke={COLORS.positive} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" name="Negatif" dataKey="negative" stroke={COLORS.negative} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" name="Netral" dataKey="neutral" stroke={COLORS.neutral} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </ChartPanel>
            </div>
        </div>
    );
}

function InsightCard({
    icon: Icon,
    label,
    value,
    hint,
    tone,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    hint: string;
    tone: 'slate' | 'indigo' | 'rose' | 'emerald';
}) {
    const toneClass = {
        slate: 'bg-slate-100 text-slate-700',
        indigo: 'bg-indigo-50 text-indigo-700',
        rose: 'bg-rose-50 text-rose-700',
        emerald: 'bg-emerald-50 text-emerald-700',
    }[tone];

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="mt-3 truncate text-2xl font-semibold text-slate-950">{value}</p>
                </div>
                <div className={`rounded-full p-2 ${toneClass}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">{hint}</p>
        </div>
    );
}

function AnalyticsLegend() {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-slate-950">Legenda analitik</h3>
                    <p className="mt-1 text-sm text-slate-500">Warna konsisten dengan badge review di tabel moderasi.</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                    <LegendPill colorClass="bg-emerald-500" label="Positif" description="Review bernada baik" />
                    <LegendPill colorClass="bg-rose-500" label="Negatif" description="Perlu prioritas admin" />
                    <LegendPill colorClass="bg-sky-500" label="Netral" description="Nada campuran atau biasa" />
                </div>
            </div>
        </section>
    );
}

function LegendPill({ colorClass, label, description }: { colorClass: string; label: string; description: string }) {
    return (
        <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-2.5">
            <span className={`mt-1 h-2.5 w-2.5 rounded-full ${colorClass}`} />
            <span>
                <span className="block text-xs font-semibold text-slate-800">{label}</span>
                <span className="block text-xs text-slate-500">{description}</span>
            </span>
        </div>
    );
}

function ChartPanel({
    title,
    description,
    className = '',
    children,
}: {
    title: string;
    description: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 ${className}`}>
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <h4 className="font-semibold text-slate-950">{title}</h4>
                    <p className="mt-1 text-sm text-slate-500">{description}</p>
                </div>
                <BarChart3 className="h-5 w-5 text-orange-500" />
            </div>
            {children}
        </section>
    );
}

function ChartEmptyState({ label }: { label: string }) {
    return (
        <div className="flex h-[260px] items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">
            {label}
        </div>
    );
}

function AnalyticsSkeleton() {
    return (
        <div className="space-y-5">
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
                ))}
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
                <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-80 animate-pulse rounded-2xl bg-slate-100 lg:col-span-2" />
                <div className="h-96 animate-pulse rounded-2xl bg-slate-100 lg:col-span-3" />
            </div>
        </div>
    );
}
