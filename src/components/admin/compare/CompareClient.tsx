'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  BarChart2,
  CheckCircle2,
  Download,
  FileDown,
  GitCompare,
  Heart,
  Star,
  Tags,
  Target,
  ThumbsUp,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { adminDestinationService } from '@/services/admin/destination.service';
import {
  adminAnalyticsService,
  CompareResult,
  DestinationAnalytics,
  TopicData,
  TrendData,
} from '@/services/admin/analytics.service';
import { NativeSelect } from '@/components/ui/native-select';

type Mode = 'single' | 'compare';

interface DestinationOption {
  id: number;
  name: string;
}

type Tone = 'orange' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';

type TooltipPayload = {
  color?: string;
  name?: string;
  value?: number | string;
};

type MetricRow = {
  label: string;
  a: number;
  b: number;
  format: 'percent' | 'rating' | 'score';
  icon: ElementType;
};

const DEST_A_COLOR = '#FF7B54';
const DEST_B_COLOR = '#2D82B5';
const SENTIMENT_COLORS = ['#10b981', '#94a3b8', '#ef4444'];

function percent(value: number | null | undefined) {
  return Math.round((value || 0) * 100);
}

function sentimentTotal(data: DestinationAnalytics | null | undefined) {
  if (!data) return 0;
  return (data.sentiment.positive || 0) + (data.sentiment.neutral || 0) + (data.sentiment.negative || 0);
}

function sentimentRate(data: DestinationAnalytics | null | undefined) {
  const total = sentimentTotal(data);
  return total > 0 && data ? Math.round((data.sentiment.positive / total) * 100) : 0;
}

function formatMonth(date: string) {
  return new Date(date).toLocaleDateString('id-ID', { month: 'short' });
}

function cleanTopicName(name: string) {
  return name.replace(/^Topic \d+:\s*/, '').trim();
}

function formatMetric(value: number, format: MetricRow['format']) {
  if (format === 'percent') return `${Math.round(value)}%`;
  if (format === 'rating') return value.toFixed(1);
  return value.toFixed(2);
}

function formatSigned(value: number, suffix = '') {
  if (value > 0) return `+${value}${suffix}`;
  return `${value}${suffix}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== 'object' || error === null) return fallback;
  const maybeError = error as { response?: { data?: { message?: string } }; message?: string };
  return maybeError.response?.data?.message || maybeError.message || fallback;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
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
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 text-sm font-black text-[#2D82B5] transition-all hover:-translate-y-0.5 hover:border-[#2D82B5] disabled:cursor-not-allowed disabled:opacity-40"
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

function ComparisonHeroPanel({
  activeTab,
  dA,
  dB,
  biggestDelta,
  singleData,
}: {
  activeTab: Mode;
  dA?: DestinationAnalytics;
  dB?: DestinationAnalytics;
  biggestDelta: MetricRow | null;
  singleData: DestinationAnalytics | null;
}) {
  const comparisonGap = biggestDelta ? `${Math.abs(biggestDelta.a - biggestDelta.b).toFixed(biggestDelta.format === 'rating' ? 1 : 0)}${biggestDelta.format === 'percent' ? '%' : ''}` : '-';
  const trendSignal = activeTab === 'compare' && dA && dB
    ? `${sentimentRate(dA)}% vs ${sentimentRate(dB)}%`
    : singleData
      ? `${sentimentRate(singleData)}% positif`
      : '-';

  return (
    <section className="rounded-[2rem] border border-orange-100 bg-orange-50/70 p-6 shadow-sm shadow-orange-100/50">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-primary shadow-sm">
            <GitCompare className="h-3.5 w-3.5" />
            Compare Intelligence
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Compare Analytics</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-600 md:text-base">
            Ruang analisis admin untuk membaca selisih performa, kualitas sinyal, tren sentimen, dan topik pembeda antar destinasi.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:min-w-[42rem]">
          <HeroInsightCard label="Selisih skor" value={comparisonGap} helper={biggestDelta?.label || 'Belum ada pembanding'} icon={Target} tone="orange" />
          <HeroInsightCard label="Tren positif" value={trendSignal} helper="Rasio sentimen positif" icon={TrendingUp} tone="emerald" />
          <HeroInsightCard label="Topik pembeda" value={activeTab === 'compare' ? String((dA?.topics?.length || 0) + (dB?.topics?.length || 0)) : String(singleData?.topics?.length || 0)} helper="Topik tersedia" icon={Tags} tone="blue" />
        </div>
      </div>
    </section>
  );
}

function HeroInsightCard({ icon: Icon, label, value, helper, tone }: { icon: ElementType; label: string; value: string; helper: string; tone: 'orange' | 'blue' | 'emerald' }) {
  const toneClass = {
    orange: 'border-orange-100 bg-white text-primary',
    blue: 'border-sky-100 bg-sky-50 text-[#2D82B5]',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  }[tone];

  return (
    <div className={`rounded-3xl border p-4 shadow-sm ${toneClass}`}>
      <Icon className="mb-3 h-5 w-5" />
      <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold opacity-80">{helper}</p>
    </div>
  );
}

function ModeButton({ mode, activeTab, onClick, icon: Icon, label }: { mode: Mode; activeTab: Mode; onClick: (mode: Mode) => void; icon: ElementType; label: string }) {
  const active = activeTab === mode;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => onClick(mode)}
      className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-black transition-all ${
        active ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function DestinationSelect({ label, value, destinations, tone, onChange }: { label: string; value: number | ''; destinations: DestinationOption[]; tone: 'orange' | 'blue'; onChange: (value: number | '') => void }) {
  const accent = tone === 'orange' ? 'text-primary' : 'text-[#2D82B5]';
  const options = destinations.map((destination) => ({
    value: String(destination.id),
    label: destination.name,
  }));

  return (
    <label className="min-w-0 flex-1">
      <span className={`mb-2 block text-xs font-black uppercase tracking-[0.16em] ${accent}`}>{label}</span>
      <NativeSelect
        aria-label={`Pilih ${label.toLowerCase()}`}
        value={value ? String(value) : ''}
        onValueChange={(nextValue) => onChange(nextValue ? Number(nextValue) : '')}
        options={options}
        placeholder="Pilih destinasi"
        searchable
        searchPlaceholder="Cari nama destinasi..."
      />
    </label>
  );
}

function SingleAnalysisView({
  data,
  pieData,
  trendData,
  topicData,
  topics,
  completeness,
  onExport,
}: {
  data: DestinationAnalytics | null;
  pieData: Array<{ name: string; value: number }>;
  trendData: Array<{ name: string; Positif: number; Netral: number; Negatif: number; PosRate: number }>;
  topicData: Array<{ name: string; Percentage: number }>;
  topics: TopicData[];
  completeness: number;
  onExport: () => void;
}) {
  if (!data) {
    return <EmptyState title="Pilih destinasi untuk dianalisis" description="Dashboard analitik tunggal akan muncul setelah destinasi dipilih." />;
  }

  const totalReviews = sentimentTotal(data);
  const negativeRatio = totalReviews > 0 ? Math.round(((data.sentiment.negative || 0) / totalReviews) * 100) : 0;
  const neutralRatio = totalReviews > 0 ? Math.round(((data.sentiment.neutral || 0) / totalReviews) * 100) : 0;
  const latestTrend = trendData.at(-1);
  const previousTrend = trendData.at(-2);
  const latestVolume = latestTrend ? latestTrend.Positif + latestTrend.Netral + latestTrend.Negatif : 0;
  const previousVolume = previousTrend ? previousTrend.Positif + previousTrend.Netral + previousTrend.Negatif : 0;
  const trendDelta = latestTrend && previousTrend ? latestTrend.PosRate - previousTrend.PosRate : 0;
  const volumeDelta = latestTrend && previousTrend ? latestVolume - previousVolume : 0;
  const negativeLatestRate = latestTrend && latestVolume > 0 ? Math.round((latestTrend.Negatif / latestVolume) * 100) : 0;
  const negativePreviousRate = previousTrend && previousVolume > 0 ? Math.round((previousTrend.Negatif / previousVolume) * 100) : 0;
  const negativeDelta = latestTrend && previousTrend ? negativeLatestRate - negativePreviousRate : 0;
  const healthLabel = completeness >= 80 ? 'Sinyal kuat' : completeness >= 60 ? 'Cukup terbaca' : 'Data terbatas';
  const riskLabel = negativeRatio >= 25 ? 'Risiko tinggi' : negativeRatio >= 12 ? 'Perlu dipantau' : 'Risiko rendah';
  const priorityTopics = topicData.slice(0, 5);
  const actionItems = [
    {
      label: riskLabel === 'Risiko tinggi' ? 'Audit review negatif terbaru' : 'Pantau sentimen negatif',
      helper: `${negativeRatio}% ulasan bernada negatif dari data terklasifikasi.`,
      tone: riskLabel === 'Risiko tinggi' ? 'rose' : 'amber',
      done: riskLabel === 'Risiko rendah',
    },
    {
      label: topics.length > 0 ? `Validasi topik: ${cleanTopicName(topics[0].topic_name)}` : 'Lengkapi pemetaan topik',
      helper: topics.length > 0 ? 'Topik dominan bisa dipakai untuk prioritas konten dan kurasi.' : 'Belum ada topik untuk membantu membaca pola ulasan.',
      tone: topics.length > 0 ? 'blue' : 'amber',
      done: topics.length > 0,
    },
    {
      label: trendData.length > 1 ? 'Review perubahan tren bulanan' : 'Kumpulkan tren bulanan',
      helper: trendData.length > 1 ? `Rasio positif bulan terakhir ${formatSigned(trendDelta, '%')} dari periode sebelumnya.` : 'Butuh minimal dua periode agar delta tren lebih bermakna.',
      tone: trendDelta < 0 ? 'rose' : 'emerald',
      done: trendData.length > 1 && trendDelta >= 0,
    },
    {
      label: completeness >= 80 ? 'Data siap untuk keputusan admin' : 'Perkuat kelengkapan data',
      helper: `Kelengkapan sinyal saat ini ${completeness}%.`,
      tone: completeness >= 80 ? 'emerald' : 'amber',
      done: completeness >= 80,
    },
  ] satisfies ActionItem[];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Rasio Positif" value={`${percent(data.positive_ratio)}%`} helper="Dari seluruh ulasan" icon={Heart} tone="emerald" />
        <MetricCard label="Rating User" value={(data.rating.user || 0).toFixed(1)} helper="Skala 1-5" icon={Star} tone="amber" />
        <MetricCard label="Skor AI" value={(data.recommendation_score || 0).toFixed(2)} helper="Sinyal rekomendasi" icon={ThumbsUp} tone="orange" />
        <MetricCard label="Volume Ulasan" value={String(sentimentTotal(data))} helper="Terklasifikasi" icon={BarChart2} tone="blue" />
        <MetricCard label="Kelengkapan" value={`${completeness}%`} helper="Tren, topik, rating" icon={CheckCircle2} tone="slate" />
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Single destination cockpit</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{data.name}</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
              Ringkasan operasional untuk membaca kesehatan sinyal, risiko sentimen, perubahan tren, dan topik yang paling layak diprioritaskan.
            </p>
          </div>
          <button onClick={onExport} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-black text-white transition-colors hover:bg-primary/90">
            <FileDown className="h-4 w-4" />
            Ekspor CSV
          </button>
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]">
          <SignalHealthPanel
            completeness={completeness}
            label={healthLabel}
            hasRating={Boolean(data.rating.google || data.rating.user)}
            hasTrends={trendData.length > 0}
            hasTopics={topics.length > 0}
            reviewVolume={totalReviews}
          />
          <SentimentRiskPanel
            positiveRatio={sentimentRate(data)}
            neutralRatio={neutralRatio}
            negativeRatio={negativeRatio}
            label={riskLabel}
          />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <TrendDeltaCard label="Rasio positif" value={latestTrend ? `${latestTrend.PosRate}%` : '-'} delta={trendData.length > 1 ? formatSigned(trendDelta, '%') : 'Belum cukup data'} tone={trendDelta < 0 ? 'rose' : 'emerald'} />
          <TrendDeltaCard label="Volume review" value={latestTrend ? String(latestVolume) : '-'} delta={trendData.length > 1 ? formatSigned(volumeDelta) : 'Belum cukup data'} tone={volumeDelta < 0 ? 'amber' : 'blue'} />
          <TrendDeltaCard label="Rasio negatif" value={latestTrend ? `${negativeLatestRate}%` : '-'} delta={trendData.length > 1 ? formatSigned(negativeDelta, '%') : 'Belum cukup data'} tone={negativeDelta > 0 ? 'rose' : 'emerald'} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <TopicPriorityPanel topics={priorityTopics} />
        <AdminActionChecklist items={actionItems} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(18rem,0.6fr)_minmax(0,1.4fr)]">
        <ChartCard title="Distribusi Sentimen" icon={Heart}>
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={68} outerRadius={92} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => <Cell key={entry.name} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Topik Teratas" icon={Tags}>
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={topicData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 123, 84, 0.08)' }} />
              <Bar dataKey="Percentage" name="Persentase" fill={DEST_A_COLOR} radius={[8, 8, 0, 0]} barSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Tren Sentimen Bulanan" icon={TrendingUp} heightClass="h-[22rem]">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <AreaChart data={trendData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="adminSingleTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="PosRate" name="Rasio Positif" stroke="#10b981" strokeWidth={3} fill="url(#adminSingleTrend)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

type ActionItem = {
  label: string;
  helper: string;
  tone: Extract<Tone, 'blue' | 'emerald' | 'amber' | 'rose'>;
  done: boolean;
};

function SignalHealthPanel({
  completeness,
  label,
  hasRating,
  hasTrends,
  hasTopics,
  reviewVolume,
}: {
  completeness: number;
  label: string;
  hasRating: boolean;
  hasTrends: boolean;
  hasTopics: boolean;
  reviewVolume: number;
}) {
  const checks = [
    { label: 'Rating', active: hasRating },
    { label: 'Tren', active: hasTrends },
    { label: 'Topik', active: hasTopics },
    { label: 'Review', active: reviewVolume > 0 },
  ];

  return (
    <div className="rounded-[1.5rem] border border-orange-100 bg-orange-50/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Signal health</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">{label}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-600">{reviewVolume} review terklasifikasi</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
          <CheckCircle2 className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-primary" style={{ width: `${completeness}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {checks.map((check) => (
          <span
            key={check.label}
            className={`inline-flex min-h-10 items-center justify-center rounded-full border px-3 text-xs font-black ${
              check.active ? 'border-emerald-100 bg-white text-emerald-700' : 'border-amber-100 bg-white text-amber-700'
            }`}
          >
            {check.label}: {check.active ? 'Ada' : 'Kosong'}
          </span>
        ))}
      </div>
    </div>
  );
}

function SentimentRiskPanel({
  positiveRatio,
  neutralRatio,
  negativeRatio,
  label,
}: {
  positiveRatio: number;
  neutralRatio: number;
  negativeRatio: number;
  label: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#2D82B5]">Sentiment risk</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">{label}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-600">Komposisi sentimen untuk prioritas monitoring admin.</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-white px-4 py-3 text-right">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-500">Negatif</p>
          <p className="text-2xl font-black text-slate-950">{negativeRatio}%</p>
        </div>
      </div>
      <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
        <div className="bg-emerald-500" style={{ width: `${positiveRatio}%` }} />
        <div className="bg-slate-300" style={{ width: `${neutralRatio}%` }} />
        <div className="bg-rose-500" style={{ width: `${negativeRatio}%` }} />
      </div>
      <div className="mt-4 grid gap-2 text-xs font-black sm:grid-cols-3">
        <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700">Positif {positiveRatio}%</span>
        <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-600">Netral {neutralRatio}%</span>
        <span className="rounded-full bg-rose-50 px-3 py-2 text-rose-700">Negatif {negativeRatio}%</span>
      </div>
    </div>
  );
}

function TrendDeltaCard({ label, value, delta, tone }: { label: string; value: string; delta: string; tone: Tone }) {
  const toneClass = {
    orange: 'border-orange-100 bg-orange-50 text-primary',
    blue: 'border-sky-100 bg-sky-50 text-[#2D82B5]',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
  }[tone];

  return (
    <article className={`rounded-[1.35rem] border p-4 ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{label}</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
        </div>
        <TrendingUp className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-black">{delta}</p>
      <p className="mt-1 text-xs font-bold opacity-75">vs periode sebelumnya</p>
    </article>
  );
}

function TopicPriorityPanel({ topics }: { topics: Array<{ name: string; Percentage: number }> }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Topic priority</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Topik dengan dampak operasional</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Diurutkan dari porsi pembahasan terbesar agar admin tahu area kurasi yang paling terlihat di review.</p>
        </div>
        <Tags className="h-5 w-5 text-primary" />
      </div>
      {topics.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm font-bold text-slate-500">Belum ada topik yang bisa diprioritaskan.</div>
      ) : (
        <div className="space-y-3">
          {topics.map((topic, index) => {
            const priority = topic.Percentage >= 25 ? 'Prioritas tinggi' : topic.Percentage >= 12 ? 'Prioritas sedang' : 'Long-tail';
            return (
              <div key={`${topic.name}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-black text-slate-900">{topic.name}</p>
                  <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-black text-primary shadow-sm">{priority}</span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(topic.Percentage, 100)}%` }} />
                  </div>
                  <span className="w-12 text-right text-sm font-black text-slate-700">{topic.Percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function AdminActionChecklist({ items }: { items: ActionItem[] }) {
  const toneClass = {
    blue: 'border-sky-100 bg-sky-50 text-[#2D82B5]',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
  };

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#2D82B5]">Action checklist</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Prioritas tindakan admin</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Checklist ini merangkum tindak lanjut yang paling masuk akal dari sinyal analitik tunggal.</p>
        </div>
        <Target className="h-5 w-5 text-[#2D82B5]" />
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className={`rounded-2xl border p-4 ${toneClass[item.tone]}`}>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
                {item.done ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              </span>
              <div>
                <p className="font-black text-slate-950">{item.label}</p>
                <p className="mt-1 text-sm font-semibold leading-6 opacity-80">{item.helper}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CompareAnalysisView({
  dA,
  dB,
  selectedA,
  selectedB,
  recommendationWinner,
  metricRows,
  biggestDelta,
  radarData,
  sentimentCompareData,
  mergedTopicData,
  mergedTrendData,
  onExport,
}: {
  dA?: DestinationAnalytics;
  dB?: DestinationAnalytics;
  selectedA?: DestinationOption;
  selectedB?: DestinationOption;
  recommendationWinner: DestinationAnalytics | null;
  metricRows: MetricRow[];
  biggestDelta: MetricRow | null;
  radarData: Array<{ subject: string; A: number; B: number; fullMark: number }>;
  sentimentCompareData: Array<{ name: string; Positif: number; Netral: number; Negatif: number }>;
  mergedTopicData: Array<{ name: string; A: number; B: number }>;
  mergedTrendData: Array<{ name: string; A?: number; B?: number }>;
  onExport: () => void;
}) {
  if (!dA || !dB) {
    return <EmptyState title="Pilih dua destinasi berbeda" description="Ringkasan pemenang, delta metrik, chart, dan tabel akan muncul di sini." />;
  }

  const winnerCards = [
    { label: 'Sentimen', value: sentimentRate(dA) >= sentimentRate(dB) ? dA.name : dB.name, helper: `${sentimentRate(dA)}% vs ${sentimentRate(dB)}%`, tone: 'emerald' as Tone, icon: Heart },
    { label: 'Rating User', value: (dA.rating.user || 0) >= (dB.rating.user || 0) ? dA.name : dB.name, helper: `${(dA.rating.user || 0).toFixed(1)} vs ${(dB.rating.user || 0).toFixed(1)}`, tone: 'amber' as Tone, icon: Star },
    { label: 'Skor AI', value: (dA.recommendation_score || 0) >= (dB.recommendation_score || 0) ? dA.name : dB.name, helper: `${(dA.recommendation_score || 0).toFixed(2)} vs ${(dB.recommendation_score || 0).toFixed(2)}`, tone: 'orange' as Tone, icon: TrendingUp },
    { label: 'Volume', value: sentimentTotal(dA) >= sentimentTotal(dB) ? dA.name : dB.name, helper: `${sentimentTotal(dA)} vs ${sentimentTotal(dB)} ulasan`, tone: 'blue' as Tone, icon: BarChart2 },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Executive summary</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950 md:text-3xl">
              {recommendationWinner ? `${recommendationWinner.name} unggul sebagai rekomendasi` : 'Kedua destinasi relatif seimbang'}
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
              Gunakan ringkasan pemenang, selisih terbesar, volume ulasan, dan tren positif untuk menentukan prioritas kurasi atau tindak lanjut admin.
            </p>
          </div>
          <button onClick={onExport} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-black text-white transition-colors hover:bg-primary/90">
            <Download className="h-4 w-4" />
            Ekspor CSV
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {winnerCards.map((card) => <MetricCard key={card.label} {...card} />)}
        </div>

        {biggestDelta && (
          <div className="mt-5 rounded-3xl border border-sky-100 bg-sky-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#2D82B5]">Selisih terbesar</p>
            <p className="mt-1 text-xl font-black text-slate-950">{biggestDelta.label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              {selectedA?.name || dA.name}: {formatMetric(biggestDelta.a, biggestDelta.format)} / {selectedB?.name || dB.name}: {formatMetric(biggestDelta.b, biggestDelta.format)}
            </p>
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(20rem,0.7fr)_minmax(0,1.3fr)]">
        <ChartCard title="Radar Performa" icon={Target}>
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name={dA.name} dataKey="A" stroke={DEST_A_COLOR} fill={DEST_A_COLOR} fillOpacity={0.3} strokeWidth={3} />
              <Radar name={dB.name} dataKey="B" stroke={DEST_B_COLOR} fill={DEST_B_COLOR} fillOpacity={0.25} strokeWidth={3} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontWeight: 700, fontSize: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Sentimen 100% Stacked" icon={Heart}>
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={sentimentCompareData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#0f172a', fontSize: 12, fontWeight: 800 }} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontWeight: 700, fontSize: '12px' }} />
              <Bar dataKey="Positif" stackId="a" fill="#10b981" radius={[6, 0, 0, 6]} />
              <Bar dataKey="Netral" stackId="a" fill="#94a3b8" />
              <Bar dataKey="Negatif" stackId="a" fill="#ef4444" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Topic Overlap" icon={Tags}>
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart layout="vertical" data={mergedTopicData} margin={{ top: 10, right: 16, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} width={96} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontWeight: 700, fontSize: '12px' }} />
              <Bar dataKey="A" name={dA.name} fill={DEST_A_COLOR} radius={[0, 6, 6, 0]} barSize={10} />
              <Bar dataKey="B" name={dB.name} fill={DEST_B_COLOR} radius={[0, 6, 6, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tren Rasio Positif" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <AreaChart data={mergedTrendData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="compareA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={DEST_A_COLOR} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={DEST_A_COLOR} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="compareB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={DEST_B_COLOR} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={DEST_B_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="A" name={dA.name} stroke={DEST_A_COLOR} strokeWidth={3} fill="url(#compareA)" />
              <Area type="monotone" dataKey="B" name={dB.name} stroke={DEST_B_COLOR} strokeWidth={3} fill="url(#compareB)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ActionableVarianceTable rows={metricRows} nameA={dA.name} nameB={dB.name} />
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, helper, tone }: { icon: ElementType; label: string; value: string; helper: string; tone: Tone }) {
  const toneClass = {
    orange: 'border-orange-100 bg-orange-50 text-primary',
    blue: 'border-sky-100 bg-sky-50 text-[#2D82B5]',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
    slate: 'border-slate-200 bg-white text-slate-700',
  }[tone];

  return (
    <article className={`rounded-[1.5rem] border p-5 shadow-sm ${toneClass}`}>
      <Icon className="mb-4 h-5 w-5" />
      <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-2 line-clamp-1 text-2xl font-black leading-none text-slate-950">{value}</p>
      <p className="mt-2 text-xs font-bold leading-5 opacity-80">{helper}</p>
    </article>
  );
}

function ChartCard({ title, icon: Icon, children, heightClass = 'h-[20rem]' }: { title: string; icon: ElementType; children: ReactNode; heightClass?: string }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-black text-slate-950">{title}</h3>
        </div>
      </div>
      <p className="sr-only">{title} ditampilkan sebagai chart untuk membantu admin membaca pola data.</p>
      <div className={heightClass}>{children}</div>
    </section>
  );
}

function ActionableVarianceTable({ rows, nameA, nameB }: { rows: MetricRow[]; nameA: string; nameB: string }) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Actionable variance table</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Perbandingan Metrik Detail</h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="sticky left-0 bg-slate-50 p-4">Metrik</th>
              <th className="p-4 text-primary">{nameA}</th>
              <th className="p-4 text-[#2D82B5]">{nameB}</th>
              <th className="p-4 text-right">Delta</th>
              <th className="p-4 text-right">Pemenang</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const Icon = row.icon;
              const delta = row.a - row.b;
              const winner = delta >= 0 ? nameA : nameB;
              return (
                <tr key={row.label} className="hover:bg-slate-50/70">
                  <td className="sticky left-0 bg-white p-4 font-black text-slate-800">
                    <span className="inline-flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      {row.label}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-700">{formatMetric(row.a, row.format)}</td>
                  <td className="p-4 font-bold text-slate-700">{formatMetric(row.b, row.format)}</td>
                  <td className={`p-4 text-right font-black ${delta >= 0 ? 'text-primary' : 'text-[#2D82B5]'}`}>
                    {delta > 0 ? '+' : ''}{formatMetric(delta, row.format)}
                  </td>
                  <td className="p-4 text-right">
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${delta >= 0 ? 'bg-orange-50 text-primary' : 'bg-sky-50 text-[#2D82B5]'}`}>
                      {winner}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <section className="flex min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-200 bg-white p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-primary">
        <GitCompare className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm font-semibold leading-7 text-slate-500">{description}</p>
    </section>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6" aria-label="Memuat compare analytics">
      <div className="h-36 animate-pulse rounded-[1.75rem] bg-orange-100/70" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-32 animate-pulse rounded-[1.5rem] bg-white ring-1 ring-slate-200" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-[1.75rem] bg-white ring-1 ring-slate-200" />
        <div className="h-80 animate-pulse rounded-[1.75rem] bg-white ring-1 ring-slate-200" />
      </div>
    </div>
  );
}
