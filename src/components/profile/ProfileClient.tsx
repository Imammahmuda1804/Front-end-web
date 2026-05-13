'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/axios';
import { getImageUrl } from '@/lib/utils';
import { MapPin, Camera, Loader2, Heart, X, Sparkles, Undo2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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

// Map topic keywords to persona labels
const PERSONA_MAP: Record<string, { label: string; bg: string; text: string; border: string }> = {
  nature: { label: 'Pencinta Alam', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
  culture: { label: 'Penjelajah Budaya', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  adventure: { label: 'Petualang Sejati', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
  gastronomy: { label: 'Penikmat Kuliner', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  healing: { label: 'Pencari Ketenangan', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
  pantai: { label: 'Pencinta Pantai', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-100' },
  sejarah: { label: 'Penggemar Sejarah', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
};

function derivePersonas(favorites: Favorite[]): Array<{ label: string; bg: string; text: string; border: string }> {
  if (!favorites || favorites.length === 0) return [];
  
  const topicCounts: Record<string, number> = {};
  favorites.forEach(fav => {
    fav.destination.topics?.forEach(t => {
      const name = (t.name || t.topic_name || '').toLowerCase().replace(/topic \d+: /, '');
      const keywords = name.split(',').map(k => k.trim());
      keywords.forEach(kw => {
        if (kw) topicCounts[kw] = (topicCounts[kw] || 0) + 1;
      });
    });
  });

  // Match against known persona keywords
  const matched: Array<{ persona: typeof PERSONA_MAP[string]; count: number }> = [];
  for (const [key, persona] of Object.entries(PERSONA_MAP)) {
    const count = Object.entries(topicCounts)
      .filter(([k]) => k.includes(key))
      .reduce((sum, [, v]) => sum + v, 0);
    if (count > 0) matched.push({ persona, count });
  }

  matched.sort((a, b) => b.count - a.count);
  return matched.slice(0, 3).map(m => m.persona);
}

export default function ProfileClient() {
  const { user, isAuthenticated, setAuth } = useAuthStore();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      setName(user.name || '');
      setEmail(user.email || '');
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/api/favorites?limit=20');
      setFavorites(res.data.data);
    } catch (error) {
      console.error('Failed to fetch favorites', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      const updateData: any = { name, email };
      if (password) updateData.password = password;
      
      const res = await api.put('/api/users/me', updateData);
      setAuth(res.data.data, useAuthStore.getState().accessToken!);
      setMessage({ text: 'Profil berhasil diperbarui!', type: 'success' });
      setPassword('');
    } catch (error: any) {
      setMessage({ 
        text: error.response?.data?.message || 'Gagal memperbarui profil', 
        type: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setSaving(true);
      const res = await api.post('/api/users/me/avatar', formData);
      setAuth(res.data.data, useAuthStore.getState().accessToken!);
      setMessage({ text: 'Foto profil diperbarui!', type: 'success' });
    } catch (error: any) {
      setMessage({ 
        text: error.response?.data?.message || 'Gagal mengupload foto', 
        type: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  // Undo toast state for favorite removal
  const [undoToast, setUndoToast] = useState<{ fav: Favorite; timer: ReturnType<typeof setTimeout> } | null>(null);

  const handleRemoveFavorite = useCallback((destinationId: number) => {
    const removedFav = favorites.find(f => f.destination.id === destinationId);
    if (!removedFav) return;

    // Optimistic removal from UI
    setFavorites(prev => prev.filter(f => f.destination.id !== destinationId));

    // Clear any existing undo toast
    if (undoToast) {
      clearTimeout(undoToast.timer);
      // Execute the previous pending deletion immediately
      api.delete(`/api/favorites/${undoToast.fav.destination.id}`).catch(() => {});
    }

    // Set undo toast with 4s timer
    const timer = setTimeout(() => {
      api.delete(`/api/favorites/${destinationId}`).catch(err => {
        console.error('Failed to remove favorite', err);
        // Restore on API failure
        setFavorites(prev => [...prev, removedFav]);
      });
      setUndoToast(null);
    }, 4000);

    setUndoToast({ fav: removedFav, timer });
  }, [favorites, undoToast]);

  const handleUndoRemove = useCallback(() => {
    if (!undoToast) return;
    clearTimeout(undoToast.timer);
    setFavorites(prev => [...prev, undoToast.fav].sort((a, b) => b.id - a.id));
    setUndoToast(null);
  }, [undoToast]);

  // Derive personas from actual favorite data
  const personas = useMemo(() => derivePersonas(favorites), [favorites]);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-slate-50">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Silakan masuk terlebih dahulu</h1>
        <Link href="/login" className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors">
          Masuk
        </Link>
      </main>
    );
  }

  const avatarUrl = user?.profilePicture 
    ? getImageUrl(user.profilePicture) 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=FDBA74&color=C2410C`;

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">Profil & Preferensi</h1>
          <p className="text-slate-500 text-lg max-w-2xl">Kelola detail pribadi Anda, lihat sentimen perjalanan, dan jelajahi destinasi favorit.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Profile Details */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:bg-primary/10 transition-colors"></div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="relative group/avatar cursor-pointer" onClick={handleAvatarClick}>
                  <Image 
                    src={avatarUrl} 
                    alt={user?.name || 'Profile'} 
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Detail Pribadi</h2>
                </div>
              </div>

              {message.text && (
                <div className={`p-3 rounded-lg text-sm font-medium mb-6 flex justify-between items-center ${
                  message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message.text}
                  <button onClick={() => setMessage({text:'', type:''})} aria-label="Tutup notifikasi"><X className="w-4 h-4" /></button>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div>
                  <label htmlFor="profile-name" className="block text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">Nama Lengkap</label>
                  <input 
                    id="profile-name"
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-b border-slate-200 py-2 bg-transparent text-slate-800 font-medium focus:outline-none focus:border-primary transition-colors"
                    placeholder="Nama Anda"
                    autoComplete="name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="profile-email" className="block text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">Alamat Email</label>
                  <input 
                    id="profile-email"
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-b border-slate-200 py-2 bg-transparent text-slate-800 font-medium focus:outline-none focus:border-primary transition-colors"
                    placeholder="email@contoh.com"
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="profile-password" className="block text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">Kata Sandi Baru (Opsional)</label>
                  <input 
                    id="profile-password"
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-b border-slate-200 py-2 bg-transparent text-slate-800 font-medium focus:outline-none focus:border-primary transition-colors placeholder-slate-300"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-full transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
            
            {/* Travel Persona / Badges — derived from actual favorite topics */}
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase mb-4">Persona Perjalanan</h3>
              {personas.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {personas.map((p, i) => (
                    <span key={i} className={`px-4 py-2 ${p.bg} ${p.text} font-medium text-sm rounded-full border ${p.border}`}>
                      {p.label}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <span>Simpan beberapa destinasi favorit untuk mengetahui persona perjalananmu!</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Favorites */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Vibe Favoritmu</h2>
              <Link href="/search" className="text-sm font-bold text-primary hover:text-primary/80 border border-slate-200 hover:border-primary rounded-full px-5 py-2 transition-colors">
                Jelajahi Destinasi
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
              </div>
            ) : favorites.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Vibe Tersimpan</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">Kamu belum menyimpan destinasi favorit. Mulai jelajahi dan klik ikon hati untuk menyimpan vibe favoritmu.</p>
                <Link href="/search" className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary/90 transition-all shadow-md">
                  Jelajahi Destinasi
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favorites.map((fav) => (
                  <div key={fav.id} className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 bg-white">
                    {/* Image Area */}
                    <div className="h-60 overflow-hidden relative">
                      <Image 
                        src={fav.destination.thumbnailUrl ? getImageUrl(fav.destination.thumbnailUrl) : '/images/auth-bg.jpg'} 
                        alt={fav.destination.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>
                      
                      {/* Heart Button */}
                      <button 
                        onClick={() => handleRemoveFavorite(fav.destination.id)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white hover:bg-red-50 rounded-full flex items-center justify-center transition-colors shadow-sm border border-slate-200 group/btn"
                        aria-label="Hapus dari favorit"
                      >
                        <Heart className="w-5 h-5 text-red-500 fill-red-500 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>

                    {/* Content Area */}
                    <div className="p-6">
                      {/* Header row: Name + Vibe Match badge */}
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <Link href={`/destinations/${fav.destination.slug}`}>
                          <h3 className="text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors">{fav.destination.name}</h3>
                        </Link>
                        <div className="shrink-0 bg-primary/10 px-3 py-1.5 rounded-xl flex flex-col items-center">
                          <span className="text-[9px] font-bold text-primary/70 uppercase tracking-widest">Vibe</span>
                          <span className="text-lg font-black text-primary leading-tight">
                            {fav.destination.recommendationScore 
                              ? Math.round(fav.destination.recommendationScore * 100) 
                              : (fav.destination.positiveRatio ? Math.round(fav.destination.positiveRatio * 100) : 85)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center text-slate-500 text-sm font-medium mb-4">
                        <MapPin className="w-4 h-4 mr-1 opacity-70" />
                        {fav.destination.city}, {fav.destination.province}
                      </div>
                      
                      {/* Tags from real topic data */}
                      {fav.destination.topics && fav.destination.topics.length > 0 ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          {fav.destination.topics.slice(0, 3).map((t) => {
                            const label = (t.name || t.topic_name || '').replace(/Topic \d+: /, '').split(',')[0].trim();
                            return label ? (
                              <span key={t.id} className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-md capitalize">
                                #{label}
                              </span>
                            ) : null;
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Undo Toast */}
      {undoToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-4">
            <span className="text-sm font-medium">Favorit dihapus.</span>
            <button
              type="button"
              onClick={handleUndoRemove}
              className="inline-flex items-center gap-1.5 text-primary font-bold text-sm hover:text-primary/80 transition-colors"
            >
              <Undo2 className="w-4 h-4" />
              Batalkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
