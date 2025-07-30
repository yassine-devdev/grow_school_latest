/**
 * Setup file for component integration tests
 * Configures the test environment for real API integration testing
 */

// Import testing library extensions
import '@testing-library/jest-dom';

// Setup test environment
import { setupTestEnvironment, cleanupTestEnvironment } from './utils/component-test-utils';

// Global test setup
beforeAll(() => {
  setupTestEnvironment();
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
  
  console.log('🔧 Component integration test environment setup complete');
});

// Cleanup after each test
afterEach(() => {
  cleanupTestEnvironment();
});

// Global error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };

beforeEach(() => {
  // Suppress console output during tests unless explicitly enabled
  if (!process.env.ENABLE_TEST_LOGS) {
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    // Keep console.error for debugging
  }
});

afterEach(() => {
  // Restore console methods
  if (!process.env.ENABLE_TEST_LOGS) {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
  }
});

// Global fetch mock setup
global.fetch = jest.fn();

// Mock timers for tests that need them
jest.useFakeTimers();

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock Next.js router for components that use it
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

// Global test utilities
global.testUtils = {
  // Helper to wait for async operations
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Helper to create mock API responses
  createMockResponse: (data, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data)
  }),
  
  // Helper to create mock API errors
  createMockError: (message, status = 500) => ({
    ok: false,
    status,
    json: async () => ({ error: message }),
    text: async () => JSON.stringify({ error: message })
  })
};

// Custom matchers for integration tests
expect.extend({
  toHaveBeenCalledWithApiRequest(received, endpoint, method = 'GET', body = null) {
    const calls = received.mock.calls;
    const matchingCall = calls.find(call => {
      const [url, options] = call;
      const methodMatches = !options || options.method === method;
      const urlMatches = url === endpoint;
      const bodyMatches = !body || (options && options.body === JSON.stringify(body));
      
      return urlMatches && methodMatches && bodyMatches;
    });

    if (matchingCall) {
      return {
        message: () => `Expected fetch not to have been called with ${endpoint}`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected fetch to have been called with ${endpoint} (${method})${body ? ` and body ${JSON.stringify(body)}` : ''}`,
        pass: false,
      };
    }
  },

  toHaveAccessibleName(received, expectedName) {
    const accessibleName = received.getAttribute('aria-label') || 
                          received.textContent || 
                          received.getAttribute('title') ||
                          received.getAttribute('alt');
    
    const matches = accessibleName && accessibleName.includes(expectedName);
    
    if (matches) {
      return {
        message: () => `Expected element not to have accessible name containing "${expectedName}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected element to have accessible name containing "${expectedName}", but got "${accessibleName}"`,
        pass: false,
      };
    }
  },

  toBeKeyboardAccessible(received) {
    const isKeyboardAccessible = received.tabIndex >= 0 || 
                                ['button', 'input', 'select', 'textarea', 'a'].includes(received.tagName.toLowerCase()) ||
                                received.getAttribute('role') === 'button';
    
    if (isKeyboardAccessible) {
      return {
        message: () => `Expected element not to be keyboard accessible`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected element to be keyboard accessible (focusable via tab or interactive element)`,
        pass: false,
      };
    }
  }
});

console.log('✅ Component integration test setup complete');