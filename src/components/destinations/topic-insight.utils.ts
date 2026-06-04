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

export function cleanTopicName(name?: string) {
  return name?.replace(/^Topic \d+:\s*/, '').trim() || 'Topik perjalanan';
}
