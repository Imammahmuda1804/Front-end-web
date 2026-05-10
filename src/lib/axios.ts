import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true, // Enable if using cookies for refresh token
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized globally
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // TODO: Implement refresh token logic if applicable
      // Example:
      // try {
      //   const { data } = await axios.post(`${baseURL}/api/auth/refresh`, {
      //     refresh_token: getRefreshTokenSomehow()
      //   });
      //   useAuthStore.getState().setAuth(data.user, data.access_token);
      //   api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
      //   return api(originalRequest);
      // } catch (refreshError) {
      //   useAuthStore.getState().logout();
      //   window.location.href = '/login';
      // }

      // Temporary fallback: just logout
      useAuthStore.getState().logout();
      
      // We only want to redirect to login if we're not already on a public page,
      // but typically logging out is sufficient and UI reacts.
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
