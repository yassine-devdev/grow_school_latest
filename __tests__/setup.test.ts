import { 
  generateMockUser, 
  generateMockJournalEntry,
  createMockRequest,
  expectSuccessResponse 
} from './utils/test-helpers';

describe('Test Setup Verification', () => {
  it('should have working test utilities', () => {
    const mockUser = generateMockUser();
    expect(mockUser).toHaveProperty('id');
    expect(mockUser).toHaveProperty('email');
    expect(mockUser).toHaveProperty('role');
  });

  it('should generate mock journal entries', () => {
    const mockEntry = generateMockJournalEntry();
    expect(mockEntry).toHaveProperty('title');
    expect(mockEntry).toHaveProperty('content');
    expect(mockEntry).toHaveProperty('userId');
  });

  it('should create mock requests', () => {
    const request = createMockRequest('GET', 'http://localhost:3000/test');
    expect(request).toBeDefined();
    expect(request.method).toBe('GET');
  });

  it('should have environment variables set', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
