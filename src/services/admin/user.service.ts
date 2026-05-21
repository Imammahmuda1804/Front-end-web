import { api } from "@/lib/axios";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  status: string;
  profilePicture: string | null;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUser {
  favorites: Array<{
    id: number;
    createdAt: string;
    destination: {
      id: number;
      name: string;
      city: string;
      province: string;
      thumbnailUrl: string | null;
    };
  }>;
  userReviews: Array<{
    id: number;
    rating: number;
    reviewText: string | null;
    createdAt: string;
    destination: {
      id: number;
      name: string;
      city: string;
    };
  }>;
  searchLogs: Array<{
    id: number;
    keyword: string;
    createdAt: string;
  }>;
}

export interface AdminUpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: "ADMIN" | "USER";
  status?: string;
}

// Service API untuk manajemen user admin.
export const adminUserService = {
  getUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await api.get("/api/admin/users", { params });
    return data;
  },

  getUserDetail: async (id: number): Promise<AdminUserDetail> => {
    const { data } = await api.get(`/api/admin/users/${id}`);
    // Menangani response user yang sudah dibuka interceptor.
    return data?.data || data;
  },

  createUser: async (userData: AdminUpdateUserData) => {
    const { data } = await api.post("/api/admin/users", userData);
    return data;
  },

  updateUser: async (id: number, userData: AdminUpdateUserData) => {
    const { data } = await api.put(`/api/admin/users/${id}`, userData);
    return data;
  },

  suspendUser: async (id: number) => {
    const { data } = await api.delete(`/api/admin/users/${id}`);
    return data;
  },
};
