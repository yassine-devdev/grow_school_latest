import { NextRequest, NextResponse } from 'next/server';
import { JournalService } from '../../../../backend/services/journalService';

const journalService = new JournalService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');
    const timeframe = searchParams.get('timeframe');

    if (type === 'random') {
      const prompt = await journalService.getRandomPrompt(category || undefined);
      return NextResponse.json(prompt);
    } else if (type === 'personalized' && userId) {
      const prompts = await journalService.getPersonalizedPrompts(userId);
      return NextResponse.json(prompts);
    } else if (type === 'growth-focused') {
      const prompts = await journalService.getGrowthFocusedPrompts();
      return NextResponse.json(prompts);
    } else if (timeframe) {
      const prompts = await journalService.getPromptsForTimeframe(timeframe as 'morning' | 'evening' | 'weekend');
      return NextResponse.json(prompts);
    } else if (category) {
      const prompts = await journalService.getReflectionPromptsByCategory(category);
      return NextResponse.json(prompts);
    } else {
      const prompts = await journalService.getReflectionPrompts();
      return NextResponse.json(prompts);
    }
  } catch (error) {
    console.error('Error fetching reflection prompts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, responses } = body;

    if (!userId || !responses) {
      return NextResponse.json(
        { error: 'User ID and responses are required' },
        { status: 400 }
      );
    }

    const insights = await journalService.generateReflectionInsights(userId, responses);
    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error generating reflection insights:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}