'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, Images } from 'lucide-react';

type DestinationGallerySectionProps = {
  destinationName: string;
  images: string[];
  galleryOpen: boolean;
  onOpenGallery: () => void;
  onCloseGallery: () => void;
  sectionHeader: ReactNode;
};

export default function DestinationGallerySection({
  destinationName,
  images,
  galleryOpen,
  onOpenGallery,
  onCloseGallery,
  sectionHeader,
}: DestinationGallerySectionProps) {
  return (
    <section id="galeri" className="scroll-mt-32 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      {sectionHeader}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {images.length > 0 ? images.slice(0, 5).map((img, idx) => (
          <div
            key={`${img}-${idx}`}
            className={`group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm ${
              idx === 0 ? 'aspect-[16/10] sm:col-span-2 lg:row-span-2 lg:aspect-auto' : 'aspect-[4/3]'
            }`}
          >
            <Image
              src={img}
              alt={`${destinationName} ${idx + 1}`}
              fill
              sizes={idx === 0 ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 1024px) 50vw, 25vw'}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {idx === 4 && images.length > 5 && (
              <button
                type="button"
                onClick={onOpenGallery}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/55 text-white transition-colors hover:bg-slate-950/65 focus:outline-none focus:ring-4 focus:ring-primary/30"
                aria-label={`Lihat semua ${images.length} foto ${destinationName}`}
              >
                <Images className="h-7 w-7" />
                <span className="text-sm font-black">Lihat semua foto</span>
                <span className="text-xs font-bold text-white/80">+{images.length - 5} foto lain</span>
              </button>
            )}
          </div>
        )) : (
          <div className="col-span-full rounded-lg border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
            <ImageIcon className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-bold text-slate-500">Belum ada foto tambahan untuk destinasi ini.</p>
          </div>
        )}
      </div>

      {galleryOpen && (
        <div className="mt-6 rounded-lg border border-orange-100 bg-orange-50/60 p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-950">Semua foto</h3>
              <p className="text-sm font-semibold text-slate-500">{images.length} foto tersedia</p>
            </div>
            <button
              type="button"
              onClick={onCloseGallery}
              className="inline-flex min-h-11 w-fit items-center justify-center rounded-lg border border-orange-200 bg-white px-5 text-sm font-black text-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
            >
              Tutup galeri
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img, idx) => (
              <div key={`expanded-${img}-${idx}`} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white bg-slate-100">
                <Image
                  src={img}
                  alt={`${destinationName} galeri ${idx + 1}`}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

