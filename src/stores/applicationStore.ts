import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
}

// Loading state types
export interface LoadingState {
  isLoading: boolean;
  operation?: string;
  progress?: number;
}

// Application state interface
export interface ApplicationState {
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Loading states
  loading: LoadingState;
  setLoading: (loading: boolean | LoadingState) => void;
  
  // Global app state
  isOnline: boolean;
  setOnline: (online: boolean) => void;
  
  // Theme and preferences
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // User preferences
  preferences: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      desktop: boolean;
    };
    accessibility: {
      reducedMotion: boolean;
      highContrast: boolean;
      fontSize: 'small' | 'medium' | 'large';
    };
  };
  updatePreferences: (preferences: Partial<ApplicationState['preferences']>) => void;
  
  // Error handling
  errors: Array<{
    id: string;
    error: Error;
    context?: string;
    timestamp: number;
  }>;
  addError: (error: Error, context?: string) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  
  // Performance monitoring
  performance: {
    pageLoadTime?: number;
    apiResponseTimes: Record<string, number[]>;
    errorCount: number;
    lastUpdated: number;
  };
  updatePerformance: (data: Partial<ApplicationState['performance']>) => void;
}

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Create the store
export const useApplicationStore = create<ApplicationState>()(
  devtools(
    (set, get) => ({
      // Initial state
      notifications: [],
      loading: { isLoading: false },
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      theme: 'system',
      preferences: {
        language: 'en',
        timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
        notifications: {
          email: true,
          push: true,
          desktop: true,
        },
        accessibility: {
          reducedMotion: false,
          highContrast: false,
          fontSize: 'medium',
        },
      },
      errors: [],
      performance: {
        apiResponseTimes: {},
        errorCount: 0,
        lastUpdated: Date.now(),
      },

      // Notification actions
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: generateId(),
          timestamp: Date.now(),
          duration: notification.duration ?? 5000,
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto-remove notification after duration
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(newNotification.id);
          }, newNotification.duration);
        }
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // Loading actions
      setLoading: (loading) => {
        if (typeof loading === 'boolean') {
          set({ loading: { isLoading: loading } });
        } else {
          set({ loading });
        }
      },

      // Online status
      setOnline: (online) => {
        set({ isOnline: online });
      },

      // Theme actions
      setTheme: (theme) => {
        set({ theme });

        // Apply theme to document if in browser
        if (typeof document !== 'undefined' && typeof window !== 'undefined') {
          const root = document.documentElement;
          if (theme === 'dark') {
            root.classList.add('dark');
          } else if (theme === 'light') {
            root.classList.remove('dark');
          } else {
            // System theme
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
              root.classList.add('dark');
            } else {
              root.classList.remove('dark');
            }
          }
        }
      },

      // Preferences actions
      updatePreferences: (newPreferences) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPreferences,
          },
        }));
      },

      // Error handling
      addError: (error, context) => {
        const errorEntry = {
          id: generateId(),
          error,
          context,
          timestamp: Date.now(),
        };

        set((state) => ({
          errors: [...state.errors, errorEntry],
          performance: {
            ...state.performance,
            errorCount: state.performance.errorCount + 1,
            lastUpdated: Date.now(),
          },
        }));

        // Also add as notification
        get().addNotification({
          type: 'error',
          title: 'An error occurred',
          message: error.message,
          duration: 8000,
        });
      },

      removeError: (id) => {
        set((state) => ({
          errors: state.errors.filter((e) => e.id !== id),
        }));
      },

      clearErrors: () => {
        set({ errors: [] });
      },

      // Performance monitoring
      updatePerformance: (data) => {
        set((state) => ({
          performance: {
            ...state.performance,
            ...data,
            lastUpdated: Date.now(),
          },
        }));
      },
    }),
    {
      name: 'application-store',
      partialize: (state: ApplicationState) => ({
        theme: state.theme,
        preferences: state.preferences,
      }),
    }
  )
);

// Utility hooks for specific parts of the store
export const useNotifications = () => useApplicationStore((state) => ({
  notifications: state.notifications,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
}));

export const useLoading = () => useApplicationStore((state) => ({
  loading: state.loading,
  setLoading: state.setLoading,
}));

export const useTheme = () => useApplicationStore((state) => ({
  theme: state.theme,
  setTheme: state.setTheme,
}));

export const usePreferences = () => useApplicationStore((state) => ({
  preferences: state.preferences,
  updatePreferences: state.updatePreferences,
}));

export const useErrors = () => useApplicationStore((state) => ({
  errors: state.errors,
  addError: state.addError,
  removeError: state.removeError,
  clearErrors: state.clearErrors,
}));

// Initialize online status listener if in browser
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const store = useApplicationStore.getState();

  window.addEventListener('online', () => store.setOnline(true));
  window.addEventListener('offline', () => store.setOnline(false));

  // Initialize theme based on system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  prefersDark.addEventListener('change', () => {
    if (store.theme === 'system') {
      store.setTheme('system'); // This will trigger the theme application
    }
  });
}
// Selectors
export const applicationSelectors = {
  notifications: (state: ApplicationState) => state.notifications,
  loading: (state: ApplicationState) => state.loading,
  isOnline: (state: ApplicationState) => state.isOnline,
  theme: (state: ApplicationState) => state.theme,
  preferences: (state: ApplicationState) => state.preferences,
  isLoading: (state: ApplicationState) => state.loading.isLoading,
  loadingOperation: (state: ApplicationState) => state.loading.operation,
  unreadNotifications: (state: ApplicationState) => 
    state.notifications.length,
  errors: (state: ApplicationState) => state.errors,
  performance: (state: ApplicationState) => state.performance,
};