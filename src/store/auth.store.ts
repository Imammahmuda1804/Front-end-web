import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  profilePicture?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        set({ user, accessToken: token, isAuthenticated: true });
        if (typeof document !== 'undefined') {
          const cookieValue = JSON.stringify({ state: { isAuthenticated: true, user } });
          document.cookie = `auth-storage=${encodeURIComponent(cookieValue)}; path=/; max-age=86400`;
        }
      },
      updateUser: (updatedUser) => {
        set((state) => {
          const newUser = state.user ? { ...state.user, ...updatedUser } : null;
          if (typeof document !== 'undefined') {
            const cookieValue = JSON.stringify({ state: { isAuthenticated: state.isAuthenticated, user: newUser } });
            document.cookie = `auth-storage=${encodeURIComponent(cookieValue)}; path=/; max-age=86400`;
          }
          return { user: newUser };
        });
      },
      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false });
        if (typeof document !== 'undefined') {
          document.cookie = 'auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
