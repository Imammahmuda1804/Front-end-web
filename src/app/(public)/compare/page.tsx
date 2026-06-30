import { Suspense } from 'react';
import { Metadata } from 'next';
import CompareClient from '@/features/comparison';
import { comparisonService } from '@/features/comparison/services/comparison.service';

export const metadata: Metadata = {
  title: 'Bandingkan Destinasi | RanahInsight',
  description: 'Bandingkan dua destinasi wisata pilihan Anda dan temukan tempat yang paling cocok dengan kebutuhan perjalanan.',
};

export const dynamic = 'force-dynamic';

export default async function ComparePage() {
  const destinations = await comparisonService.getAllDestinationsForCompare();

  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center pt-24 pb-12">
        <div className="flex flex-col items-center" aria-live="polite" aria-busy="true">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" aria-hidden="true"></div>
          <p className="mt-4 text-sm font-medium text-muted-foreground">Memuat data destinasi...</p>
        </div>
      </div>
    }>
      <CompareClient availableDestinations={destinations} />
    </Suspense>
  );
}
