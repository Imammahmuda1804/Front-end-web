'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRightLeft, BarChart2 } from 'lucide-react';

import { adminDestinationService } from '@/services/admin/destination.service';
import {
  adminAnalyticsService,
  DestinationAnalytics,
  TopicData,
  TrendData,
} from '@/services/admin/analytics.service';
import { AnalyticsSkeleton } from './admin-compare.skeleton';
import { DestinationSelect } from './admin-compare.panels';
import { SingleAnalysisView } from './admin-compare.single';
import { cleanTopicName, formatMonth } from './admin-compare.utils';
import type { DestinationOption } from './admin-compare.types';

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== 'object' || error === null) return fallback;
  const maybeError = error as { response?: { data?: { message?: string } }; message?: string };
  return maybeError.response?.data?.message || maybeError.message || fallback;
}

export function AdminSingleAnalysisClient() {
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [destinationId, setDestinationId] = useState<number | ''>('');
  const [singleData, setSingleData] = useState<DestinationAnalytics | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [topics, setTopics] = useState<TopicData[]>([]);
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
          setDestinationId((current) => current || list[0]?.id || '');
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
      if (!destinationId) return;
      setLoading(true);
      setErrorMessage(null);
      try {
        const [analytics, trends, topicResult] = await Promise.all([
          adminAnalyticsService.getDestinationAnalytics(Number(destinationId)),
          adminAnalyticsService.getDestinationTrends(Number(destinationId), 'monthly'),
          adminAnalyticsService.getDestinationTopics(Number(destinationId)),
        ]);
        if (!cancelled) {
          setSingleData(analytics);
          setTrendData(trends);
          setTopics(topicResult);
        }
      } catch (error) {
        if (!cancelled) setErrorMessage(getErrorMessage(error, 'Gagal memuat analitik destinasi.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchData();
    return () => {
      cancelled = true;
    };
  }, [destinationId]);

  const pieData = useMemo(() => {
    if (!singleData) return [];
    return [
      { name: 'Positif', value: singleData.sentiment.positive || 0 },
      { name: 'Netral', value: singleData.sentiment.neutral || 0 },
      { name: 'Negatif', value: singleData.sentiment.negative || 0 },
    ];
  }, [singleData]);

  const singleTrendData = useMemo(
    () => trendData.map((trend) => ({
      name: formatMonth(trend.date),
      year: getYearLabel(trend.date),
      Positif: trend.positive,
      Netral: trend.neutral,
      Negatif: trend.negative,
      PosRate: Math.round((trend.positive / ((trend.positive + trend.negative + trend.neutral) || 1)) * 100),
    })),
    [trendData],
  );

  const topicData = useMemo(
    () => topics.slice(0, 7).map((topic) => ({ name: cleanTopicName(topic.topic_name), Percentage: Math.round(topic.percentage) })),
    [topics],
  );

  const completeness = useMemo(() => {
    if (!singleData) return 0;
    const checks = [
      singleData.positive_ratio !== null,
      singleData.recommendation_score !== null,
      Boolean(singleData.rating.google || singleData.rating.user),
      trendData.length > 0,
      topics.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [singleData, topics.length, trendData.length]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-orange-100 bg-orange-50/70 p-6 shadow-sm shadow-orange-100/50">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-primary shadow-sm">
              <BarChart2 className="h-3.5 w-3.5" />
              Analitik Detail
            </p>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Analitik Detail Destinasi</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-600 md:text-base">
              Baca kesehatan satu destinasi: kualitas sinyal, risiko sentimen, tren, topik prioritas, dan tindakan dinas yang paling relevan.
            </p>
          </div>
          <Link
            href="/admin/compare"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-sky-100 bg-white px-5 text-sm font-black text-ai transition hover:border-ai"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Bandingkan destinasi
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <DestinationSelect
            label="Pilih Destinasi"
            value={destinationId}
            destinations={destinations}
            tone="orange"
            onChange={setDestinationId}
          />
          <p className="text-sm font-semibold text-slate-500">
            Data akan dimuat otomatis setelah destinasi dipilih.
          </p>
        </div>
      </section>

      {errorMessage && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-800">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <AnalyticsSkeleton />
      ) : (
        <SingleAnalysisView
          data={singleData}
          pieData={pieData}
          trendData={singleTrendData}
          topicData={topicData}
          topics={topics}
          completeness={completeness}
        />
      )}
    </div>
  );
}

function getYearLabel(date: string) {
  const parsed = new Date(date);
  if (!Number.isNaN(parsed.getTime())) return String(parsed.getFullYear());

  const matchedYear = date.match(/\b\d{4}\b/)?.[0];
  return matchedYear || '';
}

