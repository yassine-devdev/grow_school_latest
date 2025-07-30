import { NextRequest, NextResponse } from 'next/server';
import { StudentCommunity, CommunityActivity, CommunityResource, CommunityAchievement } from '@/types';

// Mock data for student communities
const mockCommunities: StudentCommunity[] = [
  {
    id: 'comm-1',
    name: 'Science Enthusiasts Club',
    description: 'A community for students passionate about scientific discovery, research, and innovation. Share experiments, discuss breakthroughs, and collaborate on projects.',
    type: 'academic',
    privacy: 'public',
    category: 'Science',
    tags: ['science', 'research', 'experiments', 'innovation', 'STEM'],
    membershipRequirements: [
      'Interest in scientific topics',
      'Willingness to participate in discussions',
      'Respect for diverse perspectives'
    ],
    rules: [
      'Be respectful and constructive in all interactions',
      'Share reliable sources when discussing scientific topics',
      'No spam or off-topic content',
      'Help maintain a supportive learning environment'
    ],
    upcomingEvents: [
      {
        title: 'Virtual Science Fair',
        date: '2024-03-15T14:00:00Z',
        duration: 120
      },
      {
        title: 'Guest Speaker: Marine Biology',
        date: '2024-03-22T16:00:00Z',
        duration: 60
      }
    ],
    activities: [
      {
        id: 'act-1',
        title: 'Weekly Science Discussion',
        description: 'Weekly discussion on current scientific discoveries and research',
        type: 'discussion',
        scheduledDate: '2024-02-20T15:00:00Z',
        duration: 60,
        location: 'Virtual Meeting Room',
        isVirtual: true,
        currentParticipants: 25,
        facilitator: 'Dr. Sarah Chen',
        materials: ['Discussion topics', 'Research papers'],
        status: 'planned',
        createdBy: 'teacher-1',
        createdAt: new Date().toISOString()
      },
      {
        id: 'act-2',
        title: 'Science Project Showcase',
        description: 'Students present their science projects and get feedback',
        type: 'project',
        scheduledDate: '2024-02-25T14:00:00Z',
        duration: 90,
        location: 'Science Lab',
        isVirtual: false,
        currentParticipants: 15,
        facilitator: 'Community Members',
        materials: ['Project presentations', 'Feedback forms'],
        status: 'planned',
        createdBy: 'teacher-1',
        createdAt: new Date().toISOString()
      }
    ],
    resources: [
      {
        id: 'res-1',
        title: 'Scientific Method Guide',
        description: 'Comprehensive guide to conducting scientific research',
        type: 'document',
        url: '/resources/scientific-method-guide.pdf',
        category: 'Educational',
        tags: ['research', 'methodology', 'guide'],
        isPublic: true,
        uploadedBy: 'admin-1',
        uploadedAt: '2024-01-15T10:00:00Z',
        downloads: 45,
        rating: 4.5,
        reviews: []
      },
      {
        id: 'res-2',
        title: 'Lab Safety Protocols',
        description: 'Essential safety guidelines for laboratory work',
        type: 'document',
        url: '/resources/lab-safety-protocols.pdf',
        category: 'Safety',
        tags: ['safety', 'laboratory', 'protocols'],
        isPublic: true,
        uploadedBy: 'teacher-1',
        uploadedAt: '2024-01-20T14:30:00Z',
        downloads: 38,
        rating: 4.2,
        reviews: []
      }
    ],
    achievements: [
      {
        id: 'ach-1',
        name: 'Science Explorer',
        description: 'Participated in 5 science discussions',
        icon: 'microscope',
        criteria: ['Participate in 5 community discussions'],
        points: 50,
        isActive: true,
        earnedBy: ['user-1', 'user-2'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'ach-2',
        name: 'Research Contributor',
        description: 'Shared 3 scientific resources with the community',
        icon: 'book',
        criteria: ['Share 3 educational resources'],
        points: 75,
        isActive: true,
        earnedBy: ['user-1'],
        createdAt: new Date().toISOString()
      }
    ],
    stats: {
      totalMembers: 156,
      activeMembers: 89,
      totalPosts: 234,
      totalEvents: 12,
      totalResources: 25,
      engagementRate: 75,
      growthRate: 12,
      averageSessionDuration: 45,
      topContributors: [
        { userId: 'user-1', contributions: 25 },
        { userId: 'user-2', contributions: 18 }
      ],
      popularTags: [
        { tag: 'science', count: 45 },
        { tag: 'research', count: 32 }
      ],
      activityTrends: [
        { date: '2024-01-01', posts: 10, members: 150 },
        { date: '2024-01-02', posts: 12, members: 152 }
      ]
    },
    settings: {
      allowMemberInvites: true,
      requireApproval: false,
      allowGuestPosts: false,
      moderationLevel: 'moderate',
      contentFilters: ['spam', 'inappropriate'],
      notificationSettings: {
        newMembers: true,
        newPosts: true,
        events: true,
        mentions: true
      },
      integrations: {
        calendar: true,
        messaging: true,
        videoConferencing: true,
        fileSharing: true
      }
    },
    isActive: true,
    createdBy: 'teacher-1',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-02-15T16:30:00Z'
  },
  {
    id: 'comm-2',
    name: 'Creative Writing Circle',
    description: 'A supportive community for aspiring writers to share their work, get feedback, and improve their craft through collaborative writing exercises.',
    type: 'hobby',
    privacy: 'public',
    category: 'Literature',
    tags: ['writing', 'creativity', 'literature', 'poetry', 'storytelling'],
    membershipRequirements: [
      'Passion for creative writing',
      'Willingness to give and receive constructive feedback',
      'Commitment to respectful communication'
    ],
    rules: [
      'Provide constructive and respectful feedback',
      'Respect intellectual property and originality',
      'Keep content appropriate for all ages',
      'Support fellow writers in their creative journey'
    ],
    upcomingEvents: [
      {
        title: 'Poetry Slam Night',
        date: '2024-03-10T19:00:00Z',
        duration: 90
      },
      {
        title: 'Writing Workshop: Character Development',
        date: '2024-03-17T15:00:00Z',
        duration: 75
      }
    ],
    activities: [
      {
        id: 'act-3',
        title: 'Daily Writing Prompts',
        description: 'Daily creative writing prompts to inspire new stories and poems',
        type: 'challenge',
        scheduledDate: '2024-02-20T08:00:00Z',
        duration: 30,
        participantCount: 42,
        isRecurring: true,
        facilitator: 'Community Moderators',
        materials: ['Writing prompts', 'Submission guidelines'],
        location: 'Online Forum'
      },
      {
        id: 'act-4',
        title: 'Peer Review Sessions',
        description: 'Small group sessions for detailed feedback on writing pieces',
        type: 'mentoring',
        scheduledDate: '2024-02-23T16:00:00Z',
        duration: 60,
        participantCount: 18,
        isRecurring: true,
        facilitator: 'Experienced Writers',
        materials: ['Writing samples', 'Review guidelines'],
        location: 'Virtual Breakout Rooms'
      }
    ],
    resources: [
      {
        id: 'res-3',
        title: 'Creative Writing Techniques',
        description: 'Guide to various creative writing techniques and styles',
        type: 'document',
        url: '/resources/creative-writing-techniques.pdf',
        category: 'Educational',
        uploadedBy: 'teacher-2',
        uploadedAt: '2024-01-18T11:00:00Z',
        downloadCount: 67,
        tags: ['techniques', 'writing', 'creativity']
      }
    ],
    achievements: [
      {
        id: 'ach-3',
        name: 'Wordsmith',
        description: 'Completed 10 writing prompts',
        icon: 'pen',
        criteria: 'Complete 10 daily writing prompts',
        pointsAwarded: 60,
        badgeColor: 'purple'
      }
    ],
    stats: {
      totalMembers: 89,
      activeMembers: 52,
      totalPosts: 178,
      totalComments: 423,
      weeklyActivity: 38,
      monthlyGrowth: 8
    },
    settings: {
      allowMemberInvites: true,
      requireApproval: false,
      allowFileSharing: true,
      allowEvents: true,
      moderationLevel: 'standard',
      postApprovalRequired: false,
      allowAnonymousPosts: true,
      maxMembersLimit: 200,
      allowMemberPromotion: true,
      enableNotifications: true,
      allowExternalLinks: true,
      contentFiltering: true
    },
    isActive: true,
    createdBy: 'student-1',
    createdAt: '2024-01-12T14:00:00Z',
    updatedAt: '2024-02-18T10:45:00Z'
  },
  {
    id: 'comm-3',
    name: 'Global Cultures Exchange',
    description: 'Connect with students from different cultural backgrounds to share traditions, languages, and perspectives in a welcoming environment.',
    type: 'cultural',
    privacy: 'public',
    category: 'Cultural Studies',
    tags: ['culture', 'diversity', 'languages', 'traditions', 'global'],
    membershipRequirements: [
      'Interest in learning about different cultures',
      'Respectful attitude towards diversity',
      'Willingness to share your own cultural background'
    ],
    rules: [
      'Celebrate and respect all cultural backgrounds',
      'No discrimination or cultural stereotyping',
      'Share authentic cultural experiences',
      'Ask questions with genuine curiosity and respect'
    ],
    upcomingEvents: [
      {
        title: 'International Food Festival',
        date: '2024-03-20T12:00:00Z',
        duration: 180
      },
      {
        title: 'Language Exchange Session',
        date: '2024-03-25T17:00:00Z',
        duration: 90
      }
    ],
    activities: [
      {
        id: 'act-5',
        title: 'Cultural Spotlight Series',
        description: 'Weekly presentations featuring different cultures and traditions',
        type: 'presentation',
        scheduledDate: '2024-02-21T15:00:00Z',
        duration: 45,
        participantCount: 35,
        isRecurring: true,
        facilitator: 'Community Members',
        materials: ['Presentation slides', 'Cultural artifacts'],
        location: 'Cultural Center'
      }
    ],
    resources: [
      {
        id: 'res-4',
        title: 'World Cultures Database',
        description: 'Comprehensive database of world cultures and traditions',
        type: 'interactive',
        url: '/resources/world-cultures-database',
        category: 'Reference',
        uploadedBy: 'admin-2',
        uploadedAt: '2024-01-22T13:00:00Z',
        downloadCount: 92,
        tags: ['cultures', 'traditions', 'reference']
      }
    ],
    achievements: [
      {
        id: 'ach-4',
        name: 'Cultural Ambassador',
        description: 'Shared insights about your culture with the community',
        icon: 'globe',
        criteria: 'Present about your cultural background',
        pointsAwarded: 80,
        badgeColor: 'orange'
      }
    ],
    stats: {
      totalMembers: 203,
      activeMembers: 127,
      totalPosts: 312,
      totalComments: 789,
      weeklyActivity: 62,
      monthlyGrowth: 18
    },
    settings: {
      allowMemberInvites: true,
      requireApproval: false,
      allowFileSharing: true,
      allowEvents: true,
      moderationLevel: 'high',
      postApprovalRequired: false,
      allowAnonymousPosts: false,
      maxMembersLimit: 1000,
      allowMemberPromotion: true,
      enableNotifications: true,
      allowExternalLinks: true,
      contentFiltering: true
    },
    isActive: true,
    createdBy: 'teacher-3',
    createdAt: '2024-01-08T16:00:00Z',
    updatedAt: '2024-02-20T12:15:00Z'
  },
  {
    id: 'comm-4',
    name: 'Peer Tutoring Network',
    description: 'A mentorship community where students help each other succeed academically through peer tutoring and study support.',
    type: 'mentorship',
    privacy: 'school-only',
    category: 'Academic Support',
    tags: ['tutoring', 'mentorship', 'academic-support', 'study-groups', 'peer-learning'],
    membershipRequirements: [
      'Current student status',
      'Commitment to helping peers succeed',
      'Good academic standing in at least one subject'
    ],
    rules: [
      'Maintain confidentiality of tutoring sessions',
      'Be patient and supportive with all learners',
      'Provide accurate and helpful information',
      'Report any concerns to community moderators'
    ],
    upcomingEvents: [
      {
        title: 'Tutor Training Workshop',
        date: '2024-03-12T14:00:00Z',
        duration: 120
      },
      {
        title: 'Study Skills Seminar',
        date: '2024-03-19T15:30:00Z',
        duration: 90
      }
    ],
    activities: [
      {
        id: 'act-6',
        title: 'Math Tutoring Sessions',
        description: 'One-on-one and group tutoring for mathematics subjects',
        type: 'mentoring',
        scheduledDate: '2024-02-22T16:00:00Z',
        duration: 60,
        participantCount: 28,
        isRecurring: true,
        facilitator: 'Math Tutors',
        materials: ['Textbooks', 'Practice problems', 'Calculators'],
        location: 'Study Hall'
      }
    ],
    resources: [
      {
        id: 'res-5',
        title: 'Effective Tutoring Strategies',
        description: 'Guide for peer tutors on effective teaching methods',
        type: 'document',
        url: '/resources/tutoring-strategies.pdf',
        category: 'Training',
        uploadedBy: 'counselor-1',
        uploadedAt: '2024-01-25T09:30:00Z',
        downloadCount: 34,
        tags: ['tutoring', 'teaching', 'strategies']
      }
    ],
    achievements: [
      {
        id: 'ach-5',
        name: 'Helpful Tutor',
        description: 'Successfully tutored 5 different students',
        icon: 'graduation-cap',
        criteria: 'Complete 5 tutoring sessions with positive feedback',
        pointsAwarded: 100,
        badgeColor: 'gold'
      }
    ],
    stats: {
      totalMembers: 67,
      activeMembers: 41,
      totalPosts: 89,
      totalComments: 156,
      weeklyActivity: 23,
      monthlyGrowth: 5
    },
    settings: {
      allowMemberInvites: false,
      requireApproval: true,
      allowFileSharing: true,
      allowEvents: true,
      moderationLevel: 'high',
      postApprovalRequired: false,
      allowAnonymousPosts: false,
      maxMembersLimit: 150,
      allowMemberPromotion: true,
      enableNotifications: true,
      allowExternalLinks: false,
      contentFiltering: true
    },
    isActive: true,
    createdBy: 'counselor-1',
    createdAt: '2024-01-14T11:00:00Z',
    updatedAt: '2024-02-16T14:20:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const privacy = searchParams.get('privacy');
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    let filteredCommunities = mockCommunities;

    // Apply filters
    if (type) {
      filteredCommunities = filteredCommunities.filter(comm => comm.type === type);
    }
    if (privacy) {
      filteredCommunities = filteredCommunities.filter(comm => comm.privacy === privacy);
    }
    if (category) {
      filteredCommunities = filteredCommunities.filter(comm => 
        comm.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    if (isActive !== null) {
      const active = isActive === 'true';
      filteredCommunities = filteredCommunities.filter(comm => comm.isActive === active);
    }

    return NextResponse.json(filteredCommunities);
  } catch (error) {
    console.error('Error fetching student communities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const communityData = await request.json();
    
    // In a real implementation, this would save to a database
    const newCommunity: StudentCommunity = {
      id: `comm-${Date.now()}`,
      ...communityData,
      activities: [],
      resources: [],
      achievements: [],
      stats: {
        totalMembers: 1, // Creator is the first member
        activeMembers: 1,
        totalPosts: 0,
        totalComments: 0,
        weeklyActivity: 0,
        monthlyGrowth: 0
      },
      settings: {
        allowMemberInvites: true,
        requireApproval: false,
        allowFileSharing: true,
        allowEvents: true,
        moderationLevel: 'standard',
        postApprovalRequired: false,
        allowAnonymousPosts: false,
        maxMembersLimit: 500,
        allowMemberPromotion: true,
        enableNotifications: true,
        allowExternalLinks: true,
        contentFiltering: true
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to mock data (in memory only)
    mockCommunities.push(newCommunity);

    return NextResponse.json(newCommunity, { status: 201 });
  } catch (error) {
    console.error('Error creating student community:', error);
    return NextResponse.json(
      { error: 'Failed to create community' },
      { status: 500 }
    );
  }
}