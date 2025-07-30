# Testing Guide

This document outlines the testing strategies, tools, and best practices used in the Grow School application.

## Testing Stack

- **Jest**: JavaScript testing framework
- **React Testing Library**: React component testing
- **Supertest**: HTTP API testing
- **TypeScript**: Type-safe testing
- **ESLint**: Code quality and testing standards

## Test Structure

```
__tests__/
├── api/                    # API endpoint tests
├── integration/            # Integration tests
├── lib/                   # Library and utility tests
├── utils/                 # Test utilities and helpers
├── setup.test.ts          # Test setup configuration
└── jest.setup.js          # Jest configuration
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Specific Test Files
```bash
npm test -- journal
npm test -- __tests__/api/auth.test.ts
```

## Test Categories

### 1. Unit Tests
Test individual functions and components in isolation.

**Example: Component Test**
```typescript
import { render, screen } from '@testing-library/react';
import { JournalEntry } from '@/components/journal/JournalEntry';

describe('JournalEntry', () => {
  it('renders journal entry with title and content', () => {
    const entry = {
      id: '1',
      title: 'Test Entry',
      content: 'Test content',
      mood: 'happy',
      createdAt: new Date().toISOString()
    };

    render(<JournalEntry entry={entry} />);
    
    expect(screen.getByText('Test Entry')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});
```

### 2. Integration Tests
Test multiple components working together.

**Example: User Workflow Test**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserWorkflow } from '@/components/UserWorkflow';

describe('User Workflow Integration', () => {
  it('completes student learning workflow', async () => {
    render(<UserWorkflow />);
    
    // Login
    fireEvent.click(screen.getByText('Login'));
    
    // Navigate to journal
    fireEvent.click(screen.getByText('Journal'));
    
    // Create entry
    fireEvent.click(screen.getByText('New Entry'));
    
    await waitFor(() => {
      expect(screen.getByText('Entry created')).toBeInTheDocument();
    });
  });
});
```

### 3. API Tests
Test backend endpoints and business logic.

**Example: API Endpoint Test**
```typescript
import request from 'supertest';
import { app } from '@/app';

describe('Journal API', () => {
  it('creates a new journal entry', async () => {
    const entryData = {
      title: 'Test Entry',
      content: 'Test content',
      mood: 'happy'
    };

    const response = await request(app)
      .post('/api/journal/entries')
      .send(entryData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Test Entry');
  });
});
```

## Test Utilities

### Test Helpers
Located in `__tests__/utils/test-helpers.ts`:

```typescript
// Mock data generators
export const generateTestUser = (overrides = {}) => ({
  id: 'test-user-' + Math.random().toString(36).substring(2, 11),
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'student',
  ...overrides
});

// Mock request creator
export const createMockRequest = (
  method: string,
  url: string,
  body?: unknown
): NextRequest => {
  return new NextRequest(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
};

// Response validation helpers
export const expectSuccessResponse = (response: TestResponse) => {
  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
};
```

### Mock Services
Mock external services and APIs:

```typescript
// Mock PocketBase
jest.mock('@/lib/db', () => ({
  db: {
    collection: jest.fn(() => ({
      create: jest.fn(),
      getOne: jest.fn(),
      getList: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }))
  }
}));

// Mock AI service
jest.mock('@/lib/ollama-client', () => ({
  generateResponse: jest.fn().mockResolvedValue({
    success: true,
    data: 'Mock AI response'
  })
}));
```

## Testing Best Practices

### 1. Test Structure
- **Arrange**: Set up test data and conditions
- **Act**: Execute the code being tested
- **Assert**: Verify the expected outcomes

### 2. Descriptive Test Names
```typescript
// Good
it('should create journal entry when valid data is provided')

// Bad
it('creates entry')
```

### 3. Test Independence
Each test should be independent and not rely on other tests:

```typescript
describe('Journal Service', () => {
  beforeEach(() => {
    // Reset mocks and state before each test
    jest.clearAllMocks();
  });
});
```

### 4. Mock External Dependencies
```typescript
// Mock external API calls
jest.mock('@/lib/api-client', () => ({
  post: jest.fn(),
  get: jest.fn()
}));
```

### 5. Test Error Conditions
```typescript
it('handles network errors gracefully', async () => {
  mockApiCall.mockRejectedValue(new Error('Network error'));
  
  const result = await journalService.createEntry(entryData);
  
  expect(result.success).toBe(false);
  expect(result.error).toContain('Network error');
});
```

## Component Testing

### Testing React Components
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@/contexts/ThemeContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('Dashboard Component', () => {
  it('displays user welcome message', () => {
    const user = generateTestUser({ firstName: 'John' });
    
    renderWithProviders(<Dashboard user={user} />);
    
    expect(screen.getByText('Welcome, John!')).toBeInTheDocument();
  });
});
```

### Testing Hooks
```typescript
import { renderHook, act } from '@testing-library/react';
import { useJournal } from '@/hooks/useJournal';

describe('useJournal Hook', () => {
  it('creates new journal entry', async () => {
    const { result } = renderHook(() => useJournal());
    
    await act(async () => {
      await result.current.createEntry({
        title: 'Test',
        content: 'Content'
      });
    });
    
    expect(result.current.entries).toHaveLength(1);
  });
});
```

## API Testing

### Testing Next.js API Routes
```typescript
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/journal/entries/route';

describe('/api/journal/entries', () => {
  it('creates journal entry', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        title: 'Test Entry',
        content: 'Test content'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toMatchObject({
      success: true,
      data: expect.objectContaining({
        title: 'Test Entry'
      })
    });
  });
});
```

## Performance Testing

### Testing Component Performance
```typescript
import { render } from '@testing-library/react';
import { performance } from 'perf_hooks';

describe('Dashboard Performance', () => {
  it('renders within acceptable time', () => {
    const start = performance.now();
    
    render(<Dashboard />);
    
    const end = performance.now();
    const renderTime = end - start;
    
    expect(renderTime).toBeLessThan(100); // 100ms threshold
  });
});
```

## Accessibility Testing

### Testing A11y Compliance
```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Dashboard />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });
});
```

## Continuous Integration

### GitHub Actions Configuration
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - run: npm run test:e2e
```

## Test Coverage

### Coverage Goals
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Viewing Coverage
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Debugging Tests

### Debug Mode
```bash
npm test -- --debug
```

### VS Code Debugging
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal"
}
```

## Common Testing Patterns

### Testing Async Operations
```typescript
it('handles async operations', async () => {
  const promise = asyncFunction();
  
  await expect(promise).resolves.toEqual(expectedResult);
});
```

### Testing Error Boundaries
```typescript
it('catches and displays errors', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };
  
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
});
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Next.js Testing](https://nextjs.org/docs/testing)
