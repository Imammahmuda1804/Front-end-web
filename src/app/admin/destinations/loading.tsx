export default function Loading() {
  return (
    <div className="flex-1 space-y-6">
      <div className="space-y-2">
        <div className="h-3 w-32 rounded-full bg-slate-200" />
        <div className="h-9 w-64 rounded-xl bg-slate-200" />
        <div className="h-4 w-full max-w-2xl rounded-full bg-slate-200" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 rounded-xl border border-slate-200 bg-white p-4">
            <div className="h-4 w-24 rounded-full bg-slate-100" />
            <div className="mt-5 h-8 w-16 rounded-xl bg-slate-200" />
            <div className="mt-3 h-3 w-32 rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="h-10 w-full rounded-full bg-slate-100" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-14 rounded-xl bg-slate-50" />
          ))}
        </div>
      </div>
    </div>
  );
}

