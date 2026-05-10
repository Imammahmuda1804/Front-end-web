import { HeroSection } from '@/components/home/HeroSection';
import { TrendingCarousel } from '@/components/home/TrendingCarousel';
import { InfoSection } from '@/components/home/InfoSection';
import { BentoGrid } from '@/components/home/BentoGrid';

// Revalidate this page every 60 seconds
export const revalidate = 60;

async function getRecommendations() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/api/destinations/recommendations?limit=7`, {
      next: { revalidate: 60 },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch recommendations: ${res.status} ${res.statusText}`);
      return { data: [] };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return { data: [] };
  }
}

export default async function Home() {
  const recommendationsRes = await getRecommendations();
  const destinations = recommendationsRes?.data || [];

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <HeroSection />
      
      {/* Hanya tampilkan carousel jika data tersedia */}
      {destinations && destinations.length > 0 && (
        <TrendingCarousel destinations={destinations} />
      )}
      
      <InfoSection />
      <BentoGrid />
    </main>
  );
}
