# AI Integration with Ollama

The **Grow School** platform integrates with Ollama for local AI capabilities, providing privacy-focused, on-premise AI features. This document outlines each AI-driven feature and its implementation in the application.

## Overview

Grow School uses Ollama as the primary AI service, replacing Google Gemini for enhanced privacy and control. Ollama provides local language model inference, ensuring student data remains secure and private.

### Key Benefits of Ollama Integration

- **Privacy**: All AI processing happens locally, no data sent to external services
- **Performance**: Reduced latency with local inference
- **Cost Control**: No per-request API costs
- **Customization**: Ability to fine-tune models for educational content
- **Offline Capability**: AI features work without internet connectivity

## Technical Architecture

### Ollama Client Configuration

```typescript
// lib/ollama-client.ts
import { Ollama } from 'ollama';

export class OllamaClient {
  private client: Ollama;

  constructor() {
    this.client = new Ollama({
      host: process.env.OLLAMA_URL || 'http://localhost:11434'
    });
  }

  async generateResponse(
    prompt: string,
    model: string = 'llama2',
    options?: GenerationOptions
  ): Promise<AIResponse> {
    try {
      const response = await this.client.generate({
        model,
        prompt,
        stream: false,
        options: {
          temperature: options?.temperature || 0.7,
          top_p: options?.top_p || 0.9,
          max_tokens: options?.max_tokens || 1000
        }
      });

      return {
        success: true,
        data: response.response,
        model: model,
        usage: {
          prompt_tokens: response.prompt_eval_count,
          completion_tokens: response.eval_count,
          total_tokens: response.prompt_eval_count + response.eval_count
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        model: model
      };
    }
  }

  async streamResponse(
    prompt: string,
    model: string = 'llama2',
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const stream = await this.client.generate({
      model,
      prompt,
      stream: true
    });

    for await (const chunk of stream) {
      onChunk(chunk.response);
    }
  }
}

export const ollamaClient = new OllamaClient();
```

## Core AI Features

### 1. Concierge AI Assistant

**Location**: `/app/concierge-ai`
**Component**: `/components/modules/concierge-ai/ConciergeChat.tsx`
**Hook**: `/hooks/useConciergeAI.ts`

A general-purpose conversational AI assistant that helps users navigate the platform and provides educational support.

```typescript
// hooks/useConciergeAI.ts
export function useConciergeAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: generateId(),
      content,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: 'llama2'
        })
      });

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: generateId(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading };
}
```

### 2. Creative Assistant

**Location**: `/app/creative-assistant`
**Component**: `/components/creative/BrainstormingTool.tsx`

AI-powered creative writing and brainstorming assistant for students.

```typescript
// backend/services/creativeAssistantService.ts
export class CreativeAssistantService {
  async generateBrainstormIdeas(
    prompt: string,
    type: 'writing' | 'art' | 'music' | 'general',
    userId: string
  ): Promise<CreativeResponse> {
    const systemPrompt = this.buildCreativePrompt(type);
    const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`;

    const response = await ollamaClient.generateResponse(
      fullPrompt,
      'llama2',
      { temperature: 0.8, max_tokens: 500 }
    );

    if (!response.success) {
      throw new Error('Failed to generate creative ideas');
    }

    const ideas = this.parseCreativeResponse(response.data);

    // Save to user's creative history
    await this.saveCreativeSession(userId, {
      prompt,
      type,
      ideas,
      timestamp: new Date()
    });

    return {
      success: true,
      ideas,
      type,
      prompt
    };
  }

  private buildCreativePrompt(type: string): string {
    const prompts = {
      writing: `You are a creative writing assistant for students. Generate 5-7 unique, age-appropriate creative writing ideas that are engaging and educational. Focus on:
      - Imaginative scenarios
      - Character development opportunities
      - Plot structures suitable for students
      - Themes that encourage critical thinking`,

      art: `You are an art teacher assistant. Suggest 5-7 creative art project ideas that are:
      - Achievable with common materials
      - Educationally valuable
      - Inspiring and fun
      - Suitable for different skill levels`,

      general: `You are a creative thinking assistant. Generate 5-7 innovative ideas that:
      - Encourage out-of-the-box thinking
      - Are practical and achievable
      - Promote learning and growth
      - Spark curiosity and exploration`
    };

    return prompts[type] || prompts.general;
  }
}
```

### 3. Study Assistant

**Location**: `/app/study-assistant`
**Component**: `/components/learning-guide/StudyHelper.tsx`

Personalized study support using Socratic method and adaptive questioning.

```typescript
// backend/services/studyAssistantService.ts
export class StudyAssistantService {
  async getStudyHelp(
    question: string,
    subject: string,
    studentLevel: string,
    userId: string
  ): Promise<StudyResponse> {
    const systemPrompt = `You are an educational tutor using the Socratic method. Instead of giving direct answers:
    1. Ask guiding questions to help the student think through the problem
    2. Provide hints and encouragement
    3. Break complex problems into smaller steps
    4. Celebrate progress and understanding

    Subject: ${subject}
    Student Level: ${studentLevel}

    Remember: Guide, don't tell. Help the student discover the answer themselves.`;

    const response = await ollamaClient.generateResponse(
      `${systemPrompt}\n\nStudent question: ${question}`,
      'llama2',
      { temperature: 0.6 }
    );

    if (!response.success) {
      throw new Error('Failed to generate study assistance');
    }

    // Track study session
    await this.trackStudySession(userId, {
      question,
      subject,
      response: response.data,
      timestamp: new Date()
    });

    return {
      success: true,
      guidance: response.data,
      subject,
      followUpQuestions: this.generateFollowUpQuestions(question, subject)
    };
  }
}
```

### 4. Language Learning Assistant

**Location**: `/app/language-learning`
**Component**: `/components/language-learning/ConversationPractice.tsx`

AI conversation partner for language practice and learning.

```typescript
// backend/services/languageLearningService.ts
export class LanguageLearningService {
  async startConversation(
    language: string,
    level: 'beginner' | 'intermediate' | 'advanced',
    topic: string,
    userId: string
  ): Promise<ConversationResponse> {
    const systemPrompt = this.buildLanguagePrompt(language, level, topic);

    const response = await ollamaClient.generateResponse(
      systemPrompt,
      'llama2',
      { temperature: 0.7 }
    );

    if (!response.success) {
      throw new Error('Failed to start conversation');
    }

    const conversationId = await this.createConversationSession(userId, {
      language,
      level,
      topic,
      startedAt: new Date()
    });

    return {
      success: true,
      conversationId,
      message: response.data,
      language,
      level
    };
  }

  private buildLanguagePrompt(language: string, level: string, topic: string): string {
    return `You are a friendly ${language} conversation partner.
    Student level: ${level}
    Topic: ${topic}

    Guidelines:
    - Use appropriate vocabulary for ${level} level
    - Encourage the student to respond in ${language}
    - Provide gentle corrections when needed
    - Ask engaging questions about ${topic}
    - Be patient and supportive

    Start a conversation about ${topic} in ${language}.`;
  }
}
```

### 5. Journal AI Assistant

**Location**: `/app/journal`
**Component**: `/components/journal/JournalAI.tsx`

AI assistant for journal writing prompts, reflection guidance, and emotional support.

```typescript
// backend/services/journalAIService.ts
export class JournalAIService {
  async generatePrompts(
    mood: string,
    previousEntries: JournalEntry[],
    userId: string
  ): Promise<PromptResponse> {
    const context = this.buildJournalContext(mood, previousEntries);

    const systemPrompt = `You are a supportive journal writing assistant. Generate 3-5 thoughtful, age-appropriate journal prompts that:
    - Encourage self-reflection and emotional awareness
    - Are relevant to the student's current mood and experiences
    - Promote positive thinking and growth mindset
    - Are engaging and not too overwhelming

    Current context: ${context}`;

    const response = await ollamaClient.generateResponse(
      systemPrompt,
      'llama2',
      { temperature: 0.8 }
    );

    if (!response.success) {
      throw new Error('Failed to generate journal prompts');
    }

    const prompts = this.parsePrompts(response.data);

    return {
      success: true,
      prompts,
      mood,
      timestamp: new Date()
    };
  }
}
```

## Model Management

### Supported Models

Grow School supports multiple Ollama models for different use cases:

```typescript
// lib/ai/model-config.ts
export const AI_MODELS = {
  // General conversation and assistance
  GENERAL: 'llama2',

  // Educational content generation
  EDUCATIONAL: 'llama2:4b',

  // Creative writing and brainstorming
  CREATIVE: 'llama2',

  // Code generation and technical content
  TECHNICAL: 'codellama',

  // Language learning and translation
  MULTILINGUAL: 'llama3'
} as const;

export function getModelForTask(task: AITask): string {
  const modelMap = {
    conversation: AI_MODELS.GENERAL,
    content_generation: AI_MODELS.EDUCATIONAL,
    creative_writing: AI_MODELS.CREATIVE,
    code_help: AI_MODELS.TECHNICAL,
    language_learning: AI_MODELS.MULTILINGUAL,
    tutoring: AI_MODELS.EDUCATIONAL,
    analysis: AI_MODELS.GENERAL
  };

  return modelMap[task] || AI_MODELS.GENERAL;
}
```

## Privacy and Security

### Data Protection

All AI interactions are designed with privacy in mind:

```typescript
// lib/ai/privacy-manager.ts
export class AIPrivacyManager {
  async sanitizeInput(input: string, userId: string): Promise<string> {
    // Remove personally identifiable information
    const sanitized = this.removePII(input);

    // Log sanitization for audit
    await this.logSanitization(userId, {
      original_length: input.length,
      sanitized_length: sanitized.length,
      timestamp: new Date()
    });

    return sanitized;
  }

  private removePII(text: string): string {
    // Remove names, addresses, phone numbers, etc.
    return text
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{1,5}\s\w+\s(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)\b/g, '[ADDRESS]');
  }
}
```

## Implementation Best Practices

### 1. Error Handling

All AI features follow consistent error handling patterns to ensure graceful degradation when AI services are unavailable.

### 2. Rate Limiting

User requests are rate-limited to prevent abuse and ensure fair resource allocation.

### 3. Privacy Protection

Student data is sanitized and encrypted, with all processing happening locally through Ollama.

### 4. Performance Monitoring

AI response times and quality are continuously monitored to ensure optimal user experience.

## Future Enhancements

### Planned AI Features

1. **Multi-modal AI**: Support for image and audio processing
2. **Advanced Analytics**: Predictive learning analytics
3. **Collaborative AI**: AI-facilitated group learning
4. **Adaptive Assessments**: AI-generated adaptive testing
5. **Emotional Intelligence**: Enhanced emotional support and recognition

The AI integration in Grow School represents a comprehensive approach to educational technology, prioritizing student privacy, learning effectiveness, and teacher empowerment while maintaining the highest standards of safety and ethics.
