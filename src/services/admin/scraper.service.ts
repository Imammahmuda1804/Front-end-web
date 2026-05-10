import { api } from '@/lib/axios';

export interface ScraperSearchResponse {
  places: any[]; // Adjust according to ApifyService return format
}

export interface StartScrapingRequest {
  destination_id: number;
  max_reviews?: number;
  sort?: string;
  stars_filter?: number[];
  has_text?: boolean;
  maps_url?: string;
}

export interface StartScrapingResponse {
  job_id: number;
  status: string;
  message: string;
}

export interface ScrapingJob {
  id: number;
  destinationId: number;
  status: string;
  progress: any;
  result: any;
  error: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
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

class AdminScraperService {
  private static instance: AdminScraperService;

  private constructor() {}

  public static getInstance(): AdminScraperService {
    if (!AdminScraperService.instance) {
      AdminScraperService.instance = new AdminScraperService();
    }
    return AdminScraperService.instance;
  }

  /**
   * Search maps (Apify integration)
   */
  async searchMaps(query: string): Promise<{ status: string; data: ScraperSearchResponse }> {
    const res = await api.get('/api/admin/scraper/search', { params: { q: query } });
    return res.data;
  }

  /**
   * Start a new scraping job
   */
  async startScraping(data: StartScrapingRequest): Promise<{ status: string; data: StartScrapingResponse }> {
    const res = await api.post('/api/admin/scraper/start', data);
    return res.data;
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: number): Promise<{ status: string; data: ScrapingJob }> {
    const res = await api.get(`/api/admin/scraper/status/${jobId}`);
    return res.data;
  }

  /**
   * Get all scraping jobs (paginated)
   */
  async getAllJobs(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<{ status: string; data: PaginatedResponse<ScrapingJob> }> {
    const res = await api.get('/api/admin/scraper/jobs', { params: { page, limit, status } });
    return res.data;
  }

  /**
   * Get scraping history
   */
  async getHistory(
    page: number = 1,
    limit: number = 10,
    destinationId?: number
  ): Promise<{ status: string; data: PaginatedResponse<any> }> {
    const res = await api.get('/api/admin/scraper/history', { params: { page, limit, destinationId } });
    return res.data;
  }

  /**
   * Download CSV for a completed job
   * Returns Blob for downloading
   */
  async downloadCsv(jobId: number): Promise<Blob> {
    const response = await api.get(`/api/admin/scraper/download/${jobId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Re-process NLP for a completed job
   */
  async processNlp(jobId: number): Promise<{ status: string; data: any }> {
    const res = await api.post(`/api/admin/scraper/process/${jobId}`);
    return res.data;
  }
}



export const adminScraperService = AdminScraperService.getInstance();
