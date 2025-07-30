import { NextRequest, NextResponse } from 'next/server';
import { GlobalClassroom, ClassroomType, SubjectArea, CollaborationType } from '@/types';

// Mock data for global classrooms
const mockGlobalClassrooms: GlobalClassroom[] = [
  {
    id: 'classroom-1',
    name: 'Sunrise Elementary 5th Grade',
    description: 'An enthusiastic class of 5th graders interested in learning about different cultures and sharing our American traditions.',
    school: {
      id: 'school-1',
      name: 'Sunrise Elementary School',
      type: 'public',
      address: {
        street: '123 Main Street',
        city: 'Denver',
        state: 'Colorado',
        country: 'United States',
        postalCode: '80202'
      },
      coordinates: {
        latitude: 39.7392,
        longitude: -104.9903
      },
      website: 'https://sunriseelementary.edu',
      email: 'info@sunriseelementary.edu',
      phone: '+1-303-555-0123',
      principalName: 'Dr. Sarah Johnson',
      studentCount: 450,
      establishedYear: 1985,
      languages: ['English'],
      curriculum: 'Common Core Standards',
      isVerified: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    teacher: {
      id: 'teacher-1',
      name: 'Ms. Emily Rodriguez',
      email: 'e.rodriguez@sunriseelementary.edu',
      title: 'Elementary Teacher',
      department: 'Elementary Education',
      subjectAreas: ['mathematics', 'science', 'social-studies'],
      yearsExperience: 8,
      languages: ['English', 'Spanish'],
      qualifications: ['M.Ed. Elementary Education', 'ESL Certification'],
      bio: 'Passionate about connecting students with the world through technology and cultural exchange.',
      timezone: 'America/Denver',
      isVerified: true,
      verificationStatus: 'verified',
      backgroundCheckStatus: 'approved',
      backgroundCheckDate: '2024-01-01T00:00:00Z',
      contactPreferences: {
        email: true,
        videoCall: true,
        textChat: true,
        phone: false
      },
      availabilitySchedule: {
        monday: { start: '08:00', end: '15:00' },
        tuesday: { start: '08:00', end: '15:00' },
        wednesday: { start: '08:00', end: '15:00' },
        thursday: { start: '08:00', end: '15:00' },
        friday: { start: '08:00', end: '15:00' }
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    classroomType: 'elementary' as ClassroomType,
    gradeLevel: '5',
    subjectAreas: ['mathematics', 'science', 'social-studies'] as SubjectArea[],
    studentCount: 24,
    ageRange: {
      min: 10,
      max: 11
    },
    languages: ['English'],
    timezone: 'America/Denver',
    availableHours: {
      start: '08:00',
      end: '15:00',
      days: [1, 2, 3, 4, 5] // Monday to Friday
    },
    collaborationTypes: ['cultural-exchange', 'pen-pal', 'project-based'] as CollaborationType[],
    communicationMethods: ['video-call', 'text-chat', 'email', 'shared-document'],
    culturalFocus: ['American traditions', 'Native American history', 'Western culture'],
    specialInterests: ['Environmental science', 'Space exploration', 'Music'],
    technologyAccess: {
      hasVideoConferencing: true,
      hasInteractiveWhiteboard: true,
      hasTablets: true,
      hasComputers: true,
      internetSpeed: 'high'
    },
    isActive: true,
    isVerified: true,
    verifiedAt: '2024-01-01T00:00:00Z',
    verifiedBy: 'admin-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'classroom-2',
    name: 'Tokyo International Middle School 7th Grade',
    description: 'A diverse class of 7th graders from various cultural backgrounds, eager to practice English and share Japanese culture.',
    school: {
      id: 'school-2',
      name: 'Tokyo International Middle School',
      type: 'international',
      address: {
        city: 'Tokyo',
        country: 'Japan',
        postalCode: '100-0001'
      },
      coordinates: {
        latitude: 35.6762,
        longitude: 139.6503
      },
      website: 'https://tokyointernational.edu.jp',
      email: 'info@tokyointernational.edu.jp',
      principalName: 'Mr. Hiroshi Tanaka',
      studentCount: 680,
      establishedYear: 1995,
      languages: ['Japanese', 'English'],
      curriculum: 'International Baccalaureate',
      isVerified: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    teacher: {
      id: 'teacher-2',
      name: 'Ms. Yuki Sato',
      email: 'y.sato@tokyointernational.edu.jp',
      title: 'English Language Teacher',
      department: 'Language Arts',
      subjectAreas: ['language-arts', 'social-studies'],
      yearsExperience: 12,
      languages: ['Japanese', 'English', 'Mandarin'],
      qualifications: ['B.A. English Literature', 'TESOL Certification', 'M.A. Applied Linguistics'],
      bio: 'Dedicated to fostering global citizenship through language learning and cultural exchange.',
      timezone: 'Asia/Tokyo',
      isVerified: true,
      verificationStatus: 'verified',
      backgroundCheckStatus: 'approved',
      backgroundCheckDate: '2024-01-01T00:00:00Z',
      contactPreferences: {
        email: true,
        videoCall: true,
        textChat: true,
        phone: false
      },
      availabilitySchedule: {
        monday: { start: '09:00', end: '16:00' },
        tuesday: { start: '09:00', end: '16:00' },
        wednesday: { start: '09:00', end: '16:00' },
        thursday: { start: '09:00', end: '16:00' },
        friday: { start: '09:00', end: '16:00' }
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    classroomType: 'middle' as ClassroomType,
    gradeLevel: '7',
    subjectAreas: ['language-arts', 'social-studies'] as SubjectArea[],
    studentCount: 28,
    ageRange: {
      min: 12,
      max: 13
    },
    languages: ['Japanese', 'English'],
    timezone: 'Asia/Tokyo',
    availableHours: {
      start: '09:00',
      end: '16:00',
      days: [1, 2, 3, 4, 5]
    },
    collaborationTypes: ['language-exchange', 'cultural-exchange', 'pen-pal'] as CollaborationType[],
    communicationMethods: ['video-call', 'text-chat', 'email'],
    culturalFocus: ['Japanese traditions', 'Anime and manga culture', 'Modern Japan'],
    specialInterests: ['Technology', 'Robotics', 'Traditional arts'],
    technologyAccess: {
      hasVideoConferencing: true,
      hasInteractiveWhiteboard: true,
      hasTablets: true,
      hasComputers: true,
      internetSpeed: 'high'
    },
    isActive: true,
    isVerified: true,
    verifiedAt: '2024-01-01T00:00:00Z',
    verifiedBy: 'admin-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'classroom-3',
    name: 'São Paulo Science Academy 9th Grade',
    description: 'A science-focused class passionate about environmental conservation and sustainable development.',
    school: {
      id: 'school-3',
      name: 'São Paulo Science Academy',
      type: 'private',
      address: {
        city: 'São Paulo',
        state: 'São Paulo',
        country: 'Brazil',
        postalCode: '01310-100'
      },
      coordinates: {
        latitude: -23.5505,
        longitude: -46.6333
      },
      website: 'https://spscience.edu.br',
      email: 'contato@spscience.edu.br',
      principalName: 'Dr. Maria Santos',
      studentCount: 320,
      establishedYear: 2010,
      languages: ['Portuguese', 'English'],
      curriculum: 'Brazilian National Curriculum + STEM Focus',
      isVerified: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    teacher: {
      id: 'teacher-3',
      name: 'Prof. Carlos Oliveira',
      email: 'c.oliveira@spscience.edu.br',
      title: 'Science Teacher',
      department: 'Science',
      subjectAreas: ['science'],
      yearsExperience: 15,
      languages: ['Portuguese', 'English', 'Spanish'],
      qualifications: ['Ph.D. Environmental Science', 'B.Sc. Biology'],
      bio: 'Environmental scientist turned educator, passionate about inspiring the next generation of environmental stewards.',
      timezone: 'America/Sao_Paulo',
      isVerified: true,
      verificationStatus: 'verified',
      backgroundCheckStatus: 'approved',
      backgroundCheckDate: '2024-01-01T00:00:00Z',
      contactPreferences: {
        email: true,
        videoCall: true,
        textChat: true,
        phone: true
      },
      availabilitySchedule: {
        monday: { start: '07:00', end: '17:00' },
        tuesday: { start: '07:00', end: '17:00' },
        wednesday: { start: '07:00', end: '17:00' },
        thursday: { start: '07:00', end: '17:00' },
        friday: { start: '07:00', end: '17:00' }
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    classroomType: 'high' as ClassroomType,
    gradeLevel: '9',
    subjectAreas: ['science'] as SubjectArea[],
    studentCount: 22,
    ageRange: {
      min: 14,
      max: 15
    },
    languages: ['Portuguese', 'English'],
    timezone: 'America/Sao_Paulo',
    availableHours: {
      start: '07:00',
      end: '17:00',
      days: [1, 2, 3, 4, 5]
    },
    collaborationTypes: ['project-based', 'virtual-field-trip', 'presentation'] as CollaborationType[],
    communicationMethods: ['video-call', 'shared-document', 'presentation'],
    culturalFocus: ['Brazilian culture', 'Amazon rainforest', 'Biodiversity'],
    specialInterests: ['Climate change', 'Renewable energy', 'Marine biology'],
    technologyAccess: {
      hasVideoConferencing: true,
      hasInteractiveWhiteboard: true,
      hasTablets: false,
      hasComputers: true,
      internetSpeed: 'medium'
    },
    isActive: true,
    isVerified: true,
    verifiedAt: '2024-01-01T00:00:00Z',
    verifiedBy: 'admin-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'classroom-4',
    name: 'London Arts College Year 10',
    description: 'Creative students exploring various art forms and interested in global artistic traditions and contemporary culture.',
    school: {
      id: 'school-4',
      name: 'London Arts College',
      type: 'public',
      address: {
        city: 'London',
        country: 'United Kingdom',
        postalCode: 'SW1A 1AA'
      },
      coordinates: {
        latitude: 51.5074,
        longitude: -0.1278
      },
      website: 'https://londonarts.ac.uk',
      email: 'admissions@londonarts.ac.uk',
      principalName: 'Ms. Catherine Williams',
      studentCount: 280,
      establishedYear: 1978,
      languages: ['English'],
      curriculum: 'UK National Curriculum + Arts Specialization',
      isVerified: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    teacher: {
      id: 'teacher-4',
      name: 'Mr. James Thompson',
      email: 'j.thompson@londonarts.ac.uk',
      title: 'Art Teacher',
      department: 'Arts',
      subjectAreas: ['arts'],
      yearsExperience: 10,
      languages: ['English', 'French'],
      qualifications: ['M.F.A. Fine Arts', 'B.A. Art History', 'PGCE Art Education'],
      bio: 'Professional artist and educator committed to nurturing creativity and cultural understanding through art.',
      timezone: 'Europe/London',
      isVerified: true,
      verificationStatus: 'verified',
      backgroundCheckStatus: 'approved',
      backgroundCheckDate: '2024-01-01T00:00:00Z',
      contactPreferences: {
        email: true,
        videoCall: true,
        textChat: false,
        phone: false
      },
      availabilitySchedule: {
        monday: { start: '09:00', end: '15:30' },
        tuesday: { start: '09:00', end: '15:30' },
        wednesday: { start: '09:00', end: '15:30' },
        thursday: { start: '09:00', end: '15:30' },
        friday: { start: '09:00', end: '15:30' }
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    classroomType: 'high' as ClassroomType,
    gradeLevel: '10',
    subjectAreas: ['arts'] as SubjectArea[],
    studentCount: 18,
    ageRange: {
      min: 15,
      max: 16
    },
    languages: ['English'],
    timezone: 'Europe/London',
    availableHours: {
      start: '09:00',
      end: '15:30',
      days: [1, 2, 3, 4, 5]
    },
    collaborationTypes: ['cultural-exchange', 'presentation', 'project-based'] as CollaborationType[],
    communicationMethods: ['video-call', 'shared-document', 'presentation'],
    culturalFocus: ['British culture', 'European art history', 'Contemporary art'],
    specialInterests: ['Digital art', 'Photography', 'Cultural heritage'],
    technologyAccess: {
      hasVideoConferencing: true,
      hasInteractiveWhiteboard: false,
      hasTablets: true,
      hasComputers: true,
      internetSpeed: 'high'
    },
    isActive: true,
    isVerified: true,
    verifiedAt: '2024-01-01T00:00:00Z',
    verifiedBy: 'admin-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const classroomType = searchParams.get('type');
    const subjectArea = searchParams.get('subject');
    const language = searchParams.get('language');
    const verifiedOnly = searchParams.get('verified') === 'true';
    
    let filteredClassrooms = mockGlobalClassrooms.filter(classroom => classroom.isActive);
    
    // Filter by country if specified
    if (country) {
      filteredClassrooms = filteredClassrooms.filter(classroom => 
        classroom.school.address.country.toLowerCase().includes(country.toLowerCase())
      );
    }
    
    // Filter by classroom type if specified
    if (classroomType) {
      filteredClassrooms = filteredClassrooms.filter(classroom => 
        classroom.classroomType === classroomType
      );
    }
    
    // Filter by subject area if specified
    if (subjectArea) {
      filteredClassrooms = filteredClassrooms.filter(classroom => 
        classroom.subjectAreas.includes(subjectArea as SubjectArea)
      );
    }
    
    // Filter by language if specified
    if (language) {
      filteredClassrooms = filteredClassrooms.filter(classroom => 
        classroom.languages.includes(language)
      );
    }
    
    // Filter by verification status if specified
    if (verifiedOnly) {
      filteredClassrooms = filteredClassrooms.filter(classroom => 
        classroom.isVerified
      );
    }
    
    // Sort by verification status (verified first) and then by creation date
    filteredClassrooms.sort((a, b) => {
      if (a.isVerified !== b.isVerified) {
        return a.isVerified ? -1 : 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return NextResponse.json(filteredClassrooms);
  } catch (error) {
    console.error('Error fetching global classrooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global classrooms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const classroomData = await request.json();
    
    // In a real application, this would save to a database
    const newClassroom: GlobalClassroom = {
      id: `classroom-${Date.now()}`,
      ...classroomData,
      isActive: true,
      isVerified: false, // New classrooms need verification
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockGlobalClassrooms.push(newClassroom);
    
    return NextResponse.json(newClassroom, { status: 201 });
  } catch (error) {
    console.error('Error creating global classroom:', error);
    return NextResponse.json(
      { error: 'Failed to create global classroom' },
      { status: 500 }
    );
  }
}