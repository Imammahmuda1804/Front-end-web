"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { NativeSelectOption } from "@/components/ui/native-select";
import {
  AdminDestination,
  DestinationListResponse,
  adminDestinationService,
} from "@/services/admin/destination.service";

import { DestinationFormModal } from "./destination-form-modal";
import { BulkToolbar, DestinationFilterBar } from "./destinations-table.controls";
import { DeleteConfirmationDialog, DestinationPreviewDrawer, DestinationsDataTable } from "./destinations-table.data";
import {
  AdminDestinationLegend,
  CityDistributionChart,
  DestinationOverviewCards,
  DestinationQualityChart,
  RatingComparisonChart,
} from "./destinations-table.visuals";

export type QualityFilter = "all" | "complete" | "missing-media" | "missing-location" | "missing-rating";
export type SortFilter = "newest" | "name" | "city" | "google-rating" | "user-rating";
export type RatingFilter = "all" | "4plus" | "under4" | "unrated";

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

export type DeleteTarget =
  | { type: "single"; destination: AdminDestination }
  | { type: "bulk"; destinations: AdminDestination[] }
  | null;

export type QualityStatus = {
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

export const qualityOptions: NativeSelectOption[] = [
  { value: "all", label: "Semua kualitas", description: "Tampilkan semua destinasi" },
  { value: "complete", label: "Data lengkap", description: "Media, lokasi, dan rating siap" },
  { value: "missing-media", label: "Perlu media", description: "Thumbnail atau galeri belum lengkap" },
  { value: "missing-location", label: "Perlu lokasi", description: "Maps atau koordinat belum lengkap" },
  { value: "missing-rating", label: "Perlu rating", description: "Rating Google atau user belum ada" },
];

export const ratingOptions: NativeSelectOption[] = [
  { value: "all", label: "Semua rating" },
  { value: "4plus", label: "Rating 4+" },
  { value: "under4", label: "Di bawah 4" },
  { value: "unrated", label: "Belum ada rating" },
];

export const sortOptions: NativeSelectOption[] = [
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

export function getQuality(destination: AdminDestination): QualityStatus {
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

export function matchesQuality(destination: AdminDestination, filter: QualityFilter) {
  const quality = getQuality(destination);

  if (filter === "complete") return quality.score >= 90;
  if (filter === "missing-media") return !quality.hasThumbnail || !quality.hasGallery;
  if (filter === "missing-location") return !quality.hasMaps || !quality.hasCoordinates;
  if (filter === "missing-rating") return !quality.hasRating;
  return true;
}

export function matchesRating(destination: AdminDestination, filter: RatingFilter) {
  const rating = destination.googleRating ?? destination.userRating ?? null;

  if (filter === "4plus") return typeof rating === "number" && rating >= 4;
  if (filter === "under4") return typeof rating === "number" && rating > 0 && rating < 4;
  if (filter === "unrated") return !rating;
  return true;
}

export function sortDestinations(destinations: AdminDestination[], sort: SortFilter) {
  return [...destinations].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "city") return a.city.localeCompare(b.city);
    if (sort === "google-rating") return (b.googleRating ?? 0) - (a.googleRating ?? 0);
    if (sort === "user-rating") return (b.userRating ?? 0) - (a.userRating ?? 0);
    return String(b.createdAt ?? b.id).localeCompare(String(a.createdAt ?? a.id));
  });
}

export function getCityOptions(destinations: AdminDestination[]) {
  const cities = Array.from(new Set(destinations.map((destination) => destination.city).filter(Boolean))).sort();
  return [
    { value: "all", label: "Semua kota", description: "Tanpa filter kota" },
    ...cities.map((city) => ({ value: city, label: city })),
  ];
}

export function statusClass(tone: QualityStatus["tone"]) {
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

// Mengelola tabel destinasi admin, filter, CRUD, dan upload media.
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


