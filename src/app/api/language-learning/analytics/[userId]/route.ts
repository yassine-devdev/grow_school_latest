import { NextRequest, NextResponse } from 'next/server';
import { LanguageLearningService } from '../../../../../backend/services/languageLearningService';
import { LanguageCode } from '../../../../../types/language-learning';

const languageLearningService = new LanguageLearningService();

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') as LanguageCode;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!language) {
      return NextResponse.json(
        { error: 'Language parameter is required' },
        { status: 400 }
      );
    }

    const dateRange = {
      startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: endDate || new Date().toISOString()
    };

    const analytics = await languageLearningService.getLanguageLearningAnalytics(
      userId,
      language,
      dateRange
    );

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching language learning analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch language learning analytics' },
      { status: 500 }
    );
  }
}