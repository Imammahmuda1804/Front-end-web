import { Minus, ThumbsDown, ThumbsUp } from 'lucide-react';

import type { SentimentBreakdown } from './topic-insight.types';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function getSentimentColor(breakdown: SentimentBreakdown | undefined) {
  if (!breakdown) return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: 'Belum Ada Data', icon: Minus };
  const total = breakdown.positive + breakdown.negative + breakdown.neutral;
  if (total === 0) return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: 'Belum Ada Data', icon: Minus };
  const positiveRatio = breakdown.positive / total;
  if (positiveRatio >= 0.65) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', label: 'Mayoritas Positif', icon: ThumbsUp };
  if (positiveRatio <= 0.35) return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', label: 'Mayoritas Negatif', icon: ThumbsDown };
  return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', label: 'Campuran', icon: Minus };
}

export function getSentimentPercentages(breakdown: SentimentBreakdown | undefined) {
  const total = breakdown ? breakdown.positive + breakdown.negative + breakdown.neutral : 0;
  if (!breakdown || total === 0) {
    return { positive: 0, neutral: 0, negative: 0 };
  }

  return {
    positive: Math.round((breakdown.positive / total) * 100),
    neutral: Math.round((breakdown.neutral / total) * 100),
    negative: Math.round((breakdown.negative / total) * 100),
  };
}

export function getSentimentTotal(breakdown: SentimentBreakdown | undefined) {
  return breakdown ? breakdown.positive + breakdown.negative + breakdown.neutral : 0;
}

export function getDominantSentiment(breakdown: SentimentBreakdown | undefined) {
  if (!breakdown || getSentimentTotal(breakdown) === 0) {
    return { key: 'unknown', label: 'Belum cukup data', count: 0 };
  }

  const entries = [
    { key: 'positive', label: 'Positif', count: breakdown.positive },
    { key: 'neutral', label: 'Netral', count: breakdown.neutral },
    { key: 'negative', label: 'Negatif', count: breakdown.negative },
  ].sort((a, b) => b.count - a.count);

  return entries[0];
}

export function getSentimentBucket(breakdown: SentimentBreakdown | undefined) {
  const percentages = getSentimentPercentages(breakdown);
  if (percentages.positive >= 60) return 'positive';
  if (percentages.negative >= 45) return 'negative';
  return 'mixed';
}

export function getSentimentCrowd(breakdown: SentimentBreakdown | undefined) {
  const percentages = getSentimentPercentages(breakdown);
  if (!breakdown) return { label: 'Belum terbaca', tone: 'bg-slate-50 text-slate-600 border-slate-200', icon: Minus };
  if (percentages.positive >= 60) return { label: 'Condong positif', tone: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: ThumbsUp };
  if (percentages.negative >= 45) return { label: 'Condong negatif', tone: 'bg-red-50 text-red-600 border-red-100', icon: ThumbsDown };
  if (percentages.neutral >= 50) return { label: 'Cenderung netral', tone: 'bg-slate-50 text-slate-600 border-slate-200', icon: Minus };
  return { label: 'Sentimen campuran', tone: 'bg-amber-50 text-amber-700 border-amber-100', icon: Minus };
}

export { cleanTopicName } from '@/lib/utils';

export function topicDecisionCopy(topicName: string, breakdown: SentimentBreakdown | undefined) {
  const percentages = getSentimentPercentages(breakdown);
  const total = getSentimentTotal(breakdown);

  if (total === 0) {
    return {
      headline: 'Data belum cukup kuat',
      detail: `${topicName} sudah terdeteksi, tetapi belum punya cukup ulasan untuk disimpulkan.`,
    };
  }

  if (percentages.positive >= 60) {
    return {
      headline: 'Bisa jadi alasan utama berkunjung',
      detail: `${topicName} cenderung dipuji pengunjung. Cocok dijadikan pertimbangan positif saat memilih destinasi.`,
    };
  }

  if (percentages.negative >= 45) {
    return {
      headline: 'Perlu dicek sebelum berangkat',
      detail: `${topicName} cukup sering muncul dalam ulasan negatif. Baca contoh ulasan untuk memahami konteksnya.`,
    };
  }

  if (percentages.neutral >= 50) {
    return {
      headline: 'Belum menunjukkan arah kuat',
      detail: `${topicName} banyak muncul sebagai informasi netral. Gunakan bersama rating, foto, dan ulasan terbaru.`,
    };
  }

  return {
    headline: 'Pendapat pengunjung beragam',
    detail: `${topicName} punya sinyal campuran. Cocok dibaca lebih detail karena pengalaman tiap pengunjung bisa berbeda.`,
  };
}
