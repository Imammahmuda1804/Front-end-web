import { CompareClient } from '@/components/admin/compare/CompareClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Analytics | RANAHINSIGHT Admin',
  description: 'Analisis dan perbandingan tren sentimen, volume ulasan, dan metrik performa destinasi.',
};

export default function ComparePage() {
  return (
    <div className="flex-1 w-full">
      <CompareClient />
    </div>
  );
}
