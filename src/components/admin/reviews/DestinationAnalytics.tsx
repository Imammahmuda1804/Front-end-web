'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAnalyticsService } from '@/services/admin/analytics.service';
import { 
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line 
} from 'recharts';
import { Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DestinationAnalyticsProps {
    destinationId: number;
}

const COLORS = {
    positive: '#10b981', // emerald-500
    negative: '#f43f5e', // rose-500
    neutral: '#3b82f6',  // blue-500
};

export function DestinationAnalytics({ destinationId }: DestinationAnalyticsProps) {
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

    if (loadingAnalytics || loadingTopics || loadingTrends) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p>Memuat visualisasi analitik...</p>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-10 text-slate-500">
                Data analitik belum tersedia untuk destinasi ini. Pastikan proses scraping dan NLP telah berjalan.
            </div>
        );
    }

    // Prepare Sentiment Data
    const sentiment = analytics.sentiment || { positive: 0, negative: 0, neutral: 0 };
    const sentimentData = [
        { name: 'Positif', value: sentiment.positive || 0, color: COLORS.positive },
        { name: 'Negatif', value: sentiment.negative || 0, color: COLORS.negative },
        { name: 'Netral', value: sentiment.neutral || 0, color: COLORS.neutral },
    ].filter(d => d.value > 0);

    const totalReviewsAnalyzed = sentimentData.reduce((acc, curr) => acc + curr.value, 0);

    // Prepare Trends Data
    const formattedTrends = (trends || []).map(t => ({
        ...t,
        dateFormatted: new Date(t.date).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
    }));

    const handleExport = () => {
        window.open(adminAnalyticsService.getExportCsvUrl(destinationId), '_blank');
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Analisis Sentimen: {analytics.name}</h3>
                    <p className="text-sm text-slate-500">
                        Skor Rekomendasi: <span className="font-semibold text-primary">{((analytics.recommendation_score || 0) * 100).toFixed(1)}%</span> • 
                        Total Review Dianalisis: <span className="font-semibold">{totalReviewsAnalyzed}</span>
                    </p>
                </div>
                <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sentiment Donut */}
                <div className="col-span-1 border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col items-center">
                    <h4 className="font-medium text-slate-700 w-full text-left mb-4">Distribusi Sentimen</h4>
                    {totalReviewsAnalyzed === 0 ? (
                        <div className="flex items-center justify-center h-[250px] text-slate-400 text-sm">Belum ada data</div>
                    ) : (
                        <div className="w-full h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sentimentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {sentimentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        formatter={(value: any) => [`${value} Review`, 'Jumlah']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Topics Bar Chart */}
                <div className="col-span-1 lg:col-span-2 border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                    <h4 className="font-medium text-slate-700 mb-4">Topik Paling Sering Dibicarakan</h4>
                    {(!topics || topics.length === 0) ? (
                        <div className="flex items-center justify-center h-[250px] text-slate-400 text-sm">Belum ada data topik</div>
                    ) : (
                        <div className="w-full h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topics.slice(0, 7)} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="topic_name" type="category" axisLine={false} tickLine={false} fontSize={12} width={100} />
                                    <RechartsTooltip 
                                        formatter={(value: any) => [`${value} Review`, 'Jumlah']}
                                        cursor={{fill: '#f8fafc'}}
                                    />
                                    <Bar dataKey="total_reviews" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Sentiment Trends */}
                <div className="col-span-1 lg:col-span-3 border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                    <h4 className="font-medium text-slate-700 mb-4">Tren Sentimen Bulanan</h4>
                    {(!formattedTrends || formattedTrends.length === 0) ? (
                        <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">Belum ada data tren</div>
                    ) : (
                        <div className="w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={formattedTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="dateFormatted" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} dx={-10} />
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '20px' }} />
                                    <Line type="monotone" name="Positif" dataKey="positive" stroke={COLORS.positive} strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                                    <Line type="monotone" name="Negatif" dataKey="negative" stroke={COLORS.negative} strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                                    <Line type="monotone" name="Netral" dataKey="neutral" stroke={COLORS.neutral} strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
