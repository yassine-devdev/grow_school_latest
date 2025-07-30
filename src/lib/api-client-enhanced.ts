/**
 * Enhanced API client with React Query integration and caching
 */

import { queryClient, queryKeys, cacheConfig } from './query-client';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  cache?: boolean;
  cacheTime?: number;
  staleTime?: number;
}

interface CacheHeaders {
  'Cache-Control'?: string;
  'ETag'?: string;
  'Last-Modified'?: string;
}

/**
 * Enhanced API request with caching support
 */
export async function apiRequestEnhanced(url: string, options: ApiRequestOptions = {}) {
  const { method = 'GET', headers = {}, body, cache = true } = options;
  
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  };
  
  // Add cache headers for GET requests
  if (method === 'GET' && cache) {
    requestHeaders['Cache-Control'] = 'max-age=300, stale-while-revalidate=60';
  }
  
  // Add CSRF token for mutation requests
  if (method !== 'GET') {
    try {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1];
      
      if (csrfToken) {
        requestHeaders['x-csrf-token'] = csrfToken;
      }
    } catch (error) {
      console.warn('Could not get CSRF token:', error);
    }
  }
  
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include'
  };
  
  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, requestOptions);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `API request failed: ${response.status} ${response.statusText}`);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }
  
  const data = await response.json();
  
  // Handle cache headers from server
  const cacheHeaders: CacheHeaders = {};
  if (response.headers.get('etag')) {
    cacheHeaders['ETag'] = response.headers.get('etag')!;
  }
  if (response.headers.get('last-modified')) {
    cacheHeaders['Last-Modified'] = response.headers.get('last-modified')!;
  }
  
  return { data, headers: cacheHeaders };
}

/**
 * Enhanced API methods with automatic cache invalidation
 */
export const apiEnhanced = {
  get: async (url: string, options?: Omit<ApiRequestOptions, 'method'>) => {
    const result = await apiRequestEnhanced(url, { method: 'GET', ...options });
    return result.data;
  },
    
  post: async (url: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>) => {
    const result = await apiRequestEnhanced(url, { method: 'POST', body, ...options });
    
    // Invalidate relevant caches after successful POST
    invalidateCacheForUrl(url, 'POST');
    
    return result.data;
  },
    
  put: async (url: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>) => {
    const result = await apiRequestEnhanced(url, { method: 'PUT', body, ...options });
    
    // Invalidate relevant caches after successful PUT
    invalidateCacheForUrl(url, 'PUT');
    
    return result.data;
  },
    
  delete: async (url: string, options?: Omit<ApiRequestOptions, 'method'>) => {
    const result = await apiRequestEnhanced(url, { method: 'DELETE', ...options });
    
    // Invalidate relevant caches after successful DELETE
    invalidateCacheForUrl(url, 'DELETE');
    
    return result.data;
  }
};

/**
 * Smart cache invalidation based on URL patterns
 */
function invalidateCacheForUrl(url: string, method: string) {
  // Journal endpoints
  if (url.includes('/api/journal')) {
    queryClient.invalidateQueries({ queryKey: queryKeys.journal.all });
  }
  
  // User/auth endpoints
  if (url.includes('/api/auth') || url.includes('/api/users')) {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
  }
  
  // Creative assistant endpoints
  if (url.includes('/api/creative')) {
    queryClient.invalidateQueries({ queryKey: queryKeys.creative.all });
  }
  
  // Wellness endpoints
  if (url.includes('/api/wellness')) {
    queryClient.invalidateQueries({ queryKey: queryKeys.wellness.all });
  }
  
  // AI endpoints - only invalidate on specific operations
  if (url.includes('/api/ai') && method !== 'GET') {
    queryClient.invalidateQueries({ queryKey: queryKeys.ai.all });
  }
}

/**
 * Enhanced API modules with React Query integration
 */
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiEnhanced.post('/api/auth/login', credentials),
  logout: () => apiEnhanced.post('/api/auth/logout'),
  register: (userData: { email: string; password: string; name: string }) =>
    apiEnhanced.post('/api/auth/register', userData),
  getProfile: () => apiEnhanced.get('/api/auth/profile'),
  updateProfile: (data: any) => apiEnhanced.put('/api/auth/profile', data)
};

export const journalApi = {
  getEntries: (filters?: any) => {
    const params = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return apiEnhanced.get(`/api/journal/entries${params}`);
  },
  getEntry: (id: string) => apiEnhanced.get(`/api/journal/entries/${id}`),
  createEntry: (entry: any) => apiEnhanced.post('/api/journal/entries', entry),
  updateEntry: (id: string, entry: any) => apiEnhanced.put(`/api/journal/entries/${id}`, entry),
  deleteEntry: (id: string) => apiEnhanced.delete(`/api/journal/entries/${id}`),
  getAnalytics: (userId: string, period?: string) => {
    const params = period ? `?period=${period}` : '';
    return apiEnhanced.get(`/api/journal/analytics/${userId}${params}`);
  }
};

export const creativeApi = {
  getSessions: (userId: string) => apiEnhanced.get(`/api/creative/sessions?userId=${userId}`),
  getSession: (id: string) => apiEnhanced.get(`/api/creative/sessions/${id}`),
  createSession: (session: any) => apiEnhanced.post('/api/creative/sessions', session),
  updateSession: (id: string, session: any) => apiEnhanced.put(`/api/creative/sessions/${id}`, session),
  deleteSession: (id: string) => apiEnhanced.delete(`/api/creative/sessions/${id}`),
  generateContent: (prompt: string, type: string) => 
    apiEnhanced.post('/api/creative/generate', { prompt, type })
};

export const wellnessApi = {
  getEntries: (userId: string, period?: string) => {
    const params = period ? `?period=${period}` : '';
    return apiEnhanced.get(`/api/wellness/entries/${userId}${params}`);
  },
  createEntry: (entry: any) => apiEnhanced.post('/api/wellness/entries', entry),
  updateEntry: (id: string, entry: any) => apiEnhanced.put(`/api/wellness/entries/${id}`, entry),
  deleteEntry: (id: string) => apiEnhanced.delete(`/api/wellness/entries/${id}`),
  getTrends: (userId: string, metric: string, period?: string) => {
    const params = period ? `?period=${period}` : '';
    return apiEnhanced.get(`/api/wellness/trends/${userId}/${metric}${params}`);
  },
  getInsights: (userId: string) => apiEnhanced.get(`/api/wellness/insights/${userId}`)
};

export const aiApi = {
  chat: (message: string, sessionId?: string) => 
    apiEnhanced.post('/api/ai/chat', { message, sessionId }),
  generateContent: (prompt: string, type?: string) => 
    apiEnhanced.post('/api/ai/generate', { prompt, type }),
  analyze: (data: any, type: string) => 
    apiEnhanced.post('/api/ai/analyze', { data, type })
};