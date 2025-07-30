import { NextRequest, NextResponse } from 'next/server';
import { SimulationParticipation } from '@/types';

// Mock data for simulation participations
const mockParticipations: SimulationParticipation[] = [
  {
    id: 'part-1',
    userId: 'user-1',
    simulationId: 'sim-1',
    startedAt: '2024-01-20T10:00:00Z',
    completedScenarios: 2,
    currentScenario: 'scenario-2',
    decisionsMade: 3,
    impactScore: 85,
    contributionScore: 78,
    collaborationRating: 4,
    learningProgress: 67,
    hoursContributed: 8,
    isCompleted: false,
    badgesEarned: ['Community Champion', 'Problem Solver']
  },
  {
    id: 'part-2',
    userId: 'user-1',
    simulationId: 'sim-3',
    startedAt: '2024-02-01T09:15:00Z',
    completedScenarios: 1,
    currentScenario: 'scenario-4',
    decisionsMade: 2,
    impactScore: 92,
    contributionScore: 88,
    collaborationRating: 5,
    learningProgress: 45,
    hoursContributed: 5,
    isCompleted: false,
    badgesEarned: ['Social Justice Advocate']
  },
  {
    id: 'part-3',
    userId: 'user-2',
    simulationId: 'sim-2',
    startedAt: '2024-01-25T16:20:00Z',
    completedScenarios: 1,
    currentScenario: 'scenario-3',
    decisionsMade: 1,
    impactScore: 76,
    contributionScore: 82,
    collaborationRating: 4,
    learningProgress: 30,
    hoursContributed: 3,
    isCompleted: false,
    badgesEarned: ['Policy Researcher']
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const simulationId = searchParams.get('simulationId');
    const isCompleted = searchParams.get('isCompleted');

    let filteredParticipations = mockParticipations;

    // Apply filters
    if (userId) {
      filteredParticipations = filteredParticipations.filter(p => p.userId === userId);
    }
    if (simulationId) {
      filteredParticipations = filteredParticipations.filter(p => p.simulationId === simulationId);
    }
    if (isCompleted !== null) {
      const completed = isCompleted === 'true';
      filteredParticipations = filteredParticipations.filter(p => p.isCompleted === completed);
    }

    return NextResponse.json(filteredParticipations);
  } catch (error) {
    console.error('Error fetching simulation participations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const participationData = await request.json();
    
    // Check if user already participating in this simulation
    const existingParticipation = mockParticipations.find(
      p => p.userId === participationData.userId && p.simulationId === participationData.simulationId
    );

    if (existingParticipation) {
      return NextResponse.json(
        { error: 'User already participating in this simulation' },
        { status: 400 }
      );
    }

    // In a real implementation, this would save to a database
    const newParticipation: SimulationParticipation = {
      id: `part-${Date.now()}`,
      ...participationData,
      startedAt: new Date().toISOString(),
      completedScenarios: 0,
      decisionsMade: 0,
      impactScore: 0,
      contributionScore: 0,
      collaborationRating: 0,
      learningProgress: 0,
      hoursContributed: 0,
      isCompleted: false,
      badgesEarned: []
    };

    // Add to mock data (in memory only)
    mockParticipations.push(newParticipation);

    return NextResponse.json(newParticipation, { status: 201 });
  } catch (error) {
    console.error('Error creating simulation participation:', error);
    return NextResponse.json(
      { error: 'Failed to create participation' },
      { status: 500 }
    );
  }
}