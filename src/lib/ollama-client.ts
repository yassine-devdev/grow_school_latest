/**
 * Ollama Client for Local AI Integration
 * Replaces Google Gemini AI with local Ollama models
 */

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface OllamaStreamResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  context?: number[];
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    repeat_penalty?: number;
    seed?: number;
    num_predict?: number;
  };
}

class OllamaClient {
  private baseUrl: string;
  private defaultModel: string;
  private timeout: number;

  constructor(
    baseUrl: string = process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    defaultModel: string = process.env.OLLAMA_MODEL || 'llama3.2',
    timeout: number = 30000
  ) {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
    this.timeout = timeout;
  }

  /**
   * Check if Ollama service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      console.warn('Ollama service not available:', error);
      return false;
    }
  }

  /**
   * Get list of available models
   */
  async getModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }

  /**
   * Generate text completion
   */
  async generate(
    prompt: string,
    model?: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    }
  ): Promise<string> {
    const requestModel = model || this.defaultModel;
    
    if (!await this.isAvailable()) {
      throw new Error('Ollama service is not available');
    }

    const requestBody: OllamaGenerateRequest = {
      model: requestModel,
      prompt,
      stream: false,
      options: {
        temperature: options?.temperature || 0.7,
        num_predict: options?.maxTokens || 1000,
      }
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OllamaResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error generating text:', error);
      throw new Error('Failed to generate text with Ollama');
    }
  }

  /**
   * Generate streaming text completion
   */
  async generateStream(
    prompt: string,
    model?: string,
    onChunk?: (chunk: string) => void,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const requestModel = model || this.defaultModel;
    
    if (!await this.isAvailable()) {
      throw new Error('Ollama service is not available');
    }

    const requestBody: OllamaGenerateRequest = {
      model: requestModel,
      prompt,
      stream: true,
      options: {
        temperature: options?.temperature || 0.7,
        num_predict: options?.maxTokens || 1000,
      }
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      let fullResponse = '';
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data: OllamaStreamResponse = JSON.parse(line);
              if (data.response) {
                fullResponse += data.response;
                onChunk?.(data.response);
              }
              if (data.done) {
                return fullResponse;
              }
            } catch (parseError) {
              // Skip invalid JSON lines
              continue;
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      return fullResponse;
    } catch (error) {
      console.error('Error generating streaming text:', error);
      throw new Error('Failed to generate streaming text with Ollama');
    }
  }

  /**
   * Chat completion (for conversational AI)
   */
  async chat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    model?: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    // Convert chat messages to a single prompt
    const prompt = messages
      .map(msg => {
        switch (msg.role) {
          case 'system':
            return `System: ${msg.content}`;
          case 'user':
            return `User: ${msg.content}`;
          case 'assistant':
            return `Assistant: ${msg.content}`;
          default:
            return msg.content;
        }
      })
      .join('\n') + '\nAssistant:';

    return this.generate(prompt, model, options);
  }

  /**
   * Get fallback response when Ollama is not available
   */
  getFallbackResponse(context: string = 'general'): string {
    const fallbackResponses = {
      general: 'AI service is currently unavailable. Please try again later.',
      brainstorm: 'Unable to generate brainstorm ideas at this time. Please try again later.',
      feedback: 'Unable to provide AI feedback at this time. Please try again later.',
      chat: 'AI chat is currently unavailable. Please try again later.',
      analysis: 'Unable to perform AI analysis at this time. Please try again later.',
      recommendations: 'Unable to generate recommendations at this time. Please try again later.'
    };

    return fallbackResponses[context as keyof typeof fallbackResponses] || fallbackResponses.general;
  }

  /**
   * Health check for the Ollama service
   */
  async healthCheck(): Promise<{
    available: boolean;
    models: string[];
    defaultModel: string;
    baseUrl: string;
  }> {
    const available = await this.isAvailable();
    const models = available ? await this.getModels() : [];

    return {
      available,
      models,
      defaultModel: this.defaultModel,
      baseUrl: this.baseUrl
    };
  }
}

// Create singleton instance
export const ollamaClient = new OllamaClient();

// Export types for use in other files
export type { OllamaResponse, OllamaStreamResponse, OllamaGenerateRequest };

// Compatibility layer for Google Gemini migration
export class OllamaCompatibilityLayer {
  private client: OllamaClient;

  constructor(client: OllamaClient) {
    this.client = client;
  }

  /**
   * Mimics GoogleGenerativeAI.getGenerativeModel()
   */
  getGenerativeModel(config: { model: string }) {
    return {
      generateContent: async (prompt: string) => {
        const response = await this.client.generate(prompt, config.model);
        return {
          response: {
            text: () => response
          }
        };
      },
      
      generateContentStream: async (prompt: string) => {
        let fullResponse = '';
        await this.client.generateStream(prompt, config.model, (chunk) => {
          fullResponse += chunk;
        });
        return {
          response: {
            text: () => fullResponse
          }
        };
      }
    };
  }
}

// Create compatibility instance
export const ollamaCompat = new OllamaCompatibilityLayer(ollamaClient);

export default ollamaClient;
