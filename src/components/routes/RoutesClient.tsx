'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Pencil, Plus, Route as RouteIcon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { routesService, TravelRoute } from '@/services/routes.service';
import { useAuthStore } from '@/store/auth.store';
import { RouteBuilderClient } from './RouteBuilderClient';
import { RouteCard } from './RouteCards';

export function RoutesClient({ mode = 'public' }: { mode?: 'public' | 'mine' }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [routes, setRoutes] = useState<TravelRoute[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<TravelRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoute, setEditingRoute] = useState<TravelRoute | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const publicResult = await (mode === 'mine'
          ? routesService.myRoutes()
          : routesService.publicRoutes({ limit: 24 }));
        const savedResult = isAuthenticated ? await routesService.savedRoutes().catch(() => ({ data: [] })) : { data: [] };
        if (!active) return;
        setRoutes(publicResult.data);
        setSavedRoutes(savedResult.data);
      } catch {
        toast.error('Gagal memuat rute');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [isAuthenticated, mode]);

  const curatedRoutes = useMemo(() => routes.filter((route) => route.isAdminCurated), [routes]);
  const userRoutes = useMemo(() => routes.filter((route) => !route.isAdminCurated), [routes]);

  if (editingRoute) {
    return (
      <main className="min-h-screen pt-24">
        <section className="mx-auto max-w-6xl px-6 pb-10 pt-8 md:px-12">
          <button
            type="button"
            onClick={() => setEditingRoute(null)}
            className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700"
          >
            Kembali ke rute saya
          </button>
          <RouteBuilderClient
            key={editingRoute.id}
            initialRoute={editingRoute}
            onSaved={(updatedRoute) => {
              setRoutes((current) => current.map((route) => (route.id === updatedRoute.id ? updatedRoute : route)));
              setEditingRoute(null);
            }}
          />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24">
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-8 md:px-12">
        <div className="rounded-xl border border-orange-100 bg-orange-50 p-6 shadow-sm md:p-8">
          <p className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-primary">
            <RouteIcon className="h-4 w-4" />
            Route Planner
          </p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                {mode === 'mine' ? 'Rute saya' : 'Rute wisata siap pakai'}
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-600">
                Simpan rute publik, duplikasi menjadi itinerary pribadi, atau buat urutan kunjungan dari destinasi favorit.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[31rem]">
              <Link href="/routes/me" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-orange-200 bg-white px-4 text-sm font-black text-primary">
                <Bookmark className="h-4 w-4" />
                Rute saya
              </Link>
              <Link href="/routes/saved" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-sky-100 bg-white px-4 text-sm font-black text-ai">
                <Bookmark className="h-4 w-4" />
                Disimpan
              </Link>
              <Link href="/routes/new" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-black text-white">
                <Plus className="h-4 w-4" />
                Buat rute
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-72 animate-pulse rounded-xl bg-white" />
            ))}
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {mode !== 'mine' && savedRoutes.length > 0 && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-950">
                  <Bookmark className="h-5 w-5 text-ai" />
                  Disimpan
                </h2>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {savedRoutes.map((route) => <RouteCard key={`saved-${route.id}`} route={route} />)}
                </div>
              </section>
            )}

            {mode !== 'mine' && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-950">
                <Sparkles className="h-5 w-5 text-primary" />
                Pilihan admin
              </h2>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {curatedRoutes.map((route) => <RouteCard key={route.id} route={route} />)}
              </div>
            </section>
            )}

            <section>
              <h2 className="mb-4 text-xl font-black text-slate-950">
                {mode === 'mine' ? 'Dibuat oleh saya' : 'Rute dari pengguna'}
              </h2>
              {userRoutes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500">
                  Belum ada custom route publik.
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {userRoutes.map((route) => (
                    <div key={route.id} className="space-y-3">
                      <RouteCard route={route} />
                      {mode === 'mine' && (
                        <button
                          type="button"
                          onClick={() => setEditingRoute(route)}
                          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-sky-100 bg-sky-50 px-3 text-sm font-black text-ai"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit rute
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
