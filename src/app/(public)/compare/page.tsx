import { Suspense } from 'react';
import { Metadata } from 'next';
import CompareClient from '@/components/compare/CompareClient';

export const metadata: Metadata = {
  title: 'Bandingkan Destinasi | RanahInsight',
  description: 'Bandingkan dua destinasi wisata pilihan Anda dan temukan yang paling cocok dengan preferensi Vibe Anda.',
};

async function getAllDestinations() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/destinations?limit=100`, {
      next: { revalidate: 3600, tags: ['all-destinations'] },
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch destinations');
    }
    
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('Error fetching all destinations:', error);
    return [];
  }
}

export default async function ComparePage() {
  const destinations = await getAllDestinations();

  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center pt-24 pb-12">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="on-photo-copy mt-4 font-semibold animate-pulse">Memuat data destinasi...</p>
        </div>
      </div>
    }>
      <CompareClient availableDestinations={destinations} />
    </Suspense>
  );
}
