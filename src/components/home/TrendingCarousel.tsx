'use client';

import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useReducedMotion } from 'framer-motion';
import { ArrowRight, MapPin, Sparkles, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';

import { getImageUrl } from '@/lib/utils';

interface Destination {
  id: number;
  name: string;
  slug: string;
  city: string;
  thumbnailUrl?: string | null;
  description?: string | null;
  positiveRatio?: number | null;
  userRating?: number | null;
}

interface TrendingCarouselProps {
  destinations: Destination[];
}

const AUTOPLAY_SECONDS = 6;
const ease = 'sine.inOut';

function createOrder(length: number) {
  return Array.from({ length }, (_, index) => index);
}

function destinationImage(destination?: Destination) {
  return destination?.thumbnailUrl ? getImageUrl(destination.thumbnailUrl) : '/images/auth-bg.jpg';
}

function destinationDescription(destination?: Destination) {
  return destination?.description?.trim() || 'Deskripsi destinasi belum tersedia.';
}

function percentLabel(value?: number | null) {
  return `${Math.round(Math.max(0, Math.min(1, value || 0)) * 100)}%`;
}

export function TrendingCarousel({ destinations }: TrendingCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef(new Map<number, HTMLDivElement>());
  const contentRefs = useRef(new Map<number, HTMLDivElement>());
  const orderRef = useRef<number[]>([]);
  const isTransitioningRef = useRef(false);
  const mountedRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const timerTweenRef = useRef<gsap.core.Tween | null>(null);
  const stepRef = useRef<() => void>(() => undefined);
  const itemCount = destinations?.length || 0;

  const active = destinations?.[activeIndex];

  const getCopyTargets = useCallback(() => {
    if (!rootRef.current) return [];
    return Array.from(rootRef.current.querySelectorAll<HTMLElement>('.timecard-copy'));
  }, []);

  const placeCards = useCallback((animate = false) => {
    if (!rootRef.current || !itemCount) return;

    const width = rootRef.current.clientWidth;
    const height = rootRef.current.clientHeight;
    const isDesktop = width >= 1024;
    const cardWidth = isDesktop ? 230 : 170;
    const cardHeight = isDesktop ? 345 : 250;
    const gap = isDesktop ? 40 : 16;
    const offsetTop = isDesktop ? height - 395 : height - 280;
    const offsetLeft = isDesktop ? Math.max(24, width - 950) : 24;
    const [currentActive, ...rest] = orderRef.current;

    const activeCard = cardRefs.current.get(currentActive);
    const activeContent = contentRefs.current.get(currentActive);
    if (activeCard) {
      gsap.set(activeCard, {
        x: 0,
        y: 0,
        width,
        height,
        zIndex: 20,
        borderRadius: 0,
        scale: 1,
      });
    }
    if (activeContent) {
      gsap.set(activeContent, { opacity: 0 });
    }

    rest.forEach((index, position) => {
      const card = cardRefs.current.get(index);
      const content = contentRefs.current.get(index);
      const vars = {
        x: offsetLeft + position * (cardWidth + gap),
        y: offsetTop,
        width: cardWidth,
        height: cardHeight,
        zIndex: 30,
        borderRadius: 10,
        scale: 1,
      };

      if (animate && card) {
        gsap.to(card, { ...vars, duration: 0.72, delay: 0.08 * position, ease });
      } else if (card) {
        gsap.set(card, vars);
      }

      if (content) {
        gsap.set(content, { opacity: 1 });
      }
    });
  }, [itemCount]);

  const revealText = useCallback(() => {
    const copyTargets = getCopyTargets();
    if (copyTargets.length === 0) return;

    if (reduceMotion) {
      gsap.set(copyTargets, { clearProps: 'all' });
      return;
    }

    gsap.fromTo(
      copyTargets,
      { autoAlpha: 0, y: 42 },
      { autoAlpha: 1, y: 0, duration: 0.72, stagger: 0.07, delay: 0.18, ease },
    );
  }, [getCopyTargets, reduceMotion]);

  const startProgress = useCallback(() => {
    timerTweenRef.current?.kill();
    if (!progressRef.current) return;

    gsap.set(progressRef.current, { width: '0%' });

    if (reduceMotion || itemCount <= 1) return;

    timerTweenRef.current = gsap.to(progressRef.current, {
      width: '100%',
      duration: AUTOPLAY_SECONDS,
      ease: 'none',
      onComplete: () => stepRef.current(),
    });
  }, [itemCount, reduceMotion]);

  const step = useCallback(() => {
    if (!rootRef.current || itemCount <= 1 || isTransitioningRef.current) return;

    if (reduceMotion) {
      const [first, ...rest] = orderRef.current;
      orderRef.current = [...rest, first];
      setActiveIndex(orderRef.current[0]);
      requestAnimationFrame(() => {
        placeCards(false);
        revealText();
      });
      return;
    }

    isTransitioningRef.current = true;
    timerTweenRef.current?.kill();
    if (progressRef.current) {
      gsap.set(progressRef.current, { width: '0%' });
    }

    const copyTargets = getCopyTargets();
    if (copyTargets.length > 0) {
      gsap.to(copyTargets, { autoAlpha: 0, y: 36, duration: 0.24, ease });
    }

    const previousOrder = orderRef.current;
    const previousActive = previousOrder[0];
    const nextOrder = [...previousOrder.slice(1), previousActive];
    const nextActive = nextOrder[0];
    const rest = nextOrder.slice(1);

    orderRef.current = nextOrder;
    setActiveIndex(nextActive);

    frameRef.current = requestAnimationFrame(() => {
      if (!mountedRef.current || !rootRef.current) return;

      const width = rootRef.current.clientWidth;
      const height = rootRef.current.clientHeight;
      const isDesktop = width >= 1024;
      const cardWidth = isDesktop ? 230 : 170;
      const cardHeight = isDesktop ? 345 : 250;
      const gap = isDesktop ? 40 : 16;
      const offsetTop = isDesktop ? height - 395 : height - 280;
      const offsetLeft = isDesktop ? Math.max(24, width - 950) : 24;

      const nextCard = cardRefs.current.get(nextActive);
      const previousCard = cardRefs.current.get(previousActive);
      const nextContent = contentRefs.current.get(nextActive);

      if (nextContent) {
        gsap.to(nextContent, {
          y: cardHeight - 10,
          opacity: 0,
          duration: 0.28,
          ease,
        });
      }

      if (previousCard) {
        gsap.set(previousCard, { zIndex: 10 });
        gsap.to(previousCard, { scale: 1.5, duration: 0.75, ease });
      }

      if (nextCard) {
        gsap.set(nextCard, { zIndex: 20 });
        gsap.to(nextCard, {
          x: 0,
          y: 0,
          width,
          height,
          borderRadius: 0,
          duration: 1,
          ease,
          onComplete: () => {
            if (!mountedRef.current) return;

            if (previousCard) {
              const lastPosition = rest.length - 1;
              gsap.set(previousCard, {
                x: offsetLeft + lastPosition * (cardWidth + gap),
                y: offsetTop,
                width: cardWidth,
                height: cardHeight,
                zIndex: 30,
                borderRadius: 10,
                scale: 1,
              });
            }

            const previousContent = contentRefs.current.get(previousActive);
            if (previousContent) {
              gsap.set(previousContent, { opacity: 1, y: 0 });
            }

            rest.forEach((index, position) => {
              if (index === previousActive) return;
              const card = cardRefs.current.get(index);
              const content = contentRefs.current.get(index);
              if (card) {
                gsap.set(card, { zIndex: 30 });
                gsap.to(card, {
                  x: offsetLeft + position * (cardWidth + gap),
                  y: offsetTop,
                  width: cardWidth,
                  height: cardHeight,
                  borderRadius: 10,
                  scale: 1,
                  duration: 0.72,
                  delay: 0.08 * (position + 1),
                  ease,
                });
              }
              if (content) {
                gsap.set(content, { opacity: 1, y: 0 });
              }
            });

            if (nextCard) {
              gsap.set(nextCard, { zIndex: 20, scale: 1 });
            }

            isTransitioningRef.current = false;
            revealText();
            startProgress();
          },
        });
      }
    });
  }, [getCopyTargets, itemCount, placeCards, reduceMotion, revealText, startProgress]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    mountedRef.current = true;
    const rootNode = rootRef.current;
    return () => {
      mountedRef.current = false;
      timerTweenRef.current?.kill();
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      if (rootNode) {
        gsap.killTweensOf(rootNode.querySelectorAll('*'));
      }
    };
  }, []);

  useEffect(() => {
    if (!itemCount) return;

    orderRef.current = createOrder(itemCount);

    const initialize = () => {
      if (!mountedRef.current) return;
      setActiveIndex(0);
      placeCards(false);
      revealText();
      startProgress();
    };

    frameRef.current = requestAnimationFrame(initialize);
    window.addEventListener('resize', initialize);

    return () => {
      timerTweenRef.current?.kill();
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener('resize', initialize);
    };
  }, [itemCount, placeCards, revealText, startProgress]);

  if (!destinations || destinations.length === 0 || !active) {
    return null;
  }

  const slideLabel = `${activeIndex + 1}`.padStart(2, '0');
  const rating = active.userRating ? active.userRating.toFixed(1) : 'Baru';

  return (
    <section
      ref={rootRef}
      aria-label="Destinasi rekomendasi"
      aria-live="polite"
      className="relative isolate h-[800px] overflow-hidden bg-slate-950 text-white lg:h-[880px]"
    >
      <div className="absolute inset-0 z-[21] bg-[linear-gradient(90deg,rgba(15,23,42,0.90)_0%,rgba(15,23,42,0.66)_42%,rgba(15,23,42,0.18)_100%)]" />
      <div className="absolute inset-x-0 top-0 z-[22] h-32 bg-[linear-gradient(180deg,rgb(248,250,252)_0%,rgba(248,250,252,0.78)_18%,rgba(248,250,252,0)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 z-[22] h-36 bg-[linear-gradient(0deg,rgba(248,250,252,0.72)_0%,rgba(248,250,252,0.22)_38%,rgba(248,250,252,0)_100%)]" />
      <div className="absolute inset-0 z-[22] bg-[radial-gradient(circle_at_76%_24%,rgba(255,123,84,0.22),transparent_28%),radial-gradient(circle_at_18%_82%,rgba(45,130,181,0.2),transparent_30%)]" />

      {destinations.map((destination, index) => (
        <div
          key={destination.id}
          ref={(node) => {
            if (node) cardRefs.current.set(index, node);
            else cardRefs.current.delete(index);
          }}
          className="absolute left-0 top-0 overflow-hidden bg-slate-900 bg-cover bg-center shadow-[8px_8px_18px_rgba(0,0,0,0.45)]"
          style={{ backgroundImage: `url(${destinationImage(destination)})` }}
        >
          <div
            ref={(node) => {
              if (node) contentRefs.current.set(index, node);
              else contentRefs.current.delete(index);
            }}
            className="absolute inset-x-0 bottom-0 z-10 p-4 text-white"
          >
            <span className="mb-2 block h-1 w-8 rounded-full bg-white/90" />
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">{String(index + 1).padStart(2, '0')}</p>
            <p className="mt-1 line-clamp-2 text-base font-black leading-tight md:text-lg lg:text-xl">{destination.name}</p>
            <p className="mt-1 line-clamp-1 text-xs font-bold text-white/75">{destination.city}</p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
        </div>
      ))}

      <div className="relative z-40 mx-auto flex h-full max-w-7xl flex-col justify-between px-6 pb-20 pt-28 md:px-12 lg:pt-32">
        <div className="max-w-3xl pt-8 lg:pt-14">
          <div className="timecard-copy inline-flex items-center gap-2 rounded-[14px] border border-white/20 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-950 shadow-sm">
            <Sparkles className="h-4 w-4 text-ai" />
            Destinasi rekomendasi
          </div>
          <p className="timecard-copy mt-8 flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-orange-100">
            <span className="h-1 w-9 rounded-full bg-primary" />
            {active.city}
          </p>
          <h2 className="timecard-copy mt-4 max-w-4xl text-5xl font-black leading-[0.92] tracking-tight drop-shadow-md md:text-7xl lg:text-8xl">
            {active.name}
          </h2>
          <p className="timecard-copy mt-6 line-clamp-3 max-w-2xl text-base font-semibold leading-8 text-slate-100 md:text-lg">
            {destinationDescription(active)}
          </p>

          <div className="timecard-copy mt-7 flex flex-wrap gap-3">
            <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/95 px-4 text-sm font-black text-slate-950">
              <Star className="h-4 w-4 fill-primary text-primary" />
              Rating {rating}
            </span>
            <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-black text-emerald-700">
              <TrendingUp className="h-4 w-4" />
              {percentLabel(active.positiveRatio)} positif
            </span>
            <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 text-sm font-black text-ai">
              <MapPin className="h-4 w-4" />
              Top destinasi
            </span>
          </div>

          <div className="timecard-copy mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={`/destinations/${active.slug}`}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-slate-950 shadow-lg shadow-orange-950/25 transition hover:-translate-y-0.5 hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/30"
            >
              Lihat detail
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/search"
              className="inline-flex min-h-12 items-center rounded-xl border border-white/30 bg-white/10 px-6 text-sm font-black text-white backdrop-blur transition hover:bg-white hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-white/25"
            >
              Lihat semua
            </Link>
          </div>
        </div>

        <div className="timecard-copy mb-5 flex w-full flex-col gap-3 rounded-xl border border-white/15 bg-slate-950/40 p-4 backdrop-blur lg:mb-7 lg:max-w-[420px] lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-0">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="h-[3px] flex-1 overflow-hidden bg-white/25">
              <div ref={progressRef} className="h-full bg-primary" />
            </div>
            <p className="w-16 overflow-hidden text-center text-3xl font-black leading-none text-white">
              {slideLabel}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
