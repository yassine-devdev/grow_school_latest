// Jest setup for Node.js environment (API tests)

// Ensure NODE_ENV is set to 'test' for all tests
process.env.NODE_ENV = 'test';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.GEMINI_API_KEY = 'test-gemini-key';

// Polyfill Web APIs for Node.js environment
const { TextEncoder, TextDecoder } = require('util');
require('whatwg-fetch');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

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

// Mock console methods to reduce test noise
const originalConsole = { ...console };

beforeEach(() => {
  // Suppress console output during tests unless explicitly enabled
  if (!process.env.ENABLE_TEST_LOGS) {
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  }
});

afterEach(() => {
  // Restore console methods
  if (!process.env.ENABLE_TEST_LOGS) {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  }
});