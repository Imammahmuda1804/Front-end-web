"use client";
import * as z from "zod";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { destinationSchema, DestinationFormValues } from "@/lib/validations/destination";
import { ThumbnailUploader } from "./thumbnail-uploader";
import { GalleryUploader, ExistingImage } from "./gallery-uploader";
import { toast } from "sonner";
import { adminDestinationService } from "@/services/admin/destination.service";
import {
  FileText,
  MapPin,
  ImageIcon,
  Check,
  Globe,
  Video,
  Navigation,
} from "lucide-react";

interface DestinationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: any;
}

const STEPS = [
  { label: "Informasi Dasar", icon: FileText, description: "Nama, deskripsi, dan lokasi" },
  { label: "Detail & Media", icon: MapPin, description: "Koordinat dan link media" },
  { label: "Upload Gambar", icon: ImageIcon, description: "Thumbnail dan galeri" },
];

export function DestinationFormModal({ open, onOpenChange, onSuccess, initialData }: DestinationFormModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);

  const isEditing = !!initialData;

  const { register, handleSubmit, formState: { errors }, trigger, reset, watch } = useForm<DestinationFormValues>({
    resolver: zodResolver(destinationSchema) as any,
    defaultValues: initialData || {
      name: "",
      description: "",
      city: "",
      province: "",
      latitude: 0,
      longitude: 0,
      googleMapsUrl: "",
      googlePlaceId: "",
      youtubeUrl: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        reset(initialData);
        setExistingImages(initialData.images || []);
      } else {
        reset({
          name: "",
          description: "",
          city: "",
          province: "",
          latitude: 0,
          longitude: 0,
          googleMapsUrl: "",
          googlePlaceId: "",
          youtubeUrl: "",
        });
        setExistingImages([]);
      }
      setStep(1);
      setThumbnailFile(null);
      setGalleryFiles([]);
    }
  }, [open, initialData, reset]);

  const handleDeleteExistingImage = async (imageId: number) => {
    try {
      await adminDestinationService.deleteDestinationImage(imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Gambar berhasil dihapus");
    } catch (error) {
      toast.error("Gagal menghapus gambar");
      console.error(error);
    }
  };

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(["name", "description", "city", "province"]);
    } else if (step === 2) {
      isValid = await trigger(["latitude", "longitude", "googleMapsUrl", "googlePlaceId", "youtubeUrl"]);
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

      // Clean up empty string values for optional fields
      const payload = {
        ...data,
        googleMapsUrl: data.googleMapsUrl?.trim() || undefined,
        youtubeUrl: data.youtubeUrl?.trim() || undefined,
        googlePlaceId: data.googlePlaceId?.trim() || undefined,
      };

      if (isEditing) {
        await adminDestinationService.updateDestination(destinationId, payload);
        toast.success("Destinasi berhasil diperbarui");
      } else {
        const result = await adminDestinationService.createDestination(payload);
        destinationId = result.data.id;
        toast.success("Destinasi berhasil ditambahkan");
      }

      // Upload thumbnail if selected (file upload → updates thumbnailUrl)
      if (thumbnailFile && destinationId) {
        await adminDestinationService.uploadThumbnail(destinationId, thumbnailFile);
        toast.success("Thumbnail berhasil diunggah");
      }

      // Upload gallery images if any (file upload → creates destination_images records)
      if (galleryFiles.length > 0 && destinationId) {
        await adminDestinationService.uploadGalleryImages(destinationId, galleryFiles);
        toast.success(`${galleryFiles.length} gambar galeri berhasil diunggah`);
      }

      onSuccess();
      onOpenChange(false);
      setStep(1);
      setThumbnailFile(null);
      setGalleryFiles([]);
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan data");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Destinasi" : "Tambah Destinasi Baru"}</DialogTitle>
          <DialogDescription>
            Langkah {step} dari 3: {STEPS[step - 1]?.label}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
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
                    className={`flex items-center justify-center h-9 w-9 rounded-full border-2 transition-all duration-300 ${
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
          {/* STEP 1 - Basic Info */}
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
          </div>

          {/* STEP 2 - Location & Media */}
          <div className={step === 2 ? "space-y-4" : "hidden"}>
            {/* Coordinates Section */}
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

            {/* External Links Section */}
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
                <Label htmlFor="googlePlaceId">Google Place ID (Opsional)</Label>
                <Input id="googlePlaceId" {...register("googlePlaceId")} placeholder="ChIJ..." />
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
          </div>

          {/* STEP 3 - Images: Thumbnail (cover) + Gallery + Summary */}
          <div className={step === 3 ? "space-y-5" : "hidden"}>
            {/* Thumbnail / Cover Image */}
            <div className="p-4 bg-muted/30 rounded-lg border">
              <h4 className="font-medium mb-1 flex items-center gap-2 text-sm">
                <ImageIcon className="h-4 w-4 text-primary" />
                Thumbnail (Cover)
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Gambar utama yang ditampilkan di daftar destinasi. Upload 1 gambar.
              </p>
              <ThumbnailUploader
                onFileChange={setThumbnailFile}
                currentThumbnailUrl={initialData?.thumbnailUrl}
              />
            </div>

            {/* Gallery Images */}
            <div className="p-4 bg-muted/30 rounded-lg border">
              <h4 className="font-medium mb-1 flex items-center gap-2 text-sm">
                <ImageIcon className="h-4 w-4 text-primary" />
                Galeri Gambar
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Gambar tambahan untuk halaman detail. Maksimal 5 gambar.
              </p>
              <GalleryUploader 
                onFilesChange={setGalleryFiles} 
                maxFiles={5} 
                existingImages={existingImages}
                onDeleteExisting={handleDeleteExistingImage}
              />
            </div>

            {/* Summary Preview */}
            <div className="p-4 bg-muted/30 rounded-lg border">
              <h4 className="font-medium mb-3 flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                Ringkasan
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nama</span>
                  <span className="font-medium truncate ml-4 max-w-[200px] text-right">
                    {watch("name") || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lokasi</span>
                  <span className="font-medium truncate ml-4 max-w-[200px] text-right">
                    {watch("city") && watch("province")
                      ? `${watch("city")}, ${watch("province")}`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Koordinat</span>
                  <span className="font-medium text-xs font-mono">
                    {watch("latitude") && watch("longitude")
                      ? `${watch("latitude")}, ${watch("longitude")}`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Google Maps</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      watch("googleMapsUrl")
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {watch("googleMapsUrl") ? "Tersedia" : "Belum diisi"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">YouTube</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      watch("youtubeUrl")
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {watch("youtubeUrl") ? "Tersedia" : "Belum diisi"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gambar</span>
                  <span className="font-medium">
                    {(thumbnailFile ? 1 : (initialData?.thumbnailUrl ? 1 : 0)) + galleryFiles.length + existingImages.length} file
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between items-center w-full">
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
                <Button onClick={handleSubmit(onSubmit as any)} disabled={isSubmitting}>
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
