/**
 * Test-only authorization module
 * Simplified version without external dependencies for Jest compatibility
 */

// Define user roles and their hierarchy
export const UserRole = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
  PARENT: 'parent'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// Define permissions for different actions
export const Permission = {
  // User management
  CREATE_USER: 'create_user',
  READ_USER: 'read_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  
  // Content management
  CREATE_CONTENT: 'create_content',
  READ_CONTENT: 'read_content',
  UPDATE_CONTENT: 'update_content',
  DELETE_CONTENT: 'delete_content',
  
  // Class management
  CREATE_CLASS: 'create_class',
  READ_CLASS: 'read_class',
  UPDATE_CLASS: 'update_class',
  DELETE_CLASS: 'delete_class',
  MANAGE_ENROLLMENT: 'manage_enrollment',
  
  // Journal access
  CREATE_JOURNAL: 'create_journal',
  READ_JOURNAL: 'read_journal',
  UPDATE_JOURNAL: 'update_journal',
  DELETE_JOURNAL: 'delete_journal',
  READ_ALL_JOURNALS: 'read_all_journals',
  
  // Wellness data
  CREATE_WELLNESS: 'create_wellness',
  READ_WELLNESS: 'read_wellness',
  UPDATE_WELLNESS: 'update_wellness',
  DELETE_WELLNESS: 'delete_wellness',
  READ_ALL_WELLNESS: 'read_all_wellness',
  
  // AI services
  USE_AI_ASSISTANT: 'use_ai_assistant',
  USE_AI_FEEDBACK: 'use_ai_feedback',
  USE_AI_BRAINSTORM: 'use_ai_brainstorm',
  
  // Learning paths
  CREATE_LEARNING_PATH: 'create_learning_path',
  READ_LEARNING_PATH: 'read_learning_path',
  UPDATE_LEARNING_PATH: 'update_learning_path',
  DELETE_LEARNING_PATH: 'delete_learning_path',
  
  // Analytics
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_ALL_ANALYTICS: 'view_all_analytics',
  
  // System administration
  MANAGE_SYSTEM: 'manage_system',
  VIEW_LOGS: 'view_logs'
} as const;

export type Permission = typeof Permission[keyof typeof Permission];

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.STUDENT]: [
    Permission.READ_USER,
    Permission.UPDATE_USER,
    Permission.CREATE_CONTENT,
    Permission.READ_CONTENT,
    Permission.UPDATE_CONTENT,
    Permission.READ_CLASS,
    Permission.CREATE_JOURNAL,
    Permission.READ_JOURNAL,
    Permission.UPDATE_JOURNAL,
    Permission.DELETE_JOURNAL,
    Permission.CREATE_WELLNESS,
    Permission.READ_WELLNESS,
    Permission.UPDATE_WELLNESS,
    Permission.USE_AI_ASSISTANT,
    Permission.USE_AI_FEEDBACK,
    Permission.USE_AI_BRAINSTORM,
    Permission.READ_LEARNING_PATH,
    Permission.VIEW_ANALYTICS
  ],
  
  [UserRole.TEACHER]: [
    Permission.READ_USER,
    Permission.UPDATE_USER,
    Permission.CREATE_CONTENT,
    Permission.READ_CONTENT,
    Permission.UPDATE_CONTENT,
    Permission.DELETE_CONTENT,
    Permission.CREATE_CLASS,
    Permission.READ_CLASS,
    Permission.UPDATE_CLASS,
    Permission.DELETE_CLASS,
    Permission.MANAGE_ENROLLMENT,
    Permission.READ_JOURNAL,
    Permission.CREATE_WELLNESS,
    Permission.READ_WELLNESS,
    Permission.UPDATE_WELLNESS,
    Permission.READ_ALL_WELLNESS,
    Permission.USE_AI_ASSISTANT,
    Permission.USE_AI_FEEDBACK,
    Permission.USE_AI_BRAINSTORM,
    Permission.CREATE_LEARNING_PATH,
    Permission.READ_LEARNING_PATH,
    Permission.UPDATE_LEARNING_PATH,
    Permission.DELETE_LEARNING_PATH,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_ALL_ANALYTICS
  ],
  
  [UserRole.PARENT]: [
    Permission.READ_USER,
    Permission.UPDATE_USER,
    Permission.READ_CONTENT,
    Permission.READ_CLASS,
    Permission.READ_JOURNAL,
    Permission.READ_WELLNESS,
    Permission.READ_LEARNING_PATH,
    Permission.VIEW_ANALYTICS
  ],
  
  [UserRole.ADMIN]: [
    // Admins have all permissions
    ...Object.values(Permission)
  ]
};

// User context interface
export interface UserContext {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  department?: string;
  permissions: Permission[];
}

// Resource ownership interface
export interface ResourceOwnership {
  userId?: string;
  teacherId?: string;
  classId?: string;
  parentId?: string;
}

// Check if user has specific permission
export function hasPermission(user: UserContext, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

// Check if user has any of the specified permissions
export function hasAnyPermission(user: UserContext, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(user, permission));
}

// Check if user has all of the specified permissions
export function hasAllPermissions(user: UserContext, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(user, permission));
}

// Check resource ownership
export function checkResourceOwnership(
  user: UserContext,
  resource: ResourceOwnership,
  action: string
): boolean {
  // Admins can access everything
  if (user.role === UserRole.ADMIN) {
    return true;
  }
  
  // Check if user owns the resource
  if (resource.userId && resource.userId === user.id) {
    return true;
  }
  
  // Teachers can access their own classes and students
  if (user.role === UserRole.TEACHER && resource.teacherId === user.id) {
    return true;
  }
  
  return false;
}

// Mock functions for testing
export function createMockUser(role: UserRole, id: string = 'test-user'): UserContext {
  return {
    id,
    email: `${role}@test.com`,
    role,
    name: `Test ${role}`,
    permissions: ROLE_PERMISSIONS[role]
  };
}

export function createMockResource(ownership: Partial<ResourceOwnership>): ResourceOwnership {
  return {
    userId: ownership.userId,
    teacherId: ownership.teacherId,
    classId: ownership.classId,
    parentId: ownership.parentId
  };
}
