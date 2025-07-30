import { NextRequest, NextResponse } from 'next/server';
import { LanguageLearningService } from '../../../../../backend/services/languageLearningService';

const languageLearningService = new LanguageLearningService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message, audioUrl } = body;

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: 'sessionId and message are required' },
        { status: 400 }
      );
    }

    const response = await languageLearningService.sendMessageToChatbot(
      sessionId,
      message,
      audioUrl
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error sending message to chatbot:', error);
    return NextResponse.json(
      { error: 'Failed to send message to chatbot' },
      { status: 500 }
    );
  }
}