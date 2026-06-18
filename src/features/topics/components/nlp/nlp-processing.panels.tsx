import type { ChangeEvent, DragEvent, ElementType, RefObject } from "react";
import {
  ArrowRight,
  BrainCircuit,
  FileSpreadsheet,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Trash2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import type { AdminDestination } from "@/features/admin";
import type {
  NlpHistoryItem,
  NlpPreflightResponse,
  NlpProcessingMode,
} from "../../services/nlp.service";
import {
  formatDateTime,
  formatFileSize,
  getToneClass,
  type Tone,
} from "./nlp-processing.utils";

export function NlpCommandPanel({
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
  preflight,
  preflightError,
  isPreflighting,
  mode,
  onModeChange,
}: {
  destinations: AdminDestination[];
  destinationsError: string;
  selectedDestination: string;
  file: File | null;
  isProcessing: boolean;
  readiness: number;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onDestinationChange: (value: string) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: DragEvent) => void;
  onRemoveFile: () => void;
  onSubmit: () => void;
  preflight: NlpPreflightResponse | null;
  preflightError: string;
  isPreflighting: boolean;
  mode: NlpProcessingMode;
  onModeChange: (mode: NlpProcessingMode) => void;
}) {
  const modes: Array<{ value: NlpProcessingMode; label: string; helper: string; tone: string }> = [
    { value: "skip_existing", label: "Lewati duplikat", helper: "Aman untuk file yang pernah dipakai", tone: "emerald" },
    { value: "reprocess_existing", label: "Proses ulang", helper: "Hitung ulang review yang sama", tone: "blue" },
    { value: "replace_existing", label: "Ganti data", helper: "Hapus data scraping lama destinasi", tone: "rose" },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50 text-primary">
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
            <FileSpreadsheet className="h-3.5 w-3.5 text-ai" />
            File hasil scraping
          </span>
          {!file ? (
            <button
              type="button"
              onDragOver={(event) => event.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-52 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/70 p-6 text-center transition hover:border-primary hover:bg-orange-50/60 focus:outline-none focus:ring-4 focus:ring-primary/15"
            >
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={onFileChange} className="hidden" />
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
                <Upload className="h-7 w-7" />
              </span>
              <span className="text-sm font-black text-slate-800">Klik atau seret file ke sini</span>
              <span className="mt-1 text-xs font-semibold text-slate-500">Excel atau CSV dari hasil scraping</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-emerald-700">
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

        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Pipeline readiness</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((readiness / 3) * 100)}%` }} />
          </div>
          <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">Pilih destinasi, upload file, lalu jalankan NLP. Proses dapat memakan waktu beberapa menit.</p>
        </div>

        <PreflightPanel preflight={preflight} preflightError={preflightError} isPreflighting={isPreflighting} file={file} selectedDestination={selectedDestination} />
        <ProcessModeSelector modes={modes} mode={mode} onModeChange={onModeChange} />

        <Button
          className="min-h-12 w-full rounded-full bg-primary px-5 font-black text-white shadow-sm shadow-orange-200 hover:bg-primary/90"
          onClick={onSubmit}
          disabled={isProcessing || isPreflighting || !selectedDestination || !file || !preflight}
        >
          {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
          {isProcessing ? "Memproses..." : "Mulai Analisis NLP"}
          {!isProcessing && <ArrowRight className="ml-auto h-4 w-4 opacity-70" />}
        </Button>
      </div>
    </section>
  );
}

function PreflightPanel({
  preflight,
  preflightError,
  isPreflighting,
  file,
  selectedDestination,
}: {
  preflight: NlpPreflightResponse | null;
  preflightError: string;
  isPreflighting: boolean;
  file: File | null;
  selectedDestination: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Preflight file</p>
        {isPreflighting ? <RefreshCw className="h-4 w-4 animate-spin text-primary" /> : null}
      </div>
      {preflight ? (
        <div className="grid gap-2 text-sm font-bold text-slate-700">
          <div className="flex justify-between gap-3"><span>Total baris</span><span className="text-slate-950">{preflight.total_rows}</span></div>
          <div className="flex justify-between gap-3"><span>Review baru</span><span className="text-emerald-700">{preflight.new_reviews}</span></div>
          <div className="flex justify-between gap-3"><span>Duplikat</span><span className="text-amber-700">{preflight.duplicate_reviews}</span></div>
          {preflight.already_processed ? (
            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
              File ini pernah diproses. Gunakan &quot;Proses ulang&quot; jika ingin menghitung ulang analisis tanpa menambah review.
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-xs font-semibold leading-5 text-slate-500">
          {preflightError || (file && selectedDestination ? "Mengecek file..." : "Pilih destinasi dan file untuk melihat potensi duplikat.")}
        </p>
      )}
    </div>
  );
}

function ProcessModeSelector({
  modes,
  mode,
  onModeChange,
}: {
  modes: Array<{ value: NlpProcessingMode; label: string; helper: string; tone: string }>;
  mode: NlpProcessingMode;
  onModeChange: (mode: NlpProcessingMode) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Mode proses</p>
      <div className="grid gap-2">
        {modes.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={mode === item.value}
            onClick={() => onModeChange(item.value)}
            className={`rounded-lg border p-3 text-left transition ${
              mode === item.value
                ? "border-primary bg-orange-50 ring-2 ring-primary/15"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <span className="block text-sm font-black text-slate-950">{item.label}</span>
            <span className={`mt-1 block text-xs font-semibold ${item.tone === "rose" ? "text-rose-600" : item.tone === "blue" ? "text-ai" : "text-emerald-700"}`}>{item.helper}</span>
          </button>
        ))}
      </div>
      {mode === "replace_existing" ? (
        <div className="mt-3 flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold leading-5 text-rose-700">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          Mode ini menghapus review scraping lama destinasi sebelum insert ulang.
        </div>
      ) : null}
    </div>
  );
}

export function PipelineStepIndicator({ selectedDestination, fileReady, isProcessing, hasResult }: { selectedDestination: boolean; fileReady: boolean; isProcessing: boolean; hasResult: boolean }) {
  const steps = [
    { label: "Pilih destinasi", done: selectedDestination, active: !selectedDestination },
    { label: "Upload file", done: fileReady, active: selectedDestination && !fileReady },
    { label: "Jalankan NLP", done: hasResult, active: isProcessing || (selectedDestination && fileReady && !hasResult) },
    { label: "Review hasil", done: hasResult, active: hasResult },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-primary">Pipeline stepper</p>
      <div className="grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.label} className={`rounded-lg border p-4 ${step.done ? "border-emerald-100 bg-emerald-50" : step.active ? "border-orange-100 bg-orange-50" : "border-slate-200 bg-slate-50"}`}>
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-black text-slate-950">{index + 1}</div>
            <p className="text-sm font-black text-slate-950">{step.label}</p>
            <p className={`mt-1 text-xs font-bold ${step.done ? "text-emerald-700" : step.active ? "text-primary" : "text-slate-500"}`}>{step.done ? "Selesai" : step.active ? "Aktif" : "Menunggu"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function NlpHistoryPanel({
  history,
  loading,
  error,
  selectedHistory,
  onSelectHistory,
  onRefresh,
}: {
  history: NlpHistoryItem[];
  loading: boolean;
  error: string;
  selectedHistory: NlpHistoryItem | null;
  onSelectHistory: (item: NlpHistoryItem | null) => void;
  onRefresh: () => void;
}) {
  const statusClass = (status: string) => {
    if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (status === "failed") return "bg-rose-50 text-rose-700 border-rose-100";
    return "bg-amber-50 text-amber-700 border-amber-100";
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">History process</p>
          <h2 className="text-xl font-black text-slate-950">Riwayat Proses NLP</h2>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="min-h-11 rounded-full">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Muat ulang
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-100 bg-rose-50 p-5 text-sm font-semibold text-rose-700">{error}</div>
      ) : history.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-5 text-sm font-semibold text-slate-500">
          Belum ada riwayat proses NLP. Riwayat baru dibuat setelah admin menekan tombol proses, bukan saat preflight.
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectHistory(selectedHistory?.id === item.id ? null : item)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/60 p-4 text-left transition hover:border-primary/40 hover:bg-orange-50/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">{item.destination?.name || `Destinasi #${item.destinationId}`}</p>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-500">{item.fileName}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${statusClass(item.status)}`}>{item.status}</span>
              </div>
              <div className="mt-3 grid gap-2 text-xs font-bold text-slate-600 sm:grid-cols-4">
                <span>Mode: {item.mode}</span>
                <span>Insert: {item.insertedReviews}</span>
                <span>Duplikat: {item.skippedDuplicates}</span>
                <span>Proses: {item.processedReviews}</span>
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-400">{formatDateTime(item.startedAt)}</p>
            </button>
          ))}
        </div>
      )}

      {selectedHistory ? (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-black text-slate-950">Detail run #{selectedHistory.id}</p>
          <dl className="mt-3 grid gap-2 text-sm font-semibold text-slate-600 md:grid-cols-2">
            <div><dt className="text-xs uppercase tracking-[0.12em] text-slate-400">Admin</dt><dd>{selectedHistory.admin?.name || "-"}</dd></div>
            <div><dt className="text-xs uppercase tracking-[0.12em] text-slate-400">Selesai</dt><dd>{formatDateTime(selectedHistory.finishedAt)}</dd></div>
            <div><dt className="text-xs uppercase tracking-[0.12em] text-slate-400">Total baris</dt><dd>{selectedHistory.totalRows}</dd></div>
            <div><dt className="text-xs uppercase tracking-[0.12em] text-slate-400">Hash file</dt><dd className="truncate">{selectedHistory.fileHash}</dd></div>
          </dl>
          {selectedHistory.errorMessage ? (
            <div className="mt-3 rounded-lg border border-rose-100 bg-rose-50 p-3 text-xs font-semibold leading-5 text-rose-700">
              {selectedHistory.errorMessage}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export function PipelineHeroPanel({
  badge,
  title,
  description,
  insights,
}: {
  badge: string;
  title: string;
  description: string;
  insights: Array<{ label: string; value: string; helper: string; icon: ElementType; tone: Tone }>;
}) {
  return (
    <section className="rounded-lg border border-orange-100 bg-orange-50/70 p-6 shadow-sm shadow-orange-100/50">
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

function PipelineMetricCard({ icon: Icon, label, value, helper, tone }: { icon: ElementType; label: string; value: string; helper: string; tone: Tone }) {
  return (
    <article className={`rounded-lg border p-4 shadow-sm ${getToneClass(tone)}`}>
      <Icon className="mb-3 h-5 w-5" />
      <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold opacity-80">{helper}</p>
    </article>
  );
}
