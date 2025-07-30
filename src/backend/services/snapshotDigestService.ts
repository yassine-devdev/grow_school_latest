import { db } from '../db';

export interface SnapshotDigest {
  id?: string;
  userId: string;
  date: string;
  summary: string;
  highlights: string[];
  achievements: string[];
  challenges: string[];
  recommendations: string[];
  moodSummary?: {
    average: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  focusSummary?: {
    average: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  learningProgress?: {
    completedModules: number;
    timeSpent: number;
    newSkills: string[];
  };
  created?: string;
}

interface MoodEntry {
  mood: string;
  stress?: string;
  focus?: string;
  [key: string]: unknown;
}

interface LearningProgressEntry {
  completed: boolean;
  timeSpent?: number;
  [key: string]: unknown;
}

interface JournalEntry {
  content: string;
  [key: string]: unknown;
}

interface Achievement {
  name: string;
  [key: string]: unknown;
}

interface Goal {
  title: string;
  [key: string]: unknown;
}

export interface DigestData {
  moodEntries: MoodEntry[];
  learningProgress: LearningProgressEntry[];
  journalEntries: JournalEntry[];
  achievements: Achievement[];
  goals: Goal[];
}

export class SnapshotDigestService {
  private collection = 'snapshot_digests';

  async generateDailyDigest(userId: string, date: string): Promise<SnapshotDigest> {
    try {
      // Gather data from various sources
      const digestData = await this.gatherDigestData(userId, date);
      
      // Generate digest content
      const digest = await this.createDigestContent(userId, date, digestData);
      
      // Save to database
      const savedDigest = await db.create(this.collection, {
        ...digest,
        created: new Date().toISOString()
      });

      return savedDigest as unknown as SnapshotDigest;
    } catch (error) {
      console.error('Error generating daily digest:', error);
      return this.createDefaultDigest(userId, date);
    }
  }

  async getDigest(userId: string, date: string): Promise<SnapshotDigest | null> {
    try {
      const results = await db.search(
        this.collection,
        `userId = "${userId}" && date = "${date}"`
      ) as unknown as SnapshotDigest[];
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error getting digest:', error);
      return null;
    }
  }

  async getUserDigests(userId: string, limit: number = 30): Promise<SnapshotDigest[]> {
    try {
      return await db.search(this.collection, `userId = "${userId}"`, {
        sort: '-date',
        perPage: limit // Use perPage instead of limit for QueryOptions compatibility
      }) as unknown as SnapshotDigest[];
    } catch (error) {
      console.error('Error getting user digests:', error);
      return [];
    }
  }

  async updateDigest(id: string, digest: Partial<SnapshotDigest>): Promise<SnapshotDigest> {
    return await db.update(this.collection, id, digest) as unknown as SnapshotDigest;
  }

  async deleteDigest(id: string): Promise<void> {
    await db.delete(this.collection, id);
  }

  private async gatherDigestData(userId: string, date: string): Promise<DigestData> {
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    try {
      // Gather mood entries
      const moodEntries = await db.search(
        'mood_focus_entries',
        `userId = "${userId}" && created >= "${startOfDay}" && created <= "${endOfDay}"`
      ) as unknown as MoodEntry[];

      // Gather learning progress
      const learningProgress = await db.search(
        'student_progress',
        `studentId = "${userId}" && lastAccessed >= "${startOfDay}" && lastAccessed <= "${endOfDay}"`
      ) as unknown as LearningProgressEntry[];

      // Gather journal entries
      const journalEntries = await db.search(
        'journal_entries',
        `userId = "${userId}" && created >= "${startOfDay}" && created <= "${endOfDay}"`
      ) as unknown as JournalEntry[];

      // Gather achievements (mock data for now)
      const achievements: Achievement[] = [];

      // Gather goals (mock data for now)
      const goals: Goal[] = [];

      return {
        moodEntries,
        learningProgress,
        journalEntries,
        achievements,
        goals
      };
    } catch (error) {
      console.error('Error gathering digest data:', error);
      return {
        moodEntries: [],
        learningProgress: [],
        journalEntries: [],
        achievements: [],
        goals: []
      };
    }
  }

  private async createDigestContent(
    userId: string, 
    date: string, 
    data: DigestData
  ): Promise<Omit<SnapshotDigest, 'id' | 'created'>> {
    const summary = this.generateSummary(data);
    const highlights = this.generateHighlights(data);
    const achievements = this.generateAchievements(data);
    const challenges = this.generateChallenges(data);
    const recommendations = this.generateRecommendations(data);
    const moodSummary = this.generateMoodSummary(data.moodEntries);
    const focusSummary = this.generateFocusSummary(data.moodEntries);
    const learningProgress = this.generateLearningProgress(data.learningProgress);

    return {
      userId,
      date,
      summary,
      highlights,
      achievements,
      challenges,
      recommendations,
      moodSummary,
      focusSummary,
      learningProgress
    };
  }

  private generateSummary(data: DigestData): string {
    const activities = [];
    
    if (data.moodEntries.length > 0) {
      activities.push(`${data.moodEntries.length} mood check-in${data.moodEntries.length > 1 ? 's' : ''}`);
    }
    
    if (data.learningProgress.length > 0) {
      activities.push(`${data.learningProgress.length} learning session${data.learningProgress.length > 1 ? 's' : ''}`);
    }
    
    if (data.journalEntries.length > 0) {
      activities.push(`${data.journalEntries.length} journal entr${data.journalEntries.length > 1 ? 'ies' : 'y'}`);
    }

    if (activities.length === 0) {
      return 'A quiet day with minimal tracked activity.';
    }

    return `Today you completed ${activities.join(', ')}. Keep up the great work!`;
  }

  private generateHighlights(data: DigestData): string[] {
    const highlights: string[] = [];

    if (data.moodEntries.length > 0) {
      const avgMood = data.moodEntries.reduce((sum, entry) => 
        sum + this.scaleToNumber(entry.mood), 0) / data.moodEntries.length;
      
      if (avgMood >= 4) {
        highlights.push('Maintained positive mood throughout the day');
      }
    }

    if (data.learningProgress.length > 0) {
      const completedModules = data.learningProgress.filter(p => p.completed).length;
      if (completedModules > 0) {
        highlights.push(`Completed ${completedModules} learning module${completedModules > 1 ? 's' : ''}`);
      }
    }

    if (data.journalEntries.length > 0) {
      highlights.push('Took time for self-reflection through journaling');
    }

    return highlights;
  }

  private generateAchievements(data: DigestData): string[] {
    const achievements: string[] = [];

    // Learning achievements
    const completedModules = data.learningProgress.filter(p => p.completed).length;
    if (completedModules >= 3) {
      achievements.push('Learning Champion - Completed 3+ modules in one day!');
    }

    // Consistency achievements
    if (data.moodEntries.length >= 3) {
      achievements.push('Mindfulness Master - Checked in with yourself multiple times');
    }

    // Mood achievements
    if (data.moodEntries.length > 0) {
      const avgMood = data.moodEntries.reduce((sum, entry) => 
        sum + this.scaleToNumber(entry.mood), 0) / data.moodEntries.length;
      
      if (avgMood >= 4.5) {
        achievements.push('Positivity Pro - Maintained excellent mood all day');
      }
    }

    return achievements;
  }

  private generateChallenges(data: DigestData): string[] {
    const challenges: string[] = [];

    if (data.moodEntries.length > 0) {
      const avgMood = data.moodEntries.reduce((sum, entry) => 
        sum + this.scaleToNumber(entry.mood), 0) / data.moodEntries.length;
      
      if (avgMood <= 2) {
        challenges.push('Low mood detected - consider self-care activities');
      }

      const avgStress = data.moodEntries.reduce((sum, entry) =>
        sum + this.scaleToNumber(entry.stress || 'medium'), 0) / data.moodEntries.length;
      
      if (avgStress >= 4) {
        challenges.push('High stress levels - try relaxation techniques');
      }
    }

    if (data.learningProgress.length === 0) {
      challenges.push('No learning activity recorded - consider setting aside study time');
    }

    return challenges;
  }

  private generateRecommendations(data: DigestData): string[] {
    const recommendations: string[] = [];

    if (data.moodEntries.length === 0) {
      recommendations.push('Try checking in with your mood regularly to build self-awareness');
    }

    if (data.journalEntries.length === 0) {
      recommendations.push('Consider writing a brief journal entry to reflect on your day');
    }

    if (data.learningProgress.length === 0) {
      recommendations.push('Set aside time tomorrow for learning or skill development');
    }

    if (recommendations.length === 0) {
      recommendations.push('You\'re doing great! Keep maintaining these positive habits');
    }

    return recommendations;
  }

  private generateMoodSummary(moodEntries: MoodEntry[]) {
    if (moodEntries.length === 0) return undefined;

    const moodValues = moodEntries.map(entry => this.scaleToNumber(entry.mood));
    const average = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;
    
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (moodValues.length > 1) {
      const first = moodValues[0];
      const last = moodValues[moodValues.length - 1];
      if (last > first + 0.5) trend = 'improving';
      else if (last < first - 0.5) trend = 'declining';
    }

    return { average, trend };
  }

  private generateFocusSummary(moodEntries: MoodEntry[]) {
    if (moodEntries.length === 0) return undefined;

    const focusValues = moodEntries.map(entry => this.scaleToNumber(entry.focus || 'medium'));
    const average = focusValues.reduce((a, b) => a + b, 0) / focusValues.length;
    
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (focusValues.length > 1) {
      const first = focusValues[0];
      const last = focusValues[focusValues.length - 1];
      if (last > first + 0.5) trend = 'improving';
      else if (last < first - 0.5) trend = 'declining';
    }

    return { average, trend };
  }

  private generateLearningProgress(learningProgress: LearningProgressEntry[]) {
    if (learningProgress.length === 0) return undefined;

    const completedModules = learningProgress.filter(p => p.completed).length;
    const timeSpent = learningProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
    const newSkills: string[] = []; // Would be extracted from completed modules

    return {
      completedModules,
      timeSpent,
      newSkills
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

  private createDefaultDigest(userId: string, date: string): SnapshotDigest {
    return {
      userId,
      date,
      summary: 'No activity recorded for today.',
      highlights: [],
      achievements: [],
      challenges: ['No data available for analysis'],
      recommendations: ['Start tracking your mood and activities to get personalized insights'],
      created: new Date().toISOString()
    };
  }
}

export const snapshotDigestService = new SnapshotDigestService();
