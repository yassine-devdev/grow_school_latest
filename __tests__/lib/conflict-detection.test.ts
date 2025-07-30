import { ConflictDetector } from '@/lib/conflict-detection';

describe('ConflictDetector', () => {
  let detector: ConflictDetector;

  beforeEach(() => {
    detector = new ConflictDetector();
  });

  afterEach(() => {
    detector.clearConflicts();
  });

  describe('Version Conflict Detection', () => {
    it('should detect version conflicts', () => {
      const conflict = detector.detectVersionConflict(
        'doc1',
        1,
        2,
        { content: 'local version' },
        { content: 'server version' }
      );

      expect(conflict).toBeTruthy();
      expect(conflict?.type).toBe('version');
      expect(conflict?.severity).toBe('high');
      expect(conflict?.description).toContain('Version mismatch');
    });

    it('should not detect conflict when versions match', () => {
      const conflict = detector.detectVersionConflict(
        'doc1',
        2,
        2,
        { content: 'same version' },
        { content: 'same version' }
      );

      expect(conflict).toBeNull();
    });
  });

  describe('Concurrent Edit Detection', () => {
    it('should detect concurrent edits within time window', () => {
      const recentTime = new Date(Date.now() - 10000).toISOString(); // 10 seconds ago

      const conflict = detector.detectConcurrentEdit(
        'doc1',
        'title',
        'Local Title',
        'Server Title',
        recentTime
      );

      expect(conflict).toBeTruthy();
      expect(conflict?.type).toBe('concurrent_edit');
      expect(conflict?.severity).toBe('medium');
    });

    it('should not detect conflict for old changes', () => {
      const oldTime = new Date(Date.now() - 60000).toISOString(); // 1 minute ago

      const conflict = detector.detectConcurrentEdit(
        'doc1',
        'title',
        'Local Title',
        'Server Title',
        oldTime
      );

      expect(conflict).toBeNull();
    });

    it('should not detect conflict when values are same', () => {
      const recentTime = new Date(Date.now() - 10000).toISOString();

      const conflict = detector.detectConcurrentEdit(
        'doc1',
        'title',
        'Same Title',
        'Same Title',
        recentTime
      );

      expect(conflict).toBeNull();
    });
  });

  describe('Duplicate Detection', () => {
    it('should detect duplicates based on unique fields', () => {
      const existingRecords = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
      ];

      const newRecord = { name: 'john doe', email: 'different@example.com' };

      const conflict = detector.detectDuplicate(
        'users',
        newRecord,
        existingRecords,
        ['name']
      );

      expect(conflict).toBeTruthy();
      expect(conflict?.type).toBe('duplicate');
      expect(conflict?.description).toContain('Duplicate users detected');
    });

    it('should not detect duplicates when no matches', () => {
      const existingRecords = [
        { id: '1', name: 'John Doe', email: 'john@example.com' }
      ];

      const newRecord = { name: 'Jane Smith', email: 'jane@example.com' };

      const conflict = detector.detectDuplicate(
        'users',
        newRecord,
        existingRecords,
        ['name', 'email']
      );

      expect(conflict).toBeNull();
    });
  });

  describe('Constraint Violation Detection', () => {
    it('should detect capacity constraint violations', () => {
      const data = {
        enrollments: new Array(25).fill({}), // 25 enrollments
        capacity: 20
      };

      const constraints = { capacity: 20 };

      const conflict = detector.detectConstraintViolation(
        'class',
        'class1',
        data,
        constraints
      );

      expect(conflict).toBeTruthy();
      expect(conflict?.type).toBe('constraint');
      expect(conflict?.description).toContain('exceeds capacity');
    });

    it('should detect date constraint violations', () => {
      const data = {};
      const constraints = {
        startDate: '2024-12-31',
        endDate: '2024-01-01'
      };

      const conflict = detector.detectConstraintViolation(
        'event',
        'event1',
        data,
        constraints
      );

      expect(conflict).toBeTruthy();
      expect(conflict?.description).toContain('Start date must be before end date');
    });

    it('should not detect violations when constraints are met', () => {
      const data = {
        enrollments: new Array(15).fill({}),
        capacity: 20
      };

      const constraints = { capacity: 20 };

      const conflict = detector.detectConstraintViolation(
        'class',
        'class1',
        data,
        constraints
      );

      expect(conflict).toBeNull();
    });
  });

  describe('Permission Conflict Detection', () => {
    it('should detect missing permissions', () => {
      const userPermissions = ['read', 'write'];
      const requiredPermissions = ['read', 'write', 'admin'];

      const conflict = detector.detectPermissionConflict(
        'document',
        'doc1',
        'delete',
        userPermissions,
        requiredPermissions
      );

      expect(conflict).toBeTruthy();
      expect(conflict?.type).toBe('permission');
      expect(conflict?.severity).toBe('critical');
      expect(conflict?.description).toContain('Missing permissions');
    });

    it('should not detect conflict when permissions are sufficient', () => {
      const userPermissions = ['read', 'write', 'admin'];
      const requiredPermissions = ['read', 'write'];

      const conflict = detector.detectPermissionConflict(
        'document',
        'doc1',
        'edit',
        userPermissions,
        requiredPermissions
      );

      expect(conflict).toBeNull();
    });
  });

  describe('Conflict Management', () => {
    it('should track conflicts', () => {
      detector.detectVersionConflict('doc1', 1, 2, {}, {});
      detector.detectDuplicate('users', { name: 'John' }, [{ name: 'john' }], ['name']);

      const conflicts = detector.getConflicts();
      expect(conflicts).toHaveLength(2);
    });

    it('should filter conflicts by type', () => {
      detector.detectVersionConflict('doc1', 1, 2, {}, {});
      detector.detectDuplicate('users', { name: 'John' }, [{ name: 'john' }], ['name']);

      const versionConflicts = detector.getConflictsByType('version');
      const duplicateConflicts = detector.getConflictsByType('duplicate');

      expect(versionConflicts).toHaveLength(1);
      expect(duplicateConflicts).toHaveLength(1);
    });

    it('should filter conflicts by severity', () => {
      detector.detectVersionConflict('doc1', 1, 2, {}, {}); // high severity
      detector.detectConcurrentEdit('doc1', 'field', 'a', 'b', new Date().toISOString()); // medium severity

      const highSeverity = detector.getConflictsBySeverity('high');
      const mediumSeverity = detector.getConflictsBySeverity('medium');

      expect(highSeverity).toHaveLength(1);
      expect(mediumSeverity).toHaveLength(1);
    });

    it('should resolve conflicts', () => {
      const conflict = detector.detectVersionConflict('doc1', 1, 2, {}, {});
      expect(detector.getConflicts()).toHaveLength(1);

      const resolved = detector.resolveConflict(conflict!.id, {
        action: 'merge',
        reason: 'Manual resolution'
      });

      expect(resolved).toBe(true);
      expect(detector.getConflicts()).toHaveLength(0);
    });

    it('should provide conflict statistics', () => {
      detector.detectVersionConflict('doc1', 1, 2, {}, {});
      detector.detectDuplicate('users', { name: 'John' }, [{ name: 'john' }], ['name']);
      detector.detectPermissionConflict('doc', 'doc1', 'delete', ['read'], ['read', 'admin']);

      const stats = detector.getConflictStats();

      expect(stats.total).toBe(3);
      expect(stats.byType.version).toBe(1);
      expect(stats.byType.duplicate).toBe(1);
      expect(stats.byType.permission).toBe(1);
      expect(stats.bySeverity.high).toBe(1);
      expect(stats.bySeverity.medium).toBe(1);
      expect(stats.bySeverity.critical).toBe(1);
    });

    it('should notify listeners of new conflicts', (done) => {
      const listener = jest.fn((conflict) => {
        expect(conflict.type).toBe('version');
        done();
      });

      detector.onConflict(listener);
      detector.detectVersionConflict('doc1', 1, 2, {}, {});
    });

    it('should clear all conflicts', () => {
      detector.detectVersionConflict('doc1', 1, 2, {}, {});
      detector.detectDuplicate('users', { name: 'John' }, [{ name: 'john' }], ['name']);

      expect(detector.getConflicts()).toHaveLength(2);

      detector.clearConflicts();
      expect(detector.getConflicts()).toHaveLength(0);
    });
  });
});
