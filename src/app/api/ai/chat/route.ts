import { ollamaClient } from '@/lib/ollama-client';

// Define interfaces for type safety
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  systemInstruction?: string;
}

export async function POST(request: Request) {
  try {
    // Check if Ollama service is available
    if (!ollamaClient) {
      return new Response(JSON.stringify({
        error: 'Ollama AI service is not configured. Please ensure Ollama is running locally.'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const {
      message,
      history = [],
      systemInstruction
    }: ChatRequest = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({
        error: 'Message is required and must be a string'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Construct prompt from history and current message
    const historyText = history.map((msg: ChatMessage) => `${msg.role}: ${msg.content}`).join('\n');
    const fullPrompt = `${systemInstruction || 'You are a helpful AI assistant.'}\n\n${historyText}\nuser: ${message}\nassistant:`;

    // Use Ollama for AI generation
    const response = await ollamaClient.generate(fullPrompt, 'llama3.2', {
      temperature: 0.7,
      stream: false
    });

    return new Response(JSON.stringify({
      response: response,
      provider: 'ollama',
      model: 'llama3.2'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An internal error occurred";
    console.error('AI Chat API Error:', errorMessage);

    return new Response(JSON.stringify({
      error: 'An internal error occurred while processing the AI request.',
      details: errorMessage,
      provider: 'ollama'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
