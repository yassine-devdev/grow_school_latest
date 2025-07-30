import { NextRequest, NextResponse } from 'next/server';
import { LanguageLearningService } from '../../../../../backend/services/languageLearningService';

const languageLearningService = new LanguageLearningService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, chatbotId, scenarioId } = body;

    if (!userId || !chatbotId) {
      return NextResponse.json(
        { error: 'userId and chatbotId are required' },
        { status: 400 }
      );
    }

    const session = await languageLearningService.startChatSession(
      userId,
      chatbotId,
      scenarioId
    );

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error starting chat session:', error);
    return NextResponse.json(
      { error: 'Failed to start chat session' },
      { status: 500 }
    );
  }
}