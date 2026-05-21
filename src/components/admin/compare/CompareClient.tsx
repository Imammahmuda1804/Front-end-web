'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ElementType } from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  BarChart2,
  Download,
  GitCompare,
  Heart,
  Star,
  ThumbsUp,
  TrendingUp,
} from 'lucide-react';

import { adminDestinationService } from '@/services/admin/destination.service';
import {
  adminAnalyticsService,
  CompareResult,
  DestinationAnalytics,
  TopicData,
  TrendData,
} from '@/services/admin/analytics.service';
import { AnalyticsSkeleton, CompareAnalysisView } from './admin-compare.result';
import { ComparisonHeroPanel, DestinationSelect, ModeButton } from './admin-compare.panels';
import { SingleAnalysisView } from './admin-compare.single';

export type Mode = 'single' | 'compare';

export interface DestinationOption {
  id: number;
  name: string;
}

export type Tone = 'orange' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';

type TooltipPayload = {
  color?: string;
  name?: string;
  value?: number | string;
};

export type MetricRow = {
  label: string;
  a: number;
  b: number;
  format: 'percent' | 'rating' | 'score';
  icon: ElementType;
};

export const DEST_A_COLOR = 'var(--explore)';
export const DEST_B_COLOR = 'var(--ai)';
export const SENTIMENT_COLORS = ['#10b981', '#94a3b8', '#ef4444'];

export function percent(value: number | null | undefined) {
  return Math.round((value || 0) * 100);
}

export function sentimentTotal(data: DestinationAnalytics | null | undefined) {
  if (!data) return 0;
  return (data.sentiment.positive || 0) + (data.sentiment.neutral || 0) + (data.sentiment.negative || 0);
}

export function sentimentRate(data: DestinationAnalytics | null | undefined) {
  const total = sentimentTotal(data);
  return total > 0 && data ? Math.round((data.sentiment.positive / total) * 100) : 0;
}

export function formatMonth(date: string) {
  return new Date(date).toLocaleDateString('id-ID', { month: 'short' });
}

export function cleanTopicName(name: string) {
  return name.replace(/^Topic \d+:\s*/, '').trim();
}

export function formatMetric(value: number, format: MetricRow['format']) {
  if (format === 'percent') return `${Math.round(value)}%`;
  if (format === 'rating') return value.toFixed(1);
  return value.toFixed(2);
}

export function formatSigned(value: number, suffix = '') {
  if (value > 0) return `+${value}${suffix}`;
  return `${value}${suffix}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== 'object' || error === null) return fallback;
  const maybeError = error as { response?: { data?: { message?: string } }; message?: string };
  return maybeError.response?.data?.message || maybeError.message || fallback;
}

export function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
      <p className="mb-2 text-sm font-black text-slate-950">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="flex items-center text-sm font-semibold">
            <span className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="mr-2 text-slate-600">{entry.name}</span>
            <span className="font-black text-slate-950">{typeof entry.value === 'number' ? entry.value.toFixed(0) : entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CompareClient() {
  const [activeTab, setActiveTab] = useState<Mode>('single');
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [destA, setDestA] = useState<number | ''>('');
  const [destB, setDestB] = useState<number | ''>('');
  const [singleData, setSingleData] = useState<DestinationAnalytics | null>(null);
  const [compareData, setCompareData] = useState<CompareResult | null>(null);
  const [trendDataA, setTrendDataA] = useState<TrendData[]>([]);
  const [trendDataB, setTrendDataB] = useState<TrendData[]>([]);
  const [topicsA, setTopicsA] = useState<TopicData[]>([]);
  const [topicsB, setTopicsB] = useState<TopicData[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchDestinations = async () => {
      try {
        const res = await adminDestinationService.getDestinations({ limit: 100 });
        if (!cancelled) {
          const list = Array.isArray(res.data) ? res.data : [];
          setDestinations(list);
          setDestA((current) => current || list[0]?.id || '');
          setDestB((current) => current || list[1]?.id || '');
        }
      } catch (error) {
        if (!cancelled) setErrorMessage(getErrorMessage(error, 'Gagal memuat daftar destinasi.'));
      }
    };

    void fetchDestinations();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setErrorMessage(null);

      if (activeTab === 'single') {
        if (!destA) return;
        setLoading(true);
        try {
          const [analytics, trends, topics] = await Promise.all([
            adminAnalyticsService.getDestinationAnalytics(Number(destA)),
            adminAnalyticsService.getDestinationTrends(Number(destA), 'monthly'),
            adminAnalyticsService.getDestinationTopics(Number(destA)),
          ]);
          if (!cancelled) {
            setSingleData(analytics);
            setTrendDataA(trends);
            setTopicsA(topics);
          }
        } catch (error) {
          if (!cancelled) setErrorMessage(getErrorMessage(error, 'Gagal memuat analitik destinasi.'));
        } finally {
          if (!cancelled) setLoading(false);
        }
        return;
      }

      if (!destA || !destB) return;
      if (destA === destB) {
        setCompareData(null);
        setErrorMessage('Pilih dua destinasi berbeda untuk mode banding.');
        return;
      }

      setLoading(true);
      try {
        const [comparison, trendsA, trendsB, topA, topB] = await Promise.all([
          adminAnalyticsService.compareDestinations(Number(destA), Number(destB)),
          adminAnalyticsService.getDestinationTrends(Number(destA), 'monthly'),
          adminAnalyticsService.getDestinationTrends(Number(destB), 'monthly'),
          adminAnalyticsService.getDestinationTopics(Number(destA)),
          adminAnalyticsService.getDestinationTopics(Number(destB)),
        ]);
        if (!cancelled) {
          setCompareData(comparison);
          setTrendDataA(trendsA);
          setTrendDataB(trendsB);
          setTopicsA(topA);
          setTopicsB(topB);
        }
      } catch (error) {
        if (!cancelled) setErrorMessage(getErrorMessage(error, 'Gagal memuat perbandingan destinasi.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchData();
    return () => {
      cancelled = true;
    };
  }, [activeTab, destA, destB]);

  const handleExport = () => {
    if (activeTab === 'single' && destA) {
      window.open(adminAnalyticsService.getExportCsvUrl(Number(destA)), '_blank');
      return;
    }
    if (destA) window.open(adminAnalyticsService.getExportCsvUrl(Number(destA)), '_blank');
    if (destB) window.setTimeout(() => window.open(adminAnalyticsService.getExportCsvUrl(Number(destB)), '_blank'), 500);
  };

  const handleSwap = () => {
    setDestA(destB);
    setDestB(destA);
  };

  const selectedA = destinations.find((destination) => destination.id === destA);
  const selectedB = destinations.find((destination) => destination.id === destB);

  const singlePieData = useMemo(() => {
    if (!singleData) return [];
    return [
      { name: 'Positif', value: singleData.sentiment.positive || 0 },
      { name: 'Netral', value: singleData.sentiment.neutral || 0 },
      { name: 'Negatif', value: singleData.sentiment.negative || 0 },
    ];
  }, [singleData]);

  const singleTrendData = useMemo(
    () => trendDataA.map((trend) => ({
      name: formatMonth(trend.date),
      Positif: trend.positive,
      Netral: trend.neutral,
      Negatif: trend.negative,
      PosRate: Math.round((trend.positive / ((trend.positive + trend.negative + trend.neutral) || 1)) * 100),
    })),
    [trendDataA],
  );

  const singleTopicData = useMemo(
    () => topicsA.slice(0, 7).map((topic) => ({ name: cleanTopicName(topic.topic_name), Percentage: Math.round(topic.percentage) })),
    [topicsA],
  );

  const singleCompleteness = useMemo(() => {
    if (!singleData) return 0;
    const checks = [
      singleData.positive_ratio !== null,
      singleData.recommendation_score !== null,
      Boolean(singleData.rating.google || singleData.rating.user),
      trendDataA.length > 0,
      topicsA.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [singleData, topicsA.length, trendDataA.length]);

  const radarData = useMemo(() => {
    const dA = compareData?.destination1;
    const dB = compareData?.destination2;
    if (!dA || !dB) return [];
    return [
      { subject: 'Rasio Positif', A: percent(dA.positive_ratio), B: percent(dB.positive_ratio), fullMark: 100 },
      { subject: 'Rating User', A: Math.round(((dA.rating.user || 0) / 5) * 100), B: Math.round(((dB.rating.user || 0) / 5) * 100), fullMark: 100 },
      { subject: 'Rating Google', A: Math.round(((dA.rating.google || 0) / 5) * 100), B: Math.round(((dB.rating.google || 0) / 5) * 100), fullMark: 100 },
      { subject: 'Skor AI', A: percent(dA.recommendation_score), B: percent(dB.recommendation_score), fullMark: 100 },
    ];
  }, [compareData]);

  const sentimentCompareData = useMemo(() => {
    const dA = compareData?.destination1;
    const dB = compareData?.destination2;
    if (!dA || !dB) return [];
    const totalA = sentimentTotal(dA) || 1;
    const totalB = sentimentTotal(dB) || 1;
    return [
      { name: dA.name, Positif: Math.round((dA.sentiment.positive / totalA) * 100), Netral: Math.round((dA.sentiment.neutral / totalA) * 100), Negatif: Math.round((dA.sentiment.negative / totalA) * 100) },
      { name: dB.name, Positif: Math.round((dB.sentiment.positive / totalB) * 100), Netral: Math.round((dB.sentiment.neutral / totalB) * 100), Negatif: Math.round((dB.sentiment.negative / totalB) * 100) },
    ];
  }, [compareData]);

  const mergedTrendData = useMemo(() => {
    const trendMap = new Map<string, { name: string; A?: number; B?: number }>();
    trendDataA.forEach((trend) => {
      trendMap.set(trend.date, {
        name: formatMonth(trend.date),
        A: Math.round((trend.positive / ((trend.positive + trend.negative + trend.neutral) || 1)) * 100),
      });
    });
    trendDataB.forEach((trend) => {
      const existing = trendMap.get(trend.date) || { name: formatMonth(trend.date) };
      trendMap.set(trend.date, {
        ...existing,
        B: Math.round((trend.positive / ((trend.positive + trend.negative + trend.neutral) || 1)) * 100),
      });
    });
    return Array.from(trendMap.values());
  }, [trendDataA, trendDataB]);

  const mergedTopicData = useMemo(() => {
    const topicMap = new Map<string, { name: string; A: number; B: number }>();
    topicsA.slice(0, 6).forEach((topic) => topicMap.set(cleanTopicName(topic.topic_name), { name: cleanTopicName(topic.topic_name), A: Math.round(topic.percentage), B: 0 }));
    topicsB.slice(0, 6).forEach((topic) => {
      const name = cleanTopicName(topic.topic_name);
      const existing = topicMap.get(name) || { name, A: 0, B: 0 };
      topicMap.set(name, { ...existing, B: Math.round(topic.percentage) });
    });
    return Array.from(topicMap.values()).slice(0, 7);
  }, [topicsA, topicsB]);

  const metricRows = useMemo<MetricRow[]>(() => {
    const dA = compareData?.destination1;
    const dB = compareData?.destination2;
    if (!dA || !dB) return [];
    return [
      { label: 'Rasio Positif', a: percent(dA.positive_ratio), b: percent(dB.positive_ratio), format: 'percent', icon: Heart },
      { label: 'Rating Pengguna', a: dA.rating.user || 0, b: dB.rating.user || 0, format: 'rating', icon: Star },
      { label: 'Rating Google', a: dA.rating.google || 0, b: dB.rating.google || 0, format: 'rating', icon: ThumbsUp },
      { label: 'Skor AI', a: dA.recommendation_score || 0, b: dB.recommendation_score || 0, format: 'score', icon: TrendingUp },
      { label: 'Volume Ulasan', a: sentimentTotal(dA), b: sentimentTotal(dB), format: 'score', icon: BarChart2 },
    ];
  }, [compareData]);

  const biggestDelta = useMemo(() => {
    if (metricRows.length === 0) return null;
    return metricRows.reduce((largest, row) => (Math.abs(row.a - row.b) > Math.abs(largest.a - largest.b) ? row : largest), metricRows[0]);
  }, [metricRows]);

  const dA = compareData?.destination1;
  const dB = compareData?.destination2;
  const recommendationWinner = dA && dB
    ? compareData?.comparison.recommendation_winner === dA.id
      ? dA
      : compareData?.comparison.recommendation_winner === dB.id
        ? dB
        : null
    : null;

  return (
    <div className="space-y-6">
      <ComparisonHeroPanel
        activeTab={activeTab}
        dA={dA}
        dB={dB}
        biggestDelta={biggestDelta}
        singleData={singleData}
      />

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-end">
            <DestinationSelect
              label={activeTab === 'single' ? 'Pilih Destinasi' : 'Destinasi A'}
              value={destA}
              destinations={destinations}
              tone="orange"
              onChange={setDestA}
            />
            {activeTab === 'compare' && (
              <>
                <button
                  type="button"
                  onClick={handleSwap}
                  disabled={!destA && !destB}
                  aria-label="Tukar destinasi pembanding"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 text-sm font-black text-ai transition-all hover:-translate-y-0.5 hover:border-ai disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Tukar
                </button>
                <DestinationSelect
                  label="Destinasi B"
                  value={destB}
                  destinations={destinations}
                  tone="blue"
                  onChange={setDestB}
                />
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div role="tablist" aria-label="Mode analitik" className="flex rounded-2xl border border-slate-200 bg-slate-100 p-1">
              <ModeButton mode="single" activeTab={activeTab} onClick={setActiveTab} icon={BarChart2} label="Analisis Tunggal" />
              <ModeButton mode="compare" activeTab={activeTab} onClick={setActiveTab} icon={GitCompare} label="Mode Banding" />
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={activeTab === 'single' ? !destA : !destA || !destB}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-black text-white shadow-sm shadow-orange-200 transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Ekspor CSV
            </button>
          </div>
        </div>
      </section>

      {errorMessage && (
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-black">Perlu perhatian</p>
              <p className="mt-1 text-sm font-semibold">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <AnalyticsSkeleton />
      ) : activeTab === 'single' ? (
        <SingleAnalysisView
          data={singleData}
          pieData={singlePieData}
          trendData={singleTrendData}
          topicData={singleTopicData}
          topics={topicsA}
          completeness={singleCompleteness}
          onExport={handleExport}
        />
      ) : (
        <CompareAnalysisView
          dA={dA}
          dB={dB}
          selectedA={selectedA}
          selectedB={selectedB}
          recommendationWinner={recommendationWinner}
          metricRows={metricRows}
          biggestDelta={biggestDelta}
          radarData={radarData}
          sentimentCompareData={sentimentCompareData}
          mergedTopicData={mergedTopicData}
          mergedTrendData={mergedTrendData}
          onExport={handleExport}
        />
      )}
    </div>
  );
}


