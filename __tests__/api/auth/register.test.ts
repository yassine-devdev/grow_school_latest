import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/register/route';
import { 
  createMockRequest, 
  generateMockUser, 
  expectSuccessResponse, 
  expectErrorResponse 
} from '../../utils/test-helpers';

// Mock the database
jest.mock('@/backend/db', () => ({
  db: {
    create: jest.fn(),
    search: jest.fn()
  }
}));

// Mock email service
jest.mock('@/lib/email-service', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(true)
}));

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    const validRegistrationData = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student'
    };

    it('should successfully register a new user', async () => {
      const mockUser = generateMockUser(validRegistrationData);

      const { db } = require('@/backend/db');
      db.search.mockResolvedValue([]); // No existing user
      db.create.mockResolvedValue(mockUser);

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/register', validRegistrationData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.success).toBe(true);
      expect(responseData.user).toMatchObject({
        email: 'newuser@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      });
      expect(responseData.user).not.toHaveProperty('password');
      expect(db.create).toHaveBeenCalledWith('users', expect.objectContaining({
        email: 'newuser@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      }));
    });

    it('should fail when user already exists', async () => {
      const existingUser = generateMockUser({ email: 'newuser@example.com' });

      const { db } = require('@/backend/db');
      db.search.mockResolvedValue([existingUser]); // User exists

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/register', validRegistrationData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(409);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('User already exists');
      expect(db.create).not.toHaveBeenCalled();
    });

    it('should fail with missing required fields', async () => {
      const testCases = [
        { field: 'email', data: { ...validRegistrationData, email: undefined } },
        { field: 'password', data: { ...validRegistrationData, password: undefined } },
        { field: 'firstName', data: { ...validRegistrationData, firstName: undefined } },
        { field: 'lastName', data: { ...validRegistrationData, lastName: undefined } }
      ];

      for (const testCase of testCases) {
        const request = createMockRequest('POST', 'http://localhost:3000/api/auth/register', testCase.data);

        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(400);
        expect(responseData.success).toBe(false);
        expect(responseData.error).toContain(testCase.field);
      }
    });

    it('should fail with invalid email format', async () => {
      const invalidEmailData = { ...validRegistrationData, email: 'invalid-email' };

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/register', invalidEmailData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Invalid email format');
    });

    it('should fail with weak password', async () => {
      const weakPasswordData = { ...validRegistrationData, password: '123' };

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/register', weakPasswordData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Password must be at least 8 characters');
    });

    it('should fail with invalid role', async () => {
      const invalidRoleData = { ...validRegistrationData, role: 'invalid-role' };

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/register', invalidRoleData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Invalid role');
    });

    it('should hash password before storing', async () => {
      const { db } = require('@/backend/db');
      db.search.mockResolvedValue([]);
      db.create.mockResolvedValue(generateMockUser(validRegistrationData));

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/register', validRegistrationData);

      await POST(request);

      expect(db.create).toHaveBeenCalledWith('users', expect.objectContaining({
        password: expect.not.stringMatching('password123') // Should be hashed
      }));
    });

    it('should send welcome email after successful registration', async () => {
      const mockUser = generateMockUser(validRegistrationData);

      const { db } = require('@/backend/db');
      db.search.mockResolvedValue([]);
      db.create.mockResolvedValue(mockUser);

      const { sendWelcomeEmail } = require('@/lib/email-service');

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/register', validRegistrationData);

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(sendWelcomeEmail).toHaveBeenCalledWith(
        'newuser@example.com',
        'John Doe'
      );
    });

    it('should handle database errors gracefully', async () => {
      const { db } = require('@/backend/db');
      db.search.mockResolvedValue([]);
      db.create.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/register', validRegistrationData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Internal server error');
    });

    it('should handle email service failures gracefully', async () => {
      const mockUser = generateMockUser(validRegistrationData);

      const { db } = require('@/backend/db');
      db.search.mockResolvedValue([]);
      db.create.mockResolvedValue(mockUser);

      const { sendWelcomeEmail } = require('@/lib/email-service');
      sendWelcomeEmail.mockRejectedValue(new Error('Email service error'));

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/register', validRegistrationData);

      const response = await POST(request);
      const responseData = await response.json();

      // Registration should still succeed even if email fails
      expect(response.status).toBe(201);
      expect(responseData.success).toBe(true);
      expect(responseData.user).toMatchObject({
        email: 'newuser@example.com'
      });
    });

    it('should validate all supported roles', async () => {
      const validRoles = ['student', 'teacher', 'parent', 'admin'];

      for (const role of validRoles) {
        const roleData = { ...validRegistrationData, email: `${role}@example.com`, role };
        const mockUser = generateMockUser(roleData);

        const { db } = require('@/backend/db');
        db.search.mockResolvedValue([]);
        db.create.mockResolvedValue(mockUser);

        const request = createMockRequest('POST', 'http://localhost:3000/api/auth/register', roleData);

        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(201);
        expect(responseData.user.role).toBe(role);
      }
    });

    it('should trim whitespace from input fields', async () => {
      const dataWithWhitespace = {
        ...validRegistrationData,
        email: '  newuser@example.com  ',
        firstName: '  John  ',
        lastName: '  Doe  '
      };

      const { db } = require('@/backend/db');
      db.search.mockResolvedValue([]);
      db.create.mockResolvedValue(generateMockUser(validRegistrationData));

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/register', dataWithWhitespace);

      await POST(request);

      expect(db.create).toHaveBeenCalledWith('users', expect.objectContaining({
        email: 'newuser@example.com',
        firstName: 'John',
        lastName: 'Doe'
      }));
    });
  });
});
