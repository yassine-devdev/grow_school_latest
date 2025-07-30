import { TestDatabase, setupTestDatabase, cleanupTestDatabase } from '../../utils/test-database';
import { ApiTestClient, createApiTestClient } from '../../utils/api-test-client';
import { nanoid } from 'nanoid';

describe('Wellness API Integration Tests', () => {
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
    testUser = await testDb.createTestUser({
      email: `wellness_test_${nanoid(8)}@example.com`,
      password: 'testpassword123'
    });

    await apiClient.authenticateWithTestDb(testDb);
  });

  afterEach(async () => {
    apiClient.clearAuth();
  });

  describe('Mood Focus Check-in', () => {
    it('should create a mood focus check-in entry', async () => {
      const checkInData = {
        mood: 'high',
        focus: 'medium',
        energy: 'high',
        stress: 'low',
        notes: 'Feeling great today after morning exercise',
        tags: ['exercise', 'morning', 'positive']
      };

      const response = await apiClient.post('/api/mood-focus-checkin', checkInData);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
      expect(response.data).toMatchObject({
        mood: checkInData.mood,
        focus: checkInData.focus,
        energy: checkInData.energy,
        stress: checkInData.stress,
        notes: checkInData.notes,
        tags: checkInData.tags,
        userId: testUser.id
      });
      expect(response.data.id).toBeDefined();
      expect(response.data.createdAt).toBeDefined();
    });

    it('should retrieve user mood focus check-ins', async () => {
      // Create test check-ins
      const checkIns = [
        { mood: 'high', focus: 'high', energy: 'medium', stress: 'low' },
        { mood: 'medium', focus: 'low', energy: 'low', stress: 'high' },
        { mood: 'low', focus: 'medium', energy: 'high', stress: 'medium' }
      ];

      for (const checkIn of checkIns) {
        await testDb.createTestRecord('mood_focus_entries', {
          ...checkIn,
          notes: `Test check-in for ${checkIn.mood} mood`,
          tags: [checkIn.mood],
          userId: testUser.id
        });
      }

      const response = await apiClient.get('/api/mood-focus-checkin');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(3);
      
      const moods = response.data.map((entry: any) => entry.mood);
      expect(moods).toContain('high');
      expect(moods).toContain('medium');
      expect(moods).toContain('low');
    });

    it('should retrieve check-ins with date filtering', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Create check-ins for different dates
      await testDb.createTestRecord('mood_focus_entries', {
        mood: 'high',
        focus: 'high',
        energy: 'high',
        stress: 'low',
        userId: testUser.id,
        created: today.toISOString()
      });

      await testDb.createTestRecord('mood_focus_entries', {
        mood: 'medium',
        focus: 'medium',
        energy: 'medium',
        stress: 'medium',
        userId: testUser.id,
        created: yesterday.toISOString()
      });

      const response = await apiClient.get(`/api/mood-focus-checkin?date=${today.toISOString().split('T')[0]}`);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      // Should only return today's entries
      response.data.forEach((entry: any) => {
        const entryDate = new Date(entry.createdAt).toDateString();
        expect(entryDate).toBe(today.toDateString());
      });
    });

    it('should update an existing check-in', async () => {
      const checkIn = await testDb.createTestRecord('mood_focus_entries', {
        mood: 'medium',
        focus: 'medium',
        energy: 'medium',
        stress: 'medium',
        notes: 'Original notes',
        userId: testUser.id
      });

      const updateData = {
        mood: 'high',
        focus: 'high',
        energy: 'high',
        stress: 'low',
        notes: 'Updated after afternoon walk'
      };

      const response = await apiClient.put(`/api/mood-focus-checkin/${checkIn.id}`, updateData);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        id: checkIn.id,
        mood: updateData.mood,
        focus: updateData.focus,
        energy: updateData.energy,
        stress: updateData.stress,
        notes: updateData.notes,
        userId: testUser.id
      });
    });

    it('should delete a check-in', async () => {
      const checkIn = await testDb.createTestRecord('mood_focus_entries', {
        mood: 'medium',
        focus: 'medium',
        energy: 'medium',
        stress: 'medium',
        userId: testUser.id
      });

      const response = await apiClient.delete(`/api/mood-focus-checkin/${checkIn.id}`);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(204);

      // Verify deletion
      const getResponse = await apiClient.get(`/api/mood-focus-checkin/${checkIn.id}`);
      expect(getResponse.status).toBe(404);
    });
  });

  describe('Wellness Analytics', () => {
    beforeEach(async () => {
      // Create test data for analytics
      const testEntries = [
        { mood: 'very-high', focus: 'high', energy: 'high', stress: 'very-low', date: '2024-01-01' },
        { mood: 'high', focus: 'medium', energy: 'high', stress: 'low', date: '2024-01-02' },
        { mood: 'medium', focus: 'low', energy: 'medium', stress: 'medium', date: '2024-01-03' },
        { mood: 'low', focus: 'very-low', energy: 'low', stress: 'high', date: '2024-01-04' },
        { mood: 'high', focus: 'high', energy: 'very-high', stress: 'low', date: '2024-01-05' }
      ];

      for (const entry of testEntries) {
        await testDb.createTestRecord('mood_focus_entries', {
          ...entry,
          notes: `Test entry for ${entry.date}`,
          userId: testUser.id,
          created: new Date(entry.date).toISOString()
        });
      }
    });

    it('should retrieve mood tracking analytics', async () => {
      const response = await apiClient.get('/api/wellness/mood-tracking');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('moodDistribution');
      expect(response.data).toHaveProperty('moodTrends');
      expect(response.data).toHaveProperty('averageMood');
      expect(response.data).toHaveProperty('moodPatterns');
      
      expect(typeof response.data.averageMood).toBe('number');
      expect(Array.isArray(response.data.moodTrends)).toBe(true);
      expect(typeof response.data.moodDistribution).toBe('object');
    });

    it('should retrieve focus analytics', async () => {
      const response = await apiClient.get('/api/wellness/mood-tracking?metric=focus');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('focusDistribution');
      expect(response.data).toHaveProperty('focusTrends');
      expect(response.data).toHaveProperty('averageFocus');
      expect(response.data).toHaveProperty('focusPatterns');
    });

    it('should retrieve energy analytics', async () => {
      const response = await apiClient.get('/api/wellness/mood-tracking?metric=energy');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('energyDistribution');
      expect(response.data).toHaveProperty('energyTrends');
      expect(response.data).toHaveProperty('averageEnergy');
      expect(response.data).toHaveProperty('energyPatterns');
    });

    it('should retrieve stress analytics', async () => {
      const response = await apiClient.get('/api/wellness/mood-tracking?metric=stress');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('stressDistribution');
      expect(response.data).toHaveProperty('stressTrends');
      expect(response.data).toHaveProperty('averageStress');
      expect(response.data).toHaveProperty('stressPatterns');
    });

    it('should retrieve comprehensive wellness insights', async () => {
      const response = await apiClient.get('/api/wellness/mood-tracking?insights=true');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('insights');
      expect(response.data).toHaveProperty('recommendations');
      expect(response.data).toHaveProperty('correlations');
      expect(response.data).toHaveProperty('wellnessScore');
      
      expect(Array.isArray(response.data.insights)).toBe(true);
      expect(Array.isArray(response.data.recommendations)).toBe(true);
      expect(typeof response.data.wellnessScore).toBe('number');
    });

    it('should retrieve analytics with date range filtering', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-03';

      const response = await apiClient.get(`/api/wellness/mood-tracking?startDate=${startDate}&endDate=${endDate}`);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('dateRange');
      expect(response.data.dateRange.start).toBe(startDate);
      expect(response.data.dateRange.end).toBe(endDate);
      expect(response.data).toHaveProperty('moodTrends');
    });
  });

  describe('Wellness Recommendations', () => {
    it('should generate personalized wellness recommendations', async () => {
      // Create some check-ins with patterns
      const entries = [
        { mood: 'low', focus: 'low', energy: 'low', stress: 'high' },
        { mood: 'low', focus: 'low', energy: 'low', stress: 'high' },
        { mood: 'medium', focus: 'medium', energy: 'medium', stress: 'medium' }
      ];

      for (const entry of entries) {
        await testDb.createTestRecord('mood_focus_entries', {
          ...entry,
          userId: testUser.id
        });
      }

      const response = await apiClient.get('/api/wellness/recommendations');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('recommendations');
      expect(response.data).toHaveProperty('priority');
      expect(response.data).toHaveProperty('categories');
      
      expect(Array.isArray(response.data.recommendations)).toBe(true);
      expect(response.data.recommendations.length).toBeGreaterThan(0);
      
      response.data.recommendations.forEach((rec: any) => {
        expect(rec).toHaveProperty('title');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('category');
        expect(rec).toHaveProperty('priority');
      });
    });

    it('should provide category-specific recommendations', async () => {
      const response = await apiClient.get('/api/wellness/recommendations?category=stress-management');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('recommendations');
      
      if (response.data.recommendations.length > 0) {
        response.data.recommendations.forEach((rec: any) => {
          expect(rec.category).toBe('stress-management');
        });
      }
    });

    it('should track recommendation engagement', async () => {
      // Get recommendations first
      const recResponse = await apiClient.get('/api/wellness/recommendations');
      
      if (recResponse.data.recommendations.length > 0) {
        const recommendationId = recResponse.data.recommendations[0].id;
        
        const engagementData = {
          action: 'viewed',
          timestamp: new Date().toISOString(),
          duration: 30
        };

        const response = await apiClient.post(`/api/wellness/recommendations/${recommendationId}/engagement`, engagementData);

        expect(response.ok).toBe(true);
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('engagementId');
        expect(response.data.action).toBe(engagementData.action);
      }
    });
  });

  describe('Mindfulness Integration', () => {
    it('should retrieve mindfulness exercises', async () => {
      const response = await apiClient.get('/api/mindfulness');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      if (response.data.length > 0) {
        expect(response.data[0]).toHaveProperty('title');
        expect(response.data[0]).toHaveProperty('description');
        expect(response.data[0]).toHaveProperty('duration');
        expect(response.data[0]).toHaveProperty('category');
      }
    });

    it('should filter mindfulness exercises by category', async () => {
      const response = await apiClient.get('/api/mindfulness?category=breathing');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      if (response.data.length > 0) {
        response.data.forEach((exercise: any) => {
          expect(exercise.category).toBe('breathing');
        });
      }
    });

    it('should track mindfulness session completion', async () => {
      const sessionData = {
        exerciseId: 'breathing-exercise-1',
        duration: 300, // 5 minutes
        completionRate: 100,
        notes: 'Felt very relaxed after this session',
        mood_before: 'medium',
        mood_after: 'high'
      };

      const response = await apiClient.post('/api/mindfulness/sessions', sessionData);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
      expect(response.data).toMatchObject({
        exerciseId: sessionData.exerciseId,
        duration: sessionData.duration,
        completionRate: sessionData.completionRate,
        notes: sessionData.notes,
        mood_before: sessionData.mood_before,
        mood_after: sessionData.mood_after,
        userId: testUser.id
      });
      expect(response.data.sessionId).toBeDefined();
    });
  });

  describe('Error Handling and Validation', () => {
    it('should return 401 for unauthenticated requests', async () => {
      apiClient.clearAuth();

      const response = await apiClient.get('/api/mood-focus-checkin');

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
    });

    it('should validate mood focus check-in data', async () => {
      const invalidData = {
        mood: 'invalid-mood',
        focus: 'invalid-focus',
        energy: '', // Empty value
        stress: 'invalid-stress'
      };

      const response = await apiClient.post('/api/mood-focus-checkin', invalidData);

      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
      expect(response.data).toHaveProperty('validationErrors');
    });

    it('should handle non-existent check-in requests', async () => {
      const response = await apiClient.get('/api/mood-focus-checkin/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.data).toHaveProperty('error');
    });

    it('should prevent access to other users data', async () => {
      // Create another user and their check-in
      const otherUser = await testDb.createTestUser({
        email: `other_wellness_${nanoid(8)}@example.com`,
        password: 'testpassword123'
      });

      const otherUserCheckIn = await testDb.createTestRecord('mood_focus_entries', {
        mood: 'high',
        focus: 'high',
        energy: 'high',
        stress: 'low',
        userId: otherUser.id
      });

      // Try to access other user's check-in
      const response = await apiClient.get(`/api/mood-focus-checkin/${otherUserCheckIn.id}`);

      expect(response.status).toBe(403);
      expect(response.data).toHaveProperty('error');
    });

    it('should handle database connection errors gracefully', async () => {
      // Test with malformed ID that might cause database errors
      const response = await apiClient.get('/api/mood-focus-checkin/malformed-id-123');

      expect([400, 404, 500]).toContain(response.status);
      expect(response.data).toHaveProperty('error');
    });
  });

  describe('Data Export and Privacy', () => {
    it('should export wellness data', async () => {
      // Create some test data
      await testDb.createTestRecord('mood_focus_entries', {
        mood: 'high',
        focus: 'high',
        energy: 'high',
        stress: 'low',
        notes: 'Great day!',
        userId: testUser.id
      });

      const response = await apiClient.get('/api/wellness/export?format=json');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      if (response.data.length > 0) {
        expect(response.data[0]).toHaveProperty('mood');
        expect(response.data[0]).toHaveProperty('focus');
        expect(response.data[0]).toHaveProperty('energy');
        expect(response.data[0]).toHaveProperty('stress');
        expect(response.data[0]).toHaveProperty('createdAt');
      }
    });

    it('should delete all user wellness data', async () => {
      // Create test data
      await testDb.createTestRecord('mood_focus_entries', {
        mood: 'medium',
        focus: 'medium',
        energy: 'medium',
        stress: 'medium',
        userId: testUser.id
      });

      const response = await apiClient.delete('/api/wellness/data');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('deletedCount');
      expect(typeof response.data.deletedCount).toBe('number');

      // Verify data was deleted
      const getResponse = await apiClient.get('/api/mood-focus-checkin');
      expect(getResponse.data.length).toBe(0);
    });
  });
});