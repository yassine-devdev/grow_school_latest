import { NextRequest, NextResponse } from 'next/server';
import { StudyRecommendation, SubjectArea, UserProgress } from '@/types/study-assistant';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { nanoid } from 'nanoid';

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Mock data - in a real app, this would come from a database
const mockUserProgress: Record<string, UserProgress[]> = {};
let studyRecommendations: StudyRecommendation[] = [];

async function generateAIRecommendations(userId: string, userProgress: UserProgress[]): Promise<StudyRecommendation[]> {
  if (!genAI) {
    return generateFallbackRecommendations(userId, userProgress);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const progressSummary = userProgress.map(p => ({
      subject: p.subject,
      level: p.currentLevel,
      strengths: p.strengths,
      weaknesses: p.weaknesses,
      studyTime: p.totalStudyTime,
      streak: p.streakDays
    }));

    const prompt = `Based on the following student progress data, generate 3-5 personalized study recommendations:

${JSON.stringify(progressSummary, null, 2)}

For each recommendation, provide:
1. Type (topic, resource, practice, review, or break)
2. Title (concise and actionable)
3. Description (detailed explanation)
4. Subject (if applicable)
5. Priority (low, medium, high, urgent)
6. Estimated time in minutes
7. Reasoning (why this recommendation is important)
8. Related topics

Format the response as a JSON array of recommendations. Focus on addressing weaknesses, reinforcing strengths, and maintaining study momentum.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const aiRecommendations = JSON.parse(text);
      return aiRecommendations.map((rec: any) => ({
        id: nanoid(),
        userId,
        type: rec.type || 'topic',
        title: rec.title,
        description: rec.description,
        subject: rec.subject,
        priority: rec.priority || 'medium',
        estimatedTime: rec.estimatedTime || 30,
        reasoning: rec.reasoning,
        relatedTopics: rec.relatedTopics || [],
        resources: [],
        isCompleted: false,
        createdAt: new Date().toISOString()
      }));
    } catch (parseError) {
      console.error('Failed to parse AI recommendations:', parseError);
      return generateFallbackRecommendations(userId, userProgress);
    }

  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return generateFallbackRecommendations(userId, userProgress);
  }
}

function generateFallbackRecommendations(userId: string, userProgress: UserProgress[]): StudyRecommendation[] {
  const recommendations: StudyRecommendation[] = [];

  userProgress.forEach(progress => {
    // Recommend practice for weak areas
    if (progress.weaknesses.length > 0) {
      recommendations.push({
        id: nanoid(),
        userId,
        type: 'practice',
        title: `Practice ${progress.weaknesses[0]} in ${progress.subject}`,
        description: `Focus on improving your understanding of ${progress.weaknesses[0]} through targeted practice exercises.`,
        subject: progress.subject,
        priority: 'high',
        estimatedTime: 45,
        reasoning: `This topic was identified as a weakness in your ${progress.subject} studies.`,
        relatedTopics: progress.weaknesses.slice(0, 3),
        resources: [],
        isCompleted: false,
        createdAt: new Date().toISOString()
      });
    }

    // Recommend review for strengths
    if (progress.strengths.length > 0) {
      recommendations.push({
        id: nanoid(),
        userId,
        type: 'review',
        title: `Review ${progress.strengths[0]} concepts`,
        description: `Reinforce your strong understanding of ${progress.strengths[0]} to maintain mastery.`,
        subject: progress.subject,
        priority: 'medium',
        estimatedTime: 20,
        reasoning: `Regular review of your strengths helps maintain long-term retention.`,
        relatedTopics: progress.strengths.slice(0, 2),
        resources: [],
        isCompleted: false,
        createdAt: new Date().toISOString()
      });
    }
  });

  // Add a general break recommendation if study time is high
  const totalStudyTime = userProgress.reduce((sum, p) => sum + p.totalStudyTime, 0);
  if (totalStudyTime > 300) { // More than 5 hours
    recommendations.push({
      id: nanoid(),
      userId,
      type: 'break',
      title: 'Take a well-deserved break',
      description: 'You\'ve been studying hard! Take some time to relax and recharge.',
      priority: 'medium',
      estimatedTime: 15,
      reasoning: 'Regular breaks are essential for maintaining focus and preventing burnout.',
      relatedTopics: [],
      resources: [],
      isCompleted: false,
      createdAt: new Date().toISOString()
    });
  }

  return recommendations.slice(0, 5); // Limit to 5 recommendations
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get existing recommendations for the user
    let userRecommendations = studyRecommendations.filter(rec => rec.userId === userId);

    // If no recent recommendations, generate new ones
    if (userRecommendations.length === 0) {
      const userProgress = mockUserProgress[userId] || [];
      const newRecommendations = await generateAIRecommendations(userId, userProgress);
      studyRecommendations.push(...newRecommendations);
      userRecommendations = newRecommendations;
    }

    // Sort by priority and creation date
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    userRecommendations.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      recommendations: userRecommendations,
      total: userRecommendations.length
    });

  } catch (error) {
    console.error('Error fetching study recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study recommendations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, forceRegenerate = false } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Remove existing recommendations if force regenerate
    if (forceRegenerate) {
      studyRecommendations = studyRecommendations.filter(rec => rec.userId !== userId);
    }

    // Generate new recommendations
    const userProgress = mockUserProgress[userId] || [];
    const newRecommendations = await generateAIRecommendations(userId, userProgress);
    studyRecommendations.push(...newRecommendations);

    return NextResponse.json({
      recommendations: newRecommendations,
      total: newRecommendations.length
    });

  } catch (error) {
    console.error('Error generating study recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate study recommendations' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recommendationId = searchParams.get('id');

    if (!recommendationId) {
      return NextResponse.json(
        { error: 'Recommendation ID is required' },
        { status: 400 }
      );
    }

    const updates = await request.json();
    const recIndex = studyRecommendations.findIndex(rec => rec.id === recommendationId);

    if (recIndex === -1) {
      return NextResponse.json(
        { error: 'Recommendation not found' },
        { status: 404 }
      );
    }

    // Update the recommendation
    studyRecommendations[recIndex] = {
      ...studyRecommendations[recIndex],
      ...updates,
      ...(updates.isCompleted && { completedAt: new Date().toISOString() })
    };

    return NextResponse.json(studyRecommendations[recIndex]);

  } catch (error) {
    console.error('Error updating study recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to update study recommendation' },
      { status: 500 }
    );
  }
}