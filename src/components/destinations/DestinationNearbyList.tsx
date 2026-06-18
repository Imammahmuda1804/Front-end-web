import Link from 'next/link';

import type { NearbyDestination } from './detail.types';

export function DestinationNearbyList({
  destinations,
}: {
  destinations: Array<NearbyDestination & { distance: number }>;
}) {
  if (destinations.length === 0) return null;

  return (
    <div className="rounded-lg border border-sky-100 bg-sky-50/60 p-6 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">Destinasi terdekat</h2>
      <div className="mt-4 space-y-3">
        {destinations.map((item) => (
          <Link
            key={item.id}
            href={`/destinations/${item.slug}`}
            className="block rounded-lg border border-sky-100 bg-white p-4 transition hover:border-ai/30 hover:text-ai"
          >
            <p className="font-black text-slate-900">{item.name}</p>
            <p className="mt-1 text-sm font-bold text-slate-500">{item.distance.toFixed(1)} km dari sini</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
