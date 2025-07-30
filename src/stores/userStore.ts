import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  preferences?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        error: null 
      }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
          }

          const userData = await response.json();
          set({ 
            user: userData.user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false 
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
        }
      },

      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) throw new Error('No user logged in');

        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Profile update failed');
          }

          const updatedUser = await response.json();
          set({ 
            user: updatedUser, 
            isLoading: false,
            error: null 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Profile update failed',
            isLoading: false 
          });
          throw error;
        }
      },

      refreshUser: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/user/me');
          if (response.ok) {
            const userData = await response.json();
            set({ 
              user: userData, 
              isAuthenticated: true,
              isLoading: false,
              error: null 
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false,
              isLoading: false,
              error: null 
            });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to refresh user',
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'user-store',
    }
  )
);

// Selectors
export const userSelectors = {
  user: (state: UserState) => state.user,
  isAuthenticated: (state: UserState) => state.isAuthenticated,
  isLoading: (state: UserState) => state.isLoading,
  error: (state: UserState) => state.error,
  fullName: (state: UserState) => 
    state.user ? `${state.user.firstName} ${state.user.lastName}` : '',
  initials: (state: UserState) => 
    state.user ? `${state.user.firstName[0]}${state.user.lastName[0]}` : '',
};