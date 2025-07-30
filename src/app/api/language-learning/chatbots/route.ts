import { NextRequest, NextResponse } from 'next/server';
import { LanguageLearningService } from '../../../../backend/services/languageLearningService';
import { LanguageCode } from '../../../../types/language-learning';

const languageLearningService = new LanguageLearningService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') as LanguageCode;

    if (!language) {
      return NextResponse.json(
        { error: 'Language parameter is required' },
        { status: 400 }
      );
    }

    const chatbots = languageLearningService.getChatbotsForLanguage(language);
    return NextResponse.json(chatbots);
  } catch (error) {
    console.error('Error fetching chatbots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chatbots' },
      { status: 500 }
    );
  }
}