import { NextRequest, NextResponse } from 'next/server';
import { LanguageLearningService } from '../../../../../backend/services/languageLearningService';
import { LanguageCode } from '../../../../../types/language-learning';

const languageLearningService = new LanguageLearningService();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as LanguageCode;
    const userId = formData.get('userId') as string;
    const expectedText = formData.get('expectedText') as string;

    if (!audioFile || !language || !userId) {
      return NextResponse.json(
        { error: 'audio, language, and userId are required' },
        { status: 400 }
      );
    }

    // Convert audio file to URL (in a real implementation, you'd upload to storage)
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type });
    const audioUrl = URL.createObjectURL(audioBlob);

    const analysis = await languageLearningService.analyzeSpeech(
      userId,
      audioUrl,
      expectedText || 'Hello world', // Default text if none provided
      language
    );

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing speech:', error);
    return NextResponse.json(
      { error: 'Failed to analyze speech' },
      { status: 500 }
    );
  }
}