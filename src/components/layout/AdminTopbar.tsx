'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { buttonVariants } from '@/components/ui/button';
import { Menu, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';
import Image from 'next/image';

// Menu admin yang ditampilkan pada drawer mobile.
const mobileAdminLinks = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/destinations', label: 'Destinations' },
  { href: '/admin/reviews', label: 'Manajemen Review' },
  { href: '/admin/compare', label: 'Compare Analytics' },
  { href: '/admin/topics', label: 'Manajemen Topik' },
  { href: '/admin/scraper', label: 'Scraper' },
  { href: '/admin/nlp-processing', label: 'NLP Processing' },
  { href: '/admin/users', label: 'Users' },
];

// Topbar admin untuk navigasi mobile, profil, dan logout.
export function AdminTopbar() {
  const { user, logout } = useAuthStore();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 sm:gap-x-6 sm:px-6 lg:px-8">
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger className="md:hidden -m-2.5 p-2.5 text-muted-foreground">
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="h-16 flex items-center px-6 border-b">
            <div className="flex items-center gap-2">
              <Image src="/images/logo-icon.png" alt="RanahInsight" width={28} height={28} />
              <span className="font-bold text-lg text-primary">RANAHINSIGHT</span>
            </div>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {mobileAdminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSheetOpen(false)}
                className="px-3 py-2 hover:bg-muted rounded-md text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 items-center justify-end gap-x-4 lg:gap-x-6">
          
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "-m-1.5 flex items-center p-1.5" })}>
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm mr-2">
                {user?.name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="text-sm font-semibold leading-6">
                  {user?.name || 'Admin'}
                </span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-1">
              <DropdownMenuItem>
                <Link href="/">Kembali ke Web Publik</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
    </header>
  );
}
