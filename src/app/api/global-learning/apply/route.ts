import { NextRequest, NextResponse } from 'next/server';
import { ExperienceParticipation } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { userId, experienceId, participationLevel } = await request.json();

    if (!userId || !experienceId || !participationLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real implementation, this would:
    // 1. Check if the experience exists and has available spots
    // 2. Check if the user meets the requirements
    // 3. Save the application to the database
    // 4. Send notification to the experience host

    const newApplication: ExperienceParticipation = {
      id: `part-${Date.now()}`,
      userId,
      experienceId,
      participationLevel,
      applicationDate: new Date().toISOString(),
      approvalStatus: 'pending',
      completionStatus: 'not_started',
      certificateIssued: false
    };

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      participation: newApplication
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}