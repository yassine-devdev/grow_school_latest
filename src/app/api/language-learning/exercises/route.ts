import { NextRequest, NextResponse } from 'next/server';
import { LanguageCode, PracticeExercise } from '../../../../types/language-learning';

// Mock practice exercises data
const mockExercises: PracticeExercise[] = [
  {
    id: 'spanish-basic-words',
    title: 'Basic Spanish Words',
    description: 'Practice pronunciation of common Spanish words',
    language: 'es',
    type: 'pronunciation',
    difficulty: 'easy',
    estimatedTime: 10,
    instructions: [
      'Listen to the example pronunciation',
      'Record yourself saying the word',
      'Get feedback on your pronunciation'
    ],
    content: {
      targetWords: ['hola', 'gracias', 'por favor', 'adiós', 'buenos días', 'buenas noches'],
      audioExamples: [
        '/audio/es/hola.mp3',
        '/audio/es/gracias.mp3',
        '/audio/es/por-favor.mp3'
      ]
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'spanish-sentences',
    title: 'Spanish Sentences',
    description: 'Practice pronunciation of complete sentences',
    language: 'es',
    type: 'pronunciation',
    difficulty: 'medium',
    estimatedTime: 15,
    instructions: [
      'Listen to the example sentence',
      'Record yourself saying the complete sentence',
      'Focus on rhythm and intonation'
    ],
    content: {
      targetSentences: [
        'Me llamo María',
        '¿Cómo estás?',
        'Muy bien, gracias',
        '¿Dónde está el baño?',
        'No hablo español muy bien'
      ]
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'french-basic-words',
    title: 'Basic French Words',
    description: 'Practice pronunciation of common French words',
    language: 'fr',
    type: 'pronunciation',
    difficulty: 'easy',
    estimatedTime: 10,
    instructions: [
      'Listen to the example pronunciation',
      'Record yourself saying the word',
      'Pay attention to French vowel sounds'
    ],
    content: {
      targetWords: ['bonjour', 'merci', 's\'il vous plaît', 'au revoir', 'bonsoir', 'bonne nuit'],
      audioExamples: [
        '/audio/fr/bonjour.mp3',
        '/audio/fr/merci.mp3',
        '/audio/fr/sil-vous-plait.mp3'
      ]
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'german-basic-words',
    title: 'Basic German Words',
    description: 'Practice pronunciation of common German words',
    language: 'de',
    type: 'pronunciation',
    difficulty: 'easy',
    estimatedTime: 10,
    instructions: [
      'Listen to the example pronunciation',
      'Record yourself saying the word',
      'Focus on German consonant sounds'
    ],
    content: {
      targetWords: ['hallo', 'danke', 'bitte', 'auf wiedersehen', 'guten tag', 'gute nacht'],
      audioExamples: [
        '/audio/de/hallo.mp3',
        '/audio/de/danke.mp3',
        '/audio/de/bitte.mp3'
      ]
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') as LanguageCode;
    const type = searchParams.get('type');
    const difficulty = searchParams.get('difficulty');

    let exercises = mockExercises.filter(exercise => exercise.isActive);

    if (language) {
      exercises = exercises.filter(exercise => exercise.language === language);
    }

    if (type) {
      exercises = exercises.filter(exercise => exercise.type === type);
    }

    if (difficulty) {
      exercises = exercises.filter(exercise => exercise.difficulty === difficulty);
    }

    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Error fetching practice exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch practice exercises' },
      { status: 500 }
    );
  }
}