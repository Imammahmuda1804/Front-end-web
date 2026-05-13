import { api } from '@/lib/axios';

// ─── Place search result ──────────────────────────────────────────────────────

export interface PlaceResult {
  title?: string;
  address?: string;
  rating?: number;
  totalReviews?: number;
  placeId?: string;
  url?: string;
}

// ─── Start scraping ───────────────────────────────────────────────────────────

/** Fields available to the admin. Filters (sort / stars / hasText) are locked server-side. */
export interface StartScrapingRequest {
  destination_id: number;
  max_reviews?: number;
  /** Optional — overrides the Google Maps URL stored in the destination record. */
  maps_url?: string;
}

export interface StartScrapingResponse {
  job_id: number;
  status: string;
  destination_name: string;
  maps_url: string;
  message: string;
}

// ─── Job model ────────────────────────────────────────────────────────────────

export type JobStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'scraping'        // legacy — kept for backward compat
  | 'nlp_processing'; // legacy — kept for backward compat

export interface ScrapingJob {
  id: number;
  destinationId: number;
  status: JobStatus;
  /** Total reviews saved after scraping completes. */
  totalReviews?: number | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  errorMessage?: string | null;
  createdBy?: number | null;
  createdAt: string;
  destination?: {
    name: string;
    city: string;
    province?: string;
  };
}

// ─── Pagination wrapper ───────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

class AdminScraperService {
  private static instance: AdminScraperService;

  private constructor() {}

  public static getInstance(): AdminScraperService {
    if (!AdminScraperService.instance) {
      AdminScraperService.instance = new AdminScraperService();
    }
    return AdminScraperService.instance;
  }

  /** Search Google Maps by name or URL. */
  async searchMaps(query: string): Promise<PlaceResult[]> {
    const res = await api.get('/api/admin/scraper/search', { params: { q: query } });
    // Handle both wrapped { data: [...] } and raw array responses
    return res.data?.data ?? res.data ?? [];
  }

  /** Start a new scraping job. Filter params are locked server-side. */
  async startScraping(data: StartScrapingRequest): Promise<StartScrapingResponse> {
    const res = await api.post('/api/admin/scraper/start', data);
    return res.data?.data ?? res.data;
  }

  /** Poll the status of a specific job. */
  async getJobStatus(jobId: number): Promise<ScrapingJob> {
    const res = await api.get(`/api/admin/scraper/status/${jobId}`);
    return res.data?.data ?? res.data;
  }

  /** List all scraping jobs, paginated. */
  async getAllJobs(
    page = 1,
    limit = 20,
    status?: string,
  ): Promise<PaginatedResponse<ScrapingJob>> {
    const res = await api.get('/api/admin/scraper/jobs', {
      params: { page, limit, ...(status ? { status } : {}) },
    });
    return res.data?.data ?? res.data;
  }

  /** Get scraping history for a destination. */
  async getHistory(
    page = 1,
    limit = 10,
    destinationId?: number,
  ): Promise<PaginatedResponse<unknown>> {
    const res = await api.get('/api/admin/scraper/history', {
      params: { page, limit, ...(destinationId ? { destinationId } : {}) },
    });
    return res.data?.data ?? res.data;
  }

  /** Download a completed job's reviews as a CSV Blob. */
  async downloadCsv(jobId: number): Promise<Blob> {
    const res = await api.get(`/api/admin/scraper/download/${jobId}`, {
      responseType: 'blob',
    });
    return res.data;
  }

  /** Trigger NLP pipeline for a completed job. */
  async processNlp(jobId: number): Promise<{ message: string; job_id: number }> {
    const res = await api.post(`/api/admin/scraper/process/${jobId}`);
    return res.data?.data ?? res.data;
  }
}

export const adminScraperService = AdminScraperService.getInstance();
