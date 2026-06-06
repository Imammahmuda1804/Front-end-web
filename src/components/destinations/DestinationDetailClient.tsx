'use client';

import * as React from 'react';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Heart,
  MessageSquare,
  Navigation,
  Route,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { getImageUrl } from '@/lib/utils';
import TopicInsightSection from './TopicInsightSection';
import ReviewFormSection from './ReviewFormSection';
import DestinationGallerySection from './DestinationGallerySection';
import { DestinationHeroSection } from './DestinationHeroSection';
import { DestinationAnchorNav, DestinationTopActions } from './DestinationDetailNav';
import { DestinationNearbyList } from './DestinationNearbyList';
import { toast } from 'sonner';
import { ChartLoadingPanel } from '@/components/charts/ChartPanel';
import type { ChartRow, DestinationDetail, NearbyDestination } from './detail.types';
import { cleanTopicName, distanceKm, formatPercent, formatScore, getYouTubeEmbedUrl } from './detail.utils';
import { InfoTile, InsightPill, ReviewCard, SectionHeader } from './detail.ui';

const DestinationTopicSentimentChart = dynamic(() => import('./DestinationTopicSentimentChart'), {
  ssr: false,
  loading: () => <ChartLoadingPanel icon={TrendingUp} title="Detail sentimen" minHeight="h-72" />,
});

interface Props {
  destination: DestinationDetail;
}

// Menampilkan detail destinasi, favorit, galeri, topik, chart, dan review.
export default function DestinationDetailClient({ destination }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeSection, setActiveSection] = useState('ringkasan');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [nearbyDestinations, setNearbyDestinations] = useState<Array<NearbyDestination & { distance: number }>>([]);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    void (async () => {
      try {
        const res = await api.get(`/api/favorites/check/${destination.id}`);
        if (!cancelled) {
          setIsFavorite(res.data.data?.isFavorite || res.data.isFavorite || false);
        }
      } catch (error) {
        console.error('Failed to check favorite status', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, destination.id]);

  React.useEffect(() => {
    if (typeof destination.latitude !== 'number' || typeof destination.longitude !== 'number') return;
    let cancelled = false;
    void api.get('/api/destinations', { params: { limit: 100, city: destination.city } })
      .then((res) => {
        const rows = (res.data.data?.data || res.data.data || []) as NearbyDestination[];
        const nearby = rows
          .filter((item) => item.id !== destination.id)
          .map((item) => ({ ...item, distance: distanceKm(destination, item) }))
          .filter((item): item is NearbyDestination & { distance: number } => typeof item.distance === 'number')
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 3);
        if (!cancelled) setNearbyDestinations(nearby);
      })
      .catch(() => {
        if (!cancelled) setNearbyDestinations([]);
      });
    return () => {
      cancelled = true;
    };
  }, [destination]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setSavingFavorite(true);
    try {
      if (isFavorite) {
        await api.delete(`/api/favorites/${destination.id}`);
        setIsFavorite(false);
        toast.success('Destinasi dihapus dari favorit');
      } else {
        await api.post(`/api/favorites/${destination.id}`);
        setIsFavorite(true);
        toast.success('Destinasi ditambahkan ke favorit');
      }
    } catch (error) {
      console.error('Failed to toggle favorite', error);
      toast.error('Gagal memperbarui favorit');
    } finally {
      setSavingFavorite(false);
    }
  };

  const tags = destination.destinationTopics.map((dt) => {
    const name = cleanTopicName(dt.topic.topicName);
    if (name !== 'Topik perjalanan') return name;
    if (dt.topic.keywords && dt.topic.keywords.length > 0) {
      return dt.topic.keywords.slice(0, 2).join(', ');
    }
    return name;
  });

  const thumbUrl = destination.thumbnailUrl || destination.thumbnail_url
    ? getImageUrl(destination.thumbnailUrl || destination.thumbnail_url)
    : null;

  const allImages = React.useMemo(() => {
    const list = destination.images.map((img) => getImageUrl(img.imageUrl));
    if (thumbUrl && !list.includes(thumbUrl)) {
      list.unshift(thumbUrl);
    }
    return list;
  }, [destination.images, thumbUrl]);

  const barChartData: ChartRow[] = Object.entries(destination.topicSentimentBreakdown || {})
    .map(([topicId, data]) => {
      const topic = destination.destinationTopics.find((dt) => dt.topic?.id?.toString() === topicId)?.topic;
      const name = cleanTopicName(topic?.topicName).split(' ').slice(0, 2).join(' ');
      const total = data.positive + data.negative + data.neutral;
      if (total === 0) return null;

      return {
        name,
        Positif: Math.round((data.positive / total) * 100),
        Netral: Math.round((data.neutral / total) * 100),
        Negatif: Math.round((data.negative / total) * 100),
        total,
      };
    })
    .filter((item): item is ChartRow => Boolean(item))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const googleRating = destination.googleRating || 0;
  const googleCount = destination.googleReviewCount || 0;
  const platformRating = destination.averageUserRating ?? destination.userRating ?? 0;
  const platformCount = destination.totalUserReviews ?? 0;
  const positivePercentage = formatPercent(destination.positiveRatio);
  const aiScore = formatScore(destination.recommendationScore);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(destination.youtubeUrl);
  const reviewPreview = destination.userReviews.slice(0, 3);
  const hasMapsUrl = Boolean(destination.googleMapsUrl?.trim());
  const heroDescription = destination.description
    || 'Deskripsi belum tersedia untuk destinasi ini. Gunakan insight ulasan, galeri, dan lokasi untuk membantu memilih rencana perjalanan.';
  const navItems = React.useMemo<[string, string][]>(() => [
    ['#ringkasan', 'Ringkasan'],
    ['#vibe', 'Vibe & Sentimen'],
    ...(destination.youtubeUrl ? ([['#trailer', 'Trailer']] as [string, string][]) : []),
    ['#galeri', 'Galeri'],
    ['#ulasan', 'Ulasan'],
  ], [destination.youtubeUrl]);

  const topicHighlights = React.useMemo(() => {
    const rows = Object.entries(destination.topicSentimentBreakdown || {})
      .map(([topicId, data]) => {
        const topic = destination.destinationTopics.find((dt) => dt.topic?.id?.toString() === topicId);
        const total = data.positive + data.negative + data.neutral;
        const positiveRatio = total > 0 ? data.positive / total : 0;
        const negativeRatio = total > 0 ? data.negative / total : 0;

        return {
          name: cleanTopicName(topic?.topic.topicName),
          total,
          positiveRatio,
          negativeRatio,
        };
      })
      .filter((row) => row.total > 0);

    return {
      topPositive: [...rows].sort((a, b) => b.positiveRatio - a.positiveRatio || b.total - a.total)[0],
      mostDiscussed: [...rows].sort((a, b) => b.total - a.total)[0],
      needsCheck: [...rows].sort((a, b) => b.negativeRatio - a.negativeRatio || b.total - a.total)[0],
    };
  }, [destination.destinationTopics, destination.topicSentimentBreakdown]);

  React.useEffect(() => {
    const sectionIds = navItems.map(([href]) => href.replace('#', ''));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [navItems]);

  const motionProps = reduceMotion
    ? { initial: false, animate: undefined, transition: undefined }
    : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45 } };

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 pt-20 pb-20">
      <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8">
        <DestinationTopActions
          isFavorite={isFavorite}
          savingFavorite={savingFavorite}
          onToggleFavorite={toggleFavorite}
          motionProps={motionProps}
        />

        <DestinationHeroSection
          destination={destination}
          thumbUrl={thumbUrl}
          tags={tags}
          heroDescription={heroDescription}
          aiScore={aiScore}
          positivePercentage={positivePercentage}
          googleRating={googleRating}
          hasMapsUrl={hasMapsUrl}
          motionProps={motionProps}
        />

        <DestinationAnchorNav navItems={navItems} activeSection={activeSection} />

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            <section id="ringkasan" className="scroll-mt-32 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeader
                eyebrow="Kenapa cocok dikunjungi"
                title="Sinyal praktis sebelum menentukan rute"
                description={heroDescription}
              />

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <InfoTile icon={Star} label="Trust rating" value={`${googleRating.toFixed(1)} / 5`} helper={`${googleCount} ulasan Google`} tone="blue" />
                <InfoTile icon={Sparkles} label="Vibe dominan" value={positivePercentage} helper="Porsi sentimen positif" tone="emerald" />
                <InfoTile icon={ThumbsUp} label="Social proof" value={platformRating ? `${platformRating.toFixed(1)} / 5` : '-'} helper={`${platformCount} ulasan pengguna`} tone="orange" />
              </div>
            </section>

            <section id="vibe" className="scroll-mt-32 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeader
                eyebrow="Vibe Intelligence"
                title="Topik yang paling sering muncul"
                description="Lihat aspek yang sering dibicarakan wisatawan, lalu buka contoh ulasan untuk membaca konteksnya."
              />
              <div className="mt-6">
                <TopicInsightSection
                  destinationId={destination.id}
                  topicGroups={destination.topicGroups}
                  topics={destination.destinationTopics.map((dt) => ({
                    id: dt.id,
                    totalReviews: dt.totalReviews || 0,
                    topic: {
                      id: dt.topic.id,
                      topicName: dt.topic.topicName,
                      keywords: dt.topic.keywords as string[] | null,
                    },
                  }))}
                  sentimentBreakdown={destination.topicSentimentBreakdown || {}}
                />
              </div>
            </section>

            {destination.youtubeUrl && (
              <section id="trailer" className="scroll-mt-32 overflow-hidden rounded-xl border border-orange-200 bg-orange-50/70 shadow-sm">
                <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                  <SectionHeader
                    eyebrow="Trailer"
                    title="Tonton gambaran suasana destinasi"
                    description="Gunakan video sebagai preview cepat sebelum membuka maps atau menyusun rute."
                  />
                  <a
                    href={destination.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-orange-200 bg-white px-5 py-2.5 text-sm font-bold text-primary shadow-sm transition-colors hover:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                  >
                    Buka YouTube
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                {youtubeEmbedUrl ? (
                  <div className="aspect-video w-full bg-slate-900">
                    <iframe
                      src={youtubeEmbedUrl}
                      title={`Trailer ${destination.name}`}
                      className="h-full w-full"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="border-t border-orange-100 bg-white/70 px-6 py-8 text-center">
                    <p className="text-sm font-semibold text-slate-600">
                      Video tidak dapat ditampilkan langsung, tetapi tautan YouTube tetap tersedia.
                    </p>
                  </div>
                )}
              </section>
            )}

            <DestinationGallerySection
              destinationName={destination.name}
              images={allImages}
              galleryOpen={galleryOpen}
              onOpenGallery={() => setGalleryOpen(true)}
              onCloseGallery={() => setGalleryOpen(false)}
              sectionHeader={(
                <SectionHeader
                  eyebrow="Galeri"
                  title="Preview visual destinasi"
                  description="Foto membantu membaca suasana, akses, dan karakter tempat secara cepat."
                />
              )}
            />

            <section id="ulasan" className="scroll-mt-32 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeader
                eyebrow="Ulasan"
                title="Cerita wisatawan"
                description="Baca pengalaman terbaru dan tambahkan ulasan Anda jika pernah mengunjungi destinasi ini."
              />

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {reviewPreview.length > 0 ? reviewPreview.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                )) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center lg:col-span-3">
                    <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    <h3 className="text-lg font-black text-slate-900">Belum ada ulasan</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500">Jadilah yang pertama mengulas destinasi ini.</p>
                  </div>
                )}
              </div>

              <ReviewFormSection
                key={refreshKey}
                destinationId={destination.id}
                isAuthenticated={isAuthenticated}
                onSuccess={async () => {
                  await fetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tag: `destination-${destination.slug}` }),
                  });
                  setRefreshKey((prev) => prev + 1);
                  router.refresh();
                }}
              />
            </section>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-32 xl:self-start">
            <div className="rounded-xl border border-sky-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-ai">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-black text-slate-950">Sentimen per topik</h2>
                  <p className="text-xs font-bold text-slate-500">Insight cepat dari ulasan</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <InsightPill
                  icon={CheckCircle2}
                  label="Topik paling positif"
                  value={topicHighlights.topPositive?.name || 'Belum tersedia'}
                  helper={topicHighlights.topPositive ? `${Math.round(topicHighlights.topPositive.positiveRatio * 100)}% positif` : 'Butuh lebih banyak ulasan'}
                  tone="emerald"
                />
                <InsightPill
                  icon={MessageSquare}
                  label="Paling dibahas"
                  value={topicHighlights.mostDiscussed?.name || 'Belum tersedia'}
                  helper={topicHighlights.mostDiscussed ? `${topicHighlights.mostDiscussed.total} ulasan terkait` : 'Topik belum cukup kuat'}
                  tone="blue"
                />
                <InsightPill
                  icon={AlertTriangle}
                  label="Perlu dicek"
                  value={topicHighlights.needsCheck?.name || 'Belum tersedia'}
                  helper={topicHighlights.needsCheck ? `${Math.round(topicHighlights.needsCheck.negativeRatio * 100)}% catatan negatif` : 'Tidak ada catatan menonjol'}
                  tone="amber"
                />
              </div>

              {barChartData.length > 0 ? (
                <>
                  <h3 className="mt-6 text-sm font-black text-slate-900">Detail sentimen</h3>
                  <p className="sr-only">
                    Grafik menampilkan persentase sentimen positif, netral, dan negatif untuk topik utama destinasi.
                  </p>
                  <div className="mt-5 h-72 w-full">
                    <DestinationTopicSentimentChart data={barChartData} />
                  </div>
                </>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <TrendingUp className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                  <p className="text-sm font-bold text-slate-500">Data sentimen belum tersedia.</p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">Aksi cepat</h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                Buka lokasi, simpan destinasi, atau baca ulang insight yang paling relevan.
              </p>
              <div className="mt-5 space-y-3">
                {hasMapsUrl ? (
                  <a
                    href={destination.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition-[transform,background-color] duration-150 hover:bg-primary/90 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-primary/20"
                  >
                    <Navigation className="h-4 w-4" />
                    Google Maps
                  </a>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-black text-slate-500">
                    Link Google Maps belum tersedia untuk destinasi ini.
                  </div>
                )}
                <button
                  onClick={toggleFavorite}
                  disabled={savingFavorite}
                  aria-label={isFavorite ? 'Hapus destinasi dari favorit' : 'Simpan destinasi ke favorit'}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-orange-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFavorite ? 'Tersimpan' : 'Simpan destinasi'}
                </button>
                <Link
                  href={`/routes/new?destinationId=${destination.id}`}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-sky-100 bg-sky-50 px-5 py-3 text-sm font-bold text-ai transition-colors hover:bg-ai hover:text-white focus:outline-none focus:ring-4 focus:ring-sky-100"
                >
                  <Route className="h-4 w-4" />
                  Tambahkan ke rute
                </Link>
              </div>
            </div>

            <DestinationNearbyList destinations={nearbyDestinations} />
          </aside>
        </div>
      </div>
    </main>
  );
}


