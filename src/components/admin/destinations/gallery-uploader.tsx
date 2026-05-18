import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, UploadCloud } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export interface ExistingImage {
  id: number;
  imageUrl: string;
}

interface GalleryUploaderProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  existingImages?: ExistingImage[];
  onDeleteExisting?: (id: number) => void;
}

export function GalleryUploader({ 
  onFilesChange, 
  maxFiles = 5,
  existingImages = [],
  onDeleteExisting
}: GalleryUploaderProps) {
  const [files, setFiles] = useState<(File & { preview: string })[]>([]);

  // Count how many total images we have (existing + new)
  const totalImagesCount = existingImages.length + files.length;
  const remainingSlots = maxFiles - totalImagesCount;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (remainingSlots <= 0) return;
      
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      
      const combinedFiles = [...files, ...newFiles].slice(0, files.length + remainingSlots);
      setFiles(combinedFiles);
      onFilesChange(combinedFiles);
    },
    [files, remainingSlots, onFilesChange]
  );

  const removeNewFile = (fileToRemove: File & { preview: string }) => {
    const newFiles = files.filter((file) => file !== fileToRemove);
    setFiles(newFiles);
    onFilesChange(newFiles);
    URL.revokeObjectURL(fileToRemove.preview);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
    },
    maxFiles: Math.max(0, remainingSlots),
    disabled: remainingSlots <= 0,
  });

  const getFullImageUrl = (url: string) => {
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="space-y-4">
      {remainingSlots > 0 && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
          } ${remainingSlots <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps({ "aria-label": "Upload gambar galeri destinasi" })} />
          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm font-medium">
            Drag & drop gambar di sini, atau klik untuk memilih file
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Mendukung JPG, PNG, WEBP (Sisa {remainingSlots} slot)
          </p>
        </div>
      )}

      {(existingImages.length > 0 || files.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          
          {/* Render Existing Images */}
          {existingImages.map((img) => (
            <div key={img.id} className="relative group rounded-lg overflow-hidden border bg-muted h-32">
              <Image
                src={getFullImageUrl(img.imageUrl)}
                alt="Existing gallery image"
                fill
                sizes="320px"
                className="object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                Tersimpan
              </div>
              {onDeleteExisting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-11 w-11 rounded-full"
                    onClick={() => onDeleteExisting(img.id)}
                    aria-label="Hapus gambar tersimpan ini"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}

          {/* Render New Upload Files */}
          {files.map((file) => (
            <div key={file.name} className="relative group rounded-lg overflow-hidden border border-primary/50 bg-muted h-32">
              <Image
                src={file.preview}
                alt={file.name}
                fill
                sizes="320px"
                className="object-cover"
                onLoad={() => {
                  URL.revokeObjectURL(file.preview);
                }}
              />
              <div className="absolute top-2 left-2 bg-primary/80 text-white text-xs px-2 py-1 rounded">
                Baru
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-11 w-11 rounded-full"
                  onClick={() => removeNewFile(file)}
                  aria-label={`Hapus gambar ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}
