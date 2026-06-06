'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star } from 'lucide-react';
import Link from 'next/link';

interface Destination {
  id: number;
  name: string;
  city: string;
  recommendationScore: number | null;
  positiveRatio: number | null;
  googleRating: number | null;
}

interface TopDestinationsListProps {
  destinations: Destination[];
}

export default function TopDestinationsList({ destinations }: TopDestinationsListProps) {
  return (
    <Card className="overflow-hidden rounded-xl border border-slate-200 bg-white py-0 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between border-b border-slate-100 p-6">
        <div>
          <CardTitle className="text-lg font-black text-slate-950">Destinasi Teratas</CardTitle>
          <CardDescription className="mt-1 font-semibold">Ranking berdasarkan skor rekomendasi.</CardDescription>
        </div>
        <Link href="/admin/destinations" className="flex min-h-9 items-center gap-1 rounded-lg bg-slate-100 px-3 text-xs font-black text-slate-600 transition-colors hover:bg-primary hover:text-white">
          Semua
        </Link>
      </CardHeader>
      <CardContent className="p-6">
        {destinations && destinations.length > 0 ? (
          <div className="space-y-4">
            {destinations.map((dest, i) => (
              <div key={dest.id} className="flex items-center justify-between group">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-slate-50 text-slate-700 font-bold shadow-sm border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-normal uppercase leading-none mt-1">Rank</span>
                    <span className="text-sm leading-none mb-1">#{i + 1}</span>
                  </div>
                  <div>
                    <Link href={`/admin/destinations/${dest.id}`} className="font-bold text-slate-800 group-hover:text-primary transition-colors text-sm line-clamp-1">
                      {dest.name}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <Star className="w-3 h-3 fill-emerald-600" />
                      {Math.round((dest.recommendationScore ?? 0) * 100)} skor
                    </div>
                  </div>
                </div>
                <Link href={`/admin/destinations/${dest.id}`} className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-[color,background-color,border-color,box-shadow,transform,opacity]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm font-bold text-slate-400">
            Data destinasi belum tersedia.
          </div>
        )}
      </CardContent>
    </Card>
  );
}



