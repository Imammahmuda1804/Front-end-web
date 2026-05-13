'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRightLeft, Sparkles, AlertCircle, BarChart3, TrendingUp, Target, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import DestinationSelect from './DestinationSelect';

// Centralized chart color tokens (avoids hardcoded hex inline)
const CHART_COLORS = {
  dest1: '#FF7B54',       // matches --color-primary
  dest2: '#2D82B5',       // matches --color-secondary
  positive: '#10b981',
  neutral: '#94a3b8',
  negative: '#ef4444',
};

interface DestinationMinimal {
  id: number;
  name: string;
  city: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
}

interface CompareClientProps {
  availableDestinations: DestinationMinimal[];
}

export default function CompareClient({ availableDestinations }: CompareClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read initial state from URL params
  const initialD1 = searchParams.get('d1') ? Number(searchParams.get('d1')) : null;
  const initialD2 = searchParams.get('d2') ? Number(searchParams.get('d2')) : null;

  const [dest1Id, setDest1Id] = useState<number | null>(initialD1);
  const [dest2Id, setDest2Id] = useState<number | null>(initialD2);

  // Sync state to URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (dest1Id) params.set('d1', String(dest1Id));
    if (dest2Id) params.set('d2', String(dest2Id));
    const paramString = params.toString();
    const newUrl = paramString ? `/compare?${paramString}` : '/compare';
    router.replace(newUrl, { scroll: false });
  }, [dest1Id, dest2Id, router]);

  const handleReset = () => {
    setDest1Id(null);
    setDest2Id(null);
  };

  const { data: compareData, isLoading, isError, error } = useQuery({
    queryKey: ['compare', dest1Id, dest2Id],
    queryFn: async () => {
      if (!dest1Id || !dest2Id) return null;
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/analytics/compare`, {
        params: { destination1: dest1Id, destination2: dest2Id }
      });
      return res.data.data;
    },
    enabled: !!dest1Id && !!dest2Id,
  });

  // Prepare Chart Data
  const radarData = React.useMemo(() => {
    if (!compareData) return [];
    const d1 = compareData.destination1;
    const d2 = compareData.destination2;
    
    return [
      {
        subject: 'Skor Rekomendasi',
        tooltip: 'Skor gabungan dari sentimen positif dan relevansi AI',
        dest1: (d1.recommendation_score || 0) * 100,
        dest2: (d2.recommendation_score || 0) * 100,
        fullMark: 100,
      },
      {
        subject: 'Rasio Positif',
        tooltip: 'Persentase ulasan dengan sentimen positif',
        dest1: (d1.positive_ratio || 0) * 100,
        dest2: (d2.positive_ratio || 0) * 100,
        fullMark: 100,
      },
      {
        subject: 'Rating Pengguna',
        tooltip: 'Rata-rata rating dari pengguna (skala 1-5)',
        dest1: ((d1.rating.user || 0) / 5) * 100,
        dest2: ((d2.rating.user || 0) / 5) * 100,
        fullMark: 100,
      },
    ];
  }, [compareData]);

  const sentimentData = React.useMemo(() => {
    if (!compareData) return [];
    const d1 = compareData.destination1;
    const d2 = compareData.destination2;
    
    return [
      {
        name: d1.name,
        Positif: d1.sentiment.positive,
        Netral: d1.sentiment.neutral,
        Negatif: d1.sentiment.negative,
      },
      {
        name: d2.name,
        Positif: d2.sentiment.positive,
        Netral: d2.sentiment.neutral,
        Negatif: d2.sentiment.negative,
      }
    ];
  }, [compareData]);

  // Friendly error messages instead of raw API errors
  const getFriendlyError = (err: any): string => {
    if (err?.response?.status === 404) return 'Data destinasi tidak ditemukan.';
    if (err?.response?.status === 500) return 'Server sedang bermasalah. Coba beberapa saat lagi.';
    return 'Terjadi kesalahan. Coba pilih destinasi lain.';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-xl">
          <p className="font-bold text-slate-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center text-sm font-medium">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-600 mr-2">{entry.name}:</span>
              <span className="text-slate-900 font-bold">{typeof entry.value === 'number' ? entry.value.toFixed(0) : entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/search" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Pencarian
          </Link>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Bandingkan <span className="text-primary">Destinasi</span>
          </h1>
          <p className="text-slate-600 text-lg">Pilih dua destinasi untuk melihat perbandingan mendalam berdasarkan analisis sentimen AI.</p>
        </div>

        {/* Selection Area */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm mb-12">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
            
            <DestinationSelect 
              label="Destinasi A"
              placeholder="Pilih destinasi pertama..."
              destinations={availableDestinations}
              selectedId={dest1Id}
              onSelect={setDest1Id}
              disabledId={dest2Id}
            />

            <div className="hidden md:flex flex-col items-center justify-center w-12 h-12 bg-slate-50 rounded-full border border-slate-100 mt-6">
              <ArrowRightLeft className="w-5 h-5 text-slate-400" />
            </div>

            <DestinationSelect 
              label="Destinasi B"
              placeholder="Pilih destinasi pembanding..."
              destinations={availableDestinations}
              selectedId={dest2Id}
              onSelect={setDest2Id}
              disabledId={dest1Id}
            />

          </div>
          {/* Reset button */}
          {(dest1Id || dest2Id) && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Perbandingan
              </button>
            </div>
          )}
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-bold animate-pulse">Menganalisis perbandingan...</p>
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl flex items-start">
            <AlertCircle className="w-6 h-6 mr-3 shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-1">Gagal memuat data</h3>
              <p className="text-red-500">{getFriendlyError(error)}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!dest1Id || !dest2Id ? (
          <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Pilih dua destinasi</h3>
            <p className="text-slate-500 font-medium">Data perbandingan akan muncul di sini setelah Anda memilih kedua destinasi di atas.</p>
          </div>
        ) : null}

        {/* Comparison Dashboard */}
        {compareData && !isLoading && !isError && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Winner Banner — uses brand orange for celebratory feel */}
            <div className="bg-primary rounded-3xl p-6 md:p-8 flex items-center justify-between shadow-xl">
              <div className="text-white">
                <p className="text-white/70 font-bold text-sm uppercase tracking-wider mb-2 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-yellow-300" /> Rekomendasi Terbaik AI
                </p>
                <h2 className="text-3xl font-black">
                  {compareData.comparison.recommendation_winner === compareData.destination1.id 
                    ? compareData.destination1.name 
                    : compareData.comparison.recommendation_winner === compareData.destination2.id 
                      ? compareData.destination2.name 
                      : 'Seimbang'}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm font-medium mb-1">Selisih Skor</p>
                <p className="text-2xl font-bold text-white">
                  +{(compareData.comparison.score_difference * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Radar Chart */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                <div className="flex items-center mb-6">
                  <Target className="w-5 h-5 text-primary mr-2" />
                  <h3 className="text-lg font-black text-slate-900">Perbandingan Metrik Utama</h3>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} />
                      <Radar name={compareData.destination1.name} dataKey="dest1" stroke={CHART_COLORS.dest1} fill={CHART_COLORS.dest1} fillOpacity={0.4} strokeWidth={3} />
                      <Radar name={compareData.destination2.name} dataKey="dest2" stroke={CHART_COLORS.dest2} fill={CHART_COLORS.dest2} fillOpacity={0.4} strokeWidth={3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sentiment Stacked Bar */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                <div className="flex items-center mb-6">
                  <TrendingUp className="w-5 h-5 text-emerald-500 mr-2" />
                  <h3 className="text-lg font-black text-slate-900">Distribusi Sentimen</h3>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sentimentData}
                      margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#0f172a', fontWeight: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="Positif" stackId="a" fill={CHART_COLORS.positive} radius={[0, 0, 4, 4]} barSize={60} />
                      <Bar dataKey="Netral" stackId="a" fill={CHART_COLORS.neutral} />
                      <Bar dataKey="Negatif" stackId="a" fill={CHART_COLORS.negative} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Review Count Stats — replaces misleading normalized radar axis */}
            <div className="grid grid-cols-2 gap-4">
              {[compareData.destination1, compareData.destination2].map((dest, idx) => {
                const totalReviews = dest.sentiment.positive + dest.sentiment.negative + dest.sentiment.neutral;
                return (
                  <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-primary' : 'bg-secondary'}`} />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{dest.name}</p>
                      <p className="text-xs text-slate-500">{totalReviews} ulasan dianalisis</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Top Topics Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[compareData.destination1, compareData.destination2].map((dest, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 mb-6 pb-4 border-b border-slate-100 border-dashed">
                    Vibe Dominan: <span className={idx === 0 ? 'text-primary' : 'text-secondary'}>{dest.name}</span>
                  </h3>
                  
                  {dest.topics && dest.topics.length > 0 ? (
                    <div className="space-y-4">
                      {dest.topics.slice(0, 5).map((t: any, i: number) => {
                        const words = t.topic_name.replace(/Topic \d+: /, '').split(', ');
                        return (
                          <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                            <div>
                              <p className="font-bold text-slate-800 capitalize">{words.slice(0, 2).join(', ')}</p>
                              <p className="text-xs text-slate-500 mt-1">{words.slice(2).join(', ')}</p>
                            </div>
                            <div className="bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">
                              <span className="text-xs font-bold text-slate-600">{t.total_reviews} ulasan</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 italic">
                      Data topik belum tersedia.
                    </div>
                  )}
                </div>
              ))}
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}
