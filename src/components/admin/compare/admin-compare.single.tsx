'use client';

import dynamic from 'next/dynamic';
import { BarChart2, CheckCircle2, Heart, Star, Tags, ThumbsUp, TrendingUp } from 'lucide-react';
import type { DestinationAnalytics, TopicData } from '@/services/admin/analytics.service';
import { cleanTopicName, formatSigned, percent, sentimentRate, sentimentTotal } from './admin-compare.utils';
import {
  buildSituationCards,
  buildOperationalSignals,
  getTrendYearRange,
} from './admin-compare.single.utils';
import { ChartCard, ChartLoading, EmptyState, MetricCard } from './admin-compare.single.ui';
import {
  AdminActionChecklist,
  MonthlySituationPanel,
  OperationalSignalsPanel,
  SentimentRiskPanel,
  SignalHealthPanel,
  SituationOverviewPanel,
  TopicPriorityPanel,
  TopicSituationPanel,
  TrendDeltaCard,
  type ActionItem,
} from './admin-compare.single.panels';

const SentimentPieChart = dynamic(
  () => import('./admin-compare.single.charts').then((module) => module.SentimentPieChart),
  { ssr: false, loading: () => <ChartLoading /> },
);
const TopicBarChartPanel = dynamic(
  () => import('./admin-compare.single.charts').then((module) => module.TopicBarChartPanel),
  { ssr: false, loading: () => <ChartLoading /> },
);
const MonthlySentimentLineChart = dynamic(
  () => import('./admin-compare.single.charts').then((module) => module.MonthlySentimentLineChart),
  { ssr: false, loading: () => <ChartLoading /> },
);
export function SingleAnalysisView({
  data,
  pieData,
  trendData,
  topicData,
  topics,
  completeness,
}: {
  data: DestinationAnalytics | null;
  pieData: Array<{ name: string; value: number }>;
  trendData: Array<{ name: string; year?: string; Positif: number; Netral: number; Negatif: number; PosRate: number }>;
  topicData: Array<{ name: string; Percentage: number }>;
  topics: TopicData[];
  completeness: number;
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
  const positiveRatio = sentimentRate(data);
  const situationCards = buildSituationCards({
    positiveRatio,
    negativeRatio,
    negativeDelta,
    trendDelta,
    totalReviews,
    topicCount: topics.length,
    trendCount: trendData.length,
    completeness,
  });
  const operationalSignals = buildOperationalSignals({
    positiveRatio,
    negativeRatio,
    trendDelta,
    negativeDelta,
    totalReviews,
    topicCount: topics.length,
    completeness,
  });
  const topicSignals = topics.slice(0, 6).map((topic) => ({
    name: cleanTopicName(topic.topic_name),
    reviews: topic.total_reviews,
    percentage: Math.round(topic.percentage),
  }));
  const trendYearRange = getTrendYearRange(trendData);
  const actionItems = [
    {
      label: riskLabel === 'Risiko tinggi' ? 'Audit review negatif terbaru' : 'Pantau sentimen negatif',
      helper: `${negativeRatio}% negatif`,
      tone: riskLabel === 'Risiko tinggi' ? 'rose' : 'amber',
      done: riskLabel === 'Risiko rendah',
    },
    {
      label: topics.length > 0 ? `Validasi topik: ${cleanTopicName(topics[0].topic_name)}` : 'Lengkapi pemetaan topik',
      helper: topics.length > 0 ? 'Prioritas konten' : 'Belum ada topik',
      tone: topics.length > 0 ? 'blue' : 'amber',
      done: topics.length > 0,
    },
    {
      label: trendData.length > 1 ? 'Review perubahan tren bulanan' : 'Kumpulkan tren bulanan',
      helper: trendData.length > 1 ? `Delta ${formatSigned(trendDelta, '%')}` : 'Butuh tren',
      tone: trendDelta < 0 ? 'rose' : 'emerald',
      done: trendData.length > 1 && trendDelta >= 0,
    },
    {
      label: completeness >= 80 ? 'Data siap untuk keputusan admin' : 'Perkuat kelengkapan data',
      helper: `${completeness}% lengkap`,
      tone: completeness >= 80 ? 'emerald' : 'amber',
      done: completeness >= 80,
    },
  ] satisfies ActionItem[];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Rasio Positif" value={`${percent(data.positive_ratio)}%`} helper="Ulasan positif" icon={Heart} tone="emerald" />
        <MetricCard label="Rating User" value={(data.rating.user || 0).toFixed(1)} helper="Skala 1-5" icon={Star} tone="amber" />
        <MetricCard label="Skor AI" value={(data.recommendation_score || 0).toFixed(2)} helper="Sinyal rekomendasi" icon={ThumbsUp} tone="orange" />
        <MetricCard label="Volume Ulasan" value={String(sentimentTotal(data))} helper="Terkelas" icon={BarChart2} tone="blue" />
        <MetricCard label="Kelengkapan" value={`${completeness}%`} helper="Tren, topik, rating" icon={CheckCircle2} tone="slate" />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Ruang situasi destinasi</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{data.name}</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
              Ringkasan operasional untuk membaca kesehatan sinyal, risiko sentimen, perubahan tren, dan topik yang paling layak diprioritaskan.
            </p>
          </div>
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
        <SituationOverviewPanel cards={situationCards} />
        <MonthlySituationPanel
          latestMonth={latestTrend?.name}
          latestVolume={latestVolume}
          positiveRate={latestTrend?.PosRate}
          negativeRate={latestTrend ? negativeLatestRate : undefined}
          volumeDelta={trendData.length > 1 ? volumeDelta : null}
          positiveDelta={trendData.length > 1 ? trendDelta : null}
          negativeDelta={trendData.length > 1 ? negativeDelta : null}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
        <TopicSituationPanel topics={topicSignals} />
        <OperationalSignalsPanel signals={operationalSignals} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <TopicPriorityPanel topics={priorityTopics} />
        <AdminActionChecklist items={actionItems} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(18rem,0.6fr)_minmax(0,1.4fr)]">
        <ChartCard title="Distribusi Sentimen" icon={Heart}>
          <SentimentPieChart data={pieData} />
        </ChartCard>

        <ChartCard title="Topik Teratas" icon={Tags}>
          <TopicBarChartPanel data={topicData} />
        </ChartCard>
      </div>

      <ChartCard title="Tren Sentimen Bulanan per Sentimen" icon={TrendingUp} heightClass="h-[22rem]">
        <div className="flex h-full flex-col">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-600">Garis menunjukkan jumlah ulasan per sentimen pada tiap bulan.</p>
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-700">
              {trendYearRange}
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <MonthlySentimentLineChart data={trendData} />
          </div>
        </div>
      </ChartCard>
    </div>
  );
}





