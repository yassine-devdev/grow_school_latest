import { NextRequest, NextResponse } from 'next/server';
import { ClassroomMatch, GlobalClassroom, CollaborationType } from '@/types';

// Mock function to calculate classroom compatibility
function calculateCompatibility(sourceClassroom: GlobalClassroom, targetClassroom: GlobalClassroom): ClassroomMatch {
  // Subject areas match
  const commonSubjects = sourceClassroom.subjectAreas.filter(subject => 
    targetClassroom.subjectAreas.includes(subject)
  );
  const subjectMatch = (commonSubjects.length / Math.max(sourceClassroom.subjectAreas.length, targetClassroom.subjectAreas.length)) * 100;

  // Grade level match (closer grades = higher match)
  const gradeSource = parseInt(sourceClassroom.gradeLevel);
  const gradeTarget = parseInt(targetClassroom.gradeLevel);
  const gradeDiff = Math.abs(gradeSource - gradeTarget);
  const gradeMatch = Math.max(0, 100 - (gradeDiff * 20));

  // Language match
  const commonLanguages = sourceClassroom.languages.filter(lang => 
    targetClassroom.languages.includes(lang)
  );
  const languageMatch = commonLanguages.length > 0 ? 100 : 0;

  // Timezone overlap calculation (simplified)
  const timezoneMatch = calculateTimezoneOverlap(sourceClassroom.timezone, targetClassroom.timezone);

  // Collaboration type match
  const commonCollabTypes = sourceClassroom.collaborationTypes.filter(type => 
    targetClassroom.collaborationTypes.includes(type)
  );
  const collabMatch = (commonCollabTypes.length / Math.max(sourceClassroom.collaborationTypes.length, targetClassroom.collaborationTypes.length)) * 100;

  // Technology access match
  const techMatch = calculateTechnologyMatch(sourceClassroom, targetClassroom);

  // Cultural interests match
  const commonInterests = sourceClassroom.specialInterests.filter(interest => 
    targetClassroom.specialInterests.includes(interest) ||
    targetClassroom.culturalFocus.some(focus => focus.toLowerCase().includes(interest.toLowerCase()))
  );
  const culturalMatch = commonInterests.length > 0 ? 80 : 40; // Base cultural curiosity

  // Overall compatibility score (weighted average)
  const compatibilityScore = Math.round(
    (subjectMatch * 0.25) +
    (gradeMatch * 0.15) +
    (languageMatch * 0.20) +
    (timezoneMatch * 0.15) +
    (collabMatch * 0.15) +
    (techMatch * 0.05) +
    (culturalMatch * 0.05)
  );

  // Recommend collaboration types based on common interests and capabilities
  const recommendedTypes: CollaborationType[] = [];
  if (commonLanguages.length > 0) {
    recommendedTypes.push('language-exchange');
  }
  if (commonSubjects.length > 0) {
    recommendedTypes.push('project-based');
  }
  recommendedTypes.push('cultural-exchange');
  if (timezoneMatch > 50) {
    recommendedTypes.push('joint-lesson');
  }

  // Suggest activities based on compatibility
  const suggestedActivities = generateSuggestedActivities(sourceClassroom, targetClassroom, commonSubjects);

  // Identify potential challenges
  const potentialChallenges = [];
  if (languageMatch === 0) {
    potentialChallenges.push('Language barrier - consider translation tools');
  }
  if (timezoneMatch < 30) {
    potentialChallenges.push('Limited time overlap - asynchronous activities recommended');
  }
  if (gradeDiff > 2) {
    potentialChallenges.push('Age gap may require adapted activities');
  }

  // Generate recommendations
  const recommendations = [];
  if (commonSubjects.length > 0) {
    recommendations.push(`Focus on ${commonSubjects.join(', ')} for subject-based collaboration`);
  }
  if (timezoneMatch > 70) {
    recommendations.push('Excellent time overlap - perfect for live sessions');
  }
  if (commonLanguages.length > 0) {
    recommendations.push(`Use ${commonLanguages[0]} as primary communication language`);
  }

  return {
    classroom: targetClassroom,
    compatibilityScore,
    matchingCriteria: {
      subjectAreas: subjectMatch,
      gradeLevel: gradeMatch,
      languages: languageMatch,
      timezone: timezoneMatch,
      collaborationType: collabMatch,
      technologyAccess: techMatch,
      culturalInterests: culturalMatch
    },
    recommendedCollaborationType: recommendedTypes,
    suggestedActivities,
    potentialChallenges,
    recommendations
  };
}

function calculateTimezoneOverlap(timezone1: string, timezone2: string): number {
  // Simplified timezone overlap calculation
  // In a real application, this would use proper timezone libraries
  const timezoneOffsets: Record<string, number> = {
    'America/Denver': -7,
    'Asia/Tokyo': 9,
    'America/Sao_Paulo': -3,
    'Europe/London': 0
  };

  const offset1 = timezoneOffsets[timezone1] || 0;
  const offset2 = timezoneOffsets[timezone2] || 0;
  const timeDiff = Math.abs(offset1 - offset2);

  // Calculate overlap based on typical school hours (8 hours)
  if (timeDiff === 0) return 100; // Same timezone
  if (timeDiff <= 3) return 80;   // Good overlap
  if (timeDiff <= 6) return 60;   // Moderate overlap
  if (timeDiff <= 9) return 40;   // Limited overlap
  if (timeDiff <= 12) return 20;  // Very limited overlap
  return 10; // Minimal overlap
}

function calculateTechnologyMatch(classroom1: GlobalClassroom, classroom2: GlobalClassroom): number {
  const tech1 = classroom1.technologyAccess;
  const tech2 = classroom2.technologyAccess;

  let matches = 0;
  let total = 0;

  // Check video conferencing capability
  if (tech1.hasVideoConferencing && tech2.hasVideoConferencing) matches++;
  total++;

  // Check interactive whiteboard
  if (tech1.hasInteractiveWhiteboard && tech2.hasInteractiveWhiteboard) matches++;
  total++;

  // Check computer access
  if (tech1.hasComputers && tech2.hasComputers) matches++;
  total++;

  // Internet speed compatibility
  const speedOrder = { 'low': 1, 'medium': 2, 'high': 3 };
  const minSpeed = Math.min(speedOrder[tech1.internetSpeed], speedOrder[tech2.internetSpeed]);
  if (minSpeed >= 2) matches += 0.5; // Medium or high speed
  total++;

  return (matches / total) * 100;
}

function generateSuggestedActivities(
  sourceClassroom: GlobalClassroom, 
  targetClassroom: GlobalClassroom, 
  commonSubjects: string[]
): string[] {
  const activities = [];

  // Subject-based activities
  if (commonSubjects.includes('science')) {
    activities.push('Virtual science experiment collaboration');
    activities.push('Climate change research project');
  }
  if (commonSubjects.includes('mathematics')) {
    activities.push('Math problem-solving challenges');
    activities.push('Statistics project on cultural differences');
  }
  if (commonSubjects.includes('social-studies')) {
    activities.push('Cultural comparison presentation');
    activities.push('Historical timeline collaboration');
  }
  if (commonSubjects.includes('arts')) {
    activities.push('Collaborative art project');
    activities.push('Cultural art exchange exhibition');
  }

  // General cultural activities
  activities.push('Virtual school tour exchange');
  activities.push('Traditional food presentation');
  activities.push('Holiday and celebration sharing');
  activities.push('Daily life comparison project');

  // Age-appropriate activities
  const avgAge = (sourceClassroom.ageRange.min + sourceClassroom.ageRange.max + 
                  targetClassroom.ageRange.min + targetClassroom.ageRange.max) / 4;
  
  if (avgAge < 12) {
    activities.push('Show and tell sessions');
    activities.push('Pen pal letter exchange');
  } else if (avgAge < 16) {
    activities.push('Debate on global issues');
    activities.push('Joint research presentations');
  } else {
    activities.push('Model UN simulation');
    activities.push('Career exploration exchange');
  }

  return activities.slice(0, 8); // Return top 8 activities
}

// Mock data for classroom matches
const mockClassroomMatches: Record<string, ClassroomMatch[]> = {};

export async function GET(
  request: NextRequest,
  { params }: { params: { classroomId: string } }
) {
  try {
    const { classroomId } = params;
    
    // In a real application, this would fetch the source classroom and calculate matches
    // For now, we'll use mock data and calculate matches on the fly
    
    // Mock source classroom (this would be fetched from database)
    const sourceClassroom: GlobalClassroom = {
      id: classroomId,
      name: 'My Classroom',
      description: 'Our classroom description',
      school: {
        id: 'my-school',
        name: 'My School',
        type: 'public',
        address: { city: 'My City', country: 'My Country' },
        languages: ['English'],
        isVerified: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      teacher: {
        id: 'my-teacher',
        name: 'My Teacher',
        email: 'teacher@school.edu',
        subjectAreas: ['mathematics', 'science'],
        languages: ['English'],
        timezone: 'America/Denver',
        isVerified: true,
        verificationStatus: 'verified',
        contactPreferences: {
          email: true,
          videoCall: true,
          textChat: true,
          phone: false
        },
        availabilitySchedule: {},
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      classroomType: 'middle',
      gradeLevel: '6',
      subjectAreas: ['mathematics', 'science'],
      studentCount: 25,
      ageRange: { min: 11, max: 12 },
      languages: ['English'],
      timezone: 'America/Denver',
      availableHours: {
        start: '08:00',
        end: '15:00',
        days: [1, 2, 3, 4, 5]
      },
      collaborationTypes: ['project-based', 'cultural-exchange'],
      communicationMethods: ['video-call', 'text-chat'],
      culturalFocus: ['American culture'],
      specialInterests: ['Technology', 'Environment'],
      technologyAccess: {
        hasVideoConferencing: true,
        hasInteractiveWhiteboard: true,
        hasTablets: true,
        hasComputers: true,
        internetSpeed: 'high'
      },
      isActive: true,
      isVerified: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    // Get all available classrooms (this would be from database)
    const allClassrooms: GlobalClassroom[] = [
      // Mock classrooms from the classrooms route would be here
      // For brevity, using a simplified version
    ];

    // Calculate matches for each classroom
    const matches = allClassrooms
      .filter(classroom => classroom.id !== classroomId && classroom.isActive)
      .map(classroom => calculateCompatibility(sourceClassroom, classroom))
      .filter(match => match.compatibilityScore >= 30) // Only show matches above 30%
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 10); // Top 10 matches

    // For demo purposes, return some mock matches
    const demoMatches: ClassroomMatch[] = [
      {
        classroom: {
          id: 'classroom-2',
          name: 'Tokyo International Middle School 7th Grade',
          description: 'A diverse class eager to practice English and share Japanese culture.',
          school: {
            id: 'school-2',
            name: 'Tokyo International Middle School',
            type: 'international',
            address: { city: 'Tokyo', country: 'Japan' },
            languages: ['Japanese', 'English'],
            isVerified: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          teacher: {
            id: 'teacher-2',
            name: 'Ms. Yuki Sato',
            email: 'y.sato@tokyointernational.edu.jp',
            subjectAreas: ['language-arts', 'social-studies'],
            languages: ['Japanese', 'English'],
            timezone: 'Asia/Tokyo',
            isVerified: true,
            verificationStatus: 'verified',
            contactPreferences: {
              email: true,
              videoCall: true,
              textChat: true,
              phone: false
            },
            availabilitySchedule: {},
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          classroomType: 'middle',
          gradeLevel: '7',
          subjectAreas: ['language-arts', 'social-studies'],
          studentCount: 28,
          ageRange: { min: 12, max: 13 },
          languages: ['Japanese', 'English'],
          timezone: 'Asia/Tokyo',
          availableHours: {
            start: '09:00',
            end: '16:00',
            days: [1, 2, 3, 4, 5]
          },
          collaborationTypes: ['language-exchange', 'cultural-exchange', 'pen-pal'],
          communicationMethods: ['video-call', 'text-chat', 'email'],
          culturalFocus: ['Japanese traditions', 'Modern Japan'],
          specialInterests: ['Technology', 'Traditional arts'],
          technologyAccess: {
            hasVideoConferencing: true,
            hasInteractiveWhiteboard: true,
            hasTablets: true,
            hasComputers: true,
            internetSpeed: 'high'
          },
          isActive: true,
          isVerified: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        compatibilityScore: 78,
        matchingCriteria: {
          subjectAreas: 25,
          gradeLevel: 80,
          languages: 100,
          timezone: 40,
          collaborationType: 67,
          technologyAccess: 100,
          culturalInterests: 60
        },
        recommendedCollaborationType: ['language-exchange', 'cultural-exchange'],
        suggestedActivities: [
          'Language exchange sessions',
          'Cultural comparison presentation',
          'Technology in education discussion',
          'Traditional vs modern lifestyle comparison'
        ],
        potentialChallenges: [
          'Limited time overlap due to timezone difference'
        ],
        recommendations: [
          'Use English as primary communication language',
          'Focus on asynchronous activities due to time difference',
          'Leverage technology interests for engaging projects'
        ]
      }
    ];

    return NextResponse.json(demoMatches);
  } catch (error) {
    console.error('Error fetching classroom matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classroom matches' },
      { status: 500 }
    );
  }
}