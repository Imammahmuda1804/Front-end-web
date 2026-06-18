import type { ElementType } from 'react';

export type SortKey = 'name' | 'destinations' | 'id';
export type SortDir = 'asc' | 'desc';
export type QuickFilter = 'all' | 'unnamed' | 'dominant' | 'longtail' | 'noKeywords';
export type Tone = 'orange' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';

export type TopicStatus = {
  label: 'Perlu nama' | 'Dominan' | 'Topik kecil' | 'Normal';
  tone: Tone;
};

export type DistributionBucket = {
  name: string;
  count: number;
};

export type ActionItem = {
  label: string;
  helper: string;
  value: string;
  tone: Extract<Tone, 'orange' | 'blue' | 'emerald' | 'amber' | 'rose'>;
  icon: ElementType;
  onClick?: () => void;
};
