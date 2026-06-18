export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6" aria-label="Memuat compare analytics">
      <div className="h-36 animate-pulse rounded-xl bg-orange-100/70" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-32 animate-pulse rounded-xl bg-white ring-1 ring-slate-200" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl bg-white ring-1 ring-slate-200" />
        <div className="h-80 animate-pulse rounded-xl bg-white ring-1 ring-slate-200" />
      </div>
    </div>
  );
}
