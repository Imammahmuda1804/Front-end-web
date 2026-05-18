export default function CompareAnalyticsLoading() {
  return (
    <div className="space-y-6" aria-label="Memuat compare analytics admin">
      <section className="rounded-[2rem] border border-orange-100 bg-orange-50/70 p-6 shadow-sm shadow-orange-100/50">
        <div className="h-5 w-44 animate-pulse rounded-full bg-white" />
        <div className="mt-4 h-10 w-80 max-w-full animate-pulse rounded-xl bg-orange-100" />
        <div className="mt-3 h-5 w-[32rem] max-w-full animate-pulse rounded bg-orange-100" />
      </section>
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-32 animate-pulse rounded-[1.5rem] bg-white ring-1 ring-slate-200" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-[1.75rem] bg-white ring-1 ring-slate-200" />
        <div className="h-80 animate-pulse rounded-[1.75rem] bg-white ring-1 ring-slate-200" />
      </div>
    </div>
  );
}
