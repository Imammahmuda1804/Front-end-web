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
  BrainCircuit,
  Route,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const sidebarGroups = [
  {
    label: 'Ikhtisar',
    links: [{ href: '/admin', label: 'Dasbor', icon: LayoutDashboard }],
  },
  {
    label: 'Konten wisata',
    links: [
      { href: '/admin/destinations', label: 'Destinasi', icon: MapPin },
      { href: '/admin/reviews', label: 'Ulasan', icon: MessageSquare },
      { href: '/admin/topics', label: 'Topik', icon: Tags },
      { href: '/admin/routes', label: 'Rute wisata', icon: Route },
    ],
  },
  {
    label: 'Analitik',
    links: [
      { href: '/admin/detail', label: 'Detail destinasi', icon: BarChart3 },
      { href: '/admin/compare', label: 'Perbandingan', icon: BarChart3 },
    ],
  },
  {
    label: 'Operasional data',
    links: [
      { href: '/admin/scraper', label: 'Scraper', icon: Search },
      { href: '/admin/nlp-processing', label: 'Proses NLP', icon: BrainCircuit },
    ],
  },
  {
    label: 'Administrasi',
    links: [{ href: '/admin/users', label: 'Pengguna', icon: Users }],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden h-screen w-64 flex-col border-r border-slate-200/90 bg-[oklch(0.99_0.006_62)] md:flex">
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/" className="font-bold text-lg text-primary flex items-center gap-2">
          <Image src="/images/logo-icon.png" alt="RanahInsight" width={28} height={28} />
          <span>RANAHINSIGHT</span>
        </Link>
      </div>
      
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
        {sidebarGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-semibold text-slate-400">{group.label}</p>
            <div className="space-y-1">
              {group.links.map((link) => {
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
                      'flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors duration-150',
                      isActive
                        ? 'bg-slate-950 text-white'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
