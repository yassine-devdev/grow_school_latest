import { TestDatabase } from './test-database';

export interface ApiTestConfig {
  baseUrl?: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  status: number;
  data: T;
  headers: Headers;
  ok: boolean;
}

export class ApiTestClient {
  private baseUrl: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private authToken: string | null = null;

  constructor(config: ApiTestConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    this.timeout = config.timeout || 10000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders
    };
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  private getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    body?: any,
    customHeaders: Record<string, string> = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(customHeaders);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as unknown as T;
      }

      return {
        status: response.status,
        data,
        headers: response.headers,
        ok: response.ok
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, undefined, headers);
  }

  async post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, body, headers);
  }

  async put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, body, headers);
  }

  async patch<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PATCH', endpoint, body, headers);
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, undefined, headers);
  }

  // Convenience method for authentication
  async authenticate(email: string, password: string): Promise<ApiResponse<any>> {
    const response = await this.post('/api/auth/login', { email, password });
    
    if (response.ok && response.data.token) {
      this.setAuthToken(response.data.token);
    }

    return response;
  }

  // Method to test with database integration
  async authenticateWithTestDb(testDb: TestDatabase): Promise<void> {
    const token = testDb.getAuthToken();
    if (token) {
      this.setAuthToken(token);
    }
  }

  clearAuth(): void {
    this.setAuthToken(null);
  }
}

// Global API client instance
let globalApiClient: ApiTestClient | null = null;

export function getApiTestClient(): ApiTestClient {
  if (!globalApiClient) {
    globalApiClient = new ApiTestClient();
  }
  return globalApiClient;
}

export function createApiTestClient(config?: ApiTestConfig): ApiTestClient {
  return new ApiTestClient(config);
}