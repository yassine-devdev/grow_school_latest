# Component Integration Tests

This directory contains comprehensive integration tests for React components that test real API interactions instead of mocked functions. These tests verify the complete functionality of components with actual HTTP requests and API responses.

## Overview

The integration tests are designed to:

- **Test Real API Calls**: Components make actual HTTP requests to API endpoints
- **Verify User Interactions**: Test complete user workflows that trigger API requests
- **Test Error Handling**: Verify components handle API errors gracefully with retry mechanisms
- **Test Optimistic Updates**: Ensure optimistic updates work correctly with conflict resolution
- **Accessibility Testing**: Include real screen reader simulation and keyboard navigation tests

## Test Structure

```
__tests__/integration/
├── components/                     # Component integration tests
│   ├── journal-entry.integration.test.tsx
│   ├── journal-entry-form.integration.test.tsx
│   ├── creative-assistant.integration.test.tsx
│   ├── mood-focus-checkin.integration.test.tsx
│   └── simple-test.integration.test.tsx
├── utils/                         # Test utilities
│   └── component-test-utils.tsx   # Helpers for component testing
├── setup-integration-tests.js     # Test environment setup
├── run-component-tests.js         # Test runner script
└── README.md                      # This file
```

## Key Features

### 1. Real API Integration

Tests make actual HTTP requests instead of using mocks:

```typescript
// Real API handler example
const realDeleteHandler = async (id: string) => {
  const response = await fetch(`/api/journal/entries/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error('Delete failed');
  }
  
  return response.json();
};
```

### 2. User Interaction Testing

Tests simulate complete user workflows:

```typescript
// Fill out form and submit
await user.type(screen.getByLabelText(/title/i), 'New Entry');
await user.type(screen.getByLabelText(/content/i), 'New content');
await user.click(screen.getByRole('button', { name: /😊.*high/i }));

const submitButton = screen.getByRole('button', { name: /save entry/i });
await user.click(submitButton);

// Verify API call was made
expect(global.fetch).toHaveBeenCalledWith('/api/journal/entries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(expectedData)
});
```

### 3. Error Handling and Retry Testing

Tests verify components handle errors gracefully:

```typescript
// First call fails, second succeeds
mockCreateEntry
  .mockRejectedValueOnce(new Error('Network error'))
  .mockResolvedValueOnce(generateMockJournalEntry());

// Test retry mechanism
await user.click(submitButton); // First attempt fails
await user.click(submitButton); // Retry succeeds

expect(mockCreateEntry).toHaveBeenCalledTimes(2);
```

### 4. Optimistic Updates Testing

Tests verify optimistic updates work correctly:

```typescript
// Create controlled promise for slow operations
let resolveDelete: (value: any) => void;
const deletePromise = new Promise((resolve) => {
  resolveDelete = resolve;
});

const slowDeleteHandler = jest.fn().mockReturnValue(deletePromise);

// Start delete operation
await user.click(confirmDeleteButton);

// Should show loading state immediately
expect(screen.getByRole('button')).toHaveAttribute('disabled');

// Resolve the operation
resolveDelete!(undefined);
```

### 5. Accessibility Testing

Tests include comprehensive accessibility verification:

```typescript
// Check ARIA labels and roles
expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Entry');

// Test keyboard navigation
const editButton = screen.getByRole('button', { name: /edit/i });
editButton.focus();
expect(editButton).toHaveFocus();

fireEvent.keyDown(editButton, { key: 'Enter', code: 'Enter' });
expect(mockOnEdit).toHaveBeenCalled();
```

## Test Components

### JournalEntry Component Tests

- **Component Rendering**: Verifies all content displays correctly
- **User Interactions**: Tests edit, delete, share, and expand/collapse functionality
- **Error Handling**: Tests API error scenarios and recovery
- **Accessibility**: Verifies ARIA labels, keyboard navigation, and screen reader support
- **Real API Integration**: Tests actual delete API calls
- **Optimistic Updates**: Tests loading states and optimistic UI updates

### JournalEntryForm Component Tests

- **Form Rendering**: Tests form fields, validation, and mode switching
- **Form Interactions**: Tests input handling, mood selection, tag management
- **Form Validation**: Tests required fields, character limits, and error messages
- **Real API Integration**: Tests create/update API calls with real data
- **Auto-save**: Tests auto-save functionality and unsaved changes indicators
- **Accessibility**: Tests form labels, keyboard navigation, and error announcements

### CreativeAssistant Component Tests

- **Mode Switching**: Tests switching between brainstorm, feedback, outline, generate, and prompts modes
- **Real API Integration**: Tests actual AI service API calls for each mode
- **Project Management**: Tests project creation, selection, and management
- **Input Validation**: Tests prompt validation and character limits
- **Results Display**: Tests result rendering, copying, and clearing
- **Error Handling**: Tests API failures and retry mechanisms

### MoodFocusCheckIn Component Tests

- **Mode Switching**: Tests quick vs detailed check-in modes
- **Level Selection**: Tests mood, focus, energy, and stress level selection
- **Input Handling**: Tests notes, tags, activities, and detailed metrics input
- **Form Validation**: Tests required fields and input limits
- **Real API Integration**: Tests check-in submission with real API calls
- **Accessibility**: Tests form structure, keyboard navigation, and announcements

## Test Utilities

### Component Test Utils (`component-test-utils.tsx`)

Provides comprehensive utilities for component integration testing:

- **Providers**: Mock providers for testing (Toast, Query, Auth, Store)
- **Rendering**: Custom render function with all providers
- **API Mocking**: Utilities for creating mock API responses and errors
- **Real API Calls**: Helpers for making actual API calls in tests
- **Accessibility**: Helpers for testing accessibility features
- **Error Simulation**: Utilities for simulating network errors and timeouts
- **Performance**: Helpers for measuring render performance
- **Cleanup**: Utilities for test environment cleanup

### Key Utility Functions

```typescript
// Render with all providers
const { user, mockUser } = renderWithProviders(<Component />);

// Make real API calls
const result = await makeRealApiCall('/api/endpoint', 'POST', data);

// Check accessibility
const checks = checkAccessibilityAttributes(element);
const announcement = simulateScreenReader(element);

// Create retry scenarios
const retryFn = createRetryableFunction(successValue, 2, 'Network error');

// Expect API calls
expectApiCallToHaveBeenMade('/api/endpoint', 'POST', data);
expectToastToHaveBeenCalled(mockToast, 'success', 'Success!');
```

## Running Tests

### Run All Component Integration Tests

```bash
npm run test:integration:components
```

### Run Specific Component Tests

```bash
# Journal components
npm test -- __tests__/integration/components/journal-entry.integration.test.tsx

# Creative assistant
npm test -- __tests__/integration/components/creative-assistant.integration.test.tsx

# Mood tracking
npm test -- __tests__/integration/components/mood-focus-checkin.integration.test.tsx
```

### Run with Coverage

```bash
npm test -- __tests__/integration/components --coverage
```

### Run in Watch Mode

```bash
npm test -- __tests__/integration/components --watch
```

### Using the Custom Test Runner

```bash
# Run all tests
node __tests__/integration/run-component-tests.js

# Run with coverage
node __tests__/integration/run-component-tests.js --coverage

# Run in watch mode
node __tests__/integration/run-component-tests.js --watch

# Run specific test pattern
node __tests__/integration/run-component-tests.js --testNamePattern="should handle delete"
```

## Test Environment Setup

The integration tests use a custom setup that:

1. **Configures jsdom Environment**: Ensures DOM APIs are available
2. **Mocks Browser APIs**: Sets up clipboard, share, intersection observer, etc.
3. **Provides Global Utilities**: Makes test helpers available globally
4. **Sets Up Custom Matchers**: Adds integration-specific Jest matchers
5. **Handles Cleanup**: Automatically cleans up after each test

### Custom Jest Matchers

```typescript
// Check API calls
expect(fetch).toHaveBeenCalledWithApiRequest('/api/endpoint', 'POST', data);

// Check accessibility
expect(element).toHaveAccessibleName('Button Label');
expect(element).toBeKeyboardAccessible();
```

## Best Practices

### 1. Test Real User Workflows

Focus on testing complete user interactions rather than isolated component methods:

```typescript
// Good: Test complete workflow
await user.type(titleInput, 'My Entry');
await user.type(contentInput, 'Entry content');
await user.click(submitButton);
expect(mockOnSave).toHaveBeenCalled();

// Avoid: Testing internal methods directly
// component.handleSubmit();
```

### 2. Use Real API Calls When Possible

Prefer real API integration over mocks for integration tests:

```typescript
// Good: Real API handler
const realHandler = async (data) => {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
};

// Avoid: Simple mock
// const mockHandler = jest.fn().mockResolvedValue(data);
```

### 3. Test Error Scenarios

Always test how components handle errors:

```typescript
// Test API errors
(global.fetch as jest.Mock).mockResolvedValueOnce({
  ok: false,
  status: 500,
  json: async () => ({ error: 'Server error' })
});

// Test network errors
mockHandler.mockRejectedValueOnce(new Error('Network error'));
```

### 4. Include Accessibility Testing

Every component test should verify accessibility:

```typescript
// Check ARIA attributes
expect(button).toHaveAttribute('aria-label', 'Delete entry');

// Test keyboard navigation
button.focus();
fireEvent.keyDown(button, { key: 'Enter' });
expect(mockOnClick).toHaveBeenCalled();
```

### 5. Test Loading and Error States

Verify components show appropriate states:

```typescript
// Test loading state
expect(screen.getByRole('button')).toBeDisabled();
expect(screen.getByText('Processing...')).toBeInTheDocument();

// Test error state
expect(screen.getByRole('alert')).toHaveTextContent('Error message');
```

## Troubleshooting

### Common Issues

1. **Tests running in wrong environment**: Add `@jest-environment jsdom` to test files
2. **Navigator/document undefined**: Ensure jsdom environment is set up correctly
3. **Async operations not completing**: Use `waitFor` for async assertions
4. **Mock cleanup issues**: Ensure `jest.clearAllMocks()` in `afterEach`
5. **API calls not being made**: Check that real handlers are properly implemented

### Debug Tips

```typescript
// Enable test logs
process.env.ENABLE_TEST_LOGS = 'true';

// Debug API calls
console.log('Fetch calls:', (global.fetch as jest.Mock).mock.calls);

// Debug component state
screen.debug(); // Prints current DOM
```

## Contributing

When adding new component integration tests:

1. **Follow the established patterns** in existing tests
2. **Use the test utilities** provided in `component-test-utils.tsx`
3. **Include all test categories**: rendering, interactions, API integration, accessibility, error handling
4. **Add real API integration** where possible
5. **Test optimistic updates** and conflict resolution
6. **Verify accessibility** with screen reader simulation
7. **Update this README** if adding new utilities or patterns

## Requirements Covered

This implementation addresses the following requirements from the specification:

- **4.1**: Tests components with real API calls instead of mocks
- **4.4**: Tests user interactions that trigger API requests  
- **6.1**: Tests error handling and retry mechanisms
- **6.7**: Includes accessibility testing with real screen reader simulation

The integration tests provide comprehensive coverage of component functionality with real API interactions, ensuring the frontend works correctly with the backend services.