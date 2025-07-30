import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, checkAuthRateLimit, addCorsHeaders, addSecurityHeaders } from './middleware/auth';

export async function middleware(request: NextRequest) {
  // Skip middleware entirely in test environment
  if (process.env.NODE_ENV === 'test') {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    return addCorsHeaders(response);
  }

  // Apply rate limiting for auth endpoints
  const rateLimitResponse = checkAuthRateLimit(request);
  if (rateLimitResponse) {
    return addSecurityHeaders(addCorsHeaders(rateLimitResponse));
  }

  // Apply authentication middleware for API routes
  if (pathname.startsWith('/api/')) {
    const authResponse = await authMiddleware(request);
    if (authResponse) {
      return addSecurityHeaders(addCorsHeaders(authResponse));
    }
  }

  // Continue to the route
  const response = NextResponse.next();
  return addSecurityHeaders(addCorsHeaders(response));
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match all app routes except static files
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
