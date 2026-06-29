import { Suspense } from 'react';
import { RouteBuilderClient } from '@/features/routes';

export default function NewRoutePage() {
  return (
    <Suspense fallback={<RouteBuilderFallback />}>
      <RouteBuilderClient />
    </Suspense>
  );
}

function RouteBuilderFallback() {
  return (
    <main className="flex min-h-screen flex-col pt-24">
      <section className="mx-auto w-full max-w-7xl flex-1 px-6 pb-10 pt-8 md:px-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="h-[36rem] animate-pulse rounded-xl bg-muted/60" />
          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-xl bg-muted/60" />
            <div className="h-48 animate-pulse rounded-xl bg-muted/60" />
            <div className="h-20 animate-pulse rounded-xl bg-muted/60" />
          </div>
        </div>
      </section>
    </main>
  );
}
