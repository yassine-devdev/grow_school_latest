/**
 * Test-only authorization system that bypasses all authentication
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock user context for tests
export interface TestUserContext {
  id: string;
  email: string;
  role: string;
  name: string;
  permissions: string[];
}

// Mock permissions enum
export const TestPermission = {
  USE_AI_BRAINSTORM: 'use_ai_brainstorm',
  USE_AI_FEEDBACK: 'use_ai_feedback',
  READ_JOURNAL: 'read_journal',
  CREATE_JOURNAL: 'create_journal',
  UPDATE_JOURNAL: 'update_journal',
  DELETE_JOURNAL: 'delete_journal',
  READ_WELLNESS: 'read_wellness',
  CREATE_WELLNESS: 'create_wellness',
  READ_LEARNING_PATH: 'read_learning_path',
  CREATE_LEARNING_PATH: 'create_learning_path',
  READ_CLASS: 'read_class',
  CREATE_CLASS: 'create_class'
} as const;

// Test authorization wrapper that always succeeds
export function withTestAuthorization(
  handler: (request: NextRequest, user: TestUserContext) => Promise<NextResponse>,
  requiredPermissions: string[] = []
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Always create a mock user with all permissions
    const mockUser: TestUserContext = {
      id: 'test-user-123',
      email: 'test@example.com',
      role: 'admin',
      name: 'Test User',
      permissions: Object.values(TestPermission)
    };
    
    return await handler(request, mockUser);
  };
}

// Mock authorization result
export interface TestAuthorizationResult {
  authorized: boolean;
  user?: TestUserContext;
  error?: string;
  statusCode?: number;
}

// Test authorize function that always succeeds
export async function testAuthorize(
  request: NextRequest,
  requiredPermissions: string[] = []
): Promise<TestAuthorizationResult> {
  const mockUser: TestUserContext = {
    id: 'test-user-123',
    email: 'test@example.com',
    role: 'admin',
    name: 'Test User',
    permissions: Object.values(TestPermission)
  };
  
  return {
    authorized: true,
    user: mockUser
  };
}

// Test getUserContext that always returns a mock user
export async function testGetUserContext(request: NextRequest): Promise<TestUserContext> {
  return {
    id: 'test-user-123',
    email: 'test@example.com',
    role: 'admin',
    name: 'Test User',
    permissions: Object.values(TestPermission)
  };
}
