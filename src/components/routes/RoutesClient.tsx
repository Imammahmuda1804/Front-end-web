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
        if (!active) return;
        setRoutes(publicResult.data);
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
        <div className="border-b pb-8 pt-4">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em]">
            <RouteIcon className="h-4 w-4" />
            Route Planner
          </p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                {mode === 'mine' ? 'Rute saya' : 'Rute wisata siap pakai'}
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-7">
                Simpan rute publik, pantau progres kunjungan, atau buat urutan perjalanan dari destinasi favorit.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <Link href="/routes/me" className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-orange-200 bg-white/92 px-4 text-sm font-black text-primary shadow-sm backdrop-blur sm:flex-none">
                <Bookmark className="h-4 w-4" />
                Rute saya
              </Link>
              <Link href="/routes/saved" className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-sky-100 bg-white/92 px-4 text-sm font-black text-ai shadow-sm backdrop-blur sm:flex-none">
                <Bookmark className="h-4 w-4" />
                Tersimpan
              </Link>
              <Link href="/routes/new" className="inline-flex min-h-11 flex-[1.15] items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-black text-white shadow-sm shadow-orange-950/20 sm:flex-none">
                <Plus className="h-4 w-4" />
                Buat rute
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-72 animate-pulse rounded-lg bg-white" />
            ))}
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {mode !== 'mine' && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-black">
                  <Sparkles className="h-5 w-5 text-orange-200" />
                  Pilihan admin
                </h2>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {curatedRoutes.map((route) => <RouteCard key={route.id} route={route} />)}
                </div>
              </section>
            )}

            <section>
              <h2 className="mb-4 text-xl font-black">
                {mode === 'mine' ? 'Dibuat oleh saya' : 'Rute dari pengguna'}
              </h2>
              {userRoutes.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white/95 p-10 text-center text-sm font-bold text-slate-500 shadow-sm">
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
