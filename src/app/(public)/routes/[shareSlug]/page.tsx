import { RouteDetailClient } from '@/components/routes/RouteDetailClient';

type Props = {
  params: Promise<{ shareSlug: string }>;
};

export default async function RouteDetailPage({ params }: Props) {
  const { shareSlug } = await params;
  return <RouteDetailClient shareSlug={shareSlug} />;
}
