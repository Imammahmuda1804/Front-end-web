import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, UploadCloud, Link as LinkIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ThumbnailUploaderProps {
  onFileChange: (file: File | null) => void;
  onUrlChange: (url: string) => void;
  currentThumbnailUrl?: string;
}

export function ThumbnailUploader({ onFileChange, onUrlChange, currentThumbnailUrl }: ThumbnailUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentThumbnailUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState<string>(currentThumbnailUrl?.startsWith('http') ? currentThumbnailUrl : "");
  const [mode, setMode] = useState<"upload" | "url">("upload");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
        setFileName(file.name);
        onFileChange(file);
        onUrlChange(""); // clear URL if file is chosen
        setUrlInput("");
      }
    },
    [onFileChange, onUrlChange]
  );

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setPreview(urlInput.trim());
      setFileName(null);
      onFileChange(null); // clear file if URL is used
      onUrlChange(urlInput.trim());
    }
  };

  const removeFile = () => {
    if (preview && !currentThumbnailUrl) {
      // only revoke if it's a blob
      if (preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    }
    setPreview(null);
    setFileName(null);
    setUrlInput("");
    onFileChange(null);
    onUrlChange("");
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
        <div className="relative group rounded-lg overflow-hidden border bg-muted max-w-xs h-48">
          <Image
            src={getFullImageUrl(preview)}
            alt="Thumbnail preview"
            fill
            sizes="320px"
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <Button
              variant="destructive"
              size="icon"
              className="h-11 w-11 rounded-full"
              onClick={removeFile}
              type="button"
              aria-label="Hapus thumbnail"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {fileName ? (
            <p className="text-xs text-muted-foreground p-2 truncate">File: {fileName}</p>
          ) : (
            <p className="text-xs text-muted-foreground p-2 truncate">URL: {preview}</p>
          )}
        </div>
      ) : (
        <div className="w-full max-w-xs space-y-4">
          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mode === "upload" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Upload Gambar
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mode === "url" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Link URL
            </button>
          </div>
          
          {mode === "upload" ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors w-full ${
                isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
              }`}
            >
              <input {...getInputProps({ "aria-label": "Upload thumbnail destinasi" })} />
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Pilih gambar cover</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP (1 gambar)</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="url" 
                  placeholder="https://example.com/image.jpg" 
                  className="pl-9"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
                  aria-label="URL thumbnail destinasi"
                />
              </div>
              <Button type="button" size="sm" onClick={handleUrlSubmit} className="w-full">
                Pratinjau & Gunakan URL
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
