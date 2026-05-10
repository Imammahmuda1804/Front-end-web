import { CompareClient } from '@/components/admin/compare/CompareClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Analytics | VibeTravel Admin',
  description: 'Analyze and compare sentiment trends, review volume, and key performance metrics across multiple destinations.',
};

export default function ComparePage() {
  return (
    <div className="flex-1 w-full">
      <CompareClient />
    </div>
  );
}
