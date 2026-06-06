import { Compass, MapPinned, Route as RouteIcon } from 'lucide-react';
import Link from 'next/link';
import { type SearchDestination } from '@/components/search/SearchResultCard';
import { DestinationCatalogCard } from '@/components/destinations/DestinationCatalogCard';

export const metadata = {
  title: 'Semua Destinasi - RANAHINSIGHT',
  description: 'Lihat seluruh destinasi wisata yang tersedia di RANAHINSIGHT.',
};

export const revalidate = 300;

function getServerApiUrl() {
  return process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}

async function getDestinations() {
  try {
    const response = await fetch(`${getServerApiUrl()}/api/destinations?limit=100`, {
      next: { revalidate: 300, tags: ['all-destinations'] },
    });

    if (!response.ok) return [];
    const json = await response.json();
    return (json?.data || []) as SearchDestination[];
  } catch {
    return [];
  }
}

export default async function DestinationsPage() {
  const destinations = await getDestinations();

  return (
    <main className="min-h-screen pt-24 pb-14">
      <section className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="border-b border-slate-300/70 pb-8 pt-4">
          <p className="editorial-kicker inline-flex items-center gap-2">
            <MapPinned className="h-4 w-4" />
            Katalog Destinasi
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">Semua destinasi</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-600 md:text-base">
                Jelajahi seluruh destinasi yang sudah tersedia, lalu buka detail, bandingkan, atau susun rute kunjungan.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/search"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white/80 px-5 text-sm font-bold text-slate-800 transition-colors hover:border-primary hover:text-primary"
              >
                <Compass className="h-4 w-4" />
                Cari dengan filter
              </Link>
              <Link
                href="/routes"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary/90"
              >
                <RouteIcon className="h-4 w-4" />
                Lihat rute
              </Link>
            </div>
          </div>
        </div>

        {destinations.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500">
            Belum ada destinasi yang bisa ditampilkan.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {destinations.map((destination, index) => (
              <DestinationCatalogCard
                key={destination.id}
                destination={destination}
                index={index}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
