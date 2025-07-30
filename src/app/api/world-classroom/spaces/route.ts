import { NextRequest, NextResponse } from 'next/server';
import { VirtualCollaborationSpace } from '@/types';

// Mock data for virtual collaboration spaces
const mockCollaborationSpaces: VirtualCollaborationSpace[] = [
  {
    id: 'space-1',
    connectionId: 'connection-1',
    name: 'American-Japanese Cultural Exchange Hub',
    description: 'A shared digital space for Denver and Tokyo students to collaborate on cultural exchange activities.',
    type: 'project-workspace',
    url: 'https://collaborate.worldclassroom.edu/space-1',
    accessLevel: 'participants-only',
    permissions: {
      canEdit: ['teacher-1', 'teacher-2'],
      canComment: ['student-1', 'student-2', 'student-3', 'student-4'],
      canView: ['teacher-1', 'teacher-2', 'student-1', 'student-2', 'student-3', 'student-4']
    },
    moderationSettings: {
      requiresApproval: true,
      moderators: ['teacher-1', 'teacher-2'],
      allowAnonymous: false
    },
    content: [
      {
        id: 'content-1',
        spaceId: 'space-1',
        type: 'text',
        title: 'Welcome to Our Cultural Exchange!',
        content: 'Hello everyone! We are so excited to start this cultural exchange journey together. This space will be our home base for sharing ideas, collaborating on projects, and learning about each other\'s cultures.',
        author: 'teacher-1',
        authorRole: 'teacher',
        authorClassroom: 'classroom-1',
        isApproved: true,
        approvedBy: 'teacher-1',
        approvedAt: '2024-01-15T10:00:00Z',
        comments: [
          {
            id: 'comment-1',
            contentId: 'content-1',
            author: 'student-1',
            authorRole: 'student',
            authorClassroom: 'classroom-2',
            comment: 'こんにちは！We are very excited too! Looking forward to learning about American culture!',
            isApproved: true,
            approvedBy: 'teacher-2',
            reactions: [
              {
                id: 'reaction-1',
                type: 'like',
                author: 'student-2',
                authorClassroom: 'classroom-1',
                createdAt: '2024-01-15T11:00:00Z'
              }
            ],
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z'
          }
        ],
        reactions: [
          {
            id: 'reaction-2',
            type: 'love',
            author: 'student-3',
            authorClassroom: 'classroom-2',
            createdAt: '2024-01-15T10:15:00Z'
          }
        ],
        version: 1,
        editHistory: [],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'content-2',
        spaceId: 'space-1',
        type: 'image',
        title: 'Our School in Denver',
        content: 'Here is a photo of our beautiful school in Denver, Colorado. You can see the Rocky Mountains in the background!',
        mediaUrl: '/images/denver-school.jpg',
        author: 'student-2',
        authorRole: 'student',
        authorClassroom: 'classroom-1',
        isApproved: true,
        approvedBy: 'teacher-1',
        approvedAt: '2024-01-16T09:00:00Z',
        comments: [
          {
            id: 'comment-2',
            contentId: 'content-2',
            author: 'student-4',
            authorRole: 'student',
            authorClassroom: 'classroom-2',
            comment: 'Wow! The mountains are so beautiful! Our school is in the city, so we see many tall buildings instead.',
            isApproved: true,
            approvedBy: 'teacher-2',
            reactions: [],
            createdAt: '2024-01-16T10:00:00Z',
            updatedAt: '2024-01-16T10:00:00Z'
          }
        ],
        reactions: [
          {
            id: 'reaction-3',
            type: 'interesting',
            author: 'student-1',
            authorClassroom: 'classroom-2',
            createdAt: '2024-01-16T09:30:00Z'
          }
        ],
        version: 1,
        editHistory: [],
        createdAt: '2024-01-16T08:30:00Z',
        updatedAt: '2024-01-16T09:00:00Z'
      },
      {
        id: 'content-3',
        spaceId: 'space-1',
        type: 'document',
        title: 'Cultural Comparison Project Guidelines',
        content: 'This document outlines our collaborative cultural comparison project. Please review the guidelines and timeline.',
        mediaUrl: '/documents/cultural-comparison-guidelines.pdf',
        author: 'teacher-2',
        authorRole: 'teacher',
        authorClassroom: 'classroom-2',
        isApproved: true,
        approvedBy: 'teacher-2',
        approvedAt: '2024-01-17T08:00:00Z',
        comments: [],
        reactions: [
          {
            id: 'reaction-4',
            type: 'helpful',
            author: 'student-3',
            authorClassroom: 'classroom-1',
            createdAt: '2024-01-17T09:00:00Z'
          }
        ],
        version: 1,
        editHistory: [],
        createdAt: '2024-01-17T08:00:00Z',
        updatedAt: '2024-01-17T08:00:00Z'
      }
    ],
    activities: [
      {
        id: 'activity-1',
        spaceId: 'space-1',
        type: 'content-added',
        actor: 'teacher-1',
        actorRole: 'teacher',
        actorClassroom: 'classroom-1',
        description: 'Ms. Rodriguez posted a welcome message',
        relatedContentId: 'content-1',
        timestamp: '2024-01-15T10:00:00Z'
      },
      {
        id: 'activity-2',
        spaceId: 'space-1',
        type: 'comment-added',
        actor: 'student-1',
        actorRole: 'student',
        actorClassroom: 'classroom-2',
        description: 'Yuki commented on the welcome message',
        relatedContentId: 'content-1',
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        id: 'activity-3',
        spaceId: 'space-1',
        type: 'content-added',
        actor: 'student-2',
        actorRole: 'student',
        actorClassroom: 'classroom-1',
        description: 'Emma shared a photo of their school',
        relatedContentId: 'content-2',
        timestamp: '2024-01-16T08:30:00Z'
      }
    ],
    isActive: true,
    createdBy: 'teacher-1',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-17T08:00:00Z'
  },
  {
    id: 'space-2',
    connectionId: 'connection-2',
    name: 'Climate Research Collaboration',
    description: 'Shared workspace for Denver and São Paulo students working on climate change research project.',
    type: 'shared-document',
    url: 'https://collaborate.worldclassroom.edu/space-2',
    accessLevel: 'participants-only',
    permissions: {
      canEdit: ['teacher-1', 'teacher-3', 'student-5', 'student-6'],
      canComment: ['student-7', 'student-8'],
      canView: ['teacher-1', 'teacher-3', 'student-5', 'student-6', 'student-7', 'student-8']
    },
    moderationSettings: {
      requiresApproval: false,
      moderators: ['teacher-1', 'teacher-3'],
      allowAnonymous: false
    },
    content: [
      {
        id: 'content-4',
        spaceId: 'space-2',
        type: 'document',
        title: 'Climate Data Collection Template',
        content: 'Template for collecting and organizing climate data from both Denver and São Paulo regions.',
        mediaUrl: '/documents/climate-data-template.xlsx',
        author: 'teacher-3',
        authorRole: 'teacher',
        authorClassroom: 'classroom-3',
        isApproved: true,
        approvedBy: 'teacher-3',
        approvedAt: '2024-01-25T10:00:00Z',
        comments: [],
        reactions: [],
        version: 1,
        editHistory: [],
        createdAt: '2024-01-25T10:00:00Z',
        updatedAt: '2024-01-25T10:00:00Z'
      }
    ],
    activities: [
      {
        id: 'activity-4',
        spaceId: 'space-2',
        type: 'content-added',
        actor: 'teacher-3',
        actorRole: 'teacher',
        actorClassroom: 'classroom-3',
        description: 'Prof. Oliveira uploaded the climate data template',
        relatedContentId: 'content-4',
        timestamp: '2024-01-25T10:00:00Z'
      }
    ],
    isActive: true,
    createdBy: 'teacher-1',
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z'
  },
  {
    id: 'space-3',
    connectionId: 'connection-1',
    name: 'Cultural Artifacts Gallery',
    description: 'A visual gallery space for students to share photos and descriptions of cultural artifacts from their regions.',
    type: 'gallery',
    url: 'https://collaborate.worldclassroom.edu/space-3',
    accessLevel: 'public',
    permissions: {
      canEdit: ['teacher-1', 'teacher-2'],
      canComment: ['student-1', 'student-2', 'student-3', 'student-4'],
      canView: ['*'] // Public access
    },
    moderationSettings: {
      requiresApproval: true,
      moderators: ['teacher-1', 'teacher-2'],
      allowAnonymous: false
    },
    content: [
      {
        id: 'content-5',
        spaceId: 'space-3',
        type: 'image',
        title: 'Traditional Japanese Origami Crane',
        content: 'This is a traditional origami crane that my grandmother taught me to make. In Japanese culture, cranes symbolize peace and good fortune.',
        mediaUrl: '/images/origami-crane.jpg',
        author: 'student-1',
        authorRole: 'student',
        authorClassroom: 'classroom-2',
        isApproved: true,
        approvedBy: 'teacher-2',
        approvedAt: '2024-01-18T14:00:00Z',
        comments: [
          {
            id: 'comment-3',
            contentId: 'content-5',
            author: 'student-3',
            authorRole: 'student',
            authorClassroom: 'classroom-1',
            comment: 'That\'s so beautiful! I would love to learn how to make one. Could you teach us in our next video call?',
            isApproved: true,
            approvedBy: 'teacher-1',
            reactions: [],
            createdAt: '2024-01-18T15:00:00Z',
            updatedAt: '2024-01-18T15:00:00Z'
          }
        ],
        reactions: [
          {
            id: 'reaction-5',
            type: 'love',
            author: 'student-2',
            authorClassroom: 'classroom-1',
            createdAt: '2024-01-18T14:30:00Z'
          }
        ],
        version: 1,
        editHistory: [],
        createdAt: '2024-01-18T13:30:00Z',
        updatedAt: '2024-01-18T14:00:00Z'
      },
      {
        id: 'content-6',
        spaceId: 'space-3',
        type: 'image',
        title: 'Native American Dreamcatcher',
        content: 'This dreamcatcher was made by my great-grandmother. In our family tradition, dreamcatchers protect us from bad dreams and let good dreams pass through.',
        mediaUrl: '/images/dreamcatcher.jpg',
        author: 'student-4',
        authorRole: 'student',
        authorClassroom: 'classroom-1',
        isApproved: true,
        approvedBy: 'teacher-1',
        approvedAt: '2024-01-19T11:00:00Z',
        comments: [],
        reactions: [
          {
            id: 'reaction-6',
            type: 'interesting',
            author: 'student-1',
            authorClassroom: 'classroom-2',
            createdAt: '2024-01-19T12:00:00Z'
          }
        ],
        version: 1,
        editHistory: [],
        createdAt: '2024-01-19T10:30:00Z',
        updatedAt: '2024-01-19T11:00:00Z'
      }
    ],
    activities: [
      {
        id: 'activity-5',
        spaceId: 'space-3',
        type: 'content-added',
        actor: 'student-1',
        actorRole: 'student',
        actorClassroom: 'classroom-2',
        description: 'Yuki shared a photo of a traditional origami crane',
        relatedContentId: 'content-5',
        timestamp: '2024-01-18T13:30:00Z'
      },
      {
        id: 'activity-6',
        spaceId: 'space-3',
        type: 'content-added',
        actor: 'student-4',
        actorRole: 'student',
        actorClassroom: 'classroom-1',
        description: 'Alex shared a photo of a Native American dreamcatcher',
        relatedContentId: 'content-6',
        timestamp: '2024-01-19T10:30:00Z'
      }
    ],
    isActive: true,
    createdBy: 'teacher-1',
    createdAt: '2024-01-18T12:00:00Z',
    updatedAt: '2024-01-19T11:00:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');
    const type = searchParams.get('type');
    const accessLevel = searchParams.get('accessLevel');
    const activeOnly = searchParams.get('active') === 'true';
    
    let filteredSpaces = mockCollaborationSpaces;
    
    // Filter by connection if specified
    if (connectionId) {
      filteredSpaces = filteredSpaces.filter(space => 
        space.connectionId === connectionId
      );
    }
    
    // Filter by type if specified
    if (type) {
      filteredSpaces = filteredSpaces.filter(space => 
        space.type === type
      );
    }
    
    // Filter by access level if specified
    if (accessLevel) {
      filteredSpaces = filteredSpaces.filter(space => 
        space.accessLevel === accessLevel
      );
    }
    
    // Filter by active status if specified
    if (activeOnly) {
      filteredSpaces = filteredSpaces.filter(space => 
        space.isActive
      );
    }
    
    // Sort by creation date (newest first)
    filteredSpaces.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return NextResponse.json(filteredSpaces);
  } catch (error) {
    console.error('Error fetching collaboration spaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collaboration spaces' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const spaceData = await request.json();
    
    // In a real application, this would save to a database
    const newSpace: VirtualCollaborationSpace = {
      id: `space-${Date.now()}`,
      ...spaceData,
      content: [],
      activities: [],
      isActive: true,
      createdBy: 'user', // This would come from authentication
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockCollaborationSpaces.push(newSpace);
    
    return NextResponse.json(newSpace, { status: 201 });
  } catch (error) {
    console.error('Error creating collaboration space:', error);
    return NextResponse.json(
      { error: 'Failed to create collaboration space' },
      { status: 500 }
    );
  }
}