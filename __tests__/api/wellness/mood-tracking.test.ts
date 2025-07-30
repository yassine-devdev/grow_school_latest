import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/wellness/mood-tracking/route';
import {
  createMockRequest,
  generateMockMoodEntry,
  expectSuccessResponse,
  expectErrorResponse
} from '../../utils/test-helpers';

// Mock the authorization system
jest.mock('@/lib/authorization', () => ({
  withAuthorization: jest.fn((handler) => async (request) => {
    const mockUser = {
      id: 'test-user-123',
      email: 'test@example.com',
      role: 'student',
      name: 'Test User',
      permissions: ['read_wellness', 'create_wellness']
    };
    return handler(request, mockUser);
  }),
  Permission: {
    READ_WELLNESS: 'read_wellness',
    CREATE_WELLNESS: 'create_wellness'
  },
  UserRole: {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin'
  }
}));

// Mock the mood focus check-in API
jest.mock('@/backend/api/moodFocusCheckIn', () => ({
  moodFocusCheckInAPI: {
    createEntry: jest.fn(),
    getUserEntries: jest.fn(),
    getAnalytics: jest.fn(),
    getRecommendations: jest.fn()
  }
}));

describe('/api/wellness/mood-tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/wellness/mood-tracking', () => {
    const validMoodData = {
      userId: 'user-123',
      mood: 'happy',
      focus: 'high',
      energy: 'high',
      stress: 'low',
      notes: 'Had a great day at school!',
      tags: ['school', 'positive']
    };

    it('should successfully create a mood entry', async () => {
      const mockEntry = generateMockMoodEntry(validMoodData);

      const { moodFocusCheckInAPI } = require('@/backend/api/moodFocusCheckIn');
      moodFocusCheckInAPI.createEntry.mockResolvedValue(mockEntry);

      const request = createMockRequest('POST', 'http://localhost:3000/api/wellness/mood-tracking', validMoodData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.success).toBe(true);
      expect(responseData.entry).toMatchObject({
        mood: 'happy',
        focus: 'high',
        energy: 'high',
        stress: 'low'
      });
      expect(moodFocusCheckInAPI.createEntry).toHaveBeenCalledWith(expect.objectContaining(validMoodData));
    });

    it('should fail with missing required fields', async () => {
      const requiredFields = ['mood', 'focus', 'energy', 'stress']; // userId is automatically set from auth

      for (const field of requiredFields) {
        const incompleteData = { ...validMoodData };
        delete incompleteData[field as keyof typeof incompleteData];

        const request = createMockRequest('POST', 'http://localhost:3000/api/wellness/mood-tracking', incompleteData);

        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(400);
        expect(responseData.success).toBe(false);
        expect(responseData.error).toContain(field);
      }
    });

    it('should validate mood values', async () => {
      const validMoodValues = ['very-sad', 'sad', 'neutral', 'happy', 'very-happy'];
      const invalidMoodData = { ...validMoodData, mood: 'invalid-mood' };

      const request = createMockRequest('POST', 'http://localhost:3000/api/wellness/mood-tracking', invalidMoodData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Invalid mood value');
    });

    it('should validate focus values', async () => {
      const validFocusValues = ['very-low', 'low', 'medium', 'high', 'very-high'];
      const invalidFocusData = { ...validMoodData, focus: 'invalid-focus' };

      const request = createMockRequest('POST', 'http://localhost:3000/api/wellness/mood-tracking', invalidFocusData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Invalid focus value');
    });

    it('should validate energy values', async () => {
      const invalidEnergyData = { ...validMoodData, energy: 'invalid-energy' };

      const request = createMockRequest('POST', 'http://localhost:3000/api/wellness/mood-tracking', invalidEnergyData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Invalid energy value');
    });

    it('should validate stress values', async () => {
      const invalidStressData = { ...validMoodData, stress: 'invalid-stress' };

      const request = createMockRequest('POST', 'http://localhost:3000/api/wellness/mood-tracking', invalidStressData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Invalid stress value');
    });

    it('should handle optional fields', async () => {
      const minimalData = {
        userId: 'user-123',
        mood: 'neutral',
        focus: 'medium',
        energy: 'medium',
        stress: 'medium'
      };

      const mockEntry = generateMockMoodEntry(minimalData);

      const { moodFocusCheckInAPI } = require('@/backend/api/moodFocusCheckIn');
      moodFocusCheckInAPI.createEntry.mockResolvedValue(mockEntry);

      const request = createMockRequest('POST', 'http://localhost:3000/api/wellness/mood-tracking', minimalData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.success).toBe(true);
      expect(responseData.entry).toMatchObject(minimalData);
    });

    it('should sanitize notes input', async () => {
      const maliciousData = { 
        ...validMoodData, 
        notes: '<script>alert("xss")</script>Feeling good today!' 
      };

      const mockEntry = generateMockMoodEntry(validMoodData);

      const { moodFocusCheckInAPI } = require('@/backend/api/moodFocusCheckIn');
      moodFocusCheckInAPI.createEntry.mockResolvedValue(mockEntry);

      const request = createMockRequest('POST', 'http://localhost:3000/api/wellness/mood-tracking', maliciousData);

      const response = await POST(request);

      expect(response.status).toBe(201);
      // Verify that the service was called with sanitized notes
      expect(moodFocusCheckInAPI.createEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: expect.not.stringContaining('<script>')
        })
      );
    });

    it('should validate notes length', async () => {
      const longNotesData = { ...validMoodData, notes: 'a'.repeat(1001) };

      const request = createMockRequest('POST', 'http://localhost:3000/api/wellness/mood-tracking', longNotesData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Notes too long');
    });

    it('should handle database errors', async () => {
      const { moodFocusCheckInAPI } = require('@/backend/api/moodFocusCheckIn');
      moodFocusCheckInAPI.createEntry.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('POST', 'http://localhost:3000/api/wellness/mood-tracking', validMoodData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Internal server error');
    });
  });

  describe('GET /api/wellness/mood-tracking', () => {
    it('should retrieve user mood entries', async () => {
      const mockEntries = [
        generateMockMoodEntry({ mood: 'happy', focus: 'high' }),
        generateMockMoodEntry({ mood: 'neutral', focus: 'medium' })
      ];

      const { moodFocusCheckInAPI } = require('@/backend/api/moodFocusCheckIn');
      moodFocusCheckInAPI.getUserEntries.mockResolvedValue(mockEntries);

      const request = createMockRequest('GET', 'http://localhost:3000/api/wellness/mood-tracking?userId=user-123');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.entries).toHaveLength(2);
      expect(responseData.entries[0]).toMatchObject({
        mood: 'happy',
        focus: 'high'
      });
      expect(moodFocusCheckInAPI.getUserEntries).toHaveBeenCalledWith('user-123', undefined);
    });

    it('should limit number of entries returned', async () => {
      const mockEntries = Array.from({ length: 5 }, (_, i) => 
        generateMockMoodEntry({ mood: 'neutral' })
      );

      const { moodFocusCheckInAPI } = require('@/backend/api/moodFocusCheckIn');
      moodFocusCheckInAPI.getUserEntries.mockResolvedValue(mockEntries.slice(0, 3));

      const request = createMockRequest('GET', 'http://localhost:3000/api/wellness/mood-tracking?userId=user-123&limit=3');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.entries).toHaveLength(3);
      expect(moodFocusCheckInAPI.getUserEntries).toHaveBeenCalledWith('user-123', 3);
    });

    it('should require user ID', async () => {
      const request = createMockRequest('GET', 'http://localhost:3000/api/wellness/mood-tracking');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('User ID is required');
    });

    it('should handle empty results', async () => {
      const { moodFocusCheckInAPI } = require('@/backend/api/moodFocusCheckIn');
      moodFocusCheckInAPI.getUserEntries.mockResolvedValue([]);

      const request = createMockRequest('GET', 'http://localhost:3000/api/wellness/mood-tracking?userId=user-123');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.entries).toHaveLength(0);
    });
  });

  describe('Mood Analytics', () => {
    it('should retrieve mood analytics', async () => {
      const mockAnalytics = {
        averageMood: 3.8,
        averageFocus: 3.5,
        averageEnergy: 3.2,
        averageStress: 2.1,
        trends: {
          mood: [3, 4, 3, 4, 5],
          focus: [3, 3, 4, 4, 3],
          energy: [2, 3, 3, 4, 3],
          stress: [3, 2, 2, 1, 2]
        },
        insights: [
          'Your mood is trending upward this week',
          'Your stress levels are well-managed',
          'Consider maintaining your current routine'
        ]
      };

      const { moodFocusCheckInAPI } = require('@/backend/api/moodFocusCheckIn');
      moodFocusCheckInAPI.getAnalytics.mockResolvedValue(mockAnalytics);

      const request = createMockRequest('GET', 'http://localhost:3000/api/wellness/mood-tracking/analytics?userId=user-123');

      // Import the analytics route GET function
      const { GET: AnalyticsGET } = require('@/app/api/wellness/mood-tracking/analytics/route');
      const response = await AnalyticsGET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.analytics).toMatchObject({
        averageMood: 3.8,
        averageFocus: 3.5,
        averageEnergy: 3.2,
        averageStress: 2.1
      });
      expect(responseData.analytics.trends.mood).toHaveLength(5);
      expect(responseData.analytics.insights).toHaveLength(3);
    });

    it('should get wellness recommendations', async () => {
      const mockRecommendations = [
        'Try a 5-minute mindfulness exercise',
        'Take a short walk outside',
        'Listen to uplifting music',
        'Practice deep breathing exercises'
      ];

      const { moodFocusCheckInAPI } = require('@/backend/api/moodFocusCheckIn');
      moodFocusCheckInAPI.getRecommendations.mockResolvedValue(mockRecommendations);

      const request = createMockRequest('GET', 'http://localhost:3000/api/wellness/mood-tracking/recommendations?userId=user-123');

      // Import the recommendations route GET function
      const { GET: RecommendationsGET } = require('@/app/api/wellness/mood-tracking/recommendations/route');
      const response = await RecommendationsGET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.recommendations).toHaveLength(4);
      expect(responseData.recommendations[0]).toContain('mindfulness');
    });

    it('should handle analytics for users with no data', async () => {
      const emptyAnalytics = {
        averageMood: 0,
        averageFocus: 0,
        averageEnergy: 0,
        averageStress: 0,
        trends: { mood: [], focus: [], energy: [], stress: [] },
        insights: ['No data available. Start tracking your mood!']
      };

      const { moodFocusCheckInAPI } = require('@/backend/api/moodFocusCheckIn');
      moodFocusCheckInAPI.getAnalytics.mockResolvedValue(emptyAnalytics);

      const request = createMockRequest('GET', 'http://localhost:3000/api/wellness/mood-tracking/analytics?userId=new-user');

      // Import the analytics route GET function
      const { GET: AnalyticsGET } = require('@/app/api/wellness/mood-tracking/analytics/route');
      const response = await AnalyticsGET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.analytics.insights[0]).toContain('No data available');
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit frequent mood entries', async () => {
      const { moodFocusCheckInAPI } = require('@/backend/api/moodFocusCheckIn');
      moodFocusCheckInAPI.createEntry.mockResolvedValue(generateMockMoodEntry());

      // Simulate multiple rapid requests
      const requests = Array.from({ length: 10 }, (_, i) =>
        createMockRequest('POST', 'http://localhost:3000/api/wellness/mood-tracking', {
          userId: 'user-123',
          mood: 'neutral',
          focus: 'medium',
          energy: 'medium',
          stress: 'medium'
        }, {
          'user-agent': i > 5 ? 'rate-limit-test' : 'normal-request'
        })
      );

      const responses = await Promise.all(requests.map(req => POST(req)));

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
