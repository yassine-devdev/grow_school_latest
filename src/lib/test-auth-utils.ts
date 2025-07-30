/**
 * Test utilities for bypassing authorization in test environment
 */

import { NextRequest } from 'next/server';
import { UserRole, Permission, ROLE_PERMISSIONS, UserContext } from './authorization-test';

// Mock user context for tests
export function createMockUserContext(
  role: UserRole = UserRole.STUDENT,
  id: string = 'test-user-123'
): UserContext {
  return {
    id,
    email: `${role}@test.com`,
    role,
    name: `Test ${role}`,
    permissions: ROLE_PERMISSIONS[role]
  };
}

// Test authorization wrapper that bypasses real authorization
export function withTestAuthorization(
  handler: (request: NextRequest, user: UserContext) => Promise<Response>,
  requiredPermissions: Permission[] = [],
  mockRole: UserRole = UserRole.STUDENT
) {
  return async (request: NextRequest): Promise<Response> => {
    // In test environment, create a mock user with required permissions
    const mockUser = createMockUserContext(mockRole);
    
    // Add any required permissions to the mock user if they don't have them
    const missingPermissions = requiredPermissions.filter(
      permission => !mockUser.permissions.includes(permission)
    );
    
    if (missingPermissions.length > 0) {
      mockUser.permissions = [...mockUser.permissions, ...missingPermissions];
    }
    
    return await handler(request, mockUser);
  };
}

// Extract user ID from request body for tests
export function extractUserIdFromTestRequest(request: NextRequest): string | null {
  try {
    // For tests, we'll use a default test user ID
    return 'test-user-123';
  } catch {
    return null;
  }
}

// Mock authorization functions for tests
export const testAuthUtils = {
  getUserContext: async (request: NextRequest): Promise<UserContext | null> => {
    return createMockUserContext(UserRole.STUDENT);
  },
  
  authorize: async (
    request: NextRequest,
    requiredPermissions: Permission[]
  ): Promise<{ authorized: boolean; user?: UserContext; error?: string }> => {
    const user = createMockUserContext(UserRole.ADMIN); // Admin has all permissions
    return {
      authorized: true,
      user
    };
  },
  
  hasPermission: (user: UserContext, permission: Permission): boolean => {
    return true; // In tests, always allow
  },
  
  checkResourceOwnership: (user: UserContext, resource: any): boolean => {
    return true; // In tests, always allow
  }
};

// Environment check
export function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test';
}

// Create mock request headers with user context
export function createMockAuthHeaders(role: UserRole = UserRole.STUDENT): Record<string, string> {
  const user = createMockUserContext(role);
  return {
    'x-user-id': user.id,
    'x-user-role': user.role,
    'x-user-email': user.email,
    'x-user-permissions': JSON.stringify(user.permissions)
  };
}

// Add auth headers to existing request
export function addMockAuthToRequest(request: NextRequest, role: UserRole = UserRole.STUDENT): NextRequest {
  const headers = new Headers(request.headers);
  const authHeaders = createMockAuthHeaders(role);
  
  Object.entries(authHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  return new NextRequest(request.url, {
    method: request.method,
    headers,
    body: request.body
  });
}
