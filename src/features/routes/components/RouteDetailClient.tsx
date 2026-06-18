'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { BookmarkCheck, Heart, Route as RouteIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { routesService, TravelRoute } from '../services/routes.service';
import { formatRouteDuration, RouteStopList } from './RouteCards';
import { useAuthStore } from '@/features/auth';

const Map = dynamic(() => import('@/components/ui/map').then((mod) => mod.Map), { ssr: false });
const MapMarker = dynamic(() => import('@/components/ui/map').then((mod) => mod.MapMarker), { ssr: false });
const MapRoute = dynamic(() => import('@/components/ui/map').then((mod) => mod.MapRoute), { ssr: false });

export function RouteDetailClient({ shareSlug }: { shareSlug: string }) {
  const [route, setRoute] = useState<TravelRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const routeCoordinates = useMemo<[number, number][]>(() => {
    if (!route || !route.stops) return [];
    return route.stops
      .map((stop) => {
        const lng = Number(stop.destination?.longitude);
        const lat = Number(stop.destination?.latitude);
        if (!lng || !lat || isNaN(lng) || isNaN(lat)) return null;
        return [lng, lat] as [number, number];
      })
      .filter((coord): coord is [number, number] => coord !== null);
  }, [route]);

  useEffect(() => {
    let active = true;
    routesService
      .byShareSlug(shareSlug)
      .then((data) => {
        if (active) setRoute(data);
      })
      .catch(() => toast.error('Rute tidak ditemukan'))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [shareSlug]);

  useEffect(() => {
    let active = true;
    async function loadSavedState() {
      if (!route || !isAuthenticated) {
        setIsSaved(false);
        return;
      }
      const saved = await routesService.savedRoutes().catch(() => ({ data: [] }));
      if (!active) return;
      setIsSaved(saved.data.some((item) => item.id === route.id));
    }
    loadSavedState();
    return () => {
      active = false;
    };
  }, [isAuthenticated, route]);

  const handleSave = async () => {
    if (!route) return;
    if (!isAuthenticated) {
      window.location.href = `/login?callbackUrl=/routes/${route.shareSlug}`;
      return;
    }
    setSaving(true);
    try {
      if (isSaved) {
        await routesService.unsave(route.id);
        setIsSaved(false);
        toast.success('Rute dihapus dari simpanan');
      } else {
        await routesService.save(route.id);
        setIsSaved(true);
        toast.success('Rute disimpan');
      }
    } catch {
      toast.error(isSaved ? 'Gagal menghapus rute tersimpan' : 'Gagal menyimpan rute');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="min-h-screen pt-28 pb-10"><div className="mx-auto h-96 max-w-5xl animate-pulse rounded-lg bg-white/90" /></main>;
  }

  if (!route) {
    return (
      <main className="min-h-screen pt-28 pb-10">
        <div className="mx-auto max-w-3xl rounded-lg border border-dashed border-slate-200 bg-white/95 p-10 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-950">Rute tidak ditemukan</h1>
          <Link href="/routes" className="mt-5 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-black text-white">Lihat rute lain</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24">
      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-10 pt-8 md:px-12 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div>
          <div className="border-b pb-8 pt-4">
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em]">
              <RouteIcon className="h-4 w-4" />
              {route.isAdminCurated ? 'Pilihan admin' : 'Rute buatan pengguna'}
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">{route.title}</h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-7">
              {route.description || `${route.stops.length} destinasi dalam urutan kunjungan.`}
            </p>
          </div>
          <div className="mt-6">
            <RouteStopList route={route} />
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
          <aside className="rounded-lg border border-white/60 bg-white/96 p-6 shadow-sm backdrop-blur">
            <h2 className="text-lg font-black text-slate-950">Ringkasan rute</h2>
            <div className="mt-4 space-y-3 text-sm font-bold text-slate-600">
              <p>{route.stops.length} destinasi</p>
              <p>{route.totalDistanceKm?.toFixed(1) || '-'} km estimasi garis lurus</p>
              <p>{formatRouteDuration(route.estimatedDurationMinutes)}</p>
              {route.city && <p>{route.city}</p>}
            </div>
            <div className="mt-6 space-y-3">
              {isSaved ? (
                <div className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-5 text-sm font-black text-primary">
                  <BookmarkCheck className="h-4 w-4" />
                  Rute sudah tersimpan
                </div>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-black text-white disabled:opacity-60"
                >
                  <Heart className="h-4 w-4" />
                  Simpan rute
                </button>
              )}
              {isSaved && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-5 text-sm font-black text-rose-600 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus simpanan
                </button>
              )}
            </div>
          </aside>

          {routeCoordinates.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-white/60 bg-white/96 p-2 shadow-sm backdrop-blur">
              <div className="h-[360px] w-full rounded-md overflow-hidden bg-slate-100">
                <Map center={routeCoordinates[0]} zoom={12}>
                  <MapRoute coordinates={routeCoordinates} color="#f97316" width={4} />

                  {route.stops.map((stop, index) => {
                    const lng = Number(stop.destination?.longitude);
                    const lat = Number(stop.destination?.latitude);
                    if (!lng || !lat || isNaN(lng) || isNaN(lat)) return null;

                    return (
                      <MapMarker key={`stop-${stop.destinationId}-${index}`} longitude={lng} latitude={lat}>
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-black text-white border-2 border-white shadow-md hover:scale-110 transition-transform">
                          {index + 1}
                        </div>
                      </MapMarker>
                    );
                  })}
                </Map>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
