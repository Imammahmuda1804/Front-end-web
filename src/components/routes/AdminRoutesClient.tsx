'use client';

import { useEffect, useState } from 'react';
import { Pencil, Plus, Route as RouteIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { routesService, TravelRoute } from '@/services/routes.service';
import { RouteBuilderClient } from './RouteBuilderClient';
import { RouteCard } from './RouteCards';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function AdminRoutesClient() {
  const [routes, setRoutes] = useState<TravelRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingRoute, setEditingRoute] = useState<TravelRoute | null>(null);
  const [routeToDelete, setRouteToDelete] = useState<TravelRoute | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadRoutes = async () => {
    try {
      const result = await routesService.adminRoutes();
      setRoutes(result.data);
    } catch {
      toast.error('Gagal memuat route admin');
    }
  };

  useEffect(() => {
    let active = true;
    routesService
      .adminRoutes()
      .then((result) => {
        if (active) setRoutes(result.data);
      })
      .catch(() => toast.error('Gagal memuat route admin'))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const remove = async () => {
    if (!routeToDelete) return;
    setDeleting(true);
    try {
      await routesService.deleteAdmin(routeToDelete.id);
      toast.success('Route dihapus');
      setRouteToDelete(null);
      loadRoutes();
    } catch {
      toast.error('Gagal menghapus route');
    } finally {
      setDeleting(false);
    }
  };

  const publish = async (route: TravelRoute) => {
    const nextVisibility = route.visibility === 'public' ? 'private' : 'public';
    try {
      await routesService.publishAdmin(route.id, nextVisibility);
      toast.success('Visibility route diperbarui');
      loadRoutes();
    } catch {
      toast.error('Gagal memperbarui route');
    }
  };

  if (showBuilder) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => {
            setShowBuilder(false);
            setEditingRoute(null);
          }}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700"
        >
          Kembali ke daftar
        </button>
        <RouteBuilderClient
          key={editingRoute?.id || 'new-admin-route'}
          admin
          initialRoute={editingRoute}
          onSaved={() => {
            setShowBuilder(false);
            setEditingRoute(null);
            loadRoutes();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-orange-100 bg-orange-50 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-primary">
              <RouteIcon className="h-4 w-4" />
              Admin routes
            </p>
            <h1 className="mt-4 text-3xl font-black text-slate-950">Curated route wisata</h1>
            <p className="mt-2 text-sm font-semibold text-slate-600">Buat rute resmi yang muncul di katalog route publik.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingRoute(null);
              setShowBuilder(true);
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-black text-white"
          >
            <Plus className="h-4 w-4" />
            Buat route
          </button>
        </div>
      </section>

      {loading ? (
        <div className="h-72 animate-pulse rounded-lg bg-white" />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {routes.map((route) => (
            <div key={route.id} className="space-y-3">
              <RouteCard route={route} />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRoute(route);
                    setShowBuilder(true);
                  }}
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-sky-100 bg-sky-50 px-3 text-xs font-black text-ai"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button type="button" onClick={() => publish(route)} className="min-h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700">
                  {route.visibility === 'public' ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  type="button"
                  onClick={() => setRouteToDelete(route)}
                  aria-label={`Hapus route ${route.title}`}
                  title={`Hapus route ${route.title}`}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg bg-rose-50 px-3 text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={Boolean(routeToDelete)} onOpenChange={(open) => !open && setRouteToDelete(null)}>
        <DialogContent className="rounded-lg border border-rose-100 bg-white p-0 shadow-2xl shadow-slate-950/15" showCloseButton={false}>
          <DialogHeader className="p-5 pb-0">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <Trash2 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-black text-slate-950">Hapus route admin?</DialogTitle>
            <DialogDescription className="text-sm font-semibold leading-6 text-slate-600">
              Route <span className="font-black text-slate-900">{routeToDelete?.title}</span> akan dihapus dari katalog. Aksi ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 rounded-b-xl border-t border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:justify-end">
            <DialogClose
              disabled={deleting}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 disabled:opacity-60"
            >
              Batal
            </DialogClose>
            <button
              type="button"
              disabled={deleting}
              onClick={remove}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-rose-600 px-4 text-sm font-black text-white transition hover:bg-rose-700 disabled:opacity-60"
            >
              {deleting ? 'Menghapus...' : 'Hapus route'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
