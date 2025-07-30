/**
 * Utilities for component integration testing
 * Provides helpers for testing components with real API calls
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateMockUser } from '../../utils/test-helpers';

// Mock providers for testing
export const MockToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div data-testid="mock-toast-provider">{children}</div>;
};

export const MockQueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div data-testid="mock-query-provider">{children}</div>;
};

export const MockAuthProvider: React.FC<{ 
  children: React.ReactNode;
  user?: any;
}> = ({ children, user }) => {
  return (
    <div data-testid="mock-auth-provider" data-user={user?.id}>
      {children}
    </div>
  );
};

export const MockStoreProvider: React.FC<{ 
  children: React.ReactNode;
  initialState?: any;
}> = ({ children, initialState }) => {
  return (
    <div data-testid="mock-store-provider" data-initial-state={JSON.stringify(initialState)}>
      {children}
    </div>
  );
};

// Combined test providers
export const AllTestProviders: React.FC<{
  children: React.ReactNode;
  user?: any;
  initialState?: any;
}> = ({ children, user, initialState }) => {
  return (
    <MockQueryProvider>
      <MockAuthProvider user={user}>
        <MockStoreProvider initialState={initialState}>
          <MockToastProvider>
            {children}
          </MockToastProvider>
        </MockStoreProvider>
      </MockAuthProvider>
    </MockQueryProvider>
  );
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: any;
  initialState?: any;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { user = generateMockUser(), initialState, ...renderOptions } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllTestProviders user={user} initialState={initialState}>
      {children}
    </AllTestProviders>
  );

  return {
    user: userEvent.setup(),
    mockUser: user,
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  };
}

// API mocking utilities
export interface MockApiResponse {
  ok: boolean;
  status: number;
  json: () => Promise<any>;
  text?: () => Promise<string>;
}

export function createMockApiResponse(
  data: any,
  status: number = 200,
  ok: boolean = true
): MockApiResponse {
  return {
    ok,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data)
  };
}

export function createMockApiError(
  error: string,
  status: number = 500
): MockApiResponse {
  return {
    ok: false,
    status,
    json: async () => ({ error }),
    text: async () => JSON.stringify({ error })
  };
}

// Real API call helpers
export async function makeRealApiCall(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  headers: Record<string, string> = {}
) {
  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Component interaction helpers
export async function fillFormField(
  user: ReturnType<typeof userEvent.setup>,
  fieldLabel: string | RegExp,
  value: string
) {
  const field = document.querySelector(`[aria-label*="${fieldLabel}"], [placeholder*="${fieldLabel}"]`) as HTMLElement;
  if (field) {
    await user.clear(field);
    await user.type(field, value);
  }
}

export async function selectOption(
  user: ReturnType<typeof userEvent.setup>,
  buttonName: string | RegExp
) {
  const button = document.querySelector(`[role="button"][aria-label*="${buttonName}"]`) as HTMLElement;
  if (button) {
    await user.click(button);
  }
}

// Accessibility testing helpers
export function checkAccessibilityAttributes(element: HTMLElement) {
  const checks = {
    hasRole: element.hasAttribute('role'),
    hasAriaLabel: element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby'),
    hasTabIndex: element.hasAttribute('tabindex') || element.tagName.toLowerCase() === 'button' || element.tagName.toLowerCase() === 'input',
    isKeyboardAccessible: element.tabIndex >= 0 || ['button', 'input', 'select', 'textarea', 'a'].includes(element.tagName.toLowerCase())
  };

  return checks;
}

export function simulateScreenReader(element: HTMLElement) {
  const ariaLabel = element.getAttribute('aria-label');
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  const textContent = element.textContent;
  
  let announcement = '';
  
  if (ariaLabel) {
    announcement = ariaLabel;
  } else if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy);
    announcement = labelElement?.textContent || '';
  } else {
    announcement = textContent || '';
  }
  
  return {
    announcement: announcement.trim(),
    role: element.getAttribute('role') || element.tagName.toLowerCase(),
    isInteractive: ['button', 'input', 'select', 'textarea', 'a'].includes(element.tagName.toLowerCase()) || element.hasAttribute('role')
  };
}

// Error simulation helpers
export function simulateNetworkError() {
  return Promise.reject(new Error('Network error'));
}

export function simulateTimeoutError() {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), 100);
  });
}

export function simulateSlowResponse<T>(data: T, delay: number = 1000): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}

// Retry mechanism testing
export function createRetryableFunction<T>(
  successValue: T,
  failureCount: number = 1,
  errorMessage: string = 'Temporary failure'
) {
  let callCount = 0;
  
  return jest.fn().mockImplementation(() => {
    callCount++;
    if (callCount <= failureCount) {
      return Promise.reject(new Error(errorMessage));
    }
    return Promise.resolve(successValue);
  });
}

// Optimistic update testing helpers
export function createOptimisticUpdateScenario<T>(
  optimisticValue: T,
  finalValue: T,
  delay: number = 500
) {
  return {
    optimisticValue,
    finalValue,
    execute: () => simulateSlowResponse(finalValue, delay)
  };
}

// Conflict resolution testing
export interface ConflictScenario<T> {
  localValue: T;
  serverValue: T;
  resolvedValue: T;
}

export function createConflictScenario<T>(
  localValue: T,
  serverValue: T,
  resolvedValue: T
): ConflictScenario<T> {
  return {
    localValue,
    serverValue,
    resolvedValue
  };
}

// Performance testing helpers
export function measureRenderTime(renderFn: () => void): number {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
}

export function createPerformanceObserver(callback: (entries: PerformanceEntry[]) => void) {
  if (typeof PerformanceObserver !== 'undefined') {
    const observer = new PerformanceObserver((list) => {
      callback(list.getEntries());
    });
    return observer;
  }
  return null;
}

// Test data generators for integration tests
export function generateTestScenarios<T>(
  baseData: T,
  variations: Partial<T>[]
): T[] {
  return variations.map(variation => ({ ...baseData, ...variation }));
}

// Cleanup utilities
export function cleanupTestEnvironment() {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clear localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
  
  // Clear sessionStorage
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }
  
  // Reset fetch mock
  if (global.fetch && jest.isMockFunction(global.fetch)) {
    (global.fetch as jest.Mock).mockReset();
  }
}

// Test environment setup
export function setupTestEnvironment() {
  // Mock browser APIs
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  };

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  };

  // Mock clipboard API
  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn().mockResolvedValue(undefined),
      readText: jest.fn().mockResolvedValue('')
    }
  });

  // Mock Web Share API
  Object.assign(navigator, {
    share: jest.fn().mockResolvedValue(undefined)
  });
}

// Test assertion helpers
export function expectApiCallToHaveBeenMade(
  endpoint: string,
  method: string = 'GET',
  body?: any
) {
  expect(global.fetch).toHaveBeenCalledWith(
    endpoint,
    expect.objectContaining({
      method,
      headers: expect.objectContaining({
        'Content-Type': 'application/json'
      }),
      ...(body && { body: JSON.stringify(body) })
    })
  );
}

export function expectToastToHaveBeenCalled(
  mockToast: jest.Mock,
  type: 'success' | 'error' | 'warning' | 'info',
  title: string,
  description?: string
) {
  expect(mockToast).toHaveBeenCalledWith(
    expect.objectContaining({
      type,
      title,
      ...(description && { description })
    })
  );
}

export function expectLoadingStateToBeShown(container: HTMLElement) {
  const loadingIndicators = [
    container.querySelector('[data-testid="loading"]'),
    container.querySelector('.animate-spin'),
    container.querySelector('[aria-label*="loading"]'),
    container.querySelector('[disabled]')
  ].filter(Boolean);

  expect(loadingIndicators.length).toBeGreaterThan(0);
}

export function expectErrorStateToBeShown(container: HTMLElement, errorMessage?: string) {
  const errorElements = [
    container.querySelector('[data-testid="error"]'),
    container.querySelector('[role="alert"]'),
    ...(errorMessage ? Array.from(container.querySelectorAll('*')).filter(el => 
      el.textContent?.includes(errorMessage)
    ) : [])
  ].filter(Boolean);

  expect(errorElements.length).toBeGreaterThan(0);
}

// Export all utilities
export * from '../../utils/test-helpers';