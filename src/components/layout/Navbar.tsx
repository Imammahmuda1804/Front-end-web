'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore, writeAuthCookie } from '@/store/auth.store';
import { getImageUrl } from '@/lib/utils';
import { Compass, GitCompareArrows, LogOut, MapPinned, Menu, Plus, Route as RouteIcon, User, Bookmark } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const subscribeToHydration = () => () => {};
const getHydratedSnapshot = () => true;
const getServerHydratedSnapshot = () => false;

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const hasMounted = React.useSyncExternalStore(subscribeToHydration, getHydratedSnapshot, getServerHydratedSnapshot);
  const showAuthenticatedUi = hasMounted && isAuthenticated && user;

  // Sinkronkan cookie dari sesi localStorage.
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (typeof document !== 'undefined' && !document.cookie.includes('auth-storage=')) {
        writeAuthCookie(user, true);
      }
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const navLinks = [
    { href: '/', label: 'Beranda', icon: Compass },
    { href: '/destinations', label: 'Destinasi', icon: MapPinned },
    { href: '/search', label: 'Eksplorasi', icon: Compass },
    { href: '/routes', label: 'Rute', icon: RouteIcon },
    { href: '/compare', label: 'Bandingkan', icon: GitCompareArrows },
  ];
  const quickLinks = [
    { href: '/destinations', label: 'Destinasi', icon: MapPinned, tone: 'bg-orange-50 text-primary border-orange-100' },
    { href: '/routes/saved', label: 'Rute tersimpan', icon: Bookmark, tone: 'bg-sky-50 text-ai border-sky-100' },
    { href: '/routes/new', label: 'Buat rute', icon: Plus, tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { href: '/compare', label: 'Bandingkan', icon: GitCompareArrows, tone: 'bg-slate-50 text-slate-700 border-slate-200' },
  ];

  return (
    <nav aria-label="Navigasi Utama" className="fixed left-0 right-0 top-0 z-50 w-full px-3 pt-3">
      <div className="container mx-auto flex h-16 items-center justify-between rounded-xl border border-white/65 bg-white/72 px-4 shadow-xl shadow-slate-950/10 ring-1 ring-slate-950/[0.03] backdrop-blur-xl transition-all duration-300 md:px-6">
        <div className="flex items-center gap-8 md:gap-12">
          <Link href="/" className="group flex items-center space-x-3 rounded-xl bg-white/70 py-1.5 pl-1.5 pr-4 ring-1 ring-orange-100/80 backdrop-blur">
            <Image src="/images/logo-icon.png" alt="RanahInsight Logo" width={36} height={36} className="object-contain drop-shadow-sm group-hover:scale-105 transition-transform" />
            <span className="font-black text-slate-900 tracking-tight text-lg sm:text-xl">RANAHINSIGHT</span>
          </Link>
          <div className="hidden items-center gap-1 rounded-xl bg-white/55 p-1 ring-1 ring-slate-200/75 backdrop-blur md:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-black transition-all hover:bg-white/85 hover:text-primary hover:shadow-sm ${
                  active ? 'bg-white text-primary shadow-sm ring-1 ring-orange-100' : 'text-slate-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {showAuthenticatedUi ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white/80 text-slate-700 transition-colors hover:bg-white focus:outline-none">
                {user.profilePicture ? (
                  <Image src={getImageUrl(user.profilePicture)} alt={user.name} width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-2 w-56 rounded-xl border border-slate-100 bg-white/95 p-2 shadow-lg backdrop-blur" align="end">
                <div className="mb-2 flex items-center justify-start gap-3 rounded-lg bg-slate-50 p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                    <p className="w-48 truncate text-xs text-slate-500 font-medium">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-slate-100" />
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem className="rounded-md focus:!bg-orange-50 focus:!text-primary cursor-pointer text-slate-700 font-medium transition-colors">
                    <Link href="/admin" className="w-full">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="rounded-md focus:!bg-orange-50 focus:!text-primary cursor-pointer text-slate-700 font-medium transition-colors">
                  <Link href="/profile" className="w-full">Profil Saya</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-md focus:!bg-orange-50 focus:!text-primary cursor-pointer text-slate-700 font-medium transition-colors">
                  <Link href="/favorites" className="w-full">Favorit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-md focus:!bg-orange-50 focus:!text-primary cursor-pointer text-slate-700 font-medium transition-colors">
                  <Link href="/routes/saved" className="w-full">Rute tersimpan</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:!text-red-700 focus:!bg-red-50 rounded-md cursor-pointer font-bold mt-1 transition-colors">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex gap-3 items-center">
              <Link href="/login" className="px-4 py-2 font-bold text-slate-700 transition-colors hover:text-primary">Masuk</Link>
              <Link href="/register" className="rounded-xl bg-primary px-6 py-2.5 text-sm font-black text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-md">Daftar</Link>
            </div>
          )}

          
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/85 text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-white focus:outline-none md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="border-l-white/50 bg-white/80 p-0 backdrop-blur-xl sm:max-w-sm">
              <div className="flex min-h-full flex-col gap-5 p-5 pt-10">
                <div className="rounded-xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-3">
                    <Image src="/images/logo-icon.png" alt="Logo" width={36} height={36} />
                    <div>
                      <span className="block font-black text-slate-900 tracking-tight text-lg">RANAHINSIGHT</span>
                      <span className="text-xs font-bold text-slate-500">AI Travel Sumatera Barat</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {quickLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`min-h-24 rounded-xl border p-3 text-sm font-black ${link.tone}`}
                      >
                        <Icon className="mb-3 h-5 w-5" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 text-base font-black transition-colors ${
                        (link.href === '/' ? pathname === '/' : pathname.startsWith(link.href))
                          ? 'border-orange-200 bg-white text-primary shadow-sm'
                          : 'border-white/70 bg-white/70 text-slate-700 hover:text-primary'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  );
                })}
                {(!hasMounted || !isAuthenticated) && (
                  <div className="flex flex-col gap-3 mt-4">
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="text-center font-bold text-slate-700 bg-slate-100 py-3 rounded-xl hover:bg-slate-200 transition-colors">Masuk</Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)} className="text-center font-bold text-white bg-primary py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">Daftar</Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
