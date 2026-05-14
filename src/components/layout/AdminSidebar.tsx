'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  MapPin, 
  BarChart3, 
  Search, 
  Users,
  Tags,
  MessageSquare,
  LogOut,
  BrainCircuit
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/destinations', label: 'Destinations', icon: MapPin },
  { href: '/admin/reviews', label: 'Manajemen Review', icon: MessageSquare },
  { href: '/admin/compare', label: 'Compare Analytics', icon: BarChart3 },
  { href: '/admin/topics', label: 'Manajemen Topik', icon: Tags },
  { href: '/admin/scraper', label: 'Scraper', icon: Search },
  { href: '/admin/nlp-processing', label: 'NLP Processing', icon: BrainCircuit },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-background h-screen fixed inset-y-0 left-0 z-30">
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/" className="font-bold text-lg text-primary flex items-center gap-2">
          <Image src="/images/logo-icon.png" alt="RanahInsight" width={28} height={28} />
          <span>RANAHINSIGHT</span>
        </Link>
      </div>
      
      <div className="flex-1 py-6 flex flex-col gap-2 px-4">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = link.href === '/admin' 
            ? pathname === '/admin' 
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
          
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:bg-red-50 transition-colors dark:hover:bg-red-950/50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
