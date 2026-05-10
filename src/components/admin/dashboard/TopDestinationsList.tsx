'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star, MapPin } from 'lucide-react';
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
    <Card className="bg-white border-none shadow-sm rounded-[24px] overflow-hidden">
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold text-slate-900">Top Destinations</CardTitle>
        </div>
        <Link href="/admin/destinations" className="text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
          All List
        </Link>
      </CardHeader>
      <CardContent>
        {destinations && destinations.length > 0 ? (
          <div className="space-y-4">
            {destinations.map((dest, i) => (
              <div key={dest.id} className="flex items-center justify-between group">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center w-10 h-10 rounded-[12px] bg-slate-50 text-slate-700 font-bold shadow-sm border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-normal uppercase leading-none mt-1">Rank</span>
                    <span className="text-sm leading-none mb-1">#{i + 1}</span>
                  </div>
                  <div>
                    <Link href={`/admin/destinations/${dest.id}`} className="font-bold text-slate-800 group-hover:text-primary transition-colors text-sm line-clamp-1">
                      {dest.name}
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-0.5">
                      <Star className="w-3 h-3 fill-emerald-600" />
                      {(dest.recommendationScore ?? 0).toFixed(1)} Score
                    </div>
                  </div>
                </div>
                <Link href={`/admin/destinations/${dest.id}`} className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-sm">
            No destination data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
