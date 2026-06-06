'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  BarChart3,
  Heart,
  MapPin,
  ShieldCheck,
  Sparkles,
  Undo2,
} from 'lucide-react';
import Link from 'next/link';

import { api } from '@/lib/axios';
import { getImageUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import {
  AccountSafetyCard,
  CompareTray,
  FavoriteCard,
  FavoritesEmptyState,
  FavoritesHeader,
  FavoritesSkeleton,
  FavoriteToolbar,
  NoResultsState,
  PersonaCard,
  ProfileCard,
  StatCard,
} from './profile-components';

export interface FavoriteTopic {
  id: number;
  name?: string;
  topic_name?: string;
}

export interface Favorite {
  id: number;
  createdAt: string;
  destination: {
    id: number;
    name: string;
    slug: string;
    city: string;
    province: string;
    thumbnailUrl: string;
    recommendationScore: number | null;
    positiveRatio: number | null;
    googleRating: number | null;
    topics?: FavoriteTopic[];
  };
}

type ProfileMode = 'profile' | 'favorites';
export type SortKey = 'recent' | 'score' | 'rating' | 'name';
export type Message = { text: string; type: 'success' | 'error' | '' };
export type Persona = { label: string; bg: string; text: string; border: string };
type ProfileUpdatePayload = { name: string; email: string; password?: string };

interface Props {
  initialView?: ProfileMode;
}

const PERSONA_MAP: Record<string, Persona> = {
  nature: { label: 'Pencinta Alam', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
  culture: { label: 'Penjelajah Budaya', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  adventure: { label: 'Petualang Sejati', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
  gastronomy: { label: 'Penikmat Kuliner', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  healing: { label: 'Pencari Ketenangan', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
  pantai: { label: 'Pencinta Pantai', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-100' },
  sejarah: { label: 'Penggemar Sejarah', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
};

// Mengambil pesan error API dengan fallback yang aman.
function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object'
    && error !== null
    && 'response' in error
    && typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message === 'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }

  return fallback;
}

export function topicLabel(topic: FavoriteTopic) {
  return (topic.name || topic.topic_name || '').replace(/Topic \d+:\s*/, '').split(',')[0].trim();
}

export function scoreValue(favorite: Favorite) {
  return favorite.destination.recommendationScore ?? favorite.destination.positiveRatio ?? 0;
}

export function scoreLabel(favorite: Favorite) {
  const score = scoreValue(favorite);
  return score > 0 ? `${Math.round(score * 100)}%` : 'N/A';
}

// Menghitung persona perjalanan dari topik destinasi favorit.
function derivePersonas(favorites: Favorite[]): Persona[] {
  if (favorites.length === 0) return [];

  const topicCounts: Record<string, number> = {};
  favorites.forEach((fav) => {
    fav.destination.topics?.forEach((topic) => {
      const keywords = (topic.name || topic.topic_name || '')
        .toLowerCase()
        .replace(/topic \d+:\s*/, '')
        .split(',')
        .map((keyword) => keyword.trim());

      keywords.forEach((keyword) => {
        if (keyword) topicCounts[keyword] = (topicCounts[keyword] || 0) + 1;
      });
    });
  });

  const matched = Object.entries(PERSONA_MAP)
    .map(([key, persona]) => ({
      persona,
      count: Object.entries(topicCounts)
        .filter(([keyword]) => keyword.includes(key))
        .reduce((sum, [, count]) => sum + count, 0),
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  return matched.slice(0, 3).map((item) => item.persona);
}

// Menghitung statistik ringkas dari daftar favorit.
function deriveStats(favorites: Favorite[]) {
  const cities = favorites.reduce<Record<string, number>>((acc, fav) => {
    acc[fav.destination.city] = (acc[fav.destination.city] || 0) + 1;
    return acc;
  }, {});

  const topCity = Object.entries(cities).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Belum ada';
  const scored = favorites.filter((fav) => scoreValue(fav) > 0);
  const averageScore = scored.length
    ? Math.round((scored.reduce((sum, fav) => sum + scoreValue(fav), 0) / scored.length) * 100)
    : null;
  const averageRatingSource = favorites.filter((fav) => fav.destination.googleRating);
  const averageRating = averageRatingSource.length
    ? averageRatingSource.reduce((sum, fav) => sum + (fav.destination.googleRating || 0), 0) / averageRatingSource.length
    : null;

  return { topCity, averageScore, averageRating };
}

// Mengelola profil user, favorit, filter favorit, dan compare tray.
export default function ProfileClient({ initialView = 'profile' }: Props) {
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<Message>({ text: '', type: '' });
  const [undoToast, setUndoToast] = useState<{ fav: Favorite; timer: ReturnType<typeof setTimeout> } | null>(null);
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [selectedCompare, setSelectedCompare] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await api.get('/api/favorites?limit=50');
      setFavorites(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error: unknown) {
      console.error('Failed to fetch favorites', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      queueMicrotask(() => {
        setName(user.name || '');
        setEmail(user.email || '');
        void fetchFavorites();
      });
    } else {
      queueMicrotask(() => setLoading(false));
    }
  }, [fetchFavorites, isAuthenticated, user]);

  useEffect(() => {
    return () => {
      if (undoToast) clearTimeout(undoToast.timer);
    };
  }, [undoToast]);

  const personas = useMemo(() => derivePersonas(favorites), [favorites]);
  const stats = useMemo(() => deriveStats(favorites), [favorites]);
  const cities = useMemo(() => {
    return [...new Set(favorites.map((fav) => fav.destination.city).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }, [favorites]);

  const filteredFavorites = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return favorites
      .filter((fav) => {
        const topicText = fav.destination.topics?.map(topicLabel).join(' ') || '';
        const haystack = `${fav.destination.name} ${fav.destination.city} ${fav.destination.province} ${topicText}`.toLowerCase();
        const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
        const matchesCity = cityFilter === 'all' || fav.destination.city === cityFilter;
        return matchesQuery && matchesCity;
      })
      .sort((a, b) => {
        if (sortKey === 'score') return scoreValue(b) - scoreValue(a);
        if (sortKey === 'rating') return (b.destination.googleRating || 0) - (a.destination.googleRating || 0);
        if (sortKey === 'name') return a.destination.name.localeCompare(b.destination.name);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [cityFilter, favorites, query, sortKey]);

  const selectedFavorites = useMemo(() => {
    return selectedCompare
      .map((id) => favorites.find((fav) => fav.destination.id === id))
      .filter((fav): fav is Favorite => Boolean(fav));
  }, [favorites, selectedCompare]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const updateData: ProfileUpdatePayload = { name, email };
      if (password) updateData.password = password;

      const res = await api.put('/api/users/me', updateData);
      updateUser(res.data.data);
      setMessage({ text: 'Profil berhasil diperbarui.', type: 'success' });
      setPassword('');
    } catch (error: unknown) {
      setMessage({ text: getErrorMessage(error, 'Gagal memperbarui profil.'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setSaving(true);
      const res = await api.post('/api/users/me/avatar', formData);
      updateUser(res.data.data);
      setMessage({ text: 'Foto profil diperbarui.', type: 'success' });
    } catch (error: unknown) {
      setMessage({ text: getErrorMessage(error, 'Gagal mengupload foto.'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFavorite = useCallback((destinationId: number) => {
    const removedFav = favorites.find((fav) => fav.destination.id === destinationId);
    if (!removedFav) return;

    setFavorites((prev) => prev.filter((fav) => fav.destination.id !== destinationId));
    setSelectedCompare((prev) => prev.filter((id) => id !== destinationId));

    if (undoToast) {
      clearTimeout(undoToast.timer);
      api.delete(`/api/favorites/${undoToast.fav.destination.id}`).catch(() => {});
    }

    const timer = setTimeout(() => {
      api.delete(`/api/favorites/${destinationId}`).catch((error: unknown) => {
        console.error('Failed to remove favorite', error);
        setFavorites((prev) => [...prev, removedFav]);
      });
      setUndoToast(null);
    }, 4000);

    setUndoToast({ fav: removedFav, timer });
  }, [favorites, undoToast]);

  const handleUndoRemove = useCallback(() => {
    if (!undoToast) return;
    clearTimeout(undoToast.timer);
    setFavorites((prev) => [...prev, undoToast.fav].sort((a, b) => b.id - a.id));
    setUndoToast(null);
  }, [undoToast]);

  const toggleCompare = (destinationId: number) => {
    setSelectedCompare((prev) => {
      if (prev.includes(destinationId)) return prev.filter((id) => id !== destinationId);
      return prev.length >= 3 ? [...prev.slice(1), destinationId] : [...prev, destinationId];
    });
  };

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 pb-20 pt-32 text-center">
        <ShieldCheck className="mb-4 h-12 w-12 text-primary" />
        <h1 className="mb-3 text-2xl font-black text-slate-900">Silakan masuk terlebih dahulu</h1>
        <p className="mb-6 max-w-md text-sm font-semibold leading-6 text-slate-500">
          Profil dan favorit tersimpan hanya tersedia setelah Anda masuk.
        </p>
        <Link href="/login" className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 text-sm font-black text-white shadow-lg shadow-orange-200 transition-[color,background-color,border-color,box-shadow,transform,opacity] hover:-translate-y-0.5 hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20">
          Masuk
        </Link>
      </main>
    );
  }

  const avatarUrl = user?.profilePicture
    ? getImageUrl(user.profilePicture)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=FDBA74&color=C2410C`;
  const isFavoritesPage = initialView === 'favorites';

  return (
    <main className="min-h-screen bg-slate-50 pb-24 pt-28">
      <div className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-10">
        <section className="mb-8 overflow-hidden rounded-xl border border-orange-100 bg-orange-50/70 p-6 shadow-sm shadow-orange-100/50 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-primary shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Ruang perjalanan pribadi
              </p>
              <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                {isFavoritesPage ? 'Favorit Saya' : 'Profil & Preferensi'}
              </h1>
              <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
                {isFavoritesPage
                  ? 'Temukan ulang destinasi tersimpan, sortir berdasarkan vibe, lalu pilih kandidat untuk dibandingkan.'
                  : 'Kelola detail pribadi, lihat pola perjalanan, dan lanjutkan eksplorasi dari destinasi favorit Anda.'}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[34rem]">
              <StatCard icon={Heart} label="Favorit" value={String(favorites.length)} helper="Destinasi tersimpan" />
              <StatCard icon={MapPin} label="Kota dominan" value={stats.topCity} helper="Paling sering disimpan" />
              <StatCard icon={BarChart3} label="Rata-rata vibe" value={stats.averageScore !== null ? `${stats.averageScore}%` : 'N/A'} helper="Dari skor tersedia" />
            </div>
          </div>
        </section>

        <div className={isFavoritesPage ? 'space-y-6' : 'grid grid-cols-1 gap-8 lg:grid-cols-12'}>
          {!isFavoritesPage && (
            <aside className="space-y-6 lg:col-span-4">
              <ProfileCard
                avatarUrl={avatarUrl}
                email={email}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                handleUpdateProfile={handleUpdateProfile}
                message={message}
                name={name}
                password={password}
                saving={saving}
                setEmail={setEmail}
                setMessage={setMessage}
                setName={setName}
                setPassword={setPassword}
                userName={user?.name || 'Profile'}
              />
              <PersonaCard personas={personas} />
              <AccountSafetyCard email={email} />
            </aside>
          )}

          <section className={isFavoritesPage ? 'space-y-6' : 'space-y-6 lg:col-span-8'}>
            <FavoritesHeader total={favorites.length} filtered={filteredFavorites.length} isFavoritesPage={isFavoritesPage} />

            <FavoriteToolbar
              cities={cities}
              cityFilter={cityFilter}
              query={query}
              setCityFilter={setCityFilter}
              setQuery={setQuery}
              setSortKey={setSortKey}
              sortKey={sortKey}
            />

            {loading ? (
              <FavoritesSkeleton />
            ) : favorites.length === 0 ? (
              <FavoritesEmptyState />
            ) : filteredFavorites.length === 0 ? (
              <NoResultsState onReset={() => {
                setQuery('');
                setCityFilter('all');
                setSortKey('recent');
              }} />
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredFavorites.map((favorite) => (
                  <FavoriteCard
                    key={favorite.id}
                    favorite={favorite}
                    isSelected={selectedCompare.includes(favorite.destination.id)}
                    onRemove={handleRemoveFavorite}
                    onToggleCompare={toggleCompare}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {selectedFavorites.length > 0 && (
        <CompareTray favorites={selectedFavorites} onClear={() => setSelectedCompare([])} />
      )}

      {undoToast && (
        <div
          className={`fixed inset-x-4 bottom-5 z-50 mx-auto max-w-md ${reduceMotion ? '' : 'animate-in slide-in-from-bottom-4 fade-in duration-300'}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-950 px-5 py-3 text-white shadow-xl">
            <span className="text-sm font-semibold">Favorit dihapus.</span>
            <button
              type="button"
              onClick={handleUndoRemove}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-2 text-sm font-black text-orange-200 transition-colors hover:text-white focus:outline-none focus:ring-4 focus:ring-white/15"
            >
              <Undo2 className="h-4 w-4" />
              Batalkan
            </button>
          </div>
        </div>
      )}
    </main>
  );
}




