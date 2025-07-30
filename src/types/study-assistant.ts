// AI-Driven Virtual Study Assistant Types

export type SubjectArea = 
  | 'mathematics' 
  | 'science' 
  | 'english' 
  | 'history' 
  | 'foreign-language' 
  | 'computer-science' 
  | 'art' 
  | 'music' 
  | 'physical-education' 
  | 'general';

export type StudySessionType = 
  | 'homework-help' 
  | 'concept-explanation' 
  | 'test-preparation' 
  | 'skill-practice' 
  | 'project-guidance' 
  | 'research-assistance';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading-writing';

export interface StudyQuestion {
  id: string;
  userId: string;
  subject: SubjectArea;
  question: string;
  context?: string; // Additional context about the assignment or topic
  difficulty?: DifficultyLevel;
  attachments?: string[]; // File URLs for images, documents, etc.
  createdAt: string;
}

export interface StudyResponse {
  id: string;
  questionId: string;
  response: string;
  explanation?: string;
  additionalResources?: StudyResource[];
  followUpQuestions?: string[];
  confidence: number; // 0-1 scale
  generatedAt: string;
}

export interface StudyResource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'practice-problem' | 'tutorial' | 'reference';
  url?: string;
  content?: string;
  subject: SubjectArea;
  difficulty: DifficultyLevel;
  estimatedTime: number; // in minutes
  tags: string[];
}

export interface StudySession {
  id: string;
  userId: string;
  subject: SubjectArea;
  sessionType: StudySessionType;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
  questions: StudyQuestion[];
  responses: StudyResponse[];
  learningObjectives: string[];
  completedObjectives: string[];
  effectiveness?: number; // 1-5 scale, user feedback
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectModule {
  id: string;
  subject: SubjectArea;
  name: string;
  description: string;
  topics: StudyTopic[];
  prerequisites: string[]; // Other module IDs
  difficulty: DifficultyLevel;
  estimatedHours: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudyTopic {
  id: string;
  moduleId: string;
  name: string;
  description: string;
  concepts: string[];
  resources: StudyResource[];
  practiceProblems: PracticeProblem[];
  assessments: Assessment[];
  order: number;
  isCompleted?: boolean;
  completedAt?: string;
}

export interface PracticeProblem {
  id: string;
  topicId: string;
  question: string;
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'problem-solving' | 'coding';
  options?: string[]; // For multiple choice
  correctAnswer?: string;
  explanation: string;
  difficulty: DifficultyLevel;
  points: number;
  timeLimit?: number; // in minutes
  hints?: string[];
  tags: string[];
}

export interface Assessment {
  id: string;
  topicId: string;
  name: string;
  description: string;
  type: 'quiz' | 'test' | 'assignment' | 'project';
  problems: PracticeProblem[];
  timeLimit?: number; // in minutes
  passingScore: number; // percentage
  maxAttempts?: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserProgress {
  userId: string;
  subject: SubjectArea;
  currentLevel: DifficultyLevel;
  completedModules: string[];
  completedTopics: string[];
  strengths: string[]; // Topic/concept names
  weaknesses: string[]; // Topic/concept names
  recommendedTopics: string[];
  totalStudyTime: number; // in minutes
  averageSessionDuration: number; // in minutes
  lastStudyDate?: string;
  streakDays: number;
  achievements: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  subject: SubjectArea;
  title: string;
  description: string;
  goals: string[];
  targetDate?: string;
  estimatedHours: number;
  modules: string[]; // Module IDs in order
  currentModuleId?: string;
  progress: number; // 0-100 percentage
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudyRecommendation {
  id: string;
  userId: string;
  type: 'topic' | 'resource' | 'practice' | 'review' | 'break';
  title: string;
  description: string;
  subject?: SubjectArea;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime: number; // in minutes
  reasoning: string;
  relatedTopics: string[];
  resources: StudyResource[];
  dueDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface StudyAnalytics {
  userId: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  totalSessions: number;
  totalStudyTime: number; // in minutes
  averageSessionDuration: number;
  subjectBreakdown: {
    subject: SubjectArea;
    sessions: number;
    timeSpent: number;
    averageEffectiveness: number;
  }[];
  difficultyProgression: {
    subject: SubjectArea;
    startLevel: DifficultyLevel;
    currentLevel: DifficultyLevel;
    progressRate: number;
  }[];
  streakData: {
    currentStreak: number;
    longestStreak: number;
    streakHistory: { date: string; hasSession: boolean }[];
  };
  performanceMetrics: {
    questionsAnswered: number;
    correctAnswers: number;
    averageConfidence: number;
    improvementRate: number;
  };
  recommendations: StudyRecommendation[];
  insights: StudyInsight[];
}

export interface StudyInsight {
  id: string;
  type: 'strength' | 'weakness' | 'pattern' | 'recommendation' | 'achievement';
  title: string;
  description: string;
  subject?: SubjectArea;
  severity: 'info' | 'warning' | 'success' | 'critical';
  actionable: boolean;
  actions?: string[];
  relatedData?: any;
  generatedAt: string;
}

export interface AITutorPersonality {
  id: string;
  name: string;
  description: string;
  avatar: string;
  specialties: SubjectArea[];
  teachingStyle: string;
  personality: string;
  systemPrompt: string;
  isActive: boolean;
  createdAt: string;
}

export interface StudySessionOptimization {
  userId: string;
  optimalSessionDuration: number; // in minutes
  bestStudyTimes: string[]; // Time slots like "09:00-10:00"
  preferredSubjectOrder: SubjectArea[];
  breakFrequency: number; // minutes between breaks
  breakDuration: number; // minutes per break
  focusPatterns: {
    timeOfDay: string;
    focusLevel: number; // 1-10 scale
    subjects: SubjectArea[];
  }[];
  environmentPreferences: {
    musicType?: string;
    noiseLevel: 'silent' | 'quiet' | 'moderate' | 'ambient';
    lightingPreference: 'bright' | 'moderate' | 'dim';
  };
  lastUpdated: string;
}

// Combined state interface for the study assistant
export interface StudyAssistantState {
  currentSession: StudySession | null;
  userProgress: Record<SubjectArea, UserProgress>;
  studyPlans: StudyPlan[];
  recommendations: StudyRecommendation[];
  analytics: StudyAnalytics | null;
  optimization: StudySessionOptimization | null;
  availableModules: SubjectModule[];
  tutorPersonalities: AITutorPersonality[];
  recentSessions: StudySession[];
}