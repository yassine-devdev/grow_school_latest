import { db } from '../db';
import { LearningPath, LearningModule } from '../api/learning-guide';

export interface StudentProgress {
  id?: string;
  studentId: string;
  pathId: string;
  moduleId: string;
  completed: boolean;
  score?: number;
  timeSpent: number;
  lastAccessed: string;
}

export interface LearningPathway {
  id?: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  subjects: string[];
  modules: string[];
  createdBy: string;
  isPublic: boolean;
  created?: string;
  updated?: string;
}

export class LearningGuideRepository {
  private pathwaysCollection = 'learning_pathways';
  private modulesCollection = 'learning_modules';
  private progressCollection = 'student_progress';

  // Learning Pathways
  async createPathway(pathway: Omit<LearningPathway, 'id'>): Promise<LearningPathway> {
    return await db.create(this.pathwaysCollection, pathway) as LearningPathway;
  }

  async getPathway(id: string): Promise<LearningPathway> {
    return await db.getById(this.pathwaysCollection, id) as LearningPathway;
  }

  async getAllPathways(): Promise<LearningPathway[]> {
    return await db.getAll(this.pathwaysCollection, {
      sort: '-created'
    }) as LearningPathway[];
  }

  async getPublicPathways(): Promise<LearningPathway[]> {
    return await db.search(this.pathwaysCollection, 'isPublic = true') as LearningPathway[];
  }

  async getPathwaysByCreator(creatorId: string): Promise<LearningPathway[]> {
    return await db.search(this.pathwaysCollection, `createdBy = "${creatorId}"`) as LearningPathway[];
  }

  async updatePathway(id: string, pathway: Partial<LearningPathway>): Promise<LearningPathway> {
    return await db.update(this.pathwaysCollection, id, pathway) as LearningPathway;
  }

  async deletePathway(id: string): Promise<void> {
    await db.delete(this.pathwaysCollection, id);
  }

  async searchPathways(query: string): Promise<LearningPathway[]> {
    return await db.search(
      this.pathwaysCollection,
      `title ~ "${query}" || description ~ "${query}" || subjects ~ "${query}"`
    ) as LearningPathway[];
  }

  // Learning Modules
  async createModule(module: Omit<LearningModule, 'id'>): Promise<LearningModule> {
    return await db.create(this.modulesCollection, module) as LearningModule;
  }

  async getModule(id: string): Promise<LearningModule> {
    return await db.getById(this.modulesCollection, id) as LearningModule;
  }

  async getModulesByPathway(pathwayId: string): Promise<LearningModule[]> {
    return await db.search(this.modulesCollection, `pathwayId = "${pathwayId}"`, {
      sort: 'order'
    }) as LearningModule[];
  }

  async updateModule(id: string, module: Partial<LearningModule>): Promise<LearningModule> {
    return await db.update(this.modulesCollection, id, module) as LearningModule;
  }

  async deleteModule(id: string): Promise<void> {
    await db.delete(this.modulesCollection, id);
  }

  // Student Progress
  async recordProgress(progress: Omit<StudentProgress, 'id'>): Promise<StudentProgress> {
    // Check if progress record already exists
    const existing = await this.getStudentModuleProgress(
      progress.studentId,
      progress.pathId,
      progress.moduleId
    );

    if (existing) {
      return await db.update(this.progressCollection, existing.id!, progress) as StudentProgress;
    } else {
      return await db.create(this.progressCollection, progress) as StudentProgress;
    }
  }

  async getStudentProgress(studentId: string, pathId: string): Promise<StudentProgress[]> {
    return await db.search(
      this.progressCollection,
      `studentId = "${studentId}" && pathId = "${pathId}"`
    ) as StudentProgress[];
  }

  async getStudentModuleProgress(
    studentId: string,
    pathId: string,
    moduleId: string
  ): Promise<StudentProgress | null> {
    const results = await db.search(
      this.progressCollection,
      `studentId = "${studentId}" && pathId = "${pathId}" && moduleId = "${moduleId}"`
    ) as StudentProgress[];
    return results.length > 0 ? results[0] : null;
  }

  async getStudentAllProgress(studentId: string): Promise<StudentProgress[]> {
    return await db.search(this.progressCollection, `studentId = "${studentId}"`) as StudentProgress[];
  }

  async updateProgress(id: string, progress: Partial<StudentProgress>): Promise<StudentProgress> {
    return await db.update(this.progressCollection, id, progress) as StudentProgress;
  }

  async deleteProgress(id: string): Promise<void> {
    await db.delete(this.progressCollection, id);
  }

  // Analytics and Insights
  async getPathwayAnalytics(pathwayId: string): Promise<{
    pathwayId: string;
    totalStudents: number;
    completionRate: number;
    averageScore: number;
    totalTimeSpent: number;
    engagementMetrics: {
      activeStudents: number;
      averageTimePerStudent: number;
    };
  }> {
    const progress = await db.search(this.progressCollection, `pathId = "${pathwayId}"`);
    
    const totalStudents = new Set(progress.map(p => p.studentId)).size;
    const completedModules = progress.filter(p => p.completed).length;
    const totalModules = progress.length;
    const averageScore = progress
      .filter(p => p.score)
      .reduce((sum, p) => sum + (p.score || 0), 0) / progress.filter(p => p.score).length || 0;
    const totalTimeSpent = progress.reduce((sum, p) => sum + p.timeSpent, 0);

    return {
      pathwayId,
      totalStudents,
      completionRate: totalModules > 0 ? (completedModules / totalModules) * 100 : 0,
      averageScore,
      totalTimeSpent,
      engagementMetrics: {
        activeStudents: totalStudents,
        averageTimePerStudent: totalStudents > 0 ? totalTimeSpent / totalStudents : 0
      }
    };
  }

  async getStudentAnalytics(studentId: string): Promise<{
    studentId: string;
    totalPathways: number;
    completedModules: number;
    totalModules: number;
    completionRate: number;
    averageScore: number;
    totalTimeSpent: number;
    learningStreak: number;
  }> {
    const progress = await this.getStudentAllProgress(studentId);
    
    const totalPathways = new Set(progress.map(p => p.pathId)).size;
    const completedModules = progress.filter(p => p.completed).length;
    const totalModules = progress.length;
    const averageScore = progress
      .filter(p => p.score)
      .reduce((sum, p) => sum + (p.score || 0), 0) / progress.filter(p => p.score).length || 0;
    const totalTimeSpent = progress.reduce((sum, p) => sum + p.timeSpent, 0);

    return {
      studentId,
      totalPathways,
      completedModules,
      totalModules,
      completionRate: totalModules > 0 ? (completedModules / totalModules) * 100 : 0,
      averageScore,
      totalTimeSpent,
      learningStreak: this.calculateLearningStreak(progress)
    };
  }

  private calculateLearningStreak(progress: StudentProgress[]): number {
    // Simplified streak calculation
    const recentProgress = progress
      .filter(p => p.lastAccessed)
      .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime());

    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasActivity = recentProgress.some(p => 
        p.lastAccessed.startsWith(dateStr)
      );
      
      if (hasActivity) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // Recommendations
  async getRecommendedPathways(studentId: string, limit: number = 5): Promise<LearningPathway[]> {
    // Simple recommendation based on public pathways
    // In a real implementation, this would use ML algorithms
    const publicPathways = await this.getPublicPathways();
    const studentProgress = await this.getStudentAllProgress(studentId);
    const completedPathways = new Set(studentProgress.map(p => p.pathId));
    
    return publicPathways
      .filter(pathway => !completedPathways.has(pathway.id!))
      .slice(0, limit);
  }

  async getPopularPathways(limit: number = 10): Promise<LearningPathway[]> {
    // Get pathways with most student enrollments
    const allProgress = await db.getAll(this.progressCollection);
    const pathwayEnrollments = allProgress.reduce((acc, progress) => {
      acc[progress.pathId] = (acc[progress.pathId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const popularPathwayIds = Object.entries(pathwayEnrollments)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([pathwayId]) => pathwayId);

    const pathways = await Promise.all(
      popularPathwayIds.map(id => this.getPathway(id))
    );

    return pathways.filter(Boolean);
  }
}

export const learningGuideRepository = new LearningGuideRepository();
