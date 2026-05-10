import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import DestinationDetailClient from '@/components/destinations/DestinationDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/destinations/slug/${slug}`, {
      next: { revalidate: 3600 },
    });
    const { data } = await res.json();
    
    if (!data) return { title: 'Destination Not Found' };
    
    return {
      title: `${data.name} | RanahInsight`,
      description: data.description || `Jelajahi ${data.name} di ${data.city}, ${data.province}`,
      openGraph: {
        images: [data.thumbnailUrl || data.thumbnail_url || ''],
      }
    };
  } catch (error) {
    return { title: 'Destination Detail' };
  }
}

async function getDestination(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/destinations/slug/${slug}`, {
    next: { revalidate: 3600, tags: [`destination-${slug}`] },
  });
  
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch destination');
  }
  
  const { data } = await res.json();
  return data;
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const destination = await getDestination(slug);

  if (!destination) {
    notFound();
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-medium animate-pulse">Memuat destinasi...</p>
        </div>
      </div>
    }>
      <DestinationDetailClient destination={destination} />
    </Suspense>
  );
}
