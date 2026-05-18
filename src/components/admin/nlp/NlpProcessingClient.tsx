"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  FileSpreadsheet,
  Layers3,
  MapPin,
  MessageSquareText,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Tags,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { adminDestinationService, type AdminDestination } from "@/services/admin/destination.service";
import { adminNlpService, type NlpUploadResponse } from "@/services/admin/nlp.service";

type Tone = "orange" | "blue" | "emerald" | "amber" | "rose" | "slate";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function sentimentTotal(result: NlpUploadResponse | null) {
  if (!result) return 0;
  return result.nlp_summary.positive + result.nlp_summary.neutral + result.nlp_summary.negative;
}

function sentimentPercent(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

export default function NlpProcessingClient() {
  const [destinations, setDestinations] = useState<AdminDestination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<NlpUploadResponse | null>(null);
  const [destinationsError, setDestinationsError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDestinations = useCallback(async () => {
    try {
      setDestinationsError("");
      const res = await adminDestinationService.getDestinations({ page: 1, limit: 100 });
      setDestinations(Array.isArray(res.data) ? res.data : []);
    } catch {
      setDestinationsError("Gagal memuat daftar destinasi.");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchDestinations();
    });
  }, [fetchDestinations]);

  const selectedDestinationName = useMemo(
    () => destinations.find((destination) => String(destination.id) === selectedDestination)?.name || "",
    [destinations, selectedDestination],
  );

  const total = sentimentTotal(result);
  const positiveRatio = result ? sentimentPercent(result.nlp_summary.positive, total) : 0;
  const negativeRatio = result ? sentimentPercent(result.nlp_summary.negative, total) : 0;
  const pipelineReadiness = [Boolean(selectedDestination), Boolean(file), !isProcessing].filter(Boolean).length;

  const setValidatedFile = (nextFile: File) => {
    const ext = nextFile.name.toLowerCase();
    if (!ext.endsWith(".xlsx") && !ext.endsWith(".xls") && !ext.endsWith(".csv")) {
      toast.error("Hanya file Excel (.xlsx, .xls) atau CSV (.csv) yang diterima");
      return;
    }
    setFile(nextFile);
    setResult(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) setValidatedFile(selected);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) setValidatedFile(dropped);
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
      const res = await adminNlpService.uploadAndProcess(file, Number(selectedDestination));
      setResult(res);
      toast.success(`Berhasil. ${res.total_reviews_processed} ulasan diproses.`);
    } catch (error) {
      const maybeError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(maybeError.response?.data?.message || maybeError.message || "Gagal memproses file NLP");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PipelineHeroPanel
        badge="Pipeline Operations"
        title="NLP Processing"
        description="Upload file hasil scraping, jalankan sentiment analysis, topic modelling, dan embedding untuk memperbarui insight destinasi."
        insights={[
          { label: "File siap proses", value: file ? "Siap" : "Belum", helper: file ? formatFileSize(file.size) : "Upload Excel/CSV", icon: FileSpreadsheet, tone: file ? "emerald" : "amber" },
          { label: "Review diproses", value: result ? String(result.total_reviews_processed) : "-", helper: result?.destination_name || selectedDestinationName || "Belum ada hasil", icon: MessageSquareText, tone: "blue" },
          { label: "Rasio positif", value: result ? `${positiveRatio}%` : "-", helper: "Dari hasil NLP terakhir", icon: BarChart3, tone: result ? "emerald" : "slate" },
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(23rem,0.8fr)_minmax(0,1.25fr)]">
        <NlpCommandPanel
          destinations={destinations}
          destinationsError={destinationsError}
          selectedDestination={selectedDestination}
          file={file}
          isProcessing={isProcessing}
          readiness={pipelineReadiness}
          fileInputRef={fileInputRef}
          onDestinationChange={setSelectedDestination}
          onFileChange={handleFileChange}
          onDrop={handleDrop}
          onRemoveFile={removeFile}
          onSubmit={handleSubmit}
        />

        <div className="space-y-6">
          <PipelineStepIndicator selectedDestination={Boolean(selectedDestination)} fileReady={Boolean(file)} isProcessing={isProcessing} hasResult={Boolean(result)} />
          <NlpResultWorkspace
            result={result}
            isProcessing={isProcessing}
            selectedDestinationId={selectedDestination}
            positiveRatio={positiveRatio}
            negativeRatio={negativeRatio}
          />
        </div>
      </section>
    </div>
  );
}

function NlpCommandPanel({
  destinations,
  destinationsError,
  selectedDestination,
  file,
  isProcessing,
  readiness,
  fileInputRef,
  onDestinationChange,
  onFileChange,
  onDrop,
  onRemoveFile,
  onSubmit,
}: {
  destinations: AdminDestination[];
  destinationsError: string;
  selectedDestination: string;
  file: File | null;
  isProcessing: boolean;
  readiness: number;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDestinationChange: (value: string) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: React.DragEvent) => void;
  onRemoveFile: () => void;
  onSubmit: () => void;
}) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-primary">
          <BrainCircuit className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">NLP command</p>
          <h2 className="text-xl font-black text-slate-950">Upload & Proses NLP</h2>
        </div>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-600">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Destinasi
          </span>
          <NativeSelect
            aria-label="Pilih destinasi untuk proses NLP"
            value={selectedDestination}
            onValueChange={onDestinationChange}
            options={destinations.map((destination) => ({
              value: String(destination.id),
              label: destination.name,
              description: destination.city || undefined,
            }))}
            placeholder={destinationsError || "Pilih destinasi wisata"}
            searchable
            searchPlaceholder="Cari nama destinasi..."
          />
        </label>

        <div>
          <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-600">
            <FileSpreadsheet className="h-3.5 w-3.5 text-[#2D82B5]" />
            File hasil scraping
          </span>
          {!file ? (
            <button
              type="button"
              onDragOver={(event) => event.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-52 w-full flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50/70 p-6 text-center transition hover:border-primary hover:bg-orange-50/60 focus:outline-none focus:ring-4 focus:ring-primary/15"
            >
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={onFileChange} className="hidden" />
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                <Upload className="h-7 w-7" />
              </span>
              <span className="text-sm font-black text-slate-800">Klik atau seret file ke sini</span>
              <span className="mt-1 text-xs font-semibold text-slate-500">Excel atau CSV dari hasil scraping</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-slate-950">{file.name}</p>
                <p className="mt-1 text-xs font-bold text-emerald-700">{formatFileSize(file.size)}</p>
              </div>
              <button type="button" aria-label="Hapus file" onClick={onRemoveFile} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-rose-600 transition hover:bg-rose-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Pipeline readiness</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((readiness / 3) * 100)}%` }} />
          </div>
          <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">Pilih destinasi, upload file, lalu jalankan NLP. Proses dapat memakan waktu beberapa menit.</p>
        </div>

        <Button
          className="min-h-12 w-full rounded-full bg-primary px-5 font-black text-white shadow-sm shadow-orange-200 hover:bg-primary/90"
          onClick={onSubmit}
          disabled={isProcessing || !selectedDestination || !file}
        >
          {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
          {isProcessing ? "Memproses..." : "Mulai Analisis NLP"}
          {!isProcessing && <ArrowRight className="ml-auto h-4 w-4 opacity-70" />}
        </Button>
      </div>
    </section>
  );
}

function PipelineStepIndicator({ selectedDestination, fileReady, isProcessing, hasResult }: { selectedDestination: boolean; fileReady: boolean; isProcessing: boolean; hasResult: boolean }) {
  const steps = [
    { label: "Pilih destinasi", done: selectedDestination, active: !selectedDestination },
    { label: "Upload file", done: fileReady, active: selectedDestination && !fileReady },
    { label: "Jalankan NLP", done: hasResult, active: isProcessing || (selectedDestination && fileReady && !hasResult) },
    { label: "Review hasil", done: hasResult, active: hasResult },
  ];

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-primary">Pipeline stepper</p>
      <div className="grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.label} className={`rounded-2xl border p-4 ${step.done ? "border-emerald-100 bg-emerald-50" : step.active ? "border-orange-100 bg-orange-50" : "border-slate-200 bg-slate-50"}`}>
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-black text-slate-950">{index + 1}</div>
            <p className="text-sm font-black text-slate-950">{step.label}</p>
            <p className={`mt-1 text-xs font-bold ${step.done ? "text-emerald-700" : step.active ? "text-primary" : "text-slate-500"}`}>{step.done ? "Selesai" : step.active ? "Aktif" : "Menunggu"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function NlpResultWorkspace({ result, isProcessing, selectedDestinationId, positiveRatio, negativeRatio }: { result: NlpUploadResponse | null; isProcessing: boolean; selectedDestinationId: string; positiveRatio: number; negativeRatio: number }) {
  if (isProcessing) {
    return (
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-primary">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
        <h2 className="text-xl font-black text-slate-950">Pipeline NLP sedang berjalan</h2>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-7 text-slate-500">Sistem membaca file, menyimpan review, menghitung rating, lalu menjalankan sentimen, topik, dan embedding.</p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="flex min-h-[28rem] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <FileSpreadsheet className="mb-4 h-10 w-10 text-slate-300" />
        <h2 className="text-xl font-black text-slate-950">Belum ada hasil analisis</h2>
        <p className="mt-2 max-w-md text-sm font-semibold leading-7 text-slate-500">Pilih destinasi, upload file hasil scraping, lalu jalankan analisis NLP.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-700" />
          <div>
            <p className="font-black text-emerald-900">Analisis selesai</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-emerald-700">{result.total_reviews_processed} ulasan berhasil diproses untuk {result.destination_name}.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PipelineMetricCard label="Total Ulasan" value={String(result.nlp_summary.total)} helper="Masuk pipeline NLP" icon={MessageSquareText} tone="blue" />
        <PipelineMetricCard label="Rating Rata-rata" value={result.scraped_average_rating ? `${result.scraped_average_rating} / 5` : "-"} helper="Dari file scraping" icon={Sparkles} tone="amber" />
        <PipelineMetricCard label="Positif" value={String(result.nlp_summary.positive)} helper={`${positiveRatio}% dari total`} icon={BarChart3} tone="emerald" />
        <PipelineMetricCard label="Negatif" value={String(result.nlp_summary.negative)} helper={`${negativeRatio}% dari total`} icon={ShieldAlert} tone={negativeRatio >= 20 ? "rose" : "slate"} />
      </section>

      <SentimentStackedBar result={result} positiveRatio={positiveRatio} negativeRatio={negativeRatio} />
      <PipelineActionPanel selectedDestinationId={selectedDestinationId} negativeRatio={negativeRatio} />
    </div>
  );
}

function SentimentStackedBar({ result, positiveRatio, negativeRatio }: { result: NlpUploadResponse; positiveRatio: number; negativeRatio: number }) {
  const total = sentimentTotal(result);
  const neutralRatio = sentimentPercent(result.nlp_summary.neutral, total);
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Sentiment 100% stacked</p>
      <h3 className="mt-1 text-xl font-black text-slate-950">Distribusi Sentimen</h3>
      <div className="mt-5 flex h-5 overflow-hidden rounded-full bg-slate-100">
        <div className="bg-emerald-500" style={{ width: `${positiveRatio}%` }} />
        <div className="bg-slate-300" style={{ width: `${neutralRatio}%` }} />
        <div className="bg-rose-500" style={{ width: `${negativeRatio}%` }} />
      </div>
      <div className="mt-4 grid gap-2 text-xs font-black sm:grid-cols-3">
        <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700">Positif {positiveRatio}%</span>
        <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-600">Netral {neutralRatio}%</span>
        <span className="rounded-full bg-rose-50 px-3 py-2 text-rose-700">Negatif {negativeRatio}%</span>
      </div>
    </section>
  );
}

function PipelineActionPanel({ selectedDestinationId, negativeRatio }: { selectedDestinationId: string; negativeRatio: number }) {
  const needsAudit = negativeRatio >= 20;
  const links = [
    { label: "Buka Review", href: selectedDestinationId ? `/admin/reviews?destinationId=${selectedDestinationId}&tab=reviews` : "/admin/reviews", icon: MessageSquareText, tone: needsAudit ? "rose" as Tone : "blue" as Tone },
    { label: "Kelola Topik", href: "/admin/topics", icon: Tags, tone: "orange" as Tone },
    { label: "Compare Analytics", href: "/admin/compare", icon: Layers3, tone: "emerald" as Tone },
  ];

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className={`mb-5 rounded-2xl border p-4 ${needsAudit ? "border-rose-100 bg-rose-50 text-rose-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}>
        <div className="flex items-start gap-3">
          {needsAudit ? <AlertTriangle className="mt-0.5 h-5 w-5" /> : <CheckCircle2 className="mt-0.5 h-5 w-5" />}
          <div>
            <p className="font-black text-slate-950">{needsAudit ? "Perlu audit review negatif" : "Risiko sentimen terkendali"}</p>
            <p className="mt-1 text-sm font-semibold leading-6 opacity-80">{needsAudit ? `${negativeRatio}% hasil bernada negatif. Prioritaskan review management.` : "Distribusi negatif masih rendah dari hasil pemrosesan terakhir."}</p>
          </div>
        </div>
      </div>
      <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[#2D82B5]">Next action</p>
      <div className="grid gap-3 md:grid-cols-3">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href} className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 ${getToneClass(item.tone)}`}>
              <Icon className="mb-3 h-5 w-5" />
              <p className="font-black text-slate-950">{item.label}</p>
              <p className="mt-1 text-xs font-bold opacity-80">Lanjutkan tindak lanjut admin</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function PipelineHeroPanel({
  badge,
  title,
  description,
  insights,
}: {
  badge: string;
  title: string;
  description: string;
  insights: Array<{ label: string; value: string; helper: string; icon: React.ElementType; tone: Tone }>;
}) {
  return (
    <section className="rounded-[2rem] border border-orange-100 bg-orange-50/70 p-6 shadow-sm shadow-orange-100/50">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-primary shadow-sm">
            <BrainCircuit className="h-3.5 w-3.5" />
            {badge}
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-600 md:text-base">{description}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3 xl:min-w-[42rem]">
          {insights.map((insight) => <PipelineMetricCard key={insight.label} {...insight} />)}
        </div>
      </div>
    </section>
  );
}

function PipelineMetricCard({ icon: Icon, label, value, helper, tone }: { icon: React.ElementType; label: string; value: string; helper: string; tone: Tone }) {
  return (
    <article className={`rounded-3xl border p-4 shadow-sm ${getToneClass(tone)}`}>
      <Icon className="mb-3 h-5 w-5" />
      <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold opacity-80">{helper}</p>
    </article>
  );
}

function getToneClass(tone: Tone) {
  return {
    orange: "border-orange-100 bg-orange-50 text-primary",
    blue: "border-sky-100 bg-sky-50 text-[#2D82B5]",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    rose: "border-rose-100 bg-rose-50 text-rose-700",
    slate: "border-slate-200 bg-white text-slate-700",
  }[tone];
}
