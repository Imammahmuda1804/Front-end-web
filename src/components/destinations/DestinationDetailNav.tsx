import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart } from 'lucide-react';
import type { ComponentProps } from 'react';

export function DestinationTopActions({
  isFavorite,
  savingFavorite,
  onToggleFavorite,
  motionProps,
}: {
  isFavorite: boolean;
  savingFavorite: boolean;
  onToggleFavorite: () => void;
  motionProps: ComponentProps<typeof motion.nav>;
}) {
  return (
    <motion.nav
      {...motionProps}
      className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Navigasi detail destinasi"
    >
      <Link
        href="/search"
        className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm shadow-orange-100/50 transition-[border-color,color,box-shadow] duration-150 hover:border-primary hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Pencarian
      </Link>

      <button
        onClick={onToggleFavorite}
        disabled={savingFavorite}
        aria-label={isFavorite ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}
        className={`inline-flex min-h-11 w-fit items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold shadow-sm transition-[color,background-color,border-color,box-shadow] duration-150 focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60 ${
          isFavorite
            ? 'border-red-200 bg-red-50 text-red-600'
            : 'border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-red-500'
        }`}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500' : ''}`} />
        {isFavorite ? 'Favorit' : 'Simpan'}
      </button>
    </motion.nav>
  );
}

export function DestinationAnchorNav({
  navItems,
  activeSection,
}: {
  navItems: [string, string][];
  activeSection: string;
}) {
  return (
    <div className="-mx-4 mt-5 border-y border-orange-100 bg-slate-50 px-4 py-3 sm:mx-0 sm:rounded-full sm:border sm:bg-white sm:px-5 sm:shadow-sm">
      <div className="flex gap-2 overflow-x-auto">
        {navItems.map(([href, label]) => {
          const isActive = activeSection === href.replace('#', '');
          return (
            <a
              key={href}
              href={href}
              aria-current={isActive ? 'true' : undefined}
              className={`inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm font-extrabold transition-colors focus:outline-none focus:ring-4 focus:ring-primary/15 ${
                isActive
                  ? 'bg-orange-100 text-primary'
                  : 'text-slate-600 hover:bg-orange-50 hover:text-primary'
              }`}
            >
              {label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

