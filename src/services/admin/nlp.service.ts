import { api } from '@/lib/axios';

export interface NlpUploadResponse {
  message: string;
  destination_name: string;
  total_reviews_processed: number;
  scraped_average_rating: number | null;
  nlp_summary: {
    total: number;
    positive: number;
    negative: number;
    neutral: number;
  };
}

// Service API untuk upload file dan proses NLP admin.
class AdminNlpService {
  private static instance: AdminNlpService;

  private constructor() {}

  public static getInstance(): AdminNlpService {
    if (!AdminNlpService.instance) {
      AdminNlpService.instance = new AdminNlpService();
    }
    return AdminNlpService.instance;
  }

  // Upload file review dan proses NLP.
  async uploadAndProcess(
    file: File,
    destinationId: number,
  ): Promise<NlpUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('destination_id', destinationId.toString());

    const res = await api.post('/api/admin/nlp/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000, // Timeout panjang untuk proses NLP.
    });

    return res.data?.data ?? res.data;
  }
}

export const adminNlpService = AdminNlpService.getInstance();
