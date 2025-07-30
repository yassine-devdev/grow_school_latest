/**
 * Middleware for adding appropriate cache headers to API responses
 */

import { NextRequest, NextResponse } from 'next/server';

interface CacheConfig {
  maxAge: number;
  staleWhileRevalidate?: number;
  mustRevalidate?: boolean;
  noCache?: boolean;
  private?: boolean;
}

// Cache configurations for different API endpoints
const cacheConfigs: Record<string, CacheConfig> = {
  // User profile - cache for 1 hour, allow stale for 5 minutes
  '/api/auth/profile': {
    maxAge: 3600,
    staleWhileRevalidate: 300,
    private: true,
  },
  
  // Journal entries - cache for 5 minutes, allow stale for 1 minute
  '/api/journal/entries': {
    maxAge: 300,
    staleWhileRevalidate: 60,
    private: true,
  },
  
  // Journal analytics - cache for 15 minutes, allow stale for 5 minutes
  '/api/journal/analytics': {
    maxAge: 900,
    staleWhileRevalidate: 300,
    private: true,
  },
  
  // Wellness data - cache for 10 minutes, allow stale for 2 minutes
  '/api/wellness': {
    maxAge: 600,
    staleWhileRevalidate: 120,
    private: true,
  },
  
  // Creative sessions - cache for 5 minutes, allow stale for 1 minute
  '/api/creative': {
    maxAge: 300,
    staleWhileRevalidate: 60,
    private: true,
  },
  
  // AI responses - cache for 10 minutes, allow stale for 2 minutes
  '/api/ai': {
    maxAge: 600,
    staleWhileRevalidate: 120,
    private: true,
  },
  
  // Static content - cache for 24 hours
  '/api/static': {
    maxAge: 86400,
    staleWhileRevalidate: 3600,
  },
  
  // Real-time data - no cache
  '/api/realtime': {
    maxAge: 0,
    noCache: true,
    mustRevalidate: true,
  },
};

export function withCacheHeaders(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const response = await handler(req);
    
    // Only add cache headers to successful GET requests
    if (req.method === 'GET' && response.status >= 200 && response.status < 300) {
      const pathname = new URL(req.url).pathname;
      const cacheConfig = findCacheConfig(pathname);
      
      if (cacheConfig) {
        const cacheControl = buildCacheControlHeader(cacheConfig);
        response.headers.set('Cache-Control', cacheControl);
        
        // Add ETag for better caching
        const etag = generateETag(response);
        if (etag) {
          response.headers.set('ETag', etag);
        }
        
        // Add Last-Modified header
        response.headers.set('Last-Modified', new Date().toUTCString());
        
        // Add Vary header for content negotiation
        response.headers.set('Vary', 'Accept, Accept-Encoding, Authorization');
      }
    }
    
    // For mutation requests, add cache invalidation headers
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    }
    
    return response;
  };
}

function findCacheConfig(pathname: string): CacheConfig | null {
  // Find the most specific matching config
  const matchingPaths = Object.keys(cacheConfigs)
    .filter(path => pathname.startsWith(path))
    .sort((a, b) => b.length - a.length); // Sort by specificity (longer paths first)
  
  return matchingPaths.length > 0 ? cacheConfigs[matchingPaths[0]] : null;
}

function buildCacheControlHeader(config: CacheConfig): string {
  const parts: string[] = [];
  
  if (config.noCache) {
    parts.push('no-cache');
  } else {
    if (config.private) {
      parts.push('private');
    } else {
      parts.push('public');
    }
    
    parts.push(`max-age=${config.maxAge}`);
    
    if (config.staleWhileRevalidate) {
      parts.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
    }
  }
  
  if (config.mustRevalidate) {
    parts.push('must-revalidate');
  }
  
  return parts.join(', ');
}

function generateETag(response: NextResponse): string | null {
  try {
    // Simple ETag generation based on response content
    // In production, you might want to use a more sophisticated approach
    const content = response.body;
    if (content) {
      // Create a simple hash of the content
      const hash = Buffer.from(JSON.stringify(content)).toString('base64');
      return `"${hash.substring(0, 16)}"`;
    }
  } catch (error) {
    console.warn('Failed to generate ETag:', error);
  }
  return null;
}

// Utility function to check if request has matching ETag
export function checkETag(req: NextRequest, etag: string): boolean {
  const ifNoneMatch = req.headers.get('if-none-match');
  return ifNoneMatch === etag;
}

// Utility function to check if request has matching Last-Modified
export function checkLastModified(req: NextRequest, lastModified: Date): boolean {
  const ifModifiedSince = req.headers.get('if-modified-since');
  if (!ifModifiedSince) return false;
  
  try {
    const clientDate = new Date(ifModifiedSince);
    return clientDate >= lastModified;
  } catch {
    return false;
  }
}

// Conditional response helper
export function createConditionalResponse(
  req: NextRequest,
  etag?: string,
  lastModified?: Date
): NextResponse | null {
  if (etag && checkETag(req, etag)) {
    return new NextResponse(null, { status: 304 });
  }
  
  if (lastModified && checkLastModified(req, lastModified)) {
    return new NextResponse(null, { status: 304 });
  }
  
  return null;
}