import { api } from '@/lib/axios';

export const adminService = {
  getCategories: async () => {
    const { data } = await api.get('/api/destinations/categories');
    return data;
  },

  revalidateTag: async (tag: string) => {
    const res = await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag }),
    });
    return res.json();
  },

  // Dashboard
  getDashboardSummary: async () => {
    const { data } = await api.get('/api/admin/dashboard/summary');
    return data;
  },

  getDashboardActivity: async () => {
    const { data } = await api.get('/api/admin/dashboard/activity');
    return data;
  },

  getDashboardTrends: async (period: string) => {
    const { data } = await api.get(`/api/admin/dashboard/trends?period=${period}`);
    return data;
  },
};
