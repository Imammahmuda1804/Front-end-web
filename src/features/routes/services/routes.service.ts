import { api } from '@/lib/axios';

export type RouteVisibility = 'private' | 'public' | 'link_only';

export type RouteDestination = {
  id: number;
  name: string;
  slug: string;
  city: string;
  province: string;
  category?: string | null;
  thumbnailUrl?: string | null;
  googleRating?: number | null;
  positiveRatio?: number | null;
  recommendationScore?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  googlePlaceId?: string | null;
  googleMapsUrl?: string | null;
};

export type RouteStop = {
  id?: number;
  destinationId: number;
  stopOrder: number;
  distanceFromPreviousKm?: number | null;
  distanceToNextKm?: number | null;
  note?: string | null;
  estimatedVisitMinutes?: number | null;
  destination?: RouteDestination;
};

export type SavedRouteProgressStatus = 'pending' | 'visited';

export type SavedRouteProgressItem = {
  id: number;
  savedRouteId: number;
  routeStopId: number;
  status: SavedRouteProgressStatus;
  note?: string | null;
  visitedAt?: string | null;
  updatedAt: string;
};

export type SavedRouteProgressResponse = {
  savedRouteId: number;
  routeId: number;
  progress: SavedRouteProgressItem[];
};

export type TravelRoute = {
  id: number;
  title: string;
  description?: string | null;
  visibility: RouteVisibility;
  shareSlug: string;
  city?: string | null;
  isAdminCurated: boolean;
  totalDistanceKm?: number | null;
  estimatedDurationMinutes?: number | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: number; name: string; profilePicture?: string | null } | null;
  stops: RouteStop[];
  savedRoutes?: Array<{ id: number; userId: number }>;
};

export type RoutePayload = {
  title: string;
  description?: string;
  visibility?: RouteVisibility;
  city?: string;
  autoSort?: boolean;
  stops: Array<{
    destinationId: number;
    stopOrder?: number;
    note?: string;
    estimatedVisitMinutes?: number;
  }>;
};

type Paginated<T> = {
  data: T[];
  meta?: { page: number; limit: number; total: number; total_pages: number };
};

type RawRoute = TravelRoute & {
  share_slug?: string;
  is_admin_curated?: boolean;
  total_distance_km?: number | null;
  estimated_duration_minutes?: number | null;
  created_at?: string;
  updated_at?: string;
  saved_routes?: Array<{ id: number; userId?: number; user_id?: number }>;
};

function normalizeRoute(route: RawRoute): TravelRoute {
  const stops: RouteStop[] = Array.isArray(route.stops) ? route.stops : [];
  // ponytail: kalkulasi ulang dari stops — jangan pake DB value yg mungkin stale/buggy
  const totalKm = stops.reduce((s, st) => s + (st.distanceToNextKm || 0), 0);
  const calcKm = totalKm > 0 ? Math.round(totalKm * 100) / 100 : null;
  const calcMin = totalKm > 0 ? Math.round(totalKm * 3) : null;

  return {
    ...route,
    shareSlug: route.shareSlug || route.share_slug || String(route.id),
    isAdminCurated: route.isAdminCurated ?? route.is_admin_curated ?? false,
    totalDistanceKm: calcKm ?? route.totalDistanceKm ?? route.total_distance_km,
    estimatedDurationMinutes: calcMin,
    createdAt: route.createdAt || route.created_at || '',
    updatedAt: route.updatedAt || route.updated_at || '',
    savedRoutes: route.savedRoutes || route.saved_routes?.map((item) => ({
      id: item.id,
      userId: item.userId ?? item.user_id ?? 0,
    })),
    stops,
  };
}

function normalizePaginatedRoutes(result: Paginated<TravelRoute>): Paginated<TravelRoute> {
  return {
    ...result,
    data: result.data.map((route) => normalizeRoute(route as RawRoute)),
  };
}

const unwrap = <T>(response: { data: unknown }) => {
  const raw = response.data;
  if (raw && typeof raw === 'object' && 'data' in raw) {
    return (raw as { data: T }).data;
  }
  return raw as T;
};

const unwrapPaginated = <T>(response: { data: unknown }): Paginated<T> => {
  const raw = response.data;
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const payload = raw as { data: unknown; meta?: Paginated<T>['meta'] };
    if (Array.isArray(payload.data)) {
      return { data: payload.data as T[], meta: payload.meta };
    }
    if (payload.data && typeof payload.data === 'object' && 'data' in payload.data) {
      const nested = payload.data as Paginated<T>;
      return { data: nested.data || [], meta: nested.meta || payload.meta };
    }
  }
  if (Array.isArray(raw)) return { data: raw as T[] };
  return { data: [] };
};

export const routesService = {
  async publicRoutes(params?: { page?: number; limit?: number; city?: string }) {
    const response = await api.get('/api/routes/public', { params });
    return normalizePaginatedRoutes(unwrapPaginated<TravelRoute>(response));
  },

  async myRoutes() {
    const response = await api.get('/api/routes/me', { params: { limit: 50 } });
    return normalizePaginatedRoutes(unwrapPaginated<TravelRoute>(response));
  },

  async savedRoutes() {
    const response = await api.get('/api/routes/saved', { params: { limit: 50 } });
    return normalizePaginatedRoutes(unwrapPaginated<TravelRoute>(response));
  },

  async savedRouteProgress(routeId: number) {
    const response = await api.get(`/api/routes/saved/${routeId}/progress`);
    return unwrap<SavedRouteProgressResponse>(response);
  },

  async updateSavedRouteProgress(
    routeId: number,
    routeStopId: number,
    payload: { status: SavedRouteProgressStatus; note?: string },
  ) {
    const response = await api.put(`/api/routes/saved/${routeId}/progress/${routeStopId}`, payload);
    return unwrap<SavedRouteProgressItem>(response);
  },

  async resetSavedRouteProgress(routeId: number, routeStopId: number) {
    await api.delete(`/api/routes/saved/${routeId}/progress/${routeStopId}`);
  },

  async byShareSlug(shareSlug: string) {
    const response = await api.get(`/api/routes/share/${shareSlug}`);
    return normalizeRoute(unwrap<TravelRoute>(response) as RawRoute);
  },

  async create(payload: RoutePayload) {
    const response = await api.post('/api/routes', payload);
    return normalizeRoute(unwrap<TravelRoute>(response) as RawRoute);
  },

  async update(id: number, payload: RoutePayload) {
    const response = await api.put(`/api/routes/${id}`, payload);
    return normalizeRoute(unwrap<TravelRoute>(response) as RawRoute);
  },

  async delete(id: number) {
    await api.delete(`/api/routes/${id}`);
  },

  async save(id: number) {
    await api.post(`/api/routes/${id}/save`);
  },

  async unsave(id: number) {
    await api.delete(`/api/routes/${id}/save`);
  },

  async duplicate(id: number) {
    const response = await api.post(`/api/routes/${id}/duplicate`);
    return normalizeRoute(unwrap<TravelRoute>(response) as RawRoute);
  },

  async autoSort(stops: RoutePayload['stops']) {
    const response = await api.post('/api/routes/auto-sort', { stops });
    return unwrap<{ stops: RouteStop[]; totalDistanceKm: number; estimatedDurationMinutes: number }>(response);
  },

  async adminRoutes() {
    const response = await api.get('/api/admin/routes', { params: { limit: 100 } });
    return normalizePaginatedRoutes(unwrapPaginated<TravelRoute>(response));
  },

  async createAdmin(payload: RoutePayload) {
    const response = await api.post('/api/admin/routes', payload);
    return normalizeRoute(unwrap<TravelRoute>(response) as RawRoute);
  },

  async updateAdmin(id: number, payload: RoutePayload) {
    const response = await api.put(`/api/admin/routes/${id}`, payload);
    return normalizeRoute(unwrap<TravelRoute>(response) as RawRoute);
  },

  async publishAdmin(id: number, visibility: RouteVisibility) {
    const response = await api.patch(`/api/admin/routes/${id}/publish`, { visibility });
    return normalizeRoute(unwrap<TravelRoute>(response) as RawRoute);
  },

  async deleteAdmin(id: number) {
    await api.delete(`/api/admin/routes/${id}`);
  },
};
