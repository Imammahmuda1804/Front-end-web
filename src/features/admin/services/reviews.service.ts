import { api } from '@/lib/axios';

export interface Review {
    id: number;
    destinationId: number;
    reviewerName: string;
    reviewText: string | null;
    cleanedText: string | null;
    rating: number | null;
    reviewDate: string | null;
    source: string | null;
    likesCount: number | null;
    ownerReply: string | null;
    sentiment: string | null;
    sentimentConfidence: number | null;
    topicId: number | null;
    scrapingJobId: number | null;
    createdAt: string;
    topic?: {
        id: number;
        topicName: string;
    } | null;
}

export interface GetAdminReviewsResponse {
    data: Review[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface GetAdminReviewsParams {
    page?: number;
    limit?: number;
    sentiment?: 'positive' | 'negative' | 'neutral' | '';
    topic_id?: number | '';
    date_from?: string;
    date_to?: string;
    sort_by?: 'newest' | 'oldest';
    nlp_status?: 'all' | 'processed' | 'unprocessed';
}

// Service API untuk review admin dan operasi bulk.
export const adminReviewsService = {
    async getReviewsByDestination(
        destinationId: number,
        params?: GetAdminReviewsParams,
    ): Promise<GetAdminReviewsResponse> {
        // Hapus parameter kosong sebelum request.
        const cleanParams: Record<string, unknown> = { ...params };
        if (cleanParams['sentiment'] === '') delete cleanParams['sentiment'];
        if (cleanParams['topic_id'] === '') delete cleanParams['topic_id'];
        if (!cleanParams['date_from']) delete cleanParams['date_from'];
        if (!cleanParams['date_to']) delete cleanParams['date_to'];
        if (cleanParams['nlp_status'] === 'all') delete cleanParams['nlp_status'];

        const { data } = await api.get(`/api/admin/reviews/destination/${destinationId}`, {
            params: cleanParams,
        });
        return data;
    },

    async deleteReview(reviewId: number): Promise<void> {
        const { data } = await api.delete(`/api/admin/reviews/${reviewId}`);
        return data;
    },

    async deleteBulk(destinationId: number, category: 'all' | 'processed' | 'unprocessed'): Promise<{ message: string }> {
        const { data } = await api.delete(`/api/admin/reviews/destination/${destinationId}/bulk`, {
            params: { category }
        });
        return data;
    },
};
