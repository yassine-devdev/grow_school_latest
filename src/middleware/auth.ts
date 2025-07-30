import { NextRequest, NextResponse } from 'next/server';
import { getUserContext, Permission, createAuthErrorResponse } from '@/lib/authorization';

// API routes that require authentication
const PROTECTED_ROUTES = [
  '/api/creative-assistant',
  '/api/journal',
  '/api/wellness',
  '/api/school-hub',
  '/api/learning-guide'
];

// API routes that are public (no authentication required)
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/health'
];

// Route-specific permission requirements
const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  // Creative Assistant
  '/api/creative-assistant/brainstorm': [Permission.USE_AI_BRAINSTORM],
  '/api/creative-assistant/feedback': [Permission.USE_AI_FEEDBACK],
  
  // Journal
  '/api/journal/entries': [Permission.READ_JOURNAL, Permission.CREATE_JOURNAL],
  
  // Wellness
  '/api/wellness/mood-tracking': [Permission.READ_WELLNESS, Permission.CREATE_WELLNESS],
  '/api/wellness/analytics': [Permission.VIEW_ANALYTICS],
  
  // School Hub
  '/api/school-hub/classes': [Permission.READ_CLASS, Permission.CREATE_CLASS],
  '/api/school-hub/enrollment': [Permission.MANAGE_ENROLLMENT],
  
  // Learning Guide
  '/api/learning-guide/paths': [Permission.READ_LEARNING_PATH, Permission.CREATE_LEARNING_PATH]
};

// Check if a route is protected
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

// Check if a route is public
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

// Get required permissions for a route
function getRoutePermissions(pathname: string, method: string): Permission[] {
  // Check exact match first
  if (ROUTE_PERMISSIONS[pathname]) {
    return ROUTE_PERMISSIONS[pathname];
  }
  
  // Check for partial matches
  for (const [route, permissions] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      return permissions;
    }
  }
  
  // Default permissions based on HTTP method
  switch (method.toUpperCase()) {
    case 'GET':
      return [Permission.READ_CONTENT];
    case 'POST':
      return [Permission.CREATE_CONTENT];
    case 'PUT':
    case 'PATCH':
      return [Permission.UPDATE_CONTENT];
    case 'DELETE':
      return [Permission.DELETE_CONTENT];
    default:
      return [];
  }
}

// Main authentication middleware
export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  // Skip all authentication in test environment
  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  // Skip middleware for public routes
  if (isPublicRoute(pathname)) {
    return null;
  }

  // Skip middleware for non-API routes
  if (!pathname.startsWith('/api/')) {
    return null;
  }

  // Check if route requires authentication
  if (!isProtectedRoute(pathname)) {
    return null;
  }
  
  try {
    // Get user context
    const user = await getUserContext(request);
    
    if (!user) {
      return createAuthErrorResponse('Authentication required', 401);
    }
    
    // Get required permissions for this route
    const requiredPermissions = getRoutePermissions(pathname, request.method);
    
    // Check if user has required permissions
    if (requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.some(permission => 
        user.permissions.includes(permission)
      );
      
      if (!hasPermission) {
        return createAuthErrorResponse(
          `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
          403
        );
      }
    }
    
    // Add user context to request headers for downstream handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-role', user.role);
    requestHeaders.set('x-user-email', user.email);
    requestHeaders.set('x-user-permissions', JSON.stringify(user.permissions));
    
    // Continue to the API route with user context
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
    
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return createAuthErrorResponse('Authentication failed', 500);
  }
}

// Helper function to extract user context from request headers (for API routes)
export function getUserFromHeaders(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  const userEmail = request.headers.get('x-user-email');
  const userPermissions = request.headers.get('x-user-permissions');
  
  if (!userId || !userRole || !userEmail || !userPermissions) {
    return null;
  }
  
  try {
    return {
      id: userId,
      email: userEmail,
      role: userRole as any,
      name: userEmail.split('@')[0], // Fallback name
      permissions: JSON.parse(userPermissions)
    };
  } catch (error) {
    console.error('Error parsing user from headers:', error);
    return null;
  }
}

// Rate limiting for authentication endpoints
const AUTH_RATE_LIMITS = new Map<string, { count: number; resetTime: number }>();
const AUTH_RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const AUTH_RATE_LIMIT_MAX_ATTEMPTS = 5;

export function checkAuthRateLimit(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  
  // Only apply rate limiting to auth endpoints
  if (!pathname.startsWith('/api/auth/')) {
    return null;
  }
  
  const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const key = `${clientIP}:${pathname}`;
  const now = Date.now();
  
  const current = AUTH_RATE_LIMITS.get(key);
  
  if (!current || now > current.resetTime) {
    // Reset or initialize rate limit
    AUTH_RATE_LIMITS.set(key, {
      count: 1,
      resetTime: now + AUTH_RATE_LIMIT_WINDOW
    });
    return null;
  }
  
  if (current.count >= AUTH_RATE_LIMIT_MAX_ATTEMPTS) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many authentication attempts. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      },
      { status: 429 }
    );
  }
  
  // Increment counter
  current.count++;
  AUTH_RATE_LIMITS.set(key, current);
  
  return null;
}

// CORS headers for API routes
export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id, x-user-role');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}

// Security headers for API responses
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}

export default authMiddleware;
