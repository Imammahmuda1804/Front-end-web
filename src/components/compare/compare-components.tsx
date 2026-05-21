import Image from 'next/image';
import Link from 'next/link';
import { BarChart3, MapPin, Search, Sparkles } from 'lucide-react';
import type { ComparedDestination, DestinationMinimal } from './CompareClient';
import { cleanTopicName, formatPercent, imageUrl, normalizeScore, totalReviews } from './CompareClient';
export function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
      <p className="mt-2 text-sm font-semibold leading-7 text-slate-600 sm:text-base">{description}</p>
    </div>
  );
}

export function DestinationResultCard({ dest, fallback, tone, label }: { dest: ComparedDestination; fallback: DestinationMinimal | null; tone: 'orange' | 'blue'; label: string }) {
  const accent = tone === 'orange' ? 'text-primary bg-orange-50 border-orange-200' : 'text-ai bg-sky-50 border-sky-200';
  const detailTarget = dest.slug || fallback?.slug || String(dest.id);
  const detailHref = `/destinations/${detailTarget}`;
  const thumbnailSource = imageUrl({ ...fallback, ...dest });

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/70">
      <div className="relative h-44 bg-slate-200">
        <Image src={thumbnailSource} alt={dest.name} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
        <div className={`absolute left-4 top-4 rounded-full border px-3 py-1.5 text-xs font-black ${accent}`}>{label}</div>
      </div>
      <div className="p-5">
        <h3 className="line-clamp-2 text-xl font-black text-slate-950">{dest.name}</h3>
        {dest.city && (
          <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-500">
            <MapPin className="h-4 w-4" />
            {dest.city}
          </p>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2">
          <MiniMetric label="Skor AI" value={String(normalizeScore(dest.recommendation_score))} />
          <MiniMetric label="Positif" value={formatPercent(dest.positive_ratio)} />
          <MiniMetric label="Rating" value={dest.rating.user ? dest.rating.user.toFixed(1) : '-'} />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-500">{totalReviews(dest)} ulasan dianalisis</span>
          <Link
            href={detailHref}
            className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-black transition-colors ${
              tone === 'orange' ? 'bg-primary text-white hover:bg-primary/90' : 'bg-ai text-white hover:bg-ai/90'
            }`}
          >
            Lihat detail
          </Link>
        </div>
      </div>
    </article>
  );
}

export function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

export function VibeCard({ dest, tone }: { dest: ComparedDestination; tone: 'orange' | 'blue' }) {
  const accent = tone === 'orange' ? 'text-primary bg-orange-50 border-orange-200' : 'text-ai bg-sky-50 border-sky-200';

  return (
    <article className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
      <h3 className="text-lg font-black text-slate-950">{dest.name}</h3>
      {dest.topics && dest.topics.length > 0 ? (
        <div className="mt-4 space-y-3">
          {dest.topics.slice(0, 5).map((topic) => {
            const words = cleanTopicName(topic.topic_name).split(',').map((word) => word.trim()).filter(Boolean);
            return (
              <div key={`${dest.id}-${topic.topic_name}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black capitalize text-slate-900">{words.slice(0, 2).join(', ') || 'Topik perjalanan'}</p>
                    {words.length > 2 && <p className="mt-1 text-xs font-semibold text-slate-500">{words.slice(2).join(', ')}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${accent}`}>
                    {topic.total_reviews} ulasan
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-semibold text-slate-500">Data topik belum tersedia.</p>
        </div>
      )}
    </article>
  );
}

export function EmptyCompareState({
  selectedDest1,
  selectedDest2,
  destinations,
  onPickPair,
}: {
  selectedDest1: DestinationMinimal | null;
  selectedDest2: DestinationMinimal | null;
  destinations: DestinationMinimal[];
  onPickPair: (first: number, second: number) => void;
}) {
  const quickPair = destinations.slice(0, 2);

  return (
    <section className="rounded-[1.75rem] border border-dashed border-orange-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-primary">
        <BarChart3 className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-black text-slate-950">
        {selectedDest1 || selectedDest2 ? 'Pilih satu pembanding lagi' : 'Mulai dari dua destinasi'}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-7 text-slate-600">
        Hasil perbandingan akan muncul sebagai ringkasan keputusan, kartu metrik, chart, dan vibe mapping setelah dua destinasi dipilih.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {quickPair.length === 2 && (
          <button
            type="button"
            onClick={() => onPickPair(quickPair[0].id, quickPair[1].id)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-black text-white transition-colors hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" />
            Coba pasangan pertama
          </button>
        )}
        <Link
          href="/search"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-5 text-sm font-black text-primary transition-colors hover:bg-orange-100"
        >
          <Search className="h-4 w-4" />
          Cari destinasi
        </Link>
      </div>
    </section>
  );
}

export function CompareSkeleton() {
  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.45fr)]" aria-label="Memuat hasil perbandingan">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="h-4 w-44 rounded-full bg-orange-100 motion-safe:animate-pulse" />
        <div className="mt-4 h-10 w-3/4 rounded-xl bg-slate-200 motion-safe:animate-pulse" />
        <div className="mt-3 h-5 w-2/3 rounded bg-slate-200 motion-safe:animate-pulse" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="h-80 rounded-3xl bg-slate-100 motion-safe:animate-pulse" />
          <div className="h-80 rounded-3xl bg-slate-100 motion-safe:animate-pulse" />
        </div>
      </div>
      <div className="h-80 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm motion-safe:animate-pulse" />
    </section>
  );
}

