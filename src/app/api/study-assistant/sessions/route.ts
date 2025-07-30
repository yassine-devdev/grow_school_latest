import { NextRequest, NextResponse } from 'next/server';
import { StudySession, SubjectArea, StudySessionType } from '@/types/study-assistant';
import { nanoid } from 'nanoid';

// Mock data store - in a real app, this would be a database
let studySessions: StudySession[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const subject = searchParams.get('subject') as SubjectArea;
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredSessions = studySessions;

    if (userId) {
      filteredSessions = filteredSessions.filter(session => session.userId === userId);
    }

    if (subject) {
      filteredSessions = filteredSessions.filter(session => session.subject === subject);
    }

    // Sort by creation date (most recent first)
    filteredSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply limit
    const limitedSessions = filteredSessions.slice(0, limit);

    return NextResponse.json({
      sessions: limitedSessions,
      total: filteredSessions.length
    });

  } catch (error) {
    console.error('Error fetching study sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      subject,
      sessionType,
      title,
      description,
      learningObjectives = []
    } = await request.json();

    if (!userId || !subject || !sessionType || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, subject, sessionType, title' },
        { status: 400 }
      );
    }

    const newSession: StudySession = {
      id: nanoid(),
      userId,
      subject,
      sessionType,
      title,
      description,
      startTime: new Date().toISOString(),
      questions: [],
      responses: [],
      learningObjectives,
      completedObjectives: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    studySessions.push(newSession);

    return NextResponse.json(newSession, { status: 201 });

  } catch (error) {
    console.error('Error creating study session:', error);
    return NextResponse.json(
      { error: 'Failed to create study session' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const updates = await request.json();
    const sessionIndex = studySessions.findIndex(session => session.id === sessionId);

    if (sessionIndex === -1) {
      return NextResponse.json(
        { error: 'Study session not found' },
        { status: 404 }
      );
    }

    // Update the session
    studySessions[sessionIndex] = {
      ...studySessions[sessionIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(studySessions[sessionIndex]);

  } catch (error) {
    console.error('Error updating study session:', error);
    return NextResponse.json(
      { error: 'Failed to update study session' },
      { status: 500 }
    );
  }
}