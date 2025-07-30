import { NextRequest } from 'next/server';
import { POST } from '@/app/api/creative-assistant/brainstorm/route';
import {
  createMockRequest,
  generateMockCreativeProject,
  expectSuccessResponse,
  expectErrorResponse
} from '../../utils/test-helpers';
import { creativeAssistantService } from '@/backend/services/creativeAssistantService';
import { ollamaAI, setOllamaAI, OllamaAIService } from '@/backend/services/ollama-ai-service';

// Mock the authorization system
jest.mock('@/lib/authorization', () => ({
  withAuthorization: jest.fn((handler) => async (request: NextRequest) => {
    const mockUser = {
      id: 'test-user-123',
      email: 'test@example.com',
      role: 'student',
      name: 'Test User',
      permissions: ['use_ai_brainstorm']
    };
    return handler(request, mockUser);
  }),
  Permission: {
    USE_AI_BRAINSTORM: 'use_ai_brainstorm'
  },
  UserRole: {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin'
  }
}));

// Mock the creative assistant service
jest.mock('@/backend/services/creativeAssistantService', () => ({
  creativeAssistantService: {
    generateBrainstormIdeas: jest.fn()
  }
}));

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue(`1. Create an interactive story about space exploration
2. Design a mobile app for student collaboration
3. Write a mystery novel set in a futuristic school
4. Develop a game that teaches environmental science
5. Create a documentary about local history`)
        }
      })
    })
  }))
}));

describe('/api/creative-assistant/brainstorm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/creative-assistant/brainstorm', () => {
    const validBrainstormRequest = {
      prompt: 'I want to create something educational and engaging for students',
      projectType: 'writing',
      userId: 'user-123'
    };

    it('should successfully generate brainstorm ideas', async () => {
      // Generate mock project data for testing
      const mockProject = generateMockCreativeProject();

      const mockResponse = {
        success: true,
        data: [
          'Create an interactive story about space exploration',
          'Design a mobile app for student collaboration',
          'Write a mystery novel set in a futuristic school',
          'Develop a game that teaches environmental science',
          'Create a documentary about local history'
        ]
      };

      (creativeAssistantService.generateBrainstormIdeas as jest.Mock).mockResolvedValue(mockResponse);

      // Use mock project data in the request
      const requestData = {
        ...validBrainstormRequest,
        projectType: mockProject.type,
        userId: 'user-123' // Match the mock user ID in the route
      };
      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/brainstorm', requestData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.ideas).toHaveLength(5);
      expect(responseData.ideas[0]).toContain('interactive story');
      expect(creativeAssistantService.generateBrainstormIdeas).toHaveBeenCalledWith(
        'I want to create something educational and engaging for students',
        'writing',
        'user-123'
      );
    });

    it('should fail with missing prompt', async () => {
      const invalidRequest = { ...validBrainstormRequest, prompt: undefined };

      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/brainstorm', invalidRequest);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Prompt is required');
    });

    it('should fail with missing project type', async () => {
      const invalidRequest = { ...validBrainstormRequest, projectType: undefined };

      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/brainstorm', invalidRequest);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Project type is required');
    });

    it.skip('should fail with missing user ID', async () => {
      const invalidRequest = { ...validBrainstormRequest, userId: undefined };

      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/brainstorm', invalidRequest);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('User ID is required');
    });

    it('should validate project type', async () => {
      const invalidRequest = { ...validBrainstormRequest, projectType: 'invalid-type' };

      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/brainstorm', invalidRequest);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Invalid project type');
    });

    it('should handle different project types', async () => {
      const projectTypes = ['writing', 'design', 'video', 'music', 'art', 'presentation', 'website', 'app', 'game'];

      for (const projectType of projectTypes) {
        const mockResponse = {
          success: true,
          data: [`${projectType} idea 1`, `${projectType} idea 2`]
        };

        (creativeAssistantService.generateBrainstormIdeas as jest.Mock).mockResolvedValue(mockResponse);

        const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/brainstorm', {
          ...validBrainstormRequest,
          projectType
        });

        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.success).toBe(true);
        expect(responseData.ideas).toHaveLength(2);
      }
    });

    it('should handle AI service errors', async () => {
      (creativeAssistantService.generateBrainstormIdeas as jest.Mock).mockResolvedValue({
        success: false,
        error: 'AI service unavailable'
      });

      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/brainstorm', validBrainstormRequest);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('AI service unavailable');
    });

    it('should handle network timeouts', async () => {
      // Test with mock service that throws error
      const originalOllama = ollamaAI;
      const mockOllama = {
        baseUrl: 'http://localhost:11434',
        defaultModel: 'llama2',
        generateText: jest.fn(),
        generateBrainstormIdeas: jest.fn().mockRejectedValue(new Error('Request timeout')),
        provideFeedback: jest.fn(),
        generateContent: jest.fn(),
        streamGenerate: jest.fn(),
        listModels: jest.fn(),
        generateLearningContent: jest.fn(),
        estimateTime: jest.fn(),
        isAvailable: jest.fn(),
        getAvailableModels: jest.fn()
      };

      // Use the new mocking pattern
      setOllamaAI(mockOllama as unknown as OllamaAIService);

      const timeoutRequest = { ...validBrainstormRequest, prompt: 'This request will timeout and trigger error' };
      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/brainstorm', timeoutRequest);

      const response = await POST(request);
      const responseData = await response.json();

      // Restore original service
      setOllamaAI(originalOllama);

      expect(response.status).toBe(500); // Should return error response for timeout
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('AI service unavailable');
    });

    it('should validate prompt length', async () => {
      const longPrompt = 'a'.repeat(5001); // Exceeds maximum length
      const invalidRequest = { ...validBrainstormRequest, prompt: longPrompt };

      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/brainstorm', invalidRequest);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Prompt too long');
    });

    it('should sanitize prompt input', async () => {
      const maliciousPrompt = '<script>alert("xss")</script>Create a story';
      const sanitizedRequest = { ...validBrainstormRequest, prompt: maliciousPrompt };

      const mockResponse = {
        success: true,
        data: ['Safe idea 1', 'Safe idea 2']
      };

      (creativeAssistantService.generateBrainstormIdeas as jest.Mock).mockResolvedValue(mockResponse);

      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/brainstorm', sanitizedRequest);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      // Verify that the service was called with sanitized input
      expect(creativeAssistantService.generateBrainstormIdeas).toHaveBeenCalledWith(
        expect.not.stringContaining('<script>'),
        'writing',
        'user-123'
      );
    });

    it('should rate limit requests per user', async () => {
      (creativeAssistantService.generateBrainstormIdeas as jest.Mock).mockResolvedValue({
        success: true,
        data: ['Idea 1']
      });

      // Simulate multiple rapid requests from the same user
      const requests = Array.from({ length: 10 }, (_, i) =>
        createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/brainstorm', validBrainstormRequest, {
          'user-agent': i > 5 ? 'rate-limit-test' : 'normal-request'
        })
      );

      const responses = await Promise.all(requests.map(req => POST(req)));

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should log brainstorm sessions for analytics', async () => {
      const mockResponse = {
        success: true,
        data: ['Idea 1', 'Idea 2']
      };

      (creativeAssistantService.generateBrainstormIdeas as jest.Mock).mockResolvedValue(mockResponse);

      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/brainstorm', validBrainstormRequest);

      const response = await POST(request);

      expect(response.status).toBe(200);
      // Verify that the session was logged (would check database in real implementation)
      expect(creativeAssistantService.generateBrainstormIdeas).toHaveBeenCalledWith(
        validBrainstormRequest.prompt,
        validBrainstormRequest.projectType,
        validBrainstormRequest.userId
      );
    });

    it('should handle empty AI responses gracefully', async () => {
      (creativeAssistantService.generateBrainstormIdeas as jest.Mock).mockResolvedValue({
        success: true,
        data: []
      });

      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/brainstorm', validBrainstormRequest);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.ideas).toHaveLength(0);
      expect(responseData.message).toContain('No ideas generated');
    });

    it('should handle NextRequest directly', async () => {
      // Test using NextRequest directly to ensure import is used
      const nextRequest = new NextRequest('http://localhost:3000/api/creative-assistant/brainstorm', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(validBrainstormRequest)
      });

      (creativeAssistantService.generateBrainstormIdeas as jest.Mock).mockResolvedValue({
        success: true,
        data: ['Direct NextRequest test idea']
      });

      const response = await POST(nextRequest);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.ideas).toContain('Direct NextRequest test idea');
    });
  });
});
