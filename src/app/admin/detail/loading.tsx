import { AnalyticsSkeleton } from '@/components/admin/compare/admin-compare.skeleton';

export default function AdminDetailLoading() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-orange-100 bg-orange-50/70 p-6 shadow-sm shadow-orange-100/50">
        <div className="h-32 animate-pulse rounded-xl bg-white/70" />
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
      </section>
      <AnalyticsSkeleton />
    </div>
  );
}
