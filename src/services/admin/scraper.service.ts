import { api } from '@/lib/axios';

export interface PlaceResult {
  title?: string;
  address?: string;
  rating?: number;
  totalReviews?: number;
  placeId?: string;
  url?: string;
}

// Field yang bisa diatur admin.
export interface StartScrapingRequest {
  destination_id: number;
  max_reviews?: number;
  fetch_all_reviews?: boolean;
  // URL Maps opsional dari form.
  maps_url?: string;
}

export interface StartScrapingResponse {
  job_id: number;
  status: string;
  destination_name: string;
  maps_url: string;
  message: string;
}

export type JobStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'scraping'        // Status lama untuk kompatibilitas.
  | 'nlp_processing'; // Status lama untuk kompatibilitas.

export interface ScrapingJob {
  id: number;
  destinationId: number;
  status: JobStatus;
  // Total review hasil scraping.
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

export interface ScrapingHistoryItem {
  id: number;
  destinationId: number;
  jobId: number;
  totalReviews?: number | null;
  reviewsCount?: number | null;
  filePath?: string | null;
  fileName?: string | null;
  hasText?: boolean | null;
  sort?: string | null;
  createdAt: string;
  destination?: {
    name: string;
  };
  job?: ScrapingJob | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface DownloadResult {
  blob: Blob;
  filename: string;
}

export interface ScraperOverview {
  destination_id: number;
  destination_name: string;
  maps_url: string;
  live_google: {
    title: string | null;
    address: string | null;
    rating: number | null;
    total_reviews: number | null;
    place_id: string | null;
    fetched_at: string;
  };
  cached_destination: {
    google_rating: number | null;
    google_review_count: number | null;
  };
  database: {
    stored_text_reviews: number;
    processed_reviews: number;
    latest_nlp_run: {
      id: number;
      fileName: string;
      mode: string;
      status: string;
      totalRows: number;
      insertedReviews: number;
      skippedDuplicates: number;
      processedReviews: number;
      startedAt: string;
      finishedAt?: string | null;
    } | null;
    latest_scraping_job: {
      id: number;
      status: string;
      totalReviews?: number | null;
      startedAt?: string | null;
      finishedAt?: string | null;
      createdAt: string;
    } | null;
  };
  coverage: {
    stored_text_reviews_percent: number | null;
    processed_reviews_percent: number | null;
  };
  text_filter_note: string;
}

function parseDownloadFileName(contentDisposition?: string) {
  if (!contentDisposition) return null;

  const encodedMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (encodedMatch?.[1]) return decodeURIComponent(encodedMatch[1]);

  const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return plainMatch?.[1] ?? null;
}

function fallbackDownloadFileName(jobId: number) {
  const date = new Date().toISOString().slice(0, 10);
  return `RanahInsight_Scrape_Job_${jobId}_${date}.xlsx`;
}

// Service API untuk pencarian Maps, job scraping, history, dan download.
class AdminScraperService {
  private static instance: AdminScraperService;

  private constructor() {}

  public static getInstance(): AdminScraperService {
    if (!AdminScraperService.instance) {
      AdminScraperService.instance = new AdminScraperService();
    }
    return AdminScraperService.instance;
  }

  // Mencari tempat di Google Maps.
  async searchMaps(query: string): Promise<PlaceResult[]> {
    const res = await api.get('/api/admin/scraper/search', { params: { q: query } });
    // Dukung response array langsung atau terbungkus.
    return res.data?.data ?? res.data ?? [];
  }

  // Memulai job scraping baru.
  async startScraping(data: StartScrapingRequest): Promise<StartScrapingResponse> {
    const res = await api.post('/api/admin/scraper/start', data);
    return res.data?.data ?? res.data;
  }

  // Mengambil ringkasan live Google Maps dan data yang sudah diproses.
  async getOverview(destinationId: number, mapsUrl?: string): Promise<ScraperOverview> {
    const res = await api.get('/api/admin/scraper/overview', {
      params: {
        destination_id: destinationId,
        ...(mapsUrl ? { maps_url: mapsUrl } : {}),
      },
    });
    return res.data?.data ?? res.data;
  }

  // Mengecek status job scraping.
  async getJobStatus(jobId: number): Promise<ScrapingJob> {
    const res = await api.get(`/api/admin/scraper/status/${jobId}`);
    return res.data?.data ?? res.data;
  }

  // Mengambil daftar job scraping.
  async getAllJobs(
    page = 1,
    limit = 20,
    status?: string,
  ): Promise<PaginatedResponse<ScrapingJob>> {
    const res = await api.get('/api/admin/scraper/jobs', {
      params: { page, limit, ...(status ? { status } : {}) },
    });
    return res.data?.meta ? res.data : res.data?.data ?? res.data;
  }

  // Mengambil riwayat scraping destinasi.
  async getHistory(
    page = 1,
    limit = 10,
    destinationId?: number,
  ): Promise<PaginatedResponse<ScrapingHistoryItem>> {
    const res = await api.get('/api/admin/scraper/history', {
      params: { page, limit, ...(destinationId ? { destination_id: destinationId } : {}) },
    });
    return res.data?.meta ? res.data : res.data?.data ?? res.data;
  }

  // Mengunduh hasil scraping.
  async downloadResults(jobId: number): Promise<DownloadResult> {
    const res = await api.get(`/api/admin/scraper/download/${jobId}`, {
      responseType: 'blob',
    });
    return {
      blob: res.data,
      filename:
        parseDownloadFileName(res.headers['content-disposition']) ??
        fallbackDownloadFileName(jobId),
    };
  }
}

export const adminScraperService = AdminScraperService.getInstance();
