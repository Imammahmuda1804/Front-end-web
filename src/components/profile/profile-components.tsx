import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Camera, Compass, GitCompareArrows, Heart, Loader2, MapPin, Search, ShieldCheck, Sparkles, Star, X } from 'lucide-react';
import { NativeSelect } from '@/components/ui/native-select';
import { getImageUrl } from '@/lib/utils';
import { scoreLabel, topicLabel, type Favorite, type Message, type Persona, type SortKey } from './ProfileClient';
export function StatCard({ icon: Icon, label, value, helper }: { icon: React.ElementType; label: string; value: string; helper: string }) {
  return (
    <div className="rounded-xl border border-white bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{helper}</p>
    </div>
  );
}

export function ProfileCard({
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
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
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
          className={`mb-6 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-bold ${
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
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-black text-white shadow-lg shadow-orange-200 transition-[color,background-color,border-color,box-shadow,transform,opacity] hover:-translate-y-0.5 hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}

export function ProfileInput({
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
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition-[color,background-color,border-color,box-shadow,transform,opacity] placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
      />
    </div>
  );
}

export function PersonaCard({ personas }: { personas: Persona[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
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
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-500">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>Simpan beberapa destinasi favorit untuk membaca pola perjalananmu.</span>
        </div>
      )}
    </div>
  );
}

export function AccountSafetyCard({ email }: { email: string }) {
  return (
    <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-6 shadow-sm">
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

export function FavoritesHeader({ filtered, isFavoritesPage, total }: { filtered: number; isFavoritesPage: boolean; total: number }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">{isFavoritesPage ? 'Koleksi destinasi' : 'Favorit'}</p>
        <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Vibe Favoritmu</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Menampilkan {filtered} dari {total} destinasi tersimpan.
        </p>
      </div>
      <Link href="/search" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-orange-200 bg-white px-5 text-sm font-black text-primary transition-[color,background-color,border-color,box-shadow,transform,opacity] hover:-translate-y-0.5 hover:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15">
        Jelajahi Destinasi
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function FavoriteToolbar({
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
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_13rem_13rem]">
      <label className="relative block">
        <span className="sr-only">Cari favorit</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-12 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition-[color,background-color,border-color,box-shadow,transform,opacity] placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
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

export function FavoriteCard({
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
    <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/60">
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
        <div className="absolute bottom-4 left-4 rounded-xl bg-white px-3 py-2 shadow-sm">
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
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-3 text-xs font-black transition-[color,background-color,border-color,box-shadow,transform,opacity] focus:outline-none focus:ring-4 focus:ring-primary/15 ${
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
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-3 text-xs font-black text-white transition-[color,background-color,border-color,box-shadow,transform,opacity] hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20"
          >
            Detail
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/routes/new?destinationId=${favorite.destination.id}`}
            className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 text-xs font-black text-ai transition-[color,background-color,border-color,box-shadow,transform,opacity] hover:bg-ai hover:text-white focus:outline-none focus:ring-4 focus:ring-sky-100"
          >
            Tambahkan ke rute
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function FavoritesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Memuat favorit">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
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

export function FavoritesEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-orange-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
        <Heart className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-black text-slate-900">Belum ada vibe tersimpan</h3>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
        Mulai jelajahi dan simpan destinasi yang cocok dengan gaya perjalanan Anda.
      </p>
      <Link href="/search" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-primary px-7 text-sm font-black text-white shadow-lg shadow-orange-200 transition-[color,background-color,border-color,box-shadow,transform,opacity] hover:-translate-y-0.5 hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20">
        Jelajahi Destinasi
      </Link>
    </div>
  );
}

export function NoResultsState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
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

export function CompareTray({ favorites, onClear }: { favorites: Favorite[]; onClear: () => void }) {
  const href = favorites.length >= 2
    ? `/compare?d1=${favorites[0].destination.id}&d2=${favorites[1].destination.id}`
    : '/compare';

  return (
    <div className="fixed inset-x-4 bottom-5 z-40 mx-auto max-w-4xl rounded-xl border border-orange-200 bg-white p-4 shadow-2xl shadow-slate-900/15">
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



