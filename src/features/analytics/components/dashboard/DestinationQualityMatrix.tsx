'use client';

import { Scatter, ScatterChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type DestinationQuality = {
  id: number;
  name: string;
  city: string;
  google_rating: number | null;
  google_review_count: number | null;
  recommendation_score: number | null;
  positive_ratio: number | null;
};

interface Props {
  destinations: DestinationQuality[];
}

export default function DestinationQualityMatrix({ destinations }: Props) {
  const data = destinations
    .filter((destination) => destination.google_rating !== null || destination.recommendation_score !== null)
    .map((destination) => ({
      ...destination,
      rating: destination.google_rating ?? 0,
      score: Math.round((destination.recommendation_score ?? destination.positive_ratio ?? 0) * 100),
      reviewSize: Math.max(40, Math.min(destination.google_review_count || 40, 900)),
    }));
  const hiddenGems = data
    .filter((destination) => destination.score >= 75 && destination.rating < 4.4)
    .slice(0, 4);

  return (
    <Card className="rounded-lg border border-slate-200 bg-white py-0 shadow-sm">
      <CardHeader className="border-b border-slate-100 p-6">
        <CardTitle className="text-xl font-black text-slate-950">Destination Quality Matrix</CardTitle>
        <CardDescription className="mt-1 font-semibold">Sebaran rating Google dan skor rekomendasi untuk menemukan anomali kualitas.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {data.length === 0 ? (
          <div className="flex h-80 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm font-bold text-slate-400">
            Data kualitas destinasi belum tersedia.
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="relative h-96 min-h-96 w-full min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height={384} minWidth={1} minHeight={1}>
                <ScatterChart margin={{ top: 10, right: 18, bottom: 12, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    dataKey="rating"
                    name="Rating"
                    domain={[0, 5]}
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="number"
                    dataKey="score"
                    name="Skor"
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ZAxis type="number" dataKey="reviewSize" range={[80, 520]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]?.payload) return null;
                      const item = payload[0].payload as typeof data[number];
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-xl">
                          <p className="font-black text-slate-950">{item.name}</p>
                          <p className="mt-1 font-bold text-slate-500">{item.city}</p>
                          <p className="mt-2 font-bold text-slate-700">Rating {item.rating.toFixed(1)} | Skor {item.score}</p>
                        </div>
                      );
                    }}
                  />
                  <Scatter data={data} fill="var(--explore)" fillOpacity={0.72} stroke="var(--minang-rust)" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Hidden gems</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">Skor tinggi dengan rating Google yang masih bisa naik.</p>
              </div>
              {hiddenGems.length > 0 ? hiddenGems.map((destination) => (
                <Link key={destination.id} href={`/admin/destinations/${destination.id}`} className="block rounded-lg border border-slate-200 bg-slate-50 p-3 transition-colors hover:border-orange-200 hover:bg-orange-50">
                  <p className="truncate text-sm font-black text-slate-950">{destination.name}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{destination.city} | Skor {destination.score}</p>
                </Link>
              )) : (
                <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-500">
                  Belum ada kandidat hidden gem.
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

