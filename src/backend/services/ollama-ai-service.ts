// Note: spawn import removed as it's not currently used in this service

interface OllamaResponse {
  response: string;
  done: boolean;
}

export class OllamaAIService {
  private baseUrl = 'http://localhost:11434';
  private defaultModel = 'qwen2.5:3b-instruct'; // Good for educational content

  async generateText(prompt: string, model?: string): Promise<string> {
    const selectedModel = model || this.defaultModel;
    
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 1000
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data: OllamaResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama generation error:', error);
      throw error;
    }
  }

  async generateBrainstormIdeas(prompt: string, projectType: string): Promise<string[]> {
    const brainstormPrompt = `You are a creative educational assistant. Generate 5 innovative and practical ideas for a ${projectType} project based on this prompt: "${prompt}".

Format your response as a numbered list (1. 2. 3. 4. 5.) with brief descriptions for each idea. Be creative, educational, and age-appropriate.

Example format:
1. Interactive digital storytelling platform
2. Collaborative research project with peer review
3. Gamified learning experience with achievements
4. Real-world problem-solving simulation
5. Creative multimedia presentation

Now generate ideas for: ${prompt}`;

    try {
      const response = await this.generateText(brainstormPrompt, 'qwen2.5:3b-instruct');
      
      // Parse the response into an array of ideas
      const ideas = response
        .split('\n')
        .filter(line => line.trim().match(/^\d+\./))
        .map(line => line.trim())
        .slice(0, 5);

      return ideas.length > 0 ? ideas : [
        '1. Interactive project with hands-on learning',
        '2. Collaborative group work with peer feedback',
        '3. Research-based investigation with presentation',
        '4. Creative expression through multimedia',
        '5. Problem-solving challenge with real-world application'
      ];
    } catch (error) {
      console.error('Brainstorm generation error:', error);
      return [
        '1. Interactive project with hands-on learning',
        '2. Collaborative group work with peer feedback', 
        '3. Research-based investigation with presentation',
        '4. Creative expression through multimedia',
        '5. Problem-solving challenge with real-world application'
      ];
    }
  }

  async provideFeedback(content: string, projectType: string): Promise<string> {
    const feedbackPrompt = `You are an experienced educational mentor. Provide constructive, encouraging feedback for this ${projectType} content:

"${content}"

Please provide feedback in this format:

**Strengths:**
- [List 2-3 positive aspects]

**Areas for Improvement:**
- [List 2-3 specific suggestions]

**Suggestions:**
- [List 2-3 actionable recommendations]

**Overall Assessment:**
[Brief encouraging summary with next steps]

Keep the tone supportive, specific, and educational. Focus on learning outcomes and skill development.`;

    try {
      const response = await this.generateText(feedbackPrompt, 'qwen2.5:3b-instruct');
      return response;
    } catch (error) {
      console.error('Feedback generation error:', error);
      return `**Feedback for your ${projectType}:**

**Strengths:**
- Clear structure and good organization
- Demonstrates understanding of key concepts
- Shows effort and creativity

**Areas for Improvement:**
- Consider adding more specific examples
- Expand on key points with additional detail
- Include more interactive or engaging elements

**Suggestions:**
- Break complex ideas into smaller, digestible sections
- Add visual elements or multimedia to enhance understanding
- Consider peer collaboration or feedback integration

**Overall Assessment:**
This shows good foundation work. With some refinements and additional development, this could be very effective. Keep building on these strong fundamentals!`;
    }
  }

  async generateLearningContent(topic: string, difficulty: string, studentProfile?: unknown): Promise<{
    topic: string;
    difficulty: string;
    content: string;
    generatedAt: string;
    estimatedTime: string;
    type: string;
  }> {
    // Build content prompt with optional student profile customization
    let contentPrompt = `You are an expert curriculum designer. Create educational content for the topic "${topic}" at ${difficulty} level.

Generate a structured learning module with:

1. **Learning Objectives** (3-4 clear, measurable goals)
2. **Key Concepts** (main ideas to understand)
3. **Activities** (3-4 engaging learning activities)
4. **Assessment** (how to measure understanding)
5. **Resources** (additional materials or references)

Make it engaging, age-appropriate for ${difficulty} level, and include practical applications.

Topic: ${topic}
Difficulty: ${difficulty}`;

    // Add student profile customization if provided
    if (studentProfile && typeof studentProfile === 'object' && studentProfile !== null) {
      const profile = studentProfile as Record<string, unknown>;
      if (profile.learningStyle) {
        contentPrompt += `\n\nStudent Learning Style: ${profile.learningStyle}`;
      }
      if (profile.interests && Array.isArray(profile.interests)) {
        contentPrompt += `\nStudent Interests: ${profile.interests.join(', ')}`;
      }
      contentPrompt += '\n\nPlease customize the content to match the student\'s learning style and interests.';
    }

    try {
      const response = await this.generateText(contentPrompt, 'qwen2.5:3b-instruct');
      
      return {
        topic,
        difficulty,
        content: response,
        generatedAt: new Date().toISOString(),
        estimatedTime: this.estimateTime(difficulty),
        type: 'ai-generated'
      };
    } catch (error) {
      console.error('Learning content generation error:', error);
      return {
        topic,
        difficulty,
        content: `# ${topic} - ${difficulty} Level

## Learning Objectives
- Understand the fundamental concepts of ${topic}
- Apply knowledge through practical exercises
- Develop critical thinking skills
- Build confidence in the subject area

## Key Concepts
- Core principles and definitions
- Real-world applications
- Common challenges and solutions
- Best practices and techniques

## Activities
1. Interactive exploration and discovery
2. Hands-on practice exercises
3. Collaborative problem-solving
4. Creative project development

## Assessment
- Knowledge check quizzes
- Practical application tasks
- Peer review and feedback
- Self-reflection exercises

## Resources
- Additional reading materials
- Online tutorials and videos
- Practice exercises and examples
- Community discussion forums`,
        generatedAt: new Date().toISOString(),
        estimatedTime: this.estimateTime(difficulty),
        type: 'fallback-content'
      };
    }
  }

  private estimateTime(difficulty: string): string {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return '2-3 weeks';
      case 'intermediate': return '4-6 weeks';
      case 'advanced': return '6-8 weeks';
      default: return '4 weeks';
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.log('Ollama service not available:', error);
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) return [];

      const data = await response.json();
      return data.models?.map((model: { name: string }) => model.name) || [];
    } catch (error) {
      console.log('Failed to get available models:', error);
      return [];
    }
  }
}

// Create instance that can be mocked in tests
let _ollamaAI: OllamaAIService | null = null;

export function getOllamaAI(): OllamaAIService {
  if (!_ollamaAI) {
    _ollamaAI = new OllamaAIService();
  }
  return _ollamaAI;
}

// For test mocking
export function setOllamaAI(instance: OllamaAIService): void {
  _ollamaAI = instance;
}

// Default export for backward compatibility
export const ollamaAI = getOllamaAI();
