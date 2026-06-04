import Image from "next/image";
import React from "react";
import { AlertTriangle, BarChart2, CheckCircle2, Edit, Eye, ImageIcon, Layers3, Loader2, MapPin, RefreshCw, Search, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDestinationCategoryLabel } from "@/lib/destination-categories";
import { getImageUrl } from "@/lib/utils";
import type { AdminDestination } from "@/services/admin/destination.service";
import { getQuality, statusClass, type DeleteTarget } from "./destinations-table";
export function DestinationsDataTable({
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
            <TableHead colSpan={8} className="h-auto px-4 py-3">
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
            <TableHead>Kategori</TableHead>
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
              <TableCell colSpan={8}>
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
                    <span className="inline-flex rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-xs font-black text-primary">
                      {getDestinationCategoryLabel(destination.category)}
                    </span>
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

export function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell colSpan={8}>
            <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function EmptyState({ hasActiveFilters, onReset }: { hasActiveFilters: boolean; onReset: () => void }) {
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

export function StatusPill({ active, label, icon }: { active: boolean; label: string; icon: React.ReactNode }) {
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

export function DestinationPreviewDrawer({
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
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
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

          <section className="rounded-xl border border-slate-200 p-4">
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

          <section className="rounded-xl border border-slate-200 p-4">
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

          <section className="rounded-xl border border-slate-200 p-4">
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

export function PreviewMetric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="truncate text-right font-medium text-slate-800">{value}</span>
    </div>
  );
}

export function DeleteConfirmationDialog({
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
        <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
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


