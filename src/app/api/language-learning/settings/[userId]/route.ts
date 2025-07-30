import { NextRequest, NextResponse } from 'next/server';
import { LanguageLearningService } from '../../../../../backend/services/languageLearningService';

const languageLearningService = new LanguageLearningService();

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

    const settings = await languageLearningService.getLanguageLearningSettings(userId);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching language learning settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch language learning settings' },
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
    const settings = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await languageLearningService.saveLanguageLearningSettings(userId, {
      ...settings,
      userId,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving language learning settings:', error);
    return NextResponse.json(
      { error: 'Failed to save language learning settings' },
      { status: 500 }
    );
  }
}