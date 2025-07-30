import { NextRequest, NextResponse } from 'next/server';
import { GlobalLearningExperience, LearningActivity, LearningResource } from '@/types';

// Mock data for global learning experiences
const mockExperiences: GlobalLearningExperience[] = [
  {
    id: 'exp-1',
    title: 'Japanese Cultural Exchange Program',
    description: 'Immerse yourself in Japanese culture through virtual tea ceremonies, calligraphy workshops, and conversations with Japanese students.',
    type: 'cultural-exchange',
    culturalRegion: 'asia',
    languages: ['English', 'Japanese'],
    subjects: ['Social Studies', 'Arts', 'Language'],
    ageRange: { min: 14, max: 18 },
    maxParticipants: 30,
    currentParticipants: 18,
    status: 'active',
    startDate: '2024-02-15T09:00:00Z',
    endDate: '2024-03-15T17:00:00Z',
    duration: 40,
    timeZone: 'Asia/Tokyo',
    hostSchool: {
      id: 'school-jp-1',
      name: 'Tokyo International High School',
      country: 'Japan',
      city: 'Tokyo',
      contactEmail: 'international@tihs.jp'
    },
    requirements: [
      'Basic English proficiency',
      'Interest in Japanese culture',
      'Commitment to full program duration'
    ],
    learningObjectives: [
      'Understand Japanese cultural traditions and values',
      'Develop cross-cultural communication skills',
      'Learn basic Japanese language phrases',
      'Create cultural comparison presentations'
    ],
    activities: [
      {
        id: 'act-1',
        title: 'Virtual Tea Ceremony',
        description: 'Learn the art of Japanese tea ceremony with a master practitioner',
        type: 'workshop',
        duration: 90,
        scheduledTime: '2024-02-20T10:00:00Z',
        facilitator: 'Master Tanaka',
        materials: ['Tea set (provided)', 'Notebook'],
        instructions: ['Join virtual session', 'Follow along with movements', 'Ask questions'],
        isRequired: true,
        order: 1
      },
      {
        id: 'act-2',
        title: 'Student Exchange Discussion',
        description: 'Video call with Japanese students to discuss daily life and culture',
        type: 'discussion',
        duration: 60,
        scheduledTime: '2024-02-25T08:00:00Z',
        isRequired: true,
        order: 2
      }
    ],
    resources: [
      {
        id: 'res-1',
        title: 'Introduction to Japanese Culture',
        description: 'Comprehensive guide to Japanese traditions and customs',
        type: 'document',
        url: '/resources/japanese-culture-guide.pdf',
        language: 'English',
        isRequired: true,
        estimatedTime: 30,
        tags: ['culture', 'traditions', 'customs']
      },
      {
        id: 'res-2',
        title: 'Basic Japanese Phrases',
        description: 'Audio guide for essential Japanese phrases',
        type: 'audio',
        url: '/resources/japanese-phrases.mp3',
        language: 'Japanese',
        isRequired: false,
        estimatedTime: 20,
        tags: ['language', 'phrases', 'pronunciation']
      }
    ],
    tags: ['culture', 'asia', 'language', 'traditions'],
    isPublic: true,
    applicationDeadline: '2024-02-10T23:59:59Z',
    certificateOffered: true,
    createdBy: 'teacher-1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-01T15:30:00Z'
  },
  {
    id: 'exp-2',
    title: 'Global Climate Action Project',
    description: 'Collaborate with students worldwide to research and propose solutions for climate change in different regions.',
    type: 'global-project',
    culturalRegion: 'north-america',
    languages: ['English', 'Spanish', 'French'],
    subjects: ['Science', 'Environmental Studies', 'Geography'],
    ageRange: { min: 15, max: 19 },
    maxParticipants: 50,
    currentParticipants: 35,
    status: 'upcoming',
    startDate: '2024-03-01T14:00:00Z',
    endDate: '2024-05-01T18:00:00Z',
    duration: 80,
    timeZone: 'America/New_York',
    hostSchool: {
      id: 'school-us-1',
      name: 'Green Valley International School',
      country: 'United States',
      city: 'San Francisco',
      contactEmail: 'projects@gvis.edu'
    },
    requirements: [
      'Strong interest in environmental issues',
      'Research and presentation skills',
      'Ability to work in international teams'
    ],
    learningObjectives: [
      'Analyze climate change impacts across different regions',
      'Develop collaborative research skills',
      'Create actionable environmental solutions',
      'Present findings to international audience'
    ],
    activities: [
      {
        id: 'act-3',
        title: 'Regional Climate Research',
        description: 'Research climate impacts in your assigned region',
        type: 'project',
        duration: 300,
        isRequired: true,
        order: 1
      },
      {
        id: 'act-4',
        title: 'International Team Collaboration',
        description: 'Work with students from other countries to compare findings',
        type: 'project',
        duration: 240,
        isRequired: true,
        order: 2
      }
    ],
    resources: [
      {
        id: 'res-3',
        title: 'Climate Data Portal',
        description: 'Access to global climate datasets and analysis tools',
        type: 'interactive',
        url: 'https://climate-data.example.com',
        language: 'English',
        isRequired: true,
        tags: ['data', 'climate', 'research']
      }
    ],
    tags: ['environment', 'climate', 'research', 'collaboration'],
    isPublic: true,
    applicationDeadline: '2024-02-25T23:59:59Z',
    certificateOffered: true,
    createdBy: 'teacher-2',
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-02-05T09:15:00Z'
  },
  {
    id: 'exp-3',
    title: 'European History Virtual Field Trip',
    description: 'Take a virtual journey through European historical sites with expert guides and interactive experiences.',
    type: 'virtual-field-trip',
    culturalRegion: 'europe',
    languages: ['English', 'French', 'German'],
    subjects: ['History', 'Social Studies', 'Arts'],
    ageRange: { min: 13, max: 17 },
    maxParticipants: 40,
    currentParticipants: 22,
    status: 'active',
    startDate: '2024-02-10T10:00:00Z',
    endDate: '2024-02-24T16:00:00Z',
    duration: 25,
    timeZone: 'Europe/Paris',
    hostSchool: {
      id: 'school-fr-1',
      name: 'Lycée International de Paris',
      country: 'France',
      city: 'Paris',
      contactEmail: 'virtual-tours@lip.fr'
    },
    requirements: [
      'Interest in European history',
      'Basic knowledge of medieval period',
      'Reliable internet connection for virtual tours'
    ],
    learningObjectives: [
      'Explore major European historical sites virtually',
      'Understand the impact of historical events on modern Europe',
      'Develop visual analysis skills for historical artifacts',
      'Create digital travel journal'
    ],
    activities: [
      {
        id: 'act-5',
        title: 'Virtual Tour of Versailles',
        description: 'Guided virtual tour of the Palace of Versailles',
        type: 'tour',
        duration: 120,
        scheduledTime: '2024-02-15T14:00:00Z',
        facilitator: 'Dr. Marie Dubois',
        isRequired: true,
        order: 1
      }
    ],
    resources: [
      {
        id: 'res-4',
        title: 'European History Timeline',
        description: 'Interactive timeline of major European historical events',
        type: 'interactive',
        url: '/resources/europe-timeline.html',
        language: 'English',
        isRequired: true,
        estimatedTime: 45,
        tags: ['history', 'timeline', 'europe']
      }
    ],
    tags: ['history', 'europe', 'virtual-tour', 'culture'],
    isPublic: true,
    certificateOffered: false,
    createdBy: 'teacher-3',
    createdAt: '2024-01-25T14:30:00Z',
    updatedAt: '2024-02-08T11:20:00Z'
  },
  {
    id: 'exp-4',
    title: 'African Literature and Storytelling Circle',
    description: 'Explore the rich tradition of African storytelling through literature, oral narratives, and creative writing workshops.',
    type: 'cross-cultural-study',
    culturalRegion: 'africa',
    languages: ['English', 'Swahili', 'French'],
    subjects: ['Literature', 'Creative Writing', 'Cultural Studies'],
    ageRange: { min: 16, max: 20 },
    maxParticipants: 25,
    currentParticipants: 15,
    status: 'upcoming',
    startDate: '2024-03-10T15:00:00Z',
    endDate: '2024-04-10T19:00:00Z',
    duration: 35,
    timeZone: 'Africa/Nairobi',
    hostSchool: {
      id: 'school-ke-1',
      name: 'Nairobi International Academy',
      country: 'Kenya',
      city: 'Nairobi',
      contactEmail: 'literature@nia.ke'
    },
    requirements: [
      'Love for literature and storytelling',
      'Open mind to different cultural perspectives',
      'Willingness to share own stories'
    ],
    learningObjectives: [
      'Appreciate the diversity of African literature',
      'Understand the role of oral tradition in African cultures',
      'Develop creative writing skills',
      'Create original stories inspired by African traditions'
    ],
    activities: [
      {
        id: 'act-6',
        title: 'Traditional Storytelling Session',
        description: 'Listen to traditional African stories told by master storytellers',
        type: 'presentation',
        duration: 90,
        scheduledTime: '2024-03-15T16:00:00Z',
        facilitator: 'Elder Wanjiku',
        isRequired: true,
        order: 1
      }
    ],
    resources: [
      {
        id: 'res-5',
        title: 'African Literature Anthology',
        description: 'Collection of short stories and poems from across Africa',
        type: 'document',
        url: '/resources/african-literature-anthology.pdf',
        language: 'English',
        isRequired: true,
        estimatedTime: 120,
        tags: ['literature', 'stories', 'poetry', 'africa']
      }
    ],
    tags: ['literature', 'africa', 'storytelling', 'culture'],
    isPublic: true,
    applicationDeadline: '2024-03-05T23:59:59Z',
    certificateOffered: true,
    createdBy: 'teacher-4',
    createdAt: '2024-02-01T16:00:00Z',
    updatedAt: '2024-02-10T13:45:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const region = searchParams.get('region');
    const status = searchParams.get('status');
    const language = searchParams.get('language');

    let filteredExperiences = mockExperiences;

    // Apply filters
    if (type) {
      filteredExperiences = filteredExperiences.filter(exp => exp.type === type);
    }
    if (region) {
      filteredExperiences = filteredExperiences.filter(exp => exp.culturalRegion === region);
    }
    if (status) {
      filteredExperiences = filteredExperiences.filter(exp => exp.status === status);
    }
    if (language) {
      filteredExperiences = filteredExperiences.filter(exp => exp.languages.includes(language));
    }

    return NextResponse.json(filteredExperiences);
  } catch (error) {
    console.error('Error fetching global learning experiences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experiences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const experienceData = await request.json();
    
    // In a real implementation, this would save to a database
    const newExperience: GlobalLearningExperience = {
      id: `exp-${Date.now()}`,
      ...experienceData,
      currentParticipants: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to mock data (in memory only)
    mockExperiences.push(newExperience);

    return NextResponse.json(newExperience, { status: 201 });
  } catch (error) {
    console.error('Error creating global learning experience:', error);
    return NextResponse.json(
      { error: 'Failed to create experience' },
      { status: 500 }
    );
  }
}