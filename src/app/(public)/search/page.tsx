import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { SearchClientBoundary } from '@/features/search';

export const metadata = {
  title: 'Pencarian Destinasi - RANAHINSIGHT',
  description: 'Temukan destinasi liburan yang sesuai dengan vibe Anda menggunakan pencarian semantik AI.',
};

export default function SearchPage() {
  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8 2xl:px-10">
        <Suspense fallback={<SearchFallback />}>
          <SearchClientBoundary fallback={<SearchFallback />} />
        </Suspense>
      </div>
    </main>
  );
}

function SearchFallback() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
