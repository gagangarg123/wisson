import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import * as api from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, batch: 1 | 2) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        const result = await api.login(email, password);
        
        if (result.success && result.data) {
          set({
            user: result.data.user,
            token: result.data.token,
            isAuthenticated: true,
            isLoading: false
          });
          return true;
        } else {
          set({ error: result.error || 'Login failed', isLoading: false });
          return false;
        }
      },
      
      register: async (name: string, email: string, password: string, batch: 1 | 2) => {
        set({ isLoading: true, error: null });
        const result = await api.register(name, email, password, batch);
        
        if (result.success && result.data) {
          set({
            user: result.data.user,
            token: result.data.token,
            isAuthenticated: true,
            isLoading: false
          });
          return true;
        } else {
          set({ error: result.error || 'Registration failed', isLoading: false });
          return false;
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },
      
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);
