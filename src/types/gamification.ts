import { BaseEntity, Priority, Status } from './base';

// Achievement types
export interface Achievement extends BaseEntity {
  title: string;
  description: string;
  category: string;
  points: number;
  icon?: string;
  badge?: string;
  requirements: AchievementRequirement[];
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isHidden: boolean;
  prerequisites?: string[];
  rewards?: AchievementReward[];
}

export interface AchievementRequirement {
  type: 'count' | 'streak' | 'score' | 'time' | 'custom';
  target: number;
  metric: string;
  description: string;
}

export interface AchievementReward {
  type: 'tokens' | 'badge' | 'title' | 'unlock' | 'custom';
  value: string | number;
  description: string;
}

export interface UserAchievement extends BaseEntity {
  userId: string;
  achievementId: string;
  achievement?: Achievement;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  metadata?: Record<string, any>;
}

// Milestone types
export interface Milestone extends BaseEntity {
  title: string;
  description: string;
  category: string;
  points: number;
  requirements: AchievementRequirement[];
  icon?: string;
  order: number;
  isUnlocked?: boolean;
  unlockedAt?: string;
  dependencies?: string[];
  rewards?: AchievementReward[];
}

// Progress visualization
export interface ProgressVisualization {
  userId: string;
  totalPoints: number;
  level: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  levelProgress: number;
  achievements: UserAchievement[];
  milestones: Milestone[];
  recentActivity: GamificationActivity[];
  streaks: UserStreak[];
  leaderboardPosition?: number;
  badges: UserBadge[];
}

export interface GamificationActivity {
  id: string;
  userId: string;
  type: 'achievement' | 'milestone' | 'points' | 'level' | 'streak';
  description: string;
  points: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserStreak {
  type: string;
  current: number;
  best: number;
  lastActivity: string;
  isActive: boolean;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// Token economy types
export interface TokenBalance extends BaseEntity {
  userId: string;
  totalTokens: number;
  availableTokens: number;
  pendingTokens: number;
  lockedTokens: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  lastTransactionAt?: string;
}

export interface TokenTransaction extends BaseEntity {
  userId: string;
  amount: number;
  type: 'earned' | 'spent' | 'bonus' | 'penalty' | 'transfer';
  reason: string;
  description?: string;
  metadata?: Record<string, any>;
  balanceAfter: number;
  relatedId?: string;
  relatedType?: string;
}

export interface TokenEarningRule extends BaseEntity {
  action: string;
  description: string;
  tokensEarned: number;
  category: string;
  isActive: boolean;
  conditions?: Record<string, any>;
  cooldownMinutes?: number;
  maxPerDay?: number;
  maxPerWeek?: number;
  maxPerMonth?: number;
  validFrom?: string;
  validUntil?: string;
}

export interface TokenSpendingOption extends BaseEntity {
  title: string;
  description: string;
  cost: number;
  category: string;
  isAvailable: boolean;
  icon?: string;
  image?: string;
  metadata?: Record<string, any>;
  stock?: number;
  maxPerUser?: number;
  validFrom?: string;
  validUntil?: string;
  requirements?: string[];
}

// Game types
export interface Game extends BaseEntity {
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  points: number;
  image?: string;
  thumbnail?: string;
  instructions?: string;
  duration?: number;
  maxPlayers?: number;
  minPlayers?: number;
  tags?: string[];
  isActive: boolean;
  playCount: number;
  averageRating?: number;
  requirements?: string[];
}

export interface GameSession extends BaseEntity {
  userId: string;
  gameId: string;
  game?: Game;
  score: number;
  duration: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
  achievements?: string[];
  tokensEarned: number;
}

// Leaderboard types
export interface Leaderboard {
  id: string;
  name: string;
  description: string;
  type: 'points' | 'achievements' | 'streaks' | 'custom';
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  category?: string;
  entries: LeaderboardEntry[];
  lastUpdated: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  score: number;
  change: number;
  metadata?: Record<string, any>;
}

// Goal types for gamification
export interface Goal extends BaseEntity {
  userId: string;
  title: string;
  description: string;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: string;
  status: Status;
  priority: Priority;
  progress: number;
  milestones: string[];
  tags?: string[];
  rewards?: AchievementReward[];
  dependencies?: string[];
  isPublic: boolean;
}