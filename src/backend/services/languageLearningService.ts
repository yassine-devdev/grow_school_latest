import { db } from '../db';

export interface LanguageLearningSession {
  id?: string;
  userId: string;
  language: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  type: 'conversation' | 'grammar' | 'vocabulary' | 'pronunciation';
  content: string;
  score?: number;
  duration: number;
  created?: string;
}

export interface LanguageLearningAnalytics {
  totalSessions: number;
  averageScore: number;
  totalStudyTime: number;
  strongestSkills: string[];
  areasForImprovement: string[];
  progressTrend: number[];
}

export interface ChatMessage {
  id?: string;
  sessionId: string;
  sender: 'user' | 'ai';
  message: string;
  timestamp: string;
  corrections?: string[];
}

export class LanguageLearningService {
  private sessionsCollection = 'language_sessions';
  private messagesCollection = 'language_messages';

  async createSession(session: Omit<LanguageLearningSession, 'id'>): Promise<LanguageLearningSession> {
    return await db.create(this.sessionsCollection, session) as LanguageLearningSession;
  }

  async getSession(id: string): Promise<LanguageLearningSession> {
    return await db.getById(this.sessionsCollection, id) as LanguageLearningSession;
  }

  async getUserSessions(userId: string): Promise<LanguageLearningSession[]> {
    return await db.search(this.sessionsCollection, `userId = "${userId}"`, {
      sort: '-created'
    }) as LanguageLearningSession[];
  }

  async updateSession(id: string, session: Partial<LanguageLearningSession>): Promise<LanguageLearningSession> {
    return await db.update(this.sessionsCollection, id, session) as LanguageLearningSession;
  }

  async deleteSession(id: string): Promise<void> {
    await db.delete(this.sessionsCollection, id);
  }

  async getAnalytics(userId: string): Promise<LanguageLearningAnalytics> {
    try {
      const sessions = await this.getUserSessions(userId);
      
      const totalSessions = sessions.length;
      const scores = sessions.filter(s => s.score).map(s => s.score!);
      const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const totalStudyTime = sessions.reduce((total, session) => total + session.duration, 0);
      
      // Analyze strongest skills and areas for improvement
      const skillCounts = sessions.reduce((acc, session) => {
        acc[session.type] = (acc[session.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const strongestSkills = Object.entries(skillCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([skill]) => skill);
      
      const areasForImprovement = Object.entries(skillCounts)
        .sort(([,a], [,b]) => a - b)
        .slice(0, 2)
        .map(([skill]) => skill);
      
      // Generate progress trend (last 7 sessions)
      const recentSessions = sessions.slice(0, 7).reverse();
      const progressTrend = recentSessions.map(s => s.score || 0);
      
      return {
        totalSessions,
        averageScore,
        totalStudyTime,
        strongestSkills,
        areasForImprovement,
        progressTrend
      };
    } catch (error) {
      console.error('Error calculating language learning analytics:', error);
      return {
        totalSessions: 0,
        averageScore: 0,
        totalStudyTime: 0,
        strongestSkills: [],
        areasForImprovement: [],
        progressTrend: []
      };
    }
  }

  async startChatSession(userId: string, language: string, level: string): Promise<LanguageLearningSession> {
    const session = await this.createSession({
      userId,
      language,
      level: level as 'beginner' | 'intermediate' | 'advanced',
      type: 'conversation',
      content: 'Chat session started',
      duration: 0
    });

    // Send initial AI message
    await this.sendMessage(session.id!, 'ai', this.getInitialMessage(language, level));
    
    return session;
  }

  async sendMessage(sessionId: string, sender: 'user' | 'ai', message: string): Promise<ChatMessage> {
    const chatMessage = {
      sessionId,
      sender,
      message,
      timestamp: new Date().toISOString(),
      corrections: sender === 'ai' ? this.generateCorrections(message) : undefined
    };

    return await db.create(this.messagesCollection, chatMessage) as ChatMessage;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return await db.search(this.messagesCollection, `sessionId = "${sessionId}"`, {
      sort: 'timestamp'
    }) as ChatMessage[];
  }

  async generateAIResponse(sessionId: string, userMessage: string, language: string): Promise<string> {
    // Mock AI response generation - personalized based on session and message
    const sessionHash = sessionId.length % 5;
    const messageLength = userMessage.length;

    const responses = [
      `That's interesting! Can you tell me more about that in ${language}?`,
      `Great! Let me help you practice that phrase. Try saying it again.`,
      `I notice you used that word correctly. Well done!`,
      `Let's practice a different topic. What did you do yesterday?`,
      `Your pronunciation is improving! Keep practicing.`
    ];

    // Add context-aware responses
    if (messageLength > 50) {
      responses.push(`Wow, that's a detailed response in ${language}! Your fluency is improving.`);
    } else if (messageLength < 10) {
      responses.push(`Try to elaborate more in ${language}. Can you add more details?`);
    }

    // Add session-specific responses
    if (sessionHash === 0) {
      responses.push(`I see this is session ${sessionId.slice(-4)}. Let's focus on conversation flow.`);
    }

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getInitialMessage(language: string, level: string): string {
    const greetings = {
      spanish: '¡Hola! ¿Cómo estás? Let\'s practice Spanish together!',
      french: 'Bonjour! Comment allez-vous? Let\'s practice French!',
      german: 'Hallo! Wie geht es Ihnen? Let\'s practice German!',
      italian: 'Ciao! Come stai? Let\'s practice Italian!',
      portuguese: 'Olá! Como está? Let\'s practice Portuguese!',
      chinese: '你好! 你好吗? Let\'s practice Chinese!',
      japanese: 'こんにちは! 元気ですか? Let\'s practice Japanese!',
      korean: '안녕하세요! 어떻게 지내세요? Let\'s practice Korean!'
    };

    const baseGreeting = greetings[language as keyof typeof greetings] || 'Hello! Let\'s start practicing!';

    // Add level-specific context
    const levelContext = {
      beginner: ' We\'ll start with basic phrases and vocabulary.',
      intermediate: ' We\'ll practice conversations and grammar.',
      advanced: ' We\'ll focus on fluency and complex topics.'
    };

    const context = levelContext[level as keyof typeof levelContext] || '';
    return baseGreeting + context;
  }

  private generateCorrections(message: string): string[] {
    // Mock correction generation
    const corrections: string[] = [];
    
    if (message.includes('I are')) {
      corrections.push('Use "I am" instead of "I are"');
    }
    
    if (message.includes('goed')) {
      corrections.push('Use "went" instead of "goed"');
    }
    
    return corrections;
  }

  async getRecommendations(userId: string): Promise<string[]> {
    const analytics = await this.getAnalytics(userId);
    const recommendations: string[] = [];
    
    if (analytics.averageScore < 70) {
      recommendations.push('Focus on basic vocabulary and grammar exercises');
    }
    
    if (analytics.areasForImprovement.includes('pronunciation')) {
      recommendations.push('Practice pronunciation with audio exercises');
    }
    
    if (analytics.totalStudyTime < 300) { // Less than 5 minutes total
      recommendations.push('Try to study for at least 10 minutes per day');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Keep up the great work! Try advanced conversation practice.');
    }
    
    return recommendations;
  }
}

export const languageLearningService = new LanguageLearningService();
