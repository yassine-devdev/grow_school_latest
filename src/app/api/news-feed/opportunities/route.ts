import { NextRequest, NextResponse } from 'next/server';
import { Opportunity, OpportunityType, NewsCategory } from '@/types';

// Mock data for opportunities
const mockOpportunities: Opportunity[] = [
  {
    id: 'opportunity-1',
    title: 'Google Summer of Code 2024',
    description: 'Google Summer of Code is a global program focused on bringing more developers into open source software development. Students work with an open source organization on a 12+ week programming project during their break from school.',
    type: 'internship' as OpportunityType,
    category: 'technology' as NewsCategory,
    organization: 'Google',
    organizationType: 'company',
    location: {
      type: 'remote',
      isGlobal: true
    },
    eligibility: {
      minAge: 18,
      academicLevel: ['college', 'university'],
      requiredSkills: ['Programming', 'Open Source Development'],
      preferredSkills: ['Python', 'Java', 'C++', 'JavaScript'],
      languageRequirements: ['English']
    },
    benefits: {
      monetary: {
        amount: 6600,
        currency: 'USD',
        type: 'stipend'
      },
      experience: ['Open Source Development', 'Mentorship', 'Global Collaboration'],
      networking: true,
      mentorship: true,
      certification: ['Google Summer of Code Certificate'],
      other: ['T-shirt and swag', 'Community recognition']
    },
    timeline: {
      applicationDeadline: '2024-04-02T23:59:59Z',
      startDate: '2024-05-27T00:00:00Z',
      endDate: '2024-08-26T23:59:59Z',
      duration: '12+ weeks',
      isRolling: false
    },
    applicationProcess: {
      applicationUrl: 'https://summerofcode.withgoogle.com/',
      requiredDocuments: ['Project proposal', 'Resume', 'Academic transcript'],
      contactEmail: 'gsoc-support@google.com',
      additionalInstructions: 'Students must submit a detailed project proposal and demonstrate their programming skills through code samples.'
    },
    tags: ['Programming', 'Open Source', 'Remote Work', 'Mentorship', 'Global'],
    relevanceScore: 92,
    matchingCriteria: {
      interests: 95,
      skills: 88,
      location: 100,
      eligibility: 90,
      timing: 85
    },
    source: 'external',
    sourceUrl: 'https://summerofcode.withgoogle.com/',
    imageUrl: '/images/google-summer-of-code.jpg',
    isVerified: true,
    verifiedBy: 'admin-1',
    verifiedAt: '2024-01-15T00:00:00Z',
    isActive: true,
    isFeatured: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'opportunity-2',
    title: 'National Merit Scholarship Program',
    description: 'The National Merit Scholarship Program is an academic competition for recognition and scholarships that began in 1955. High school students enter the program by taking the Preliminary SAT/National Merit Scholarship Qualifying Test (PSAT/NMSQT).',
    type: 'scholarship' as OpportunityType,
    category: 'scholarship' as NewsCategory,
    organization: 'National Merit Scholarship Corporation',
    organizationType: 'nonprofit',
    location: {
      type: 'onsite',
      country: 'United States',
      isGlobal: false
    },
    eligibility: {
      minAge: 16,
      maxAge: 18,
      academicLevel: ['high school'],
      gpa: { min: 3.5 },
      citizenshipRequirements: ['US Citizen', 'US Permanent Resident'],
      languageRequirements: ['English']
    },
    benefits: {
      monetary: {
        amount: 2500,
        currency: 'USD',
        type: 'scholarship'
      },
      experience: ['Academic Recognition', 'College Application Boost'],
      networking: false,
      mentorship: false,
      certification: ['National Merit Scholar Certificate'],
      other: ['College recruitment opportunities', 'Additional scholarship opportunities']
    },
    timeline: {
      applicationDeadline: '2024-10-15T23:59:59Z',
      startDate: '2024-09-01T00:00:00Z',
      duration: 'One-time award',
      isRolling: false
    },
    applicationProcess: {
      applicationUrl: 'https://www.nationalmerit.org/',
      requiredDocuments: ['PSAT/NMSQT scores', 'SAT scores', 'Academic transcript', 'Essay'],
      additionalInstructions: 'Students must take the PSAT/NMSQT in their junior year and meet the qualifying score for their state.'
    },
    tags: ['Academic Excellence', 'Standardized Testing', 'College Preparation', 'Merit-Based'],
    relevanceScore: 85,
    matchingCriteria: {
      interests: 80,
      skills: 90,
      location: 85,
      eligibility: 95,
      timing: 70
    },
    source: 'external',
    sourceUrl: 'https://www.nationalmerit.org/',
    imageUrl: '/images/national-merit-scholarship.jpg',
    isVerified: true,
    verifiedBy: 'admin-1',
    verifiedAt: '2024-01-10T00:00:00Z',
    isActive: true,
    isFeatured: true,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'opportunity-3',
    title: 'NASA USRP Internship Program',
    description: 'The NASA Undergraduate Student Research Program (USRP) provides undergraduate students with research opportunities at NASA centers across the United States. Students work on cutting-edge projects in aerospace, engineering, and space science.',
    type: 'research' as OpportunityType,
    category: 'science' as NewsCategory,
    organization: 'NASA',
    organizationType: 'government',
    location: {
      type: 'onsite',
      country: 'United States',
      isGlobal: false
    },
    eligibility: {
      minAge: 18,
      academicLevel: ['college', 'university'],
      gpa: { min: 3.0 },
      requiredSkills: ['Research Experience', 'STEM Background'],
      preferredSkills: ['Engineering', 'Physics', 'Computer Science', 'Mathematics'],
      citizenshipRequirements: ['US Citizen'],
      languageRequirements: ['English']
    },
    benefits: {
      monetary: {
        amount: 7200,
        currency: 'USD',
        type: 'stipend'
      },
      experience: ['NASA Research Experience', 'Professional Development', 'Space Industry Exposure'],
      networking: true,
      mentorship: true,
      certification: ['NASA Internship Certificate'],
      other: ['Potential for full-time job offers', 'Access to NASA facilities']
    },
    timeline: {
      applicationDeadline: '2024-03-01T23:59:59Z',
      startDate: '2024-06-01T00:00:00Z',
      endDate: '2024-08-15T23:59:59Z',
      duration: '10-16 weeks',
      isRolling: false
    },
    applicationProcess: {
      applicationUrl: 'https://intern.nasa.gov/',
      requiredDocuments: ['Resume', 'Cover letter', 'Academic transcript', 'Two letters of recommendation'],
      contactEmail: 'nasa-internships@nasa.gov',
      additionalInstructions: 'Applicants must be enrolled in an accredited university and have a strong background in STEM fields.'
    },
    tags: ['NASA', 'Research', 'STEM', 'Space Science', 'Engineering'],
    relevanceScore: 79,
    matchingCriteria: {
      interests: 85,
      skills: 75,
      location: 70,
      eligibility: 80,
      timing: 85
    },
    source: 'external',
    sourceUrl: 'https://intern.nasa.gov/',
    imageUrl: '/images/nasa-internship.jpg',
    isVerified: true,
    verifiedBy: 'admin-1',
    verifiedAt: '2024-01-12T00:00:00Z',
    isActive: true,
    isFeatured: false,
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z'
  },
  {
    id: 'opportunity-4',
    title: 'International Science Fair Competition',
    description: 'The International Science and Engineering Fair (ISEF) is the world\'s largest international pre-college science competition. Students compete for awards, scholarships, and the opportunity to showcase their research to a global audience.',
    type: 'competition' as OpportunityType,
    category: 'science' as NewsCategory,
    organization: 'Society for Science',
    organizationType: 'nonprofit',
    location: {
      type: 'onsite',
      city: 'Los Angeles',
      state: 'California',
      country: 'United States',
      isGlobal: true
    },
    eligibility: {
      minAge: 14,
      maxAge: 18,
      academicLevel: ['high school'],
      requiredSkills: ['Scientific Research', 'Project Presentation'],
      preferredSkills: ['Laboratory Skills', 'Data Analysis', 'Scientific Writing']
    },
    benefits: {
      monetary: {
        amount: 75000,
        currency: 'USD',
        type: 'award'
      },
      experience: ['International Competition', 'Scientific Recognition', 'Research Presentation'],
      networking: true,
      mentorship: false,
      certification: ['ISEF Participation Certificate'],
      other: ['College scholarship opportunities', 'Internship offers', 'Media recognition']
    },
    timeline: {
      applicationDeadline: '2024-02-15T23:59:59Z',
      startDate: '2024-05-12T00:00:00Z',
      endDate: '2024-05-17T23:59:59Z',
      duration: '5 days',
      isRolling: false
    },
    applicationProcess: {
      applicationUrl: 'https://www.societyforscience.org/isef/',
      requiredDocuments: ['Research project', 'Research plan', 'Data and analysis', 'Project display board'],
      contactEmail: 'isef@societyforscience.org',
      additionalInstructions: 'Students must first compete and win at regional and state science fairs to qualify for ISEF.'
    },
    tags: ['Science Fair', 'Research Competition', 'International', 'STEM', 'Awards'],
    relevanceScore: 73,
    matchingCriteria: {
      interests: 80,
      skills: 70,
      location: 60,
      eligibility: 85,
      timing: 75
    },
    source: 'external',
    sourceUrl: 'https://www.societyforscience.org/isef/',
    imageUrl: '/images/science-fair.jpg',
    isVerified: true,
    verifiedBy: 'admin-1',
    verifiedAt: '2024-01-08T00:00:00Z',
    isActive: true,
    isFeatured: false,
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-14T00:00:00Z'
  },
  {
    id: 'opportunity-5',
    title: 'Teach for America Corps Member',
    description: 'Teach for America recruits recent college graduates and professionals to teach for two years in high-need schools and become lifelong leaders in expanding educational opportunity.',
    type: 'program' as OpportunityType,
    category: 'career' as NewsCategory,
    organization: 'Teach for America',
    organizationType: 'nonprofit',
    location: {
      type: 'onsite',
      country: 'United States',
      isGlobal: false
    },
    eligibility: {
      minAge: 21,
      academicLevel: ['college graduate'],
      gpa: { min: 2.5 },
      requiredSkills: ['Leadership', 'Communication', 'Commitment to Education'],
      preferredSkills: ['Teaching Experience', 'Subject Matter Expertise', 'Community Engagement'],
      citizenshipRequirements: ['US Citizen', 'US Permanent Resident'],
      languageRequirements: ['English']
    },
    benefits: {
      monetary: {
        amount: 45000,
        currency: 'USD',
        type: 'salary'
      },
      experience: ['Teaching Experience', 'Leadership Development', 'Educational Impact'],
      networking: true,
      mentorship: true,
      certification: ['Teaching License', 'Master\'s Degree (optional)'],
      other: ['Student loan forgiveness options', 'Alumni network', 'Career support']
    },
    timeline: {
      applicationDeadline: '2024-02-28T23:59:59Z',
      startDate: '2024-06-01T00:00:00Z',
      endDate: '2026-06-01T00:00:00Z',
      duration: '2 years',
      isRolling: false
    },
    applicationProcess: {
      applicationUrl: 'https://www.teachforamerica.org/join-tfa',
      requiredDocuments: ['Online application', 'Resume', 'Academic transcript', 'Two references'],
      contactEmail: 'admissions@teachforamerica.org',
      additionalInstructions: 'Applicants must complete a rigorous selection process including interviews and teaching demonstrations.'
    },
    tags: ['Teaching', 'Education', 'Leadership', 'Social Impact', 'Career Change'],
    relevanceScore: 68,
    matchingCriteria: {
      interests: 75,
      skills: 65,
      location: 70,
      eligibility: 60,
      timing: 80
    },
    source: 'external',
    sourceUrl: 'https://www.teachforamerica.org/',
    imageUrl: '/images/teach-for-america.jpg',
    isVerified: true,
    verifiedBy: 'admin-1',
    verifiedAt: '2024-01-05T00:00:00Z',
    isActive: true,
    isFeatured: false,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-11T00:00:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') as OpportunityType;
    const category = searchParams.get('category') as NewsCategory;
    const location = searchParams.get('location');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    let filteredOpportunities = mockOpportunities.filter(opp => opp.isActive);
    
    // Filter by type if specified
    if (type) {
      filteredOpportunities = filteredOpportunities.filter(opp => 
        opp.type === type
      );
    }
    
    // Filter by category if specified
    if (category) {
      filteredOpportunities = filteredOpportunities.filter(opp => 
        opp.category === category
      );
    }
    
    // Filter by location if specified
    if (location) {
      filteredOpportunities = filteredOpportunities.filter(opp => 
        opp.location.isGlobal || 
        opp.location.country?.toLowerCase().includes(location.toLowerCase()) ||
        opp.location.state?.toLowerCase().includes(location.toLowerCase()) ||
        opp.location.city?.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // Sort opportunities
    if (userId) {
      // Sort by relevance score for personalized requests
      filteredOpportunities.sort((a, b) => {
        // Prioritize featured opportunities
        if (a.isFeatured !== b.isFeatured) {
          return a.isFeatured ? -1 : 1;
        }
        
        // Then by relevance score
        if (a.relevanceScore !== b.relevanceScore) {
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        }
        
        // Finally by deadline urgency
        const deadlineA = new Date(a.timeline.applicationDeadline).getTime();
        const deadlineB = new Date(b.timeline.applicationDeadline).getTime();
        return deadlineA - deadlineB;
      });
    } else {
      // Sort by deadline for non-personalized requests
      filteredOpportunities.sort((a, b) => {
        const deadlineA = new Date(a.timeline.applicationDeadline).getTime();
        const deadlineB = new Date(b.timeline.applicationDeadline).getTime();
        return deadlineA - deadlineB;
      });
    }
    
    // Apply pagination
    const paginatedOpportunities = filteredOpportunities.slice(offset, offset + limit);
    
    return NextResponse.json({
      opportunities: paginatedOpportunities,
      total: filteredOpportunities.length,
      hasMore: offset + limit < filteredOpportunities.length
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const opportunityData = await request.json();
    
    // In a real application, this would save to a database
    const newOpportunity: Opportunity = {
      id: `opportunity-${Date.now()}`,
      ...opportunityData,
      isVerified: false, // New opportunities need verification
      isActive: true,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockOpportunities.push(newOpportunity);
    
    return NextResponse.json(newOpportunity, { status: 201 });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to create opportunity' },
      { status: 500 }
    );
  }
}