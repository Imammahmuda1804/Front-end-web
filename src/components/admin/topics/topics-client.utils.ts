import type { TopicItem } from '@/services/admin/topic.service';
import type { QuickFilter, TopicStatus } from './topics-client.types';

// Mengecek topik yang masih memakai nama fallback.
export function isUnnamed(topic: TopicItem) {
  return topic.topic_name.trim().toLowerCase().startsWith('topic ');
}

export function getTopicStatus(topic: TopicItem, maxDestinations: number): TopicStatus {
  if (isUnnamed(topic)) return { label: 'Perlu nama AI', tone: 'amber' };
  if (maxDestinations > 0 && topic.total_destinations >= Math.max(10, maxDestinations * 0.6)) {
    return { label: 'Dominan', tone: 'orange' };
  }
  if (topic.total_destinations <= 1) return { label: 'Long-tail', tone: 'blue' };
  return { label: 'Normal', tone: 'emerald' };
}

export function getCoverageBucket(topic: TopicItem) {
  if (topic.total_destinations <= 1) return '0-1';
  if (topic.total_destinations <= 5) return '2-5';
  if (topic.total_destinations <= 10) return '6-10';
  return '>10';
}

export function topicMatchesFilter(topic: TopicItem, filter: QuickFilter, maxDestinations: number) {
  if (filter === 'all') return true;
  if (filter === 'unnamed') return isUnnamed(topic);
  if (filter === 'dominant') return getTopicStatus(topic, maxDestinations).label === 'Dominan';
  if (filter === 'longtail') return topic.total_destinations <= 1;
  return !topic.keywords || topic.keywords.length === 0;
}

export function formatAverage(value: number) {
  return Number.isFinite(value) ? value.toFixed(1) : '0.0';
}
