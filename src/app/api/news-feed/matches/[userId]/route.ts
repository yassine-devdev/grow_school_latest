import { NextRequest, NextResponse } from 'next/server';
import { OpportunityMatch, Opportunity } from '@/types';

// Mock function to calculate opportunity matches for a user
function calculateOpportunityMatch(opportunity: Opportunity, userProfile: any): OpportunityMatch {
  // Simplified matching algorithm
  const interests = Math.floor(Math.random() * 30) + 70; // 70-100
  const skills = Math.floor(Math.random() * 40) + 60; // 60-100
  const eligibility = Math.floor(Math.random() * 20) + 80; // 80-100
  const location = Math.floor(Math.random() * 50) + 50; // 50-100
  const timing = Math.floor(Math.random() * 30) + 70; // 70-100
  const career = Math.floor(Math.random() * 40) + 60; // 60-100

  const matchScore = Math.round(
    (interests * 0.25) +
    (skills * 0.20) +
    (eligibility * 0.20) +
    (location * 0.10) +
    (timing * 0.15) +
    (career * 0.10)
  );

  // Generate missing requirements based on match factors
  const missingRequirements = [];
  if (skills < 80) {
    missingRequirements.push('Additional technical skills needed');
  }
  if (eligibility < 90) {
    missingRequirements.push('GPA requirement may not be met');
  }
  if (location < 70) {
    missingRequirements.push('Location preference mismatch');
  }

  // Generate strength areas
  const strengthAreas = [];
  if (interests > 85) {
    strengthAreas.push('Strong interest alignment');
  }
  if (skills > 80) {
    strengthAreas.push('Excellent skill match');
  }
  if (eligibility > 90) {
    strengthAreas.push('Meets all eligibility criteria');
  }
  if (timing > 85) {
    strengthAreas.push('Perfect timing for application');
  }

  // Generate recommendations
  const recommendations = [
    'Start preparing your application materials early',
    'Highlight relevant projects and experiences',
    'Connect with current or former participants'
  ];

  if (missingRequirements.length > 0) {
    recommendations.push('Work on addressing missing requirements');
  }

  // Generate application tips
  const applicationTips = [
    'Tailor your application to highlight relevant experience',
    'Get strong letters of recommendation',
    'Proofread all application materials carefully'
  ];

  if (opportunity.type === 'scholarship') {
    applicationTips.push('Emphasize academic achievements and financial need');
  } else if (opportunity.type === 'internship') {
    applicationTips.push('Showcase relevant projects and technical skills');
  } else if (opportunity.type === 'research') {
    applicationTips.push('Demonstrate research interest and methodology understanding');
  }

  return {
    opportunity,
    matchScore,
    matchingFactors: {
      interests,
      skills,
      eligibility,
      location,
      timing,
      career
    },
    missingRequirements,
    strengthAreas,
    recommendations,
    applicationTips,
    similarOpportunities: [] // Would be populated with similar opportunity IDs
  };
}

// Mock data for opportunity matches
const mockOpportunityMatches: Record<string, OpportunityMatch[]> = {};

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const minMatchScore = parseInt(searchParams.get('minScore') || '60');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // In a real application, this would fetch user profile and calculate matches
    // For now, we'll generate mock matches
    
    if (!mockOpportunityMatches[userId]) {
      // Generate matches for demo
      const mockOpportunities: Opportunity[] = [
        {
          id: 'opportunity-1',
          title: 'Google Summer of Code 2024',
          description: 'Global program for open source software development',
          type: 'internship',
          category: 'technology',
          organization: 'Google',
          organizationType: 'company',
          location: { type: 'remote', isGlobal: true },
          eligibility: {
            minAge: 18,
            academicLevel: ['college'],
            requiredSkills: ['Programming'],
            languageRequirements: ['English']
          },
          benefits: {
            monetary: { amount: 6600, currency: 'USD', type: 'stipend' },
            experience: ['Open Source Development'],
            networking: true,
            mentorship: true
          },
          timeline: {
            applicationDeadline: '2024-04-02T23:59:59Z',
            startDate: '2024-05-27T00:00:00Z',
            endDate: '2024-08-26T23:59:59Z',
            duration: '12+ weeks'
          },
          applicationProcess: {
            applicationUrl: 'https://summerofcode.withgoogle.com/',
            requiredDocuments: ['Project proposal', 'Resume']
          },
          tags: ['Programming', 'Open Source'],
          source: 'external',
          isVerified: true,
          isActive: true,
          isFeatured: true,
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: '2024-01-20T00:00:00Z'
        },
        {
          id: 'opportunity-2',
          title: 'National Merit Scholarship',
          description: 'Academic competition for recognition and scholarships',
          type: 'scholarship',
          category: 'scholarship',
          organization: 'National Merit Scholarship Corporation',
          organizationType: 'nonprofit',
          location: { type: 'onsite', country: 'United States' },
          eligibility: {
            minAge: 16,
            maxAge: 18,
            academicLevel: ['high school'],
            gpa: { min: 3.5 }
          },
          benefits: {
            monetary: { amount: 2500, currency: 'USD', type: 'scholarship' },
            experience: ['Academic Recognition']
          },
          timeline: {
            applicationDeadline: '2024-10-15T23:59:59Z',
            startDate: '2024-09-01T00:00:00Z',
            duration: 'One-time award'
          },
          applicationProcess: {
            applicationUrl: 'https://www.nationalmerit.org/',
            requiredDocuments: ['PSAT scores', 'Essay']
          },
          tags: ['Academic Excellence'],
          source: 'external',
          isVerified: true,
          isActive: true,
          isFeatured: true,
          createdAt: '2024-01-10T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z'
        }
      ];

      // Calculate matches for each opportunity
      const userProfile = { /* mock user profile */ };
      mockOpportunityMatches[userId] = mockOpportunities
        .map(opp => calculateOpportunityMatch(opp, userProfile))
        .filter(match => match.matchScore >= minMatchScore)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);
    }
    
    return NextResponse.json(mockOpportunityMatches[userId]);
  } catch (error) {
    console.error('Error fetching opportunity matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunity matches' },
      { status: 500 }
    );
  }
}