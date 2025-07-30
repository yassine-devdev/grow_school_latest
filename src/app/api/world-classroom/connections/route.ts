import { NextRequest, NextResponse } from 'next/server';
import { ClassroomConnection, CollaborationType, ConnectionStatus } from '@/types';

// Mock data for classroom connections
const mockClassroomConnections: ClassroomConnection[] = [
  {
    id: 'connection-1',
    initiatingClassroom: 'classroom-1',
    targetClassroom: 'classroom-2',
    collaborationType: 'cultural-exchange' as CollaborationType,
    status: 'active' as ConnectionStatus,
    title: 'American-Japanese Cultural Exchange',
    description: 'A semester-long cultural exchange program between Denver and Tokyo students focusing on traditions, daily life, and modern culture.',
    objectives: [
      'Learn about each other\'s cultures and traditions',
      'Practice language skills through authentic communication',
      'Develop global citizenship awareness',
      'Create lasting international friendships'
    ],
    expectedDuration: 16, // 16 weeks
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-05-15T00:00:00Z',
    communicationMethods: ['video-call', 'text-chat', 'email', 'shared-document'],
    sharedLanguage: 'English',
    translationNeeded: false,
    culturalExchangeTopics: [
      'Traditional holidays and celebrations',
      'School systems comparison',
      'Food culture and cooking',
      'Popular entertainment and media',
      'Family structures and values'
    ],
    projectDetails: {
      theme: 'Bridging Cultures Through Understanding',
      deliverables: [
        'Cultural presentation videos',
        'Collaborative digital scrapbook',
        'Joint research report on cultural similarities',
        'Virtual cultural fair presentation'
      ],
      milestones: [
        {
          id: 'milestone-1',
          title: 'Initial Introductions',
          description: 'Students introduce themselves and their schools',
          dueDate: '2024-01-29T00:00:00Z',
          isCompleted: true,
          completedAt: '2024-01-28T00:00:00Z',
          deliverables: ['Introduction videos', 'School tour presentations'],
          order: 1
        },
        {
          id: 'milestone-2',
          title: 'Cultural Deep Dive',
          description: 'Explore traditional and modern aspects of each culture',
          dueDate: '2024-02-26T00:00:00Z',
          isCompleted: true,
          completedAt: '2024-02-25T00:00:00Z',
          deliverables: ['Cultural research presentations', 'Traditional recipe exchange'],
          order: 2
        },
        {
          id: 'milestone-3',
          title: 'Collaborative Project',
          description: 'Work together on joint cultural comparison project',
          dueDate: '2024-03-26T00:00:00Z',
          isCompleted: false,
          deliverables: ['Joint presentation', 'Collaborative digital artifact'],
          order: 3
        },
        {
          id: 'milestone-4',
          title: 'Final Showcase',
          description: 'Present learning outcomes to broader school community',
          dueDate: '2024-05-15T00:00:00Z',
          isCompleted: false,
          deliverables: ['Final presentation', 'Reflection essays'],
          order: 4
        }
      ],
      resources: [
        'Cultural exchange activity templates',
        'Video conferencing guidelines',
        'Digital collaboration tools training'
      ]
    },
    safetyGuidelines: [
      'All communications must be supervised by teachers',
      'No sharing of personal contact information',
      'Report any inappropriate behavior immediately',
      'Respect cultural differences and sensitivities',
      'Use appropriate language and behavior at all times'
    ],
    parentalConsent: {
      required: true,
      obtained: true,
      consentDate: '2024-01-10T00:00:00Z'
    },
    moderationSettings: {
      requiresModeration: true,
      moderators: ['teacher-1', 'teacher-2'],
      recordSessions: true,
      allowDirectMessaging: false
    },
    participants: [
      {
        id: 'participant-1',
        classroomId: 'classroom-1',
        role: 'student',
        joinedAt: '2024-01-15T00:00:00Z',
        isActive: true,
        participationLevel: 'high',
        lastActivity: '2024-01-20T14:30:00Z'
      },
      {
        id: 'participant-2',
        classroomId: 'classroom-2',
        role: 'student',
        joinedAt: '2024-01-15T00:00:00Z',
        isActive: true,
        participationLevel: 'high',
        lastActivity: '2024-01-20T09:15:00Z'
      },
      {
        id: 'participant-3',
        classroomId: 'classroom-1',
        role: 'teacher',
        joinedAt: '2024-01-15T00:00:00Z',
        isActive: true,
        participationLevel: 'high',
        lastActivity: '2024-01-20T16:00:00Z'
      },
      {
        id: 'participant-4',
        classroomId: 'classroom-2',
        role: 'teacher',
        joinedAt: '2024-01-15T00:00:00Z',
        isActive: true,
        participationLevel: 'high',
        lastActivity: '2024-01-20T10:30:00Z'
      }
    ],
    activities: [
      {
        id: 'activity-1',
        connectionId: 'connection-1',
        type: 'video-session',
        title: 'Welcome & Introductions',
        description: 'First meeting between the two classrooms',
        scheduledAt: '2024-01-16T20:00:00Z', // 3 PM Denver, 10 AM Tokyo next day
        startedAt: '2024-01-16T20:00:00Z',
        endedAt: '2024-01-16T21:00:00Z',
        duration: 60,
        participants: ['participant-1', 'participant-2', 'participant-3', 'participant-4'],
        facilitator: 'teacher-1',
        resources: [
          {
            id: 'resource-1',
            name: 'Introduction Activity Guide',
            type: 'document',
            url: '/resources/intro-guide.pdf',
            description: 'Structured activities for first meeting',
            isShared: true,
            uploadedBy: 'teacher-1',
            uploadedAt: '2024-01-15T00:00:00Z'
          }
        ],
        outcomes: [
          'Students successfully introduced themselves',
          'Established communication norms',
          'Planned next activities'
        ],
        recordings: ['/recordings/connection-1-activity-1.mp4'],
        artifacts: [],
        feedback: [
          {
            id: 'feedback-1',
            activityId: 'activity-1',
            participantId: 'participant-1',
            rating: 5,
            comments: 'Really exciting to meet students from Japan!',
            highlights: ['Learning about Japanese school uniforms', 'Hearing Japanese language'],
            improvements: ['Would like more time for individual conversations'],
            wouldRecommend: true,
            createdAt: '2024-01-16T22:00:00Z'
          }
        ],
        isCompleted: true,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-16T21:00:00Z'
      },
      {
        id: 'activity-2',
        connectionId: 'connection-1',
        type: 'cultural-sharing',
        title: 'Traditional Holiday Presentations',
        description: 'Students share their traditional holidays and celebrations',
        scheduledAt: '2024-01-23T20:00:00Z',
        startedAt: '2024-01-23T20:00:00Z',
        endedAt: '2024-01-23T21:30:00Z',
        duration: 90,
        participants: ['participant-1', 'participant-2', 'participant-3', 'participant-4'],
        facilitator: 'teacher-2',
        resources: [
          {
            id: 'resource-2',
            name: 'Holiday Presentation Template',
            type: 'presentation',
            url: '/resources/holiday-template.pptx',
            description: 'Template for holiday presentations',
            isShared: true,
            uploadedBy: 'teacher-2',
            uploadedAt: '2024-01-20T00:00:00Z'
          }
        ],
        outcomes: [
          'Learned about New Year traditions in both cultures',
          'Compared holiday foods and customs',
          'Planned holiday recipe exchange'
        ],
        recordings: ['/recordings/connection-1-activity-2.mp4'],
        artifacts: [
          '/artifacts/american-holidays-presentation.pdf',
          '/artifacts/japanese-holidays-presentation.pdf'
        ],
        feedback: [],
        isCompleted: true,
        createdAt: '2024-01-20T00:00:00Z',
        updatedAt: '2024-01-23T21:30:00Z'
      }
    ],
    feedback: [
      {
        id: 'connection-feedback-1',
        connectionId: 'connection-1',
        providedBy: 'teacher-1',
        role: 'teacher',
        overallRating: 5,
        culturalLearning: 5,
        languageImprovement: 4,
        technologyExperience: 4,
        communicationQuality: 5,
        comments: 'Excellent program that has really opened my students\' eyes to global perspectives.',
        highlights: [
          'High student engagement',
          'Meaningful cultural exchange',
          'Professional collaboration with Japanese teacher'
        ],
        challenges: [
          'Timezone coordination',
          'Some technical difficulties with video calls'
        ],
        suggestions: [
          'More structured small group activities',
          'Additional cultural exchange resources'
        ],
        wouldParticipateAgain: true,
        wouldRecommend: true,
        createdAt: '2024-01-20T00:00:00Z'
      }
    ],
    createdBy: 'teacher-1',
    approvedBy: 'admin-1',
    approvedAt: '2024-01-12T00:00:00Z',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
    metadata: {
      totalSessions: 8,
      completedSessions: 2,
      averageAttendance: 95,
      studentSatisfaction: 4.8
    }
  },
  {
    id: 'connection-2',
    initiatingClassroom: 'classroom-1',
    targetClassroom: 'classroom-3',
    collaborationType: 'project-based' as CollaborationType,
    status: 'pending' as ConnectionStatus,
    title: 'Climate Change Research Collaboration',
    description: 'Joint research project on climate change impacts in different regions (Colorado vs São Paulo).',
    objectives: [
      'Research climate change impacts in different geographic regions',
      'Compare environmental challenges and solutions',
      'Develop collaborative research and presentation skills',
      'Create actionable environmental awareness campaign'
    ],
    expectedDuration: 12, // 12 weeks
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2024-04-26T00:00:00Z',
    communicationMethods: ['video-call', 'shared-document', 'email'],
    sharedLanguage: 'English',
    translationNeeded: false,
    projectDetails: {
      theme: 'Climate Action Through Global Collaboration',
      deliverables: [
        'Joint research report',
        'Comparative data analysis',
        'Environmental action plan',
        'Awareness campaign materials'
      ],
      milestones: [
        {
          id: 'milestone-5',
          title: 'Research Planning',
          description: 'Define research questions and methodology',
          dueDate: '2024-02-15T00:00:00Z',
          isCompleted: false,
          deliverables: ['Research proposal', 'Data collection plan'],
          order: 1
        },
        {
          id: 'milestone-6',
          title: 'Data Collection',
          description: 'Gather climate data for both regions',
          dueDate: '2024-03-15T00:00:00Z',
          isCompleted: false,
          deliverables: ['Regional climate data', 'Impact assessments'],
          order: 2
        },
        {
          id: 'milestone-7',
          title: 'Analysis & Comparison',
          description: 'Analyze and compare findings',
          dueDate: '2024-04-05T00:00:00Z',
          isCompleted: false,
          deliverables: ['Comparative analysis', 'Visual data presentations'],
          order: 3
        },
        {
          id: 'milestone-8',
          title: 'Action Plan Development',
          description: 'Create actionable environmental solutions',
          dueDate: '2024-04-26T00:00:00Z',
          isCompleted: false,
          deliverables: ['Action plan document', 'Campaign materials'],
          order: 4
        }
      ],
      resources: [
        'Climate data sources',
        'Research methodology guides',
        'Collaborative document templates'
      ]
    },
    safetyGuidelines: [
      'All communications supervised by teachers',
      'Respect for different environmental perspectives',
      'Accurate data reporting and citation',
      'Professional collaboration standards'
    ],
    parentalConsent: {
      required: true,
      obtained: false
    },
    moderationSettings: {
      requiresModeration: true,
      moderators: ['teacher-1', 'teacher-3'],
      recordSessions: true,
      allowDirectMessaging: false
    },
    participants: [],
    activities: [],
    feedback: [],
    createdBy: 'teacher-1',
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z',
    metadata: {
      proposalStatus: 'awaiting_approval',
      estimatedParticipants: 20
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get('classroomId');
    const status = searchParams.get('status') as ConnectionStatus;
    const collaborationType = searchParams.get('type') as CollaborationType;
    
    let filteredConnections = mockClassroomConnections;
    
    // Filter by classroom if specified
    if (classroomId) {
      filteredConnections = filteredConnections.filter(connection => 
        connection.initiatingClassroom === classroomId || 
        connection.targetClassroom === classroomId
      );
    }
    
    // Filter by status if specified
    if (status) {
      filteredConnections = filteredConnections.filter(connection => 
        connection.status === status
      );
    }
    
    // Filter by collaboration type if specified
    if (collaborationType) {
      filteredConnections = filteredConnections.filter(connection => 
        connection.collaborationType === collaborationType
      );
    }
    
    // Sort by status priority (active first) and then by creation date
    const statusOrder = { 'active': 1, 'pending': 2, 'paused': 3, 'completed': 4, 'cancelled': 5 };
    filteredConnections.sort((a, b) => {
      const statusA = statusOrder[a.status];
      const statusB = statusOrder[b.status];
      
      if (statusA !== statusB) {
        return statusA - statusB;
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return NextResponse.json(filteredConnections);
  } catch (error) {
    console.error('Error fetching classroom connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classroom connections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const connectionData = await request.json();
    
    // In a real application, this would save to a database
    const newConnection: ClassroomConnection = {
      id: `connection-${Date.now()}`,
      ...connectionData,
      status: 'pending' as ConnectionStatus,
      participants: [],
      activities: [],
      feedback: [],
      parentalConsent: {
        required: true,
        obtained: false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockClassroomConnections.push(newConnection);
    
    return NextResponse.json(newConnection, { status: 201 });
  } catch (error) {
    console.error('Error creating classroom connection:', error);
    return NextResponse.json(
      { error: 'Failed to create classroom connection' },
      { status: 500 }
    );
  }
}