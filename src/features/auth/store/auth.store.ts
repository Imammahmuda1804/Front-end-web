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
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

function authCookieAttributes() {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  return `path=/; max-age=86400; SameSite=Lax${secure ? '; Secure' : ''}`;
}

export function writeAuthCookie(user: User | null, isAuthenticated: boolean) {
  if (typeof document === 'undefined') return;

  const cookieValue = JSON.stringify({ state: { isAuthenticated, user } });
  document.cookie = `auth-storage=${encodeURIComponent(cookieValue)}; ${authCookieAttributes()}`;
}

export function clearAuthCookie() {
  if (typeof document === 'undefined') return;

  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  document.cookie = `auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secure ? '; Secure' : ''}`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken, isAuthenticated: true });
        writeAuthCookie(user, true);
      },
      updateUser: (updatedUser) => {
        set((state) => {
          const newUser = state.user ? { ...state.user, ...updatedUser } : null;
          writeAuthCookie(newUser, state.isAuthenticated);
          return { user: newUser };
        });
      },
      setAccessToken: (token: string) => {
        set({ accessToken: token });
      },
      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        clearAuthCookie();
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
