import { Landmark, Utensils, Waves } from 'lucide-react';

export const quickPrompts = [
  { label: 'Pantai tenang', query: 'pantai tenang untuk keluarga', mode: 'semantic', icon: Waves, tone: 'text-ai bg-ai-container border-ai/15' },
  { label: 'Wisata budaya', query: 'wisata budaya Minangkabau', mode: 'semantic', icon: Landmark, tone: 'text-explore bg-explore-container border-explore/15' },
  { label: 'Kuliner lokal', query: 'kuliner lokal yang ramai dibahas', mode: 'semantic', icon: Utensils, tone: 'text-success bg-success-container border-success/15' },
] as const;

export type QuickPrompt = (typeof quickPrompts)[number];
