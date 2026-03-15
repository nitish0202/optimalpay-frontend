import { create } from 'zustand';
import type { UserDto } from '../types';

interface AuthState {
  user: UserDto | null;
  accessToken: string | null;
  setAuth: (user: UserDto, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

// Access token is stored in memory ONLY — not localStorage (XSS risk).
// Refresh token lives in an httpOnly cookie, not accessible to JS.
// On page refresh: AuthGuard attempts silent POST /v1/auth/refresh
//   → if cookie valid: restore session
//   → if cookie expired: stay logged out, redirect to /login
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,

  setAuth: (user, accessToken) => set({ user, accessToken }),

  setAccessToken: (accessToken) => set({ accessToken }),

  clearAuth: () => set({ user: null, accessToken: null }),

  isAuthenticated: () => {
    const { accessToken } = get();
    return accessToken !== null;
  },
}));
