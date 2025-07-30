# Performance Optimization Guide

This document outlines performance optimization strategies, monitoring techniques, and best practices for the Grow School application.

## Performance Overview

Grow School is optimized for fast loading times, smooth user interactions, and efficient resource utilization across all devices and network conditions.

## Core Web Vitals

### Target Metrics
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Contentful Paint (FCP)**: < 1.8s
- **Time to Interactive (TTI)**: < 3.5s

### Measurement Tools
```typescript
// lib/performance.ts
export function measureWebVitals() {
  if (typeof window !== 'undefined') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }
}

// Usage in _app.tsx
export function reportWebVitals(metric: any) {
  // Send to analytics service
  if (process.env.NODE_ENV === 'production') {
    // Send to Google Analytics, Vercel Analytics, etc.
    gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_label: metric.id,
    });
  }
}
```

## Next.js Optimizations

### 1. Image Optimization

```typescript
// components/OptimizedImage.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  priority = false,
  className
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}
```

### 2. Code Splitting

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const CreativeAssistant = dynamic(
  () => import('@/components/creative/CreativeAssistant'),
  {
    loading: () => <div>Loading Creative Assistant...</div>,
    ssr: false
  }
);

const AnalyticsDashboard = dynamic(
  () => import('@/components/analytics/Dashboard'),
  {
    loading: () => <div>Loading Analytics...</div>
  }
);

// Route-based code splitting
const JournalPage = dynamic(() => import('@/app/journal/page'));
```

### 3. Font Optimization

```typescript
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono'
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

## React Performance

### 1. Component Optimization

```typescript
// Memoization for expensive components
import { memo, useMemo, useCallback } from 'react';

interface JournalEntryProps {
  entry: JournalEntry;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const JournalEntry = memo(function JournalEntry({
  entry,
  onEdit,
  onDelete
}: JournalEntryProps) {
  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(entry.createdAt));
  }, [entry.createdAt]);

  const handleEdit = useCallback(() => {
    onEdit(entry.id);
  }, [entry.id, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(entry.id);
  }, [entry.id, onDelete]);

  return (
    <div className="journal-entry">
      <h3>{entry.title}</h3>
      <p>{entry.content}</p>
      <time>{formattedDate}</time>
      <button onClick={handleEdit}>Edit</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
});
```

### 2. Virtual Scrolling

```typescript
// components/VirtualList.tsx
import { FixedSizeList as List } from 'react-window';

interface VirtualListProps {
  items: any[];
  itemHeight: number;
  height: number;
  renderItem: ({ index, style }: any) => React.ReactElement;
}

export function VirtualList({
  items,
  itemHeight,
  height,
  renderItem
}: VirtualListProps) {
  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      itemData={items}
    >
      {renderItem}
    </List>
  );
}

// Usage
function JournalList({ entries }: { entries: JournalEntry[] }) {
  const renderEntry = useCallback(({ index, style }: any) => (
    <div style={style}>
      <JournalEntry entry={entries[index]} />
    </div>
  ), [entries]);

  return (
    <VirtualList
      items={entries}
      itemHeight={120}
      height={600}
      renderItem={renderEntry}
    />
  );
}
```

### 3. State Management Optimization

```typescript
// hooks/useOptimizedState.ts
import { useReducer, useCallback } from 'react';

interface State {
  data: any[];
  loading: boolean;
  error: string | null;
}

type Action = 
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; payload: any[] }
  | { type: 'ERROR'; payload: string }
  | { type: 'UPDATE_ITEM'; payload: { id: string; data: any } };

function stateReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'SUCCESS':
      return { data: action.payload, loading: false, error: null };
    case 'ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_ITEM':
      return {
        ...state,
        data: state.data.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.data }
            : item
        )
      };
    default:
      return state;
  }
}

export function useOptimizedState() {
  const [state, dispatch] = useReducer(stateReducer, {
    data: [],
    loading: false,
    error: null
  });

  const updateItem = useCallback((id: string, data: any) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id, data } });
  }, []);

  return { state, dispatch, updateItem };
}
```

## Database Performance

### 1. Query Optimization

```typescript
// backend/repositories/optimizedRepository.ts
export class OptimizedJournalRepository {
  async getEntriesWithPagination(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ entries: JournalEntry[]; total: number }> {
    // Use database indexes for efficient querying
    const entries = await this.db.collection('journal_entries').getList(page, limit, {
      filter: `userId = "${userId}"`,
      sort: '-created',
      fields: 'id,title,content,mood,created' // Only fetch needed fields
    });

    return {
      entries: entries.items,
      total: entries.totalItems
    };
  }

  async getEntriesWithCache(userId: string): Promise<JournalEntry[]> {
    const cacheKey = `journal_entries_${userId}`;
    
    // Check cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const entries = await this.getEntriesWithPagination(userId);
    
    // Cache for 5 minutes
    await this.cache.set(cacheKey, entries, 300);
    
    return entries.entries;
  }
}
```

### 2. Connection Pooling

```typescript
// lib/db-pool.ts
import PocketBase from 'pocketbase';

class DatabasePool {
  private pools: Map<string, PocketBase> = new Map();
  private maxConnections = 10;

  getConnection(url: string): PocketBase {
    if (!this.pools.has(url)) {
      this.pools.set(url, new PocketBase(url));
    }
    return this.pools.get(url)!;
  }

  async closeAll(): Promise<void> {
    for (const [url, pb] of this.pools) {
      // PocketBase doesn't have explicit close, but we can clear auth
      pb.authStore.clear();
    }
    this.pools.clear();
  }
}

export const dbPool = new DatabasePool();
```

## Caching Strategies

### 1. Browser Caching

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/api/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400'
          }
        ]
      }
    ];
  }
};
```

### 2. API Response Caching

```typescript
// lib/cache.ts
import { LRUCache } from 'lru-cache';

class APICache {
  private cache = new LRUCache<string, any>({
    max: 500,
    ttl: 1000 * 60 * 5 // 5 minutes
  });

  get(key: string): any | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: any, ttl?: number): void {
    this.cache.set(key, value, { ttl });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new APICache();

// Usage in API routes
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const cacheKey = `api_${url.pathname}_${url.searchParams.toString()}`;
  
  // Check cache first
  const cached = apiCache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  // Fetch data
  const data = await fetchData();
  
  // Cache response
  apiCache.set(cacheKey, data);
  
  return NextResponse.json(data);
}
```

### 3. Service Worker Caching

```typescript
// public/sw.js
const CACHE_NAME = 'grow-school-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});
```

## Bundle Optimization

### 1. Webpack Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Analyze bundle
ANALYZE=true npm run build
```

```typescript
// next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.cacheGroups = {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      };
    }
    return config;
  },
});
```

### 2. Tree Shaking

```typescript
// Import only what you need
import { debounce } from 'lodash/debounce'; // Good
import _ from 'lodash'; // Bad - imports entire library

// Use dynamic imports for large libraries
const loadChartLibrary = async () => {
  const { Chart } = await import('chart.js');
  return Chart;
};
```

## Performance Monitoring

### 1. Real User Monitoring (RUM)

```typescript
// lib/monitoring.ts
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();

  startTimer(name: string): void {
    this.metrics.set(name, performance.now());
  }

  endTimer(name: string): number {
    const start = this.metrics.get(name);
    if (!start) return 0;
    
    const duration = performance.now() - start;
    this.metrics.delete(name);
    
    // Send to analytics
    this.sendMetric(name, duration);
    
    return duration;
  }

  private sendMetric(name: string, value: number): void {
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, value, timestamp: Date.now() })
      });
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

### 2. Performance Budgets

```typescript
// performance.config.js
module.exports = {
  budgets: [
    {
      path: '/',
      maximumFileSizeCss: 150000,
      maximumFileSizeJs: 300000,
      maximumFileSizeTotal: 500000
    },
    {
      path: '/dashboard',
      maximumFileSizeCss: 200000,
      maximumFileSizeJs: 400000,
      maximumFileSizeTotal: 700000
    }
  ]
};
```

## Network Optimization

### 1. API Request Optimization

```typescript
// lib/api-optimization.ts
export class OptimizedAPIClient {
  private requestQueue: Map<string, Promise<any>> = new Map();

  async request(url: string, options?: RequestInit): Promise<any> {
    // Deduplicate identical requests
    const key = `${url}_${JSON.stringify(options)}`;
    
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key);
    }

    const promise = this.makeRequest(url, options);
    this.requestQueue.set(key, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      this.requestQueue.delete(key);
    }
  }

  private async makeRequest(url: string, options?: RequestInit): Promise<any> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}
```

### 2. Request Batching

```typescript
// lib/batch-requests.ts
export class RequestBatcher {
  private batches: Map<string, any[]> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  addToBatch(batchKey: string, request: any): Promise<any> {
    if (!this.batches.has(batchKey)) {
      this.batches.set(batchKey, []);
    }

    const batch = this.batches.get(batchKey)!;
    batch.push(request);

    return new Promise((resolve, reject) => {
      request.resolve = resolve;
      request.reject = reject;

      // Clear existing timer
      if (this.timers.has(batchKey)) {
        clearTimeout(this.timers.get(batchKey)!);
      }

      // Set new timer to process batch
      const timer = setTimeout(() => {
        this.processBatch(batchKey);
      }, 50); // 50ms delay

      this.timers.set(batchKey, timer);
    });
  }

  private async processBatch(batchKey: string): Promise<void> {
    const batch = this.batches.get(batchKey);
    if (!batch || batch.length === 0) return;

    try {
      const results = await this.executeBatch(batchKey, batch);
      
      batch.forEach((request, index) => {
        request.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach(request => {
        request.reject(error);
      });
    } finally {
      this.batches.delete(batchKey);
      this.timers.delete(batchKey);
    }
  }

  private async executeBatch(batchKey: string, requests: any[]): Promise<any[]> {
    // Implementation depends on the specific API
    const response = await fetch(`/api/batch/${batchKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests })
    });

    return response.json();
  }
}
```

## Performance Testing

### 1. Load Testing

```typescript
// scripts/load-test.ts
import { performance } from 'perf_hooks';

async function loadTest() {
  const concurrentUsers = 100;
  const requestsPerUser = 10;
  const baseUrl = 'http://localhost:3000';

  const results: number[] = [];

  for (let user = 0; user < concurrentUsers; user++) {
    const userPromises = [];

    for (let req = 0; req < requestsPerUser; req++) {
      const promise = (async () => {
        const start = performance.now();
        
        try {
          const response = await fetch(`${baseUrl}/api/journal/entries`);
          await response.json();
          
          return performance.now() - start;
        } catch (error) {
          console.error('Request failed:', error);
          return -1;
        }
      })();

      userPromises.push(promise);
    }

    const userResults = await Promise.all(userPromises);
    results.push(...userResults.filter(r => r > 0));
  }

  const avgResponseTime = results.reduce((a, b) => a + b, 0) / results.length;
  const maxResponseTime = Math.max(...results);
  const minResponseTime = Math.min(...results);

  console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`Max response time: ${maxResponseTime.toFixed(2)}ms`);
  console.log(`Min response time: ${minResponseTime.toFixed(2)}ms`);
  console.log(`Total requests: ${results.length}`);
}

loadTest().catch(console.error);
```

## Performance Checklist

### Development
- [ ] Code splitting implemented
- [ ] Dynamic imports used for heavy components
- [ ] Images optimized with Next.js Image component
- [ ] Fonts optimized and preloaded
- [ ] Bundle size monitored
- [ ] Tree shaking enabled
- [ ] Memoization used appropriately
- [ ] Virtual scrolling for large lists

### Production
- [ ] CDN configured
- [ ] Compression enabled (gzip/brotli)
- [ ] Caching headers set
- [ ] Service worker implemented
- [ ] Performance monitoring active
- [ ] Core Web Vitals tracked
- [ ] Database queries optimized
- [ ] API responses cached
- [ ] Load testing completed
- [ ] Performance budgets defined
