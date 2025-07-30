import { NextRequest, NextResponse } from 'next/server';
import { ExperienceParticipation } from '@/types';

// Mock data for experience participations
const mockParticipations: ExperienceParticipation[] = [
  {
    id: 'part-1',
    userId: 'user-1',
    experienceId: 'exp-1',
    participationLevel: 'participant',
    applicationDate: '2024-01-20T10:00:00Z',
    approvalStatus: 'approved',
    approvedAt: '2024-01-22T14:30:00Z',
    approvedBy: 'teacher-1',
    completionStatus: 'in_progress',
    certificateIssued: false
  },
  {
    id: 'part-2',
    userId: 'user-1',
    experienceId: 'exp-3',
    participationLevel: 'participant',
    applicationDate: '2024-02-01T09:15:00Z',
    approvalStatus: 'approved',
    approvedAt: '2024-02-02T11:00:00Z',
    approvedBy: 'teacher-3',
    completionStatus: 'in_progress',
    certificateIssued: false
  },
  {
    id: 'part-3',
    userId: 'user-2',
    experienceId: 'exp-2',
    participationLevel: 'collaborator',
    applicationDate: '2024-01-25T16:20:00Z',
    approvalStatus: 'pending',
    completionStatus: 'not_started',
    certificateIssued: false
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const experienceId = searchParams.get('experienceId');
    const status = searchParams.get('status');

    let filteredParticipations = mockParticipations;

    // Apply filters
    if (userId) {
      filteredParticipations = filteredParticipations.filter(p => p.userId === userId);
    }
    if (experienceId) {
      filteredParticipations = filteredParticipations.filter(p => p.experienceId === experienceId);
    }
    if (status) {
      filteredParticipations = filteredParticipations.filter(p => p.approvalStatus === status);
    }

    return NextResponse.json(filteredParticipations);
  } catch (error) {
    console.error('Error fetching participations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const participationData = await request.json();
    
    // Check if user already applied to this experience
    const existingParticipation = mockParticipations.find(
      p => p.userId === participationData.userId && p.experienceId === participationData.experienceId
    );

    if (existingParticipation) {
      return NextResponse.json(
        { error: 'User already applied to this experience' },
        { status: 400 }
      );
    }

    // In a real implementation, this would save to a database
    const newParticipation: ExperienceParticipation = {
      id: `part-${Date.now()}`,
      ...participationData,
      applicationDate: new Date().toISOString(),
      approvalStatus: 'pending',
      completionStatus: 'not_started',
      certificateIssued: false
    };

    // Add to mock data (in memory only)
    mockParticipations.push(newParticipation);

    return NextResponse.json(newParticipation, { status: 201 });
  } catch (error) {
    console.error('Error creating participation:', error);
    return NextResponse.json(
      { error: 'Failed to create participation' },
      { status: 500 }
    );
  }
}