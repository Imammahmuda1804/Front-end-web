'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Compass, Search, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type CinematicScene = {
  image: string;
  alt: string;
  invitation: string;
  placement: 'left' | 'right' | 'center';
  top: string;
  widthClass: string;
  drift: number;
};

const scenes: CinematicScene[] = [
  {
    image: '/images/landing-motion/lembah-harau.jpg',
    alt: 'Lembah Harau dengan tebing dan sawah hijau',
    invitation: 'Mulai dari lembah yang tenang, lalu biarkan rute terbaik terbuka.',
    placement: 'left',
    top: '26%',
    widthClass: 'w-[min(72vw,31rem)] md:w-[min(35vw,32rem)]',
    drift: -16,
  },
  {
    image: '/images/landing-motion/ngarai-sianok.png',
    alt: 'Ngarai Sianok dengan bentang lembah hijau',
    invitation: 'Geser lebih dalam ke lanskap yang membuat perjalanan terasa luas.',
    placement: 'right',
    top: '37%',
    widthClass: 'w-[min(72vw,32rem)] md:w-[min(36vw,33rem)]',
    drift: 14,
  },
  {
    image: '/images/landing-motion/istano-basa-pagaruyung.jpg',
    alt: 'Istano Basa Pagaruyung dengan arsitektur Minangkabau',
    invitation: 'Temukan budaya yang tidak hanya dilihat, tetapi dipahami.',
    placement: 'left',
    top: '42%',
    widthClass: 'w-[min(72vw,32rem)] md:w-[min(36vw,33rem)]',
    drift: -12,
  },
  {
    image: '/images/landing-motion/masjid-raya-sumbar.jpg',
    alt: 'Masjid Raya Sumatera Barat dari udara',
    invitation: 'Lihat ikon kota, baca pengalaman, lalu pilih dengan yakin.',
    placement: 'right',
    top: '24%',
    widthClass: 'w-[min(66vw,28rem)] md:w-[min(30vw,28rem)]',
    drift: 12,
  },
  {
    image: '/images/landing-motion/mande-pantai.jpg',
    alt: 'Pantai dan laut jernih dari udara',
    invitation: 'Tutup perjalanan dengan arah yang lebih personal dan terencana.',
    placement: 'center',
    top: '34%',
    widthClass: 'w-[min(68vw,29rem)] md:w-[min(31vw,29rem)]',
    drift: 0,
  },
];

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

function clampScene(value: number) {
  return Math.max(0, Math.min(scenes.length - 1, value));
}

function getPanelPosition(scene: CinematicScene) {
  if (scene.placement === 'left') {
    return {
      left: 'max(2.5rem, 5.5vw)',
      top: scene.top,
      transformOrigin: '18% 50%',
    };
  }

  if (scene.placement === 'right') {
    return {
      right: 'max(2.5rem, 5.5vw)',
      top: scene.top,
      transformOrigin: '82% 50%',
    };
  }

  return {
    left: '50%',
    top: scene.top,
    transform: 'translateX(-50%)',
    transformOrigin: '50% 50%',
  };
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const windowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const introRef = useRef<HTMLDivElement | null>(null);
  const captionRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLFormElement | null>(null);
  const whiteRevealRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState('');
  const [activeScene, setActiveScene] = useState(0);
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const currentScene = scenes[activeScene];

  useEffect(() => {
    if (prefersReduced || !sectionRef.current) return;

    let disposed = false;
    let cleanup = () => {};

    async function setupCinematicJourney() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      if (disposed || !sectionRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      const context = gsap.context(() => {
        const travelWindows = windowRefs.current.filter(Boolean);

        if (travelWindows.length !== scenes.length) {
          return;
        }

        gsap.set(backgroundRef.current, {
          scale: 1.01,
          yPercent: 0,
          transformOrigin: 'center center',
          force3D: true,
        });
        gsap.set(stageRef.current, {
          perspective: 1200,
          transformStyle: 'preserve-3d',
        });
        gsap.set(travelWindows, {
          autoAlpha: 0,
          scale: 0.58,
          rotateX: 14,
          rotateY: -16,
          z: -760,
          yPercent: 48,
          filter: 'blur(0px)',
          force3D: true,
        });
        gsap.set(captionRef.current, { opacity: 0, y: 28, filter: 'blur(5px)' });
        gsap.set(whiteRevealRef.current, { yPercent: 100 });

        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.95,
            onUpdate: (self) => {
              const progress = Math.min(0.999, self.progress);
              const index = clampScene(Math.floor(progress * scenes.length));
              setActiveScene((current) => (current === index ? current : index));
            },
          },
        });

        timeline
          .to(
            backgroundRef.current,
            {
              scale: 1.08,
              yPercent: -2.6,
              duration: 1,
            },
            0,
          )
          .to(
            introRef.current,
            {
              opacity: 0,
              y: -120,
              filter: 'blur(8px)',
              duration: 0.12,
              ease: 'power2.out',
            },
            0.045,
          )
          .to(
            searchRef.current,
            {
              opacity: 0,
              y: -34,
              filter: 'blur(4px)',
              duration: 0.09,
              ease: 'power2.out',
            },
            0.065,
          )
          .to(
            captionRef.current,
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.1,
              ease: 'power2.out',
            },
            0.13,
          );

        scenes.forEach((scene, index) => {
          const panel = travelWindows[index];
          const start = 0.18 + index * 0.155;

          timeline
            .set(
              panel,
              {
                xPercent: scene.drift,
                rotateY: scene.drift > 0 ? -16 : scene.drift < 0 ? 16 : 0,
              },
              start - 0.01,
            )
            .to(
              panel,
              {
                autoAlpha: 1,
                scale: 0.92,
                rotateX: 4,
                rotateY: scene.drift > 0 ? -7 : scene.drift < 0 ? 7 : 0,
                z: -120,
                yPercent: 10,
                duration: 0.07,
                ease: 'power3.out',
              },
              start,
            )
            .to(
              panel,
              {
                scale: 1.04,
                xPercent: 0,
                rotateX: 0,
                rotateY: 0,
                z: 110,
                yPercent: -4,
                duration: 0.065,
                ease: 'power2.in',
              },
              start + 0.082,
            )
            .to(
              panel,
              {
                autoAlpha: 0,
                scale: 1.34,
                z: 560,
                yPercent: -24,
                filter: 'blur(2.5px)',
                duration: 0.05,
                ease: 'power2.in',
              },
              start + 0.13,
            );
        });

        timeline
          .to(
            whiteRevealRef.current,
            {
              yPercent: 0,
              duration: 0.08,
              ease: 'power2.inOut',
            },
            0.925,
          )
          .to(
            captionRef.current,
            {
              opacity: 0,
              y: -46,
              filter: 'blur(4px)',
              duration: 0.06,
            },
            0.91,
          );
      }, sectionRef);

      cleanup = () => context.revert();
    }

    void setupCinematicJourney();
    return () => {
      disposed = true;
      cleanup();
    };
  }, [prefersReduced]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedQuery = query.trim();
    router.push(normalizedQuery ? `/search?q=${encodeURIComponent(normalizedQuery)}` : '/search');
  };

  return (
    <section ref={sectionRef} className="relative h-[540vh] bg-[oklch(0.975_0.01_62)]">
      <div className="sticky top-0 min-h-[100dvh] overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <div
            ref={backgroundRef}
            className="absolute inset-0 [backface-visibility:hidden] will-change-transform"
          >
            <Image
              src="/images/sumbar-tourism-bg-optimized.jpg"
              alt="Bentang alam Sumatera Barat"
              fill
              priority
              sizes="100vw"
              quality={95}
              className="object-cover"
            />
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_40%,rgba(255,255,255,0.08),transparent_35%),linear-gradient(180deg,rgba(5,10,20,0.2)_0%,rgba(5,10,20,0.06)_46%,rgba(5,10,20,0.32)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,10,20,0.5)_0%,rgba(5,10,20,0.16)_40%,rgba(5,10,20,0.24)_100%)]" />

          <div
            ref={stageRef}
            className="pointer-events-none absolute inset-0 z-20 mx-auto hidden max-w-7xl md:block"
            style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
          >
            {scenes.map((scene, index) => (
              <div
                key={scene.image}
                ref={(node) => {
                  windowRefs.current[index] = node;
                }}
                className={`absolute ${scene.widthClass} overflow-hidden rounded-md border border-white/25 bg-white/8 p-1 opacity-0 shadow-[0_46px_120px_rgba(4,10,20,0.5)] backdrop-blur-[1.5px] will-change-transform`}
                style={getPanelPosition(scene)}
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
                  <Image
                    src={scene.image}
                    alt={scene.alt}
                    fill
                    sizes="(min-width: 768px) 40vw, 70vw"
                    quality={95}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_46%,rgba(5,10,20,0.18)_100%)]" />
                </div>
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[30vh] bg-[linear-gradient(180deg,rgba(248,250,252,0)_0%,rgba(248,250,252,0.22)_48%,rgba(248,250,252,0.74)_82%,oklch(0.975_0.01_62)_100%)]" />

          <div
            ref={whiteRevealRef}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[14vh] bg-[oklch(0.975_0.01_62)] will-change-transform"
            style={{ transform: 'translateY(100%)' }}
          />
        </div>

        <div className="relative z-50 mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col items-center justify-center px-6 pb-20 pt-28 text-center md:px-12">
          <div ref={introRef} className="flex max-w-5xl flex-col items-center will-change-transform">
            <motion.p
              initial={prefersReduced ? false : { opacity: 0, y: 18 }}
              animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-slate-950/18 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-100 shadow-xl shadow-slate-950/20 backdrop-blur-md"
            >
              <Sparkles className="h-4 w-4 text-orange-300" />
              RANAHINSIGHT
            </motion.p>

            <motion.h1
              initial={prefersReduced ? false : { opacity: 0, y: 28 }}
              animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.76, delay: 0.1, ease: easeOutExpo }}
              className="mt-7 max-w-5xl text-6xl font-black leading-[0.88] tracking-tight text-white drop-shadow-[0_16px_42px_rgba(0,0,0,0.5)] md:text-8xl xl:text-[8.5rem]"
            >
              Masuk ke perjalanan Sumatera Barat.
            </motion.h1>

            <motion.p
              initial={prefersReduced ? false : { opacity: 0, y: 22 }}
              animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.68, delay: 0.18, ease: easeOutExpo }}
              className="mt-7 max-w-2xl text-base font-semibold leading-7 text-slate-100 drop-shadow-[0_2px_14px_rgba(15,23,42,0.7)] md:text-xl"
            >
              Jelajahi destinasi, pahami pengalaman wisatawan, lalu susun rute perjalanan yang lebih meyakinkan.
            </motion.p>

            <form
              ref={searchRef}
              onSubmit={handleSearch}
              className="mt-9 flex w-full max-w-2xl items-center border-b border-white/65 bg-slate-950/8 px-1 pb-2 text-left shadow-[0_16px_34px_rgba(5,10,20,0.12)] backdrop-blur-[2px] will-change-transform"
            >
              <Compass className="mx-3 h-5 w-5 shrink-0 text-orange-200" />
              <label htmlFor="hero-search" className="sr-only">
                Cari destinasi wisata
              </label>
              <input
                id="hero-search"
                type="search"
                placeholder="Cari suasana, aktivitas, atau nama destinasi"
                className="min-h-12 w-full bg-transparent text-base font-semibold text-white outline-none placeholder:text-slate-200/75"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button
                type="submit"
                aria-label="Cari destinasi"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white shadow-lg shadow-orange-950/20 transition-[transform,background-color] duration-150 hover:bg-orange-400 active:scale-[0.97]"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div
            ref={captionRef}
            className="pointer-events-none absolute inset-x-6 bottom-[20vh] z-50 mx-auto flex max-w-4xl justify-center text-center opacity-0 will-change-transform"
          >
            <motion.div
              key={currentScene.invitation}
              initial={prefersReduced ? false : { opacity: 0, y: 14, filter: 'blur(4px)' }}
              animate={prefersReduced ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.34, ease: easeOutExpo }}
              className="max-w-2xl"
            >
              <p className="text-3xl font-black leading-[1.02] tracking-tight text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.52)] md:text-5xl">
                {currentScene.invitation}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
