"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { BarChart3, FileSpreadsheet, MessageSquareText } from "lucide-react";
import { toast } from "sonner";

import { adminDestinationService, type AdminDestination } from "@/features/admin";
import {
  adminNlpService,
  type NlpHistoryItem,
  type NlpPreflightResponse,
  type NlpProcessingMode,
  type NlpUploadResponse,
} from "../../services/nlp.service";
import {
  NlpCommandPanel,
  NlpHistoryPanel,
  PipelineHeroPanel,
  PipelineStepIndicator,
} from "./nlp-processing.panels";
import { NlpResultWorkspace } from "./nlp-processing.result";
import { formatFileSize, sentimentPercent, sentimentTotal } from "./nlp-processing.utils";

// Mengelola upload file review dan proses NLP manual dari admin.
export default function NlpProcessingClient() {
  const [destinations, setDestinations] = useState<AdminDestination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreflighting, setIsPreflighting] = useState(false);
  const [mode, setMode] = useState<NlpProcessingMode>("skip_existing");
  const [preflight, setPreflight] = useState<NlpPreflightResponse | null>(null);
  const [preflightError, setPreflightError] = useState("");
  const [history, setHistory] = useState<NlpHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [selectedHistory, setSelectedHistory] = useState<NlpHistoryItem | null>(null);
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

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      setHistoryError("");
      const res = await adminNlpService.getHistory({ page: 1, limit: 8 });
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      const maybeError = error as { response?: { data?: { message?: string } }; message?: string };
      setHistoryError(maybeError.response?.data?.message || maybeError.message || "Gagal memuat riwayat proses NLP");
      toast.error("Gagal memuat riwayat proses NLP");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchDestinations();
      void fetchHistory();
    });
  }, [fetchDestinations, fetchHistory]);

  useEffect(() => {
    if (!selectedDestination || !file) return;

    const timeout = window.setTimeout(() => {
      setIsPreflighting(true);
      setPreflightError("");
      adminNlpService
        .preflight(file, Number(selectedDestination))
        .then((res) => {
          setPreflight(res);
          setMode(res.recommended_mode || "skip_existing");
        })
        .catch((error) => {
          const maybeError = error as { response?: { data?: { message?: string } }; message?: string };
          setPreflightError(maybeError.response?.data?.message || maybeError.message || "Gagal mengecek file");
        })
        .finally(() => setIsPreflighting(false));
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [file, selectedDestination]);

  const selectedDestinationName = useMemo(
    () => destinations.find((destination) => String(destination.id) === selectedDestination)?.name || "",
    [destinations, selectedDestination],
  );

  const total = sentimentTotal(result);
  const positiveRatio = result ? sentimentPercent(result.nlp_summary.positive, total) : 0;
  const negativeRatio = result ? sentimentPercent(result.nlp_summary.negative, total) : 0;
  const pipelineReadiness = [Boolean(selectedDestination), Boolean(file), !isProcessing].filter(Boolean).length;

  const resetPreflightState = () => {
    setPreflight(null);
    setPreflightError("");
    setMode("skip_existing");
  };

  const handleDestinationChange = (value: string) => {
    resetPreflightState();
    setSelectedDestination(value);
  };

  const setValidatedFile = (nextFile: File) => {
    const ext = nextFile.name.toLowerCase();
    if (!ext.endsWith(".xlsx") && !ext.endsWith(".xls") && !ext.endsWith(".csv")) {
      toast.error("Hanya file Excel (.xlsx, .xls) atau CSV (.csv) yang diterima");
      return;
    }
    resetPreflightState();
    setFile(nextFile);
    setResult(null);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) setValidatedFile(selected);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) setValidatedFile(dropped);
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    resetPreflightState();
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
    if (!preflight) {
      toast.error("Tunggu pengecekan file selesai terlebih dahulu");
      return;
    }

    setIsProcessing(true);
    setResult(null);
    try {
      const res = await adminNlpService.uploadAndProcess(file, Number(selectedDestination), mode);
      setResult(res);
      toast.success(`Berhasil. ${res.total_reviews_processed} ulasan diproses, ${res.skipped_duplicates} duplikat dilewati.`);
      void fetchHistory();
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
          { label: "Rasio positif", value: result ? `${positiveRatio}%` : "-", helper: result ? "Hasil terakhir" : "Belum proses", icon: BarChart3, tone: result ? "emerald" : "slate" },
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
          onDestinationChange={handleDestinationChange}
          onFileChange={handleFileChange}
          onDrop={handleDrop}
          onRemoveFile={removeFile}
          onSubmit={handleSubmit}
          preflight={preflight}
          preflightError={preflightError}
          isPreflighting={isPreflighting}
          mode={mode}
          onModeChange={setMode}
        />

        <div className="space-y-6">
          <PipelineStepIndicator selectedDestination={Boolean(selectedDestination)} fileReady={Boolean(file)} isProcessing={isProcessing} hasResult={Boolean(result)} />
          <NlpResultWorkspace result={result} isProcessing={isProcessing} selectedDestinationId={selectedDestination} positiveRatio={positiveRatio} negativeRatio={negativeRatio} />
          <NlpHistoryPanel history={history} loading={historyLoading} error={historyError} selectedHistory={selectedHistory} onSelectHistory={setSelectedHistory} onRefresh={fetchHistory} />
        </div>
      </section>
    </div>
  );
}
