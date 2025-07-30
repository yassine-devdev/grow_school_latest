// Learning Pulse Tracker Types

export type LearningActivityType = 
  | 'assignment_completion'
  | 'quiz_attempt'
  | 'reading_progress'
  | 'video_watched'
  | 'discussion_participation'
  | 'project_milestone'
  | 'skill_practice'
  | 'peer_collaboration'
  | 'reflection_entry'
  | 'goal_achievement';

export type PerformanceLevel = 'below_expectations' | 'meeting_expectations' | 'exceeding_expectations' | 'outstanding';

export interface LearningActivity {
  id: string;
  userId: string;
  type: LearningActivityType;
  title: string;
  description?: string;
  subjectArea: string;
  skillsInvolved: string[];
  
  // Performance metrics
  score?: number; // 0-100 percentage
  timeSpent: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  completionRate: number; // 0-100 percentage
  
  // Context
  assignmentId?: string;
  courseId?: string;
  moduleId?: string;
  
  // Timestamps
  startedAt: string;
  completedAt?: string;
  dueDate?: string;
  
  // Metadata
  metadata?: Record<string, any>;
  tags: string[];
  
  createdAt: string;
  updatedAt: string;
}

export interface LearningVelocity {
  userId: string;
  subjectArea: string;
  period: 'daily' | 'weekly' | 'monthly';
  
  // Velocity metrics
  activitiesCompleted: number;
  averageScore: number;
  totalTimeSpent: number; // in minutes
  averageTimePerActivity: number; // in minutes
  
  // Trend indicators
  velocityTrend: 'increasing' | 'stable' | 'decreasing';
  performanceTrend: 'improving' | 'stable' | 'declining';
  
  // Comparison to previous period
  activitiesCompletedChange: number; // percentage change
  averageScoreChange: number; // percentage change
  timeSpentChange: number; // percentage change
  
  calculatedAt: string;
}

export interface PerformanceTrend {
  userId: string;
  subjectArea?: string; // null for overall performance
  
  // Trend data points
  dataPoints: {
    date: string;
    score: number;
    activitiesCompleted: number;
    timeSpent: number;
    performanceLevel: PerformanceLevel;
  }[];
  
  // Trend analysis
  overallTrend: 'improving' | 'stable' | 'declining';
  trendStrength: 'weak' | 'moderate' | 'strong';
  trendDuration: number; // days
  
  // Performance insights
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  
  // Predictions
  predictedPerformance: {
    nextWeek: PerformanceLevel;
    nextMonth: PerformanceLevel;
    confidence: number; // 0-1
  };
  
  calculatedAt: string;
}

export interface LearningPulse {
  userId: string;
  
  // Current status
  currentPerformanceLevel: PerformanceLevel;
  overallScore: number; // 0-100
  activitiesCompletedToday: number;
  timeSpentToday: number; // in minutes
  
  // Velocity metrics
  velocityMetrics: {
    daily: LearningVelocity;
    weekly: LearningVelocity;
    monthly: LearningVelocity;
  };
  
  // Performance trends by subject
  performanceTrends: PerformanceTrend[];
  
  // Engagement metrics
  engagementScore: number; // 0-100
  consistencyScore: number; // 0-100
  streakDays: number;
  
  // Alerts and insights
  alerts: LearningAlert[];
  insights: LearningInsight[];
  
  // Goals progress
  goalsProgress: {
    goalId: string;
    title: string;
    progress: number; // 0-100
    targetDate: string;
    onTrack: boolean;
  }[];
  
  lastUpdated: string;
}

export interface LearningAlert {
  id: string;
  userId: string;
  type: 'performance_drop' | 'missed_deadline' | 'low_engagement' | 'streak_broken' | 'goal_at_risk' | 'improvement_opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionRequired: boolean;
  suggestedActions: string[];
  relatedSubject?: string;
  relatedGoal?: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface LearningInsight {
  id: string;
  userId: string;
  type: 'pattern_recognition' | 'strength_identification' | 'improvement_suggestion' | 'goal_recommendation' | 'study_optimization';
  title: string;
  description: string;
  confidence: number; // 0-1
  basedOnData: {
    activities: number;
    timeframe: string;
    subjects: string[];
  };
  actionable: boolean;
  recommendations: string[];
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  viewedAt?: string;
}

export interface LearningProgressSnapshot {
  userId: string;
  date: string;
  
  // Daily metrics
  activitiesCompleted: number;
  averageScore: number;
  totalTimeSpent: number;
  subjectsStudied: string[];
  
  // Performance by subject
  subjectPerformance: {
    subject: string;
    activitiesCompleted: number;
    averageScore: number;
    timeSpent: number;
    performanceLevel: PerformanceLevel;
  }[];
  
  // Engagement metrics
  engagementScore: number;
  focusScore: number; // from mood check-ins if available
  motivationLevel: number; // derived from activity patterns
  
  // Goals and milestones
  goalsWorkedOn: string[];
  milestonesAchieved: string[];
  
  createdAt: string;
}

export interface LearningAnalytics {
  userId: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  
  // Overall metrics
  totalActivities: number;
  totalTimeSpent: number;
  averageScore: number;
  averageTimePerActivity: number;
  
  // Performance distribution
  performanceDistribution: {
    outstanding: number;
    exceeding_expectations: number;
    meeting_expectations: number;
    below_expectations: number;
  };
  
  // Subject breakdown
  subjectBreakdown: {
    subject: string;
    activities: number;
    averageScore: number;
    timeSpent: number;
    improvement: number; // percentage change from previous period
  }[];
  
  // Activity type breakdown
  activityTypeBreakdown: {
    type: LearningActivityType;
    count: number;
    averageScore: number;
    totalTime: number;
  }[];
  
  // Time patterns
  timePatterns: {
    hourOfDay: { hour: number; activities: number; averageScore: number }[];
    dayOfWeek: { day: string; activities: number; averageScore: number }[];
    studySessionLength: { duration: string; frequency: number; effectiveness: number }[];
  };
  
  // Trends
  trends: {
    scoresTrend: { date: string; score: number }[];
    activitiesTrend: { date: string; count: number }[];
    timeTrend: { date: string; minutes: number }[];
    engagementTrend: { date: string; score: number }[];
  };
  
  // Comparative metrics
  comparative: {
    previousPeriod: {
      scoreChange: number;
      activitiesChange: number;
      timeChange: number;
    };
    peerComparison?: {
      scorePercentile: number;
      activitiesPercentile: number;
      timePercentile: number;
    };
  };
  
  calculatedAt: string;
}

export interface LearningGoalProgress {
  goalId: string;
  userId: string;
  title: string;
  description: string;
  targetDate: string;
  
  // Progress metrics
  overallProgress: number; // 0-100
  currentValue: number;
  targetValue: number;
  unit: string; // e.g., 'assignments', 'hours', 'points'
  
  // Tracking
  isOnTrack: boolean;
  projectedCompletion: string;
  daysRemaining: number;
  
  // Recent activity
  recentActivities: LearningActivity[];
  weeklyProgress: number; // progress made this week
  
  // Milestones
  milestones: {
    id: string;
    title: string;
    targetValue: number;
    isCompleted: boolean;
    completedAt?: string;
  }[];
  
  lastUpdated: string;
}