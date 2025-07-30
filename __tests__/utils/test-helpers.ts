import { NextRequest, NextResponse } from 'next/server';

// Mock data generators
export const generateMockUser = (overrides = {}) => ({
  id: 'test-user-' + Math.random().toString(36).substring(2, 11),
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'student',
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  ...overrides
});

export const generateMockJournalEntry = (overrides: Record<string, unknown> = {}) => ({
  id: 'journal-' + Math.random().toString(36).substring(2, 11),
  userId: 'test-user-id',
  title: 'Test Journal Entry',
  content: 'This is a test journal entry content.',
  mood: 'happy',
  tags: ['test', 'journal'],
  isPrivate: true,
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  ...overrides
});

export const generateMockCalendarEvent = (overrides: Record<string, unknown> = {}) => ({
  id: 'event-' + Math.random().toString(36).substring(2, 11),
  title: 'Test Event',
  description: 'Test event description',
  start: new Date().toISOString(),
  end: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
  allDay: false,
  location: 'Test Location',
  attendees: ['test@example.com'],
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  ...overrides
});

export const generateMockCreativeProject = (overrides: Record<string, unknown> = {}) => ({
  id: 'project-' + Math.random().toString(36).substring(2, 11),
  userId: 'test-user-id',
  title: 'Test Creative Project',
  description: 'Test project description',
  type: 'writing',
  status: 'planning',
  content: 'Test project content',
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  ...overrides
});

export const generateMockLearningPath = (overrides: Record<string, unknown> = {}) => ({
  id: 'path-' + Math.random().toString(36).substring(2, 11),
  title: 'Test Learning Path',
  description: 'Test learning path description',
  difficulty: 'Intermediate',
  estimatedTime: '8 weeks',
  subjects: ['Mathematics', 'Science'],
  modules: [],
  progress: 0,
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  ...overrides
});

export const generateMockMoodEntry = (overrides: Record<string, unknown> = {}) => ({
  id: 'mood-' + Math.random().toString(36).substring(2, 11),
  userId: 'test-user-id',
  mood: 'happy',
  focus: 'high',
  energy: 'high',
  stress: 'low',
  notes: 'Feeling great today!',
  tags: ['positive'],
  created: new Date().toISOString(),
  ...overrides
});

export const generateMockEnrollment = (overrides: Record<string, unknown> = {}) => ({
  id: 'enrollment-' + Math.random().toString(36).substring(2, 11),
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
  emergencyPhone: '555-0125',
  status: 'pending',
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  ...overrides
});

// Request/Response helpers
export const createMockRequest = (
  method: string = 'GET',
  url: string = 'http://localhost:3000/api/test',
  body?: unknown,
  headers: Record<string, string> = {}
): NextRequest => {
  const request = new NextRequest(url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  return request;
};

export const createMockResponse = () => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    headers: new Map(),
    setHeader: jest.fn(),
    getHeader: jest.fn()
  };

  return response;
};

// Database mock helpers
export const mockDatabaseSuccess = (returnValue: unknown) => {
  const mockDb = {
    create: jest.fn().mockResolvedValue(returnValue),
    getById: jest.fn().mockResolvedValue(returnValue),
    getAll: jest.fn().mockResolvedValue([returnValue]),
    search: jest.fn().mockResolvedValue([returnValue]),
    update: jest.fn().mockResolvedValue(returnValue),
    delete: jest.fn().mockResolvedValue(undefined)
  };
  return mockDb;
};

export const mockDatabaseError = (error: Error) => {
  const mockDb = {
    create: jest.fn().mockRejectedValue(error),
    getById: jest.fn().mockRejectedValue(error),
    getAll: jest.fn().mockRejectedValue(error),
    search: jest.fn().mockRejectedValue(error),
    update: jest.fn().mockRejectedValue(error),
    delete: jest.fn().mockRejectedValue(error)
  };
  return mockDb;
};

// AI service mock helpers
export const mockAISuccess = (response: string) => ({
  generateContent: jest.fn().mockResolvedValue({
    response: {
      text: jest.fn().mockReturnValue(response)
    }
  })
});

export const mockAIError = (error: Error) => ({
  generateContent: jest.fn().mockRejectedValue(error)
});

// Validation helpers
interface TestResponse {
  status: number;
  body: {
    error?: string;
    [key: string]: unknown;
  };
}

export const expectValidationError = (response: TestResponse, field: string) => {
  expect(response.status).toBe(400);
  expect(response.body.error).toContain(field);
};

export const expectSuccessResponse = (response: TestResponse, expectedData?: Record<string, unknown>) => {
  expect(response.status).toBe(200);
  if (expectedData) {
    expect(response.body).toMatchObject(expectedData);
  }
};

export const expectErrorResponse = (response: TestResponse, expectedStatus: number, expectedMessage?: string) => {
  expect(response.status).toBe(expectedStatus);
  if (expectedMessage) {
    expect(response.body.error).toContain(expectedMessage);
  }
};

// Test data cleanup
export const cleanupTestData = async () => {
  // In a real implementation, this would clean up test data from the database
  console.log('Cleaning up test data...');
};

// Time helpers
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getDateString = (daysFromNow: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

// Authentication helpers
export const mockAuthenticatedUser = (user = generateMockUser()) => {
  return {
    user,
    token: 'mock-jwt-token',
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
};

export const createAuthHeaders = (token: string = 'mock-jwt-token') => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});

// Error simulation helpers
export const simulateNetworkError = () => {
  throw new Error('Network error');
};

export const simulateTimeoutError = () => {
  throw new Error('Request timeout');
};

interface ValidationError extends Error {
  status: number;
}

export const simulateValidationError = (field: string) => {
  const error = new Error(`Validation failed for field: ${field}`) as ValidationError;
  error.status = 400;
  throw error;
};

// NextResponse helper to make the import useful
export const createTestResponse = (data: unknown, status: number = 200) => {
  return NextResponse.json(data, { status });
};
