'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Camera,
  Compass,
  GitCompareArrows,
  Heart,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Undo2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { api } from '@/lib/axios';
import { getImageUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { NativeSelect } from '@/components/ui/native-select';

interface FavoriteTopic {
  id: number;
  name?: string;
  topic_name?: string;
}

interface Favorite {
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
type SortKey = 'recent' | 'score' | 'rating' | 'name';
type Message = { text: string; type: 'success' | 'error' | '' };
type Persona = { label: string; bg: string; text: string; border: string };
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

function topicLabel(topic: FavoriteTopic) {
  return (topic.name || topic.topic_name || '').replace(/Topic \d+:\s*/, '').split(',')[0].trim();
}

function scoreValue(favorite: Favorite) {
  return favorite.destination.recommendationScore ?? favorite.destination.positiveRatio ?? 0;
}

function scoreLabel(favorite: Favorite) {
  const score = scoreValue(favorite);
  return score > 0 ? `${Math.round(score * 100)}%` : 'N/A';
}

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
        <Link href="/login" className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 text-sm font-black text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20">
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
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-orange-100 bg-orange-50/70 p-6 shadow-sm shadow-orange-100/50 sm:p-8">
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
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-950 px-5 py-3 text-white shadow-xl">
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

function StatCard({ icon: Icon, label, value, helper }: { icon: React.ElementType; label: string; value: string; helper: string }) {
  return (
    <div className="rounded-3xl border border-white bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{helper}</p>
    </div>
  );
}

function ProfileCard({
  avatarUrl,
  email,
  fileInputRef,
  handleFileChange,
  handleUpdateProfile,
  message,
  name,
  password,
  saving,
  setEmail,
  setMessage,
  setName,
  setPassword,
  userName,
}: {
  avatarUrl: string;
  email: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpdateProfile: (e: React.FormEvent) => void;
  message: Message;
  name: string;
  password: string;
  saving: boolean;
  setEmail: (value: string) => void;
  setMessage: (value: Message) => void;
  setName: (value: string) => void;
  setPassword: (value: string) => void;
  userName: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          className="group/avatar relative cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Ubah foto profil"
        >
          <Image src={avatarUrl} alt={userName} width={72} height={72} className="h-[72px] w-[72px] rounded-full border-4 border-orange-50 object-cover shadow-sm" />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/45 opacity-0 transition-opacity group-hover/avatar:opacity-100">
            <Camera className="h-6 w-6 text-white" />
          </span>
        </button>
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} aria-label="Pilih foto profil" />
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Detail Pribadi</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Akun Anda</h2>
        </div>
      </div>

      {message.text && (
        <div
          className={`mb-6 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-bold ${
            message.type === 'success' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-red-100 bg-red-50 text-red-600'
          }`}
          role="status"
        >
          {message.text}
          <button type="button" onClick={() => setMessage({ text: '', type: '' })} aria-label="Tutup notifikasi" className="rounded-full p-1 focus:outline-none focus:ring-4 focus:ring-current/15">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="space-y-5">
        <ProfileInput id="profile-name" label="Nama Lengkap" value={name} onChange={setName} autoComplete="name" required />
        <ProfileInput id="profile-email" label="Alamat Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
        <ProfileInput id="profile-password" label="Kata Sandi Baru (Opsional)" type="password" value={password} onChange={setPassword} autoComplete="new-password" placeholder="Kosongkan jika tidak ingin mengubah" />

        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-black text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}

function ProfileInput({
  autoComplete,
  id,
  label,
  onChange,
  placeholder,
  required,
  type = 'text',
  value,
}: {
  autoComplete: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
      />
    </div>
  );
}

function PersonaCard({ personas }: { personas: Persona[] }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">Persona Perjalanan</h3>
      {personas.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {personas.map((persona) => (
            <span key={persona.label} className={`rounded-full border px-4 py-2 text-sm font-black ${persona.bg} ${persona.text} ${persona.border}`}>
              {persona.label}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-500">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>Simpan beberapa destinasi favorit untuk membaca pola perjalananmu.</span>
        </div>
      )}
    </div>
  );
}

function AccountSafetyCard({ email }: { email: string }) {
  return (
    <div className="rounded-[1.75rem] border border-orange-100 bg-orange-50/60 p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-1 h-5 w-5 text-primary" />
        <div>
          <h3 className="font-black text-slate-950">Keamanan Akun</h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
            Email aktif: <span className="text-slate-900">{email || '-'}</span>. Gunakan kata sandi baru hanya saat ingin mengganti akses.
          </p>
        </div>
      </div>
    </div>
  );
}

function FavoritesHeader({ filtered, isFavoritesPage, total }: { filtered: number; isFavoritesPage: boolean; total: number }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">{isFavoritesPage ? 'Koleksi destinasi' : 'Favorit'}</p>
        <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Vibe Favoritmu</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Menampilkan {filtered} dari {total} destinasi tersimpan.
        </p>
      </div>
      <Link href="/search" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-orange-200 bg-white px-5 text-sm font-black text-primary transition-all hover:-translate-y-0.5 hover:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15">
        Jelajahi Destinasi
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function FavoriteToolbar({
  cities,
  cityFilter,
  query,
  setCityFilter,
  setQuery,
  setSortKey,
  sortKey,
}: {
  cities: string[];
  cityFilter: string;
  query: string;
  setCityFilter: (value: string) => void;
  setQuery: (value: string) => void;
  setSortKey: (value: SortKey) => void;
  sortKey: SortKey;
}) {
  return (
    <div className="grid gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_13rem_13rem]">
      <label className="relative block">
        <span className="sr-only">Cari favorit</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-12 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
          placeholder="Cari nama, kota, atau topik"
        />
      </label>
      <label>
        <span className="sr-only">Filter kota</span>
        <NativeSelect
          aria-label="Filter kota favorit"
          value={cityFilter}
          onValueChange={setCityFilter}
          options={[
            { value: 'all', label: 'Semua kota', description: 'Tampilkan semua favorit' },
            ...cities.map((city) => ({ value: city, label: city })),
          ]}
        />
      </label>
      <label>
        <span className="sr-only">Urutkan favorit</span>
        <NativeSelect
          aria-label="Urutkan favorit"
          value={sortKey}
          onValueChange={(nextValue) => setSortKey(nextValue as SortKey)}
          options={[
            { value: 'recent', label: 'Terbaru disimpan' },
            { value: 'score', label: 'Skor vibe tertinggi' },
            { value: 'rating', label: 'Rating Google' },
            { value: 'name', label: 'Nama A-Z' },
          ]}
        />
      </label>
    </div>
  );
}

function FavoriteCard({
  favorite,
  isSelected,
  onRemove,
  onToggleCompare,
}: {
  favorite: Favorite;
  isSelected: boolean;
  onRemove: (destinationId: number) => void;
  onToggleCompare: (destinationId: number) => void;
}) {
  const topics = favorite.destination.topics?.map(topicLabel).filter(Boolean).slice(0, 3) || [];

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/60">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Image
          src={favorite.destination.thumbnailUrl ? getImageUrl(favorite.destination.thumbnailUrl) : '/images/auth-bg.jpg'}
          alt={favorite.destination.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/65 to-transparent" />
        <button
          type="button"
          onClick={() => onRemove(favorite.destination.id)}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white text-red-500 shadow-sm transition-colors hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100"
          aria-label={`Hapus ${favorite.destination.name} dari favorit`}
        >
          <Heart className="h-5 w-5 fill-red-500" />
        </button>
        <div className="absolute bottom-4 left-4 rounded-2xl bg-white px-3 py-2 shadow-sm">
          <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-primary">Vibe</span>
          <span className="text-lg font-black leading-none text-slate-950">{scoreLabel(favorite)}</span>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/destinations/${favorite.destination.slug}`} className="group/link focus:outline-none focus:ring-4 focus:ring-primary/15">
              <h3 className="line-clamp-2 text-xl font-black leading-tight text-slate-950 transition-colors group-hover/link:text-primary">
                {favorite.destination.name}
              </h3>
            </Link>
            <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-slate-500">
              <MapPin className="h-4 w-4 text-primary" />
              {favorite.destination.city}, {favorite.destination.province}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-black text-slate-700 ring-1 ring-slate-200">
            <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
            {favorite.destination.googleRating?.toFixed(1) || '-'}
          </div>
        </div>

        <div className="mb-4 flex min-h-7 flex-wrap gap-1.5">
          {topics.length > 0 ? topics.map((topic) => (
            <span key={topic} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black capitalize text-slate-600">
              #{topic}
            </span>
          )) : (
            <span className="text-xs font-bold text-slate-400">Topik belum tersedia</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onToggleCompare(favorite.destination.id)}
            aria-pressed={isSelected}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-3 text-xs font-black transition-all focus:outline-none focus:ring-4 focus:ring-primary/15 ${
              isSelected
                ? 'border-primary bg-orange-50 text-primary'
                : 'border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary'
            }`}
          >
            <GitCompareArrows className="h-4 w-4" />
            {isSelected ? 'Dipilih' : 'Bandingkan'}
          </button>
          <Link
            href={`/destinations/${favorite.destination.slug}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-3 text-xs font-black text-white transition-all hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20"
          >
            Detail
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function FavoritesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Memuat favorit">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
          <div className="aspect-[16/10] animate-pulse bg-slate-200" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-200" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
            <div className="h-10 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FavoritesEmptyState() {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-orange-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
        <Heart className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-black text-slate-900">Belum ada vibe tersimpan</h3>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
        Mulai jelajahi dan simpan destinasi yang cocok dengan gaya perjalanan Anda.
      </p>
      <Link href="/search" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-primary px-7 text-sm font-black text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20">
        Jelajahi Destinasi
      </Link>
    </div>
  );
}

function NoResultsState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
      <Compass className="mx-auto mb-4 h-10 w-10 text-slate-300" />
      <h3 className="text-xl font-black text-slate-900">Favorit tidak ditemukan</h3>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
        Coba kata kunci lain atau reset filter kota dan urutan.
      </p>
      <button type="button" onClick={onReset} className="mt-6 inline-flex min-h-11 items-center rounded-full border border-orange-200 bg-orange-50 px-6 text-sm font-black text-primary focus:outline-none focus:ring-4 focus:ring-primary/15">
        Reset filter
      </button>
    </div>
  );
}

function CompareTray({ favorites, onClear }: { favorites: Favorite[]; onClear: () => void }) {
  const href = favorites.length >= 2
    ? `/compare?d1=${favorites[0].destination.id}&d2=${favorites[1].destination.id}`
    : '/compare';

  return (
    <div className="fixed inset-x-4 bottom-5 z-40 mx-auto max-w-4xl rounded-[1.5rem] border border-orange-200 bg-white p-4 shadow-2xl shadow-slate-900/15">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Compare tray</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {favorites.map((favorite) => (
              <span key={favorite.id} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
                {favorite.destination.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={onClear} className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 px-5 text-sm font-black text-slate-600 focus:outline-none focus:ring-4 focus:ring-primary/15">
            Bersihkan
          </button>
          <Link
            href={href}
            aria-disabled={favorites.length < 2}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-black focus:outline-none focus:ring-4 focus:ring-primary/20 ${
              favorites.length >= 2 ? 'bg-primary text-white' : 'pointer-events-none bg-slate-100 text-slate-400'
            }`}
          >
            <GitCompareArrows className="h-4 w-4" />
            Bandingkan
          </Link>
        </div>
      </div>
    </div>
  );
}
