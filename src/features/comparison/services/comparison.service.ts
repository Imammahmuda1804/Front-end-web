import { api } from '@/lib/axios';

function getApiUrl(): string {
  return process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}

export const comparisonService = {
  getCompareData: async (dest1Id: number, dest2Id: number) => {
    const res = await api.get('/api/analytics/compare', {
      params: { destination1: dest1Id, destination2: dest2Id },
    });
    return res.data;
  },

  getServerCompareData: async (ids: string) => {
    const apiUrl = process.env.API_INTERNAL_URL || getApiUrl();
    const res = await fetch(`${apiUrl}/api/analytics/compare?ids=${ids}`, {
      next: { revalidate: 120, tags: ['compare'] },
    });
    if (!res.ok) throw new Error('Failed to fetch compare data');
    return res.json();
  },

  getAllDestinationsForCompare: async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/destinations?limit=100`, {
        next: { revalidate: 3600, tags: ['all-destinations'] },
      });
      if (!res.ok) throw new Error('Failed to fetch destinations');
      const json = await res.json();
      return json.data || [];
    } catch (error) {
      console.error('Error fetching all destinations:', error);
      return [];
    }
  },
};
