import { NextRequest, NextResponse } from 'next/server';
import { moodFocusCheckInAPI } from '@/backend/api/moodFocusCheckIn';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const recommendations = await moodFocusCheckInAPI.getRecommendations(userId);

    return NextResponse.json({
      success: true,
      recommendations
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Mood recommendations error:', errorMessage);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
