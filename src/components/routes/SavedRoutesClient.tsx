'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, LogIn, MapPin, Navigation, Plus, RotateCcw, Route as RouteIcon } from 'lucide-react';
import { toast } from 'sonner';
import { routesService, SavedRouteProgressItem, TravelRoute } from '@/services/routes.service';
import { useAuthStore } from '@/store/auth.store';
import { formatRouteDuration } from './RouteCards';

type ProgressMap = Record<number, SavedRouteProgressItem[]>;

export function SavedRoutesClient() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [routes, setRoutes] = useState<TravelRoute[]>([]);
  const [progressByRoute, setProgressByRoute] = useState<ProgressMap>({});
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStopId, setUpdatingStopId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const result = await routesService.savedRoutes();
        const progressEntries = await Promise.all(
          result.data.map(async (route) => {
            const progress = await routesService.savedRouteProgress(route.id).catch(() => ({ progress: [] }));
            return [route.id, progress.progress] as const;
          }),
        );
        if (!active) return;
        setRoutes(result.data);
        setProgressByRoute(Object.fromEntries(progressEntries));
        setSelectedRouteId((current) => current || result.data[0]?.id || null);
      } catch {
        toast.error('Gagal memuat rute tersimpan');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === selectedRouteId) || routes[0],
    [routes, selectedRouteId],
  );
  const selectedProgress = selectedRoute ? progressByRoute[selectedRoute.id] || [] : [];
  const visitedStopIds = new Set(selectedProgress.filter((item) => item.status === 'visited').map((item) => item.routeStopId));
  const nextStop = selectedRoute?.stops.find((stop) => stop.id && !visitedStopIds.has(stop.id));

  const updateStop = async (route: TravelRoute, routeStopId: number, visited: boolean) => {
    setUpdatingStopId(routeStopId);
    try {
      if (visited) {
        await routesService.updateSavedRouteProgress(route.id, routeStopId, { status: 'visited' });
      } else {
        await routesService.resetSavedRouteProgress(route.id, routeStopId);
      }
      const refreshed = await routesService.savedRouteProgress(route.id);
      setProgressByRoute((current) => ({ ...current, [route.id]: refreshed.progress }));
      toast.success(visited ? 'Lokasi ditandai sudah dikunjungi' : 'Progress lokasi direset');
    } catch {
      toast.error('Gagal memperbarui progress rute');
    } finally {
      setUpdatingStopId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen pt-24 pb-14">
        <section className="mx-auto max-w-3xl px-6 text-center">
          <div className="rounded-xl border border-orange-100 bg-white p-10 shadow-sm">
            <LogIn className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-4 text-3xl font-black text-slate-950">Masuk untuk melihat rute tersimpan</h1>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
              Progress kunjungan disimpan di akun Anda agar bisa dipakai lintas perangkat.
            </p>
            <Link href="/login?callbackUrl=/routes/saved" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-black text-white">
              Masuk
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-14">
      <section className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="border-b border-slate-300/70 pb-8 pt-4">
          <p className="editorial-kicker inline-flex items-center gap-2">
            <RouteIcon className="h-4 w-4" />
            Route Tracker
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">Rute tersimpan</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-600 md:text-base">
                Tandai lokasi yang sudah dikunjungi dan lihat destinasi berikutnya tanpa kehilangan urutan rute.
              </p>
            </div>
            <Link href="/routes" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-black text-white">
              <Plus className="h-4 w-4" />
              Simpan rute lain
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 h-96 animate-pulse rounded-xl bg-white" />
        ) : routes.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <h2 className="text-2xl font-black text-slate-950">Belum ada rute tersimpan</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Simpan route publik untuk mulai melacak kunjungan.</p>
            <Link href="/routes" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-sm font-black text-white">Lihat route publik</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
            <aside className="space-y-3 lg:sticky lg:top-24 lg:h-fit">
              {routes.map((route) => {
                const progress = progressByRoute[route.id] || [];
                const visited = progress.filter((item) => item.status === 'visited').length;
                const active = route.id === selectedRoute?.id;
                const currentNext = route.stops.find((stop) => stop.id && !new Set(progress.filter((item) => item.status === 'visited').map((item) => item.routeStopId)).has(stop.id));
                return (
                  <button
                    key={route.id}
                    type="button"
                    onClick={() => setSelectedRouteId(route.id)}
                    className={`w-full border-b p-4 text-left transition-colors duration-150 ${
                      active ? 'border-primary bg-orange-50/75' : 'border-slate-200 bg-white/70 hover:border-orange-200'
                    }`}
                  >
                    <span className="text-sm font-black text-slate-950">{route.title}</span>
                    <span className="mt-2 block text-xs font-bold text-slate-500">{visited}/{route.stops.length} dikunjungi</span>
                    <span className="mt-2 line-clamp-1 text-xs font-bold text-ai">Selanjutnya: {currentNext?.destination?.name || 'Selesai'}</span>
                  </button>
                );
              })}
            </aside>

            {selectedRoute && (
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-950">{selectedRoute.title}</h2>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                      {selectedRoute.description || `${selectedRoute.stops.length} destinasi dalam urutan kunjungan.`}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-black">
                    <Stat label="Stop" value={selectedRoute.stops.length.toString()} />
                    <Stat label="Jarak" value={`${selectedRoute.totalDistanceKm?.toFixed(1) || '-'} km`} />
                    <Stat label="Durasi" value={formatRouteDuration(selectedRoute.estimatedDurationMinutes)} />
                  </div>
                </div>

                {nextStop && (
                  <div className="mt-5 rounded-lg bg-slate-950 p-5 text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-orange-300">Tujuan berikutnya</p>
                    <h3 className="mt-2 text-2xl font-extrabold">{nextStop.destination?.name}</h3>
                    <p className="mt-1 text-sm font-medium text-slate-300">{nextStop.destination?.city}, {nextStop.destination?.province}</p>
                  </div>
                )}

                <div className="relative mt-6 space-y-2 before:absolute before:bottom-6 before:left-[1.35rem] before:top-6 before:w-px before:bg-slate-200">
                  {selectedRoute.stops.map((stop, index) => {
                    const stopId = stop.id;
                    const progress = selectedProgress.find((item) => item.routeStopId === stopId);
                    const visited = progress?.status === 'visited';
                    const isNext = nextStop?.id === stopId;
                    const mapsUrl = stop.destination?.googleMapsUrl ||
                      (stop.destination?.latitude && stop.destination?.longitude
                        ? `https://www.google.com/maps/search/?api=1&query=${stop.destination.latitude},${stop.destination.longitude}`
                        : undefined);

                    return (
                      <div key={`${selectedRoute.id}-${stop.destinationId}-${index}`} className={`relative rounded-lg border p-4 transition-colors duration-150 ${visited ? 'border-emerald-200 bg-emerald-50/55' : isNext ? 'border-orange-200 bg-orange-50/55' : 'border-slate-200 bg-white'}`}>
                        <div className="flex gap-4">
                          <div className={`z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-black ${visited ? 'bg-emerald-600 text-white' : isNext ? 'bg-primary text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200'}`}>
                            {visited ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                              <div>
                                <h3 className="text-lg font-black text-slate-950">{stop.destination?.name || `Destinasi ${stop.destinationId}`}</h3>
                                <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-500">
                                  <MapPin className="h-4 w-4 text-primary" />
                                  {stop.destination?.city}, {stop.destination?.province}
                                </p>
                              </div>
                              <span className={`w-fit rounded-lg px-3 py-1.5 text-xs font-black ${visited ? 'bg-white text-emerald-700' : isNext ? 'bg-white text-primary' : 'bg-white text-slate-500'}`}>
                                {visited ? 'Sudah dikunjungi' : isNext ? 'Tujuan berikutnya' : 'Menunggu'}
                              </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                              {stop.distanceToNextKm !== null && stop.distanceToNextKm !== undefined && (
                                <span className="rounded-lg bg-white px-3 py-1.5 text-ai">Ke stop berikutnya {stop.distanceToNextKm.toFixed(1)} km</span>
                              )}
                              {progress?.visitedAt && (
                                <span className="rounded-lg bg-white px-3 py-1.5 text-emerald-700">
                                  <Clock className="mr-1 inline h-3.5 w-3.5" />
                                  {new Date(progress.visitedAt).toLocaleDateString('id-ID')}
                                </span>
                              )}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              {stopId && (
                                <button
                                  type="button"
                                  disabled={updatingStopId === stopId}
                                  onClick={() => updateStop(selectedRoute, stopId, !visited)}
                                  className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black transition disabled:opacity-60 ${visited ? 'border border-emerald-200 bg-white text-emerald-700' : 'bg-primary text-white'}`}
                                >
                                  {visited ? <RotateCcw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                  {visited ? 'Batal tandai' : 'Tandai dikunjungi'}
                                </button>
                              )}
                              {mapsUrl && (
                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-sky-100 bg-white px-4 text-sm font-black text-ai">
                                  <Navigation className="h-4 w-4" />
                                  Buka Maps
                                </a>
                              )}
                              {stop.destination?.slug && (
                                <Link href={`/destinations/${stop.destination.slug}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700">
                                  Detail destinasi
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l border-slate-200 px-3 py-1 text-slate-700 first:border-l-0">
      <span className="block text-[11px] font-semibold text-slate-400">{label}</span>
      <span className="block font-black">{value}</span>
    </div>
  );
}
