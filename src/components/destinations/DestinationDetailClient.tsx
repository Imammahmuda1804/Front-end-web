'use client';

import * as React from 'react';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Heart,
  MapPin,
  MessageSquare,
  Navigation,
  PlayCircle,
  Route,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { getImageUrl } from '@/lib/utils';
import TopicInsightSection from './TopicInsightSection';
import ReviewFormSection from './ReviewFormSection';
import DestinationGallerySection from './DestinationGallerySection';
import { toast } from 'sonner';
import { ChartLoadingPanel } from '@/components/charts/ChartPanel';

dayjs.locale('id');

const DestinationTopicSentimentChart = dynamic(() => import('./DestinationTopicSentimentChart'), {
  ssr: false,
  loading: () => <ChartLoadingPanel icon={TrendingUp} title="Detail sentimen" minHeight="h-72" />,
});

interface DestinationImage {
  id: number;
  imageUrl: string;
}

interface SentimentTrend {
  id: number;
  date: string;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  positiveRatio: number;
}

interface DestinationTopic {
  id: number;
  totalReviews?: number;
  topic: {
    id: number;
    topicName: string;
    keywords: string[] | null;
  };
}

interface UserReview {
  id: number;
  rating: number;
  reviewText: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    profilePicture: string | null;
  };
}

interface DestinationDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
  youtubeUrl?: string | null;
  thumbnailUrl: string;
  thumbnail_url?: string;
  googleRating: number | null;
  googleReviewCount: number | null;
  userRating: number | null;
  positiveRatio: number | null;
  recommendationScore: number | null;
  images: DestinationImage[];
  sentimentTrends: SentimentTrend[];
  destinationTopics: DestinationTopic[];
  userReviews: UserReview[];
  averageUserRating: number | null;
  totalUserReviews: number;
  scrapedAverageRating: number | null;
  scrapedReviewCount: number | null;
  topicSentimentBreakdown?: Record<number, { positive: number; negative: number; neutral: number }>;
  topicGroups?: TopicGroupData[];
}

interface TopicGroupData {
  groupId: number;
  groupName: string;
  totalReviews: number;
  sentimentBreakdown: { positive: number; negative: number; neutral: number };
  topics: Array<{
    id: number;
    topicName: string;
    totalReviews: number;
  }>;
}

interface Props {
  destination: DestinationDetail;
}

type ChartRow = {
  name: string;
  Positif: number;
  Netral: number;
  Negatif: number;
  total: number;
};

// Mengubah URL YouTube menjadi URL embed yang aman ditampilkan.
function getYouTubeEmbedUrl(url?: string | null) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    let videoId = '';

    if (host === 'youtu.be') {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] || '';
    } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (parsed.pathname.startsWith('/watch')) {
        videoId = parsed.searchParams.get('v') || '';
      } else if (parsed.pathname.startsWith('/shorts/') || parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/').filter(Boolean)[1] || '';
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

// Membersihkan nama topik dari label teknis model.
function cleanTopicName(name?: string) {
  const cleaned = name?.replace(/^Topic \d+:\s*/, '').trim();
  return cleaned || 'Topik perjalanan';
}

function formatPercent(value: number | null) {
  return value !== null ? `${Math.round(value * 100)}%` : 'N/A';
}

function formatScore(value: number | null) {
  return value !== null ? Math.round(value * 100) : null;
}

function ratingText(value: number | null | undefined) {
  return value ? value.toFixed(1) : '-';
}

// Menampilkan detail destinasi, favorit, galeri, topik, chart, dan review.
export default function DestinationDetailClient({ destination }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeSection, setActiveSection] = useState('ringkasan');
  const [galleryOpen, setGalleryOpen] = useState(false);
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
        <motion.nav
          {...motionProps}
          className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between"
          aria-label="Navigasi detail destinasi"
        >
          <Link
            href="/search"
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 shadow-sm shadow-orange-100/50 transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Pencarian
          </Link>

          <button
            onClick={toggleFavorite}
            disabled={savingFavorite}
            aria-label={isFavorite ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}
            className={`inline-flex min-h-11 w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-extrabold shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60 ${
              isFavorite
                ? 'border-red-200 bg-red-50 text-red-600'
                : 'border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500' : ''}`} />
            {isFavorite ? 'Favorit' : 'Simpan'}
          </button>
        </motion.nav>

        <motion.section
          {...motionProps}
          className="overflow-hidden rounded-[2rem] border border-orange-200 bg-orange-50/60 shadow-xl shadow-orange-100/50"
          aria-labelledby="destination-title"
        >
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.12fr)_minmax(26rem,0.88fr)]">
            <div className="relative min-h-[21rem] overflow-hidden bg-slate-200 sm:min-h-[28rem] lg:min-h-[35rem]">
              <Image
                src={thumbUrl || '/images/auth-bg.jpg'}
                alt={destination.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/45 to-transparent" />
              <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
                {tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-slate-800 shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between gap-8 p-6 sm:p-8 lg:p-10">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-orange-200">
                  <Sparkles className="h-4 w-4" />
                  Destination Dossier
                </div>

                <div className="max-w-2xl">
                  <h1 id="destination-title" className="text-4xl font-black leading-[0.98] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                    {destination.name}
                  </h1>
                  <p className="mt-4 flex items-center gap-2 text-base font-bold text-slate-600 sm:text-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    {destination.city}, {destination.province}
                  </p>
                </div>

                <p className="line-clamp-2 max-w-2xl text-base font-medium leading-8 text-slate-700">
                  {heroDescription}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <MetricCard label="Skor AI" value={aiScore !== null ? String(aiScore) : 'N/A'} tone="orange" suffix={aiScore !== null ? '/100' : undefined} />
                <MetricCard label="Sentimen positif" value={positivePercentage} tone="emerald" />
                <MetricCard label="Rating Google" value={ratingText(googleRating)} tone="blue" suffix="/5" />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {hasMapsUrl ? (
                  <a
                    href={destination.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20"
                  >
                    <Navigation className="h-4 w-4" />
                    Buka Google Maps
                  </a>
                ) : (
                  <div className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-6 py-3 text-center text-sm font-black text-slate-500">
                    <AlertTriangle className="h-4 w-4" />
                    Maps belum tersedia
                  </div>
                )}
                {destination.youtubeUrl && (
                  <a
                    href="#trailer"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-sky-200 bg-white px-6 py-3 text-sm font-black text-ai shadow-sm transition-all hover:-translate-y-0.5 hover:border-ai focus:outline-none focus:ring-4 focus:ring-sky-100"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Lihat Trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        <div className="-mx-4 mt-5 border-y border-orange-100 bg-slate-50 px-4 py-3 sm:mx-0 sm:rounded-full sm:border sm:bg-white sm:px-5 sm:shadow-sm">
          <div className="flex gap-2 overflow-x-auto">
            {navItems.map(([href, label]) => {
              const isActive = activeSection === href.replace('#', '');
              return (
              <a
                key={href}
                href={href}
                aria-current={isActive ? 'true' : undefined}
                className={`inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm font-extrabold transition-colors focus:outline-none focus:ring-4 focus:ring-primary/15 ${
                  isActive
                    ? 'bg-orange-100 text-primary'
                    : 'text-slate-600 hover:bg-orange-50 hover:text-primary'
                }`}
              >
                {label}
              </a>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            <section id="ringkasan" className="scroll-mt-32 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeader
                eyebrow="Kenapa cocok dikunjungi"
                title="Sinyal praktis sebelum menentukan rute"
                description={heroDescription}
              />

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <InfoTile icon={Star} label="Trust rating" value={`${googleRating.toFixed(1)} / 5`} helper={`${googleCount} ulasan Google`} tone="blue" />
                <InfoTile icon={Sparkles} label="Vibe dominan" value={positivePercentage} helper="Porsi sentimen positif" tone="emerald" />
                <InfoTile icon={ThumbsUp} label="Social proof" value={platformRating ? `${platformRating.toFixed(1)} / 5` : '-'} helper={`${platformCount} ulasan pengguna`} tone="orange" />
                <InfoTile icon={Route} label="Akses lokasi" value={hasMapsUrl ? 'Siap dibuka' : 'Perlu dicek'} helper={`${destination.city}, ${destination.province}`} tone="slate" />
              </div>
            </section>

            <section id="vibe" className="scroll-mt-32 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
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
              <section id="trailer" className="scroll-mt-32 overflow-hidden rounded-[1.75rem] border border-orange-200 bg-orange-50/70 shadow-sm">
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
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-5 py-2.5 text-sm font-black text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
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

            <section id="ulasan" className="scroll-mt-32 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeader
                eyebrow="Ulasan"
                title="Cerita wisatawan"
                description="Baca pengalaman terbaru dan tambahkan ulasan Anda jika pernah mengunjungi destinasi ini."
              />

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {reviewPreview.length > 0 ? reviewPreview.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                )) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center lg:col-span-3">
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
            <div className="rounded-[1.75rem] border border-sky-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-ai">
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
                <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <TrendingUp className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                  <p className="text-sm font-bold text-slate-500">Data sentimen belum tersedia.</p>
                </div>
              )}
            </div>

            <div className="rounded-[1.75rem] border border-orange-200 bg-orange-50/70 p-6 shadow-sm">
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
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-primary/20"
                  >
                    <Navigation className="h-4 w-4" />
                    Google Maps
                  </a>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-black text-slate-500">
                    Link Google Maps belum tersedia untuk destinasi ini.
                  </div>
                )}
                <button
                  onClick={toggleFavorite}
                  disabled={savingFavorite}
                  aria-label={isFavorite ? 'Hapus destinasi dari favorit' : 'Simpan destinasi ke favorit'}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition-all hover:-translate-y-0.5 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFavorite ? 'Tersimpan' : 'Simpan destinasi'}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
      <p className="mt-2 text-sm font-semibold leading-7 text-slate-600 sm:text-base">{description}</p>
    </div>
  );
}

function MetricCard({ label, value, suffix, tone }: { label: string; value: string; suffix?: string; tone: 'orange' | 'blue' | 'emerald' }) {
  const toneClass = {
    orange: 'border-orange-200 bg-white text-primary',
    blue: 'border-sky-200 bg-white text-ai',
    emerald: 'border-emerald-200 bg-white text-emerald-600',
  }[tone];

  return (
    <div className={`rounded-3xl border p-4 shadow-sm ${toneClass}`}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <div className="mt-2 flex items-end gap-1">
        <span className="text-3xl font-black leading-none">{value}</span>
        {suffix && <span className="text-sm font-black text-slate-500">{suffix}</span>}
      </div>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  helper: string;
  tone: 'orange' | 'blue' | 'emerald' | 'slate';
}) {
  const toneClass = {
    orange: 'bg-orange-50 text-primary border-orange-100',
    blue: 'bg-sky-50 text-ai border-sky-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-200',
  }[tone];

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-5">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{helper}</p>
    </div>
  );
}

function InsightPill({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  helper: string;
  tone: 'emerald' | 'blue' | 'amber';
}) {
  const toneClass = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-sky-50 text-ai border-sky-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
  }[tone];

  return (
    <div className={`rounded-2xl border p-3 ${toneClass}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] opacity-80">{label}</p>
          <p className="mt-1 truncate text-sm font-black text-slate-950">{value}</p>
          <p className="text-xs font-bold opacity-80">{helper}</p>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: UserReview }) {
  const profileSrc = review.user.profilePicture
    ? review.user.profilePicture.startsWith('http')
      ? review.user.profilePicture
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${review.user.profilePicture.startsWith('/') ? '' : '/'}${review.user.profilePicture}`
    : null;

  return (
    <article className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-sm font-black text-primary">
            {profileSrc ? (
              <Image src={profileSrc} alt={review.user.name} width={44} height={44} className="h-full w-full object-cover" />
            ) : (
              review.user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-black text-slate-950">{review.user.name}</p>
            <p className="text-xs font-bold text-slate-500">{dayjs(review.createdAt).format('DD MMMM YYYY')}</p>
          </div>
        </div>
        <div className="flex shrink-0">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-orange-400 text-orange-400' : 'fill-slate-200 text-slate-200'}`} />
          ))}
        </div>
      </div>
      <p className="mt-4 line-clamp-4 text-sm font-medium leading-7 text-slate-700">
        {review.reviewText || 'Pengguna memberikan rating tanpa menulis ulasan.'}
      </p>
    </article>
  );
}
