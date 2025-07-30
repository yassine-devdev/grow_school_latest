import { NextRequest, NextResponse } from 'next/server';
import { journalService } from '@/backend/services/journalService';

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

    const analytics = await journalService.getAnalytics(userId);

    return NextResponse.json({
      success: true,
      analytics
    });

  } catch (error: any) {
    console.error('Journal analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}