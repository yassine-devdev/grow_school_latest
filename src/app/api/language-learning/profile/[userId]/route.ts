import { NextRequest, NextResponse } from 'next/server';
import { UserLanguageProfile } from '../../../../../types/language-learning';

// Mock user profile data
const mockUserProfile: UserLanguageProfile = {
  id: 'profile_1',
  userId: 'user_1',
  nativeLanguages: ['en'],
  learningLanguages: [
    {
      language: 'es',
      proficiencyLevel: 'intermediate',
      currentStreak: 7,
      longestStreak: 14,
      totalPracticeTime: 450,
      conversationsCompleted: 23,
      pronunciationScore: 75,
      vocabularySize: 170,
      grammarScore: 80,
      listeningScore: 85,
      speakingScore: 70,
      readingScore: 88,
      writingScore: 72,
      lastPracticeDate: new Date().toISOString(),
      startedLearningAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    },
    {
      language: 'fr',
      proficiencyLevel: 'beginner',
      currentStreak: 3,
      longestStreak: 5,
      totalPracticeTime: 120,
      conversationsCompleted: 8,
      pronunciationScore: 60,
      vocabularySize: 45,
      grammarScore: 65,
      listeningScore: 70,
      speakingScore: 55,
      readingScore: 75,
      writingScore: 58,
      lastPracticeDate: new Date().toISOString(),
      startedLearningAt: '2024-02-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    }
  ],
  preferredPracticeTime: 30,
  learningGoals: ['Travel', 'Business', 'Cultural understanding'],
  interests: ['Food', 'Music', 'Literature', 'Technology'],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: new Date().toISOString()
};

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would fetch from database
    const profile = { ...mockUserProfile, userId };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching user language profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user language profile' },
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
    const body = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would update the database
    const updatedProfile = {
      ...mockUserProfile,
      ...body,
      userId,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating user language profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user language profile' },
      { status: 500 }
    );
  }
}