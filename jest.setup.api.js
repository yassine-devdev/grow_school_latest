// Jest setup for API tests
import { jest } from '@jest/globals';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.GEMINI_API_KEY = 'test-gemini-key';

// Mock PocketBase for testing
jest.mock('pocketbase', () => {
  return jest.fn().mockImplementation(() => ({
    collection: jest.fn().mockReturnValue({
      create: jest.fn(),
      getOne: jest.fn(),
      getFullList: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      authWithPassword: jest.fn()
    }),
    authStore: {
      isValid: false,
      model: null,
      clear: jest.fn()
    }
  }));
});

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue('Mock AI response')
        }
      })
    })
  }))
}));

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-message-id'
    })
  })
}));

// Global test utilities
global.mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'student'
};

global.mockRequest = (method = 'GET', body = null, headers = {}) => ({
  method,
  body: body ? JSON.stringify(body) : null,
  headers: {
    'content-type': 'application/json',
    ...headers
  }
});

global.mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

// Setup and teardown
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});
