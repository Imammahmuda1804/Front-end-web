import { Compass, MapPinned, Route as RouteIcon } from 'lucide-react';
import Link from 'next/link';
import { DestinationCatalogCard } from '@/features/destination';
import { destinationService } from '@/features/destination/services/destination.service';

export const metadata = {
  title: 'Semua Destinasi - RANAHINSIGHT',
  description: 'Lihat seluruh destinasi wisata yang tersedia di RANAHINSIGHT.',
};

export const revalidate = 300;

export default async function DestinationsPage() {
  const destinations = await destinationService.getServerDestinations();

  return (
    <main className="min-h-screen pt-24 pb-14">
      <section className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="border-b border-border pb-8 pt-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
            <MapPinned className="h-4 w-4" />
            Katalog Destinasi
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-orange-300 md:text-6xl">Semua destinasi</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-white md:text-base">
                Jelajahi seluruh destinasi yang sudah tersedia, lalu buka detail, bandingkan, atau susun rute kunjungan.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/search"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Compass className="h-4 w-4" />
                Cari dengan filter
              </Link>
              <Link
                href="/routes"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <RouteIcon className="h-4 w-4" />
                Lihat rute
              </Link>
            </div>
          </div>
        </div>

        {destinations.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-border bg-muted/50 p-10 text-center text-sm font-medium text-muted-foreground shadow-sm">
            Belum ada destinasi yang bisa ditampilkan.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
