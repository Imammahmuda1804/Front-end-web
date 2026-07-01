import { api } from '@/lib/axios';
import { type SearchDestination } from '@/features/search';
import { type DestinationDetail } from '../components/detail.types';

const getServerApiUrl = () => {
  return (process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
};

export const destinationService = {
  // Dipanggil dari Client
  getDestinations: async (params?: { limit?: number; city?: string }) => {
    const { data } = await api.get('/api/destinations', { params });
    return data;
  },

  checkFavorite: async (destinationId: number) => {
    const { data } = await api.get(`/api/favorites/check/${destinationId}`);
    return data;
  },

  addFavorite: async (destinationId: number) => {
    const { data } = await api.post(`/api/favorites/${destinationId}`);
    return data;
  },

  removeFavorite: async (destinationId: number) => {
    const { data } = await api.delete(`/api/favorites/${destinationId}`);
    return data;
  },

  submitReview: async (destinationId: number, rating: number, reviewText?: string) => {
    const { data } = await api.post('/api/user-reviews', {
      destination_id: destinationId,
      rating,
      review_text: reviewText?.trim() || undefined,
    });
    return data;
  },

  // Dipanggil dari Server (SSR)
  getServerDestinations: async (): Promise<SearchDestination[]> => {
    try {
      const response = await fetch(`${getServerApiUrl()}/api/destinations?limit=100`, {
        next: { revalidate: 300, tags: ['all-destinations'] },
      });
      if (!response.ok) return [];
      const json = await response.json();
      return (json?.data || []) as SearchDestination[];
    } catch {
      return [];
    }
  },

  revalidateDestination: async (slug: string) => {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag: `destination-${slug}` }),
    });
  },

  getServerDestinationBySlug: async (slug: string): Promise<DestinationDetail | null> => {
    const apiUrl = getServerApiUrl();
    const res = await fetch(`${apiUrl}/api/destinations/slug/${slug}`, {
      next: { revalidate: 120, tags: [`destination-${slug}`] },
    });

    if (!res.ok) {
      if (res.status === 404 && /^\\d+$/.test(slug)) {
        const idRes = await fetch(`${apiUrl}/api/destinations/${slug}`, {
          next: { revalidate: 120, tags: [`destination-${slug}`] },
        });
        if (!idRes.ok) return null;
        const { data: fallbackData } = await idRes.json();
        return fallbackData;
      }
      if (res.status === 404) return null;
      throw new Error('Failed to fetch destination');
    }

    const { data } = await res.json();
    return data;
  },

  getTopicReviews: async (destinationId: number, topicId: number, page: number = 1, mode: 'topic' | 'group' = 'topic') => {
    const apiUrl = getServerApiUrl();
    const endpoint = mode === 'group'
      ? `${apiUrl}/api/destinations/${destinationId}/reviews-by-topic-group?groupId=${topicId}&page=${page}&limit=5`
      : `${apiUrl}/api/destinations/${destinationId}/reviews-by-topic?topicId=${topicId}&page=${page}&limit=5`;
    const res = await fetch(endpoint);
    return res.json();
  },

  getServerRecommendations: async () => {
    try {
      const apiUrl = getServerApiUrl();
      const res = await fetch(`${apiUrl}/api/destinations/recommendations?limit=7`, {
        next: { revalidate: 60 },
      });
      if (!res.ok) {
        console.error(`Failed to fetch recommendations: ${res.status} ${res.statusText}`);
        return { data: [] };
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return { data: [] };
    }
  },
};