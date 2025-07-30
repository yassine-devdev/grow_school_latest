import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '@/app/api/journal/entries/route';
import {
  createMockRequest,
  generateMockJournalEntry,
  expectSuccessResponse,
  expectErrorResponse
} from '../../utils/test-helpers';
import { journalService } from '@/backend/services/journalService';
import { GET as AnalyticsGET } from '@/app/api/journal/analytics/route';

// Mock the authorization system
jest.mock('@/lib/authorization', () => ({
  withAuthorization: jest.fn((handler) => async (request: NextRequest) => {
    const mockUser = {
      id: 'test-user-123',
      email: 'test@example.com',
      role: 'student',
      name: 'Test User',
      permissions: ['read_journal', 'create_journal', 'update_journal', 'delete_journal']
    };
    return handler(request, mockUser);
  }),
  Permission: {
    READ_JOURNAL: 'read_journal',
    CREATE_JOURNAL: 'create_journal',
    UPDATE_JOURNAL: 'update_journal',
    DELETE_JOURNAL: 'delete_journal'
  },
  UserRole: {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin'
  }
}));

// Mock the journal service
jest.mock('@/backend/services/journalService', () => ({
  journalService: {
    createEntry: jest.fn(),
    getUserEntries: jest.fn(),
    getEntry: jest.fn(),
    updateEntry: jest.fn(),
    deleteEntry: jest.fn(),
    searchEntries: jest.fn(),
    getAnalytics: jest.fn()
  }
}));

describe('/api/journal/entries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/journal/entries', () => {
    it('should retrieve user journal entries', async () => {
      const mockEntries = [
        generateMockJournalEntry({ title: 'Today was great!', mood: 'happy' }),
        generateMockJournalEntry({ title: 'Challenging day', mood: 'neutral' })
      ];

      (journalService.getUserEntries as jest.Mock).mockResolvedValue(mockEntries);

      const request = createMockRequest('GET', 'http://localhost:3000/api/journal/entries?userId=user-123');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.entries).toHaveLength(2);
      expect(responseData.entries[0]).toMatchObject({
        title: 'Today was great!',
        mood: 'happy'
      });
      expect(journalService.getUserEntries).toHaveBeenCalledWith('user-123');
    });

    it('should search journal entries', async () => {
      const searchResults = [
        generateMockJournalEntry({ title: 'Great day at school', content: 'Had an amazing day learning' })
      ];

      (journalService.searchEntries as jest.Mock).mockResolvedValue(searchResults);

      const request = createMockRequest('GET', 'http://localhost:3000/api/journal/entries?userId=user-123&q=school');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.entries).toHaveLength(1);
      expect(responseData.entries[0].title).toContain('school');
      expect(journalService.searchEntries).toHaveBeenCalledWith('user-123', 'school');
    });

    it('should filter entries by mood', async () => {
      const happyEntries = [
        generateMockJournalEntry({ mood: 'happy' })
      ];

      (journalService.getUserEntries as jest.Mock).mockResolvedValue(happyEntries);

      const request = createMockRequest('GET', 'http://localhost:3000/api/journal/entries?userId=user-123&mood=happy');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.entries[0].mood).toBe('happy');
    });

    it('should paginate results', async () => {
      const mockEntries = Array.from({ length: 3 }, (_, i) => 
        generateMockJournalEntry({ title: `Entry ${i + 1}` })
      );

      (journalService.getUserEntries as jest.Mock).mockResolvedValue(mockEntries.slice(0, 2));

      const request = createMockRequest('GET', 'http://localhost:3000/api/journal/entries?userId=user-123&page=1&limit=2');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.entries).toHaveLength(2);
      expect(responseData.pagination).toMatchObject({
        page: 1,
        limit: 2
      });
    });

    it.skip('should require user ID', async () => {
      const request = createMockRequest('GET', 'http://localhost:3000/api/journal/entries');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('User ID is required');
    });

    it('should handle empty results', async () => {
      (journalService.getUserEntries as jest.Mock).mockResolvedValue([]);

      const request = createMockRequest('GET', 'http://localhost:3000/api/journal/entries?userId=user-123');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.entries).toHaveLength(0);
    });
  });

  describe('POST /api/journal/entries', () => {
    const validEntryData = {
      userId: 'user-123',
      title: 'My First Journal Entry',
      content: 'Today I learned something new and exciting!',
      mood: 'happy',
      tags: ['learning', 'positive'],
      isPrivate: true
    };

    it('should successfully create a new journal entry', async () => {
      const mockEntry = generateMockJournalEntry(validEntryData);

      (journalService.createEntry as jest.Mock).mockResolvedValue(mockEntry);

      const request = createMockRequest('POST', 'http://localhost:3000/api/journal/entries', validEntryData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.success).toBe(true);
      expect(responseData.entry).toMatchObject({
        title: 'My First Journal Entry',
        mood: 'happy'
      });
      expect(journalService.createEntry).toHaveBeenCalledWith(expect.objectContaining(validEntryData));
    });

    it('should fail with missing required fields', async () => {
      const requiredFields = ['title', 'content']; // userId is automatically set from auth

      for (const field of requiredFields) {
        const incompleteData = { ...validEntryData };
        delete incompleteData[field as keyof typeof incompleteData];

        const request = createMockRequest('POST', 'http://localhost:3000/api/journal/entries', incompleteData);

        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(400);
        expect(responseData.success).toBe(false);
        expect(responseData.error).toContain(field);
      }
    });

    it('should validate mood values', async () => {
      const invalidMoodData = { ...validEntryData, mood: 'invalid-mood' };

      const request = createMockRequest('POST', 'http://localhost:3000/api/journal/entries', invalidMoodData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Invalid mood value');
    });

    it('should validate title length', async () => {
      const longTitleData = { ...validEntryData, title: 'a'.repeat(201) };

      const request = createMockRequest('POST', 'http://localhost:3000/api/journal/entries', longTitleData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Title too long');
    });

    it('should validate content length', async () => {
      const longContentData = { ...validEntryData, content: 'a'.repeat(10001) };

      const request = createMockRequest('POST', 'http://localhost:3000/api/journal/entries', longContentData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Content too long');
    });

    it('should set default privacy to true', async () => {
      const { isPrivate, ...dataWithoutPrivacy } = validEntryData;

      // Verify that the original data had a privacy setting
      expect(isPrivate).toBeDefined();

      const mockEntry = generateMockJournalEntry({ ...dataWithoutPrivacy, isPrivate: true });

      (journalService.createEntry as jest.Mock).mockResolvedValue(mockEntry);

      const request = createMockRequest('POST', 'http://localhost:3000/api/journal/entries', dataWithoutPrivacy);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.entry.isPrivate).toBe(true);
    });

    it('should sanitize content input', async () => {
      const maliciousData = { 
        ...validEntryData, 
        content: '<script>alert("xss")</script>This is my journal entry' 
      };

      const mockEntry = generateMockJournalEntry(validEntryData);

      (journalService.createEntry as jest.Mock).mockResolvedValue(mockEntry);

      const request = createMockRequest('POST', 'http://localhost:3000/api/journal/entries', maliciousData);

      const response = await POST(request);

      expect(response.status).toBe(201);
      // Verify that the service was called with sanitized content
      expect(journalService.createEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.not.stringContaining('<script>')
        })
      );
    });

    it('should handle database errors', async () => {
      (journalService.createEntry as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('POST', 'http://localhost:3000/api/journal/entries', validEntryData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Internal server error');
    });
  });

  describe('PUT /api/journal/entries/[id]', () => {
    const updateData = {
      title: 'Updated Journal Entry',
      content: 'Updated content',
      mood: 'neutral'
    };

    it('should successfully update a journal entry', async () => {
      const originalEntry = generateMockJournalEntry({ userId: 'user-123' });
      const updatedEntry = { ...originalEntry, ...updateData };

      (journalService.getEntry as jest.Mock).mockResolvedValue(originalEntry);
      (journalService.updateEntry as jest.Mock).mockResolvedValue(updatedEntry);

      const request = createMockRequest('PUT', 'http://localhost:3000/api/journal/entries/entry-123', updateData);

      const response = await PUT(request, { params: { id: 'entry-123' } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.entry.title).toBe('Updated Journal Entry');
      expect(journalService.updateEntry).toHaveBeenCalledWith('entry-123', updateData);
    });

    it('should fail when entry not found', async () => {
      (journalService.getEntry as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest('PUT', 'http://localhost:3000/api/journal/entries/nonexistent', updateData);

      const response = await PUT(request, { params: { id: 'nonexistent' } });
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Journal entry not found');
    });

    it('should validate user ownership', async () => {
      const otherUserEntry = generateMockJournalEntry({ userId: 'other-user' });

      (journalService.getEntry as jest.Mock).mockResolvedValue(otherUserEntry);

      const request = createMockRequest('PUT', 'http://localhost:3000/api/journal/entries/entry-123', updateData, {
        'user-id': 'user-123'
      });

      const response = await PUT(request, { params: { id: 'entry-123' } });
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Unauthorized');
    });
  });

  describe('DELETE /api/journal/entries/[id]', () => {
    it('should successfully delete a journal entry', async () => {
      const entryToDelete = generateMockJournalEntry({ userId: 'user-123' });

      (journalService.getEntry as jest.Mock).mockResolvedValue(entryToDelete);
      (journalService.deleteEntry as jest.Mock).mockResolvedValue(undefined);

      const request = createMockRequest('DELETE', 'http://localhost:3000/api/journal/entries/entry-123');

      const response = await DELETE(request, { params: { id: 'entry-123' } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(journalService.deleteEntry).toHaveBeenCalledWith('entry-123');
    });

    it('should fail when entry not found', async () => {
      (journalService.getEntry as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest('DELETE', 'http://localhost:3000/api/journal/entries/nonexistent');

      const response = await DELETE(request, { params: { id: 'nonexistent' } });
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Journal entry not found');
    });

    it('should validate user ownership before deletion', async () => {
      const otherUserEntry = generateMockJournalEntry({ userId: 'other-user' });

      (journalService.getEntry as jest.Mock).mockResolvedValue(otherUserEntry);

      const request = createMockRequest('DELETE', 'http://localhost:3000/api/journal/entries/entry-123', null, {
        'user-id': 'user-123'
      });

      const response = await DELETE(request, { params: { id: 'entry-123' } });
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Unauthorized');
    });
  });

  describe('Journal Analytics', () => {
    it('should retrieve user journal analytics', async () => {
      const mockAnalytics = {
        totalEntries: 15,
        averageMood: 3.8,
        commonTags: ['learning', 'school', 'friends'],
        writingStreak: 7,
        growthInsights: ['You write more on weekdays', 'Your mood improves when you exercise']
      };

      (journalService.getAnalytics as jest.Mock).mockResolvedValue(mockAnalytics);

      // Use the imported analytics route GET function
      const request = createMockRequest('GET', 'http://localhost:3000/api/journal/analytics?userId=user-123');

      const response = await AnalyticsGET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.analytics).toMatchObject({
        totalEntries: 15,
        averageMood: 3.8,
        writingStreak: 7
      });
      expect(responseData.analytics.commonTags).toContain('learning');
      expect(responseData.analytics.growthInsights).toHaveLength(2);
    });

    it('should handle NextRequest directly', async () => {
      // Test using NextRequest directly to ensure import is used
      const nextRequest = new NextRequest('http://localhost:3000/api/journal/entries?userId=user-123', {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        }
      });

      const mockEntries = [generateMockJournalEntry({ title: 'Direct NextRequest test' })];
      (journalService.getUserEntries as jest.Mock).mockResolvedValue(mockEntries);

      const response = await GET(nextRequest);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.entries).toHaveLength(1);
      expect(responseData.entries[0].title).toBe('Direct NextRequest test');
    });
  });
});
