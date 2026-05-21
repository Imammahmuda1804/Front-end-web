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

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
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
    return res.data?.data ?? res.data;
  }

  // Mengambil riwayat scraping destinasi.
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

  // Mengunduh hasil scraping.
  async downloadResults(jobId: number): Promise<Blob> {
    const res = await api.get(`/api/admin/scraper/download/${jobId}`, {
      responseType: 'blob',
    });
    return res.data;
  }
}

export const adminScraperService = AdminScraperService.getInstance();
