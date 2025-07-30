import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { 
  MentorConversation, 
  MentorMessage, 
  MentorResource, 
  CrisisDetection, 
  MentorAnalytics,
  MentorSettings,
  MentorConversationType,
  CrisisLevel,
  MentorResponseType
} from '@/types';

// Mock data storage - using const for arrays that are modified via methods, not reassigned
const mockConversations: MentorConversation[] = [];
const mockMessages: MentorMessage[] = [];
const mockResources: MentorResource[] = [
  {
    id: '1',
    title: 'Study Tips for Better Focus',
    description: 'Proven techniques to improve concentration and study effectiveness',
    type: 'article',
    url: '/resources/study-tips',
    category: 'academic',
    priority: 'medium',
    isEmergency: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Managing Academic Stress',
    description: 'Strategies for dealing with academic pressure and stress',
    type: 'article',
    url: '/resources/academic-stress',
    category: 'wellness',
    priority: 'high',
    isEmergency: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Crisis Hotline',
    description: '24/7 crisis support hotline for immediate help',
    type: 'contact',
    url: 'tel:988',
    category: 'crisis',
    priority: 'high',
    isEmergency: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Time Management Techniques',
    description: 'Effective methods for managing your time and priorities',
    type: 'video',
    url: '/resources/time-management-video',
    category: 'academic',
    priority: 'medium',
    isEmergency: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Building Social Connections',
    description: 'Tips for making friends and building meaningful relationships',
    type: 'article',
    url: '/resources/social-connections',
    category: 'social',
    priority: 'medium',
    isEmergency: false,
    createdAt: new Date().toISOString(),
  },
];

const mockCrisisDetections: CrisisDetection[] = [];
const mockUserSettings: MentorSettings[] = [];

// Crisis detection keywords and patterns
const crisisKeywords = {
  high: ['suicide', 'kill myself', 'end it all', 'not worth living', 'want to die'],
  medium: ['depressed', 'hopeless', 'can\'t cope', 'overwhelmed', 'panic attack', 'anxiety attack'],
  low: ['stressed', 'worried', 'anxious', 'sad', 'frustrated', 'tired'],
};

// Helper function to detect crisis level
function detectCrisisLevel(message: string): { level: CrisisLevel; indicators: string[]; confidence: number } {
  const lowerMessage = message.toLowerCase();
  const indicators: string[] = [];
  let level: CrisisLevel = 'low';
  let confidence = 0;

  // Check for high-risk indicators
  for (const keyword of crisisKeywords.high) {
    if (lowerMessage.includes(keyword)) {
      indicators.push(keyword);
      level = 'high';
      confidence = Math.max(confidence, 0.9);
    }
  }

  // Check for medium-risk indicators
  if (level !== 'high') {
    for (const keyword of crisisKeywords.medium) {
      if (lowerMessage.includes(keyword)) {
        indicators.push(keyword);
        level = 'medium';
        confidence = Math.max(confidence, 0.6);
      }
    }
  }

  // Check for low-risk indicators
  if (level === 'low') {
    for (const keyword of crisisKeywords.low) {
      if (lowerMessage.includes(keyword)) {
        indicators.push(keyword);
        confidence = Math.max(confidence, 0.3);
      }
    }
  }

  return { level, indicators, confidence };
}

// Helper function to generate AI response
function generateAIResponse(message: string, conversationType: MentorConversationType, crisisLevel?: CrisisLevel): {
  content: string;
  responseType: MentorResponseType;
  suggestedActions?: string[];
  resources?: MentorResource[];
} {
  const lowerMessage = message.toLowerCase();

  // Crisis intervention responses
  if (crisisLevel === 'high') {
    return {
      content: "I'm very concerned about what you're sharing with me. Your safety and wellbeing are the most important things right now. Please know that you're not alone, and there are people who want to help you. I strongly encourage you to reach out to a crisis counselor or trusted adult immediately. Would you like me to provide you with some emergency resources?",
      responseType: 'crisis-intervention',
      suggestedActions: [
        'Contact crisis hotline immediately',
        'Reach out to a trusted adult',
        'Go to nearest emergency room if in immediate danger',
        'Call 911 if in immediate danger'
      ],
      resources: mockResources.filter(r => r.isEmergency),
    };
  }

  if (crisisLevel === 'medium') {
    return {
      content: "I can hear that you're going through a really difficult time right now. It takes courage to share these feelings, and I want you to know that what you're experiencing is valid. While I'm here to support you, I think it would be really helpful for you to talk to a counselor or trusted adult who can provide more personalized support. In the meantime, let's explore some strategies that might help you cope with these feelings.",
      responseType: 'referral',
      suggestedActions: [
        'Schedule appointment with school counselor',
        'Talk to a trusted teacher or adult',
        'Practice stress-reduction techniques',
        'Consider reaching out to friends or family'
      ],
      resources: mockResources.filter(r => r.category === 'wellness' || r.priority === 'high'),
    };
  }

  // Academic support responses
  if (conversationType === 'academic' || lowerMessage.includes('study') || lowerMessage.includes('homework') || lowerMessage.includes('test')) {
    const responses = [
      "I understand that academic challenges can feel overwhelming sometimes. Let's break this down together and find some strategies that can help you succeed.",
      "Academic success is a journey, and it's normal to face obstacles along the way. What specific area would you like to focus on improving?",
      "It sounds like you're dealing with some academic stress. Let's explore some effective study techniques and time management strategies that might help.",
    ];
    
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      responseType: 'advice',
      suggestedActions: [
        'Create a study schedule',
        'Break large tasks into smaller steps',
        'Find a quiet study environment',
        'Take regular breaks while studying'
      ],
      resources: mockResources.filter(r => r.category === 'academic'),
    };
  }

  // Social support responses
  if (conversationType === 'social' || lowerMessage.includes('friend') || lowerMessage.includes('lonely') || lowerMessage.includes('social')) {
    const responses = [
      "Building meaningful connections with others is so important for our wellbeing. It's great that you're thinking about your social relationships.",
      "Social situations can sometimes feel challenging, but remember that many people feel the same way. You're not alone in this experience.",
      "Developing social skills and friendships takes time and practice. Let's talk about some strategies that might help you connect with others.",
    ];
    
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      responseType: 'advice',
      suggestedActions: [
        'Join clubs or activities that interest you',
        'Practice active listening skills',
        'Be open to new experiences and meeting new people',
        'Focus on being a good friend to others'
      ],
      resources: mockResources.filter(r => r.category === 'social'),
    };
  }

  // Career guidance responses
  if (conversationType === 'career' || lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('future')) {
    const responses = [
      "Thinking about your future career is exciting! It's great that you're being proactive about planning your path forward.",
      "Career exploration is a journey of self-discovery. Let's talk about your interests, strengths, and what motivates you.",
      "There are so many possibilities for your future! Let's explore what excites you and how you can work toward your goals.",
    ];
    
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      responseType: 'advice',
      suggestedActions: [
        'Explore your interests and strengths',
        'Research different career paths',
        'Talk to professionals in fields that interest you',
        'Consider internships or volunteer opportunities'
      ],
      resources: mockResources.filter(r => r.category === 'career'),
    };
  }

  // Personal/wellness responses
  if (conversationType === 'personal' || conversationType === 'wellness') {
    const responses = [
      "Personal growth and self-care are so important. I'm glad you're taking time to focus on your wellbeing.",
      "It's wonderful that you're being thoughtful about your personal development. What aspects of your life would you like to work on?",
      "Taking care of yourself emotionally and mentally is just as important as taking care of yourself physically. How can I support you today?",
    ];
    
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      responseType: 'advice',
      suggestedActions: [
        'Practice mindfulness or meditation',
        'Maintain a regular sleep schedule',
        'Engage in physical activity',
        'Connect with supportive friends and family'
      ],
      resources: mockResources.filter(r => r.category === 'wellness'),
    };
  }

  // Default supportive response
  return {
    content: "Thank you for sharing that with me. I'm here to listen and support you. Can you tell me more about what's on your mind or how you're feeling right now?",
    responseType: 'question',
    suggestedActions: [
      'Take some time to reflect on your feelings',
      'Consider what support you might need',
      'Think about what would help you feel better'
    ],
  };
}

// Helper function to get user settings
function getUserSettings(userId: string): MentorSettings {
  let settings = mockUserSettings.find(s => s.userId === userId);
  
  if (!settings) {
    settings = {
      userId,
      isEnabled: true,
      preferredResponseStyle: 'supportive',
      topicsToAvoid: [],
      crisisContactPreferences: {
        enableEmergencyContacts: true,
        emergencyContacts: [],
        enableCounselorReferral: true,
        enableParentNotification: false,
      },
      privacySettings: {
        shareWithParents: false,
        shareWithCounselors: false,
        anonymizeData: true,
      },
      notificationPreferences: {
        enablePushNotifications: true,
        enableEmailSummaries: false,
        quietHours: { start: '22:00', end: '07:00' },
      },
      updatedAt: new Date().toISOString(),
    };
    
    mockUserSettings.push(settings);
  }
  
  return settings;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'user1';
  const action = searchParams.get('action');
  const conversationId = searchParams.get('conversationId');
  
  try {
    switch (action) {
      case 'conversations':
        const userConversations = mockConversations
          .filter(c => c.userId === userId)
          .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        return NextResponse.json({ conversations: userConversations });
        
      case 'messages':
        if (!conversationId) {
          return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
        }
        const messages = mockMessages
          .filter(m => m.conversationId === conversationId)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        return NextResponse.json({ messages });
        
      case 'resources':
        const category = searchParams.get('category') as MentorConversationType;
        let filteredResources = mockResources;
        if (category) {
          filteredResources = mockResources.filter(r => r.category === category);
        }
        return NextResponse.json({ resources: filteredResources });
        
      case 'analytics':
        const analytics: MentorAnalytics = {
          userId,
          totalConversations: mockConversations.filter(c => c.userId === userId).length,
          activeConversations: mockConversations.filter(c => c.userId === userId && c.isActive).length,
          averageResponseTime: 2.5, // Mock data
          mostDiscussedTopics: [
            { topic: 'academic', count: 15 },
            { topic: 'personal', count: 8 },
            { topic: 'social', count: 5 },
          ],
          sentimentTrend: [
            { date: '2024-01-01', sentiment: 0.2 },
            { date: '2024-01-02', sentiment: 0.4 },
            { date: '2024-01-03', sentiment: 0.6 },
          ],
          crisisInterventions: mockCrisisDetections.filter(c => c.userId === userId).length,
          resourcesShared: 12, // Mock data
          userSatisfactionRating: 4.2, // Mock data
          lastInteraction: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return NextResponse.json({ analytics });
        
      case 'settings':
        const settings = getUserSettings(userId);
        return NextResponse.json({ settings });
        
      case 'crisis-detections':
        const crisisDetections = mockCrisisDetections.filter(c => c.userId === userId);
        return NextResponse.json({ crisisDetections });
        
      default:
        return NextResponse.json({ conversations: mockConversations.filter(c => c.userId === userId) });
    }
  } catch (error) {
    console.error('Error in AI mentor API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId = 'user1' } = body;
    
    switch (action) {
      case 'create-conversation':
        const { type, title } = body;
        
        const newConversation: MentorConversation = {
          id: nanoid(),
          userId,
          type: type || 'personal',
          title: title || 'New Conversation',
          isActive: true,
          lastMessageAt: new Date().toISOString(),
          messageCount: 0,
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        mockConversations.push(newConversation);
        
        return NextResponse.json({ conversation: newConversation });
        
      case 'send-message':
        const { conversationId, content, type: conversationType } = body;
        
        const conversation = mockConversations.find(c => c.id === conversationId && c.userId === userId);
        if (!conversation) {
          return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }
        
        // Create user message
        const userMessage: MentorMessage = {
          id: nanoid(),
          conversationId,
          sender: 'user',
          content,
          timestamp: new Date().toISOString(),
          isRead: true,
        };
        
        mockMessages.push(userMessage);
        
        // Detect crisis level
        const crisisDetection = detectCrisisLevel(content);
        
        // Create crisis detection record if needed
        if (crisisDetection.level !== 'low' || crisisDetection.confidence > 0.5) {
          const crisis: CrisisDetection = {
            id: nanoid(),
            userId,
            conversationId,
            messageId: userMessage.id,
            level: crisisDetection.level,
            indicators: crisisDetection.indicators,
            confidence: crisisDetection.confidence,
            recommendedActions: [],
            isResolved: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          mockCrisisDetections.push(crisis);
          
          // Update conversation crisis level
          conversation.crisisLevel = crisisDetection.level;
        }
        
        // Generate AI response
        const aiResponse = generateAIResponse(content, conversationType || conversation.type, crisisDetection.level);
        
        // Create AI message
        const aiMessage: MentorMessage = {
          id: nanoid(),
          conversationId,
          sender: 'mentor',
          content: aiResponse.content,
          responseType: aiResponse.responseType,
          suggestedActions: aiResponse.suggestedActions,
          resources: aiResponse.resources,
          timestamp: new Date(Date.now() + 1000).toISOString(), // Slight delay
          isRead: false,
        };
        
        mockMessages.push(aiMessage);
        
        // Update conversation
        conversation.lastMessageAt = aiMessage.timestamp;
        conversation.messageCount += 2;
        conversation.updatedAt = new Date().toISOString();
        
        return NextResponse.json({ 
          userMessage, 
          aiMessage,
          crisisDetected: crisisDetection.level !== 'low' || crisisDetection.confidence > 0.5
        });
        
      case 'update-settings':
        const { settings } = body;
        const existingSettings = mockUserSettings.find(s => s.userId === userId);
        let userSettings: MentorSettings;
        
        if (existingSettings) {
          const index = mockUserSettings.findIndex(s => s.userId === userId);
          userSettings = { ...existingSettings, ...settings, updatedAt: new Date().toISOString() };
          mockUserSettings[index] = userSettings;
        } else {
          userSettings = { userId, ...settings, updatedAt: new Date().toISOString() };
          mockUserSettings.push(userSettings);
        }
        
        return NextResponse.json({ settings: userSettings });
        
      case 'mark-crisis-resolved':
        const { crisisId, resolvedBy, notes } = body;
        
        const crisisIndex = mockCrisisDetections.findIndex(c => c.id === crisisId && c.userId === userId);
        if (crisisIndex >= 0) {
          mockCrisisDetections[crisisIndex] = {
            ...mockCrisisDetections[crisisIndex],
            isResolved: true,
            resolvedAt: new Date().toISOString(),
            resolvedBy,
            notes,
            updatedAt: new Date().toISOString(),
          };
          
          return NextResponse.json({ success: true });
        } else {
          return NextResponse.json({ error: 'Crisis detection not found' }, { status: 404 });
        }
        
      case 'end-conversation':
        const { conversationId: endConversationId } = body;
        
        const conversationIndex = mockConversations.findIndex(c => c.id === endConversationId && c.userId === userId);
        if (conversationIndex >= 0) {
          mockConversations[conversationIndex].isActive = false;
          mockConversations[conversationIndex].updatedAt = new Date().toISOString();
          
          return NextResponse.json({ success: true });
        } else {
          return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in AI mentor POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const userId = searchParams.get('userId') || 'user1';
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }
    
    // Delete conversation
    const conversationIndex = mockConversations.findIndex(c => c.id === conversationId && c.userId === userId);
    if (conversationIndex >= 0) {
      mockConversations.splice(conversationIndex, 1);
      
      // Delete associated messages
      mockMessages = mockMessages.filter(m => m.conversationId !== conversationId);
      
      // Delete associated crisis detections
      mockCrisisDetections = mockCrisisDetections.filter(c => c.conversationId !== conversationId);
      
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error in AI mentor DELETE API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}