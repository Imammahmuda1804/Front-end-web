"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { adminNlpService, type NlpUploadResponse } from "@/services/admin/nlp.service";
import { adminDestinationService } from "@/services/admin/destination.service";
import { toast } from "sonner";
import {
  MapPin,
  Upload,
  FileSpreadsheet,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  ArrowRight,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

export default function NlpProcessingClient() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<NlpUploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Data fetchers ────────────────────────────────────────────────────

  const fetchDestinations = useCallback(async () => {
    try {
      const res = await adminDestinationService.getDestinations({
        page: 1,
        limit: 100,
      });
      const data = res.data?.data || res.data || res || [];
      setDestinations(Array.isArray(data) ? data : []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  // ── File handling ────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const ext = selected.name.toLowerCase();
      if (!ext.endsWith(".xlsx") && !ext.endsWith(".xls") && !ext.endsWith(".csv")) {
        toast.error("Hanya file Excel (.xlsx) atau CSV (.csv) yang diterima");
        return;
      }
      setFile(selected);
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      const ext = dropped.name.toLowerCase();
      if (!ext.endsWith(".xlsx") && !ext.endsWith(".xls") && !ext.endsWith(".csv")) {
        toast.error("Hanya file Excel (.xlsx) atau CSV (.csv) yang diterima");
        return;
      }
      setFile(dropped);
      setResult(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!selectedDestination) {
      toast.error("Pilih destinasi terlebih dahulu");
      return;
    }
    if (!file) {
      toast.error("Upload file Excel/CSV terlebih dahulu");
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const res = await adminNlpService.uploadAndProcess(
        file,
        parseInt(selectedDestination, 10),
      );
      setResult(res);
      toast.success(`Berhasil! ${res.total_reviews_processed} ulasan diproses.`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal memproses file NLP";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Format helpers ───────────────────────────────────────────────────

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      {/* ── LEFT: Upload Panel ───────────────────────────────────────── */}
      <div className="space-y-4">
        <Card className="border-slate-200 shadow-sm shadow-slate-100">
          <CardHeader className="pb-4 border-b border-slate-100 bg-gradient-to-br from-violet-50/60 to-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <BrainCircuit className="w-4.5 h-4.5 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Upload & Proses NLP
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Upload file Excel hasil scraping untuk dianalisis
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-5">
            {/* Step 1: Pilih Destinasi */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold flex items-center justify-center">
                  1
                </span>
                <MapPin className="w-3.5 h-3.5 text-violet-500" />
                Pilih Destinasi
                <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={selectedDestination}
                onValueChange={(v) => setSelectedDestination(v || "")}
              >
                <SelectTrigger className="bg-slate-50 border-slate-200 focus:border-violet-400 focus:ring-violet-400/20 rounded-xl h-11">
                  <SelectValue placeholder="Pilih destinasi wisata…" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-slate-400 text-center">
                      Memuat destinasi…
                    </div>
                  ) : (
                    destinations.map((d) => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        <span className="font-medium text-slate-800">
                          {d.name}
                        </span>
                        {d.city && (
                          <span className="ml-1.5 text-slate-400 text-xs">
                            · {d.city}
                          </span>
                        )}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-slate-100" />

            {/* Step 2: Upload File */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold flex items-center justify-center">
                  2
                </span>
                <FileSpreadsheet className="w-3.5 h-3.5 text-violet-500" />
                Upload File
                <span className="text-rose-500">*</span>
              </Label>

              {!file ? (
                <div
                  className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-all duration-200 group"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-violet-100 flex items-center justify-center mx-auto mb-3 transition-colors">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-violet-500 transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    Klik atau seret file ke sini
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    File Excel (.xlsx) atau CSV (.csv) — Maks 50 MB
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Hapus file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <Separator className="bg-slate-100" />

            {/* Step 3: Process */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold flex items-center justify-center">
                  3
                </span>
                Jalankan Analisis
              </Label>

              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-3">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Sistem akan membaca file, menyimpan ulasan ke database,
                  menghitung rata-rata rating, lalu menjalankan pipeline NLP
                  (sentimen, topik, embedding). Proses ini dapat memakan waktu
                  beberapa menit.
                </p>
              </div>

              <Button
                className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-sm hover:shadow-md hover:shadow-violet-500/25 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
                onClick={handleSubmit}
                disabled={isProcessing || !selectedDestination || !file}
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <BrainCircuit className="w-4 h-4 mr-2" />
                )}
                {isProcessing ? "Memproses…" : "Mulai Analisis NLP"}
                {!isProcessing && (
                  <ArrowRight className="w-4 h-4 ml-auto opacity-70" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── RIGHT: Result Panel ──────────────────────────────────────── */}
      <Card className="border-slate-200 shadow-sm shadow-slate-100 flex flex-col overflow-hidden">
        <CardHeader className="pb-4 border-b border-slate-100 bg-gradient-to-br from-slate-50/60 to-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Hasil Analisis
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Ringkasan hasil pemrosesan NLP
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 flex-1">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center">
                  <BrainCircuit className="w-8 h-8 text-violet-500 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                  <RefreshCw className="w-3 h-3 text-white animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-600">
                  Memproses data ulasan…
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Pipeline NLP sedang berjalan. Ini bisa memakan waktu beberapa
                  menit.
                </p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Success header */}
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-800">
                    Analisis Selesai
                  </p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    {result.total_reviews_processed} ulasan berhasil diproses
                    untuk &quot;{result.destination_name}&quot;
                  </p>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Total Ulasan"
                  value={result.nlp_summary.total}
                  icon={<BarChart3 className="w-4 h-4" />}
                  color="slate"
                />
                <StatCard
                  label="Rata-rata Rating"
                  value={
                    result.scraped_average_rating
                      ? `${result.scraped_average_rating} / 5`
                      : "—"
                  }
                  icon={<TrendingUp className="w-4 h-4" />}
                  color="amber"
                />
                <StatCard
                  label="Positif"
                  value={result.nlp_summary.positive}
                  icon={<TrendingUp className="w-4 h-4" />}
                  color="emerald"
                />
                <StatCard
                  label="Negatif"
                  value={result.nlp_summary.negative}
                  icon={<TrendingDown className="w-4 h-4" />}
                  color="rose"
                />
              </div>

              {/* Sentiment bar */}
              {result.nlp_summary.total > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Distribusi Sentimen
                  </p>
                  <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
                    <div
                      className="bg-emerald-500 transition-all duration-500"
                      style={{
                        width: `${(result.nlp_summary.positive / result.nlp_summary.total) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-slate-300 transition-all duration-500"
                      style={{
                        width: `${(result.nlp_summary.neutral / result.nlp_summary.total) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-rose-500 transition-all duration-500"
                      style={{
                        width: `${(result.nlp_summary.negative / result.nlp_summary.total) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Positif ({((result.nlp_summary.positive / result.nlp_summary.total) * 100).toFixed(0)}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                      Netral ({((result.nlp_summary.neutral / result.nlp_summary.total) * 100).toFixed(0)}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Negatif ({((result.nlp_summary.negative / result.nlp_summary.total) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <FileSpreadsheet className="w-7 h-7 text-slate-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-500">
                  Belum ada hasil analisis
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pilih destinasi, upload file, lalu jalankan analisis NLP
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Stat Card Component ──────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "slate" | "emerald" | "rose" | "amber";
}) {
  const colors = {
    slate: "bg-slate-50 text-slate-600 ring-slate-200",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-200",
    rose: "bg-rose-50 text-rose-600 ring-rose-200",
    amber: "bg-amber-50 text-amber-600 ring-amber-200",
  };

  const iconColors = {
    slate: "bg-slate-100 text-slate-500",
    emerald: "bg-emerald-100 text-emerald-500",
    rose: "bg-rose-100 text-rose-500",
    amber: "bg-amber-100 text-amber-500",
  };

  return (
    <div
      className={`rounded-xl p-4 ring-1 ring-inset ${colors[color]} transition-all hover:ring-2`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconColors[color]}`}
        >
          {icon}
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
