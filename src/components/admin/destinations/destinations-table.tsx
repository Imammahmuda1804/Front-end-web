"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Download,
  Edit,
  Eye,
  Filter,
  ImageIcon,
  Layers3,
  Loader2,
  Map,
  MapPin,
  MousePointerClick,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getImageUrl } from "@/lib/utils";
import {
  AdminDestination,
  DestinationListResponse,
  adminDestinationService,
} from "@/services/admin/destination.service";

import { DestinationFormModal } from "./destination-form-modal";

type QualityFilter = "all" | "complete" | "missing-media" | "missing-location" | "missing-rating";
type SortFilter = "newest" | "name" | "city" | "google-rating" | "user-rating";
type RatingFilter = "all" | "4plus" | "under4" | "unrated";

type InitialFilters = {
  search: string;
  page: number;
  city: string;
  quality: string;
  sort: string;
  rating: string;
};

type DestinationsTableProps = {
  initialFilters: InitialFilters;
};

type DeleteTarget =
  | { type: "single"; destination: AdminDestination }
  | { type: "bulk"; destinations: AdminDestination[] }
  | null;

type QualityStatus = {
  score: number;
  label: string;
  tone: "green" | "amber" | "red";
  missing: string[];
  hasThumbnail: boolean;
  hasGallery: boolean;
  hasMaps: boolean;
  hasCoordinates: boolean;
  hasRating: boolean;
};

const LIMIT = 10;

const qualityOptions: NativeSelectOption[] = [
  { value: "all", label: "Semua kualitas", description: "Tampilkan semua destinasi" },
  { value: "complete", label: "Data lengkap", description: "Media, lokasi, dan rating siap" },
  { value: "missing-media", label: "Perlu media", description: "Thumbnail atau galeri belum lengkap" },
  { value: "missing-location", label: "Perlu lokasi", description: "Maps atau koordinat belum lengkap" },
  { value: "missing-rating", label: "Perlu rating", description: "Rating Google atau user belum ada" },
];

const ratingOptions: NativeSelectOption[] = [
  { value: "all", label: "Semua rating" },
  { value: "4plus", label: "Rating 4+" },
  { value: "under4", label: "Di bawah 4" },
  { value: "unrated", label: "Belum ada rating" },
];

const sortOptions: NativeSelectOption[] = [
  { value: "newest", label: "Terbaru" },
  { value: "name", label: "Nama A-Z" },
  { value: "city", label: "Kota A-Z" },
  { value: "google-rating", label: "Google tertinggi" },
  { value: "user-rating", label: "User tertinggi" },
];

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null) return fallback;
  const maybeError = error as { response?: { data?: { message?: string } }; message?: string };
  return maybeError.response?.data?.message || maybeError.message || fallback;
}

function getQuality(destination: AdminDestination): QualityStatus {
  const hasThumbnail = Boolean(destination.thumbnailUrl);
  const hasGallery = Boolean(destination.images?.length);
  const hasMaps = Boolean(destination.googleMapsUrl);
  const hasCoordinates = Boolean(destination.latitude && destination.longitude);
  const hasGoogleRating = typeof destination.googleRating === "number" && destination.googleRating > 0;
  const hasUserRating = typeof destination.userRating === "number" && destination.userRating > 0;
  const hasRating = hasGoogleRating || hasUserRating;

  const checks = [hasThumbnail, hasGallery, hasMaps, hasCoordinates, hasRating];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const missing = [
    !hasThumbnail && "Thumbnail",
    !hasGallery && "Galeri",
    !hasMaps && "Maps URL",
    !hasCoordinates && "Koordinat",
    !hasRating && "Rating",
  ].filter(Boolean) as string[];

  if (score >= 90) {
    return { score, label: "Lengkap", tone: "green", missing, hasThumbnail, hasGallery, hasMaps, hasCoordinates, hasRating };
  }
  if (score >= 60) {
    return { score, label: "Perlu cek", tone: "amber", missing, hasThumbnail, hasGallery, hasMaps, hasCoordinates, hasRating };
  }
  return { score, label: "Prioritas", tone: "red", missing, hasThumbnail, hasGallery, hasMaps, hasCoordinates, hasRating };
}

function matchesQuality(destination: AdminDestination, filter: QualityFilter) {
  const quality = getQuality(destination);

  if (filter === "complete") return quality.score >= 90;
  if (filter === "missing-media") return !quality.hasThumbnail || !quality.hasGallery;
  if (filter === "missing-location") return !quality.hasMaps || !quality.hasCoordinates;
  if (filter === "missing-rating") return !quality.hasRating;
  return true;
}

function matchesRating(destination: AdminDestination, filter: RatingFilter) {
  const rating = destination.googleRating ?? destination.userRating ?? null;

  if (filter === "4plus") return typeof rating === "number" && rating >= 4;
  if (filter === "under4") return typeof rating === "number" && rating > 0 && rating < 4;
  if (filter === "unrated") return !rating;
  return true;
}

function sortDestinations(destinations: AdminDestination[], sort: SortFilter) {
  return [...destinations].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "city") return a.city.localeCompare(b.city);
    if (sort === "google-rating") return (b.googleRating ?? 0) - (a.googleRating ?? 0);
    if (sort === "user-rating") return (b.userRating ?? 0) - (a.userRating ?? 0);
    return String(b.createdAt ?? b.id).localeCompare(String(a.createdAt ?? a.id));
  });
}

function getCityOptions(destinations: AdminDestination[]) {
  const cities = Array.from(new Set(destinations.map((destination) => destination.city).filter(Boolean))).sort();
  return [
    { value: "all", label: "Semua kota", description: "Tanpa filter kota" },
    ...cities.map((city) => ({ value: city, label: city })),
  ];
}

function statusClass(tone: QualityStatus["tone"]) {
  if (tone === "green") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "amber") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-red-200 bg-red-50 text-red-700";
}

function exportCsv(destinations: AdminDestination[]) {
  const headers = ["ID", "Nama", "Kota", "Provinsi", "Google Rating", "User Rating", "Quality Score", "Maps URL"];
  const rows = destinations.map((destination) => {
    const quality = getQuality(destination);
    return [
      destination.id,
      destination.name,
      destination.city,
      destination.province,
      destination.googleRating ?? "",
      destination.userRating ?? "",
      quality.score,
      destination.googleMapsUrl ?? "",
    ];
  });
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `destinasi-admin-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function DestinationsTable({ initialFilters }: DestinationsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = React.useState(initialFilters.search);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [formInstanceKey, setFormInstanceKey] = React.useState(0);
  const [editingDestination, setEditingDestination] = React.useState<AdminDestination | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [previewDestination, setPreviewDestination] = React.useState<AdminDestination | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<DeleteTarget>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isScraping, setIsScraping] = React.useState(false);

  const page = Number(searchParams.get("page") || initialFilters.page || 1);
  const search = searchParams.get("search") || "";
  const city = searchParams.get("city") || initialFilters.city || "all";
  const quality = (searchParams.get("quality") || initialFilters.quality || "all") as QualityFilter;
  const sort = (searchParams.get("sort") || initialFilters.sort || "newest") as SortFilter;
  const rating = (searchParams.get("rating") || initialFilters.rating || "all") as RatingFilter;

  const updateQuery = React.useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all" || (key === "page" && Number(value) === 1)) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      const next = params.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  React.useEffect(() => {
    const handler = window.setTimeout(() => {
      if (searchTerm !== search) {
        updateQuery({ search: searchTerm.trim(), page: 1 });
      }
    }, 450);

    return () => window.clearTimeout(handler);
  }, [search, searchTerm, updateQuery]);

  const { data, isLoading, isFetching, refetch } = useQuery<DestinationListResponse>({
    queryKey: ["admin-destinations", search, page, LIMIT],
    queryFn: () => adminDestinationService.getDestinations({ search, page, limit: LIMIT }),
  });

  const destinations = React.useMemo(() => data?.data || [], [data?.data]);
  const meta = data?.meta || { total_pages: 1, page: 1, total: 0, limit: LIMIT };
  const cityOptions = React.useMemo(() => getCityOptions(destinations), [destinations]);

  const filteredDestinations = React.useMemo(() => {
    const filtered = destinations.filter((destination) => {
      const cityMatches = city === "all" || destination.city === city;
      return cityMatches && matchesQuality(destination, quality) && matchesRating(destination, rating);
    });
    return sortDestinations(filtered, sort);
  }, [city, destinations, quality, rating, sort]);

  const selectedDestinations = React.useMemo(
    () => destinations.filter((destination) => selectedIds.includes(destination.id)),
    [destinations, selectedIds],
  );

  const allVisibleSelected =
    filteredDestinations.length > 0 && filteredDestinations.every((destination) => selectedIds.includes(destination.id));

  const openAddModal = () => {
    setEditingDestination(null);
    setFormInstanceKey((current) => current + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (destination: AdminDestination) => {
    setEditingDestination(destination);
    setFormInstanceKey((current) => current + 1);
    setIsModalOpen(true);
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) => current.filter((id) => !filteredDestinations.some((destination) => destination.id === id)));
      return;
    }
    setSelectedIds((current) => Array.from(new Set([...current, ...filteredDestinations.map((destination) => destination.id)])));
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const targets = deleteTarget.type === "single" ? [deleteTarget.destination] : deleteTarget.destinations;
      await Promise.all(targets.map((destination) => adminDestinationService.deleteDestination(destination.id)));
      toast.success(deleteTarget.type === "single" ? "Destinasi berhasil dihapus" : `${targets.length} destinasi berhasil dihapus`);
      setSelectedIds((current) => current.filter((id) => !targets.some((destination) => destination.id === id)));
      setDeleteTarget(null);
      setPreviewDestination(null);
      refetch();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Gagal menghapus destinasi"));
    } finally {
      setIsDeleting(false);
    }
  };

  const triggerScrape = async (targets: AdminDestination[]) => {
    const scrapable = targets.filter((destination) => destination.googleMapsUrl);
    if (scrapable.length === 0) {
      toast.error("Scraping membutuhkan Google Maps URL.");
      return;
    }

    setIsScraping(true);
    try {
      await Promise.all(
        scrapable.map((destination) =>
          adminDestinationService.scrapeDestination(destination.id, {
            max_reviews: 100,
            maps_url: destination.googleMapsUrl,
          }),
        ),
      );
      toast.success(`${scrapable.length} job scraping dimulai`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Gagal memulai scraping"));
    } finally {
      setIsScraping(false);
    }
  };

  const hasActiveFilters = Boolean(search || city !== "all" || quality !== "all" || rating !== "all" || sort !== "newest");

  return (
    <div className="space-y-5">
      <DestinationOverviewCards destinations={destinations} total={meta.total} />
      <AdminDestinationLegend />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <DestinationQualityChart destinations={destinations} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <CityDistributionChart destinations={destinations} />
          <RatingComparisonChart destinations={destinations} />
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
        <div className="border-b border-slate-100 p-4">
          <DestinationFilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            city={city}
            cityOptions={cityOptions}
            quality={quality}
            rating={rating}
            sort={sort}
            onChange={updateQuery}
            onReset={() => {
              setSearchTerm("");
              router.replace(pathname, { scroll: false });
            }}
            onAdd={openAddModal}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {selectedDestinations.length > 0 && (
          <BulkToolbar
            selectedCount={selectedDestinations.length}
            onClear={() => setSelectedIds([])}
            onExport={() => exportCsv(selectedDestinations)}
            onDelete={() => setDeleteTarget({ type: "bulk", destinations: selectedDestinations })}
            onScrape={() => triggerScrape(selectedDestinations)}
            isScraping={isScraping}
          />
        )}

        <DestinationsDataTable
          destinations={filteredDestinations}
          isLoading={isLoading}
          isFetching={isFetching}
          selectedIds={selectedIds}
          allVisibleSelected={allVisibleSelected}
          onSelectAll={toggleSelectAll}
          onSelect={toggleSelect}
          onPreview={setPreviewDestination}
          onEdit={openEditModal}
          onDelete={(destination) => setDeleteTarget({ type: "single", destination })}
          hasActiveFilters={hasActiveFilters}
          onReset={() => {
            setSearchTerm("");
            router.replace(pathname, { scroll: false });
          }}
        />

        <div className="flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500" aria-live="polite">
            Halaman {meta.page} dari {Math.max(1, meta.total_pages)}. {filteredDestinations.length} baris terlihat dari {destinations.length} data halaman ini.
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => updateQuery({ page: Math.max(1, page - 1) })}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => updateQuery({ page: Math.min(meta.total_pages, page + 1) })}
              disabled={page === meta.total_pages || isLoading || meta.total_pages === 0}
            >
              Selanjutnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <DestinationPreviewDrawer
        destination={previewDestination}
        open={Boolean(previewDestination)}
        onOpenChange={(open) => !open && setPreviewDestination(null)}
        onEdit={(destination) => {
          setPreviewDestination(null);
          openEditModal(destination);
        }}
        onDelete={(destination) => setDeleteTarget({ type: "single", destination })}
        onScrape={(destination) => triggerScrape([destination])}
        isScraping={isScraping}
      />

      <DeleteConfirmationDialog
        target={deleteTarget}
        isDeleting={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <DestinationFormModal
        key={formInstanceKey}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => refetch()}
        initialData={editingDestination || undefined}
      />
    </div>
  );
}

function DestinationOverviewCards({ destinations, total }: { destinations: AdminDestination[]; total: number }) {
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

function AdminDestinationLegend() {
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

function LegendItem({
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

function DestinationQualityChart({ destinations }: { destinations: AdminDestination[] }) {
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

function CityDistributionChart({ destinations }: { destinations: AdminDestination[] }) {
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

function RatingComparisonChart({ destinations }: { destinations: AdminDestination[] }) {
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

function DestinationFilterBar({
  searchTerm,
  setSearchTerm,
  city,
  cityOptions,
  quality,
  rating,
  sort,
  onChange,
  onReset,
  onAdd,
  hasActiveFilters,
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  city: string;
  cityOptions: NativeSelectOption[];
  quality: QualityFilter;
  rating: RatingFilter;
  sort: SortFilter;
  onChange: (updates: Record<string, string | number | null>) => void;
  onReset: () => void;
  onAdd: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
        Cari memakai nama/kota. Filter kualitas memakai kelengkapan media, Maps, koordinat, dan rating. Semua pilihan tersimpan di URL.
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari destinasi atau kota..."
            className="h-11 rounded-full border-slate-200 bg-slate-50 pl-9"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Cari destinasi atau kota"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {hasActiveFilters && (
            <Button variant="outline" className="h-11 rounded-full" onClick={onReset}>
              <X className="h-4 w-4" />
              Reset
            </Button>
          )}
          <Button className="h-11 rounded-full" onClick={onAdd}>
            <Plus className="h-4 w-4" />
            Tambah Destinasi
          </Button>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <NativeSelect
          aria-label="Filter kota destinasi"
          value={city}
          options={cityOptions}
          onValueChange={(value) => onChange({ city: value, page: 1 })}
          className="rounded-xl"
        />
        <NativeSelect
          aria-label="Filter kualitas data"
          value={quality}
          options={qualityOptions}
          onValueChange={(value) => onChange({ quality: value, page: 1 })}
          className="rounded-xl"
        />
        <NativeSelect
          aria-label="Filter rating destinasi"
          value={rating}
          options={ratingOptions}
          onValueChange={(value) => onChange({ rating: value, page: 1 })}
          className="rounded-xl"
        />
        <NativeSelect
          aria-label="Urutkan destinasi"
          value={sort}
          options={sortOptions}
          onValueChange={(value) => onChange({ sort: value, page: 1 })}
          className="rounded-xl"
        />
      </div>
    </div>
  );
}

function BulkToolbar({
  selectedCount,
  onClear,
  onExport,
  onDelete,
  onScrape,
  isScraping,
}: {
  selectedCount: number;
  onClear: () => void;
  onExport: () => void;
  onDelete: () => void;
  onScrape: () => void;
  isScraping: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-orange-100 bg-orange-50/80 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm font-medium text-orange-900">{selectedCount} destinasi dipilih</div>
        <p className="mt-0.5 text-xs text-orange-800/80">
          Export untuk rekap, Scrape untuk ambil ulasan Maps, Hapus memakai soft delete.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="rounded-full bg-white" onClick={onExport}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <Button variant="outline" size="sm" className="rounded-full bg-white" onClick={onScrape} disabled={isScraping}>
          {isScraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Scrape
        </Button>
        <Button variant="destructive" size="sm" className="rounded-full" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          Hapus
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full" onClick={onClear}>
          Batal pilih
        </Button>
      </div>
    </div>
  );
}

function DestinationsDataTable({
  destinations,
  isLoading,
  isFetching,
  selectedIds,
  allVisibleSelected,
  onSelectAll,
  onSelect,
  onPreview,
  onEdit,
  onDelete,
  hasActiveFilters,
  onReset,
}: {
  destinations: AdminDestination[];
  isLoading: boolean;
  isFetching: boolean;
  selectedIds: number[];
  allVisibleSelected: boolean;
  onSelectAll: () => void;
  onSelect: (id: number) => void;
  onPreview: (destination: AdminDestination) => void;
  onEdit: (destination: AdminDestination) => void;
  onDelete: (destination: AdminDestination) => void;
  hasActiveFilters: boolean;
  onReset: () => void;
}) {
  return (
    <div className="relative">
      {isFetching && !isLoading && (
        <div className="absolute right-4 top-3 z-10 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
          <Loader2 className="h-3 w-3 animate-spin" />
          Sinkronisasi
        </div>
      )}
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead colSpan={7} className="h-auto px-4 py-3">
              <div className="flex flex-col gap-2 text-xs font-normal text-slate-500 lg:flex-row lg:items-center lg:justify-between">
                <span>
                  Klik nama atau tombol mata untuk membuka preview. Checkbox mengaktifkan aksi massal.
                </span>
                <span className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" /> Cover = thumbnail
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Layers3 className="h-3 w-3" /> Angka = jumlah galeri
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Video className="h-3 w-3" /> YT = video tersedia
                  </span>
                </span>
              </div>
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="w-10 px-4">
              <input
                type="checkbox"
                aria-label="Pilih semua destinasi yang terlihat"
                checked={allVisibleSelected}
                onChange={onSelectAll}
                className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
            </TableHead>
            <TableHead>Destinasi</TableHead>
            <TableHead>Kualitas</TableHead>
            <TableHead>Media</TableHead>
            <TableHead>Lokasi</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <SkeletonRows />
          ) : destinations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>
                <EmptyState hasActiveFilters={hasActiveFilters} onReset={onReset} />
              </TableCell>
            </TableRow>
          ) : (
            destinations.map((destination) => {
              const quality = getQuality(destination);
              const imageUrl = destination.thumbnailUrl || destination.images?.[0]?.imageUrl;

              return (
                <TableRow key={destination.id} data-state={selectedIds.includes(destination.id) ? "selected" : undefined}>
                  <TableCell className="px-4">
                    <input
                      type="checkbox"
                      aria-label={`Pilih ${destination.name}`}
                      checked={selectedIds.includes(destination.id)}
                      onChange={() => onSelect(destination.id)}
                      className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      className="flex min-w-[240px] items-center gap-3 text-left"
                      onClick={() => onPreview(destination)}
                    >
                      <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        {imageUrl ? (
                          <Image src={getImageUrl(imageUrl)} alt="" fill sizes="64px" className="object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-slate-400">
                            <ImageIcon className="h-5 w-5" />
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-slate-950">{destination.name}</span>
                        <span className="mt-1 block truncate text-xs text-slate-500">ID {destination.id} {destination.slug ? `, ${destination.slug}` : ""}</span>
                      </span>
                    </button>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(quality.tone)}`}>
                      {quality.score}%
                      <span className="hidden sm:inline">{quality.label}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <StatusPill active={quality.hasThumbnail} label="Cover" icon={<ImageIcon className="h-3 w-3" />} />
                      <StatusPill active={quality.hasGallery} label={`${destination.images?.length ?? 0}`} icon={<Layers3 className="h-3 w-3" />} />
                      <StatusPill active={Boolean(destination.youtubeUrl)} label="YT" icon={<Video className="h-3 w-3" />} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-[150px]">
                      <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {destination.city}
                      </div>
                      <div className="text-xs text-slate-500">{destination.province}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-700">
                      <span className="font-semibold">G</span> {destination.googleRating ?? "-"} / <span className="font-semibold">U</span> {destination.userRating ?? "-"}
                    </div>
                    <div className="text-xs text-slate-500">{destination.googleReviewCount ?? 0} ulasan Google</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label={`Lihat preview ${destination.name}`} onClick={() => onPreview(destination)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Analitik belum tersedia" disabled>
                        <BarChart2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Edit ${destination.name}`} onClick={() => onEdit(destination)}>
                        <Edit className="h-4 w-4 text-orange-600" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Hapus ${destination.name}`} onClick={() => onDelete(destination)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell colSpan={7}>
            <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function EmptyState({ hasActiveFilters, onReset }: { hasActiveFilters: boolean; onReset: () => void }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-4 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        {hasActiveFilters ? <Search className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
      </div>
      <h3 className="mt-4 font-semibold text-slate-950">
        {hasActiveFilters ? "Tidak ada destinasi yang cocok" : "Belum ada destinasi"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {hasActiveFilters
          ? "Coba longgarkan filter atau reset untuk melihat semua data halaman ini."
          : "Tambahkan destinasi pertama untuk mulai mengelola data wisata."}
      </p>
      {hasActiveFilters && (
        <Button variant="outline" className="mt-4 rounded-full" onClick={onReset}>
          Reset filter
        </Button>
      )}
    </div>
  );
}

function StatusPill({ active, label, icon }: { active: boolean; label: string; icon: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
        active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-400"
      }`}
    >
      {icon}
      {label}
    </span>
  );
}

function DestinationPreviewDrawer({
  destination,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onScrape,
  isScraping,
}: {
  destination: AdminDestination | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (destination: AdminDestination) => void;
  onDelete: (destination: AdminDestination) => void;
  onScrape: (destination: AdminDestination) => void;
  isScraping: boolean;
}) {
  if (!destination) {
    return <Sheet open={open} onOpenChange={onOpenChange} />;
  }

  const quality = getQuality(destination);
  const imageUrl = destination.thumbnailUrl || destination.images?.[0]?.imageUrl;
  const checks = [
    { label: "Thumbnail", done: quality.hasThumbnail },
    { label: "Galeri", done: quality.hasGallery },
    { label: "Google Maps", done: quality.hasMaps },
    { label: "Koordinat", done: quality.hasCoordinates },
    { label: "Rating", done: quality.hasRating },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="border-b border-slate-100 pr-12">
          <SheetTitle>{destination.name}</SheetTitle>
          <SheetDescription>
            {destination.city}, {destination.province}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5 p-4">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            {imageUrl ? (
              <Image src={getImageUrl(imageUrl)} alt={destination.name} fill sizes="560px" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                <ImageIcon className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <PreviewMetric label="Quality" value={`${quality.score}%`} hint="Skor kelengkapan data" />
            <PreviewMetric label="Google" value={String(destination.googleRating ?? "-")} hint="Rating dari Maps" />
            <PreviewMetric label="User" value={String(destination.userRating ?? "-")} hint="Rating pengguna aplikasi" />
          </div>

          <section className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-semibold text-slate-950">Checklist kualitas</h4>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(quality.tone)}`}>
                {quality.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Centang hijau berarti lengkap. Ikon kuning berarti item perlu dilengkapi sebelum publikasi optimal.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {checks.map((check) => (
                <div key={check.label} className="flex items-center gap-2 text-sm">
                  {check.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  )}
                  <span className={check.done ? "text-slate-700" : "text-slate-500"}>{check.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-4">
            <h4 className="font-semibold text-slate-950">Galeri</h4>
            <p className="mt-1 text-sm text-slate-500">Menampilkan maksimal 6 gambar pertama untuk cek cepat kualitas visual.</p>
            {destination.images?.length ? (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {destination.images.slice(0, 6).map((image) => (
                  <div key={image.id} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                    <Image src={getImageUrl(image.imageUrl)} alt="" fill sizes="120px" className="object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Belum ada gambar galeri.</p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 p-4">
            <h4 className="font-semibold text-slate-950">Akses dan media</h4>
            <p className="mt-1 text-sm text-slate-500">Bagian ini menentukan apakah navigasi, scraping, dan trailer bisa dipakai.</p>
            <div className="mt-3 space-y-2 text-sm">
              <InfoRow label="Google Maps" value={destination.googleMapsUrl ? "Tersedia" : "Belum diisi"} />
              <InfoRow label="YouTube" value={destination.youtubeUrl ? "Tersedia" : "Belum diisi"} />
              <InfoRow label="Koordinat" value={quality.hasCoordinates ? `${destination.latitude}, ${destination.longitude}` : "Belum lengkap"} />
            </div>
          </section>
        </div>
        <SheetFooter className="border-t border-slate-100">
          <div className="grid gap-2 sm:grid-cols-3">
            <Button variant="outline" className="rounded-full" onClick={() => onScrape(destination)} disabled={!destination.googleMapsUrl || isScraping}>
              {isScraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Scrape
            </Button>
            <Button className="rounded-full" onClick={() => onEdit(destination)}>
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" className="rounded-full" onClick={() => onDelete(destination)}>
              <Trash2 className="h-4 w-4" />
              Hapus
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function PreviewMetric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="truncate text-right font-medium text-slate-800">{value}</span>
    </div>
  );
}

function DeleteConfirmationDialog({
  target,
  isDeleting,
  onOpenChange,
  onConfirm,
}: {
  target: DeleteTarget;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const count = target?.type === "bulk" ? target.destinations.length : target ? 1 : 0;
  const name = target?.type === "single" ? target.destination.name : `${count} destinasi`;

  return (
    <Dialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus {name}?</DialogTitle>
          <DialogDescription>
            Data akan disembunyikan dari halaman publik melalui soft delete. Tindakan ini tetap perlu dipastikan karena memengaruhi pengalaman pengguna.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {target?.type === "single" ? target.destination.name : `${count} destinasi terpilih`} akan dihapus dari daftar aktif.
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Batal
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
