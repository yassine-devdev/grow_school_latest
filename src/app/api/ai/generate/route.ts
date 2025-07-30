import { ollamaClient } from '@/lib/ollama-client';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
        return new Response(JSON.stringify({ error: 'Prompt is required for generation' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const text = await ollamaClient.generate(prompt);

    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Generation API Error:', error);
    const fallbackText = ollamaClient.getFallbackResponse('general');
    return new Response(JSON.stringify({ text: fallbackText, error: 'AI service unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
