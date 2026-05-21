import React from "react";
import { AlertTriangle, CheckCircle2, CircleHelp, Eye, Filter, ImageIcon, Layers3, Map, MapPin, MousePointerClick, Star, Video } from "lucide-react";
import type { AdminDestination } from "@/services/admin/destination.service";
import { getQuality, matchesQuality } from "./destinations-table";
export function DestinationOverviewCards({ destinations, total }: { destinations: AdminDestination[]; total: number }) {
  const stats = React.useMemo(() => {
    const missingThumbnail = destinations.filter((destination) => !destination.thumbnailUrl).length;
    const missingMaps = destinations.filter((destination) => !destination.googleMapsUrl).length;
    const complete = destinations.filter((destination) => getQuality(destination).score >= 90).length;

    return [
      { label: "Total destinasi", value: total || destinations.length, hint: "Aktif di database", icon: MapPin, tone: "text-slate-700 bg-slate-100" },
      { label: "Tanpa thumbnail", value: missingThumbnail, hint: "Perlu cover untuk listing", icon: ImageIcon, tone: "text-amber-700 bg-amber-50" },
      { label: "Tanpa Maps URL", value: missingMaps, hint: "Scraping dan navigasi berisiko", icon: Map, tone: "text-red-700 bg-red-50" },
      { label: "Data lengkap", value: complete, hint: "Siap tampil optimal", icon: CheckCircle2, tone: "text-emerald-700 bg-emerald-50" },
    ];
  }, [destinations, total]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{stat.value}</p>
              </div>
              <div className={`rounded-full p-2 ${stat.tone}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">{stat.hint}</p>
          </div>
        );
      })}
    </div>
  );
}

export function AdminDestinationLegend() {
  const legendGroups = [
    {
      title: "Status kualitas",
      icon: CheckCircle2,
      items: [
        {
          label: "Lengkap",
          description: "Siap tampil, data inti tersedia.",
          icon: CheckCircle2,
          className: "border-emerald-200 bg-emerald-50 text-emerald-700",
          dotClassName: "bg-emerald-500",
        },
        {
          label: "Perlu cek",
          description: "Masih ada item kecil yang kurang.",
          icon: AlertTriangle,
          className: "border-amber-200 bg-amber-50 text-amber-700",
          dotClassName: "bg-amber-500",
        },
        {
          label: "Prioritas",
          description: "Lokasi, media, atau rating penting kosong.",
          icon: AlertTriangle,
          className: "border-red-200 bg-red-50 text-red-700",
          dotClassName: "bg-red-500",
        },
      ],
    },
    {
      title: "Badge media",
      icon: ImageIcon,
      items: [
        {
          label: "Cover",
          description: "Thumbnail utama untuk listing.",
          icon: ImageIcon,
          className: "border-slate-200 bg-slate-50 text-slate-700",
          dotClassName: "bg-slate-400",
        },
        {
          label: "Angka galeri",
          description: "Jumlah foto detail destinasi.",
          icon: Layers3,
          className: "border-orange-200 bg-orange-50 text-orange-700",
          dotClassName: "bg-orange-500",
        },
        {
          label: "YT",
          description: "Trailer atau video tersedia.",
          icon: Video,
          className: "border-red-200 bg-red-50 text-red-700",
          dotClassName: "bg-red-500",
        },
      ],
    },
    {
      title: "Cara membaca",
      icon: MousePointerClick,
      items: [
        {
          label: "Klik nama",
          description: "Membuka preview drawer.",
          icon: Eye,
          className: "border-sky-200 bg-sky-50 text-sky-700",
          dotClassName: "bg-sky-500",
        },
        {
          label: "Filter URL",
          description: "Filter tersimpan dan bisa dibagikan.",
          icon: Filter,
          className: "border-orange-200 bg-orange-50 text-orange-700",
          dotClassName: "bg-orange-500",
        },
        {
          label: "G / U",
          description: "Google rating / User rating.",
          icon: Star,
          className: "border-amber-200 bg-amber-50 text-amber-700",
          dotClassName: "bg-amber-500",
        },
      ],
    },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
            <CircleHelp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-950">Legenda cepat</h3>
            <p className="mt-1 text-sm text-slate-500">
              Baca warna, ikon, dan singkatan sebelum menentukan destinasi yang perlu diprioritaskan.
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-3 p-4 xl:grid-cols-3">
        {legendGroups.map((group) => {
          const GroupIcon = group.icon;

          return (
            <div key={group.title} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm shadow-slate-200/60">
                  <GroupIcon className="h-4 w-4" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{group.title}</p>
              </div>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <LegendItem key={item.label} {...item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function LegendItem({
  className,
  dotClassName,
  icon: Icon,
  label,
  description,
}: {
  className: string;
  dotClassName: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}) {
  return (
    <div className={`group flex items-start gap-2 rounded-xl border p-2.5 transition-colors hover:bg-white ${className}`}>
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80 shadow-sm shadow-slate-200/50">
        <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${dotClassName}`} />
        <Icon className="h-4 w-4" />
      </div>
      <span className="min-w-0 pt-0.5">
        <span className="block text-xs font-semibold">{label}</span>
        <span className="mt-0.5 block text-xs leading-snug opacity-80">{description}</span>
      </span>
    </div>
  );
}

export function DestinationQualityChart({ destinations }: { destinations: AdminDestination[] }) {
  const data = React.useMemo(() => {
    const complete = destinations.filter((destination) => getQuality(destination).score >= 90).length;
    const missingMedia = destinations.filter((destination) => matchesQuality(destination, "missing-media")).length;
    const missingLocation = destinations.filter((destination) => matchesQuality(destination, "missing-location")).length;
    const missingRating = destinations.filter((destination) => matchesQuality(destination, "missing-rating")).length;
    return [
      { label: "Lengkap", value: complete, className: "bg-emerald-500" },
      { label: "Perlu media", value: missingMedia, className: "bg-amber-500" },
      { label: "Perlu lokasi", value: missingLocation, className: "bg-red-500" },
      { label: "Perlu rating", value: missingRating, className: "bg-sky-500" },
    ];
  }, [destinations]);

  const totalSignals = Math.max(1, data.reduce((sum, item) => sum + item.value, 0));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-950">Kualitas Data</h3>
          <p className="text-sm text-slate-500">Semakin panjang bar, semakin banyak destinasi pada kategori itu.</p>
        </div>
        <Layers3 className="h-5 w-5 text-orange-500" />
      </div>
      <div className="mt-5 space-y-4">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{item.label}</span>
              <span className="text-slate-500">{item.value}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${item.className}`} style={{ width: `${Math.max(4, (item.value / totalSignals) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CityDistributionChart({ destinations }: { destinations: AdminDestination[] }) {
  const data = React.useMemo(() => {
    const counts = destinations.reduce<Record<string, number>>((acc, destination) => {
      acc[destination.city] = (acc[destination.city] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, value]) => ({ city, value }));
  }, [destinations]);
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
      <h3 className="font-semibold text-slate-950">Sebaran Kota</h3>
      <p className="mt-1 text-sm text-slate-500">Bar menunjukkan kota dengan jumlah destinasi terbanyak pada halaman ini.</p>
      <div className="mt-4 space-y-3">
        {data.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada data kota.</p>
        ) : (
          data.map((item) => (
            <div key={item.city} className="grid grid-cols-[88px_1fr_24px] items-center gap-2 text-sm">
              <span className="truncate text-slate-600">{item.city}</span>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-orange-500" style={{ width: `${(item.value / max) * 100}%` }} />
              </div>
              <span className="text-right font-medium text-slate-700">{item.value}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export function RatingComparisonChart({ destinations }: { destinations: AdminDestination[] }) {
  const data = React.useMemo(
    () =>
      destinations
        .filter((destination) => destination.googleRating || destination.userRating)
        .slice(0, 5),
    [destinations],
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
      <h3 className="font-semibold text-slate-950">Rating Google vs User</h3>
      <p className="mt-1 text-sm text-slate-500">Kuning = rating Google, biru = rating user RANAHINSIGHT.</p>
      <div className="mt-4 space-y-3">
        {data.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada rating untuk dibandingkan.</p>
        ) : (
          data.map((destination) => (
            <div key={destination.id} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium text-slate-700">{destination.name}</span>
                <span className="shrink-0 text-xs text-slate-500">
                  G {destination.googleRating ?? "-"} / U {destination.userRating ?? "-"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="h-1.5 rounded-full bg-amber-100">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${((destination.googleRating ?? 0) / 5) * 100}%` }} />
                </div>
                <div className="h-1.5 rounded-full bg-sky-100">
                  <div className="h-full rounded-full bg-sky-500" style={{ width: `${((destination.userRating ?? 0) / 5) * 100}%` }} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}


