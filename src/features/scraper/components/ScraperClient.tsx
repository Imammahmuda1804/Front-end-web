"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Database,
} from "lucide-react";
import { toast } from "sonner";

import { adminDestinationService, type AdminDestination } from "@/features/admin";
import {
  adminScraperService,
  type JobStatus,
  type PlaceResult,
  type ScraperOverview,
  type ScrapingHistoryItem,
  type ScrapingJob,
  type StartScrapingRequest,
} from "../services/scraper.service";
import { getScraperErrorMessage } from "./scraper-error.util";
import {
  JobMonitorTable,
  JobStatusDrawer,
  PipelineHealthStrip,
  PipelineHeroPanel,
  ReviewYieldChart,
  ScrapingHistoryPanel,
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
  const [fetchAllReviews, setFetchAllReviews] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [mapsSearchQuery, setMapsSearchQuery] = useState("");
  const [mapsSearchResults, setMapsSearchResults] = useState<PlaceResult[]>([]);
  const [isSearchingMaps, setIsSearchingMaps] = useState(false);
  const [scraperOverview, setScraperOverview] = useState<ScraperOverview | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);
  const [overviewError, setOverviewError] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeJobs, setActiveJobs] = useState<Set<number>>(new Set());
  const [selectedJobDetail, setSelectedJobDetail] = useState<ScrapingJob | null>(null);
  const [isLoadingJobDetail, setIsLoadingJobDetail] = useState(false);
  const [historyItems, setHistoryItems] = useState<ScrapingHistoryItem[]>([]);
  const [historyMeta, setHistoryMeta] = useState({ page: 1, limit: 10, total: 0, total_pages: 1 });
  const [historyDestinationId, setHistoryDestinationId] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const fetchDestinations = useCallback(async () => {
    try {
      setDestinationsError("");
      const res = await adminDestinationService.getDestinations({ page: 1, limit: 100 });
      setDestinations(Array.isArray(res.data) ? res.data : []);
    } catch {
      setDestinationsError("Gagal memuat daftar destinasi.");
    }
  }, []);

  const fetchHistory = useCallback(async (nextPage: number, destinationId: string) => {
    setHistoryLoading(true);
    try {
      setHistoryError("");
      const res = await adminScraperService.getHistory(
        nextPage,
        historyMeta.limit,
        destinationId ? Number(destinationId) : undefined,
      );
      setHistoryItems(Array.isArray(res.data) ? res.data : []);
      setHistoryMeta(res.meta || { page: nextPage, limit: historyMeta.limit, total: 0, total_pages: 1 });
    } catch {
      setHistoryError("Gagal memuat riwayat hasil scraping.");
    } finally {
      setHistoryLoading(false);
    }
  }, [historyMeta.limit]);

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

  const fetchScraperOverview = useCallback(async () => {
    if (!selectedDestination) {
      setScraperOverview(null);
      setOverviewError("");
      return;
    }

    setIsLoadingOverview(true);
    try {
      setOverviewError("");
      const overview = await adminScraperService.getOverview(
        Number(selectedDestination),
        mapsUrl.trim() || undefined,
      );
      setScraperOverview(overview);
    } catch (error) {
      setScraperOverview(null);
      setOverviewError(getScraperErrorMessage(error));
    } finally {
      setIsLoadingOverview(false);
    }
  }, [mapsUrl, selectedDestination]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchDestinations();
      void fetchJobs();
      void fetchHistory(1, "");
    });
  }, [fetchDestinations, fetchJobs, fetchHistory]);

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

  useEffect(() => {
    if (!selectedDestination) return;

    const timeoutId = setTimeout(() => {
      void fetchScraperOverview();
    }, 450);

    return () => clearTimeout(timeoutId);
  }, [fetchScraperOverview, selectedDestination]);

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
        fetch_all_reviews: fetchAllReviews,
        ...(fetchAllReviews ? {} : { max_reviews: maxReviews }),
        ...(mapsUrl.trim() ? { maps_url: mapsUrl.trim() } : {}),
      };
      const res = await adminScraperService.startScraping(payload);
      toast.success(`Job scraping dimulai untuk "${res.destination_name ?? "destinasi"}"`);
      setMapsUrl("");
      setMapsSearchQuery("");
      setMapsSearchResults([]);
      await fetchJobs();
      void fetchScraperOverview();
    } catch (error) {
      toast.error(getScraperErrorMessage(error));
    } finally {
      setIsStarting(false);
    }
  };

  const handleSearchMaps = async () => {
    const query = mapsSearchQuery.trim();
    if (!query) {
      toast.error("Masukkan kata kunci tempat Maps");
      return;
    }

    setIsSearchingMaps(true);
    try {
      const results = await adminScraperService.searchMaps(query);
      setMapsSearchResults(results);
      if (results.length === 0) toast.message("Tidak ada tempat yang cocok");
    } catch (error) {
      toast.error(getScraperErrorMessage(error));
    } finally {
      setIsSearchingMaps(false);
    }
  };

  const handleDestinationChange = (value: string) => {
    setSelectedDestination(value);
    setScraperOverview(null);
    setOverviewError("");
  };

  const handleOpenJobDetail = async (jobId: number) => {
    setIsLoadingJobDetail(true);
    try {
      const job = await adminScraperService.getJobStatus(jobId);
      setSelectedJobDetail(job);
    } catch {
      toast.error("Gagal memuat detail job");
    } finally {
      setIsLoadingJobDetail(false);
    }
  };

  const handleHistoryDestinationChange = (value: string) => {
    setHistoryDestinationId(value);
    setHistoryMeta((current) => ({ ...current, page: 1 }));
    void fetchHistory(1, value);
  };

  const handleRefreshJobs = async () => {
    setIsRefreshing(true);
    await fetchJobs();
    setIsRefreshing(false);
  };

  const handleDownloadExcel = async (jobId: number) => {
    try {
      const { blob, filename } = await adminScraperService.downloadResults(jobId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
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
          { label: "Job aktif", value: String(metrics.active), helper: metrics.active > 0 ? "Pantau job" : "Tidak ada antrean", icon: Activity, tone: metrics.active > 0 ? "amber" : "emerald" },
          { label: "Success rate", value: `${metrics.successRate}%`, helper: `${metrics.completed}/${jobs.length} selesai`, icon: CheckCircle2, tone: "emerald" },
          { label: "Review terkumpul", value: metrics.totalReviews.toLocaleString("id-ID"), helper: "Siap NLP", icon: Database, tone: "blue" },
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(22rem,0.8fr)_minmax(0,1.25fr)]">
        <ScraperCommandPanel
          destinations={destinations}
          destinationsError={destinationsError}
          selectedDestination={selectedDestination}
          mapsUrl={mapsUrl}
          maxReviews={maxReviews}
          fetchAllReviews={fetchAllReviews}
          mapsSearchQuery={mapsSearchQuery}
          mapsSearchResults={mapsSearchResults}
          isSearchingMaps={isSearchingMaps}
          scraperOverview={scraperOverview}
          isLoadingOverview={isLoadingOverview}
          overviewError={overviewError}
          isStarting={isStarting}
          onDestinationChange={handleDestinationChange}
          onMapsUrlChange={setMapsUrl}
          onMaxReviewsChange={setMaxReviews}
          onFetchAllReviewsChange={setFetchAllReviews}
          onMapsSearchQueryChange={setMapsSearchQuery}
          onSearchMaps={handleSearchMaps}
          onRefreshOverview={fetchScraperOverview}
          onSelectMapsResult={(place) => {
            if (place.url) setMapsUrl(place.url);
            if (place.title) setMapsSearchQuery(place.title);
            setMapsSearchResults([]);
          }}
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
        onOpenDetail={handleOpenJobDetail}
      />

      <ScrapingHistoryPanel
        histories={historyItems}
        destinations={destinations}
        selectedDestination={historyDestinationId}
        meta={historyMeta}
        loading={historyLoading}
        error={historyError}
        onDestinationChange={handleHistoryDestinationChange}
        onPageChange={(nextPage) => {
          setHistoryMeta((current) => ({ ...current, page: nextPage }));
          void fetchHistory(nextPage, historyDestinationId);
        }}
        onRefresh={() => fetchHistory(historyMeta.page, historyDestinationId)}
      />

      <JobStatusDrawer
        job={selectedJobDetail}
        loading={isLoadingJobDetail}
        onClose={() => setSelectedJobDetail(null)}
        onRefresh={selectedJobDetail ? () => handleOpenJobDetail(selectedJobDetail.id) : undefined}
      />
    </div>
  );
}



