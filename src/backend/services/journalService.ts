import { db } from '../db';

export interface JournalEntry {
  id?: string;
  userId: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  isPrivate: boolean;
  created?: string;
  updated?: string;
}

export interface JournalAnalytics {
  totalEntries: number;
  averageMood: number;
  commonTags: string[];
  writingStreak: number;
  growthInsights: string[];
}

export class JournalService {
  private collection = 'journal_entries';

  async createEntry(entry: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
    return await db.create(this.collection, entry) as unknown as JournalEntry;
  }

  async getEntry(id: string): Promise<JournalEntry> {
    return await db.getById(this.collection, id) as unknown as JournalEntry;
  }

  async getUserEntries(userId: string): Promise<JournalEntry[]> {
    return await db.search(this.collection, `userId = "${userId}"`, {
      sort: '-created'
    }) as unknown as JournalEntry[];
  }

  async updateEntry(id: string, entry: Partial<JournalEntry>): Promise<JournalEntry> {
    return await db.update(this.collection, id, entry) as unknown as JournalEntry;
  }

  async deleteEntry(id: string): Promise<void> {
    await db.delete(this.collection, id);
  }

  async searchEntries(userId: string, query: string): Promise<JournalEntry[]> {
    return await db.search(
      this.collection,
      `userId = "${userId}" && (title ~ "${query}" || content ~ "${query}")`
    ) as unknown as JournalEntry[];
  }

  async getEntriesByDateRange(userId: string, startDate: string, endDate: string): Promise<JournalEntry[]> {
    return await db.search(
      this.collection,
      `userId = "${userId}" && created >= "${startDate}" && created <= "${endDate}"`
    ) as unknown as JournalEntry[];
  }

  async getAnalytics(userId: string): Promise<JournalAnalytics> {
    try {
      const entries = await this.getUserEntries(userId);
      
      // Calculate analytics
      const totalEntries = entries.length;
      const moods = entries.filter(e => e.mood).map(e => this.moodToNumber(e.mood!));
      const averageMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 0;
      
      // Get common tags
      const allTags = entries.flatMap(e => e.tags || []);
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const commonTags = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([tag]) => tag);

      // Calculate writing streak (simplified)
      const writingStreak = this.calculateWritingStreak(entries);

      // Generate growth insights
      const growthInsights = this.generateGrowthInsights(entries);

      return {
        totalEntries,
        averageMood,
        commonTags,
        writingStreak,
        growthInsights
      };
    } catch (error) {
      console.error('Error calculating journal analytics:', error);
      return {
        totalEntries: 0,
        averageMood: 0,
        commonTags: [],
        writingStreak: 0,
        growthInsights: []
      };
    }
  }

  private moodToNumber(mood: string): number {
    const moodMap: Record<string, number> = {
      'very-sad': 1,
      'sad': 2,
      'neutral': 3,
      'happy': 4,
      'very-happy': 5
    };
    return moodMap[mood] || 3;
  }

  private calculateWritingStreak(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0;
    
    // Simplified streak calculation
    const today = new Date();
    let streak = 0;
    const currentDate = new Date(today);
    
    for (let i = 0; i < 30; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasEntry = entries.some(entry => 
        entry.created?.startsWith(dateStr)
      );
      
      if (hasEntry) {
        streak++;
      } else {
        break;
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  }

  private generateGrowthInsights(entries: JournalEntry[]): string[] {
    const insights: string[] = [];
    
    if (entries.length > 10) {
      insights.push('You\'ve been consistently journaling - great for self-reflection!');
    }
    
    if (entries.length > 0) {
      const recentEntries = entries.slice(0, 5);
      const avgLength = recentEntries.reduce((sum, entry) => sum + entry.content.length, 0) / recentEntries.length;
      
      if (avgLength > 500) {
        insights.push('Your recent entries show deep thoughtfulness and detail.');
      }
    }
    
    const commonWords = this.getCommonWords(entries);
    if (commonWords.includes('grateful') || commonWords.includes('thankful')) {
      insights.push('You frequently express gratitude - a positive mindset indicator!');
    }
    
    if (insights.length === 0) {
      insights.push('Keep journaling to unlock personalized insights about your growth!');
    }
    
    return insights;
  }

  private getCommonWords(entries: JournalEntry[]): string[] {
    const allText = entries.map(e => e.content.toLowerCase()).join(' ');
    const words = allText.split(/\s+/).filter(word => word.length > 3);
    const wordCounts = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(wordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }
}

export const journalService = new JournalService();
