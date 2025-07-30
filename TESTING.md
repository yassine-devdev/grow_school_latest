# Grow School API Testing Guide

This document provides comprehensive information about the API testing suite for the Grow School application.

## Overview

The testing suite includes:
- **Unit Tests**: Individual API endpoint testing
- **Integration Tests**: Cross-module workflow testing
- **Authentication Tests**: Login, registration, and authorization
- **School Hub Tests**: Class management, enrollment, and roster
- **Creative Assistant Tests**: AI-powered brainstorming and feedback
- **Learning Guide Tests**: Personalized learning paths and progress
- **Journal & Wellness Tests**: Mood tracking and personal reflection
- **Calendar Tests**: Event management and scheduling

## Test Structure

```
__tests__/
├── api/
│   ├── auth/
│   │   ├── login.test.ts
│   │   └── register.test.ts
│   ├── school-hub/
│   │   ├── enrollment.test.ts
│   │   └── class-roster.test.ts
│   ├── creative-assistant/
│   │   ├── brainstorm.test.ts
│   │   └── feedback.test.ts
│   ├── learning-guide/
│   │   └── learning-paths.test.ts
│   ├── journal/
│   │   └── journal-entries.test.ts
│   └── wellness/
│       └── mood-tracking.test.ts
├── integration/
│   └── user-workflow.test.ts
└── utils/
    └── test-helpers.ts
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Specific Test Suites

#### API Tests Only
```bash
npm run test:api
```

#### Authentication Tests
```bash
npm run test:auth
```

#### School Hub Tests
```bash
npm run test:school-hub
```

#### Creative Assistant Tests
```bash
npm run test:creative
```

#### Journal & Wellness Tests
```bash
npm run test:journal
npm run test:wellness
```

#### Integration Tests
```bash
npm run test:integration
```

#### CI/CD Tests
```bash
npm run test:ci
```

## Test Categories

### 1. Authentication API Tests

**Coverage:**
- User registration with validation
- User login with credentials
- Password hashing and security
- JWT token generation
- Role-based access control
- Rate limiting and security measures

**Key Test Cases:**
- Valid registration and login flows
- Invalid credentials handling
- Duplicate user prevention
- Email format validation
- Password strength requirements
- Role validation (student, teacher, parent, admin)

### 2. School Hub API Tests

**Coverage:**
- Student enrollment process
- Class creation and management
- Class roster operations
- Teacher assignment
- Capacity management
- Grade and subject filtering

**Key Test Cases:**
- Complete enrollment workflow
- Class capacity limits
- Student-class assignments
- Teacher permissions
- Data validation and sanitization

### 3. Creative Assistant API Tests

**Coverage:**
- AI-powered brainstorming
- Creative feedback generation
- Content recommendations
- Project type validation
- Rate limiting
- Error handling

**Key Test Cases:**
- Brainstorm idea generation
- Feedback on creative content
- Different project types (writing, design, video, etc.)
- AI service error handling
- Input sanitization
- Response quality validation

### 4. Learning Guide API Tests

**Coverage:**
- Learning path creation
- Progress tracking
- AI recommendations
- Difficulty levels
- Subject categorization
- Personalization

**Key Test Cases:**
- Custom learning path creation
- Student progress updates
- Recommendation algorithms
- Content filtering
- Analytics and insights

### 5. Journal & Wellness API Tests

**Coverage:**
- Journal entry management
- Mood tracking
- Analytics and insights
- Privacy controls
- Growth tracking
- Wellness recommendations

**Key Test Cases:**
- Journal CRUD operations
- Mood data validation
- Privacy settings
- Analytics calculations
- Trend analysis
- Recommendation generation

### 6. Integration Tests

**Coverage:**
- Complete user workflows
- Cross-module data consistency
- Error handling and recovery
- Performance under load
- Data integrity

**Key Test Cases:**
- Student learning journey
- Teacher class management
- Parent monitoring workflow
- Multi-module interactions
- Failure recovery scenarios

## Test Utilities

### Mock Data Generators
- `generateMockUser()`: Creates test user data
- `generateMockJournalEntry()`: Creates test journal entries
- `generateMockMoodEntry()`: Creates test mood tracking data
- `generateMockCreativeProject()`: Creates test creative projects
- `generateMockLearningPath()`: Creates test learning paths

### Request/Response Helpers
- `createMockRequest()`: Creates mock HTTP requests
- `createMockResponse()`: Creates mock HTTP responses
- `expectSuccessResponse()`: Validates successful responses
- `expectErrorResponse()`: Validates error responses

### Database Mocking
- `mockDatabaseSuccess()`: Mocks successful database operations
- `mockDatabaseError()`: Mocks database errors
- Service-specific mocks for all backend services

## Environment Setup

### Test Environment Variables
```env
NODE_ENV=test
NEXTAUTH_SECRET=test-secret
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=test-gemini-key
```

### Mock Services
- PocketBase database operations
- Google Generative AI
- Email service (nodemailer)
- Authentication services

## Coverage Goals

- **API Endpoints**: 95%+ coverage
- **Service Layer**: 90%+ coverage
- **Error Handling**: 100% coverage
- **Authentication**: 100% coverage
- **Data Validation**: 100% coverage

## Best Practices

### Test Writing
1. Use descriptive test names
2. Follow AAA pattern (Arrange, Act, Assert)
3. Test both success and failure scenarios
4. Validate input sanitization
5. Test edge cases and boundary conditions

### Mock Management
1. Clear mocks between tests
2. Use realistic mock data
3. Mock external dependencies
4. Avoid testing implementation details

### Error Testing
1. Test all error conditions
2. Validate error messages
3. Test error recovery
4. Ensure graceful degradation

### Security Testing
1. Test input validation
2. Test authorization checks
3. Test rate limiting
4. Test data sanitization

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm run test:ci
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

## Debugging Tests

### Common Issues
1. **Mock not working**: Check mock setup in `jest.setup.api.js`
2. **Async test failures**: Ensure proper async/await usage
3. **Database errors**: Verify mock database responses
4. **Type errors**: Check TypeScript types in test files

### Debug Commands
```bash
# Run specific test file
npm test -- auth/login.test.ts

# Run with verbose output
npm test -- --verbose

# Run with debug info
npm test -- --detectOpenHandles
```

## Contributing

When adding new API endpoints:
1. Create corresponding test files
2. Follow existing test patterns
3. Add integration test scenarios
4. Update this documentation
5. Ensure 90%+ test coverage

## Performance Testing

For load testing and performance validation:
```bash
# Run performance tests (if implemented)
npm run test:performance

# Memory leak detection
npm run test:memory
```

## Security Testing

Security-focused test scenarios:
- SQL injection prevention
- XSS attack prevention
- CSRF protection
- Rate limiting effectiveness
- Authentication bypass attempts
- Authorization escalation tests

---

For questions or issues with the testing suite, please refer to the development team or create an issue in the project repository.
