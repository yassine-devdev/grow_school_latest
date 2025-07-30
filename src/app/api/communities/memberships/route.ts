import { NextRequest, NextResponse } from 'next/server';
import { CommunityMembership } from '@/types';

// Mock data for community memberships
const mockMemberships: CommunityMembership[] = [
  {
    id: 'memb-1',
    userId: 'user-1',
    communityId: 'comm-1',
    role: 'member',
    status: 'active',
    joinedAt: '2024-01-20T10:00:00Z',
    lastActiveAt: '2024-02-18T15:30:00Z',
    contributionScore: 85,
    postsCount: 12,
    helpfulVotes: 34,
    achievements: ['Science Explorer', 'Active Contributor'],
    interests: ['science', 'technology'],
    skills: ['research', 'writing'],
    bio: 'Passionate about science and technology',
    preferences: {
      notifications: {
        email: true,
        push: true,
        mentions: true,
        events: true,
        newMembers: true,
        weeklyDigest: true
      },
      privacy: {
        showProfile: true,
        showActivity: true,
        allowDirectMessages: true,
        showOnlineStatus: true
      },
      interests: ['science', 'technology'],
      mentoring: {
        willingToMentor: true,
        seekingMentor: false,
        expertiseAreas: ['science', 'research'],
        learningGoals: []
      }
    },
    warnings: [],
    isVerified: true,
    verifiedAt: '2024-01-25T10:00:00Z'
  },
  {
    id: 'memb-2',
    userId: 'user-1',
    communityId: 'comm-2',
    role: 'moderator',
    status: 'active',
    joinedAt: '2024-01-15T14:00:00Z',
    lastActiveAt: '2024-02-19T11:45:00Z',
    contributionScore: 142,
    postsCount: 23,
    helpfulVotes: 67,
    achievements: ['Wordsmith', 'Community Leader', 'Helpful Mentor'],
    interests: ['writing', 'leadership'],
    skills: ['moderation', 'mentoring'],
    bio: 'Community moderator and mentor',
    preferences: {
      notifications: {
        email: true,
        push: true,
        mentions: true,
        events: true,
        newMembers: true,
        weeklyDigest: true
      },
      privacy: {
        showProfile: true,
        showActivity: true,
        allowDirectMessages: true,
        showOnlineStatus: true
      },
      interests: ['writing', 'leadership'],
      mentoring: {
        willingToMentor: true,
        seekingMentor: false,
        expertiseAreas: ['writing', 'leadership'],
        learningGoals: []
      }
    },
    warnings: [],
    isVerified: true,
    verifiedAt: '2024-01-20T14:00:00Z'
  },
  {
    id: 'memb-3',
    userId: 'user-1',
    communityId: 'comm-3',
    role: 'member',
    status: 'active',
    joinedAt: '2024-02-01T09:30:00Z',
    lastActiveAt: '2024-02-17T16:20:00Z',
    contributionScore: 67,
    postsCount: 8,
    helpfulVotes: 19,
    achievements: ['New Member'],
    interests: ['art', 'creativity'],
    skills: ['drawing', 'design'],
    preferences: {
      notifications: {
        email: true,
        push: false,
        mentions: true,
        events: true,
        newMembers: false,
        weeklyDigest: false
      },
      privacy: {
        showProfile: true,
        showActivity: true,
        allowDirectMessages: true,
        showOnlineStatus: false
      },
      interests: ['art', 'creativity'],
      mentoring: {
        willingToMentor: false,
        seekingMentor: true,
        expertiseAreas: [],
        learningGoals: ['improve drawing skills']
      }
    },
    warnings: [],
    isVerified: false
  },
  {
    id: 'memb-4',
    userId: 'user-2',
    communityId: 'comm-1',
    role: 'admin',
    status: 'active',
    joinedAt: '2024-01-10T09:00:00Z',
    lastActiveAt: '2024-02-19T14:15:00Z',
    contributionScore: 198,
    postsCount: 45,
    helpfulVotes: 89,
    achievements: ['Community Founder', 'Super Contributor', 'Mentor'],
    interests: ['education', 'technology', 'leadership'],
    skills: ['administration', 'teaching', 'community building'],
    bio: 'Community administrator and founder',
    preferences: {
      notifications: {
        email: true,
        push: true,
        mentions: true,
        events: true,
        newMembers: true,
        weeklyDigest: true
      },
      privacy: {
        showProfile: true,
        showActivity: true,
        allowDirectMessages: true,
        showOnlineStatus: true
      },
      interests: ['education', 'technology', 'leadership'],
      mentoring: {
        willingToMentor: true,
        seekingMentor: false,
        expertiseAreas: ['administration', 'teaching', 'community building'],
        learningGoals: []
      }
    },
    warnings: [],
    isVerified: true,
    verifiedAt: '2024-01-10T09:00:00Z'
  },
  {
    id: 'memb-5',
    userId: 'user-2',
    communityId: 'comm-4',
    role: 'member',
    status: 'active',
    joinedAt: '2024-01-25T11:00:00Z',
    lastActiveAt: '2024-02-16T13:30:00Z',
    contributionScore: 76,
    postsCount: 6,
    helpfulVotes: 15,
    achievements: ['Helpful Tutor'],
    interests: ['tutoring', 'education'],
    skills: ['teaching', 'mentoring'],
    preferences: {
      notifications: {
        email: false,
        push: false,
        mentions: true,
        events: true,
        newMembers: false,
        weeklyDigest: true
      },
      privacy: {
        showProfile: true,
        showActivity: true,
        allowDirectMessages: true,
        showOnlineStatus: true
      },
      interests: ['tutoring', 'education'],
      mentoring: {
        willingToMentor: true,
        seekingMentor: false,
        expertiseAreas: ['teaching', 'mentoring'],
        learningGoals: []
      }
    },
    warnings: [],
    isVerified: false
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const communityId = searchParams.get('communityId');
    const status = searchParams.get('status');
    const role = searchParams.get('role');

    let filteredMemberships = mockMemberships;

    // Apply filters
    if (userId) {
      filteredMemberships = filteredMemberships.filter(m => m.userId === userId);
    }
    if (communityId) {
      filteredMemberships = filteredMemberships.filter(m => m.communityId === communityId);
    }
    if (status) {
      filteredMemberships = filteredMemberships.filter(m => m.status === status);
    }
    if (role) {
      filteredMemberships = filteredMemberships.filter(m => m.role === role);
    }

    return NextResponse.json(filteredMemberships);
  } catch (error) {
    console.error('Error fetching community memberships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memberships' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const membershipData = await request.json();
    
    // Check if user is already a member of this community
    const existingMembership = mockMemberships.find(
      m => m.userId === membershipData.userId && m.communityId === membershipData.communityId
    );

    if (existingMembership) {
      return NextResponse.json(
        { error: 'User is already a member of this community' },
        { status: 400 }
      );
    }

    // In a real implementation, this would save to a database
    const newMembership: CommunityMembership = {
      id: `memb-${Date.now()}`,
      ...membershipData,
      role: membershipData.role || 'member',
      status: 'active',
      joinedAt: new Date().toISOString(),
      contributionScore: 0,
      postsCount: 0,
      helpfulVotes: 0,
      achievements: [],
      interests: [],
      skills: [],
      preferences: {
        notifications: {
          email: true,
          push: true,
          mentions: true,
          events: true,
          newMembers: true,
          weeklyDigest: true
        },
        privacy: {
          showProfile: true,
          showActivity: true,
          allowDirectMessages: true,
          showOnlineStatus: true
        },
        interests: [],
        mentoring: {
          willingToMentor: false,
          seekingMentor: false,
          expertiseAreas: [],
          learningGoals: []
        }
      },
      warnings: [],
      isVerified: false
    };

    // Add to mock data (in memory only)
    mockMemberships.push(newMembership);

    return NextResponse.json(newMembership, { status: 201 });
  } catch (error) {
    console.error('Error creating community membership:', error);
    return NextResponse.json(
      { error: 'Failed to create membership' },
      { status: 500 }
    );
  }
}