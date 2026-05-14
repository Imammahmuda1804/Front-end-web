"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  adminScraperService,
  type ScrapingJob,
  type StartScrapingRequest,
} from "@/services/admin/scraper.service";
import { adminDestinationService } from "@/services/admin/destination.service";
import { toast } from "sonner";
import {
  MapPin,
  LinkIcon,
  Play,
  Download,
  RefreshCw,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  Lock,
  CalendarClock,
  Star,
  AlignLeft,
  ChevronRight,
  Zap,
  BrainCircuit,
} from "lucide-react";

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<
    string,
    { label: string; icon: React.ReactNode; cls: string }
  > = {
    completed: {
      label: "Selesai",
      icon: <CheckCircle2 className="w-3 h-3" />,
      cls: "bg-emerald-50 text-emerald-700 ring-emerald-500/20",
    },
    pending: {
      label: "Menunggu",
      icon: <Clock className="w-3 h-3" />,
      cls: "bg-amber-50 text-amber-700 ring-amber-500/20",
    },
    running: {
      label: "Berjalan",
      icon: <RefreshCw className="w-3 h-3 animate-spin" />,
      cls: "bg-blue-50 text-blue-700 ring-blue-500/20",
    },
    scraping: {
      label: "Scraping",
      icon: <RefreshCw className="w-3 h-3 animate-spin" />,
      cls: "bg-blue-50 text-blue-700 ring-blue-500/20",
    },
    nlp_processing: {
      label: "NLP",
      icon: <BrainCircuit className="w-3 h-3 animate-pulse" />,
      cls: "bg-violet-50 text-violet-700 ring-violet-500/20",
    },
    failed: {
      label: "Gagal",
      icon: <XCircle className="w-3 h-3" />,
      cls: "bg-rose-50 text-rose-700 ring-rose-500/20",
    },
  };

  const { label, icon, cls } = cfg[status] ?? {
    label: status,
    icon: null,
    cls: "bg-slate-50 text-slate-600 ring-slate-500/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${cls}`}
    >
      {icon}
      {label}
    </span>
  );
}

// ─── Locked filter pill ───────────────────────────────────────────────────────

function FilterPill({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FFF4EE] text-[#CC3C00] ring-1 ring-inset ring-[#FF7B54]/20">
      {icon}
      {label}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ScraperClient() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state — simplified (no sort / stars / hasText)
  const [selectedDestination, setSelectedDestination] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [maxReviews, setMaxReviews] = useState<number>(100);
  const [isStarting, setIsStarting] = useState(false);

  // Polling
  const [activeJobs, setActiveJobs] = useState<Set<number>>(new Set());

  // ── Data fetchers ──────────────────────────────────────────────────────────

  const fetchDestinations = useCallback(async () => {
    try {
      const res = await adminDestinationService.getDestinations({
        page: 1,
        limit: 100,
      });
      const data = res.data?.data || res.data || res || [];
      setDestinations(Array.isArray(data) ? data : []);
    } catch {
      // silent — destinations is non-critical to page load
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await adminScraperService.getAllJobs(1, 50);
      const arr: ScrapingJob[] = Array.isArray(res)
        ? res
        : Array.isArray((res as any)?.data)
          ? (res as any).data
          : [];

      setJobs(arr);

      const active = new Set<number>();
      arr.forEach((j) => {
        if (["pending", "running", "scraping", "nlp_processing"].includes(j.status)) {
          active.add(j.id);
        }
      });
      setActiveJobs(active);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
    fetchJobs();
  }, [fetchDestinations, fetchJobs]);

  // Polling every 5 s while jobs are active
  useEffect(() => {
    if (activeJobs.size === 0) return;
    const id = setInterval(fetchJobs, 5000);
    return () => clearInterval(id);
  }, [activeJobs.size, fetchJobs]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleStartScraping = async () => {
    if (!selectedDestination) {
      toast.error("Silakan pilih destinasi terlebih dahulu");
      return;
    }

    setIsStarting(true);
    try {
      const payload: StartScrapingRequest = {
        destination_id: parseInt(selectedDestination, 10),
        max_reviews: maxReviews,
        ...(mapsUrl.trim() ? { maps_url: mapsUrl.trim() } : {}),
      };

      const res = await adminScraperService.startScraping(payload);
      toast.success(
        `Job scraping dimulai untuk "${res.destination_name ?? "destinasi"}"`
      );
      setMapsUrl("");
      fetchJobs();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Gagal memulai scraping job"
      );
    } finally {
      setIsStarting(false);
    }
  };

  const handleDownloadExcel = async (jobId: number) => {
    try {
      const blob = await adminScraperService.downloadResults(jobId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ulasan_job_${jobId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("File Excel berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh file Excel");
    }
  };



  // ── Helpers ────────────────────────────────────────────────────────────────

  const formatDate = (iso?: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* ── LEFT: Control Panel ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        <Card className="border-slate-200 shadow-sm shadow-slate-100">
          {/* Header */}
          <CardHeader className="pb-4 border-b border-slate-100 bg-gradient-to-br from-[#FFF9F6] to-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF7B54]/10 flex items-center justify-center shrink-0">
                <Zap className="w-4.5 h-4.5 text-[#FF7B54]" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Scraping Job Baru
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Konfigurasi &amp; mulai pengambilan ulasan
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-5">
            {/* Destination picker */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF7B54]" />
                Destinasi
                <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={selectedDestination}
                onValueChange={(v) => setSelectedDestination(v || "")}
              >
                <SelectTrigger className="bg-slate-50 border-slate-200 focus:border-[#FF7B54] focus:ring-[#FF7B54]/20 rounded-xl h-11">
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

            {/* Maps URL override */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[#2D82B5]" />
                URL Google Maps
                <span className="ml-1 text-[10px] font-normal text-slate-400 normal-case tracking-normal">
                  opsional
                </span>
              </Label>
              <Input
                placeholder="https://maps.google.com/…"
                value={mapsUrl}
                onChange={(e) => setMapsUrl(e.target.value)}
                className="bg-slate-50 border-slate-200 focus-visible:border-[#2D82B5] focus-visible:ring-[#2D82B5]/20 rounded-xl h-11 font-mono text-xs placeholder:font-sans placeholder:text-xs"
              />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Kosongkan untuk memakai URL yang tersimpan di data destinasi.
              </p>
            </div>

            {/* Max reviews */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Batas Ulasan
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={maxReviews}
                  onChange={(e) =>
                    setMaxReviews(Math.max(1, parseInt(e.target.value) || 100))
                  }
                  className="w-28 bg-slate-50 border-slate-200 focus-visible:border-[#FF7B54] focus-visible:ring-[#FF7B54]/20 rounded-xl h-11 text-center font-semibold"
                  min={1}
                  max={5000}
                />
                <span className="text-sm text-slate-500">
                  ulasan maksimal yang diambil
                </span>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* Locked filters info */}
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Filter Aktif (Dikunci)
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterPill
                  icon={<CalendarClock className="w-3 h-3" />}
                  label="Terbaru"
                />
                <FilterPill
                  icon={<Star className="w-3 h-3" />}
                  label="Semua Bintang"
                />
                <FilterPill
                  icon={<AlignLeft className="w-3 h-3" />}
                  label="Hanya Berteks"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Filter ditetapkan otomatis oleh sistem untuk menjaga
                konsistensi data analitik.
              </p>
            </div>

            {/* CTA */}
            <Button
              className="w-full h-11 rounded-xl bg-[#FF7B54] hover:bg-[#f06a42] text-white font-bold shadow-sm hover:shadow-md hover:shadow-[#FF7B54]/25 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
              onClick={handleStartScraping}
              disabled={isStarting}
            >
              {isStarting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2 fill-white" />
              )}
              {isStarting ? "Memulai…" : "Mulai Scraping Job"}
              {!isStarting && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── RIGHT: Monitor Panel ────────────────────────────────────────────── */}
      <Card className="border-slate-200 shadow-sm shadow-slate-100 flex flex-col overflow-hidden">
        <CardHeader className="pb-4 border-b border-slate-100 bg-gradient-to-br from-slate-50/60 to-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2D82B5]/10 flex items-center justify-center shrink-0">
                <Activity className="w-4.5 h-4.5 text-[#2D82B5]" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Monitor Job
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Riwayat &amp; status scraping
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeJobs.size > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full ring-1 ring-amber-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {activeJobs.size} aktif
                </span>
              )}
              <button
                onClick={fetchJobs}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="w-16 font-mono text-[10px] font-semibold text-slate-400 uppercase pl-5">
                  ID
                </TableHead>
                <TableHead className="text-[10px] font-semibold text-slate-400 uppercase">
                  Destinasi
                </TableHead>
                <TableHead className="w-32 text-[10px] font-semibold text-slate-400 uppercase">
                  Status
                </TableHead>
                <TableHead className="w-28 text-[10px] font-semibold text-slate-400 uppercase">
                  Ulasan
                </TableHead>
                <TableHead className="w-36 text-[10px] font-semibold text-slate-400 uppercase">
                  Dimulai
                </TableHead>
                <TableHead className="w-24 text-right text-[10px] font-semibold text-slate-400 uppercase pr-5">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span className="text-sm">Memuat data job…</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Database className="w-6 h-6 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-500">
                          Belum ada scraping job
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Mulai job baru dari panel kiri
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow
                    key={job.id}
                    className="group hover:bg-slate-50/70 transition-colors border-b border-slate-50"
                  >
                    {/* ID */}
                    <TableCell className="font-mono text-xs text-slate-400 pl-5">
                      #{job.id}
                    </TableCell>

                    {/* Destination */}
                    <TableCell>
                      <p className="text-sm font-semibold text-slate-800 leading-tight">
                        {job.destination?.name ?? "—"}
                      </p>
                      {job.destination?.city && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {job.destination.city}
                        </p>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={job.status} />
                    </TableCell>

                    {/* Reviews count */}
                    <TableCell>
                      {job.status === "completed" && job.totalReviews ? (
                        <span className="text-sm font-bold text-[#FF7B54]">
                          {job.totalReviews.toLocaleString("id-ID")}
                        </span>
                      ) : job.status === "failed" ? (
                        <span className="text-xs text-rose-400 truncate max-w-[120px] block" title={job.errorMessage ?? ""}>
                          {job.errorMessage
                            ? job.errorMessage.slice(0, 30) + (job.errorMessage.length > 30 ? "…" : "")
                            : "Error"}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(job.startedAt ?? job.createdAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right pr-5">
                      {job.status === "completed" && (
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDownloadExcel(job.id)}
                            title="Unduh File Excel"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
