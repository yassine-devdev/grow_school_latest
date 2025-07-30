import { creativeAssistantAPI } from '../api/creative-assistant';

export interface CreativeAssistantRequest {
  type: 'brainstorm' | 'feedback' | 'outline' | 'generate' | 'prompts';
  prompt: string;
  projectType: string;
  userId: string;
  style?: string;
  difficulty?: string;
}

export interface CreativeAssistantResponse {
  success: boolean;
  data?: string | string[] | unknown;
  error?: string;
}

export class CreativeAssistantService {
  async processRequest(request: CreativeAssistantRequest): Promise<CreativeAssistantResponse> {
    try {
      let result;

      switch (request.type) {
        case 'brainstorm':
          result = await creativeAssistantAPI.generateBrainstormIdeas(request.prompt, request.projectType);
          break;

        case 'feedback':
          result = await creativeAssistantAPI.provideFeedback(request.prompt, request.projectType);
          break;

        case 'outline':
          result = await creativeAssistantAPI.generateOutline(
            request.prompt, 
            request.projectType, 
            'Generated outline'
          );
          break;

        case 'generate':
          result = await creativeAssistantAPI.generateContent(
            request.prompt, 
            request.projectType, 
            request.style
          );
          break;

        case 'prompts':
          result = await creativeAssistantAPI.generatePrompts(
            request.projectType, 
            request.difficulty || 'intermediate'
          );
          break;

        default:
          throw new Error(`Unsupported request type: ${request.type}`);
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Creative Assistant Service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async generateBrainstormIdeas(prompt: string, projectType: string, userId: string): Promise<CreativeAssistantResponse> {
    return this.processRequest({
      type: 'brainstorm',
      prompt,
      projectType,
      userId
    });
  }

  async provideFeedback(content: string, projectType: string, userId: string): Promise<CreativeAssistantResponse> {
    return this.processRequest({
      type: 'feedback',
      prompt: content,
      projectType,
      userId
    });
  }

  async generateOutline(title: string, projectType: string, userId: string): Promise<CreativeAssistantResponse> {
    return this.processRequest({
      type: 'outline',
      prompt: title,
      projectType,
      userId
    });
  }

  async generateContent(prompt: string, projectType: string, userId: string, style?: string): Promise<CreativeAssistantResponse> {
    return this.processRequest({
      type: 'generate',
      prompt,
      projectType,
      userId,
      style
    });
  }

  async generatePrompts(category: string, difficulty: string, userId: string): Promise<CreativeAssistantResponse> {
    return this.processRequest({
      type: 'prompts',
      prompt: '',
      projectType: category,
      userId,
      difficulty
    });
  }
}

export const creativeAssistantService = new CreativeAssistantService();
