import { Compass, MapPinned, Route as RouteIcon } from 'lucide-react';
import Link from 'next/link';
import { type SearchDestination } from '@/components/search/SearchResultCard';
import { SearchResultCardStatic } from '@/components/search/SearchResultCardStatic';

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
        <div className="overflow-hidden rounded-xl border border-orange-100 bg-orange-50/85 p-6 shadow-sm shadow-orange-100/60 md:p-8">
          <p className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-primary shadow-sm">
            <MapPinned className="h-4 w-4" />
            Katalog Destinasi
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Semua destinasi</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-600">
                Jelajahi seluruh destinasi yang sudah tersedia, lalu buka detail, bandingkan, atau susun rute kunjungan.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/search"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-orange-200 bg-white px-5 text-sm font-black text-primary"
              >
                <Compass className="h-4 w-4" />
                Cari dengan filter
              </Link>
              <Link
                href="/routes"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-black text-white"
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
            {destinations.map((destination) => (
              <SearchResultCardStatic
                key={destination.id}
                destination={destination}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
