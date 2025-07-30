import { NextRequest, NextResponse } from 'next/server';
import { CulturalExchangeTool } from '@/types';

// Mock data for cultural exchange tools
const mockCulturalTools: CulturalExchangeTool[] = [
  {
    id: 'tool-1',
    name: 'Cultural Traditions Presentation Template',
    description: 'A structured template to help students present their cultural traditions and customs to international peers.',
    type: 'presentation-template',
    category: 'traditions',
    targetAgeGroup: {
      min: 8,
      max: 16
    },
    duration: 45,
    materials: [
      'Presentation template (PowerPoint/Google Slides)',
      'Cultural artifact examples',
      'Photo collection guidelines',
      'Presentation rubric'
    ],
    instructions: [
      'Download and customize the presentation template',
      'Gather photos and artifacts representing your culture',
      'Research the history and significance of chosen traditions',
      'Practice presentation with cultural sensitivity guidelines',
      'Prepare for Q&A session with international audience'
    ],
    learningObjectives: [
      'Develop cultural awareness and pride',
      'Practice public speaking and presentation skills',
      'Learn to explain cultural concepts to diverse audiences',
      'Build confidence in sharing personal heritage'
    ],
    culturalSensitivity: {
      guidelines: [
        'Respect all cultural practices as valid and meaningful',
        'Avoid stereotypes and generalizations',
        'Encourage questions while maintaining respectful dialogue',
        'Acknowledge diversity within cultures'
      ],
      warnings: [
        'Be mindful of sacred or private cultural elements',
        'Avoid comparing cultures in terms of "better" or "worse"',
        'Consider religious sensitivities when discussing traditions'
      ],
      alternatives: [
        'Focus on personal family traditions if broader cultural topics are sensitive',
        'Use historical context to explain cultural practices',
        'Invite guest speakers from the community when appropriate'
      ]
    },
    languages: ['English', 'Spanish', 'French', 'Japanese'],
    isActive: true,
    usageCount: 247,
    rating: 4.6,
    reviews: [
      {
        id: 'review-1',
        toolId: 'tool-1',
        reviewerId: 'teacher-1',
        rating: 5,
        comments: 'Excellent template that helped my students organize their thoughts and present confidently.',
        pros: ['Well-structured', 'Age-appropriate', 'Culturally sensitive'],
        cons: ['Could use more visual examples'],
        ageGroupUsed: { min: 10, max: 11 },
        contextUsed: 'Elementary cultural exchange with Japan',
        wouldRecommend: true,
        createdAt: '2024-01-15T00:00:00Z'
      }
    ],
    createdBy: 'admin-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'tool-2',
    name: 'Global Food Culture Explorer',
    description: 'An interactive activity framework for exploring food cultures around the world through virtual cooking and sharing.',
    type: 'activity-framework',
    category: 'food',
    targetAgeGroup: {
      min: 6,
      max: 14
    },
    duration: 90,
    materials: [
      'Recipe collection template',
      'Virtual cooking session guide',
      'Food culture research worksheet',
      'Tasting notes template',
      'Cultural significance discussion prompts'
    ],
    instructions: [
      'Students research a traditional dish from their culture',
      'Complete the recipe collection template with ingredients and steps',
      'Prepare ingredients for virtual cooking demonstration',
      'Join virtual cooking session with international partners',
      'Share cultural significance and family stories about the dish',
      'Taste and discuss different foods (if possible to prepare)'
    ],
    learningObjectives: [
      'Explore cultural diversity through food traditions',
      'Develop research and documentation skills',
      'Practice following instructions and procedures',
      'Build appreciation for different cuisines and cultures',
      'Strengthen family and cultural connections'
    ],
    culturalSensitivity: {
      guidelines: [
        'Respect dietary restrictions and religious food laws',
        'Acknowledge that food access varies globally',
        'Celebrate all food traditions as valuable',
        'Be mindful of economic differences in food availability'
      ],
      warnings: [
        'Avoid making assumptions about "exotic" or "strange" foods',
        'Be sensitive to students who may not have access to traditional ingredients',
        'Consider allergies and dietary restrictions'
      ],
      alternatives: [
        'Use photos and videos if cooking is not possible',
        'Focus on food stories and cultural significance',
        'Adapt recipes for available ingredients'
      ]
    },
    languages: ['English', 'Spanish', 'Mandarin', 'Arabic'],
    isActive: true,
    usageCount: 189,
    rating: 4.8,
    reviews: [
      {
        id: 'review-2',
        toolId: 'tool-2',
        reviewerId: 'teacher-2',
        rating: 5,
        comments: 'My students absolutely loved this activity! Great way to connect cultures through food.',
        pros: ['Highly engaging', 'Practical application', 'Family involvement'],
        cons: ['Requires advance preparation', 'Some ingredients hard to find'],
        ageGroupUsed: { min: 12, max: 13 },
        contextUsed: 'Middle school international exchange program',
        wouldRecommend: true,
        createdAt: '2024-01-18T00:00:00Z'
      }
    ],
    createdBy: 'teacher-5',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z'
  },
  {
    id: 'tool-3',
    name: 'Virtual School Day Comparison',
    description: 'A structured framework for students to compare and contrast their daily school experiences with international peers.',
    type: 'discussion-guide',
    category: 'education',
    targetAgeGroup: {
      min: 10,
      max: 18
    },
    duration: 60,
    materials: [
      'School day timeline template',
      'Comparison chart worksheet',
      'Discussion question cards',
      'Photo sharing guidelines',
      'Reflection journal prompts'
    ],
    instructions: [
      'Students create a timeline of their typical school day',
      'Take photos of their school environment (with permission)',
      'Complete the comparison chart with school subjects, schedule, and activities',
      'Join virtual discussion session with international classroom',
      'Share timelines and discuss similarities and differences',
      'Complete reflection journal about learning from the exchange'
    ],
    learningObjectives: [
      'Understand different educational systems and approaches',
      'Develop comparative thinking skills',
      'Appreciate diversity in learning environments',
      'Build global awareness of educational opportunities',
      'Practice structured discussion and listening skills'
    ],
    culturalSensitivity: {
      guidelines: [
        'Respect different educational philosophies and methods',
        'Acknowledge that educational resources vary globally',
        'Avoid judging systems as "better" or "worse"',
        'Celebrate unique aspects of each educational approach'
      ],
      warnings: [
        'Be sensitive to differences in educational resources and opportunities',
        'Avoid assumptions about academic pressure or expectations',
        'Consider privacy when sharing school information'
      ],
      alternatives: [
        'Focus on positive aspects of each system',
        'Discuss learning goals rather than comparing grades',
        'Emphasize personal growth and interests'
      ]
    },
    languages: ['English', 'French', 'German', 'Portuguese'],
    isActive: true,
    usageCount: 156,
    rating: 4.4,
    reviews: [
      {
        id: 'review-3',
        toolId: 'tool-3',
        reviewerId: 'teacher-3',
        rating: 4,
        comments: 'Good framework for structured comparison. Students were surprised by the differences!',
        pros: ['Eye-opening for students', 'Well-structured', 'Promotes critical thinking'],
        cons: ['Could be more interactive', 'Some questions too complex for younger students'],
        ageGroupUsed: { min: 14, max: 15 },
        contextUsed: 'High school global studies class',
        wouldRecommend: true,
        createdAt: '2024-01-12T00:00:00Z'
      }
    ],
    createdBy: 'teacher-7',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z'
  },
  {
    id: 'tool-4',
    name: 'Holiday Celebration Showcase',
    description: 'An interactive presentation framework for sharing holiday traditions and celebrations across cultures.',
    type: 'presentation-template',
    category: 'holidays',
    targetAgeGroup: {
      min: 5,
      max: 16
    },
    duration: 75,
    materials: [
      'Holiday presentation template',
      'Cultural artifact display guide',
      'Traditional music playlist suggestions',
      'Holiday timeline worksheet',
      'Celebration comparison chart'
    ],
    instructions: [
      'Choose a significant holiday or celebration from your culture',
      'Research the history and traditions associated with the holiday',
      'Gather photos, artifacts, or decorations related to the celebration',
      'Prepare traditional music or songs (if appropriate)',
      'Create presentation using the provided template',
      'Share with international classroom and participate in Q&A'
    ],
    learningObjectives: [
      'Learn about diverse holiday traditions worldwide',
      'Understand the cultural and historical significance of celebrations',
      'Develop research and presentation skills',
      'Build appreciation for cultural diversity',
      'Practice respectful cross-cultural communication'
    ],
    culturalSensitivity: {
      guidelines: [
        'Respect religious and spiritual aspects of holidays',
        'Acknowledge that not all families celebrate the same holidays',
        'Be inclusive of secular and religious celebrations',
        'Encourage sharing of personal family traditions'
      ],
      warnings: [
        'Be mindful of commercialization vs. traditional meanings',
        'Avoid assumptions about how holidays "should" be celebrated',
        'Consider students who may not celebrate certain holidays'
      ],
      alternatives: [
        'Include family traditions alongside cultural holidays',
        'Focus on values and meanings rather than specific practices',
        'Allow students to share about seasonal celebrations'
      ]
    },
    languages: ['English', 'Spanish', 'Italian', 'Hindi'],
    isActive: true,
    usageCount: 203,
    rating: 4.7,
    reviews: [
      {
        id: 'review-4',
        toolId: 'tool-4',
        reviewerId: 'teacher-4',
        rating: 5,
        comments: 'Beautiful way to share cultural celebrations. Students were so engaged and respectful.',
        pros: ['Culturally inclusive', 'Engaging format', 'Great for building empathy'],
        cons: ['Needs more guidance for sensitive topics'],
        ageGroupUsed: { min: 8, max: 10 },
        contextUsed: 'Elementary international pen pal program',
        wouldRecommend: true,
        createdAt: '2024-01-20T00:00:00Z'
      }
    ],
    createdBy: 'teacher-8',
    createdAt: '2024-01-07T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'tool-5',
    name: 'Geography and Climate Explorer',
    description: 'A collaborative research framework for comparing geographical features and climate patterns between different regions.',
    type: 'activity-framework',
    category: 'geography',
    targetAgeGroup: {
      min: 9,
      max: 17
    },
    duration: 120,
    materials: [
      'Geographic data collection sheets',
      'Climate comparison charts',
      'Map annotation tools',
      'Weather tracking templates',
      'Environmental impact discussion guides'
    ],
    instructions: [
      'Research geographical features of your local area',
      'Collect climate data for your region',
      'Create annotated maps showing key geographical features',
      'Track weather patterns over a specified period',
      'Compare findings with international partner classroom',
      'Discuss environmental challenges and solutions for each region'
    ],
    learningObjectives: [
      'Understand geographical diversity across the globe',
      'Develop data collection and analysis skills',
      'Learn about climate patterns and environmental factors',
      'Practice collaborative research methods',
      'Build awareness of environmental challenges'
    ],
    culturalSensitivity: {
      guidelines: [
        'Respect different relationships with land and environment',
        'Acknowledge indigenous knowledge and perspectives',
        'Be sensitive to environmental challenges and climate impacts',
        'Avoid assumptions about development or environmental practices'
      ],
      warnings: [
        'Be mindful of climate change impacts on different communities',
        'Avoid judging environmental practices without context',
        'Consider economic factors in environmental decisions'
      ],
      alternatives: [
        'Focus on positive environmental initiatives',
        'Include traditional ecological knowledge',
        'Emphasize collaborative solutions'
      ]
    },
    languages: ['English', 'Portuguese', 'Russian', 'Swahili'],
    isActive: true,
    usageCount: 134,
    rating: 4.3,
    reviews: [
      {
        id: 'review-5',
        toolId: 'tool-5',
        reviewerId: 'teacher-6',
        rating: 4,
        comments: 'Great for STEM integration. Students learned so much about global geography.',
        pros: ['Interdisciplinary approach', 'Data-driven learning', 'Environmental awareness'],
        cons: ['Complex for younger students', 'Requires significant preparation'],
        ageGroupUsed: { min: 13, max: 15 },
        contextUsed: 'Middle school science and geography collaboration',
        wouldRecommend: true,
        createdAt: '2024-01-14T00:00:00Z'
      }
    ],
    createdBy: 'teacher-9',
    createdAt: '2024-01-09T00:00:00Z',
    updatedAt: '2024-01-14T00:00:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const minAge = searchParams.get('minAge');
    const maxAge = searchParams.get('maxAge');
    const language = searchParams.get('language');
    
    let filteredTools = mockCulturalTools.filter(tool => tool.isActive);
    
    // Filter by category if specified
    if (category) {
      filteredTools = filteredTools.filter(tool => 
        tool.category === category
      );
    }
    
    // Filter by type if specified
    if (type) {
      filteredTools = filteredTools.filter(tool => 
        tool.type === type
      );
    }
    
    // Filter by age range if specified
    if (minAge || maxAge) {
      const minAgeNum = minAge ? parseInt(minAge) : 0;
      const maxAgeNum = maxAge ? parseInt(maxAge) : 100;
      
      filteredTools = filteredTools.filter(tool => 
        tool.targetAgeGroup.min <= maxAgeNum && tool.targetAgeGroup.max >= minAgeNum
      );
    }
    
    // Filter by language if specified
    if (language) {
      filteredTools = filteredTools.filter(tool => 
        tool.languages.includes(language)
      );
    }
    
    // Sort by rating (highest first) and then by usage count
    filteredTools.sort((a, b) => {
      if (a.rating !== b.rating) {
        return b.rating - a.rating;
      }
      return b.usageCount - a.usageCount;
    });
    
    return NextResponse.json(filteredTools);
  } catch (error) {
    console.error('Error fetching cultural exchange tools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cultural exchange tools' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const toolData = await request.json();
    
    // In a real application, this would save to a database
    const newTool: CulturalExchangeTool = {
      id: `tool-${Date.now()}`,
      ...toolData,
      isActive: true,
      usageCount: 0,
      rating: 0,
      reviews: [],
      createdBy: 'user', // This would come from authentication
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockCulturalTools.push(newTool);
    
    return NextResponse.json(newTool, { status: 201 });
  } catch (error) {
    console.error('Error creating cultural exchange tool:', error);
    return NextResponse.json(
      { error: 'Failed to create cultural exchange tool' },
      { status: 500 }
    );
  }
}