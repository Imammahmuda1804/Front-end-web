'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { AlertTriangle, Clock, Loader2, Route } from 'lucide-react';

import { cn } from '@/lib/utils';

const Map = dynamic(() => import('@/components/ui/map').then((mod) => mod.Map), { ssr: false });
const MapMarker = dynamic(() => import('@/components/ui/map').then((mod) => mod.MapMarker), { ssr: false });
const MarkerContent = dynamic(() => import('@/components/ui/map').then((mod) => mod.MarkerContent), { ssr: false });
const MarkerLabel = dynamic(() => import('@/components/ui/map').then((mod) => mod.MarkerLabel), { ssr: false });
const MapRoute = dynamic(() => import('@/components/ui/map').then((mod) => mod.MapRoute), { ssr: false });

export interface RouteWaypoint {
  coordinates: [number, number];
  name?: string;
  markerLabel?: string;
}

export interface OSRMRouteData {
  coordinates: [number, number][];
  duration: number; // seconds
  distance: number; // meters
}

export interface RoutePlannerMapProps {
  waypoints: RouteWaypoint[];
  className?: string;
  height?: number | string;
  /** OSRM routing profile */
  profile?: 'driving' | 'walking' | 'cycling' | 'driving-traffic';
  /** Custom OSRM server base URL (defaults to public demo) */
  osrmBaseUrl?: string;
  /** Map theme (default: "light") */
  theme?: 'light' | 'dark';
  /**
   * Fires when the selected route changes (or null when no route available).
   * Duration in seconds, distance in meters.
   */
  onRouteChange?: (route: { duration: number; distance: number } | null) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRouteDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} mnt`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}j ${m}mnt` : `${h} jam`;
}

function formatRouteDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RoutePlannerMap({
  waypoints,
  className,
  height = 400,
  profile = 'driving',
  osrmBaseUrl = 'https://router.project-osrm.org',
  theme = 'light',
  onRouteChange,
}: RoutePlannerMapProps) {
  const [routes, setRoutes] = useState<OSRMRouteData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch routes from OSRM -------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    if (waypoints.length < 2) {
      // Instead of updating state directly inside effect body for synchronous clear,
      // do it via setTimeout to allow render to complete first
      setTimeout(() => {
        if (!cancelled) {
          setRoutes([]);
          setSelectedIndex(0);
          setError(null);
        }
      }, 0);
      return;
    }

    // Schedule loader to avoid sync set-state warning
    setTimeout(() => {
      if (!cancelled) {
        setIsLoading(true);
        setError(null);
      }
    }, 0);

    const coords = waypoints
      .map((w) => `${w.coordinates[0]},${w.coordinates[1]}`)
      .join(';');

    fetch(
      `${osrmBaseUrl}/route/v1/${profile}/${coords}?overview=full&geometries=geojson&alternatives=true`,
      { signal: AbortSignal.timeout(15_000) },
    )
      .then((res) => {
        if (!res.ok) throw new Error(`OSRM ${res.status}`);
        return res.json() as Promise<{
          code: string;
          message?: string;
          routes: Array<{
            geometry: { coordinates: [number, number][] };
            duration: number;
            distance: number;
          }>;
        }>;
      })
      .then((data) => {
        if (cancelled) return;
        if (data.code !== 'Ok') throw new Error(data.message ?? 'Permintaan rute gagal');

        const parsed: OSRMRouteData[] = (data.routes ?? []).map((r) => ({
          coordinates: r.geometry.coordinates,
          duration: r.duration,
          distance: r.distance,
        }));
        setRoutes(parsed);
        setSelectedIndex(0);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        // Ignore aborted requests
        if (err.name === 'AbortError') return;
        setError(err.message || 'Gagal mengambil rute');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [waypoints, profile, osrmBaseUrl]);

  // --- Notify parent about route data -----------------------------------------

  useEffect(() => {
    if (routes[selectedIndex]) {
      onRouteChange?.({
        duration: routes[selectedIndex].duration,
        distance: routes[selectedIndex].distance,
      });
    } else if (!isLoading) {
      onRouteChange?.(null);
    }
  }, [routes, selectedIndex, isLoading, onRouteChange]);

  // --- Derived ----------------------------------------------------------------

  const sortedRoutes = useMemo(
    () =>
      routes
        .map((route, index) => ({ route, index }))
        .sort((a, b) => {
          if (a.index === selectedIndex) return 1;
          if (b.index === selectedIndex) return -1;
          return 0;
        }),
    [routes, selectedIndex],
  );

  const mapCenter = useMemo<[number, number]>(() => {
    if (waypoints.length === 0) return [110, -7];
    const lngs = waypoints.map((w) => w.coordinates[0]);
    const lats = waypoints.map((w) => w.coordinates[1]);
    return [
      lngs.reduce((a, b) => a + b, 0) / lngs.length,
      lats.reduce((a, b) => a + b, 0) / lats.length,
    ];
  }, [waypoints]);

  const hasRoutes = routes.length > 0;

  // --- Empty state ------------------------------------------------------------

  if (waypoints.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-dashed bg-slate-50 text-sm font-medium text-slate-400',
          className,
        )}
        style={{ height }}
      >
        Belum ada waypoint
      </div>
    );
  }

  // --- Render -----------------------------------------------------------------

  return (
    <div
      className={cn('relative overflow-hidden rounded-lg border bg-white shadow-sm', className)}
      style={{ height }}
    >
      <Map center={mapCenter} zoom={11} theme={theme} className="h-full w-full">
        {/* Route lines – non-selected first, selected last (renders on top) */}
        {sortedRoutes.map(({ route, index }) => {
          const isSelected = index === selectedIndex;
          return (
            <MapRoute
              key={index}
              coordinates={route.coordinates}
              color={isSelected ? '#f97316' : '#94a3b8'}
              width={isSelected ? 6 : 4}
              opacity={isSelected ? 1 : 0.45}
              onClick={() => setSelectedIndex(index)}
            />
          );
        })}

        {/* Waypoint markers */}
        {waypoints.map((wp, index) => (
          <MapMarker
            key={index}
            longitude={wp.coordinates[0]}
            latitude={wp.coordinates[1]}
          >
            <MarkerContent>
              <div
                className={cn(
                  'flex size-7 items-center justify-center rounded-full border-2 border-white text-xs font-black text-white shadow-md transition-transform hover:scale-110',
                  index === 0
                    ? 'bg-green-500'
                    : index === waypoints.length - 1
                      ? 'bg-red-500'
                      : 'bg-primary',
                )}
              >
                {wp.markerLabel ?? index + 1}
              </div>
              {wp.name && (
                <MarkerLabel position={index === 0 ? 'top' : 'bottom'}>
                  {wp.name}
                </MarkerLabel>
              )}
            </MarkerContent>
          </MapMarker>
        ))}
      </Map>

      {/* Route selector buttons */}
      {hasRoutes && (
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {routes.map((route, index) => {
            const isActive = index === selectedIndex;
            const isFastest = index === 0;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  'inline-flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-left text-sm shadow-sm transition-all',
                  isActive
                    ? 'bg-white text-amber-500  shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-orange-50',
                )}
              >
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  <span className="font-medium tabular-nums">
                    {formatRouteDuration(route.duration)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs opacity-75">
                  <Route className="size-3" />
                  {formatRouteDistance(route.distance)}
                </div>
                {isFastest && (
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px] font-semibold',
                      isActive
                        ? 'bg-white/20 text-amber-500'
                        : 'bg-green-100 text-green-700',
                    )}
                  >
                    Tercepat
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span className="text-xs font-semibold text-slate-500">
              Mencari rute…
            </span>
          </div>
        </div>
      )}

      {/* Error overlay (only when no routes loaded) */}
      {!isLoading && error && !hasRoutes && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <AlertTriangle className="size-6 text-amber-500" />
            <span className="text-sm font-semibold text-slate-600">
              Rute tidak tersedia
            </span>
            <span className="max-w-64 text-[11px] leading-relaxed text-slate-400">
              {error}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoutePlannerMap;
