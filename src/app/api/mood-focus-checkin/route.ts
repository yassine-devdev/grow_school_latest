import { NextRequest, NextResponse } from 'next/server';
import { moodFocusCheckInAPI } from '../../../backend/api/moodFocusCheckIn';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const analytics = searchParams.get('analytics') === 'true';
    const recommendations = searchParams.get('recommendations') === 'true';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    if (analytics) {
      const analyticsData = await moodFocusCheckInAPI.getAnalytics(userId);
      return NextResponse.json({
        success: true,
        analytics: analyticsData
      });
    }

    if (recommendations) {
      const recommendationsData = await moodFocusCheckInAPI.getRecommendations(userId);
      return NextResponse.json({
        success: true,
        recommendations: recommendationsData
      });
    }

    const entries = await moodFocusCheckInAPI.getUserEntries(userId);
    return NextResponse.json({
      success: true,
      entries
    });

  } catch (error: any) {
    console.error('Mood focus check-in retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entry = await moodFocusCheckInAPI.createEntry(body);

    return NextResponse.json({
      success: true,
      entry
    }, { status: 201 });

  } catch (error: any) {
    console.error('Mood focus check-in creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const entry = await moodFocusCheckInAPI.updateEntry(id, body);

    return NextResponse.json({
      success: true,
      entry
    });

  } catch (error: any) {
    console.error('Mood focus check-in update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    await moodFocusCheckInAPI.deleteEntry(id);

    return NextResponse.json({
      success: true,
      message: 'Entry deleted successfully'
    });

  } catch (error: any) {
    console.error('Mood focus check-in deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}