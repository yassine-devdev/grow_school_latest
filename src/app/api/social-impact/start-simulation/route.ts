import { NextRequest, NextResponse } from 'next/server';
import { SimulationParticipation } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { userId, simulationId } = await request.json();

    if (!userId || !simulationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real implementation, this would:
    // 1. Check if the simulation exists and is active
    // 2. Check if the user meets the requirements
    // 3. Check if there are available spots
    // 4. Save the participation to the database
    // 5. Initialize the user's progress

    const newParticipation: SimulationParticipation = {
      id: `part-${Date.now()}`,
      userId,
      simulationId,
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

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: 'Simulation started successfully',
      participation: newParticipation
    });
  } catch (error) {
    console.error('Error starting simulation:', error);
    return NextResponse.json(
      { error: 'Failed to start simulation' },
      { status: 500 }
    );
  }
}