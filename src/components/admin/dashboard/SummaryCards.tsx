'use client';

import { ArrowRight, Briefcase, MapPin, MessageSquare, Users } from 'lucide-react';
import Link from 'next/link';

interface SummaryCardsProps {
  totalUsers: number;
  totalDestinations: number;
  totalReviews: number;
  totalJobs: number;
  destinationsBreakdown: { active: number; deleted: number };
  reviewsBreakdown: { scraped: number; user_submitted: number };
}

const cards = [
  {
    key: 'users',
    label: 'Total Pengguna',
    helper: 'Akun terdaftar',
    href: '/admin/users',
    icon: Users,
    tone: 'orange',
  },
  {
    key: 'destinations',
    label: 'Destinasi',
    helper: 'Destinasi aktif',
    href: '/admin/destinations',
    icon: MapPin,
    tone: 'blue',
  },
  {
    key: 'reviews',
    label: 'Total Ulasan',
    helper: 'Scraped + pengguna',
    href: '/admin/reviews',
    icon: MessageSquare,
    tone: 'emerald',
  },
  {
    key: 'jobs',
    label: 'Scraping Jobs',
    helper: 'Tugas pipeline data',
    href: '/admin/scraper',
    icon: Briefcase,
    tone: 'slate',
  },
] as const;

export default function SummaryCards({
  totalUsers,
  totalDestinations,
  totalReviews,
  totalJobs,
  destinationsBreakdown,
  reviewsBreakdown,
}: SummaryCardsProps) {
  const values = {
    users: { value: totalUsers, meta: 'Aktif terdaftar' },
    destinations: { value: totalDestinations, meta: `${destinationsBreakdown.deleted} diarsipkan` },
    reviews: { value: totalReviews, meta: `${reviewsBreakdown.scraped.toLocaleString()} scraping, ${reviewsBreakdown.user_submitted.toLocaleString()} pengguna` },
    jobs: { value: totalJobs, meta: 'Total pekerjaan dibuat' },
  };

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan metrik admin">
      {cards.map((card) => {
        const Icon = card.icon;
        const toneClass = {
          orange: 'border-orange-100 bg-orange-50 text-primary',
          blue: 'border-sky-100 bg-sky-50 text-ai',
          emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
          slate: 'border-slate-200 bg-white text-slate-700',
        }[card.tone];
        const metric = values[card.key];

        return (
          <article key={card.key} className={`rounded-[1.5rem] border p-5 shadow-sm ${toneClass}`}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <Link
                href={card.href}
                className="inline-flex min-h-9 items-center gap-1 rounded-full bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition-colors hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
              >
                Detail
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{card.label}</p>
            <p className="mt-2 text-4xl font-black leading-none text-slate-950">{metric.value.toLocaleString()}</p>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{metric.meta || card.helper}</p>
          </article>
        );
      })}
    </section>
  );
}
