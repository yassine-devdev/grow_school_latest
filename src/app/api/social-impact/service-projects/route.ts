import { NextRequest, NextResponse } from 'next/server';
import { CommunityServiceProject, ImpactMetric } from '@/types';

// Mock data for community service projects
const mockServiceProjects: CommunityServiceProject[] = [
  {
    id: 'proj-1',
    title: 'Community Garden Initiative',
    description: 'Help establish and maintain community gardens in underserved neighborhoods to improve food access and community connection.',
    organization: 'Green Communities Alliance',
    category: 'environment',
    location: {
      type: 'local',
      address: '123 Community Center Dr, Local City',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    startDate: '2024-03-01T09:00:00Z',
    endDate: '2024-11-30T17:00:00Z',
    timeCommitment: {
      hoursPerWeek: 4,
      totalWeeks: 35,
      flexibleScheduling: true,
      weekendOptions: true
    },
    volunteersNeeded: 25,
    currentVolunteers: 12,
    skillsRequired: ['Gardening', 'Physical Labor', 'Community Outreach', 'Basic Construction'],
    skillsGained: ['Sustainable Agriculture', 'Project Management', 'Community Engagement', 'Environmental Stewardship'],
    impactMetrics: [
      {
        id: 'metric-1',
        name: 'Gardens Established',
        description: 'Number of community gardens created',
        unit: 'gardens',
        category: 'environmental',
        baseline: 0,
        target: 5
      },
      {
        id: 'metric-2',
        name: 'Families Served',
        description: 'Number of families with improved food access',
        unit: 'families',
        category: 'social',
        baseline: 0,
        target: 150
      },
      {
        id: 'metric-3',
        name: 'Pounds of Food Produced',
        description: 'Total pounds of fresh produce grown',
        unit: 'pounds',
        category: 'environmental',
        baseline: 0,
        target: 2000
      }
    ],
    requirements: [
      'Commitment to full project duration',
      'Ability to work outdoors in various weather conditions',
      'Basic physical fitness for gardening activities',
      'Willingness to engage with community members'
    ],
    benefits: [
      'Learn sustainable gardening techniques',
      'Build connections with community members',
      'Gain experience in environmental stewardship',
      'Receive community service hours certificate'
    ],
    applicationDeadline: '2024-02-25T23:59:59Z',
    contactInfo: {
      coordinatorName: 'Sarah Johnson',
      email: 'sarah@greencommunitiesalliance.org',
      phone: '(555) 123-4567'
    },
    tags: ['environment', 'food-security', 'community-building', 'sustainability'],
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-01T15:30:00Z'
  },
  {
    id: 'proj-2',
    title: 'Youth Literacy Mentorship Program',
    description: 'Provide one-on-one reading support and mentorship to elementary school students in low-income communities.',
    organization: 'Reading Success Foundation',
    category: 'education',
    location: {
      type: 'local',
      address: 'Various Elementary Schools',
      coordinates: { lat: 40.7589, lng: -73.9851 }
    },
    startDate: '2024-02-15T08:00:00Z',
    endDate: '2024-06-15T15:00:00Z',
    timeCommitment: {
      hoursPerWeek: 3,
      totalWeeks: 18,
      flexibleScheduling: false,
      weekendOptions: false
    },
    volunteersNeeded: 40,
    currentVolunteers: 28,
    skillsRequired: ['Reading Proficiency', 'Patience with Children', 'Communication Skills', 'Reliability'],
    skillsGained: ['Tutoring Techniques', 'Child Development Understanding', 'Educational Assessment', 'Mentorship Skills'],
    impactMetrics: [
      {
        id: 'metric-4',
        name: 'Students Mentored',
        description: 'Number of students receiving reading support',
        unit: 'students',
        category: 'educational',
        baseline: 0,
        target: 40
      },
      {
        id: 'metric-5',
        name: 'Reading Level Improvement',
        description: 'Average improvement in reading grade level',
        unit: 'grade levels',
        category: 'educational',
        baseline: 0,
        target: 1.5
      },
      {
        id: 'metric-6',
        name: 'Student Engagement Score',
        description: 'Average student engagement and motivation score',
        unit: 'score',
        category: 'educational',
        baseline: 6,
        target: 8.5
      }
    ],
    requirements: [
      'Background check clearance',
      'Commitment to weekly sessions',
      'High school diploma or equivalent',
      'Training session attendance (provided)'
    ],
    benefits: [
      'Gain experience working with children',
      'Develop tutoring and mentorship skills',
      'Make a direct impact on student success',
      'Receive training in literacy instruction'
    ],
    applicationDeadline: '2024-02-10T23:59:59Z',
    contactInfo: {
      coordinatorName: 'Michael Chen',
      email: 'michael@readingsuccessfoundation.org',
      phone: '(555) 234-5678'
    },
    tags: ['education', 'youth', 'mentorship', 'literacy'],
    isActive: true,
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-02-05T09:15:00Z'
  },
  {
    id: 'proj-3',
    title: 'Senior Technology Support Program',
    description: 'Help elderly community members learn to use smartphones, tablets, and computers to stay connected with family and access services.',
    organization: 'Digital Inclusion Initiative',
    category: 'elderly',
    location: {
      type: 'local',
      address: 'Senior Community Centers',
      coordinates: { lat: 40.6892, lng: -74.0445 }
    },
    startDate: '2024-02-20T10:00:00Z',
    endDate: '2024-12-20T16:00:00Z',
    timeCommitment: {
      hoursPerWeek: 2,
      totalWeeks: 44,
      flexibleScheduling: true,
      weekendOptions: true
    },
    volunteersNeeded: 15,
    currentVolunteers: 8,
    skillsRequired: ['Technology Proficiency', 'Patience', 'Clear Communication', 'Teaching Ability'],
    skillsGained: ['Teaching Skills', 'Intergenerational Communication', 'Technology Training', 'Community Service'],
    impactMetrics: [
      {
        id: 'metric-7',
        name: 'Seniors Trained',
        description: 'Number of seniors who completed technology training',
        unit: 'seniors',
        category: 'social',
        baseline: 0,
        target: 60
      },
      {
        id: 'metric-8',
        name: 'Digital Skills Improvement',
        description: 'Average improvement in digital literacy assessment scores',
        unit: 'points',
        category: 'educational',
        baseline: 0,
        target: 25
      },
      {
        id: 'metric-9',
        name: 'Social Connection Increase',
        description: 'Percentage increase in seniors reporting improved social connections',
        unit: 'percentage',
        category: 'social',
        baseline: 0,
        target: 40
      }
    ],
    requirements: [
      'Strong technology skills (smartphones, tablets, computers)',
      'Excellent patience and communication skills',
      'Ability to explain technical concepts simply',
      'Commitment to regular volunteer schedule'
    ],
    benefits: [
      'Develop teaching and communication skills',
      'Build meaningful intergenerational relationships',
      'Gain experience in digital inclusion work',
      'Contribute to reducing the digital divide'
    ],
    applicationDeadline: '2024-02-15T23:59:59Z',
    contactInfo: {
      coordinatorName: 'Lisa Rodriguez',
      email: 'lisa@digitalinclusion.org',
      phone: '(555) 345-6789'
    },
    tags: ['elderly', 'technology', 'digital-inclusion', 'education'],
    isActive: true,
    createdAt: '2024-01-25T14:30:00Z',
    updatedAt: '2024-02-08T11:20:00Z'
  },
  {
    id: 'proj-4',
    title: 'Environmental Cleanup and Restoration',
    description: 'Participate in regular cleanup efforts at local parks, waterways, and natural areas while learning about environmental conservation.',
    organization: 'Clean Earth Coalition',
    category: 'environment',
    location: {
      type: 'regional',
      address: 'Various Parks and Natural Areas',
      coordinates: { lat: 40.7831, lng: -73.9712 }
    },
    startDate: '2024-03-15T08:00:00Z',
    endDate: '2024-10-15T17:00:00Z',
    timeCommitment: {
      hoursPerWeek: 6,
      totalWeeks: 31,
      flexibleScheduling: true,
      weekendOptions: true
    },
    volunteersNeeded: 50,
    currentVolunteers: 35,
    skillsRequired: ['Physical Fitness', 'Outdoor Work Comfort', 'Teamwork', 'Environmental Interest'],
    skillsGained: ['Environmental Conservation', 'Ecosystem Knowledge', 'Project Coordination', 'Environmental Advocacy'],
    impactMetrics: [
      {
        id: 'metric-10',
        name: 'Areas Cleaned',
        description: 'Number of parks and natural areas cleaned',
        unit: 'areas',
        category: 'environmental',
        baseline: 0,
        target: 20
      },
      {
        id: 'metric-11',
        name: 'Trash Removed',
        description: 'Total pounds of trash and debris removed',
        unit: 'pounds',
        category: 'environmental',
        baseline: 0,
        target: 5000
      },
      {
        id: 'metric-12',
        name: 'Native Plants Restored',
        description: 'Number of native plants planted for habitat restoration',
        unit: 'plants',
        category: 'environmental',
        baseline: 0,
        target: 1000
      }
    ],
    requirements: [
      'Ability to work outdoors in various weather conditions',
      'Basic physical fitness for cleanup activities',
      'Commitment to environmental protection',
      'Willingness to work as part of a team'
    ],
    benefits: [
      'Learn about local ecosystems and conservation',
      'Gain hands-on environmental restoration experience',
      'Build teamwork and leadership skills',
      'Make visible impact on community environment'
    ],
    applicationDeadline: '2024-03-10T23:59:59Z',
    contactInfo: {
      coordinatorName: 'David Park',
      email: 'david@cleanearthcoalition.org',
      phone: '(555) 456-7890'
    },
    tags: ['environment', 'conservation', 'cleanup', 'restoration'],
    isActive: true,
    createdAt: '2024-02-01T16:00:00Z',
    updatedAt: '2024-02-10T13:45:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const locationType = searchParams.get('locationType');
    const isActive = searchParams.get('isActive');

    let filteredProjects = mockServiceProjects;

    // Apply filters
    if (category) {
      filteredProjects = filteredProjects.filter(proj => proj.category === category);
    }
    if (locationType) {
      filteredProjects = filteredProjects.filter(proj => proj.location.type === locationType);
    }
    if (isActive !== null) {
      const active = isActive === 'true';
      filteredProjects = filteredProjects.filter(proj => proj.isActive === active);
    }

    return NextResponse.json(filteredProjects);
  } catch (error) {
    console.error('Error fetching service projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const projectData = await request.json();
    
    // In a real implementation, this would save to a database
    const newProject: CommunityServiceProject = {
      id: `proj-${Date.now()}`,
      ...projectData,
      currentVolunteers: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to mock data (in memory only)
    mockServiceProjects.push(newProject);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating service project:', error);
    return NextResponse.json(
      { error: 'Failed to create service project' },
      { status: 500 }
    );
  }
}