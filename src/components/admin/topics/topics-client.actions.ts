import { Database, Layers3, Sparkles, Target } from 'lucide-react';

import type { ActionItem, QuickFilter } from './topics-client.types';

type TopicMetrics = {
  unnamed: unknown[];
  dominant: unknown[];
  longTail: unknown[];
  withoutKeywords: unknown[];
};

export function buildTopicActionItems(
  metrics: TopicMetrics,
  setQuickFilter: (filter: QuickFilter) => void,
): ActionItem[] {
  return [
    {
      label: 'Selesaikan naming debt',
      helper: metrics.unnamed.length > 0 ? 'Perlu rename' : 'Aman',
      value: String(metrics.unnamed.length),
      tone: metrics.unnamed.length > 0 ? 'amber' : 'emerald',
      icon: Sparkles,
      onClick: metrics.unnamed.length > 0 ? () => setQuickFilter('unnamed') : undefined,
    },
    {
      label: 'Pantau topik dominan',
      helper: metrics.dominant.length > 0 ? 'Cek cakupan' : 'Merata',
      value: String(metrics.dominant.length),
      tone: metrics.dominant.length > 0 ? 'orange' : 'emerald',
      icon: Target,
      onClick: metrics.dominant.length > 0 ? () => setQuickFilter('dominant') : undefined,
    },
    {
      label: 'Rapikan long-tail',
      helper: metrics.longTail.length > 0 ? 'Cek merge' : 'Aman',
      value: String(metrics.longTail.length),
      tone: metrics.longTail.length > 0 ? 'blue' : 'emerald',
      icon: Layers3,
      onClick: metrics.longTail.length > 0 ? () => setQuickFilter('longtail') : undefined,
    },
    {
      label: 'Lengkapi keyword',
      helper: metrics.withoutKeywords.length > 0 ? 'Perlu keyword' : 'Lengkap',
      value: String(metrics.withoutKeywords.length),
      tone: metrics.withoutKeywords.length > 0 ? 'rose' : 'emerald',
      icon: Database,
      onClick: metrics.withoutKeywords.length > 0 ? () => setQuickFilter('noKeywords') : undefined,
    },
  ];
}
