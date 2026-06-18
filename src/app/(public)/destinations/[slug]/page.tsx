import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import DestinationDetailClient from '@/features/destination';

interface Props {
  params: Promise<{ slug: string }>;
}

function getServerApiUrl() {
  return process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const res = await fetch(`${getServerApiUrl()}/api/destinations/slug/${slug}`, {
      next: { revalidate: 120, tags: [`destination-${slug}`] },
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
  } catch {
    return { title: 'Destination Detail' };
  }
}

async function getDestination(slug: string) {
  const apiUrl = getServerApiUrl();
  const res = await fetch(`${apiUrl}/api/destinations/slug/${slug}`, {
    next: { revalidate: 120, tags: [`destination-${slug}`] },
  });
  
  if (!res.ok) {
    if (res.status === 404 && /^\d+$/.test(slug)) {
      const idRes = await fetch(`${apiUrl}/api/destinations/${slug}`, {
        next: { revalidate: 120, tags: [`destination-${slug}`] },
      });
      if (!idRes.ok) return null;
      const { data: fallbackData } = await idRes.json();
      return fallbackData;
    }
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

  return <DestinationDetailClient destination={destination} />;
}
