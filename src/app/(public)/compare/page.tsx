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
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-medium animate-pulse">Memuat data destinasi...</p>
        </div>
      </div>
    }>
      <CompareClient availableDestinations={destinations} />
    </Suspense>
  );
}
