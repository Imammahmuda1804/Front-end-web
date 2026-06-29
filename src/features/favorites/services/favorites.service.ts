import { api } from '@/lib/axios';

export const favoritesService = {
  getFavorites: async (limit: number = 50) => {
    const res = await api.get(`/api/favorites?limit=${limit}`);
    return res.data;
  },

  removeFavorite: async (destinationId: number) => {
    const res = await api.delete(`/api/favorites/${destinationId}`);
    return res.data;
  },

  updateProfile: async (updateData: { name: string; email: string; password?: string }) => {
    const res = await api.put('/api/users/me', updateData);
    return res.data;
  },

  updateAvatar: async (formData: FormData) => {
    const res = await api.post('/api/users/me/avatar', formData);
    return res.data;
  },
};
