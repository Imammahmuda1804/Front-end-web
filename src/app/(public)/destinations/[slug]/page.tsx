import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import DestinationDetailClient from '@/features/destination';
import { destinationService } from '@/features/destination/services/destination.service';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data = await destinationService.getServerDestinationBySlug(slug);

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

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const destination = await destinationService.getServerDestinationBySlug(slug);

  if (!destination) {
    notFound();
  }

  return <DestinationDetailClient destination={destination} />;
}
