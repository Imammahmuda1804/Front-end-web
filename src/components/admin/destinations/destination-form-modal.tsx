"use client";

import React, { useEffect, useState } from "react";
import { Resolver, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { destinationSchema, DestinationFormValues } from "@/lib/validations/destination";
import { DESTINATION_CATEGORIES } from "@/lib/destination-categories";
import { api } from "@/lib/axios";
import { ThumbnailUploader } from "./thumbnail-uploader";
import { GalleryUploader, ExistingImage } from "./gallery-uploader";
import { toast } from "sonner";
import { AdminDestination, adminDestinationService } from "@/services/admin/destination.service";
import {
  FileText,
  MapPin,
  ImageIcon,
  Check,
  Globe,
  Video,
  Navigation,
  Star,
} from "lucide-react";

interface DestinationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: AdminDestination;
}

const STEPS = [
  { label: "Informasi Dasar", icon: FileText, description: "Nama, deskripsi, dan lokasi" },
  { label: "Detail & Media", icon: MapPin, description: "Koordinat dan link media" },
  { label: "Upload Gambar", icon: ImageIcon, description: "Thumbnail dan galeri" },
];

function getHttpStatus(error: unknown) {
  if (typeof error !== "object" || error === null) return undefined;
  const maybeError = error as { response?: { status?: number }; status?: number };
  return maybeError.response?.status || maybeError.status;
}

type GalleryUploadError = Error & {
  isFileTooLarge?: boolean;
  successCount?: number;
  failedFiles?: string[];
};

type CategoryOption = { value: string; label: string };
type RawCategoryOption = { value?: unknown; label?: unknown };

export function DestinationFormModal({ open, onOpenChange, onSuccess, initialData }: DestinationFormModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailLink, setThumbnailLink] = useState<string>(initialData?.thumbnailUrl || "");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(initialData?.images || []);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([...DESTINATION_CATEGORIES]);

  const isEditing = !!initialData;

  const { register, handleSubmit, formState: { errors }, trigger, control, setValue } = useForm<DestinationFormValues>({
    resolver: zodResolver(destinationSchema) as Resolver<DestinationFormValues>,
    defaultValues: initialData ? { ...initialData, category: initialData.category || "alam" } : {
      name: "",
      description: "",
      city: "",
      province: "",
      category: "alam",
      latitude: 0,
      longitude: 0,
      googleMapsUrl: "",
      youtubeUrl: "",
      googleRating: undefined,
      googleReviewCount: undefined,
    },
  });
  const watchedValues = useWatch({ control });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/destinations/categories");
        const raw = res.data?.data ?? res.data;
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        const normalized = (list as RawCategoryOption[])
          .map((item) => ({
            value: String(item?.value ?? ""),
            label: String(item?.label ?? item?.value ?? ""),
          }))
          .filter((item) => item.value && item.label);

        if (normalized.length > 0) setCategoryOptions(normalized);
      } catch {
        setCategoryOptions([...DESTINATION_CATEGORIES]);
      }
    };

    if (open) fetchCategories();
  }, [open]);

  const handleDeleteExistingImage = async (imageId: number) => {
    try {
      await adminDestinationService.deleteDestinationImage(imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      
      const slug = initialData?.slug;
      if (slug) {
        fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag: `destination-${slug}` }),
        }).catch(e => console.error(e));
      }

      toast.success("Gambar berhasil dihapus");
    } catch (error) {
      toast.error("Gagal menghapus gambar");
      console.error(error);
    }
  };

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(["name", "description", "city", "province", "category"]);
    } else if (step === 2) {
      isValid = await trigger(["latitude", "longitude", "googleMapsUrl", "youtubeUrl", "googleRating", "googleReviewCount"]);
    }
    
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const onSubmit = async (data: DestinationFormValues) => {
    try {
      setIsSubmitting(true);
      
      let destinationId = initialData?.id;

      // Hapus nilai kosong pada field opsional.
      const payload = {
        ...data,
        googleMapsUrl: data.googleMapsUrl?.trim() || undefined,
        youtubeUrl: data.youtubeUrl?.trim() || undefined,
        thumbnailUrl: thumbnailLink || undefined,
        googleRating: data.googleRating ?? undefined,
        googleReviewCount: data.googleReviewCount ?? undefined,
      };

      if (isEditing && destinationId) {
        await adminDestinationService.updateDestination(destinationId, payload);
        toast.success("Destinasi berhasil diperbarui");
      } else {
        const result = await adminDestinationService.createDestination(payload);
        const createdDestination = "data" in result ? result.data : result;
        destinationId = createdDestination.id;
        toast.success("Destinasi berhasil ditambahkan");
      }

      // Upload thumbnail jika dipilih.
      if (thumbnailFile && destinationId) {
        try {
          await adminDestinationService.uploadThumbnail(destinationId, thumbnailFile);
          toast.success("Thumbnail berhasil diunggah");
        } catch (err: unknown) {
          const status = getHttpStatus(err);
          if (status === 413) {
            const sizeMB = (thumbnailFile.size / (1024 * 1024)).toFixed(1);
            toast.error(`Thumbnail terlalu besar (${sizeMB} MB). Maksimal 5 MB.`);
          } else {
            toast.error("Gagal mengunggah thumbnail");
          }
        }
      }

      // Upload gambar galeri destinasi.
      if (galleryFiles.length > 0 && destinationId) {
        try {
          await adminDestinationService.uploadGalleryImages(destinationId, galleryFiles);
          toast.success(`${galleryFiles.length} gambar galeri berhasil diunggah`);
        } catch (err: unknown) {
          const uploadError = err as GalleryUploadError;
          if (uploadError?.isFileTooLarge) {
            if ((uploadError.successCount || 0) > 0) {
              toast.warning(`${uploadError.successCount} gambar berhasil, tapi ${uploadError.failedFiles?.length || 0} gambar terlalu besar.`);
            }
            toast.error(uploadError.message);
          } else {
            toast.error("Gagal mengunggah gambar galeri");
          }
        }
      }

      // Revalidasi cache destinasi jika slug tersedia.
      const slug = initialData?.slug || data?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      if (slug) {
        try {
          await fetch('/api/revalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tag: `destination-${slug}` }),
          });
        } catch (e) {
          console.error("Failed to revalidate cache", e);
        }
      }

      onSuccess();
      onOpenChange(false);
      setStep(1);
      setThumbnailFile(null);
      setThumbnailLink("");
      setGalleryFiles([]);
    } catch (error: unknown) {
      const status = getHttpStatus(error);
      if (status === 413) {
        toast.error("File terlalu besar. Maksimal ukuran file adalah 5 MB.");
      } else {
        toast.error("Terjadi kesalahan saat menyimpan data");
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Destinasi" : "Tambah Destinasi Baru"}</DialogTitle>
          <DialogDescription>
            Langkah {step} dari 3: {STEPS[step - 1]?.label}
          </DialogDescription>
        </DialogHeader>

        
        <div className="flex items-center justify-center gap-2 py-2">
          {STEPS.map((s, i) => {
            const StepIcon = s.icon;
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;

            return (
              <React.Fragment key={stepNum}>
                {i > 0 && (
                  <div
                    className={`h-px flex-1 max-w-12 transition-colors duration-300 ${
                      isCompleted ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`flex items-center justify-center h-9 w-9 rounded-full border-2 transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-300 ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : isCompleted
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium leading-tight text-center max-w-16 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <div className="space-y-6 py-4">
          
          <div className={step === 1 ? "space-y-4" : "hidden"}>
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Destinasi <span className="text-destructive">*</span>
              </Label>
              <Input id="name" {...register("name")} placeholder="Contoh: Jam Gadang" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Deskripsi <span className="text-destructive">*</span>
              </Label>
              <Textarea id="description" {...register("description")} placeholder="Deskripsi lengkap..." rows={4} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">
                  Kota <span className="text-destructive">*</span>
                </Label>
                <Input id="city" {...register("city")} placeholder="Contoh: Bukittinggi" />
                {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">
                  Provinsi <span className="text-destructive">*</span>
                </Label>
                <Input id="province" {...register("province")} placeholder="Contoh: Sumatera Barat" />
                {errors.province && <p className="text-sm text-destructive">{errors.province.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Kategori <span className="text-destructive">*</span>
              </Label>
              <NativeSelect
                aria-label="Pilih kategori destinasi"
                value={watchedValues.category || "alam"}
                onValueChange={(value) => setValue("category", value, { shouldDirty: true, shouldValidate: true })}
                options={categoryOptions.map((category) => ({
                  value: category.value,
                  label: category.label,
                }))}
                className="min-h-11"
              />
              {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
            </div>
          </div>

          
          <div className={step === 2 ? "space-y-4" : "hidden"}>
            
            <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Navigation className="h-4 w-4 text-primary" />
                Koordinat Lokasi
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input id="latitude" type="number" step="any" {...register("latitude")} />
                  {errors.latitude && <p className="text-sm text-destructive">{errors.latitude.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input id="longitude" type="number" step="any" {...register("longitude")} />
                  {errors.longitude && <p className="text-sm text-destructive">{errors.longitude.message}</p>}
                </div>
              </div>
            </div>

            
            <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Link Eksternal
              </h4>

              <div className="space-y-2">
                <Label htmlFor="googleMapsUrl">Google Maps URL</Label>
                <Input id="googleMapsUrl" {...register("googleMapsUrl")} placeholder="https://maps.app.goo.gl/..." />
                {errors.googleMapsUrl && <p className="text-sm text-destructive">{errors.googleMapsUrl.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtubeUrl" className="flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5 text-red-500" />
                  YouTube Video URL (Opsional)
                </Label>
                <Input id="youtubeUrl" {...register("youtubeUrl")} placeholder="https://youtube.com/watch?v=..." />
                {errors.youtubeUrl && <p className="text-sm text-destructive">{errors.youtubeUrl.message}</p>}
              </div>
            </div>

            
            <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Rating Google Maps (Opsional)
              </h4>
              <p className="text-xs text-muted-foreground -mt-2">
                Salin dari halaman Google Maps destinasi ini.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="googleRating">Rating (1.0 â€“ 5.0)</Label>
                  <Input
                    id="googleRating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    placeholder="Contoh: 4.5"
                    {...register("googleRating")}
                  />
                  {errors.googleRating && <p className="text-sm text-destructive">{errors.googleRating.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="googleReviewCount">Jumlah Ulasan</Label>
                  <Input
                    id="googleReviewCount"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Contoh: 1200"
                    {...register("googleReviewCount")}
                  />
                  {errors.googleReviewCount && <p className="text-sm text-destructive">{errors.googleReviewCount.message}</p>}
                </div>
              </div>
            </div>
          </div>

          
          <div className={step === 3 ? "space-y-5" : "hidden"}>
            
            <div className="p-4 bg-muted/30 rounded-lg border">
              <h4 className="font-medium mb-1 flex items-center gap-2 text-sm">
                <ImageIcon className="h-4 w-4 text-primary" />
                Thumbnail (Cover)
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Gambar utama yang ditampilkan di daftar destinasi. Upload 1 gambar.
              </p>
              <ThumbnailUploader
                key={initialData?.id ?? "new-thumbnail"}
                onFileChange={setThumbnailFile}
                onUrlChange={setThumbnailLink}
                currentThumbnailUrl={initialData?.thumbnailUrl}
              />
            </div>

            
            <div className="p-4 bg-muted/30 rounded-lg border">
              <h4 className="font-medium mb-1 flex items-center gap-2 text-sm">
                <ImageIcon className="h-4 w-4 text-primary" />
                Galeri Gambar
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Gambar tambahan untuk halaman detail. Maksimal 20 gambar.
              </p>
              <GalleryUploader 
                onFilesChange={setGalleryFiles} 
                maxFiles={20} 
                existingImages={existingImages}
                onDeleteExisting={handleDeleteExistingImage}
              />
            </div>

            
            <div className="p-4 bg-muted/30 rounded-lg border">
              <h4 className="font-medium mb-3 flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                Ringkasan
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nama</span>
                  <span className="font-medium truncate ml-4 max-w-[200px] text-right">
                    {watchedValues.name || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lokasi</span>
                  <span className="font-medium truncate ml-4 max-w-[200px] text-right">
                    {watchedValues.city && watchedValues.province
                      ? `${watchedValues.city}, ${watchedValues.province}`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Koordinat</span>
                  <span className="font-medium text-xs font-mono">
                    {watchedValues.latitude && watchedValues.longitude
                      ? `${watchedValues.latitude}, ${watchedValues.longitude}`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Google Maps</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      watchedValues.googleMapsUrl
                        ? "bg-green-100 text-green-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {watchedValues.googleMapsUrl ? "Tersedia" : "Belum diisi"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">YouTube</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      watchedValues.youtubeUrl
                        ? "bg-red-100 text-red-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {watchedValues.youtubeUrl ? "Tersedia" : "Belum diisi"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gambar</span>
                  <span className="font-medium">
                    {(thumbnailFile || thumbnailLink ? 1 : 0) + galleryFiles.length + existingImages.length} file/link
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 flex w-full items-center justify-between bg-popover/95 backdrop-blur sm:justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Batal
              </Button>
            </div>
            <div className="flex gap-2">
              {step > 1 && (
                <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
                  Kembali
                </Button>
              )}
              {step < 3 ? (
                <Button onClick={nextStep}>
                  Selanjutnya
                </Button>
              ) : (
                <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Destinasi"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}


