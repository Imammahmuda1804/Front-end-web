'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore, writeAuthCookie } from '@/store/auth.store';
import { getImageUrl } from '@/lib/utils';
import { Compass, GitCompareArrows, LogOut, MapPinned, Menu, Route as RouteIcon, User } from 'lucide-react';
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
  return (
    <nav aria-label="Navigasi Utama" className="fixed left-0 right-0 top-0 z-50 w-full px-3 pt-3">
      <div className="container mx-auto flex h-16 items-center justify-between overflow-hidden rounded-lg border border-white/65 bg-[oklch(0.99_0.008_62/0.84)] px-4 shadow-[0_12px_32px_rgba(15,23,42,0.09)] ring-1 ring-slate-950/[0.04] backdrop-blur-xl md:px-6">
        <div className="flex items-center gap-8 md:gap-12">
          <Link href="/" className="group flex items-center space-x-3 py-1.5">
            <Image src="/images/logo-icon.png" alt="RanahInsight Logo" width={36} height={36} className="object-contain drop-shadow-sm" />
            <span className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">RANAHINSIGHT</span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors duration-150 hover:bg-white/70 hover:text-primary ${
                  active ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
                {active && <span className="absolute bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 bg-primary" />}
              </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {showAuthenticatedUi ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white/80 text-slate-700 transition-colors hover:bg-white focus:outline-none">
                {user.profilePicture ? (
                  <Image src={getImageUrl(user.profilePicture)} alt={user.name} width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-2 w-56 rounded-lg border border-slate-100 bg-white/95 p-2 shadow-lg backdrop-blur" align="end">
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
              <Link href="/register" className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm shadow-primary/20 transition-[transform,background-color] duration-150 hover:bg-primary/90 active:scale-[0.98]">Daftar</Link>
            </div>
          )}

          
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/85 text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-white focus:outline-none md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="border-l-white/50 bg-white/80 p-0 backdrop-blur-xl sm:max-w-sm">
              <div className="flex min-h-full flex-col gap-5 p-5 pt-10">
                <div className="border-b border-slate-200 pb-5">
                  <div className="flex items-center gap-3">
                    <Image src="/images/logo-icon.png" alt="Logo" width={36} height={36} />
                    <div>
                      <span className="block text-lg font-extrabold tracking-tight text-slate-900">RANAHINSIGHT</span>
                      <span className="text-xs font-semibold text-slate-500">Panduan wisata berbasis ulasan</span>
                    </div>
                  </div>
                </div>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex min-h-12 items-center gap-3 rounded-lg px-4 text-base font-bold transition-colors ${
                        (link.href === '/' ? pathname === '/' : pathname.startsWith(link.href))
                          ? 'bg-orange-50 text-primary'
                          : 'text-slate-700 hover:bg-white/70 hover:text-primary'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  );
                })}
                {showAuthenticatedUi && (
                  <Link
                    href="/routes/saved"
                    onClick={() => setMobileOpen(false)}
                    className="flex min-h-12 items-center gap-3 rounded-lg bg-sky-50 px-4 text-base font-bold text-ai"
                  >
                    <RouteIcon className="h-5 w-5" />
                    Rute tersimpan
                  </Link>
                )}
                {(!hasMounted || !isAuthenticated) && (
                  <div className="flex flex-col gap-3 mt-4">
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-lg bg-slate-100 py-3 text-center font-bold text-slate-700 transition-colors hover:bg-slate-200">Masuk</Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)} className="rounded-lg bg-primary py-3 text-center font-bold text-white shadow-md shadow-primary/20 transition-colors hover:bg-primary/90">Daftar</Link>
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
