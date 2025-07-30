import { NextRequest, NextResponse } from 'next/server';
import { SafetyEducationContent, ContentDifficulty, SafetyTopicCategory, InteractionType } from '@/types';

// Mock data for safety education content
const mockSafetyContent: SafetyEducationContent[] = [
  {
    id: 'content-1',
    title: 'Digital Privacy Fundamentals',
    description: 'Learn the basics of protecting your personal information online',
    category: 'privacy' as SafetyTopicCategory,
    difficulty: 'elementary' as ContentDifficulty,
    type: 'lesson' as InteractionType,
    duration: 25,
    objectives: [
      'Understand what personal information is',
      'Learn why privacy matters online',
      'Identify common privacy risks',
      'Know how to protect personal data'
    ],
    content: [
      {
        id: 'section-1',
        title: 'What is Personal Information?',
        type: 'text',
        content: 'Personal information includes your name, address, phone number, email, photos, and more. This information can be used to identify you or contact you.',
        order: 1,
        isRequired: true
      },
      {
        id: 'section-2',
        title: 'Privacy in Action',
        type: 'video',
        content: 'Watch this video to see examples of privacy protection in everyday digital life.',
        mediaUrl: '/videos/privacy-basics.mp4',
        order: 2,
        isRequired: true
      },
      {
        id: 'section-3',
        title: 'Privacy Settings Check',
        type: 'interactive',
        content: 'Practice adjusting privacy settings on different platforms.',
        interactiveElements: [
          {
            id: 'privacy-check-1',
            type: 'choice',
            label: 'What should you do with location sharing?',
            action: 'select_option',
            options: ['Always enable', 'Always disable', 'Use selectively', 'Ignore the setting'],
            correctAnswer: 'Use selectively',
            feedback: 'Correct! Location sharing should be used selectively based on the situation and platform.'
          }
        ],
        order: 3,
        isRequired: true
      }
    ],
    assessments: [
      {
        id: 'assessment-1',
        contentId: 'content-1',
        title: 'Privacy Knowledge Check',
        type: 'quiz',
        questions: [
          {
            id: 'q1',
            question: 'Which of the following is considered personal information?',
            type: 'multiple-choice',
            options: ['Your favorite color', 'Your home address', 'Your favorite movie', 'The weather'],
            correctAnswer: 'Your home address',
            explanation: 'Your home address is personal information that can be used to identify and locate you.',
            points: 10,
            difficulty: 'easy',
            category: 'privacy'
          },
          {
            id: 'q2',
            question: 'True or False: It\'s safe to share your password with close friends.',
            type: 'true-false',
            correctAnswer: 'False',
            explanation: 'You should never share your passwords with anyone, even close friends.',
            points: 10,
            difficulty: 'easy',
            category: 'password-security'
          }
        ],
        passingScore: 80,
        maxAttempts: 3,
        timeLimit: 15,
        isRequired: true,
        order: 1
      }
    ],
    resources: [
      {
        id: 'resource-1',
        title: 'Privacy Settings Guide',
        description: 'Step-by-step guide for adjusting privacy settings on popular platforms',
        type: 'checklist',
        category: 'privacy',
        targetAudience: 'student',
        isExternal: false,
        trustScore: 5,
        lastVerified: '2024-01-15T00:00:00Z',
        tags: ['privacy', 'settings', 'social-media'],
        content: 'Detailed checklist for privacy settings...'
      }
    ],
    prerequisites: [],
    tags: ['privacy', 'beginner', 'essential'],
    isActive: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'content-2',
    title: 'Recognizing and Preventing Cyberbullying',
    description: 'Learn to identify cyberbullying and know how to respond appropriately',
    category: 'cyberbullying' as SafetyTopicCategory,
    difficulty: 'middle' as ContentDifficulty,
    type: 'simulation' as InteractionType,
    duration: 30,
    objectives: [
      'Define cyberbullying and its forms',
      'Recognize signs of cyberbullying',
      'Learn appropriate responses to cyberbullying',
      'Understand reporting procedures'
    ],
    content: [
      {
        id: 'section-1',
        title: 'What is Cyberbullying?',
        type: 'text',
        content: 'Cyberbullying is the use of digital technologies to repeatedly harm, harass, or intimidate others.',
        order: 1,
        isRequired: true
      },
      {
        id: 'section-2',
        title: 'Cyberbullying Scenarios',
        type: 'scenario',
        content: 'Work through realistic scenarios to practice identifying and responding to cyberbullying.',
        interactiveElements: [
          {
            id: 'scenario-1',
            type: 'choice',
            label: 'A classmate posts embarrassing photos of you without permission. What should you do?',
            action: 'select_response',
            options: [
              'Ignore it and hope it goes away',
              'Post embarrassing photos of them back',
              'Report it to the platform and tell a trusted adult',
              'Delete your account'
            ],
            correctAnswer: 'Report it to the platform and tell a trusted adult',
            feedback: 'Correct! Reporting and seeking help from trusted adults is the best approach.'
          }
        ],
        order: 2,
        isRequired: true
      }
    ],
    assessments: [
      {
        id: 'assessment-2',
        contentId: 'content-2',
        title: 'Cyberbullying Response Assessment',
        type: 'scenario',
        questions: [
          {
            id: 'q1',
            question: 'Describe how you would handle a situation where someone is spreading rumors about you online.',
            type: 'short-answer',
            correctAnswer: 'Report to platform, document evidence, tell trusted adult, don\'t retaliate',
            explanation: 'The best approach includes reporting, documentation, seeking help, and avoiding retaliation.',
            points: 20,
            difficulty: 'medium',
            category: 'cyberbullying'
          }
        ],
        passingScore: 75,
        maxAttempts: 2,
        isRequired: true,
        order: 1
      }
    ],
    resources: [
      {
        id: 'resource-2',
        title: 'Cyberbullying Reporting Guide',
        description: 'How to report cyberbullying on different platforms',
        type: 'article',
        category: 'cyberbullying',
        targetAudience: 'student',
        isExternal: false,
        trustScore: 5,
        lastVerified: '2024-01-10T00:00:00Z',
        tags: ['cyberbullying', 'reporting', 'help']
      }
    ],
    prerequisites: ['content-1'],
    tags: ['cyberbullying', 'prevention', 'response'],
    isActive: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  {
    id: 'content-3',
    title: 'Understanding Your Digital Footprint',
    description: 'Learn about digital footprints and how to manage your online presence',
    category: 'digital-footprint' as SafetyTopicCategory,
    difficulty: 'middle' as ContentDifficulty,
    type: 'activity' as InteractionType,
    duration: 35,
    objectives: [
      'Understand what a digital footprint is',
      'Learn about active vs passive digital footprints',
      'Discover how to audit your digital presence',
      'Practice digital footprint management'
    ],
    content: [
      {
        id: 'section-1',
        title: 'Your Digital Trail',
        type: 'text',
        content: 'Every time you go online, you leave traces of your activity. This is your digital footprint.',
        order: 1,
        isRequired: true
      },
      {
        id: 'section-2',
        title: 'Digital Footprint Audit',
        type: 'interactive',
        content: 'Use these tools to search for your own digital footprint.',
        interactiveElements: [
          {
            id: 'audit-tool',
            type: 'input',
            label: 'Search for your name online',
            action: 'search_simulation',
            feedback: 'This simulation shows what others might find when they search for you.'
          }
        ],
        order: 2,
        isRequired: true
      }
    ],
    assessments: [
      {
        id: 'assessment-3',
        contentId: 'content-3',
        title: 'Digital Footprint Management',
        type: 'practical',
        questions: [
          {
            id: 'q1',
            question: 'List three steps you can take to improve your digital footprint.',
            type: 'short-answer',
            correctAnswer: 'Review privacy settings, remove inappropriate content, create positive content',
            explanation: 'Managing your digital footprint involves both removing negative content and creating positive content.',
            points: 15,
            difficulty: 'medium',
            category: 'digital-footprint'
          }
        ],
        passingScore: 70,
        maxAttempts: 3,
        isRequired: true,
        order: 1
      }
    ],
    resources: [
      {
        id: 'resource-3',
        title: 'Digital Footprint Checklist',
        description: 'A comprehensive checklist for managing your digital presence',
        type: 'checklist',
        category: 'digital-footprint',
        targetAudience: 'student',
        isExternal: false,
        trustScore: 5,
        lastVerified: '2024-01-12T00:00:00Z',
        tags: ['digital-footprint', 'management', 'checklist']
      }
    ],
    prerequisites: ['content-1'],
    tags: ['digital-footprint', 'online-presence', 'management'],
    isActive: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z'
  },
  {
    id: 'content-4',
    title: 'Password Security and Two-Factor Authentication',
    description: 'Master the fundamentals of password security and account protection',
    category: 'password-security' as SafetyTopicCategory,
    difficulty: 'middle' as ContentDifficulty,
    type: 'lesson' as InteractionType,
    duration: 20,
    objectives: [
      'Create strong, unique passwords',
      'Understand password managers',
      'Set up two-factor authentication',
      'Recognize password-related scams'
    ],
    content: [
      {
        id: 'section-1',
        title: 'Strong Password Basics',
        type: 'text',
        content: 'A strong password is your first line of defense against hackers.',
        order: 1,
        isRequired: true
      },
      {
        id: 'section-2',
        title: 'Password Strength Tester',
        type: 'interactive',
        content: 'Test different passwords to see their strength.',
        interactiveElements: [
          {
            id: 'password-tester',
            type: 'input',
            label: 'Enter a password to test its strength',
            action: 'test_password_strength',
            feedback: 'This tool shows how secure different password patterns are.'
          }
        ],
        order: 2,
        isRequired: true
      }
    ],
    assessments: [
      {
        id: 'assessment-4',
        contentId: 'content-4',
        title: 'Password Security Quiz',
        type: 'quiz',
        questions: [
          {
            id: 'q1',
            question: 'Which password is stronger?',
            type: 'multiple-choice',
            options: ['password123', 'P@ssw0rd!', 'MyDog$Name2024!', '12345678'],
            correctAnswer: 'MyDog$Name2024!',
            explanation: 'Longer passwords with a mix of characters, numbers, and symbols are stronger.',
            points: 10,
            difficulty: 'easy',
            category: 'password-security'
          }
        ],
        passingScore: 80,
        maxAttempts: 3,
        isRequired: true,
        order: 1
      }
    ],
    resources: [
      {
        id: 'resource-4',
        title: 'Password Manager Setup Guide',
        description: 'How to set up and use a password manager',
        type: 'tool',
        category: 'password-security',
        targetAudience: 'all',
        isExternal: false,
        trustScore: 5,
        lastVerified: '2024-01-14T00:00:00Z',
        tags: ['password', 'security', 'tools']
      }
    ],
    prerequisites: [],
    tags: ['password', 'security', 'authentication'],
    isActive: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-14T00:00:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'student';
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    
    let filteredContent = mockSafetyContent.filter(content => content.isActive);
    
    // Filter by category if specified
    if (category) {
      filteredContent = filteredContent.filter(content => 
        content.category === category
      );
    }
    
    // Filter by difficulty if specified
    if (difficulty) {
      filteredContent = filteredContent.filter(content => 
        content.difficulty === difficulty
      );
    }
    
    // Sort by difficulty and then by creation date
    filteredContent.sort((a, b) => {
      const difficultyOrder = { 'elementary': 1, 'middle': 2, 'high': 3, 'adult': 4 };
      const diffA = difficultyOrder[a.difficulty];
      const diffB = difficultyOrder[b.difficulty];
      
      if (diffA !== diffB) {
        return diffA - diffB;
      }
      
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    
    return NextResponse.json(filteredContent);
  } catch (error) {
    console.error('Error fetching safety education content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch safety education content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentData = await request.json();
    
    // In a real application, this would save to a database
    const newContent: SafetyEducationContent = {
      id: `content-${Date.now()}`,
      ...contentData,
      isActive: true,
      createdBy: 'user', // This would come from authentication
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockSafetyContent.push(newContent);
    
    return NextResponse.json(newContent, { status: 201 });
  } catch (error) {
    console.error('Error creating safety education content:', error);
    return NextResponse.json(
      { error: 'Failed to create safety education content' },
      { status: 500 }
    );
  }
}