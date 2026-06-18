'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, MapPin, Navigation, Route as RouteIcon } from 'lucide-react';
import { TravelRoute } from '@/services/routes.service';
import { getImageUrl } from '@/lib/utils';

export function formatRouteDuration(minutes?: number | null) {
  if (!minutes) return '-';
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (hours <= 0) return `${remaining} menit`;
  return remaining > 0 ? `${hours} jam ${remaining} menit` : `${hours} jam`;
}

export function RouteCard({ route }: { route: TravelRoute }) {
  const firstStop = route.stops?.[0];
  const image = firstStop?.destination?.thumbnailUrl
    ? getImageUrl(firstStop.destination.thumbnailUrl)
    : '/images/auth-bg.jpg';
  const href = `/routes/${route.shareSlug}`;

  return (
    <article className="overflow-hidden rounded-lg border border-white/60 bg-white/96 shadow-sm backdrop-blur transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
      <Link href={href} className="block">
        <div className="relative aspect-[16/9] bg-slate-100">
          <Image src={image} alt={route.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
          <div className="absolute left-3 top-3 rounded-md bg-white px-3 py-1 text-xs font-black text-primary shadow-sm">
            {route.isAdminCurated ? 'Pilihan admin' : route.visibility === 'private' ? 'Private' : 'Shareable'}
          </div>
        </div>
        <div className="p-5">
          <h3 className="line-clamp-2 text-xl font-black text-slate-950">{route.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-500">
            {route.description || `${route.stops.length} destinasi dalam satu rute kunjungan.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
            <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-3 py-1.5 text-primary">
              <RouteIcon className="h-3.5 w-3.5" />
              {route.stops.length} stop
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-3 py-1.5 text-ai">
              <Navigation className="h-3.5 w-3.5" />
              {route.totalDistanceKm?.toFixed(1) || '-'} km
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-3 py-1.5 text-slate-700">
              <Clock className="h-3.5 w-3.5" />
              {formatRouteDuration(route.estimatedDurationMinutes)}
            </span>
          </div>
          {route.city && (
            <p className="mt-4 flex items-center gap-1.5 text-sm font-bold text-slate-500">
              <MapPin className="h-4 w-4 text-primary" />
              {route.city}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}

export function RouteStopList({ route }: { route: TravelRoute }) {
  return (
    <div className="space-y-3">
      {route.stops.map((stop, index) => {
        const mapsUrl =
          stop.destination?.googleMapsUrl ||
          (stop.destination?.latitude && stop.destination?.longitude
            ? `https://www.google.com/maps/search/?api=1&query=${stop.destination.latitude},${stop.destination.longitude}`
            : undefined);

        return (
          <div key={`${stop.destinationId}-${index}`} className="rounded-lg border border-white/60 bg-white/96 p-4 shadow-sm backdrop-blur">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-black text-white">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-black text-slate-950">{stop.destination?.name || `Destinasi ${stop.destinationId}`}</h4>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  {stop.destination?.city}, {stop.destination?.province}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                  {stop.distanceToNextKm !== null && stop.distanceToNextKm !== undefined && (
                    <span className="rounded-md bg-sky-50 px-3 py-1.5 text-ai">
                      Ke stop berikutnya {stop.distanceToNextKm.toFixed(1)} km
                    </span>
                  )}
                  {stop.estimatedVisitMinutes && (
                    <span className="rounded-md bg-slate-100 px-3 py-1.5 text-slate-700">
                      {stop.estimatedVisitMinutes} menit
                    </span>
                  )}
                </div>
                {stop.note && <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{stop.note}</p>}
              </div>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-orange-50 text-primary transition hover:bg-primary hover:text-white"
                  aria-label={`Buka ${stop.destination?.name || 'destinasi'} di Google Maps`}
                >
                  <Navigation className="h-4.5 w-4.5" />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
