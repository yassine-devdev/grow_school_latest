import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SubjectArea, StudySessionType, DifficultyLevel } from '@/types/study-assistant';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('Study Assistant disabled: GEMINI_API_KEY environment variable not found.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

interface StudyAssistantRequest {
  message: string;
  subject?: SubjectArea;
  sessionType?: StudySessionType;
  difficulty?: DifficultyLevel;
  context?: string;
  history?: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
  userId?: string;
}

function getSubjectSystemPrompt(subject: SubjectArea, sessionType: StudySessionType, difficulty: DifficultyLevel): string {
  const basePrompt = `You are an AI-powered virtual study assistant specializing in ${subject}. You are helping a student with ${sessionType} at a ${difficulty} level.

Your role is to:
1. Provide clear, accurate, and helpful explanations
2. Break down complex concepts into understandable parts
3. Offer step-by-step guidance for problem-solving
4. Suggest additional resources and practice opportunities
5. Encourage and motivate the student
6. Adapt your teaching style to the student's needs

Guidelines:
- Be patient and encouraging
- Use examples and analogies when helpful
- Ask clarifying questions when needed
- Provide hints before giving direct answers
- Suggest follow-up questions or topics
- Keep responses focused and concise
- Use appropriate academic language for the difficulty level`;

  const subjectSpecific = {
    mathematics: `
For mathematics:
- Show step-by-step solutions
- Explain the reasoning behind each step
- Highlight common mistakes to avoid
- Suggest practice problems
- Use visual representations when helpful`,
    
    science: `
For science:
- Explain scientific concepts with real-world examples
- Break down complex processes into steps
- Connect theory to practical applications
- Encourage scientific thinking and inquiry
- Suggest experiments or observations`,
    
    english: `
For English:
- Help with reading comprehension and analysis
- Assist with writing structure and grammar
- Provide vocabulary support
- Offer literary analysis techniques
- Suggest reading strategies`,
    
    history: `
For history:
- Provide historical context and connections
- Help analyze cause and effect relationships
- Suggest primary and secondary sources
- Encourage critical thinking about historical events
- Connect past events to present situations`,
    
    'foreign-language': `
For foreign language:
- Provide grammar explanations and examples
- Help with vocabulary and pronunciation
- Offer cultural context
- Suggest practice exercises
- Encourage conversation practice`,
    
    'computer-science': `
For computer science:
- Explain programming concepts clearly
- Provide code examples and debugging help
- Break down algorithms step-by-step
- Suggest coding practice problems
- Explain best practices and design patterns`,

    art: `
For art:
- Discuss artistic techniques and mediums
- Provide historical and cultural context
- Encourage creative expression and interpretation
- Suggest practice exercises and projects
- Connect art to other subjects and real life`,

    music: `
For music:
- Explain musical theory and concepts
- Discuss different genres and styles
- Help with practice techniques and performance
- Provide historical and cultural context
- Encourage listening and analysis skills`,

    'physical-education': `
For physical education:
- Explain movement techniques and form
- Discuss health and fitness concepts
- Provide safety guidelines and best practices
- Encourage goal setting and progress tracking
- Connect physical activity to overall wellness`,

    general: `
For general studies:
- Adapt to the specific topic being discussed
- Provide interdisciplinary connections
- Help with study strategies and organization
- Offer research guidance
- Support critical thinking skills`
  } as const;

  return basePrompt + (subjectSpecific[subject] || subjectSpecific.general);
}

export async function POST(request: NextRequest) {
  try {
    if (!genAI) {
      return NextResponse.json(
        { error: 'AI study assistant service is not configured' },
        { status: 503 }
      );
    }

    const {
      message,
      subject = 'general',
      sessionType = 'homework-help',
      difficulty = 'intermediate',
      context,
      history = [],
      userId
    }: StudyAssistantRequest = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const systemPrompt = getSubjectSystemPrompt(subject, sessionType, difficulty);
    
    // Add context if provided
    const contextualPrompt = context 
      ? `${systemPrompt}\n\nAdditional context: ${context}`
      : systemPrompt;

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // Format history for Gemini
    const formattedHistory = [
      { role: 'user' as const, parts: [{ text: contextualPrompt }] },
      { role: 'model' as const, parts: [{ text: 'I understand. I\'m ready to help you with your studies. What would you like to work on?' }] },
      ...history
    ];

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessageStream(message);

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(new TextEncoder().encode(chunkText));
            }
          }
          controller.close();
        } catch (streamError) {
          console.error("Error during stream processing:", streamError);
          controller.error(streamError);
        }
      },
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error('Study Assistant API Error:', error);
    const message = error instanceof Error ? error.message : "An internal error occurred";
    return NextResponse.json(
      { error: 'An internal error occurred while processing the study assistant request.', details: message },
      { status: 500 }
    );
  }
}