import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import type { AuthResponse, ApiResponse } from '../types';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // required for httpOnly refresh token cookie
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach access token
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 → attempt refresh → retry once
let refreshing: Promise<string> | null = null;

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        // Deduplicate concurrent refresh calls
        if (!refreshing) {
          refreshing = client
            .post<ApiResponse<AuthResponse>>('/v1/auth/refresh')
            .then((res) => res.data.data!.accessToken)
            .finally(() => { refreshing = null; });
        }
        const newToken = await refreshing;
        useAuthStore.getState().setAccessToken(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return client(original);
      } catch {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
