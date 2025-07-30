import {
  UserRole,
  Permission,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  checkResourceOwnership,
  createMockUser,
  createMockResource
} from '@/lib/authorization-test';

describe('Authorization System', () => {
  const mockStudentUser = createMockUser(UserRole.STUDENT, 'student-123');
  const mockTeacherUser = createMockUser(UserRole.TEACHER, 'teacher-123');
  const mockAdminUser = createMockUser(UserRole.ADMIN, 'admin-123');

  describe('Role Permissions', () => {
    it('should assign correct permissions to students', () => {
      const studentPermissions = ROLE_PERMISSIONS[UserRole.STUDENT];
      
      expect(studentPermissions).toContain(Permission.READ_USER);
      expect(studentPermissions).toContain(Permission.CREATE_JOURNAL);
      expect(studentPermissions).toContain(Permission.USE_AI_ASSISTANT);
      expect(studentPermissions).not.toContain(Permission.CREATE_CLASS);
      expect(studentPermissions).not.toContain(Permission.MANAGE_SYSTEM);
    });

    it('should assign correct permissions to teachers', () => {
      const teacherPermissions = ROLE_PERMISSIONS[UserRole.TEACHER];
      
      expect(teacherPermissions).toContain(Permission.CREATE_CLASS);
      expect(teacherPermissions).toContain(Permission.MANAGE_ENROLLMENT);
      expect(teacherPermissions).toContain(Permission.CREATE_LEARNING_PATH);
      expect(teacherPermissions).toContain(Permission.READ_ALL_WELLNESS);
      expect(teacherPermissions).not.toContain(Permission.MANAGE_SYSTEM);
    });

    it('should assign all permissions to admins', () => {
      const adminPermissions = ROLE_PERMISSIONS[UserRole.ADMIN];
      const allPermissions = Object.values(Permission);
      
      expect(adminPermissions).toEqual(expect.arrayContaining(allPermissions));
    });

    it('should assign limited permissions to parents', () => {
      const parentPermissions = ROLE_PERMISSIONS[UserRole.PARENT];
      
      expect(parentPermissions).toContain(Permission.READ_USER);
      expect(parentPermissions).toContain(Permission.READ_JOURNAL);
      expect(parentPermissions).toContain(Permission.READ_WELLNESS);
      expect(parentPermissions).not.toContain(Permission.CREATE_CLASS);
      expect(parentPermissions).not.toContain(Permission.USE_AI_ASSISTANT);
    });
  });

  describe('Permission Checking', () => {
    it('should correctly check single permissions', () => {
      expect(hasPermission(mockStudentUser, Permission.CREATE_JOURNAL)).toBe(true);
      expect(hasPermission(mockStudentUser, Permission.CREATE_CLASS)).toBe(false);
      
      expect(hasPermission(mockTeacherUser, Permission.CREATE_CLASS)).toBe(true);
      expect(hasPermission(mockTeacherUser, Permission.MANAGE_SYSTEM)).toBe(false);
      
      expect(hasPermission(mockAdminUser, Permission.MANAGE_SYSTEM)).toBe(true);
    });

    it('should correctly check any permissions', () => {
      const permissions = [Permission.CREATE_CLASS, Permission.MANAGE_ENROLLMENT];
      
      expect(hasAnyPermission(mockStudentUser, permissions)).toBe(false);
      expect(hasAnyPermission(mockTeacherUser, permissions)).toBe(true);
      expect(hasAnyPermission(mockAdminUser, permissions)).toBe(true);
    });

    it('should correctly check all permissions', () => {
      const permissions = [Permission.READ_USER, Permission.CREATE_JOURNAL];
      const restrictedPermissions = [Permission.CREATE_CLASS, Permission.MANAGE_SYSTEM];
      
      expect(hasAllPermissions(mockStudentUser, permissions)).toBe(true);
      expect(hasAllPermissions(mockStudentUser, restrictedPermissions)).toBe(false);
      
      expect(hasAllPermissions(mockAdminUser, restrictedPermissions)).toBe(true);
    });
  });

  describe('Resource Ownership', () => {
    it('should allow users to access their own resources', () => {
      const resource = createMockResource({ userId: 'student-123' });

      expect(checkResourceOwnership(mockStudentUser, resource, 'read')).toBe(true);
      expect(checkResourceOwnership(mockTeacherUser, resource, 'read')).toBe(false);
    });

    it('should allow teachers to access their class resources', () => {
      const resource = createMockResource({ teacherId: 'teacher-123' });

      expect(checkResourceOwnership(mockTeacherUser, resource, 'read')).toBe(true);
      expect(checkResourceOwnership(mockStudentUser, resource, 'read')).toBe(false);
    });

    it('should allow admins to access all resources', () => {
      const userResource = createMockResource({ userId: 'student-123' });
      const teacherResource = createMockResource({ teacherId: 'teacher-123' });

      expect(checkResourceOwnership(mockAdminUser, userResource, 'read')).toBe(true);
      expect(checkResourceOwnership(mockAdminUser, teacherResource, 'read')).toBe(true);
    });
  });

  describe('Role Hierarchy', () => {
    it('should respect role hierarchy for permissions', () => {
      // Students have basic permissions
      expect(mockStudentUser.permissions.length).toBeLessThan(mockTeacherUser.permissions.length);
      
      // Teachers have more permissions than students
      expect(mockTeacherUser.permissions.length).toBeLessThan(mockAdminUser.permissions.length);
      
      // Admins have all permissions
      expect(mockAdminUser.permissions.length).toBe(Object.values(Permission).length);
    });

    it('should include student permissions in teacher permissions', () => {
      const studentPermissions = ROLE_PERMISSIONS[UserRole.STUDENT];
      const teacherPermissions = ROLE_PERMISSIONS[UserRole.TEACHER];
      
      // Most student permissions should be included in teacher permissions
      const commonPermissions = studentPermissions.filter(p => 
        teacherPermissions.includes(p)
      );
      
      expect(commonPermissions.length).toBeGreaterThan(studentPermissions.length * 0.7);
    });
  });

  describe('Security Validations', () => {
    it('should prevent privilege escalation', () => {
      // Students cannot create classes
      expect(hasPermission(mockStudentUser, Permission.CREATE_CLASS)).toBe(false);
      
      // Students cannot manage system
      expect(hasPermission(mockStudentUser, Permission.MANAGE_SYSTEM)).toBe(false);
      
      // Teachers cannot manage system
      expect(hasPermission(mockTeacherUser, Permission.MANAGE_SYSTEM)).toBe(false);
    });

    it('should enforce data isolation', () => {
      const otherUserResource = createMockResource({ userId: 'other-user-123' });

      // Users cannot access other users' resources
      expect(checkResourceOwnership(mockStudentUser, otherUserResource, 'read')).toBe(false);
      expect(checkResourceOwnership(mockTeacherUser, otherUserResource, 'read')).toBe(false);
    });

    it('should validate critical permissions', () => {
      const criticalPermissions = [
        Permission.DELETE_USER,
        Permission.MANAGE_SYSTEM,
        Permission.VIEW_LOGS
      ];
      
      // Only admins should have critical permissions
      criticalPermissions.forEach(permission => {
        expect(hasPermission(mockStudentUser, permission)).toBe(false);
        expect(hasPermission(mockTeacherUser, permission)).toBe(false);
        expect(hasPermission(mockAdminUser, permission)).toBe(true);
      });
    });
  });

  describe('AI Service Permissions', () => {
    it('should allow students and teachers to use AI services', () => {
      const aiPermissions = [
        Permission.USE_AI_ASSISTANT,
        Permission.USE_AI_FEEDBACK,
        Permission.USE_AI_BRAINSTORM
      ];
      
      aiPermissions.forEach(permission => {
        expect(hasPermission(mockStudentUser, permission)).toBe(true);
        expect(hasPermission(mockTeacherUser, permission)).toBe(true);
        expect(hasPermission(mockAdminUser, permission)).toBe(true);
      });
    });

    it('should restrict AI services for parents', () => {
      const parentUser = createMockUser(UserRole.PARENT, 'parent-123');

      const aiPermissions = [
        Permission.USE_AI_ASSISTANT,
        Permission.USE_AI_FEEDBACK,
        Permission.USE_AI_BRAINSTORM
      ];
      
      aiPermissions.forEach(permission => {
        expect(hasPermission(parentUser, permission)).toBe(false);
      });
    });
  });

  describe('Content Management Permissions', () => {
    it('should allow appropriate content management', () => {
      // Students can create and manage their own content
      expect(hasPermission(mockStudentUser, Permission.CREATE_CONTENT)).toBe(true);
      expect(hasPermission(mockStudentUser, Permission.UPDATE_CONTENT)).toBe(true);
      
      // Teachers can create and manage content
      expect(hasPermission(mockTeacherUser, Permission.CREATE_CONTENT)).toBe(true);
      expect(hasPermission(mockTeacherUser, Permission.UPDATE_CONTENT)).toBe(true);
      expect(hasPermission(mockTeacherUser, Permission.DELETE_CONTENT)).toBe(true);
    });

    it('should restrict learning path creation', () => {
      // Only teachers and admins can create learning paths
      expect(hasPermission(mockStudentUser, Permission.CREATE_LEARNING_PATH)).toBe(false);
      expect(hasPermission(mockTeacherUser, Permission.CREATE_LEARNING_PATH)).toBe(true);
      expect(hasPermission(mockAdminUser, Permission.CREATE_LEARNING_PATH)).toBe(true);
    });
  });
});
