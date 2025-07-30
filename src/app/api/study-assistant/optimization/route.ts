import { NextRequest, NextResponse } from 'next/server';
import { StudySessionOptimization, StudySession, SubjectArea } from '@/types/study-assistant';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Mock data store - in a real app, this would be a database
const optimizationData: Record<string, StudySessionOptimization> = {};

async function generateOptimizationRecommendations(
  userId: string, 
  studySessions: StudySession[]
): Promise<StudySessionOptimization> {
  
  // Analyze study patterns from sessions
  const sessionAnalysis = analyzeStudySessions(studySessions);
  
  if (!genAI) {
    return generateFallbackOptimization(userId, sessionAnalysis);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `Based on the following study session data, provide optimization recommendations for this student:

Study Session Analysis:
${JSON.stringify(sessionAnalysis, null, 2)}

Please provide recommendations for:
1. Optimal session duration (in minutes)
2. Best study times (array of time slots like "09:00-10:00")
3. Preferred subject order (array of subjects in optimal order)
4. Break frequency (minutes between breaks)
5. Break duration (minutes per break)
6. Focus patterns (time of day, focus level 1-10, suitable subjects)
7. Environment preferences (music type, noise level, lighting)

Format the response as a JSON object with these exact fields:
- optimalSessionDuration
- bestStudyTimes
- preferredSubjectOrder
- breakFrequency
- breakDuration
- focusPatterns
- environmentPreferences

Base recommendations on learning science principles and the student's observed patterns.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const aiOptimization = JSON.parse(text);
      return {
        userId,
        optimalSessionDuration: aiOptimization.optimalSessionDuration || 45,
        bestStudyTimes: aiOptimization.bestStudyTimes || ['09:00-10:00', '14:00-15:00'],
        preferredSubjectOrder: aiOptimization.preferredSubjectOrder || ['mathematics', 'science', 'english'],
        breakFrequency: aiOptimization.breakFrequency || 25,
        breakDuration: aiOptimization.breakDuration || 5,
        focusPatterns: aiOptimization.focusPatterns || [
          { timeOfDay: '09:00-11:00', focusLevel: 8, subjects: ['mathematics', 'science'] },
          { timeOfDay: '14:00-16:00', focusLevel: 7, subjects: ['english', 'history'] }
        ],
        environmentPreferences: aiOptimization.environmentPreferences || {
          musicType: 'ambient',
          noiseLevel: 'quiet',
          lightingPreference: 'bright'
        },
        lastUpdated: new Date().toISOString()
      };
    } catch (parseError) {
      console.error('Failed to parse AI optimization:', parseError);
      return generateFallbackOptimization(userId, sessionAnalysis);
    }

  } catch (error) {
    console.error('Error generating AI optimization:', error);
    return generateFallbackOptimization(userId, sessionAnalysis);
  }
}

function analyzeStudySessions(sessions: StudySession[]) {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      averageDuration: 0,
      subjectFrequency: {},
      timePatterns: {},
      effectivenessScores: []
    };
  }

  const totalSessions = sessions.length;
  const durations = sessions.filter(s => s.duration).map(s => s.duration!);
  const averageDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 45;

  const subjectFrequency: Record<string, number> = {};
  const timePatterns: Record<string, number> = {};
  const effectivenessScores: number[] = [];

  sessions.forEach(session => {
    // Subject frequency
    subjectFrequency[session.subject] = (subjectFrequency[session.subject] || 0) + 1;

    // Time patterns
    const hour = new Date(session.startTime).getHours();
    const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
    timePatterns[timeSlot] = (timePatterns[timeSlot] || 0) + 1;

    // Effectiveness scores
    if (session.effectiveness) {
      effectivenessScores.push(session.effectiveness);
    }
  });

  return {
    totalSessions,
    averageDuration,
    subjectFrequency,
    timePatterns,
    effectivenessScores
  };
}

function generateFallbackOptimization(userId: string, analysis: any): StudySessionOptimization {
  // Find most productive time slots
  const bestTimes = Object.entries(analysis.timePatterns)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([time]) => `${time}-${(parseInt(time) + 1).toString().padStart(2, '0')}:00`);

  // Order subjects by frequency (most studied first)
  const subjectOrder = Object.entries(analysis.subjectFrequency)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .map(([subject]) => subject as SubjectArea);

  return {
    userId,
    optimalSessionDuration: Math.max(30, Math.min(60, analysis.averageDuration || 45)),
    bestStudyTimes: bestTimes.length > 0 ? bestTimes : ['09:00-10:00', '14:00-15:00', '19:00-20:00'],
    preferredSubjectOrder: subjectOrder.length > 0 ? subjectOrder : ['mathematics', 'science', 'english'],
    breakFrequency: 25, // Pomodoro technique
    breakDuration: 5,
    focusPatterns: [
      { timeOfDay: '09:00-11:00', focusLevel: 8, subjects: ['mathematics', 'science'] },
      { timeOfDay: '14:00-16:00', focusLevel: 7, subjects: ['english', 'history'] },
      { timeOfDay: '19:00-21:00', focusLevel: 6, subjects: ['art', 'music'] }
    ],
    environmentPreferences: {
      musicType: 'ambient',
      noiseLevel: 'quiet',
      lightingPreference: 'bright'
    },
    lastUpdated: new Date().toISOString()
  };
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

    let optimization = optimizationData[userId];

    // If no optimization data exists, generate it
    if (!optimization) {
      // In a real app, fetch user's study sessions from database
      const mockSessions: StudySession[] = []; // This would be fetched from database
      optimization = await generateOptimizationRecommendations(userId, mockSessions);
      optimizationData[userId] = optimization;
    }

    return NextResponse.json(optimization);

  } catch (error) {
    console.error('Error fetching study optimization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study optimization' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, studySessions = [] } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Generate new optimization recommendations
    const optimization = await generateOptimizationRecommendations(userId, studySessions);
    optimizationData[userId] = optimization;

    return NextResponse.json(optimization);

  } catch (error) {
    console.error('Error generating study optimization:', error);
    return NextResponse.json(
      { error: 'Failed to generate study optimization' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updates = await request.json();
    const currentOptimization = optimizationData[userId];

    if (!currentOptimization) {
      return NextResponse.json(
        { error: 'Optimization data not found' },
        { status: 404 }
      );
    }

    // Update the optimization data
    optimizationData[userId] = {
      ...currentOptimization,
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(optimizationData[userId]);

  } catch (error) {
    console.error('Error updating study optimization:', error);
    return NextResponse.json(
      { error: 'Failed to update study optimization' },
      { status: 500 }
    );
  }
}