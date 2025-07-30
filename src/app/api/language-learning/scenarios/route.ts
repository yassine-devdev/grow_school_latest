import { NextRequest, NextResponse } from 'next/server';
import { LanguageLearningService } from '../../../../backend/services/languageLearningService';
import { LanguageCode, ConversationDifficulty } from '../../../../types/language-learning';

const languageLearningService = new LanguageLearningService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') as LanguageCode;
    const difficulty = searchParams.get('difficulty') as ConversationDifficulty;

    if (!language) {
      return NextResponse.json(
        { error: 'Language parameter is required' },
        { status: 400 }
      );
    }

    const scenarios = languageLearningService.getConversationScenarios(language, difficulty);
    return NextResponse.json(scenarios);
  } catch (error) {
    console.error('Error fetching conversation scenarios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation scenarios' },
      { status: 500 }
    );
  }
}