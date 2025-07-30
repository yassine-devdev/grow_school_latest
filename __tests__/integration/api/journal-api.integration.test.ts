import { TestDatabase, setupTestDatabase, cleanupTestDatabase } from '../../utils/test-database';
import { ApiTestClient, createApiTestClient } from '../../utils/api-test-client';
import { nanoid } from 'nanoid';

describe('Journal API Integration Tests', () => {
  let testDb: TestDatabase;
  let apiClient: ApiTestClient;
  let testUser: any;

  beforeAll(async () => {
    testDb = await setupTestDatabase();
    apiClient = createApiTestClient();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // Create a fresh test user for each test
    testUser = await testDb.createTestUser({
      email: `journal_test_${nanoid(8)}@example.com`,
      password: 'testpassword123'
    });

    // Authenticate the API client
    await apiClient.authenticateWithTestDb(testDb);
  });

  afterEach(async () => {
    apiClient.clearAuth();
  });

  describe('Journal Entries CRUD Operations', () => {
    it('should create a new journal entry', async () => {
      const entryData = {
        title: 'Test Journal Entry',
        content: 'This is a test journal entry content.',
        mood: 'high',
        tags: ['test', 'integration'],
        isPrivate: false
      };

      const response = await apiClient.post('/api/journal/entries', entryData);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
      expect(response.data).toMatchObject({
        title: entryData.title,
        content: entryData.content,
        mood: entryData.mood,
        tags: entryData.tags,
        isPrivate: entryData.isPrivate,
        userId: testUser.id
      });
      expect(response.data.id).toBeDefined();
      expect(response.data.createdAt).toBeDefined();
      expect(response.data.updatedAt).toBeDefined();
    });

    it('should retrieve journal entries for authenticated user', async () => {
      // Create test entries
      const entry1 = await testDb.createTestRecord('journal_entries', {
        title: 'Entry 1',
        content: 'Content 1',
        mood: 'medium',
        tags: ['tag1'],
        isPrivate: false,
        userId: testUser.id
      });

      const entry2 = await testDb.createTestRecord('journal_entries', {
        title: 'Entry 2',
        content: 'Content 2',
        mood: 'high',
        tags: ['tag2'],
        isPrivate: true,
        userId: testUser.id
      });

      const response = await apiClient.get('/api/journal/entries');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(2);
      
      const entryIds = response.data.map((entry: any) => entry.id);
      expect(entryIds).toContain(entry1.id);
      expect(entryIds).toContain(entry2.id);
    });

    it('should retrieve a specific journal entry by ID', async () => {
      const testEntry = await testDb.createTestRecord('journal_entries', {
        title: 'Specific Entry',
        content: 'Specific content',
        mood: 'low',
        tags: ['specific'],
        isPrivate: false,
        userId: testUser.id
      });

      const response = await apiClient.get(`/api/journal/entries/${testEntry.id}`);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        id: testEntry.id,
        title: 'Specific Entry',
        content: 'Specific content',
        mood: 'low',
        tags: ['specific'],
        isPrivate: false,
        userId: testUser.id
      });
    });

    it('should update an existing journal entry', async () => {
      const testEntry = await testDb.createTestRecord('journal_entries', {
        title: 'Original Title',
        content: 'Original content',
        mood: 'medium',
        tags: ['original'],
        isPrivate: false,
        userId: testUser.id
      });

      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
        mood: 'high',
        tags: ['updated', 'modified'],
        isPrivate: true
      };

      const response = await apiClient.put(`/api/journal/entries/${testEntry.id}`, updateData);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        id: testEntry.id,
        title: updateData.title,
        content: updateData.content,
        mood: updateData.mood,
        tags: updateData.tags,
        isPrivate: updateData.isPrivate,
        userId: testUser.id
      });

      // Verify the update persisted in database
      const updatedEntry = await testDb.getTestRecord('journal_entries', testEntry.id);
      expect(updatedEntry.title).toBe(updateData.title);
      expect(updatedEntry.content).toBe(updateData.content);
    });

    it('should delete a journal entry', async () => {
      const testEntry = await testDb.createTestRecord('journal_entries', {
        title: 'Entry to Delete',
        content: 'This will be deleted',
        mood: 'medium',
        tags: ['delete'],
        isPrivate: false,
        userId: testUser.id
      });

      const response = await apiClient.delete(`/api/journal/entries/${testEntry.id}`);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(204);

      // Verify the entry was deleted
      const getResponse = await apiClient.get(`/api/journal/entries/${testEntry.id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should not allow access to other users journal entries', async () => {
      // Create another user
      const otherUser = await testDb.createTestUser({
        email: `other_${nanoid(8)}@example.com`,
        password: 'testpassword123'
      });

      // Create entry for other user
      const otherUserEntry = await testDb.createTestRecord('journal_entries', {
        title: 'Other User Entry',
        content: 'This belongs to another user',
        mood: 'medium',
        tags: ['private'],
        isPrivate: false,
        userId: otherUser.id
      });

      // Try to access other user's entry
      const response = await apiClient.get(`/api/journal/entries/${otherUserEntry.id}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Journal Analytics', () => {
    beforeEach(async () => {
      // Create test entries with different moods and dates
      const entries = [
        { mood: 'high', createdAt: new Date('2024-01-01') },
        { mood: 'medium', createdAt: new Date('2024-01-02') },
        { mood: 'low', createdAt: new Date('2024-01-03') },
        { mood: 'high', createdAt: new Date('2024-01-04') },
        { mood: 'very-high', createdAt: new Date('2024-01-05') }
      ];

      for (const entry of entries) {
        await testDb.createTestRecord('journal_entries', {
          title: `Entry ${entry.mood}`,
          content: `Content for ${entry.mood} mood`,
          mood: entry.mood,
          tags: [entry.mood],
          isPrivate: false,
          userId: testUser.id,
          created: entry.createdAt.toISOString()
        });
      }
    });

    it('should retrieve mood analytics', async () => {
      const response = await apiClient.get('/api/journal/analytics/mood');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('moodDistribution');
      expect(response.data).toHaveProperty('moodTrends');
      expect(response.data.moodDistribution).toHaveProperty('high');
      expect(response.data.moodDistribution).toHaveProperty('medium');
      expect(response.data.moodDistribution).toHaveProperty('low');
    });

    it('should retrieve writing analytics', async () => {
      const response = await apiClient.get('/api/journal/analytics/writing');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('totalEntries');
      expect(response.data).toHaveProperty('averageWordsPerEntry');
      expect(response.data).toHaveProperty('writingFrequency');
      expect(typeof response.data.totalEntries).toBe('number');
    });

    it('should retrieve insights and recommendations', async () => {
      const response = await apiClient.get('/api/journal/analytics/insights');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('insights');
      expect(response.data).toHaveProperty('recommendations');
      expect(Array.isArray(response.data.insights)).toBe(true);
      expect(Array.isArray(response.data.recommendations)).toBe(true);
    });
  });

  describe('Journal Export', () => {
    it('should export journal entries in JSON format', async () => {
      // Create test entries
      await testDb.createTestRecord('journal_entries', {
        title: 'Export Test Entry 1',
        content: 'Content for export',
        mood: 'high',
        tags: ['export'],
        isPrivate: false,
        userId: testUser.id
      });

      const response = await apiClient.get('/api/journal/export?format=json');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.data[0]).toHaveProperty('title');
      expect(response.data[0]).toHaveProperty('content');
      expect(response.data[0]).toHaveProperty('mood');
    });

    it('should export journal entries in CSV format', async () => {
      const response = await apiClient.get('/api/journal/export?format=csv');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(typeof response.data).toBe('string');
      expect(response.data).toContain('title,content,mood');
    });
  });

  describe('Error Handling', () => {
    it('should return 401 for unauthenticated requests', async () => {
      apiClient.clearAuth();

      const response = await apiClient.get('/api/journal/entries');

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
    });

    it('should return 400 for invalid entry data', async () => {
      const invalidData = {
        title: '', // Empty title should be invalid
        content: 'Valid content',
        mood: 'invalid-mood', // Invalid mood value
        tags: ['valid-tag']
      };

      const response = await apiClient.post('/api/journal/entries', invalidData);

      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
    });

    it('should return 404 for non-existent entry', async () => {
      const response = await apiClient.get('/api/journal/entries/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.data).toHaveProperty('error');
    });

    it('should handle database connection errors gracefully', async () => {
      // This test would require temporarily breaking the database connection
      // For now, we'll test that the API handles errors properly
      const response = await apiClient.get('/api/journal/entries/malformed-id-that-causes-db-error');

      expect([400, 404, 500]).toContain(response.status);
      expect(response.data).toHaveProperty('error');
    });
  });

  describe('Reflection Prompts', () => {
    it('should retrieve daily reflection prompts', async () => {
      const response = await apiClient.get('/api/journal/reflection-prompts');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.data[0]).toHaveProperty('prompt');
      expect(response.data[0]).toHaveProperty('category');
    });

    it('should retrieve prompts by category', async () => {
      const response = await apiClient.get('/api/journal/reflection-prompts?category=gratitude');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      if (response.data.length > 0) {
        expect(response.data[0].category).toBe('gratitude');
      }
    });
  });
});