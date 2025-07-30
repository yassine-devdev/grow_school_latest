export class GamificationService {
  async getGamificationSummary(userId: string) {
    // Mock gamification summary
    return {
      userId,
      totalPoints: 2450,
      level: 8,
      rank: 'Scholar',
      achievements: 12,
      streakDays: 7,
      weeklyGoalProgress: 75,
      recentActivities: [
        { type: 'assignment_completed', points: 50, timestamp: new Date().toISOString() },
        { type: 'quiz_perfect_score', points: 100, timestamp: new Date().toISOString() },
        { type: 'daily_login', points: 10, timestamp: new Date().toISOString() }
      ]
    };
  }

  async getUserAchievements(userId: string) {
    // Mock user achievements - personalized based on userId
    const userHash = userId.length % 10;
    const baseAchievements = [
      {
        id: 'ach_1',
        name: 'First Steps',
        description: 'Complete your first assignment',
        icon: 'trophy',
        earned: true,
        earnedDate: '2024-01-15T00:00:00Z',
        points: 50
      },
      {
        id: 'ach_2',
        name: 'Perfect Score',
        description: 'Get 100% on a quiz',
        icon: 'star',
        earned: userHash > 5, // Some users have earned this
        earnedDate: userHash > 5 ? '2024-01-20T00:00:00Z' : undefined,
        points: 100
      },
      {
        id: 'ach_3',
        name: 'Streak Master',
        description: 'Login for 7 consecutive days',
        icon: 'flame',
        earned: userHash > 8, // Few users have earned this
        progress: Math.min(userHash, 7),
        target: 7,
        points: 200
      }
    ];

    // Add user-specific achievement
    if (userHash % 3 === 0) {
      baseAchievements.push({
        id: 'ach_special',
        name: 'Early Adopter',
        description: `Special achievement for user ${userId.slice(0, 8)}...`,
        icon: 'star-special',
        earned: true,
        earnedDate: '2024-01-10T00:00:00Z',
        points: 150
      });
    }

    return baseAchievements;
  }

  async getAchievements() {
    // Mock all available achievements
    return [
      {
        id: 'ach_1',
        name: 'First Steps',
        description: 'Complete your first assignment',
        icon: 'trophy',
        category: 'academic',
        points: 50,
        rarity: 'common'
      },
      {
        id: 'ach_2',
        name: 'Perfect Score',
        description: 'Get 100% on a quiz',
        icon: 'star',
        category: 'academic',
        points: 100,
        rarity: 'uncommon'
      },
      {
        id: 'ach_3',
        name: 'Streak Master',
        description: 'Login for 7 consecutive days',
        icon: 'flame',
        category: 'engagement',
        points: 200,
        rarity: 'rare'
      }
    ];
  }

  async getMilestones(userId: string) {
    // Mock user milestones - personalized based on userId
    const userHash = userId.length % 10;
    const baseMilestones = [
      {
        id: 'milestone_1',
        name: 'Academic Excellence',
        description: 'Maintain 90% average for a semester',
        progress: Math.min(85 + userHash, 100), // Varies by user
        target: 90,
        category: 'academic',
        reward: {
          type: 'badge',
          name: 'Honor Student',
          points: 500
        }
      },
      {
        id: 'milestone_2',
        name: 'Community Contributor',
        description: 'Help 10 classmates with assignments',
        progress: Math.min(7 + (userHash % 4), 10), // Varies by user
        target: 10,
        category: 'social',
        reward: {
          type: 'title',
          name: 'Mentor',
          points: 300
        }
      }
    ];

    // Add user-specific milestone
    if (userHash > 5) {
      baseMilestones.push({
        id: 'milestone_personal',
        name: `${userId.slice(0, 8)}'s Challenge`,
        description: 'Complete your personalized learning path',
        progress: userHash * 10,
        target: 100,
        category: 'personal',
        reward: {
          type: 'custom',
          name: 'Pathfinder',
          points: 400
        }
      });
    }

    return baseMilestones;
  }

  async getTokenEarningRules() {
    // Mock token earning rules
    return [
      {
        id: 'rule_1',
        action: 'complete_assignment',
        points: 50,
        description: 'Complete an assignment on time'
      },
      {
        id: 'rule_2',
        action: 'perfect_quiz',
        points: 100,
        description: 'Score 100% on a quiz'
      },
      {
        id: 'rule_3',
        action: 'daily_login',
        points: 10,
        description: 'Login to the platform'
      },
      {
        id: 'rule_4',
        action: 'help_classmate',
        points: 25,
        description: 'Help a classmate with their work'
      }
    ];
  }

  async completeGoal(userId: string, goalId: string) {
    // Mock goal completion - personalized based on userId and goalId
    const userHash = userId.length % 10;
    const goalHash = goalId.length % 5;
    const pointsEarned = 100 + (goalHash * 25) + (userHash * 5);

    const newAchievements = [];
    if (userHash > 7) {
      newAchievements.push('Goal Crusher - Complete 5 goals in a week');
    }
    if (goalHash === 0) {
      newAchievements.push('Perfect Timing - Complete goal at optimal time');
    }

    const levelUp = userHash === 9; // Rare level up event

    return {
      success: true,
      pointsEarned,
      newAchievements,
      levelUp,
      message: `Goal ${goalId} completed successfully by user ${userId.slice(0, 8)}! Earned ${pointsEarned} points.`
    };
  }
}
