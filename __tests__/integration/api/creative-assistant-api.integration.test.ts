import { TestDatabase, setupTestDatabase, cleanupTestDatabase } from '../../utils/test-database';
import { ApiTestClient, createApiTestClient } from '../../utils/api-test-client';
import { nanoid } from 'nanoid';

describe('Creative Assistant API Integration Tests', () => {
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
      email: `creative_test_${nanoid(8)}@example.com`,
      password: 'testpassword123'
    });

    await apiClient.authenticateWithTestDb(testDb);
  });

  afterEach(async () => {
    apiClient.clearAuth();
  });

  describe('Brainstorming Sessions', () => {
    it('should create a brainstorming session', async () => {
      const sessionData = {
        topic: 'Sustainable Energy Solutions',
        context: 'Looking for innovative ideas for renewable energy',
        duration: 30,
        style: 'creative'
      };

      const response = await apiClient.post('/api/creative-assistant/brainstorm', sessionData);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('sessionId');
      expect(response.data).toHaveProperty('ideas');
      expect(Array.isArray(response.data.ideas)).toBe(true);
      expect(response.data.ideas.length).toBeGreaterThan(0);
      expect(response.data.topic).toBe(sessionData.topic);
    });

    it('should retrieve brainstorming session by ID', async () => {
      // Create a session first
      const sessionData = {
        topic: 'Mobile App Ideas',
        context: 'Educational apps for students',
        duration: 20,
        style: 'structured'
      };

      const createResponse = await apiClient.post('/api/creative-assistant/brainstorm', sessionData);
      const sessionId = createResponse.data.sessionId;

      const response = await apiClient.get(`/api/creative-assistant/brainstorm/${sessionId}`);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data.sessionId).toBe(sessionId);
      expect(response.data.topic).toBe(sessionData.topic);
      expect(response.data).toHaveProperty('ideas');
      expect(response.data).toHaveProperty('createdAt');
    });

    it('should add ideas to existing brainstorming session', async () => {
      const sessionData = {
        topic: 'Climate Change Solutions',
        context: 'Local community initiatives',
        duration: 25,
        style: 'collaborative'
      };

      const createResponse = await apiClient.post('/api/creative-assistant/brainstorm', sessionData);
      const sessionId = createResponse.data.sessionId;

      const newIdea = {
        idea: 'Community solar panel sharing program',
        category: 'renewable-energy',
        feasibility: 'high'
      };

      const response = await apiClient.post(`/api/creative-assistant/brainstorm/${sessionId}/ideas`, newIdea);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('ideaId');
      expect(response.data.idea).toBe(newIdea.idea);
      expect(response.data.category).toBe(newIdea.category);
    });

    it('should retrieve user brainstorming history', async () => {
      // Create multiple sessions
      const sessions = [
        { topic: 'Art Project Ideas', context: 'School exhibition' },
        { topic: 'Science Fair Projects', context: 'Environmental theme' }
      ];

      for (const session of sessions) {
        await apiClient.post('/api/creative-assistant/brainstorm', {
          ...session,
          duration: 15,
          style: 'creative'
        });
      }

      const response = await apiClient.get('/api/creative-assistant/brainstorm');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(2);
      
      const topics = response.data.map((session: any) => session.topic);
      expect(topics).toContain('Art Project Ideas');
      expect(topics).toContain('Science Fair Projects');
    });
  });

  describe('Content Generation', () => {
    it('should generate creative content', async () => {
      const generationRequest = {
        type: 'story',
        prompt: 'A young inventor discovers a way to clean ocean plastic',
        style: 'adventure',
        length: 'short',
        audience: 'young-adult'
      };

      const response = await apiClient.post('/api/creative-assistant/generate', generationRequest);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('content');
      expect(response.data).toHaveProperty('generationId');
      expect(response.data.type).toBe(generationRequest.type);
      expect(response.data.style).toBe(generationRequest.style);
      expect(typeof response.data.content).toBe('string');
      expect(response.data.content.length).toBeGreaterThan(0);
    });

    it('should generate different content types', async () => {
      const contentTypes = ['poem', 'essay', 'dialogue', 'outline'];

      for (const type of contentTypes) {
        const request = {
          type,
          prompt: `Create a ${type} about friendship`,
          style: 'inspirational',
          length: 'medium'
        };

        const response = await apiClient.post('/api/creative-assistant/generate', request);

        expect(response.ok).toBe(true);
        expect(response.data.type).toBe(type);
        expect(response.data.content).toBeDefined();
      }
    });

    it('should retrieve generation history', async () => {
      // Generate some content first
      await apiClient.post('/api/creative-assistant/generate', {
        type: 'story',
        prompt: 'A magical library',
        style: 'fantasy',
        length: 'short'
      });

      const response = await apiClient.get('/api/creative-assistant/generate');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.data[0]).toHaveProperty('generationId');
      expect(response.data[0]).toHaveProperty('type');
      expect(response.data[0]).toHaveProperty('prompt');
    });
  });

  describe('Feedback and Analysis', () => {
    it('should provide feedback on creative work', async () => {
      const feedbackRequest = {
        content: 'The sun was shining brightly as Sarah walked through the park. She noticed the beautiful flowers and heard the birds singing.',
        type: 'creative-writing',
        focusAreas: ['style', 'imagery', 'structure'],
        level: 'intermediate'
      };

      const response = await apiClient.post('/api/creative-assistant/feedback', feedbackRequest);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('feedback');
      expect(response.data).toHaveProperty('suggestions');
      expect(response.data).toHaveProperty('strengths');
      expect(response.data).toHaveProperty('areasForImprovement');
      expect(Array.isArray(response.data.suggestions)).toBe(true);
      expect(Array.isArray(response.data.strengths)).toBe(true);
    });

    it('should analyze writing style and provide insights', async () => {
      const analysisRequest = {
        content: 'Technology has revolutionized the way we communicate. Social media platforms connect people across the globe, enabling instant sharing of ideas and experiences.',
        analysisType: 'style-analysis'
      };

      const response = await apiClient.post('/api/creative-assistant/feedback', analysisRequest);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('styleAnalysis');
      expect(response.data.styleAnalysis).toHaveProperty('tone');
      expect(response.data.styleAnalysis).toHaveProperty('complexity');
      expect(response.data.styleAnalysis).toHaveProperty('readabilityScore');
    });
  });

  describe('Project Outlines', () => {
    it('should generate project outlines', async () => {
      const outlineRequest = {
        projectType: 'research-paper',
        topic: 'The Impact of Artificial Intelligence on Education',
        scope: 'comprehensive',
        length: '10-pages',
        academicLevel: 'high-school'
      };

      const response = await apiClient.post('/api/creative-assistant/outline', outlineRequest);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('outline');
      expect(response.data).toHaveProperty('sections');
      expect(response.data).toHaveProperty('estimatedLength');
      expect(Array.isArray(response.data.sections)).toBe(true);
      expect(response.data.sections.length).toBeGreaterThan(0);
      expect(response.data.sections[0]).toHaveProperty('title');
      expect(response.data.sections[0]).toHaveProperty('description');
    });

    it('should generate creative project outlines', async () => {
      const outlineRequest = {
        projectType: 'short-story',
        topic: 'Time travel adventure',
        scope: 'detailed',
        genre: 'science-fiction',
        targetAudience: 'young-adult'
      };

      const response = await apiClient.post('/api/creative-assistant/outline', outlineRequest);

      expect(response.ok).toBe(true);
      expect(response.data).toHaveProperty('outline');
      expect(response.data).toHaveProperty('plotPoints');
      expect(response.data).toHaveProperty('characters');
      expect(response.data).toHaveProperty('setting');
    });
  });

  describe('Creative Sessions Management', () => {
    it('should create and manage creative sessions', async () => {
      const sessionData = {
        title: 'Novel Writing Session',
        type: 'writing',
        goals: ['Complete chapter 1', 'Develop main character'],
        duration: 120,
        projectId: null
      };

      const response = await apiClient.post('/api/creative-sessions', sessionData);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('sessionId');
      expect(response.data.title).toBe(sessionData.title);
      expect(response.data.type).toBe(sessionData.type);
      expect(response.data.goals).toEqual(sessionData.goals);
    });

    it('should update session progress', async () => {
      // Create session first
      const sessionData = {
        title: 'Poetry Writing Session',
        type: 'poetry',
        goals: ['Write 3 haikus'],
        duration: 60
      };

      const createResponse = await apiClient.post('/api/creative-sessions', sessionData);
      const sessionId = createResponse.data.sessionId;

      const progressUpdate = {
        completedGoals: ['Write 3 haikus'],
        notes: 'Successfully completed all haikus with nature theme',
        timeSpent: 45,
        status: 'completed'
      };

      const response = await apiClient.patch(`/api/creative-sessions/${sessionId}`, progressUpdate);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data.completedGoals).toEqual(progressUpdate.completedGoals);
      expect(response.data.status).toBe(progressUpdate.status);
    });

    it('should retrieve user creative sessions', async () => {
      const response = await apiClient.get('/api/creative-sessions');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      if (response.data.length > 0) {
        expect(response.data[0]).toHaveProperty('sessionId');
        expect(response.data[0]).toHaveProperty('title');
        expect(response.data[0]).toHaveProperty('type');
      }
    });
  });

  describe('AI Service Integration', () => {
    it('should handle AI service responses correctly', async () => {
      const request = {
        type: 'story',
        prompt: 'A robot learns to paint',
        style: 'whimsical',
        length: 'short'
      };

      const response = await apiClient.post('/api/creative-assistant/generate', request);

      expect(response.ok).toBe(true);
      expect(response.data).toHaveProperty('content');
      expect(response.data).toHaveProperty('aiModel');
      expect(response.data).toHaveProperty('processingTime');
      expect(typeof response.data.processingTime).toBe('number');
    });

    it('should handle AI service errors gracefully', async () => {
      // Test with potentially problematic input
      const request = {
        type: 'story',
        prompt: '', // Empty prompt might cause AI service issues
        style: 'invalid-style',
        length: 'invalid-length'
      };

      const response = await apiClient.post('/api/creative-assistant/generate', request);

      // Should either succeed with fallback or return proper error
      if (!response.ok) {
        expect(response.status).toBe(400);
        expect(response.data).toHaveProperty('error');
      } else {
        expect(response.data).toHaveProperty('content');
      }
    });
  });

  describe('Error Handling and Validation', () => {
    it('should return 401 for unauthenticated requests', async () => {
      apiClient.clearAuth();

      const response = await apiClient.get('/api/creative-assistant/brainstorm');

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
    });

    it('should validate brainstorming session data', async () => {
      const invalidData = {
        topic: '', // Empty topic
        context: 'Valid context',
        duration: -10, // Invalid duration
        style: 'invalid-style'
      };

      const response = await apiClient.post('/api/creative-assistant/brainstorm', invalidData);

      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
    });

    it('should validate content generation requests', async () => {
      const invalidData = {
        type: 'invalid-type',
        prompt: '', // Empty prompt
        style: '',
        length: 'invalid-length'
      };

      const response = await apiClient.post('/api/creative-assistant/generate', invalidData);

      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
    });

    it('should handle non-existent resource requests', async () => {
      const response = await apiClient.get('/api/creative-assistant/brainstorm/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.data).toHaveProperty('error');
    });
  });

  describe('Rate Limiting and Performance', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => 
        apiClient.post('/api/creative-assistant/generate', {
          type: 'poem',
          prompt: `Test poem ${i}`,
          style: 'free-verse',
          length: 'short'
        })
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect([200, 429]).toContain(response.status); // Success or rate limited
        if (response.status === 200) {
          expect(response.data).toHaveProperty('content');
        }
      });
    });

    it('should respond within reasonable time limits', async () => {
      const startTime = Date.now();

      const response = await apiClient.post('/api/creative-assistant/generate', {
        type: 'haiku',
        prompt: 'Spring morning',
        style: 'traditional',
        length: 'short'
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.ok).toBe(true);
      expect(responseTime).toBeLessThan(30000); // Should respond within 30 seconds
    });
  });
});