/**
 * Service Worker registration and management utilities
 */

interface ServiceWorkerMessage {
  type: string;
  payload?: any;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline = true;
  private pendingActions: Array<{ type: string; data: any }> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
      this.setupOnlineOfflineHandlers();
    }
  }

  private async init() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('Service Worker registered successfully');

        // Handle service worker updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration?.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is available
                this.notifyUpdate();
              }
            });
          }
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private setupOnlineOfflineHandlers() {
    window.addEventListener('online', () => {
      console.log('Back online');
      this.isOnline = true;
      this.processPendingActions();
      this.triggerBackgroundSync();
    });

    window.addEventListener('offline', () => {
      console.log('Gone offline');
      this.isOnline = false;
    });

    // Initial online status
    this.isOnline = navigator.onLine;
  }

  private handleMessage(event: MessageEvent) {
    const { type, payload } = event.data;
    
    switch (type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated for:', payload);
        break;
      case 'OFFLINE_ACTION_QUEUED':
        console.log('Action queued for sync:', payload);
        break;
      default:
        console.log('Unknown SW message:', type, payload);
    }
  }

  private notifyUpdate() {
    // Notify user about available update
    if (window.confirm('A new version is available. Reload to update?')) {
      this.skipWaiting();
    }
  }

  public skipWaiting() {
    if (this.registration?.waiting) {
      this.sendMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  public sendMessage(message: ServiceWorkerMessage) {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }

  public invalidateCache(cacheKey?: string, pattern?: string) {
    this.sendMessage({
      type: 'CACHE_INVALIDATE',
      payload: { cacheKey, pattern }
    });
  }

  public prefetchData(urls: string[]) {
    this.sendMessage({
      type: 'PREFETCH_DATA',
      payload: { urls }
    });
  }

  public queueOfflineAction(type: string, data: any) {
    if (!this.isOnline) {
      this.pendingActions.push({ type, data });
      console.log('Action queued for when online:', type);
      return true;
    }
    return false;
  }

  private async processPendingActions() {
    if (this.pendingActions.length === 0) return;

    console.log('Processing', this.pendingActions.length, 'pending actions');

    for (const action of this.pendingActions) {
      try {
        await this.processAction(action);
      } catch (error) {
        console.error('Failed to process pending action:', error);
      }
    }

    this.pendingActions = [];
  }

  private async processAction(action: { type: string; data: any }) {
    const { type, data } = action;

    switch (type) {
      case 'CREATE_JOURNAL_ENTRY':
        await fetch('/api/journal/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        break;
      case 'UPDATE_JOURNAL_ENTRY':
        await fetch(`/api/journal/entries/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        break;
      case 'CREATE_WELLNESS_ENTRY':
        await fetch('/api/wellness/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        break;
      default:
        console.warn('Unknown action type:', type);
    }
  }

  private triggerBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      this.registration?.sync.register('background-sync-journal');
      this.registration?.sync.register('background-sync-wellness');
    }
  }

  public isOffline(): boolean {
    return !this.isOnline;
  }

  public getNetworkStatus(): 'online' | 'offline' {
    return this.isOnline ? 'online' : 'offline';
  }
}

// Create singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

// React hook for service worker functionality
export function useServiceWorker() {
  const [isOnline, setIsOnline] = React.useState(navigator?.onLine ?? true);
  const [updateAvailable, setUpdateAvailable] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueOfflineAction = React.useCallback((type: string, data: any) => {
    return serviceWorkerManager.queueOfflineAction(type, data);
  }, []);

  const invalidateCache = React.useCallback((cacheKey?: string, pattern?: string) => {
    serviceWorkerManager.invalidateCache(cacheKey, pattern);
  }, []);

  const prefetchData = React.useCallback((urls: string[]) => {
    serviceWorkerManager.prefetchData(urls);
  }, []);

  return {
    isOnline,
    updateAvailable,
    queueOfflineAction,
    invalidateCache,
    prefetchData,
    skipWaiting: serviceWorkerManager.skipWaiting.bind(serviceWorkerManager),
  };
}

// Add React import for the hook
import React from 'react';