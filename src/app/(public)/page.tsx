import { HeroSection } from '@/components/home/HeroSection';
import { TrendingCarousel } from '@/components/home/TrendingCarousel';
import { InfoSection } from '@/components/home/InfoSection';
import { BentoGrid } from '@/components/home/BentoGrid';
import { destinationService } from '@/features/destination/services/destination.service';

// Revalidasi halaman setiap 60 detik.
export const revalidate = 60;

export default async function Home() {
  const recommendationsRes = await destinationService.getServerRecommendations();
  const destinations = recommendationsRes?.data || [];

  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />
      <TrendingCarousel destinations={destinations} />
      <InfoSection />
      <BentoGrid />
    </main>
  );
}
