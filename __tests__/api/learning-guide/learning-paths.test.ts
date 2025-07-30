import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/learning-guide/paths/route';
import {
  createMockRequest,
  generateMockLearningPath,
  expectSuccessResponse,
  expectErrorResponse
} from '../../utils/test-helpers';

// Mock the authorization system
jest.mock('@/lib/authorization', () => ({
  withAuthorization: jest.fn((handler) => async (request) => {
    const mockUser = {
      id: 'test-user-123',
      email: 'test@example.com',
      role: 'teacher',
      name: 'Test Teacher',
      permissions: ['read_learning_path', 'create_learning_path']
    };
    return handler(request, mockUser);
  }),
  Permission: {
    READ_LEARNING_PATH: 'read_learning_path',
    CREATE_LEARNING_PATH: 'create_learning_path'
  },
  UserRole: {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin'
  }
}));

// Mock the learning guide repository
jest.mock('@/backend/repositories/pocketbase-learning-guide-repositories', () => ({
  learningGuideRepository: {
    createPathway: jest.fn(),
    getAllPathways: jest.fn(),
    getPublicPathways: jest.fn(),
    getPathwaysByCreator: jest.fn(),
    searchPathways: jest.fn(),
    getRecommendedPathways: jest.fn()
  }
}));

// Mock the AI learning engine
jest.mock('@/backend/services/ai-learning-engine', () => ({
  aiLearningEngine: {
    generateContentRecommendations: jest.fn(),
    analyzeStudentProfile: jest.fn()
  }
}));

describe('/api/learning-guide/paths', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/learning-guide/paths', () => {
    it('should retrieve all public learning paths', async () => {
      const mockPaths = [
        generateMockLearningPath({ title: 'Mathematics Fundamentals', difficulty: 'Beginner' }),
        generateMockLearningPath({ title: 'Advanced Science', difficulty: 'Advanced' })
      ];

      const { learningGuideRepository } = require('@/backend/repositories/pocketbase-learning-guide-repositories');
      learningGuideRepository.getPublicPathways.mockResolvedValue(mockPaths);

      const request = createMockRequest('GET', 'http://localhost:3000/api/learning-guide/paths');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.paths).toHaveLength(2);
      expect(responseData.paths[0]).toMatchObject({
        title: 'Mathematics Fundamentals',
        difficulty: 'Beginner'
      });
    });

    it('should filter paths by difficulty', async () => {
      const beginnerPaths = [
        generateMockLearningPath({ difficulty: 'Beginner' })
      ];

      const { learningGuideRepository } = require('@/backend/repositories/pocketbase-learning-guide-repositories');
      learningGuideRepository.searchPathways.mockResolvedValue(beginnerPaths);

      const request = createMockRequest('GET', 'http://localhost:3000/api/learning-guide/paths?difficulty=Beginner');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.paths).toHaveLength(1);
      expect(responseData.paths[0].difficulty).toBe('Beginner');
    });

    it('should filter paths by subject', async () => {
      const mathPaths = [
        generateMockLearningPath({ subjects: ['Mathematics'] })
      ];

      const { learningGuideRepository } = require('@/backend/repositories/pocketbase-learning-guide-repositories');
      learningGuideRepository.searchPathways.mockResolvedValue(mathPaths);

      const request = createMockRequest('GET', 'http://localhost:3000/api/learning-guide/paths?subject=Mathematics');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.paths[0].subjects).toContain('Mathematics');
    });

    it('should get recommended paths for a user', async () => {
      const recommendedPaths = [
        generateMockLearningPath({ title: 'Recommended Path 1' }),
        generateMockLearningPath({ title: 'Recommended Path 2' })
      ];

      const { learningGuideRepository } = require('@/backend/repositories/pocketbase-learning-guide-repositories');
      learningGuideRepository.getRecommendedPathways.mockResolvedValue(recommendedPaths);

      const request = createMockRequest('GET', 'http://localhost:3000/api/learning-guide/paths?userId=user-123&recommended=true');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.paths).toHaveLength(2);
      expect(learningGuideRepository.getRecommendedPathways).toHaveBeenCalledWith('user-123', 10);
    });

    it('should search paths by query', async () => {
      const searchResults = [
        generateMockLearningPath({ title: 'Python Programming Basics' })
      ];

      const { learningGuideRepository } = require('@/backend/repositories/pocketbase-learning-guide-repositories');
      learningGuideRepository.searchPathways.mockResolvedValue(searchResults);

      const request = createMockRequest('GET', 'http://localhost:3000/api/learning-guide/paths?q=Python');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.paths[0].title).toContain('Python');
      expect(learningGuideRepository.searchPathways).toHaveBeenCalledWith('Python');
    });

    it('should handle pagination', async () => {
      const mockPaths = Array.from({ length: 5 }, (_, i) => 
        generateMockLearningPath({ title: `Path ${i + 1}` })
      );

      const { learningGuideRepository } = require('@/backend/repositories/pocketbase-learning-guide-repositories');
      learningGuideRepository.getPublicPathways.mockResolvedValue(mockPaths.slice(0, 2));

      const request = createMockRequest('GET', 'http://localhost:3000/api/learning-guide/paths?page=1&limit=2');

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.paths).toHaveLength(2);
      expect(responseData.pagination).toMatchObject({
        page: 1,
        limit: 2
      });
    });

    it('should handle database errors', async () => {
      // Mock the repository to throw an error
      const { learningGuideRepository } = require('@/backend/repositories/pocketbase-learning-guide-repositories');
      const originalMethod = learningGuideRepository.getPublicPathways;
      learningGuideRepository.getPublicPathways = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest('GET', 'http://localhost:3000/api/learning-guide/paths');

      const response = await GET(request);
      const responseData = await response.json();

      // Restore original method
      learningGuideRepository.getPublicPathways = originalMethod;

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Internal server error');
    });
  });

  describe('POST /api/learning-guide/paths', () => {
    const validPathData = {
      title: 'Advanced JavaScript',
      description: 'Learn advanced JavaScript concepts and patterns',
      difficulty: 'Advanced',
      subjects: ['Programming', 'Web Development'],
      estimatedTime: '12 weeks',
      isPublic: true,
      createdBy: 'teacher-123'
    };

    it('should successfully create a new learning path', async () => {
      const mockPath = generateMockLearningPath(validPathData);

      const { learningGuideRepository } = require('@/backend/repositories/pocketbase-learning-guide-repositories');
      learningGuideRepository.createPathway.mockResolvedValue(mockPath);
      learningGuideRepository.searchPathways.mockResolvedValue([]); // No existing paths

      const request = createMockRequest('POST', 'http://localhost:3000/api/learning-guide/paths', validPathData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.success).toBe(true);
      expect(responseData.path).toMatchObject({
        title: 'Advanced JavaScript',
        difficulty: 'Advanced'
      });
      expect(learningGuideRepository.createPathway).toHaveBeenCalledWith(expect.objectContaining({
        title: validPathData.title,
        description: validPathData.description,
        difficulty: validPathData.difficulty,
        subjects: validPathData.subjects,
        estimatedTime: validPathData.estimatedTime,
        isPublic: validPathData.isPublic,
        createdBy: 'user-123' // This gets overridden by the authenticated user's ID
      }));
    });

    it('should fail with missing required fields', async () => {
      const requiredFields = ['title', 'description', 'difficulty', 'subjects'];

      for (const field of requiredFields) {
        const incompleteData = { ...validPathData };
        delete incompleteData[field as keyof typeof incompleteData];

        const request = createMockRequest('POST', 'http://localhost:3000/api/learning-guide/paths', incompleteData);

        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(400);
        expect(responseData.success).toBe(false);
        expect(responseData.error).toContain(field);
      }
    });

    it('should validate difficulty levels', async () => {
      const invalidDifficultyData = { ...validPathData, difficulty: 'Invalid' };

      const request = createMockRequest('POST', 'http://localhost:3000/api/learning-guide/paths', invalidDifficultyData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Invalid difficulty level');
    });

    it('should validate subjects array', async () => {
      const invalidSubjectsData = { ...validPathData, subjects: [] };

      const request = createMockRequest('POST', 'http://localhost:3000/api/learning-guide/paths', invalidSubjectsData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('At least one subject is required');
    });

    it('should validate title length', async () => {
      const longTitleData = { ...validPathData, title: 'a'.repeat(201) };

      const request = createMockRequest('POST', 'http://localhost:3000/api/learning-guide/paths', longTitleData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Title too long');
    });

    it('should generate AI-powered content recommendations', async () => {
      const mockPath = generateMockLearningPath(validPathData);
      const mockRecommendations = [
        { title: 'JavaScript Closures', type: 'video', difficulty: 'Advanced' },
        { title: 'Async/Await Patterns', type: 'article', difficulty: 'Advanced' }
      ];

      const { learningGuideRepository } = require('@/backend/repositories/pocketbase-learning-guide-repositories');
      const { aiLearningEngine } = require('@/backend/services/ai-learning-engine');
      
      learningGuideRepository.createPathway.mockResolvedValue(mockPath);
      learningGuideRepository.searchPathways.mockResolvedValue([]); // No existing paths
      aiLearningEngine.generateContentRecommendations.mockResolvedValue(mockRecommendations);

      const request = createMockRequest('POST', 'http://localhost:3000/api/learning-guide/paths', {
        ...validPathData,
        generateContent: true
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.path.contentRecommendations).toHaveLength(2);
      expect(aiLearningEngine.generateContentRecommendations).toHaveBeenCalled();
    });

    it('should handle duplicate path names', async () => {
      const { learningGuideRepository } = require('@/backend/repositories/pocketbase-learning-guide-repositories');
      learningGuideRepository.searchPathways.mockResolvedValue([generateMockLearningPath({ title: 'Advanced JavaScript' })]);

      const request = createMockRequest('POST', 'http://localhost:3000/api/learning-guide/paths', validPathData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(409);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Path with this title already exists');
    });

    it.skip('should validate creator permissions', async () => {
      const unauthorizedData = { ...validPathData, createdBy: 'student-123' };

      const { learningGuideRepository } = require('@/backend/repositories/pocketbase-learning-guide-repositories');
      learningGuideRepository.searchPathways.mockResolvedValue([]); // No existing paths

      const request = createMockRequest('POST', 'http://localhost:3000/api/learning-guide/paths', unauthorizedData, {
        'authorization': 'Bearer student-token'
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Insufficient permissions');
    });

    it('should set default values for optional fields', async () => {
      const minimalData = {
        title: 'Basic Math',
        description: 'Basic mathematics',
        difficulty: 'Beginner',
        subjects: ['Mathematics'],
        createdBy: 'teacher-123'
      };

      const mockPath = generateMockLearningPath({
        ...minimalData,
        estimatedTime: '4 weeks',
        isPublic: false
      });

      const { learningGuideRepository } = require('@/backend/repositories/pocketbase-learning-guide-repositories');
      learningGuideRepository.createPathway.mockResolvedValue(mockPath);
      learningGuideRepository.searchPathways.mockResolvedValue([]); // No existing paths

      const request = createMockRequest('POST', 'http://localhost:3000/api/learning-guide/paths', minimalData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.path.estimatedTime).toBe('4 weeks');
      expect(responseData.path.isPublic).toBe(false);
    });

    it('should handle database errors during creation', async () => {
      // Mock the repository to throw an error
      const { learningGuideRepository } = require('@/backend/repositories/pocketbase-learning-guide-repositories');
      const originalCreateMethod = learningGuideRepository.createPathway;
      const originalSearchMethod = learningGuideRepository.searchPathways;

      learningGuideRepository.searchPathways = jest.fn().mockResolvedValue([]); // No duplicates
      learningGuideRepository.createPathway = jest.fn().mockRejectedValue(new Error('Database write failed'));

      const request = createMockRequest('POST', 'http://localhost:3000/api/learning-guide/paths', validPathData);

      const response = await POST(request);
      const responseData = await response.json();

      // Restore original methods
      learningGuideRepository.createPathway = originalCreateMethod;
      learningGuideRepository.searchPathways = originalSearchMethod;

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Internal server error');
    });
  });
});
