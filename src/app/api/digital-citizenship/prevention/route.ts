import { NextRequest, NextResponse } from 'next/server';
import { CyberbullyingPrevention } from '@/types';

// Mock data for cyberbullying prevention programs
const mockPreventionPrograms: CyberbullyingPrevention[] = [
  {
    id: 'prevention-1',
    title: 'Digital Respect Initiative',
    description: 'A comprehensive program focused on building empathy and respect in digital spaces',
    type: 'awareness',
    targetAudience: 'student',
    activities: [
      {
        id: 'activity-1',
        title: 'Empathy in Digital Communication',
        description: 'Learn to communicate with empathy online',
        type: 'workshop',
        duration: 45,
        materials: ['presentation slides', 'scenario cards', 'reflection worksheets'],
        facilitatorGuide: 'Guide participants through empathy-building exercises using real-world scenarios.',
        participantGuide: 'Reflect on your own digital communication style and practice empathetic responses.',
        assessmentCriteria: [
          'Demonstrates understanding of empathy in digital contexts',
          'Can identify non-empathetic communication',
          'Shows improvement in communication style'
        ],
        learningOutcomes: [
          'Understand the impact of words in digital spaces',
          'Develop empathetic communication skills',
          'Practice respectful online interaction'
        ]
      },
      {
        id: 'activity-2',
        title: 'Bystander Intervention Online',
        description: 'Learn how to safely intervene when witnessing cyberbullying',
        type: 'simulation',
        duration: 30,
        materials: ['simulation platform', 'scenario scripts', 'debrief questions'],
        facilitatorGuide: 'Guide students through various cyberbullying scenarios and intervention strategies.',
        participantGuide: 'Practice different ways to help others who are experiencing cyberbullying.',
        assessmentCriteria: [
          'Identifies appropriate intervention strategies',
          'Demonstrates safe intervention techniques',
          'Shows understanding of when to seek adult help'
        ],
        learningOutcomes: [
          'Recognize cyberbullying situations',
          'Learn safe intervention strategies',
          'Understand the importance of seeking help'
        ]
      },
      {
        id: 'activity-3',
        title: 'Creating Positive Digital Spaces',
        description: 'Explore ways to foster positive online communities',
        type: 'discussion',
        duration: 25,
        materials: ['discussion prompts', 'community guidelines template'],
        facilitatorGuide: 'Facilitate discussion about positive online community building.',
        participantGuide: 'Share ideas for creating welcoming and inclusive digital spaces.',
        assessmentCriteria: [
          'Contributes meaningful ideas to discussion',
          'Shows understanding of positive community principles',
          'Demonstrates commitment to positive behavior'
        ],
        learningOutcomes: [
          'Understand elements of positive online communities',
          'Learn to contribute positively to digital spaces',
          'Develop leadership skills in online contexts'
        ]
      }
    ],
    resources: ['resource-1', 'resource-2'],
    effectiveness: 4.2,
    implementationDate: '2024-01-15T00:00:00Z',
    isActive: true,
    createdBy: 'admin-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'prevention-2',
    title: 'Parent Digital Safety Workshop',
    description: 'Educate parents on recognizing and addressing cyberbullying',
    type: 'community',
    targetAudience: 'parent',
    activities: [
      {
        id: 'activity-4',
        title: 'Recognizing Warning Signs',
        description: 'Learn to identify signs that your child may be experiencing cyberbullying',
        type: 'presentation',
        duration: 20,
        materials: ['presentation slides', 'warning signs checklist', 'resource handouts'],
        facilitatorGuide: 'Present information about cyberbullying warning signs and encourage questions.',
        participantGuide: 'Learn to recognize behavioral and emotional changes that may indicate cyberbullying.',
        assessmentCriteria: [
          'Can identify warning signs of cyberbullying',
          'Understands when to be concerned',
          'Knows appropriate next steps'
        ],
        learningOutcomes: [
          'Recognize signs of cyberbullying in children',
          'Understand the emotional impact of cyberbullying',
          'Know when and how to intervene'
        ]
      },
      {
        id: 'activity-5',
        title: 'Supporting Your Child',
        description: 'Learn effective ways to support a child experiencing cyberbullying',
        type: 'workshop',
        duration: 35,
        materials: ['support strategies guide', 'communication scripts', 'role-play scenarios'],
        facilitatorGuide: 'Guide parents through supportive communication techniques and response strategies.',
        participantGuide: 'Practice supportive responses and learn effective communication strategies.',
        assessmentCriteria: [
          'Demonstrates supportive communication techniques',
          'Shows understanding of appropriate responses',
          'Can create a supportive home environment'
        ],
        learningOutcomes: [
          'Learn supportive communication techniques',
          'Understand how to respond to cyberbullying incidents',
          'Create a safe space for children to share concerns'
        ]
      }
    ],
    resources: ['resource-3', 'resource-4'],
    effectiveness: 4.5,
    implementationDate: '2024-01-20T00:00:00Z',
    isActive: true,
    createdBy: 'admin-1',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'prevention-3',
    title: 'Teacher Cyberbullying Response Training',
    description: 'Professional development for educators on handling cyberbullying incidents',
    type: 'skill-building',
    targetAudience: 'teacher',
    activities: [
      {
        id: 'activity-6',
        title: 'Incident Documentation and Response',
        description: 'Learn proper procedures for documenting and responding to cyberbullying reports',
        type: 'workshop',
        duration: 60,
        materials: ['incident report forms', 'response flowchart', 'legal guidelines'],
        facilitatorGuide: 'Train teachers on proper documentation and response procedures.',
        participantGuide: 'Learn to properly document incidents and follow appropriate response protocols.',
        assessmentCriteria: [
          'Can properly document cyberbullying incidents',
          'Follows appropriate response procedures',
          'Understands legal and ethical considerations'
        ],
        learningOutcomes: [
          'Master incident documentation procedures',
          'Understand appropriate response protocols',
          'Know legal and ethical requirements'
        ]
      },
      {
        id: 'activity-7',
        title: 'Supporting Affected Students',
        description: 'Strategies for supporting both victims and perpetrators of cyberbullying',
        type: 'peer-support',
        duration: 45,
        materials: ['support strategies guide', 'counseling resources', 'intervention techniques'],
        facilitatorGuide: 'Share evidence-based strategies for supporting students involved in cyberbullying.',
        participantGuide: 'Learn to provide appropriate support to all students involved in cyberbullying incidents.',
        assessmentCriteria: [
          'Demonstrates understanding of trauma-informed support',
          'Can provide appropriate interventions',
          'Shows knowledge of when to refer to specialists'
        ],
        learningOutcomes: [
          'Learn trauma-informed support strategies',
          'Understand restorative justice approaches',
          'Know when to involve mental health professionals'
        ]
      }
    ],
    resources: ['resource-5', 'resource-6'],
    effectiveness: 4.7,
    implementationDate: '2024-01-10T00:00:00Z',
    isActive: true,
    createdBy: 'admin-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  {
    id: 'prevention-4',
    title: 'Peer Mediation Program',
    description: 'Train students to help resolve conflicts and prevent cyberbullying',
    type: 'peer-support',
    targetAudience: 'student',
    activities: [
      {
        id: 'activity-8',
        title: 'Conflict Resolution Skills',
        description: 'Learn mediation and conflict resolution techniques',
        type: 'workshop',
        duration: 90,
        materials: ['mediation handbook', 'role-play scenarios', 'communication guides'],
        facilitatorGuide: 'Train student mediators in conflict resolution and communication skills.',
        participantGuide: 'Develop skills to help peers resolve conflicts peacefully.',
        assessmentCriteria: [
          'Demonstrates effective mediation skills',
          'Shows understanding of conflict resolution principles',
          'Can facilitate productive conversations'
        ],
        learningOutcomes: [
          'Master mediation techniques',
          'Develop active listening skills',
          'Learn to facilitate difficult conversations'
        ]
      },
      {
        id: 'activity-9',
        title: 'Digital Citizenship Leadership',
        description: 'Become a leader in promoting positive digital behavior',
        type: 'role-play',
        duration: 60,
        materials: ['leadership scenarios', 'presentation templates', 'peer education guides'],
        facilitatorGuide: 'Develop student leaders who can promote positive digital citizenship.',
        participantGuide: 'Learn to lead by example and educate peers about digital citizenship.',
        assessmentCriteria: [
          'Shows leadership in digital citizenship',
          'Can educate peers effectively',
          'Demonstrates positive digital behavior'
        ],
        learningOutcomes: [
          'Develop leadership skills',
          'Learn peer education techniques',
          'Become a digital citizenship role model'
        ]
      }
    ],
    resources: ['resource-7', 'resource-8'],
    effectiveness: 4.3,
    implementationDate: '2024-01-25T00:00:00Z',
    isActive: true,
    createdBy: 'admin-1',
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const audience = searchParams.get('audience') || 'all';
    const type = searchParams.get('type');
    
    let filteredPrograms = mockPreventionPrograms.filter(program => program.isActive);
    
    // Filter by target audience if specified
    if (audience !== 'all') {
      filteredPrograms = filteredPrograms.filter(program => 
        program.targetAudience === audience
      );
    }
    
    // Filter by type if specified
    if (type) {
      filteredPrograms = filteredPrograms.filter(program => 
        program.type === type
      );
    }
    
    // Sort by effectiveness (highest first) and then by implementation date
    filteredPrograms.sort((a, b) => {
      if (a.effectiveness !== b.effectiveness) {
        return b.effectiveness - a.effectiveness;
      }
      return new Date(b.implementationDate).getTime() - new Date(a.implementationDate).getTime();
    });
    
    return NextResponse.json(filteredPrograms);
  } catch (error) {
    console.error('Error fetching prevention programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prevention programs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const programData = await request.json();
    
    // In a real application, this would save to a database
    const newProgram: CyberbullyingPrevention = {
      id: `prevention-${Date.now()}`,
      ...programData,
      effectiveness: 0, // Will be updated based on feedback
      isActive: true,
      createdBy: 'user', // This would come from authentication
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockPreventionPrograms.push(newProgram);
    
    return NextResponse.json(newProgram, { status: 201 });
  } catch (error) {
    console.error('Error creating prevention program:', error);
    return NextResponse.json(
      { error: 'Failed to create prevention program' },
      { status: 500 }
    );
  }
}