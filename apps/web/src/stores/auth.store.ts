import { create } from 'zustand';
import { AuthUser, LoginRequest } from '@growflow/types';
import { apiClient } from '../lib/api-client';

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true });
    try {
      const data = await apiClient.post<{
        accessToken: string;
        user: AuthUser;
      }>('/auth/login', credentials);

      apiClient.setAccessToken(data.accessToken);

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore logout API failures to ensure client state is cleared
    } finally {
      apiClient.setAccessToken(null);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  initialize: async () => {
    if (get().isInitialized) return;
    
    set({ isLoading: true });
    try {
      // 1. Get new access token using refresh token cookie
      const refreshResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/refresh`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!refreshResponse.ok) {
        throw new Error('Refresh failed');
      }

      const json = await refreshResponse.json();
      const data = json.data;

      apiClient.setAccessToken(data.accessToken);

      // 2. Fetch user information using new access token
      const user = await apiClient.get<AuthUser>('/auth/me');

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
    } catch (e) {
      // Clear credentials
      apiClient.setAccessToken(null);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  updateUser: (user: AuthUser) => {
    set({ user });
  },
}));
