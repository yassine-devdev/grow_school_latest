import { db } from '../db';

export interface MoodFocusEntry {
  id?: string;
  userId: string;
  mood: 'very-sad' | 'sad' | 'neutral' | 'happy' | 'very-happy';
  focus: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
  energy: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
  stress: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
  notes?: string;
  tags?: string[];
  created?: string;
}

export interface MoodFocusAnalytics {
  averageMood: number;
  averageFocus: number;
  averageEnergy: number;
  averageStress: number;
  trends: {
    mood: number[];
    focus: number[];
    energy: number[];
    stress: number[];
  };
  insights: string[];
}

export class MoodFocusCheckInAPI {
  private collection = 'mood_focus_entries';

  async createEntry(entry: Omit<MoodFocusEntry, 'id'>): Promise<MoodFocusEntry> {
    return await db.create(this.collection, {
      ...entry,
      created: new Date().toISOString()
    });
  }

  async getUserEntries(userId: string, limit?: number): Promise<MoodFocusEntry[]> {
    return await db.search(this.collection, `userId = "${userId}"`, {
      sort: '-created',
      limit
    });
  }

  async getEntry(id: string): Promise<MoodFocusEntry> {
    return await db.getById(this.collection, id);
  }

  async updateEntry(id: string, entry: Partial<MoodFocusEntry>): Promise<MoodFocusEntry> {
    return await db.update(this.collection, id, entry);
  }

  async deleteEntry(id: string): Promise<void> {
    await db.delete(this.collection, id);
  }

  async getEntriesByDateRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<MoodFocusEntry[]> {
    return await db.search(
      this.collection,
      `userId = "${userId}" && created >= "${startDate}" && created <= "${endDate}"`
    );
  }

  async getAnalytics(userId: string, days: number = 30): Promise<MoodFocusAnalytics> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries = await this.getEntriesByDateRange(
      userId,
      startDate.toISOString(),
      endDate.toISOString()
    );

    if (entries.length === 0) {
      return {
        averageMood: 0,
        averageFocus: 0,
        averageEnergy: 0,
        averageStress: 0,
        trends: { mood: [], focus: [], energy: [], stress: [] },
        insights: ['No data available. Start tracking your mood and focus!']
      };
    }

    const moodValues = entries.map(e => this.scaleToNumber(e.mood));
    const focusValues = entries.map(e => this.scaleToNumber(e.focus));
    const energyValues = entries.map(e => this.scaleToNumber(e.energy));
    const stressValues = entries.map(e => this.scaleToNumber(e.stress));

    const averageMood = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;
    const averageFocus = focusValues.reduce((a, b) => a + b, 0) / focusValues.length;
    const averageEnergy = energyValues.reduce((a, b) => a + b, 0) / energyValues.length;
    const averageStress = stressValues.reduce((a, b) => a + b, 0) / stressValues.length;

    // Generate trends (last 7 days)
    const trends = this.generateTrends(entries.slice(0, 7));
    
    // Generate insights
    const insights = this.generateInsights({
      averageMood,
      averageFocus,
      averageEnergy,
      averageStress,
      entries
    });

    return {
      averageMood,
      averageFocus,
      averageEnergy,
      averageStress,
      trends,
      insights
    };
  }

  private scaleToNumber(value: string): number {
    const scaleMap: Record<string, number> = {
      'very-low': 1,
      'very-sad': 1,
      'low': 2,
      'sad': 2,
      'medium': 3,
      'neutral': 3,
      'high': 4,
      'happy': 4,
      'very-high': 5,
      'very-happy': 5
    };
    return scaleMap[value] || 3;
  }

  private generateTrends(entries: MoodFocusEntry[]) {
    return {
      mood: entries.map(e => this.scaleToNumber(e.mood)),
      focus: entries.map(e => this.scaleToNumber(e.focus)),
      energy: entries.map(e => this.scaleToNumber(e.energy)),
      stress: entries.map(e => this.scaleToNumber(e.stress))
    };
  }

  private generateInsights(data: {
    averageMood: number;
    averageFocus: number;
    averageEnergy: number;
    averageStress: number;
    entries: MoodFocusEntry[];
  }): string[] {
    const insights: string[] = [];

    if (data.averageMood >= 4) {
      insights.push('Your mood has been consistently positive! Keep up the great work.');
    } else if (data.averageMood <= 2) {
      insights.push('Your mood seems low lately. Consider talking to someone or trying stress-relief activities.');
    }

    if (data.averageFocus >= 4) {
      insights.push('Your focus levels are excellent! You\'re in a great state for learning.');
    } else if (data.averageFocus <= 2) {
      insights.push('Your focus seems to be struggling. Try breaking tasks into smaller chunks or taking regular breaks.');
    }

    if (data.averageStress >= 4) {
      insights.push('Your stress levels are high. Consider relaxation techniques or speaking with a counselor.');
    } else if (data.averageStress <= 2) {
      insights.push('Your stress levels are well-managed. Great job maintaining balance!');
    }

    if (data.averageEnergy <= 2) {
      insights.push('Your energy levels are low. Make sure you\'re getting enough sleep and exercise.');
    }

    // Pattern analysis
    const recentEntries = data.entries.slice(0, 5);
    const moodTrend = this.calculateTrend(recentEntries.map(e => this.scaleToNumber(e.mood)));
    
    if (moodTrend > 0.5) {
      insights.push('Your mood is trending upward - that\'s wonderful to see!');
    } else if (moodTrend < -0.5) {
      insights.push('Your mood seems to be declining. Consider what might be affecting you.');
    }

    if (insights.length === 0) {
      insights.push('Keep tracking your mood and focus to unlock more personalized insights!');
    }

    return insights;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const first = values[0];
    const last = values[values.length - 1];
    return (last - first) / values.length;
  }

  async getRecommendations(userId: string): Promise<string[]> {
    const analytics = await this.getAnalytics(userId);
    const recommendations: string[] = [];

    if (analytics.averageMood < 3) {
      recommendations.push('Try a 5-minute mindfulness exercise');
      recommendations.push('Listen to uplifting music');
      recommendations.push('Take a short walk outside');
    }

    if (analytics.averageFocus < 3) {
      recommendations.push('Use the Pomodoro Technique (25 min work, 5 min break)');
      recommendations.push('Eliminate distractions from your workspace');
      recommendations.push('Try a brief meditation before studying');
    }

    if (analytics.averageStress > 3) {
      recommendations.push('Practice deep breathing exercises');
      recommendations.push('Write down your thoughts in a journal');
      recommendations.push('Talk to a friend or counselor');
    }

    if (analytics.averageEnergy < 3) {
      recommendations.push('Ensure you\'re getting 7-9 hours of sleep');
      recommendations.push('Stay hydrated throughout the day');
      recommendations.push('Take short movement breaks');
    }

    if (recommendations.length === 0) {
      recommendations.push('You\'re doing great! Keep maintaining your positive habits.');
    }

    return recommendations;
  }
}

export const moodFocusCheckInAPI = new MoodFocusCheckInAPI();
