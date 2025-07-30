import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/login/route';
import { 
  createMockRequest, 
  generateMockUser, 
  expectSuccessResponse, 
  expectErrorResponse 
} from '../../utils/test-helpers';

// Mock the database
jest.mock('@/backend/db', () => ({
  db: {
    authenticate: jest.fn(),
    isAuthenticated: false,
    currentUser: null
  }
}));

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = generateMockUser({
        email: 'test@example.com',
        role: 'student'
      });

      const { db } = require('@/backend/db');
      db.authenticate.mockResolvedValue({
        user: mockUser,
        token: 'mock-jwt-token'
      });

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.user).toMatchObject({
        email: 'test@example.com',
        role: 'student'
      });
      expect(responseData.token).toBe('mock-jwt-token');
      expect(db.authenticate).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should fail with invalid credentials', async () => {
      const { db } = require('@/backend/db');
      db.authenticate.mockRejectedValue(new Error('Invalid credentials'));

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/login', {
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Invalid credentials');
    });

    it('should fail with missing email', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/login', {
        password: 'password123'
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Email is required');
    });

    it('should fail with missing password', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/login', {
        email: 'test@example.com'
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Password is required');
    });

    it('should fail with invalid email format', async () => {
      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/login', {
        email: 'invalid-email',
        password: 'password123'
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Invalid email format');
    });

    it('should handle database connection errors', async () => {
      const { db } = require('@/backend/db');
      db.authenticate.mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Internal server error');
    });

    it('should handle malformed JSON request', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: 'invalid-json'
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Invalid JSON');
    });

    it('should rate limit excessive login attempts', async () => {
      const { db } = require('@/backend/db');
      db.authenticate.mockRejectedValue(new Error('Too many attempts'));

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      }, {
        'user-agent': 'rate-limit-test'
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(429);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Too many attempts');
    });

    it('should sanitize user data in response', async () => {
      const mockUser = generateMockUser({
        email: 'test@example.com',
        password: 'hashed-password', // This should not be returned
        role: 'student'
      });

      const { db } = require('@/backend/db');
      db.authenticate.mockResolvedValue({
        user: mockUser,
        token: 'mock-jwt-token'
      });

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.user).not.toHaveProperty('password');
      expect(responseData.user.email).toBe('test@example.com');
    });

    it('should handle different user roles correctly', async () => {
      const roles = ['student', 'teacher', 'parent', 'admin'];

      for (const role of roles) {
        const mockUser = generateMockUser({
          email: `${role}@example.com`,
          role
        });

        const { db } = require('@/backend/db');
        db.authenticate.mockResolvedValue({
          user: mockUser,
          token: 'mock-jwt-token'
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/auth/login', {
          email: `${role}@example.com`,
          password: 'password123'
        });

        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.user.role).toBe(role);
      }
    });
  });
});
