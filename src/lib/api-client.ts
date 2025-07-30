/**
 * API client utility for making requests with proper headers
 */

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

/**
 * Make an API request with proper headers including CSRF token
 */
export async function apiRequest(url: string, options: ApiRequestOptions = {}) {
  const { method = 'GET', headers = {}, body } = options;
  
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  };
  
  // Add CSRF token for mutation requests
  if (method !== 'GET') {
    try {
      // Get CSRF token from cookie
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
    credentials: 'include' // Include cookies
  };
  
  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, requestOptions);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Convenience methods for different HTTP verbs
 */
export const api = {
  get: (url: string, headers?: Record<string, string>) => 
    apiRequest(url, { method: 'GET', headers }),
    
  post: (url: string, body?: any, headers?: Record<string, string>) => 
    apiRequest(url, { method: 'POST', body, headers }),
    
  put: (url: string, body?: any, headers?: Record<string, string>) => 
    apiRequest(url, { method: 'PUT', body, headers }),
    
  delete: (url: string, headers?: Record<string, string>) => 
    apiRequest(url, { method: 'DELETE', headers })
};

/**
 * API modules for different services
 */
export const auth = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/api/auth/login', credentials),
  logout: () => api.post('/api/auth/logout'),
  register: (userData: { email: string; password: string; name: string }) =>
    api.post('/api/auth/register', userData),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data: any) => api.put('/api/auth/profile', data)
};

export const calendar = {
  getEvents: () => api.get('/api/calendar/events'),
  createEvent: (event: any) => api.post('/api/calendar/events', event),
  updateEvent: (id: string, event: any) => api.put(`/api/calendar/events/${id}`, event),
  deleteEvent: (id: string) => api.delete(`/api/calendar/events/${id}`)
};

export const users = {
  getAll: () => api.get('/api/users'),
  getById: (id: string) => api.get(`/api/users/${id}`),
  create: (userData: any) => api.post('/api/users', userData),
  update: (id: string, userData: any) => api.put(`/api/users/${id}`, userData),
  delete: (id: string) => api.delete(`/api/users/${id}`)
};

export const knowledge = {
  getArticles: () => api.get('/api/knowledge/articles'),
  getArticle: (id: string) => api.get(`/api/knowledge/articles/${id}`),
  createArticle: (article: any) => api.post('/api/knowledge/articles', article),
  updateArticle: (id: string, article: any) => api.put(`/api/knowledge/articles/${id}`, article),
  deleteArticle: (id: string) => api.delete(`/api/knowledge/articles/${id}`)
};

export const ai = {
  chat: (message: string) => api.post('/api/ai/chat', { message }),
  generateContent: (prompt: string) => api.post('/api/ai/generate', { prompt }),
  analyze: (data: any) => api.post('/api/ai/analyze', data)
};