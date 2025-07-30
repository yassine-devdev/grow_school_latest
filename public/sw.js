/**
 * Service Worker for offline support and caching
 */

const CACHE_NAME = 'grow-your-need-v1';
const STATIC_CACHE_NAME = 'grow-your-need-static-v1';
const API_CACHE_NAME = 'grow-your-need-api-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/next.svg',
  '/vercel.svg',
  // Add other static assets as needed
];

// API endpoints to cache
const CACHEABLE_API_ROUTES = [
  '/api/auth/profile',
  '/api/journal/entries',
  '/api/wellness/entries',
  '/api/creative/sessions',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache API responses
      caches.open(API_CACHE_NAME)
    ]).then(() => {
      console.log('Service Worker installed successfully');
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE_NAME && 
              cacheName !== API_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests for caching
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static assets
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }
  
  // Handle page requests
  event.respondWith(handlePageRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const isCacheable = CACHEABLE_API_ROUTES.some(route => 
    url.pathname.startsWith(route)
  );
  
  if (!isCacheable) {
    // Non-cacheable API requests - network only
    try {
      return await fetch(request);
    } catch (error) {
      console.error('API request failed:', error);
      return new Response(
        JSON.stringify({ error: 'Network error', offline: true }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  // Cacheable API requests - network first, then cache
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const responseClone = networkResponse.clone();
      
      // Add cache headers
      const headers = new Headers(responseClone.headers);
      headers.set('sw-cache-timestamp', Date.now().toString());
      
      const cachedResponse = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: headers
      });
      
      cache.put(request, cachedResponse);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache for:', request.url);
    
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check if cached response is stale (older than 5 minutes)
      const cacheTimestamp = cachedResponse.headers.get('sw-cache-timestamp');
      const isStale = cacheTimestamp && 
        (Date.now() - parseInt(cacheTimestamp)) > 5 * 60 * 1000;
      
      if (isStale) {
        // Add stale indicator to response
        const headers = new Headers(cachedResponse.headers);
        headers.set('sw-cache-stale', 'true');
        
        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers: headers
        });
      }
      
      return cachedResponse;
    }
    
    // No cache available
    return new Response(
      JSON.stringify({ 
        error: 'No network connection and no cached data available',
        offline: true 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Failed to fetch static asset:', error);
    // Return a fallback response for critical assets
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Handle page requests with network-first strategy
async function handlePageRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // For page requests, we could return a cached offline page
    console.error('Page request failed:', error);
    return new Response('Page not available offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Helper function to check if a path is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => pathname.endsWith(ext)) ||
         pathname.startsWith('/_next/static/');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-journal') {
    event.waitUntil(syncJournalEntries());
  } else if (event.tag === 'background-sync-wellness') {
    event.waitUntil(syncWellnessEntries());
  }
});

// Sync journal entries when back online
async function syncJournalEntries() {
  try {
    // Get pending journal entries from IndexedDB or localStorage
    const pendingEntries = await getPendingJournalEntries();
    
    for (const entry of pendingEntries) {
      try {
        const response = await fetch('/api/journal/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry.data)
        });
        
        if (response.ok) {
          // Remove from pending list
          await removePendingJournalEntry(entry.id);
          console.log('Synced journal entry:', entry.id);
        }
      } catch (error) {
        console.error('Failed to sync journal entry:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Sync wellness entries when back online
async function syncWellnessEntries() {
  try {
    const pendingEntries = await getPendingWellnessEntries();
    
    for (const entry of pendingEntries) {
      try {
        const response = await fetch('/api/wellness/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry.data)
        });
        
        if (response.ok) {
          await removePendingWellnessEntry(entry.id);
          console.log('Synced wellness entry:', entry.id);
        }
      } catch (error) {
        console.error('Failed to sync wellness entry:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper functions for managing pending entries
// These would typically use IndexedDB for more robust offline storage
async function getPendingJournalEntries() {
  // Implementation would use IndexedDB
  return [];
}

async function removePendingJournalEntry(id) {
  // Implementation would use IndexedDB
}

async function getPendingWellnessEntries() {
  // Implementation would use IndexedDB
  return [];
}

async function removePendingWellnessEntry(id) {
  // Implementation would use IndexedDB
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CACHE_INVALIDATE':
      handleCacheInvalidation(payload);
      break;
    case 'PREFETCH_DATA':
      handlePrefetch(payload);
      break;
    default:
      console.log('Unknown message type:', type);
  }
});

// Handle cache invalidation requests
async function handleCacheInvalidation(payload) {
  const { cacheKey, pattern } = payload;
  
  if (cacheKey) {
    const cache = await caches.open(API_CACHE_NAME);
    await cache.delete(cacheKey);
  } else if (pattern) {
    const cache = await caches.open(API_CACHE_NAME);
    const keys = await cache.keys();
    
    for (const request of keys) {
      if (request.url.includes(pattern)) {
        await cache.delete(request);
      }
    }
  }
}

// Handle prefetch requests
async function handlePrefetch(payload) {
  const { urls } = payload;
  const cache = await caches.open(API_CACHE_NAME);
  
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (error) {
      console.error('Prefetch failed for:', url, error);
    }
  }
}