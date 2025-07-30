import { BaseEntity, MoodLevel, FocusLevel, EnergyLevel, StressLevel, DateRange } from './base';

// Mood and Focus Check-in types
export interface MoodFocusCheckIn extends BaseEntity {
  userId: string;
  date: string;
  mood: MoodLevel;
  focus: FocusLevel;
  energy: EnergyLevel;
  stress: StressLevel;
  notes?: string;
  tags?: string[];
  activities?: string[];
  sleepHours?: number;
  exerciseMinutes?: number;
  waterIntake?: number;
  screenTime?: number;
  socialInteraction?: number;
  productivity?: number;
  gratitude?: string[];
  challenges?: string[];
}

export interface CheckInSummary {
  userId: string;
  period: DateRange;
  averageMood: number;
  averageFocus: number;
  averageEnergy: number;
  averageStress: number;
  totalCheckIns: number;
  streakDays: number;
  bestDay: {
    date: string;
    score: number;
  };
  worstDay: {
    date: string;
    score: number;
  };
  insights: string[];
  recommendations: string[];
  patterns: WellnessPattern[];
}

export interface CheckInTrends {
  userId: string;
  period: DateRange;
  moodTrend: TrendDataPoint[];
  focusTrend: TrendDataPoint[];
  energyTrend: TrendDataPoint[];
  stressTrend: TrendDataPoint[];
  correlations: WellnessCorrelation[];
  patterns: WellnessPattern[];
  predictions: WellnessPrediction[];
}

export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface WellnessCorrelation {
  factor1: string;
  factor2: string;
  correlation: number;
  significance: number;
  description: string;
}

export interface WellnessPattern {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  description: string;
  confidence: number;
  impact: 'positive' | 'negative' | 'neutral';
  recommendations: string[];
}

export interface WellnessPrediction {
  date: string;
  metric: 'mood' | 'focus' | 'energy' | 'stress';
  predictedValue: number;
  confidence: number;
  factors: string[];
}

// Wellness goals and tracking
export interface WellnessGoal extends BaseEntity {
  userId: string;
  type: 'mood' | 'focus' | 'energy' | 'stress' | 'sleep' | 'exercise' | 'custom';
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  milestones: WellnessMilestone[];
  reminders: WellnessReminder[];
}

export interface WellnessMilestone {
  id: string;
  title: string;
  targetValue: number;
  achievedAt?: string;
  reward?: string;
}

export interface WellnessReminder {
  id: string;
  type: 'checkin' | 'goal' | 'activity';
  time: string;
  frequency: 'daily' | 'weekly' | 'custom';
  message: string;
  isActive: boolean;
}

// Wellness insights and recommendations
export interface WellnessInsight extends BaseEntity {
  userId: string;
  type: 'pattern' | 'achievement' | 'concern' | 'recommendation';
  title: string;
  description: string;
  data: Record<string, any>;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  actions?: WellnessAction[];
  expiresAt?: string;
}

export interface WellnessAction {
  id: string;
  title: string;
  description: string;
  type: 'activity' | 'habit' | 'goal' | 'reminder';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  category: string;
  instructions?: string[];
  resources?: string[];
}

// Wellness reports
export interface WellnessReport {
  id: string;
  userId: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  period: DateRange;
  generatedAt: string;
  summary: CheckInSummary;
  trends: CheckInTrends;
  insights: WellnessInsight[];
  goals: WellnessGoal[];
  recommendations: WellnessAction[];
  exportFormats: ('pdf' | 'csv' | 'json')[];
}