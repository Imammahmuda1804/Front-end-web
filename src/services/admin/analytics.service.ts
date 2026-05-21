import { api } from '@/lib/axios';

export interface AnalyticsSummary {
  totalSearches: number;
  totalViews: number;
  totalSaved: number;
  overallAverageRating: number;
  totalReviewsAnalyzed: number;
  overallSentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface TrendData {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  total?: number;
}

export interface TopicData {
  topic_name: string;
  total_reviews: number;
  percentage: number;
}

export interface DestinationAnalytics {
  id: number;
  name: string;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  topics: { topic_name: string; total_reviews: number }[];
  rating: {
    google: number | null;
    user: number | null;
  };
  recommendation_score: number | null;
  positive_ratio: number | null;
}

export interface CompareResult {
  destination1: DestinationAnalytics;
  destination2: DestinationAnalytics;
  comparison: {
    sentiment_winner: number;
    rating_winner: number;
    recommendation_winner: number;
    score_difference: number;
  };
}

type RawSentiment = Partial<Record<'positive' | 'negative' | 'neutral' | 'positif' | 'negatif' | 'netral', number>>;
type ApiEnvelope<T> = { data: T };

type RawDestinationAnalytics = Partial<{
  id: number;
  destination_id: number;
  name: string;
  destination_name: string;
  total_reviews: number;
  sentiment: RawSentiment;
  sentiment_distribution: RawSentiment;
  topics: { topic_name: string; total_reviews: number }[];
  rating: {
    google?: number | null;
    user?: number | null;
  };
  google_rating: number | null;
  user_rating: number | null;
  average_rating: number | null;
  recommendation_score: number | null;
  recommendationScore: number | null;
  positive_ratio: number | null;
  positiveRatio: number | null;
}>;

function numberOrZero(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function numberOrNull(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

// Membuka response backend yang bisa terbungkus interceptor.
function unwrapApiData<T>(payload: T | ApiEnvelope<T>): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    (payload as ApiEnvelope<T>).data !== undefined
  ) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}

function normalizeSentiment(sentiment?: RawSentiment): DestinationAnalytics['sentiment'] {
  return {
    positive: numberOrZero(sentiment?.positive ?? sentiment?.positif),
    negative: numberOrZero(sentiment?.negative ?? sentiment?.negatif),
    neutral: numberOrZero(sentiment?.neutral ?? sentiment?.netral),
  };
}

function normalizeDestinationAnalytics(payload: RawDestinationAnalytics): DestinationAnalytics {
  return {
    id: numberOrZero(payload.id ?? payload.destination_id),
    name: payload.name || payload.destination_name || 'Destinasi',
    sentiment: normalizeSentiment(payload.sentiment ?? payload.sentiment_distribution),
    topics: Array.isArray(payload.topics) ? payload.topics : [],
    rating: {
      google: numberOrNull(payload.rating?.google ?? payload.google_rating ?? payload.average_rating),
      user: numberOrNull(payload.rating?.user ?? payload.user_rating),
    },
    recommendation_score: numberOrNull(payload.recommendation_score ?? payload.recommendationScore),
    positive_ratio: numberOrNull(payload.positive_ratio ?? payload.positiveRatio),
  };
}

// Service API untuk dashboard dan analytics destinasi admin.
class AdminAnalyticsService {
  async getSummary(): Promise<AnalyticsSummary> {
    const response = await api.get('/api/admin/dashboard/summary');
    return unwrapApiData<AnalyticsSummary>(response.data);
  }

  async getTrends(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<TrendData[]> {
    const response = await api.get(`/api/admin/dashboard/trends?period=${period}`);
    const payload = unwrapApiData<{ trends?: TrendData[] } | TrendData[]>(response.data);
    return Array.isArray(payload) ? payload : payload.trends || [];
  }

  async getDestinationAnalytics(id: number): Promise<DestinationAnalytics> {
    const response = await api.get(`/api/analytics/destination/${id}`);
    return normalizeDestinationAnalytics(unwrapApiData<RawDestinationAnalytics>(response.data));
  }

  async getDestinationTopics(id: number): Promise<TopicData[]> {
    const response = await api.get(`/api/analytics/destination/${id}/topics`);
    const payload = unwrapApiData<{ topics?: TopicData[] }>(response.data);
    return payload.topics || [];
  }

  async getDestinationTrends(id: number, period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<TrendData[]> {
    const response = await api.get(`/api/analytics/trends/${id}?period=${period}`);
    const payload = unwrapApiData<{ trends?: TrendData[] }>(response.data);
    return payload.trends || [];
  }

  async compareDestinations(id1: number, id2: number): Promise<CompareResult> {
    const response = await api.get(`/api/analytics/compare?destination1=${id1}&destination2=${id2}`);
    const payload = unwrapApiData<Partial<CompareResult>>(response.data);
    return {
      ...payload,
      destination1: normalizeDestinationAnalytics(payload.destination1 || {}),
      destination2: normalizeDestinationAnalytics(payload.destination2 || {}),
      comparison: payload.comparison || {
        sentiment_winner: 0,
        rating_winner: 0,
        recommendation_winner: 0,
        score_difference: 0,
      },
    };
  }

  getExportCsvUrl(destinationId: number): string {
    return `${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics/export/${destinationId}`;
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();
