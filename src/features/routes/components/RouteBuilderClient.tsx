'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowDown, ArrowUp, Eye, MapPin, Plus, Route as RouteIcon, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { routesService, RoutePayload, RouteVisibility, TravelRoute } from '../services/routes.service';
import type { RouteWaypoint } from './RoutePlannerMap';

const RoutePlannerMap = dynamic(
  () => import('./RoutePlannerMap').then((mod) => mod.RoutePlannerMap),
  { ssr: false },
);

type DestinationOption = {
  id: number;
  name: string;
  city: string;
  province: string;
  latitude?: number | null;
  longitude?: number | null;
};

type DraftStop = {
  destinationId: number;
  note?: string;
  estimatedVisitMinutes?: number;
};

const VISIBILITY_OPTIONS: NativeSelectOption[] = [
  { value: 'private', label: 'Pribadi', description: 'Hanya bisa dilihat oleh pembuat rute' },
  { value: 'public', label: 'Publik', description: 'Tampil di katalog rute publik' },
  { value: 'link_only', label: 'Lewat tautan', description: 'Bisa dibuka melalui link yang dibagikan' },
];

export function RouteBuilderClient({
  admin = false,
  initialRoute = null,
  onSaved,
}: {
  admin?: boolean;
  initialRoute?: TravelRoute | null;
  onSaved?: (route: TravelRoute) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDestinationId = Number(searchParams.get('destinationId'));
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [title, setTitle] = useState(initialRoute?.title || '');
  const [description, setDescription] = useState(initialRoute?.description || '');
  const [visibility, setVisibility] = useState<RouteVisibility>(initialRoute?.visibility || (admin ? 'public' : 'private'));
  const [selectedDestination, setSelectedDestination] = useState('');
  const [stops, setStops] = useState<DraftStop[]>(
    initialRoute?.stops?.length
      ? initialRoute.stops.map((stop) => ({
          destinationId: stop.destinationId,
          note: stop.note || undefined,
          estimatedVisitMinutes: stop.estimatedVisitMinutes || undefined,
        }))
      : initialDestinationId
        ? [{ destinationId: initialDestinationId, estimatedVisitMinutes: 60 }]
        : [],
  );
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(initialRoute);

  const waypoints = useMemo(() => {
    return stops
      .map((stop, index) => {
        const dest = destinations.find((item) => item.id === stop.destinationId);
        if (!dest || !dest.longitude || !dest.latitude) return null;
        return {
          coordinates: [Number(dest.longitude), Number(dest.latitude)] as [number, number],
          name: dest.name,
          markerLabel: String(index + 1),
        };
      })
      .filter(Boolean) as RouteWaypoint[];
  }, [stops, destinations]);

  useEffect(() => {
    api
      .get('/api/destinations', { params: { limit: 100 } })
      .then((response) => setDestinations(response.data.data?.data || response.data.data || []))
      .catch(() => toast.error('Gagal memuat destinasi'));
  }, []);

  const selectedIds = useMemo(() => new Set(stops.map((stop) => stop.destinationId)), [stops]);
  const availableDestinations = destinations.filter((destination) => !selectedIds.has(destination.id));
  const heroShellClass = admin
    ? 'rounded-lg border border-orange-100 bg-orange-50 p-6 md:p-8'
    : 'border-b pb-8 pt-4';
  const heroKickerClass = admin
    ? 'inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-primary'
    : 'inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em]';
  const heroTitleClass = admin
    ? 'mt-4 text-3xl font-black text-slate-950'
    : 'mt-4 text-3xl font-black tracking-tight md:text-5xl';
  const destinationOptions = useMemo<NativeSelectOption[]>(
    () =>
      availableDestinations.map((destination) => ({
        value: String(destination.id),
        label: destination.name,
        description: `${destination.city}, ${destination.province}`,
      })),
    [availableDestinations],
  );

  const addStop = () => {
    const destinationId = Number(selectedDestination);
    if (!destinationId) return;
    setStops((current) => [...current, { destinationId, estimatedVisitMinutes: 60 }]);
    setSelectedDestination('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addStop();
    }
  };

  const moveStop = (index: number, direction: -1 | 1) => {
    setStops((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeStop = (index: number) => {
    const stopToRemove = stops[index];
    setStops((current) => current.filter((_, itemIndex) => itemIndex !== index));

    toast('Destinasi dihapus dari rute', {
      action: {
        label: 'Undo',
        onClick: () => {
          setStops((current) => {
            const next = [...current];
            next.splice(index, 0, stopToRemove);
            return next;
          });
          toast.success('Destinasi dikembalikan');
        },
      },
    });
  };

  const autoSort = async () => {
    if (stops.length < 2) return;
    try {
      const result = await routesService.autoSort(toPayloadStops());
      setStops(result.stops.map((stop) => ({
        destinationId: stop.destinationId,
        note: stop.note || undefined,
        estimatedVisitMinutes: stop.estimatedVisitMinutes || undefined,
      })));
      toast.success('Urutan rute diperbarui berdasarkan jarak');
    } catch {
      toast.error('Gagal mengurutkan rute');
    }
  };

  const toPayloadStops = (): RoutePayload['stops'] =>
    stops.map((stop, index) => ({
      destinationId: stop.destinationId,
      stopOrder: index + 1,
      note: stop.note,
      estimatedVisitMinutes: stop.estimatedVisitMinutes,
    }));

  const save = async () => {
    if (!title.trim()) {
      toast.error('Judul rute wajib diisi');
      return;
    }
    if (stops.length === 0) {
      toast.error('Pilih minimal satu destinasi');
      return;
    }

    setSaving(true);
    try {
      const payload: RoutePayload = {
        title,
        description,
        visibility,
        autoSort: false,
        stops: toPayloadStops(),
      };
      const route = isEditing && initialRoute
        ? admin
          ? await routesService.updateAdmin(initialRoute.id, payload)
          : await routesService.update(initialRoute.id, payload)
        : admin
          ? await routesService.createAdmin(payload)
          : await routesService.create(payload);
      toast.success(isEditing ? 'Rute berhasil diperbarui' : 'Rute berhasil dibuat');
      if (onSaved) {
        onSaved(route);
      } else {
        router.push(admin ? '/admin/routes' : `/routes/${route.shareSlug}`);
      }
    } catch {
      toast.error('Gagal menyimpan rute');
    } finally {
      setSaving(false);
    }
  };

  const destinationLabel = (id: number) => {
    const destination = destinations.find((item) => item.id === id);
    return destination ? `${destination.name} (${destination.city})` : `Destinasi ${id}`;
  };

  return (
    <main className={admin ? '' : 'min-h-screen pt-24'}>
      <section className={admin ? 'space-y-6' : 'mx-auto max-w-6xl px-6 pb-10 pt-8 md:px-12'}>
        <div className={heroShellClass}>
          <p className={heroKickerClass}>
            <RouteIcon className="h-4 w-4" />
            {admin ? 'Rute pilihan admin' : 'Rute buatan sendiri'}
          </p>
          <h1 className={heroTitleClass}>
            {isEditing ? 'Edit rute wisata' : admin ? 'Buat rute pilihan admin' : 'Buat rute wisata'}
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Judul rute"
              className="min-h-11 w-full rounded-lg border border-slate-200 px-4 text-sm font-bold outline-none focus:border-primary"
            />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Deskripsi singkat"
              className="min-h-24 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-primary"
            />
            <NativeSelect
              aria-label="Visibilitas rute"
              value={visibility}
              onValueChange={(value) => setVisibility(value as RouteVisibility)}
              options={VISIBILITY_OPTIONS}
              leftIcon={<Eye className="h-4 w-4" />}
              placeholder="Pilih visibilitas"
            />
            <div className="flex flex-col gap-2 sm:flex-row" onKeyDown={handleKeyDown}>
              <NativeSelect
                aria-label="Pilih destinasi untuk rute"
                value={selectedDestination}
                onValueChange={setSelectedDestination}
                options={destinationOptions}
                leftIcon={<MapPin className="h-4 w-4" />}
                placeholder="Pilih destinasi"
                searchable
                searchPlaceholder="Cari destinasi..."
                wrapperClassName="flex-1"
              />
              <button type="button" onClick={addStop} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-black text-white">
                <Plus className="h-4 w-4" />
                Tambah
              </button>
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            <aside className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="font-black text-slate-950">Aksi</h2>
              <div className="mt-4 space-y-3">
                <div>
                  <button type="button" onClick={autoSort} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-sky-100 bg-sky-50 px-5 text-sm font-black text-ai">
                    <Sparkles className="h-4 w-4" />
                    Urutkan otomatis
                  </button>
                  <p className="mt-1.5 text-center text-[10px] font-bold text-slate-400">
                    Mengurutkan destinasi rute berdasarkan jarak terdekat.
                  </p>
                </div>
                <button disabled={saving} type="button" onClick={save} className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-black text-white disabled:opacity-60">
                  {isEditing ? 'Update rute' : 'Simpan rute'}
                </button>
              </div>
            </aside>

            {waypoints.length >= 2 && (
              <RoutePlannerMap waypoints={waypoints} />
            )}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {stops.map((stop, index) => (
            <div key={`${stop.destinationId}-${index}`} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-black text-white">{index + 1}</div>
              <div className="min-w-0 flex-1 font-black text-slate-900">{destinationLabel(stop.destinationId)}</div>
              <button
                type="button"
                onClick={() => moveStop(index, -1)}
                aria-label={`Naikkan ${destinationLabel(stop.destinationId)}`}
                title={`Naikkan ${destinationLabel(stop.destinationId)}`}
                className="rounded-lg bg-slate-100 p-2"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => moveStop(index, 1)}
                aria-label={`Turunkan ${destinationLabel(stop.destinationId)}`}
                title={`Turunkan ${destinationLabel(stop.destinationId)}`}
                className="rounded-lg bg-slate-100 p-2"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => removeStop(index)}
                aria-label={`Hapus ${destinationLabel(stop.destinationId)} dari rute`}
                title={`Hapus ${destinationLabel(stop.destinationId)} dari rute`}
                className="rounded-lg bg-rose-50 p-2 text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
