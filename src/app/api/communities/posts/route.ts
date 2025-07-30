import { NextRequest, NextResponse } from 'next/server';
import { CommunityPost, CommunityReply, PostReaction } from '@/types';

// Mock data for community posts
const mockPosts: CommunityPost[] = [
  {
    id: 'post-1',
    communityId: 'comm-1',
    authorId: 'user-1',
    title: 'Exciting Discovery in Quantum Physics',
    content: 'Just read about the latest breakthrough in quantum entanglement research. The implications for quantum computing are incredible! Has anyone else been following this development?',
    type: 'discussion',
    category: 'Research',
    tags: ['quantum-physics', 'research', 'breakthrough'],
    attachments: [],
    isPinned: false,
    isLocked: false,
    visibility: 'public',
    reactions: [
      {
        userId: 'user-2',
        type: 'like',
        timestamp: '2024-02-18T10:30:00Z'
      },
      {
        userId: 'user-3',
        type: 'love',
        timestamp: '2024-02-18T11:15:00Z'
      }
    ],
    replies: [
      {
        id: 'reply-1',
        postId: 'post-1',
        authorId: 'user-2',
        content: 'This is fascinating! I\'ve been working on a related project. Would love to discuss the practical applications.',
        parentReplyId: undefined,
        attachments: [],
        reactions: [
          {
            userId: 'user-1',
            type: 'like',
            timestamp: '2024-02-18T12:00:00Z'
          }
        ],
        isModerated: false,
        helpfulVotes: 2,
        reportCount: 0,
        createdAt: '2024-02-18T11:45:00Z',
        updatedAt: '2024-02-18T11:45:00Z'
      }
    ],
    views: 45,
    helpfulVotes: 8,
    isModerated: false,
    reportCount: 0,
    createdAt: '2024-02-18T09:30:00Z',
    updatedAt: '2024-02-18T09:30:00Z'
  },
  {
    id: 'post-2',
    communityId: 'comm-2',
    authorId: 'user-3',
    title: 'Weekly Writing Prompt: Time Travel',
    content: 'This week\'s prompt: You discover a time machine in your grandmother\'s attic. Where do you go first, and what do you discover? Share your stories below!',
    type: 'discussion',
    category: 'Writing Prompts',
    tags: ['writing-prompt', 'time-travel', 'creative-writing'],
    attachments: [],
    isPinned: true,
    isLocked: false,
    visibility: 'public',
    reactions: [
      {
        userId: 'user-1',
        type: 'like',
        timestamp: '2024-02-17T14:20:00Z'
      },
      {
        userId: 'user-4',
        type: 'love',
        timestamp: '2024-02-17T15:30:00Z'
      }
    ],
    replies: [
      {
        id: 'reply-2',
        postId: 'post-2',
        authorId: 'user-1',
        content: 'Great prompt! I wrote a short story about visiting the Renaissance. The detail about the art studios was my favorite part to research.',
        parentReplyId: undefined,
        attachments: [
          {
            id: 'att-1',
            name: 'story-renaissance.pdf',
            type: 'document',
            url: '/uploads/story-renaissance.pdf',
            size: 245760,
            mimeType: 'application/pdf',
            description: 'Short story about visiting the Renaissance'
          }
        ],
        reactions: [
          {
            userId: 'user-3',
            type: 'love',
            timestamp: '2024-02-17T16:45:00Z'
          }
        ],
        isModerated: false,
        helpfulVotes: 3,
        reportCount: 0,
        createdAt: '2024-02-17T16:00:00Z',
        updatedAt: '2024-02-17T16:00:00Z'
      },
      {
        id: 'reply-3',
        postId: 'post-2',
        authorId: 'user-4',
        content: 'I chose to visit the future instead! Wrote about what schools might look like in 2124.',
        parentReplyId: undefined,
        attachments: [],
        reactions: [],
        isModerated: false,
        helpfulVotes: 1,
        reportCount: 0,
        createdAt: '2024-02-17T17:30:00Z',
        updatedAt: '2024-02-17T17:30:00Z'
      }
    ],
    views: 67,
    helpfulVotes: 12,
    isModerated: false,
    reportCount: 0,
    createdAt: '2024-02-17T13:00:00Z',
    updatedAt: '2024-02-17T13:00:00Z'
  },
  {
    id: 'post-3',
    communityId: 'comm-3',
    authorId: 'user-5',
    title: 'Celebrating Diwali: Festival of Lights',
    content: 'Happy Diwali to everyone celebrating! I wanted to share some photos from our family celebration and explain the significance of this beautiful festival. Diwali represents the victory of light over darkness and good over evil.',
    type: 'event',
    category: 'Cultural Celebrations',
    tags: ['diwali', 'festival', 'indian-culture', 'celebration'],
    attachments: [
      {
        id: 'att-2',
        name: 'diwali-photos.jpg',
        type: 'image',
        url: '/uploads/diwali-photos.jpg',
        size: 1024000,
        mimeType: 'image/jpeg',
        description: 'Photos from Diwali celebration'
      },
      {
        id: 'att-3',
        name: 'rangoli-designs.jpg',
        type: 'image',
        url: '/uploads/rangoli-designs.jpg',
        size: 768000,
        mimeType: 'image/jpeg',
        description: 'Beautiful rangoli designs'
      }
    ],
    isPinned: false,
    isLocked: false,
    visibility: 'public',
    reactions: [
      {
        userId: 'user-1',
        type: 'love',
        timestamp: '2024-02-16T18:00:00Z'
      },
      {
        userId: 'user-2',
        type: 'like',
        timestamp: '2024-02-16T18:30:00Z'
      },
      {
        userId: 'user-6',
        type: 'love',
        timestamp: '2024-02-16T19:15:00Z'
      }
    ],
    replies: [
      {
        id: 'reply-4',
        postId: 'post-3',
        authorId: 'user-1',
        content: 'Thank you for sharing! The rangoli designs are absolutely beautiful. I\'d love to learn more about the traditions behind them.',
        parentReplyId: undefined,
        attachments: [],
        reactions: [
          {
            userId: 'user-5',
            type: 'like',
            timestamp: '2024-02-16T20:00:00Z'
          }
        ],
        isModerated: false,
        helpfulVotes: 4,
        reportCount: 0,
        createdAt: '2024-02-16T19:45:00Z',
        updatedAt: '2024-02-16T19:45:00Z'
      },
      {
        id: 'reply-5',
        postId: 'post-3',
        authorId: 'user-6',
        content: 'Beautiful celebration! In my family, we have a similar festival called Festival of Lights in our culture. It\'s amazing how many cultures celebrate the triumph of light.',
        parentReplyId: undefined,
        attachments: [],
        reactions: [],
        isModerated: false,
        helpfulVotes: 2,
        reportCount: 0,
        createdAt: '2024-02-16T20:30:00Z',
        updatedAt: '2024-02-16T20:30:00Z'
      }
    ],
    views: 89,
    helpfulVotes: 15,
    isModerated: false,
    reportCount: 0,
    createdAt: '2024-02-16T17:00:00Z',
    updatedAt: '2024-02-16T17:00:00Z'
  },
  {
    id: 'post-4',
    communityId: 'comm-4',
    authorId: 'user-2',
    title: 'Math Tutoring Success Story',
    content: 'Just wanted to share a success story from our tutoring program! One of my tutees improved their algebra grade from C- to B+ over the past month. It\'s so rewarding to see students gain confidence in math.',
    type: 'discussion',
    category: 'Success Stories',
    tags: ['tutoring', 'success', 'mathematics', 'mentorship'],
    attachments: [],
    isPinned: false,
    isLocked: false,
    visibility: 'members',
    reactions: [
      {
        userId: 'user-1',
        type: 'love',
        timestamp: '2024-02-15T16:30:00Z'
      },
      {
        userId: 'user-7',
        type: 'like',
        timestamp: '2024-02-15T17:00:00Z'
      }
    ],
    replies: [
      {
        id: 'reply-6',
        postId: 'post-4',
        authorId: 'user-1',
        content: 'That\'s wonderful! Stories like this remind me why peer tutoring is so valuable. The personal connection makes such a difference.',
        parentReplyId: undefined,
        attachments: [],
        reactions: [],
        isModerated: false,
        helpfulVotes: 1,
        reportCount: 0,
        createdAt: '2024-02-15T17:15:00Z',
        updatedAt: '2024-02-15T17:15:00Z'
      }
    ],
    views: 34,
    helpfulVotes: 6,
    isModerated: false,
    reportCount: 0,
    createdAt: '2024-02-15T16:00:00Z',
    updatedAt: '2024-02-15T16:00:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get('communityId');
    const authorId = searchParams.get('authorId');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const isPinned = searchParams.get('isPinned');

    let filteredPosts = mockPosts;

    // Apply filters
    if (communityId) {
      filteredPosts = filteredPosts.filter(p => p.communityId === communityId);
    }
    if (authorId) {
      filteredPosts = filteredPosts.filter(p => p.authorId === authorId);
    }
    if (type) {
      filteredPosts = filteredPosts.filter(p => p.type === type);
    }
    if (category) {
      filteredPosts = filteredPosts.filter(p => p.category === category);
    }
    if (isPinned !== null) {
      const pinned = isPinned === 'true';
      filteredPosts = filteredPosts.filter(p => p.isPinned === pinned);
    }

    // Sort by creation date (newest first)
    filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(filteredPosts);
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const postData = await request.json();
    
    // In a real implementation, this would save to a database
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      ...postData,
      reactions: [],
      replies: [],
      views: 0,
      helpfulVotes: 0,
      isModerated: false,
      reportCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to mock data (in memory only)
    mockPosts.push(newPost);

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating community post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}