import type { DestinationAnalytics } from '@/services/admin/analytics.service';
import type { MetricRow } from './admin-compare.types';

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

export function sentimentTotal(destination: DestinationAnalytics) {
  return (
    (destination.sentiment.positive || 0) +
    (destination.sentiment.negative || 0) +
    (destination.sentiment.neutral || 0)
  );
}

export function sentimentRate(destination: DestinationAnalytics) {
  const total = sentimentTotal(destination);
  return total > 0 ? Math.round(((destination.sentiment.positive || 0) / total) * 100) : 0;
}

export function percent(value: number | null | undefined) {
  return Math.round((value ?? 0) * 100);
}
