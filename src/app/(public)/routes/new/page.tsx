import { Suspense } from 'react';
import { RouteBuilderClient } from '@/components/routes/RouteBuilderClient';

export default function NewRoutePage() {
  return (
    <Suspense fallback={<RouteBuilderFallback />}>
      <RouteBuilderClient />
    </Suspense>
  );
}

function RouteBuilderFallback() {
  return (
    <main className="min-h-screen pt-24">
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-8 md:px-12">
        <div className="h-[36rem] animate-pulse rounded-xl bg-white" />
      </section>
    </main>
  );
}
