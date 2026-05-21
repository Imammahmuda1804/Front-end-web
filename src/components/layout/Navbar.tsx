'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore, writeAuthCookie } from '@/store/auth.store';
import { getImageUrl } from '@/lib/utils';
import { Menu, User, LogOut } from 'lucide-react';
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
    { href: '/', label: 'Beranda' },
    { href: '/search', label: 'Eksplorasi' },
    { href: '/compare', label: 'Bandingkan' },
  ];

  return (
    <nav aria-label="Navigasi Utama" className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm transition-all duration-300">
      <div className="container mx-auto px-6 lg:px-12 flex h-16 items-center justify-between">
        <div className="flex items-center gap-8 md:gap-12">
          <Link href="/" className="flex items-center space-x-3 group">
            <Image src="/images/logo-icon.png" alt="RanahInsight Logo" width={36} height={36} className="object-contain drop-shadow-sm group-hover:scale-105 transition-transform" />
            <span className="font-black text-slate-900 tracking-tight text-lg sm:text-xl">RANAHINSIGHT</span>
          </Link>
          <div className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-3 py-2 text-[15px] font-bold transition-all hover:bg-orange-50 hover:text-primary ${
                  pathname === link.href ? 'bg-orange-50 text-primary' : 'text-slate-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {showAuthenticatedUi ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-10 w-10 rounded-full flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 focus:outline-none transition-colors overflow-hidden">
                {user.profilePicture ? (
                  <Image src={getImageUrl(user.profilePicture)} alt={user.name} width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2 rounded-xl p-2 shadow-lg border border-slate-100 bg-white" align="end">
                <div className="flex items-center justify-start gap-3 p-3 bg-slate-50 rounded-lg mb-2">
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
              <Link href="/register" className="rounded-full bg-primary px-6 py-2.5 text-sm font-black text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-md">Daftar</Link>
            </div>
          )}

          
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="md:hidden flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 focus:outline-none transition-colors">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white border-l-slate-100 sm:max-w-xs">
              <div className="flex flex-col gap-6 mt-12">
                <div className="flex items-center gap-3 mb-4">
                  <Image src="/images/logo-icon.png" alt="Logo" width={32} height={32} />
                  <span className="font-black text-slate-900 tracking-tight text-lg">RANAHINSIGHT</span>
                </div>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-bold text-slate-800 hover:text-primary border-b border-slate-100 pb-4 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
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
