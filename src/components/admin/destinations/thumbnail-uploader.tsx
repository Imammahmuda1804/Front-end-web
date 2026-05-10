import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, UploadCloud, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThumbnailUploaderProps {
  onFileChange: (file: File | null) => void;
  currentThumbnailUrl?: string;
}

export function ThumbnailUploader({ onFileChange, currentThumbnailUrl }: ThumbnailUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentThumbnailUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);

  React.useEffect(() => {
    setPreview(currentThumbnailUrl || null);
    setFileName(null);
  }, [currentThumbnailUrl]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
        setFileName(file.name);
        onFileChange(file);
      }
    },
    [onFileChange]
  );

  const removeFile = () => {
    if (preview && !currentThumbnailUrl) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setFileName(null);
    onFileChange(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
    },
    maxFiles: 1,
    multiple: false,
  });

  const getFullImageUrl = (url: string) => {
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative group rounded-lg overflow-hidden border bg-muted max-w-xs">
          <img
            src={getFullImageUrl(preview)}
            alt="Thumbnail preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {fileName && (
            <p className="text-xs text-muted-foreground p-2 truncate">{fileName}</p>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors max-w-xs ${
            isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">
            Pilih gambar cover
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG, WEBP (1 gambar)
          </p>
        </div>
      )}
    </div>
  );
}
