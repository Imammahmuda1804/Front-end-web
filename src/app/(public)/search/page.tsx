import { Suspense } from 'react';
import SearchClient from '@/components/search/SearchClient';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Pencarian Destinasi - RANAHINSIGHT',
  description: 'Temukan destinasi liburan yang sesuai dengan vibe Anda menggunakan pencarian semantik AI.',
};

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <SearchClient />
        </Suspense>
      </div>
    </main>
  );
}
