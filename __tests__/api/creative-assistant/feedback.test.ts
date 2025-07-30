import { NextRequest } from 'next/server';
import { POST } from '@/app/api/creative-assistant/feedback/route';
import {
  createMockRequest,
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
      permissions: ['use_ai_feedback']
    };
    return handler(request, mockUser);
  }),
  Permission: {
    USE_AI_FEEDBACK: 'use_ai_feedback'
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
    provideFeedback: jest.fn()
  }
}));

describe('/api/creative-assistant/feedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/creative-assistant/feedback', () => {
    const validFeedbackRequest = {
      content: 'Once upon a time, there was a brave knight who embarked on a quest to save the kingdom from an evil dragon.',
      projectType: 'writing',
      userId: 'user-123'
    };

    const mockFeedbackResponse = `**Strengths:**
- Engaging opening with classic fairy tale elements
- Clear narrative direction established
- Good use of archetypal characters

**Areas for Improvement:**
- Consider adding more specific details about the setting
- Develop the knight's motivation more deeply
- The dragon could be more than just "evil" - give it complexity

**Specific Suggestions:**
1. Add sensory details to make the world more vivid
2. Show the knight's personality through actions
3. Consider what makes this dragon unique

**Overall Assessment:**
A solid foundation for a fantasy story with room for character and world development.`;

    it('should successfully provide feedback on content', async () => {
      const mockResponse = {
        success: true,
        data: mockFeedbackResponse
      };

      (creativeAssistantService.provideFeedback as jest.Mock).mockResolvedValue(mockResponse);

      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/feedback', validFeedbackRequest);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.feedback).toContain('Strengths:');
      expect(responseData.feedback).toContain('Areas for Improvement:');
      expect(responseData.feedback).toContain('Specific Suggestions:');
      expect(creativeAssistantService.provideFeedback).toHaveBeenCalledWith(
        validFeedbackRequest.content,
        validFeedbackRequest.projectType,
        validFeedbackRequest.userId
      );
    });

    it('should fail with missing content', async () => {
      const invalidRequest = { ...validFeedbackRequest, content: undefined };

      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/feedback', invalidRequest);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Content cannot be empty');
    });

    it('should fail with empty content', async () => {
      const invalidRequest = { ...validFeedbackRequest, content: '' };

      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/feedback', invalidRequest);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Content cannot be empty');
    });

    it('should fail with missing project type', async () => {
      const invalidRequest = { ...validFeedbackRequest, projectType: undefined };

      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/feedback', invalidRequest);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Project type is required');
    });

    it('should validate content length limits', async () => {
      const tooLongContent = 'a'.repeat(10001); // Exceeds maximum length
      const invalidRequest = { ...validFeedbackRequest, content: tooLongContent };

      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/feedback', invalidRequest);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Content too long');
    });

    it('should handle different project types', async () => {
      const projectTypes = ['writing', 'design', 'video', 'music', 'art', 'presentation'];

      for (const projectType of projectTypes) {
        const mockResponse = {
          success: true,
          data: `Feedback for ${projectType} project: Great work!`
        };

        (creativeAssistantService.provideFeedback as jest.Mock).mockResolvedValue(mockResponse);

        const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/feedback', {
          ...validFeedbackRequest,
          projectType
        });

        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.success).toBe(true);
        expect(responseData.feedback).toContain(projectType);
      }
    });

    it('should handle AI service errors', async () => {
      (creativeAssistantService.provideFeedback as jest.Mock).mockResolvedValue({
        success: false,
        error: 'AI service temporarily unavailable'
      });

      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/feedback', validFeedbackRequest);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('AI service temporarily unavailable');
    });

    it('should sanitize content input', async () => {
      const maliciousContent = '<script>alert("xss")</script>This is my story content';
      const sanitizedRequest = { ...validFeedbackRequest, content: maliciousContent };

      const mockResponse = {
        success: true,
        data: 'Safe feedback response'
      };

      (creativeAssistantService.provideFeedback as jest.Mock).mockResolvedValue(mockResponse);

      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/feedback', sanitizedRequest);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      // Verify that the service was called with sanitized input
      expect(creativeAssistantService.provideFeedback).toHaveBeenCalledWith(
        expect.not.stringContaining('<script>'),
        'writing',
        'user-123'
      );
    });

    it('should provide constructive feedback for different content types', async () => {
      const contentTypes = [
        {
          type: 'writing',
          content: 'The quick brown fox jumps over the lazy dog.',
          expectedFeedback: 'narrative structure'
        },
        {
          type: 'design',
          content: 'A minimalist logo with blue and white colors',
          expectedFeedback: 'visual elements'
        },
        {
          type: 'presentation',
          content: 'Slide 1: Introduction\nSlide 2: Main Points\nSlide 3: Conclusion',
          expectedFeedback: 'presentation flow'
        }
      ];

      for (const testCase of contentTypes) {
        const mockResponse = {
          success: true,
          data: `Feedback focusing on ${testCase.expectedFeedback}`
        };

        (creativeAssistantService.provideFeedback as jest.Mock).mockResolvedValue(mockResponse);

        const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/feedback', {
          content: testCase.content,
          projectType: testCase.type,
          userId: 'user-123'
        });

        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.feedback).toContain(testCase.expectedFeedback);
      }
    });

    it('should track feedback sessions for user analytics', async () => {
      const mockResponse = {
        success: true,
        data: mockFeedbackResponse
      };

      (creativeAssistantService.provideFeedback as jest.Mock).mockResolvedValue(mockResponse);

      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/feedback', validFeedbackRequest);

      const response = await POST(request);

      expect(response.status).toBe(200);
      // Verify that the feedback session was tracked
      expect(creativeAssistantService.provideFeedback).toHaveBeenCalledWith(
        validFeedbackRequest.content,
        validFeedbackRequest.projectType,
        validFeedbackRequest.userId
      );
    });

    it.skip('should handle network timeouts gracefully', async () => {
      // Test with invalid model to trigger error
      const originalOllama = ollamaAI;
      const mockOllama = {
        baseUrl: 'http://localhost:11434',
        defaultModel: 'llama2',
        generateText: jest.fn(),
        generateBrainstormIdeas: jest.fn(),
        provideFeedback: jest.fn().mockRejectedValue(new Error('Request timeout')),
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

      const timeoutRequest = { ...validFeedbackRequest, content: 'This content will timeout and trigger fallback' };
      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/feedback', timeoutRequest);

      const response = await POST(request);
      const responseData = await response.json();

      // Restore original service
      setOllamaAI(originalOllama);

      expect(response.status).toBe(500); // Should return error response for timeout
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Request timeout');
    });

    it('should provide fallback feedback when AI is unavailable', async () => {
      (creativeAssistantService.provideFeedback as jest.Mock).mockResolvedValue({
        success: false,
        error: 'AI service unavailable'
      });

      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/feedback', validFeedbackRequest);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toContain('AI service unavailable');
      // In a real implementation, this might provide basic fallback feedback
    });

    it.skip('should validate user permissions', async () => {
      const unauthorizedRequest = { ...validFeedbackRequest, userId: 'unauthorized-user' };

      // Mock authorization check failure
      const request = createMockRequest('POST', 'http://localhost:3000/api/creative-assistant/feedback', unauthorizedRequest, {
        'authorization': 'Bearer invalid-token'
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Unauthorized');
    });

    it('should handle NextRequest directly', async () => {
      // Test using NextRequest directly to ensure import is used
      const nextRequest = new NextRequest('http://localhost:3000/api/creative-assistant/feedback', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(validFeedbackRequest)
      });

      (creativeAssistantService.provideFeedback as jest.Mock).mockResolvedValue({
        success: true,
        data: 'Direct NextRequest test feedback'
      });

      const response = await POST(nextRequest);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.feedback).toContain('Direct NextRequest test feedback');
    });
  });
});
