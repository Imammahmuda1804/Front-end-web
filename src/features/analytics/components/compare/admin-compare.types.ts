import type { ElementType } from 'react';

export type Tone = 'orange' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';

export type DestinationOption = {
  id: number;
  name: string;
  city?: string | null;
  category?: string | null;
};

export type MetricRow = {
  label: string;
  a: number;
  b: number;
  format: 'percent' | 'rating' | 'score' | 'count';
  icon: ElementType;
};
