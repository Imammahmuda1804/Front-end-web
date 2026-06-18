import { Activity, CheckCircle2, Shield, ShieldOff, Sparkles, Users } from 'lucide-react';

import { HealthCard, HeroMetric } from './users-client.components';

export function UsersOverview({
  totalUsers,
  activeCount,
  suspendedCount,
  adminCount,
  userCount,
  usersOnPage,
  activePercent,
  adminPercent,
  currentPage,
  totalPages,
  filteredCount,
}: {
  totalUsers: number;
  activeCount: number;
  suspendedCount: number;
  adminCount: number;
  userCount: number;
  usersOnPage: number;
  activePercent: number;
  adminPercent: number;
  currentPage: number;
  totalPages: number;
  filteredCount: number;
}) {
  return (
    <>
      <section className="overflow-hidden rounded-lg border border-explore/20 bg-explore-container shadow-sm">
        <div className="grid gap-6 p-6 md:p-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-explore px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
              User Operations
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              Manajemen Pengguna
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-700 md:text-base">
              Kelola akun, role, status akses, dan sinyal aktivitas pengguna dalam satu workspace
              operasional yang mudah dipantau.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <HeroMetric
              icon={Users}
              label="Total pengguna"
              value={totalUsers}
              tone="orange"
            />
            <HeroMetric
              icon={CheckCircle2}
              label="Aktif di halaman ini"
              value={activeCount}
              tone="emerald"
            />
            <HeroMetric
              icon={Shield}
              label="Akun admin"
              value={adminCount}
              tone="blue"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <HealthCard
          label="Status aktif"
          value={`${activePercent}%`}
          caption={`${activeCount} dari ${usersOnPage} pengguna pada halaman ini`}
          icon={CheckCircle2}
          tone="emerald"
        />
        <HealthCard
          label="Ditangguhkan"
          value={suspendedCount}
          caption="Akun yang perlu ditinjau atau diaktifkan ulang"
          icon={ShieldOff}
          tone="rose"
        />
        <HealthCard
          label="Role admin"
          value={`${adminPercent}%`}
          caption={`${adminCount} admin dan ${userCount} user biasa`}
          icon={Shield}
          tone="blue"
        />
        <HealthCard
          label="Hasil tampil"
          value={filteredCount}
          caption={`Halaman ${currentPage} dari ${totalPages}`}
          icon={Activity}
          tone="orange"
        />
      </section>
    </>
  );
}
