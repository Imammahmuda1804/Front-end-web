import { api } from '@/lib/axios';

export type NlpProcessingMode = 'skip_existing' | 'reprocess_existing' | 'replace_existing';

export interface NlpUploadResponse {
  message: string;
  run_id: number;
  mode: NlpProcessingMode;
  destination_name: string;
  total_reviews_processed: number;
  inserted_reviews: number;
  skipped_duplicates: number;
  scraped_average_rating: number | null;
  nlp_summary: {
    total: number;
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface NlpPreflightResponse {
  destination_id: number;
  destination_name: string;
  file_name: string;
  file_hash: string;
  total_rows: number;
  new_reviews: number;
  duplicate_reviews: number;
  already_processed: boolean;
  recommended_mode: NlpProcessingMode;
  previous_run?: {
    id: number;
    status: string;
    mode: string;
    startedAt: string;
    insertedReviews: number;
    skippedDuplicates: number;
    processedReviews: number;
  } | null;
}

export interface NlpHistoryItem {
  id: number;
  destinationId: number;
  adminId: number | null;
  fileName: string;
  fileHash: string;
  mode: NlpProcessingMode;
  status: string;
  totalRows: number;
  insertedReviews: number;
  skippedDuplicates: number;
  processedReviews: number;
  errorMessage: string | null;
  startedAt: string;
  finishedAt: string | null;
  destination?: { id: number; name: string; city: string };
  admin?: { id: number; name: string; email: string } | null;
}

export interface NlpHistoryResponse {
  data: NlpHistoryItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function unwrapApiData<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function normalizeHistoryResponse(payload: unknown): NlpHistoryResponse {
  const unwrapped = unwrapApiData<unknown>(payload);
  const nested = unwrapApiData<unknown>(unwrapped);
  if (Array.isArray(nested)) {
    return {
      data: nested as NlpHistoryItem[],
      meta: {
        page: 1,
        limit: nested.length,
        total: nested.length,
        totalPages: 1,
      },
    };
  }

  const response = nested as Partial<NlpHistoryResponse>;
  return {
    data: Array.isArray(response.data) ? response.data : [],
    meta: {
      page: response.meta?.page ?? 1,
      limit: response.meta?.limit ?? 10,
      total: response.meta?.total ?? (Array.isArray(response.data) ? response.data.length : 0),
      totalPages: response.meta?.totalPages ?? 1,
    },
  };
}

class AdminNlpService {
  private static instance: AdminNlpService;

  private constructor() {}

  public static getInstance(): AdminNlpService {
    if (!AdminNlpService.instance) {
      AdminNlpService.instance = new AdminNlpService();
    }
    return AdminNlpService.instance;
  }

  async preflight(file: File, destinationId: number): Promise<NlpPreflightResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('destination_id', destinationId.toString());

    const res = await api.post('/api/admin/nlp/preflight', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });

    return unwrapApiData<NlpPreflightResponse>(res.data);
  }

  async uploadAndProcess(
    file: File,
    destinationId: number,
    mode: NlpProcessingMode = 'skip_existing',
  ): Promise<NlpUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('destination_id', destinationId.toString());
    formData.append('mode', mode);

    const res = await api.post('/api/admin/nlp/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });

    return unwrapApiData<NlpUploadResponse>(res.data);
  }

  async getHistory(params: {
    destinationId?: number;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<NlpHistoryResponse> {
    const res = await api.get('/api/admin/nlp/history', {
      params: {
        destination_id: params.destinationId,
        status: params.status || undefined,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      },
    });

    return normalizeHistoryResponse(res.data);
  }

  async getHistoryDetail(id: number): Promise<NlpHistoryItem> {
    const res = await api.get(`/api/admin/nlp/history/${id}`);
    return unwrapApiData<NlpHistoryItem>(res.data);
  }
}

export const adminNlpService = AdminNlpService.getInstance();
