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
  total: number;
}

export interface TopicData {
  topic_name: string;
  total_reviews: number;
  percentage: number;
}

export interface TrendData {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
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

class AdminAnalyticsService {
  async getSummary(): Promise<AnalyticsSummary> {
    const response = await api.get('/api/admin/dashboard/summary');
    return response.data;
  }

  async getTrends(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<TrendData[]> {
    const response = await api.get(`/api/admin/dashboard/trends?period=${period}`);
    return response.data;
  }

  async getDestinationAnalytics(id: number): Promise<DestinationAnalytics> {
    const response = await api.get(`/api/analytics/destination/${id}`);
    return response.data?.data || response.data;
  }

  async getDestinationTopics(id: number): Promise<TopicData[]> {
    const response = await api.get(`/api/analytics/destination/${id}/topics`);
    const payload = response.data?.data || response.data;
    return payload.topics || [];
  }

  async getDestinationTrends(id: number, period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<TrendData[]> {
    const response = await api.get(`/api/analytics/trends/${id}?period=${period}`);
    const payload = response.data?.data || response.data;
    return payload.trends || [];
  }

  async compareDestinations(id1: number, id2: number): Promise<CompareResult> {
    const response = await api.get(`/api/analytics/compare?destination1=${id1}&destination2=${id2}`);
    return response.data?.data || response.data;
  }

  getExportCsvUrl(destinationId: number): string {
    return `${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics/export/${destinationId}`;
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();
