"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Database,
} from "lucide-react";
import { toast } from "sonner";

import { adminDestinationService, type AdminDestination } from "@/services/admin/destination.service";
import {
  adminScraperService,
  type JobStatus,
  type ScrapingJob,
  type StartScrapingRequest,
} from "@/services/admin/scraper.service";
import {
  JobMonitorTable,
  PipelineHealthStrip,
  PipelineHeroPanel,
  ReviewYieldChart,
  ScraperCommandPanel,
  StatusDistributionChart,
} from "./scraper-components";

export type StatusFilter = "all" | "active" | "completed" | "failed";
export type Tone = "orange" | "blue" | "emerald" | "amber" | "rose" | "slate";

export const STATUS_META: Record<string, { label: string; color: string; tone: Tone }> = {
  completed: { label: "Selesai", color: "#10b981", tone: "emerald" },
  pending: { label: "Menunggu", color: "#f59e0b", tone: "amber" },
  running: { label: "Berjalan", color: "var(--ai)", tone: "blue" },
  scraping: { label: "Scraping", color: "var(--ai)", tone: "blue" },
  nlp_processing: { label: "NLP", color: "var(--explore)", tone: "orange" },
  failed: { label: "Gagal", color: "#f43f5e", tone: "rose" },
};

const ACTIVE_STATUSES = ["pending", "running", "scraping", "nlp_processing"];

export function isActiveStatus(status: string) {
  return ACTIVE_STATUSES.includes(status);
}

export function formatDate(iso?: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getDurationMinutes(job: ScrapingJob) {
  if (!job.startedAt || !job.finishedAt) return null;
  const diff = new Date(job.finishedAt).getTime() - new Date(job.startedAt).getTime();
  if (!Number.isFinite(diff) || diff < 0) return null;
  return Math.max(1, Math.round(diff / 60000));
}

// Mengelola job scraping, polling status, chart, dan download hasil.
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


