import { NextRequest, NextResponse } from 'next/server';
import { UserSafetyProgress, ContentDifficulty } from '@/types';

// Mock data for user safety progress
const mockUserSafetyProgress: Record<string, UserSafetyProgress> = {
  'user-1': {
    userId: 'user-1',
    completedContent: [
      {
        contentId: 'content-1',
        completedAt: '2024-01-15T10:00:00Z',
        timeSpent: 25,
        engagementScore: 85,
        comprehensionScore: 92,
        feedback: 'Great understanding of privacy concepts',
        rating: 5
      },
      {
        contentId: 'content-2',
        completedAt: '2024-01-20T14:30:00Z',
        timeSpent: 30,
        engagementScore: 78,
        comprehensionScore: 88,
        rating: 4
      }
    ],
    assessmentScores: [
      {
        assessmentId: 'assessment-1',
        attemptNumber: 1,
        score: 92,
        passed: true,
        completedAt: '2024-01-15T10:25:00Z',
        timeSpent: 15,
        answers: [
          {
            questionId: 'q1',
            answer: 'Never share personal information',
            isCorrect: true,
            pointsEarned: 10,
            timeSpent: 30
          }
        ]
      }
    ],
    digitalFootprintScore: 78,
    safetyKnowledgeLevel: 'middle' as ContentDifficulty,
    riskAwareness: 85,
    behaviorChanges: [
      {
        id: 'change-1',
        category: 'privacy',
        behavior: 'Social media privacy settings',
        beforeDescription: 'All posts were public',
        afterDescription: 'Changed to friends-only visibility',
        changeDate: '2024-01-16T00:00:00Z',
        trigger: 'Completed privacy lesson',
        confidence: 4,
        impact: 'positive',
        isVerified: true,
        verifiedBy: 'teacher-1',
        verifiedAt: '2024-01-17T00:00:00Z'
      }
    ],
    incidentsReported: 0,
    incidentsExperienced: 0,
    supportSought: 1,
    lastAssessment: '2024-01-15T10:25:00Z',
    nextRecommendedContent: ['content-3', 'content-4'],
    achievements: ['safety-novice', 'privacy-protector'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    // In a real application, this would fetch from a database
    const progress = mockUserSafetyProgress[userId];
    
    if (!progress) {
      // Return default progress for new users
      const defaultProgress: UserSafetyProgress = {
        userId,
        completedContent: [],
        assessmentScores: [],
        digitalFootprintScore: 50,
        safetyKnowledgeLevel: 'elementary' as ContentDifficulty,
        riskAwareness: 30,
        behaviorChanges: [],
        incidentsReported: 0,
        incidentsExperienced: 0,
        supportSought: 0,
        lastAssessment: new Date().toISOString(),
        nextRecommendedContent: ['content-1'],
        achievements: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return NextResponse.json(defaultProgress);
    }
    
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching user safety progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user safety progress' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const updates = await request.json();
    
    // In a real application, this would update the database
    const currentProgress = mockUserSafetyProgress[userId];
    if (currentProgress) {
      mockUserSafetyProgress[userId] = {
        ...currentProgress,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
    
    return NextResponse.json(mockUserSafetyProgress[userId]);
  } catch (error) {
    console.error('Error updating user safety progress:', error);
    return NextResponse.json(
      { error: 'Failed to update user safety progress' },
      { status: 500 }
    );
  }
}