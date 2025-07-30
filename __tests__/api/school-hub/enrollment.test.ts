import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/enrollments/route';
import { 
  createMockRequest, 
  generateMockEnrollment, 
  expectSuccessResponse, 
  expectErrorResponse 
} from '../../utils/test-helpers';

// Mock the database
jest.mock('@/backend/db', () => ({
  db: {
    create: jest.fn(),
    getAll: jest.fn(),
    search: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

// Mock email service
jest.mock('@/lib/email-service', () => ({
  sendEnrollmentConfirmation: jest.fn().mockResolvedValue(true),
  sendEnrollmentNotification: jest.fn().mockResolvedValue(true)
}));

describe('/api/enrollments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/enrollments', () => {
    const validEnrollmentData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-0123',
      dateOfBirth: '2010-01-01',
      grade: '8',
      parentFirstName: 'Jane',
      parentLastName: 'Doe',
      parentEmail: 'jane.doe@example.com',
      parentPhone: '555-0124',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      emergencyContact: 'Emergency Contact',
      emergencyPhone: '555-0125'
    };

    it('should successfully create a new enrollment', async () => {
      const mockEnrollment = generateMockEnrollment(validEnrollmentData);

      const { db } = require('@/backend/db');
      db.create.mockResolvedValue(mockEnrollment);
      db.search.mockResolvedValue([]); // No existing enrollments

      const request = createMockRequest('POST', 'http://localhost:3000/api/enrollments', validEnrollmentData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.success).toBe(true);
      expect(responseData.enrollment).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        grade: '8'
      });
      expect(db.create).toHaveBeenCalledWith('enrollments', expect.objectContaining(validEnrollmentData));
    });

    it('should fail with missing required fields', async () => {
      const requiredFields = ['firstName', 'lastName', 'email', 'grade', 'parentEmail'];

      for (const field of requiredFields) {
        const incompleteData = { ...validEnrollmentData };
        delete incompleteData[field as keyof typeof incompleteData];

        const request = createMockRequest('POST', 'http://localhost:3000/api/enrollments', incompleteData);

        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(400);
        expect(responseData.success).toBe(false);
        expect(responseData.error).toContain(field);
      }
    });

    it('should validate email formats', async () => {
      const invalidEmailData = { 
        ...validEnrollmentData, 
        email: 'invalid-email',
        parentEmail: 'invalid-parent-email'
      };

      const request = createMockRequest('POST', 'http://localhost:3000/api/enrollments', invalidEmailData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Invalid email');
    });

    it('should validate grade levels', async () => {
      const invalidGradeData = { ...validEnrollmentData, grade: 'invalid-grade' };

      const request = createMockRequest('POST', 'http://localhost:3000/api/enrollments', invalidGradeData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Invalid grade');
    });

    it('should send confirmation emails after successful enrollment', async () => {
      const mockEnrollment = generateMockEnrollment(validEnrollmentData);

      const { db } = require('@/backend/db');
      db.create.mockResolvedValue(mockEnrollment);
      db.search.mockResolvedValue([]); // No existing enrollments

      const { sendEnrollmentConfirmation, sendEnrollmentNotification } = require('@/lib/email-service');

      const request = createMockRequest('POST', 'http://localhost:3000/api/enrollments', validEnrollmentData);

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(sendEnrollmentConfirmation).toHaveBeenCalledWith(
        'jane.doe@example.com',
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe'
        })
      );
      expect(sendEnrollmentNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe'
        })
      );
    });

    it('should handle duplicate enrollments', async () => {
      const existingEnrollment = generateMockEnrollment({ email: 'john.doe@example.com' });

      const { db } = require('@/backend/db');
      db.search.mockResolvedValue([existingEnrollment]);

      const request = createMockRequest('POST', 'http://localhost:3000/api/enrollments', validEnrollmentData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(409);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('already enrolled');
    });

    it('should validate age requirements', async () => {
      const tooYoungData = { 
        ...validEnrollmentData, 
        dateOfBirth: new Date().toISOString().split('T')[0] // Today's date
      };

      const request = createMockRequest('POST', 'http://localhost:3000/api/enrollments', tooYoungData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('age');
    });

    it('should handle database errors', async () => {
      const { db } = require('@/backend/db');
      db.search.mockResolvedValue([]); // No existing enrollments
      db.create.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('POST', 'http://localhost:3000/api/enrollments', validEnrollmentData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Internal server error');
    });
  });

  describe('GET /api/enrollments', () => {
    it('should retrieve all enrollments', async () => {
      const mockEnrollments = [
        generateMockEnrollment({ firstName: 'John', lastName: 'Doe' }),
        generateMockEnrollment({ firstName: 'Jane', lastName: 'Smith' })
      ];

      const { db } = require('@/backend/db');
      db.getAll.mockResolvedValue(mockEnrollments);

      const request = createMockRequest('GET', 'http://localhost:3000/api/enrollments');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.enrollments).toHaveLength(2);
      expect(responseData.enrollments[0]).toMatchObject({
        firstName: 'John',
        lastName: 'Doe'
      });
    });

    it('should filter enrollments by status', async () => {
      const pendingEnrollments = [
        generateMockEnrollment({ status: 'pending' }),
        generateMockEnrollment({ status: 'pending' })
      ];

      const { db } = require('@/backend/db');
      db.search.mockResolvedValue(pendingEnrollments);

      const request = createMockRequest('GET', 'http://localhost:3000/api/enrollments?status=pending');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.enrollments).toHaveLength(2);
      expect(db.search).toHaveBeenCalledWith('enrollments', 'status = "pending"', expect.any(Object));
    });

    it('should filter enrollments by grade', async () => {
      const gradeEnrollments = [
        generateMockEnrollment({ grade: '8' })
      ];

      const { db } = require('@/backend/db');
      db.search.mockResolvedValue(gradeEnrollments);

      const request = createMockRequest('GET', 'http://localhost:3000/api/enrollments?grade=8');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.enrollments).toHaveLength(1);
      expect(db.search).toHaveBeenCalledWith('enrollments', 'grade = "8"', expect.any(Object));
    });

    it('should paginate results', async () => {
      const mockEnrollments = Array.from({ length: 5 }, (_, i) => 
        generateMockEnrollment({ firstName: `Student${i}` })
      );

      const { db } = require('@/backend/db');
      db.getAll.mockResolvedValue(mockEnrollments.slice(0, 2)); // First page

      const request = createMockRequest('GET', 'http://localhost:3000/api/enrollments?page=1&limit=2');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.enrollments).toHaveLength(2);
      expect(responseData.pagination).toMatchObject({
        page: 1,
        limit: 2,
        hasMore: true
      });
    });

    it('should handle empty results', async () => {
      const { db } = require('@/backend/db');
      db.getAll.mockResolvedValue([]);

      const request = createMockRequest('GET', 'http://localhost:3000/api/enrollments');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.enrollments).toHaveLength(0);
    });

    it('should handle database errors', async () => {
      const { db } = require('@/backend/db');
      db.getAll.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('GET', 'http://localhost:3000/api/enrollments');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Internal server error');
    });
  });
});
