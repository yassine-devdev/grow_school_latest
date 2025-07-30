import { NextRequest, NextResponse } from 'next/server';
import { LanguageLearningService } from '../../../../backend/services/languageLearningService';

const languageLearningService = new LanguageLearningService();

export async function GET(request: NextRequest) {
  try {
    const languages = languageLearningService.getSupportedLanguages();
    return NextResponse.json(languages);
  } catch (error) {
    console.error('Error fetching supported languages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supported languages' },
      { status: 500 }
    );
  }
}