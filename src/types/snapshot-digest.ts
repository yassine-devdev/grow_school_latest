// Daily/Weekly Snapshot Digest Types

export type DigestFrequency = 'daily' | 'weekly' | 'monthly';
export type DigestDeliveryMethod = 'email' | 'in_app' | 'push_notification' | 'sms';
export type DigestContentType = 'summary' | 'detailed' | 'highlights_only';

export interface DigestPreferences {
  id: string;
  userId: string;
  parentId?: string; // For parent accounts monitoring children
  frequency: DigestFrequency;
  deliveryMethods: DigestDeliveryMethod[];
  contentType: DigestContentType;
  includeSubjects: string[];
  excludeSubjects: string[];
  includeMetrics: DigestMetricType[];
  deliveryTime: string; // HH:MM format
  timezone: string;
  isActive: boolean;
  customizations: DigestCustomization;
  createdAt: string;
  updatedAt: string;
}

export type DigestMetricType = 
  | 'learning_activities'
  | 'performance_scores'
  | 'time_spent'
  | 'goals_progress'
  | 'achievements'
  | 'mood_focus'
  | 'assignments_completed'
  | 'upcoming_deadlines'
  | 'recommendations'
  | 'alerts';

export interface DigestCustomization {
  includeCharts: boolean;
  includeComparisons: boolean;
  includeRecommendations: boolean;
  includeGoalProgress: boolean;
  includeMoodTracking: boolean;
  includeUpcomingEvents: boolean;
  maxContentLength: 'short' | 'medium' | 'long';
  language: string;
}

export interface ProgressReport {
  id: string;
  userId: string;
  reportType: DigestFrequency;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  generatedAt: string;
  
  // Summary metrics
  summary: {
    totalActivitiesCompleted: number;
    averageScore: number;
    totalTimeSpent: number; // in minutes
    goalsProgress: number; // percentage
    streakDays: number;
    performanceLevel: 'below_expectations' | 'meeting_expectations' | 'exceeding_expectations' | 'outstanding';
  };
  
  // Detailed breakdowns
  subjectPerformance: SubjectPerformanceReport[];
  activitySummary: ActivitySummaryReport[];
  goalProgress: GoalProgressReport[];
  achievements: AchievementReport[];
  moodAndFocus: MoodFocusReport;
  upcomingDeadlines: UpcomingDeadlineReport[];
  
  // Insights and recommendations
  insights: DigestInsight[];
  recommendations: DigestRecommendation[];
  alerts: DigestAlert[];
  
  // Comparative data
  comparisons: {
    previousPeriod: PeriodComparison;
    peerComparison?: PeerComparison;
  };
  
  // Metadata
  generationMetadata: {
    dataPoints: number;
    processingTime: number;
    version: string;
  };
}

export interface SubjectPerformanceReport {
  subject: string;
  activitiesCompleted: number;
  averageScore: number;
  timeSpent: number;
  improvement: number; // percentage change
  performanceLevel: 'below_expectations' | 'meeting_expectations' | 'exceeding_expectations' | 'outstanding';
  strengths: string[];
  areasForImprovement: string[];
  trend: 'improving' | 'stable' | 'declining';
}

export interface ActivitySummaryReport {
  date: string;
  activitiesCompleted: number;
  averageScore: number;
  timeSpent: number;
  subjects: string[];
  highlights: string[];
  challenges: string[];
}

export interface GoalProgressReport {
  goalId: string;
  title: string;
  currentProgress: number;
  targetProgress: number;
  progressMade: number; // progress made during this period
  isOnTrack: boolean;
  daysRemaining: number;
  estimatedCompletion: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AchievementReport {
  achievementId: string;
  title: string;
  description: string;
  earnedAt: string;
  category: string;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface MoodFocusReport {
  averageMood: number;
  averageFocus: number;
  averageEnergy: number;
  averageStress: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  focusTrend: 'improving' | 'stable' | 'declining';
  bestDays: string[];
  challengingDays: string[];
  patterns: {
    timeOfDay: { hour: number; mood: number; focus: number }[];
    dayOfWeek: { day: string; mood: number; focus: number }[];
  };
}

export interface UpcomingDeadlineReport {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTimeRequired: number; // in minutes
  currentProgress: number; // percentage
  isOverdue: boolean;
  daysUntilDue: number;
}

export interface DigestInsight {
  id: string;
  type: 'performance_pattern' | 'learning_trend' | 'time_management' | 'subject_strength' | 'improvement_area';
  title: string;
  description: string;
  confidence: number; // 0-1
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  supportingData: any;
}

export interface DigestRecommendation {
  id: string;
  type: 'study_strategy' | 'time_management' | 'goal_adjustment' | 'resource_suggestion' | 'support_needed';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: 'high' | 'medium' | 'low';
  actionSteps: string[];
  resources: {
    title: string;
    url?: string;
    type: 'article' | 'video' | 'tool' | 'contact';
  }[];
}

export interface DigestAlert {
  id: string;
  type: 'performance_drop' | 'missed_deadline' | 'goal_at_risk' | 'low_engagement' | 'streak_broken';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionRequired: boolean;
  suggestedActions: string[];
  deadline?: string;
}

export interface PeriodComparison {
  scoreChange: number;
  activitiesChange: number;
  timeSpentChange: number;
  goalsProgressChange: number;
  moodChange: number;
  focusChange: number;
  summary: string;
}

export interface PeerComparison {
  scorePercentile: number;
  activitiesPercentile: number;
  timeSpentPercentile: number;
  goalsCompletionPercentile: number;
  anonymizedData: boolean;
  cohortSize: number;
}

export interface ActivitySummary {
  totalActivities: number;
  completedActivities: number;
  averageScore: number;
  totalTimeSpent: number;
  subjectBreakdown: {
    subject: string;
    activities: number;
    averageScore: number;
    timeSpent: number;
  }[];
  dailyBreakdown: {
    date: string;
    activities: number;
    averageScore: number;
    timeSpent: number;
  }[];
  topPerformingSubjects: string[];
  challengingSubjects: string[];
}

export interface DigestTemplate {
  id: string;
  name: string;
  description: string;
  frequency: DigestFrequency;
  contentSections: DigestSection[];
  isDefault: boolean;
  isCustomizable: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DigestSection {
  id: string;
  name: string;
  type: DigestMetricType;
  isRequired: boolean;
  order: number;
  configuration: {
    includeCharts: boolean;
    includeComparisons: boolean;
    maxItems: number;
    timeframe: string;
  };
}

export interface DigestDelivery {
  id: string;
  digestId: string;
  userId: string;
  method: DigestDeliveryMethod;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  scheduledAt: string;
  sentAt?: string;
  deliveredAt?: string;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  metadata: {
    recipientEmail?: string;
    recipientPhone?: string;
    messageId?: string;
    trackingId?: string;
  };
}

export interface DigestAnalytics {
  digestId: string;
  userId: string;
  generatedAt: string;
  
  // Engagement metrics
  opened: boolean;
  openedAt?: string;
  clickedLinks: string[];
  timeSpentReading?: number; // in seconds
  
  // Feedback
  rating?: number; // 1-5 scale
  feedback?: string;
  
  // Actions taken
  actionsTaken: {
    type: 'goal_updated' | 'preference_changed' | 'resource_accessed' | 'support_contacted';
    timestamp: string;
    details: any;
  }[];
}