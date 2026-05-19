"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  AlignLeft,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  Download,
  FileSpreadsheet,
  LinkIcon,
  Lock,
  MapPin,
  Play,
  RefreshCw,
  Star,
  TimerReset,
  XCircle,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { adminDestinationService, type AdminDestination } from "@/services/admin/destination.service";
import {
  adminScraperService,
  type JobStatus,
  type ScrapingJob,
  type StartScrapingRequest,
} from "@/services/admin/scraper.service";

type StatusFilter = "all" | "active" | "completed" | "failed";
type Tone = "orange" | "blue" | "emerald" | "amber" | "rose" | "slate";

const STATUS_META: Record<string, { label: string; color: string; tone: Tone }> = {
  completed: { label: "Selesai", color: "#10b981", tone: "emerald" },
  pending: { label: "Menunggu", color: "#f59e0b", tone: "amber" },
  running: { label: "Berjalan", color: "#2D82B5", tone: "blue" },
  scraping: { label: "Scraping", color: "#2D82B5", tone: "blue" },
  nlp_processing: { label: "NLP", color: "#FF7B54", tone: "orange" },
  failed: { label: "Gagal", color: "#f43f5e", tone: "rose" },
};

const ACTIVE_STATUSES = ["pending", "running", "scraping", "nlp_processing"];

function isActiveStatus(status: string) {
  return ACTIVE_STATUSES.includes(status);
}

function formatDate(iso?: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDurationMinutes(job: ScrapingJob) {
  if (!job.startedAt || !job.finishedAt) return null;
  const diff = new Date(job.finishedAt).getTime() - new Date(job.startedAt).getTime();
  if (!Number.isFinite(diff) || diff < 0) return null;
  return Math.max(1, Math.round(diff / 60000));
}

export default function ScraperClient() {
  const [destinations, setDestinations] = useState<AdminDestination[]>([]);
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [destinationsError, setDestinationsError] = useState("");
  const [jobsError, setJobsError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [maxReviews, setMaxReviews] = useState(100);
  const [isStarting, setIsStarting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeJobs, setActiveJobs] = useState<Set<number>>(new Set());

  const fetchDestinations = useCallback(async () => {
    try {
      setDestinationsError("");
      const res = await adminDestinationService.getDestinations({ page: 1, limit: 100 });
      setDestinations(Array.isArray(res.data) ? res.data : []);
    } catch {
      setDestinationsError("Gagal memuat daftar destinasi.");
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      setJobsError("");
      const res = await adminScraperService.getAllJobs(1, 80);
      const list = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
      setJobs(list);
      setActiveJobs(new Set(list.filter((job) => isActiveStatus(job.status)).map((job) => job.id)));
    } catch {
      setJobsError("Gagal memuat riwayat job scraping.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchDestinations();
      void fetchJobs();
    });
  }, [fetchDestinations, fetchJobs]);

  useEffect(() => {
    if (activeJobs.size === 0) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    let currentDelay = 5000;
    const poll = async () => {
      await fetchJobs();
      currentDelay = Math.min(currentDelay * 1.5, 30000);
      timeoutId = setTimeout(poll, currentDelay);
    };
    timeoutId = setTimeout(poll, currentDelay);
    return () => clearTimeout(timeoutId);
  }, [activeJobs.size, fetchJobs]);

  const metrics = useMemo(() => {
    const completed = jobs.filter((job) => job.status === "completed").length;
    const failed = jobs.filter((job) => job.status === "failed").length;
    const active = jobs.filter((job) => isActiveStatus(job.status)).length;
    const totalReviews = jobs.reduce((sum, job) => sum + (job.totalReviews || 0), 0);
    const successRate = jobs.length > 0 ? Math.round((completed / jobs.length) * 100) : 0;
    return { completed, failed, active, totalReviews, successRate };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    if (statusFilter === "all") return jobs;
    if (statusFilter === "active") return jobs.filter((job) => isActiveStatus(job.status));
    return jobs.filter((job) => job.status === statusFilter);
  }, [jobs, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const statusChartData = useMemo(() => {
    const counts = new Map<JobStatus, number>();
    jobs.forEach((job) => counts.set(job.status, (counts.get(job.status) || 0) + 1));
    return Array.from(counts.entries()).map(([status, value]) => ({
      status,
      name: STATUS_META[status]?.label || status,
      value,
      color: STATUS_META[status]?.color || "#94a3b8",
    }));
  }, [jobs]);

  const yieldChartData = useMemo(
    () => jobs
      .filter((job) => (job.totalReviews || 0) > 0)
      .sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0))
      .slice(0, 8)
      .map((job) => ({
        name: job.destination?.name ? job.destination.name.slice(0, 18) : `Job #${job.id}`,
        reviews: job.totalReviews || 0,
      })),
    [jobs],
  );

  const handleStartScraping = async () => {
    if (!selectedDestination) {
      toast.error("Silakan pilih destinasi terlebih dahulu");
      return;
    }

    setIsStarting(true);
    try {
      const payload: StartScrapingRequest = {
        destination_id: Number(selectedDestination),
        max_reviews: maxReviews,
        ...(mapsUrl.trim() ? { maps_url: mapsUrl.trim() } : {}),
      };
      const res = await adminScraperService.startScraping(payload);
      toast.success(`Job scraping dimulai untuk "${res.destination_name ?? "destinasi"}"`);
      setMapsUrl("");
      await fetchJobs();
    } catch (error) {
      const maybeError = error as { response?: { data?: { message?: string } } };
      toast.error(maybeError.response?.data?.message || "Gagal memulai scraping job");
    } finally {
      setIsStarting(false);
    }
  };

  const handleRefreshJobs = async () => {
    setIsRefreshing(true);
    await fetchJobs();
    setIsRefreshing(false);
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

  return (
    <div className="space-y-6">
      <PipelineHeroPanel
        badge="Pipeline Operations"
        title="Scraper Operations"
        description="Mulai pengambilan ulasan Google Maps, pantau status job, dan unduh file Excel untuk pipeline NLP."
        insights={[
          { label: "Job aktif", value: String(metrics.active), helper: "Pending, running, scraping, NLP", icon: Activity, tone: metrics.active > 0 ? "amber" : "emerald" },
          { label: "Success rate", value: `${metrics.successRate}%`, helper: `${metrics.completed} selesai dari ${jobs.length} job`, icon: CheckCircle2, tone: "emerald" },
          { label: "Review terkumpul", value: metrics.totalReviews.toLocaleString("id-ID"), helper: "Dari job selesai", icon: Database, tone: "blue" },
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(22rem,0.8fr)_minmax(0,1.25fr)]">
        <ScraperCommandPanel
          destinations={destinations}
          destinationsError={destinationsError}
          selectedDestination={selectedDestination}
          mapsUrl={mapsUrl}
          maxReviews={maxReviews}
          isStarting={isStarting}
          onDestinationChange={setSelectedDestination}
          onMapsUrlChange={setMapsUrl}
          onMaxReviewsChange={setMaxReviews}
          onStart={handleStartScraping}
        />

        <div className="space-y-6">
          <PipelineHealthStrip metrics={metrics} />
          <div className="grid gap-6 lg:grid-cols-2">
            <StatusDistributionChart data={statusChartData} />
            <ReviewYieldChart data={yieldChartData} />
          </div>
        </div>
      </section>

      <JobMonitorTable
        jobs={paginatedJobs}
        totalJobs={jobs.length}
        filteredCount={filteredJobs.length}
        page={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        loading={loading}
        jobsError={jobsError}
        statusFilter={statusFilter}
        isRefreshing={isRefreshing}
        onRefresh={handleRefreshJobs}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
        onPageChange={setPage}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
        onDownload={handleDownloadExcel}
      />
    </div>
  );
}

function ScraperCommandPanel({
  destinations,
  destinationsError,
  selectedDestination,
  mapsUrl,
  maxReviews,
  isStarting,
  onDestinationChange,
  onMapsUrlChange,
  onMaxReviewsChange,
  onStart,
}: {
  destinations: AdminDestination[];
  destinationsError: string;
  selectedDestination: string;
  mapsUrl: string;
  maxReviews: number;
  isStarting: boolean;
  onDestinationChange: (value: string) => void;
  onMapsUrlChange: (value: string) => void;
  onMaxReviewsChange: (value: number) => void;
  onStart: () => void;
}) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-primary">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Scraper command</p>
          <h2 className="text-xl font-black text-slate-950">Scraping Job Baru</h2>
        </div>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-600">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Destinasi
          </span>
          <NativeSelect
            aria-label="Pilih destinasi untuk scraping"
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

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-600">
            <LinkIcon className="h-3.5 w-3.5 text-[#2D82B5]" />
            URL Google Maps
          </span>
          <Input
            value={mapsUrl}
            onChange={(event) => onMapsUrlChange(event.target.value)}
            placeholder="https://maps.google.com/..."
            className="min-h-12 rounded-2xl border-slate-200 bg-slate-50 font-mono text-xs"
          />
          <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">Opsional. Kosongkan untuk memakai URL yang tersimpan pada data destinasi.</p>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-600">Batas ulasan</span>
          <Input
            type="number"
            min={1}
            max={5000}
            value={maxReviews}
            onChange={(event) => onMaxReviewsChange(Math.max(1, Number(event.target.value) || 100))}
            className="min-h-12 rounded-2xl border-slate-200 bg-slate-50 font-black"
          />
        </label>

        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
            <Lock className="h-3.5 w-3.5" />
            Filter dikunci
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterPill icon={<CalendarClock className="h-3 w-3" />} label="Terbaru" />
            <FilterPill icon={<Star className="h-3 w-3" />} label="Semua bintang" />
            <FilterPill icon={<AlignLeft className="h-3 w-3" />} label="Hanya berteks" />
          </div>
        </div>

        <Button
          className="min-h-12 w-full rounded-full bg-primary px-5 font-black text-white shadow-sm shadow-orange-200 hover:bg-primary/90"
          onClick={onStart}
          disabled={isStarting}
        >
          {isStarting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
          {isStarting ? "Memulai..." : "Mulai Scraping"}
          {!isStarting && <ChevronRight className="ml-auto h-4 w-4 opacity-70" />}
        </Button>
      </div>
    </section>
  );
}

function PipelineHealthStrip({ metrics }: { metrics: { completed: number; failed: number; active: number; totalReviews: number; successRate: number } }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <PipelineMetricCard label="Selesai" value={String(metrics.completed)} helper={`${metrics.successRate}% success rate`} icon={CheckCircle2} tone="emerald" />
      <PipelineMetricCard label="Aktif" value={String(metrics.active)} helper="Polling otomatis berjalan" icon={TimerReset} tone={metrics.active > 0 ? "amber" : "slate"} />
      <PipelineMetricCard label="Gagal" value={String(metrics.failed)} helper="Butuh cek error" icon={AlertTriangle} tone={metrics.failed > 0 ? "rose" : "slate"} />
      <PipelineMetricCard label="Reviews" value={metrics.totalReviews.toLocaleString("id-ID")} helper="Total hasil job selesai" icon={FileSpreadsheet} tone="blue" />
    </section>
  );
}

function StatusDistributionChart({ data }: { data: Array<{ status: string; name: string; value: number; color: string }> }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <ChartShell title="Scraping Status Donut" description="Distribusi status job untuk membaca kesehatan pipeline." icon={Activity}>
      {data.length === 0 ? (
        <ChartEmpty label="Belum ada job scraping." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-center">
          <div className="relative h-56">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={58} outerRadius={86} paddingAngle={3} stroke="none">
                  {data.map((entry) => <Cell key={entry.status} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Total</span>
              <span className="text-3xl font-black text-slate-950">{total}</span>
            </div>
          </div>
          <div className="space-y-2">
            {data.map((item) => (
              <div key={item.status} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                <span className="flex items-center gap-2 text-sm font-black text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="text-sm font-black text-slate-950">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartShell>
  );
}

function ReviewYieldChart({ data }: { data: Array<{ name: string; reviews: number }> }) {
  return (
    <ChartShell title="Review Yield Bar" description="Job dengan hasil review terbesar sebagai acuan throughput scraping." icon={BarChart3}>
      {data.length === 0 ? (
        <ChartEmpty label="Belum ada job selesai dengan review." />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={110} axisLine={false} tickLine={false} tick={{ fill: "#334155", fontSize: 11, fontWeight: 800 }} />
              <Tooltip contentStyle={{ borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
              <Bar dataKey="reviews" name="Review" fill="#FF7B54" radius={[0, 10, 10, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartShell>
  );
}

function JobMonitorTable({
  jobs,
  totalJobs,
  filteredCount,
  page,
  pageSize,
  totalPages,
  loading,
  jobsError,
  statusFilter,
  isRefreshing,
  onRefresh,
  onStatusFilterChange,
  onPageChange,
  onPageSizeChange,
  onDownload,
}: {
  jobs: ScrapingJob[];
  totalJobs: number;
  filteredCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  jobsError: string;
  statusFilter: StatusFilter;
  isRefreshing: boolean;
  onRefresh: () => void;
  onStatusFilterChange: (value: StatusFilter) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onDownload: (jobId: number) => void;
}) {
  const filters: Array<{ value: StatusFilter; label: string }> = [
    { value: "all", label: "Semua" },
    { value: "active", label: "Aktif" },
    { value: "completed", label: "Selesai" },
    { value: "failed", label: "Gagal" },
  ];
  const start = filteredCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, filteredCount);

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Job monitor</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Riwayat & Status Scraping</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">Menampilkan {start}-{end} dari {filteredCount} hasil, total {totalJobs} job</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => onStatusFilterChange(filter.value)}
                className={`min-h-10 rounded-full border px-4 text-sm font-black transition ${
                  statusFilter === filter.value
                    ? "border-primary bg-orange-50 text-primary"
                    : "border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onRefresh}
            aria-label="Refresh job scraping"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {jobsError && <div className="m-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">{jobsError}</div>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Destinasi</th>
              <th className="p-4">Status</th>
              <th className="p-4">Ulasan</th>
              <th className="p-4">Durasi</th>
              <th className="p-4">Dimulai</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={7} className="p-3">
                    <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
                  </td>
                </tr>
              ))
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="h-52 text-center">
                  <Database className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                  <p className="font-black text-slate-700">Belum ada job yang cocok</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Mulai job baru atau ubah filter status.</p>
                </td>
              </tr>
            ) : (
              jobs.map((job) => {
                const duration = getDurationMinutes(job);
                return (
                  <tr key={job.id} className="hover:bg-slate-50/70">
                    <td className="p-4 font-mono text-xs font-bold text-slate-400">#{job.id}</td>
                    <td className="p-4">
                      <p className="font-black text-slate-900">{job.destination?.name || "-"}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">{job.destination?.city || "-"}</p>
                    </td>
                    <td className="p-4"><StatusBadge status={job.status} /></td>
                    <td className="p-4 font-black text-slate-800">{job.totalReviews ? job.totalReviews.toLocaleString("id-ID") : "-"}</td>
                    <td className="p-4 text-sm font-bold text-slate-600">{duration ? `${duration} menit` : "-"}</td>
                    <td className="p-4 text-sm font-bold text-slate-500">{formatDate(job.startedAt || job.createdAt)}</td>
                    <td className="p-4 text-right">
                      {job.status === "completed" ? (
                        <button
                          type="button"
                          onClick={() => onDownload(job.id)}
                          aria-label={`Unduh hasil scraping job ${job.id}`}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <Download className="h-4 w-4" />
                          Unduh
                        </button>
                      ) : job.status === "failed" ? (
                        <span className="line-clamp-1 text-xs font-bold text-rose-500" title={job.errorMessage || "Error"}>{job.errorMessage || "Error"}</span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">Menunggu</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <PaginationFooter page={page} pageSize={pageSize} totalPages={totalPages} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] || { label: status, color: "#94a3b8", tone: "slate" as Tone };
  const Icon = status === "completed" ? CheckCircle2 : status === "failed" ? XCircle : isActiveStatus(status) ? RefreshCw : Clock;
  const toneClass = getToneClass(meta.tone);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${toneClass}`}>
      <Icon className={`h-3.5 w-3.5 ${isActiveStatus(status) ? "animate-spin" : ""}`} />
      {meta.label}
    </span>
  );
}

function FilterPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-black text-primary">{icon}{label}</span>;
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
            <Zap className="h-3.5 w-3.5" />
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

function ChartShell({ title, description, icon: Icon, children }: { title: string; description: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-black text-slate-950">{title}</h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      <p className="sr-only">{title} adalah visualisasi status pipeline scraping untuk admin.</p>
      {children}
    </section>
  );
}

function ChartEmpty({ label }: { label: string }) {
  return <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-200 text-sm font-bold text-slate-400">{label}</div>;
}

function PaginationFooter({ page, pageSize, totalPages, onPageChange, onPageSizeChange }: { page: number; pageSize: number; totalPages: number; onPageChange: (page: number) => void; onPageSizeChange: (pageSize: number) => void }) {
  return (
    <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/70 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm font-black text-slate-700">Baris</span>
        <NativeSelect
          aria-label="Pilih jumlah baris job scraper"
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
          options={[
            { value: "10", label: "10 baris" },
            { value: "20", label: "20 baris" },
            { value: "50", label: "50 baris" },
          ]}
          wrapperClassName="w-36"
          className="min-h-10 bg-white"
        />
        <span className="text-sm font-bold text-slate-500">Halaman {page} dari {totalPages}</span>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1} className="min-h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 disabled:opacity-40">Sebelumnya</button>
        <button type="button" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="min-h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 disabled:opacity-40">Berikutnya</button>
      </div>
    </div>
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
