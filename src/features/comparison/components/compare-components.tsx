import Image from 'next/image';
import Link from 'next/link';
import { AlertTriangle, BarChart3, CheckCircle2, ExternalLink, Info, MapPin, Navigation, Search, Sparkles } from 'lucide-react';
import { getDestinationCategoryLabel } from '@/lib/destination-categories';
import type { ComparedDestination, DestinationMinimal, CompareFactorKey } from './CompareClient';
import { cleanTopicName, formatPercent, imageUrl, normalizeScore, topicChips, totalReviews } from './CompareClient';
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
  const accent = tone === 'orange' ? 'text-primary bg-orange-50 border-orange-200' : 'text-primary bg-sky-50 border-sky-200';
  const detailTarget = dest.slug || fallback?.slug || String(dest.id);
  const detailHref = `/destinations/${detailTarget}`;
  const thumbnailSource = imageUrl({ ...fallback, ...dest });
  const mapsHref = getMapsHref(dest);
  const highlights = normalizedSignals(dest.highlights, topicChips(dest)).slice(0, 3);
  const risks = normalizedSignals(dest.risks, []).slice(0, 3);

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50/70">
      <div className="relative h-44 bg-slate-200">
        <Image src={thumbnailSource} alt={dest.name} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
        <div className={`absolute left-4 top-4 rounded-md border px-3 py-1.5 text-xs font-black ${accent}`}>{label}</div>
      </div>
      <div className="p-5">
        <h3 className="line-clamp-2 text-xl font-black text-slate-950">{dest.name}</h3>
        {dest.city && (
          <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-950">
            <MapPin className="h-4 w-4" />
            {dest.city}{dest.category ? ` / ${getDestinationCategoryLabel(dest.category)}` : ''}
          </p>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2">
          <MiniMetric label="Skor AI" value={String(normalizeScore(dest.recommendation_score))} />
          <MiniMetric label="Positif" value={formatPercent(dest.positive_ratio)} />
          <MiniMetric label="Rating" value={dest.rating.user ? dest.rating.user.toFixed(1) : '-'} />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <SignalList title="Unggulan" icon="good" items={highlights} empty="Highlight belum cukup" />
          <SignalList title="Perhatian" icon="risk" items={risks} empty="Risiko khusus belum terlihat" />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-500">{dest.review_count || totalReviews(dest)} ulasan dianalisis</span>
          <div className="flex gap-2">
            {mapsHref && (
              <Link href={mapsHref} target="_blank" className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 transition-colors hover:bg-slate-100">
                <Navigation className="h-4 w-4" />
                Maps
              </Link>
            )}
            <Link
              href={detailHref}
              className={`inline-flex min-h-10 items-center rounded-lg px-4 text-sm font-black transition-colors ${
                tone === 'orange' ? 'bg-primary text-white hover:bg-primary/90' : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              Detail
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function SignalList({ title, icon, items, empty }: { title: string; icon: 'good' | 'risk'; items: string[]; empty: string }) {
  const Icon = icon === 'good' ? CheckCircle2 : AlertTriangle;
  const tone = icon === 'good' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-rose-700 bg-rose-50 border-rose-100';
  return (
    <div className={`rounded-lg border p-3 ${tone}`}>
      <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.12em]">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </p>
      <div className="mt-2 space-y-1.5">
        {(items.length ? items : [empty]).map((item) => (
          <p key={item} className="line-clamp-1 text-xs font-bold">{item}</p>
        ))}
      </div>
    </div>
  );
}

export function SentimentDecisionPanel({ destination1, destination2 }: { destination1: ComparedDestination; destination2: ComparedDestination }) {
  const insights = [destination1, destination2].map((destination) => buildSentimentDecision(destination));
  const strongerPositive = insights[0].positiveRate >= insights[1].positiveRate ? insights[0] : insights[1];
  const higherRisk = insights[0].negativeRate >= insights[1].negativeRate ? insights[0] : insights[1];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <SectionHeader
        eyebrow="Pembacaan sentimen"
        title="Apa arti ulasan untuk keputusan perjalanan"
        description="Sentimen tidak dibaca sebagai vonis mutlak. Bagian ini menjelaskan kecenderungan, risiko, dan kekuatan data dari ulasan yang tersedia."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_18rem]">
        {insights.map((item) => (
          <article key={item.destination.id} className="rounded-lg border border-slate-200 bg-slate-50/80 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Kecenderungan</p>
                <h3 className="mt-1 text-lg font-black leading-6 text-slate-950">{item.destination.name}</h3>
              </div>
              <span className={`rounded-lg border px-2.5 py-1 text-xs font-black ${item.tone}`}>
                {item.strength}
              </span>
            </div>

            <p className="mt-4 text-sm font-black leading-6 text-slate-900">{item.headline}</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{item.detail}</p>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-black">
              <span className="rounded-md bg-emerald-50 px-2 py-2 text-emerald-700">{item.positiveRate}% positif</span>
              <span className="rounded-md bg-slate-100 px-2 py-2 text-slate-600">{item.neutralRate}% netral</span>
              <span className="rounded-md bg-rose-50 px-2 py-2 text-rose-700">{item.negativeRate}% negatif</span>
            </div>
          </article>
        ))}

        <aside className="rounded-lg border border-sky-100 bg-sky-50/80 p-5 txt-amber-500">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
            <Info className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm font-black uppercase tracking-[0.14em]">Cara pakai</p>
          <p className="mt-2 text-sm font-semibold leading-6">
            {strongerPositive.destination.name} lebih kuat sebagai pilihan aman dari sisi sentimen positif.
            {higherRisk.negativeRate >= 25 ? ` ${higherRisk.destination.name} perlu dibaca lebih hati-hati karena catatan negatifnya lebih tinggi.` : ' Keduanya belum menunjukkan risiko negatif yang dominan.'}
          </p>
        </aside>
      </div>
    </section>
  );
}

export function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

const FACTORS: Array<{ key: CompareFactorKey; label: string }> = [
  { key: 'access', label: 'Akses' },
  { key: 'cost_value', label: 'Biaya/value' },
  { key: 'cleanliness', label: 'Kebersihan' },
  { key: 'facilities', label: 'Fasilitas' },
  { key: 'crowd', label: 'Keramaian' },
  { key: 'view_activity', label: 'Pemandangan' },
];

export function FactorMatrix({ destination1, destination2 }: { destination1: ComparedDestination; destination2: ComparedDestination }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <SectionHeader
        eyebrow="Factor Matrix"
        title="Faktor perjalanan yang paling praktis"
        description="Skor ini membaca topik ulasan, sentimen, rating, dan kelengkapan lokasi untuk membantu menimbang kenyamanan nyata saat berkunjung."
      />
      <div className="mt-6 space-y-4">
        {FACTORS.map((factor) => (
          <FactorRow
            key={factor.key}
            label={factor.label}
            value1={destination1.decision_factors?.[factor.key] ?? fallbackFactor(destination1)}
            value2={destination2.decision_factors?.[factor.key] ?? fallbackFactor(destination2)}
            name1={destination1.name}
            name2={destination2.name}
          />
        ))}
      </div>
    </section>
  );
}

function FactorRow({ label, value1, value2, name1, name2 }: { label: string; value1: number; value2: number; name1: string; name2: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="font-black text-slate-900">{label}</p>
        <p className="text-xs font-bold text-slate-500">{value1 >= value2 ? name1 : name2} unggul</p>
      </div>
      <CompareBar label={name1} value={value1} className="bg-primary" />
      <div className="mt-2" />
      <CompareBar label={name2} value={value2} className="bg-primary" />
    </div>
  );
}

function CompareBar({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs font-black text-slate-600">
        <span className="truncate">{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white">
        <div className={`h-full rounded-full ${className}`} style={{ width: `${Math.max(4, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export function HighlightRiskGrid({ destination1, destination2 }: { destination1: ComparedDestination; destination2: ComparedDestination }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <SectionHeader
        eyebrow="Highlights vs Risks"
        title="Yang membuat menarik dan yang perlu dicek"
        description="Bagian ini dibuat dari topik ulasan dominan agar wisatawan cepat membaca kelebihan dan potensi masalah."
      />
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {[destination1, destination2].map((dest) => (
          <article key={dest.id} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-black text-slate-950">{dest.name}</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <SignalList title="Yang unggul" icon="good" items={normalizedSignals(dest.highlights, topicChips(dest)).slice(0, 4)} empty="Belum ada highlight kuat" />
              <SignalList title="Waspada" icon="risk" items={normalizedSignals(dest.risks, []).slice(0, 4)} empty="Belum ada risiko kuat" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function LocationComparePanel({ destination1, destination2 }: { destination1: ComparedDestination; destination2: ComparedDestination }) {
  const distance = distanceKm(destination1, destination2);
  return (
    <section className="rounded-lg border border-sky-100 bg-white p-6 shadow-sm self-start
    ">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-500">Lokasi & akses</p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">Cek posisi sebelum memilih</h2>
      {distance !== null && (
        <div className="mt-4 rounded-lg border border-sky-100 bg-sky-50 p-4 text-amber-500">
          <p className="text-xs font-black uppercase tracking-[0.12em]">Jarak lurus antar destinasi</p>
          <p className="mt-1 text-3xl font-black">{distance.toFixed(1)} km</p>
        </div>
      )}
      <div className="mt-5 space-y-3">
        {[destination1, destination2].map((dest) => {
          const mapsHref = getMapsHref(dest);
          return (
            <div key={dest.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="font-black text-slate-950">{dest.name}</p>
              <p className="mt-1 text-sm font-bold text-slate-500">
                {[dest.city, dest.province, dest.category ? getDestinationCategoryLabel(dest.category) : null].filter(Boolean).join(' / ')}
              </p>
              {mapsHref ? (
                <Link href={mapsHref} target="_blank" className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-black text-amber-500">
                  <ExternalLink className="h-4 w-4" />
                  Buka Maps
                </Link>
              ) : (
                <p className="mt-3 text-sm font-bold text-slate-400">Koordinat belum tersedia.</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ExperienceTopicCard({ dest, tone }: { dest: ComparedDestination; tone: 'orange' | 'blue' }) {
  const accent = tone === 'orange' ? 'text-primary bg-orange-50 border-orange-200' : 'text-ai bg-sky-50 border-sky-200';

  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50/70 p-5">
      <h3 className="text-lg font-black text-slate-950">{dest.name}</h3>
      {dest.topics && dest.topics.length > 0 ? (
        <div className="mt-4 space-y-3">
          {dest.topics.slice(0, 5).map((topic) => {
            const words = cleanTopicName(topic.topic_name).split(',').map((word) => word.trim()).filter(Boolean);
            return (
              <div key={`${dest.id}-${topic.topic_name}`} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black capitalize text-slate-900">{words.slice(0, 2).join(', ') || 'Topik perjalanan'}</p>
                    {words.length > 2 && <p className="mt-1 text-xs font-semibold text-slate-600">{words.slice(2).join(', ')}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black text-primary ${accent}`}>
                    {topic.total_reviews} ulasan
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-semibold text-slate-500">Data topik belum tersedia.</p>
        </div>
      )}
    </article>
  );
}

function normalizedSignals(primary?: string[], fallback?: string[]) {
  return [...new Set([...(primary || []), ...(fallback || [])].map((item) => item.trim()).filter(Boolean))];
}

function buildSentimentDecision(destination: ComparedDestination) {
  const total = Math.max(0, totalReviews(destination));
  const positiveRate = total > 0 ? Math.round((destination.sentiment.positive / total) * 100) : 0;
  const neutralRate = total > 0 ? Math.round((destination.sentiment.neutral / total) * 100) : 0;
  const negativeRate = total > 0 ? Math.round((destination.sentiment.negative / total) * 100) : 0;
  const strength = total >= 80 ? 'Data kuat' : total >= 25 ? 'Data cukup' : total > 0 ? 'Data terbatas' : 'Belum ada data';
  const tone = total >= 80
    ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
    : total >= 25
      ? 'border-sky-100 bg-sky-50 text-ai'
      : 'border-amber-100 bg-amber-50 text-amber-700';

  if (total === 0) {
    return {
      destination,
      positiveRate,
      neutralRate,
      negativeRate,
      strength,
      tone,
      headline: 'Belum cukup ulasan untuk disimpulkan',
      detail: 'Gunakan foto, lokasi, dan rating sebagai pertimbangan sementara.',
    };
  }

  if (negativeRate >= 30) {
    return {
      destination,
      positiveRate,
      neutralRate,
      negativeRate,
      strength,
      tone,
      headline: 'Ada risiko pengalaman yang perlu dibaca',
      detail: 'Buka highlight dan risiko untuk memahami apakah keluhan itu relevan dengan rencana kunjungan Anda.',
    };
  }

  if (positiveRate >= 65) {
    return {
      destination,
      positiveRate,
      neutralRate,
      negativeRate,
      strength,
      tone,
      headline: 'Mayoritas ulasan mendukung pilihan ini',
      detail: 'Cocok dijadikan kandidat utama, terutama jika topik unggulnya sesuai kebutuhan perjalanan.',
    };
  }

  return {
    destination,
    positiveRate,
    neutralRate,
    negativeRate,
    strength,
    tone,
    headline: 'Pendapat pengunjung masih campuran',
    detail: 'Bandingkan faktor akses, fasilitas, dan topik dominan sebelum menentukan pilihan akhir.',
  };
}

function fallbackFactor(dest: ComparedDestination) {
  return Math.round((normalizeScore(dest.recommendation_score) + normalizeScore(dest.positive_ratio)) / 2);
}

function getMapsHref(dest: ComparedDestination) {
  if (dest.googleMapsUrl) return dest.googleMapsUrl;
  if (typeof dest.latitude === 'number' && typeof dest.longitude === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${dest.latitude},${dest.longitude}`;
  }
  return null;
}

function distanceKm(a: ComparedDestination, b: ComparedDestination) {
  if (
    typeof a.latitude !== 'number' ||
    typeof a.longitude !== 'number' ||
    typeof b.latitude !== 'number' ||
    typeof b.longitude !== 'number'
  ) {
    return null;
  }
  const earthRadiusKm = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const deltaLat = toRad(b.latitude - a.latitude);
  const deltaLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
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
    <section className="rounded-lg border border-dashed border-orange-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-lg bg-orange-50 text-primary">
        <BarChart3 className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-black text-slate-950">
        {selectedDest1 || selectedDest2 ? 'Pilih satu pembanding lagi' : 'Mulai dari dua destinasi'}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-7 text-slate-600">
        Hasil perbandingan akan muncul sebagai ringkasan keputusan, kartu metrik, chart, dan pemetaan nuansa setelah dua destinasi dipilih.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {quickPair.length === 2 && (
          <button
            type="button"
            onClick={() => onPickPair(quickPair[0].id, quickPair[1].id)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-black text-white transition-colors hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" />
            Coba pasangan pertama
          </button>
        )}
        <Link
          href="/search"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-5 text-sm font-black text-primary transition-colors hover:bg-orange-100"
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
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="h-4 w-44 rounded-full bg-orange-100 motion-safe:animate-pulse" />
        <div className="mt-4 h-10 w-3/4 rounded-lg bg-slate-200 motion-safe:animate-pulse" />
        <div className="mt-3 h-5 w-2/3 rounded bg-slate-200 motion-safe:animate-pulse" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="h-80 rounded-lg bg-slate-100 motion-safe:animate-pulse" />
          <div className="h-80 rounded-lg bg-slate-100 motion-safe:animate-pulse" />
        </div>
      </div>
      <div className="h-80 rounded-lg border border-slate-200 bg-white p-6 shadow-sm motion-safe:animate-pulse" />
    </section>
  );
}


