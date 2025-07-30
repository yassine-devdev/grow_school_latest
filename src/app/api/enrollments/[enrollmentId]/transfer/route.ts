import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/backend/db';
import { z } from 'zod';

// Transfer request validation schema
const transferRequestSchema = z.object({
  targetClassId: z.string().min(1, 'Target class ID is required'),
  reason: z.string().max(500, 'Reason must not exceed 500 characters').optional(),
  preserveProgress: z.boolean().default(true),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { enrollmentId: string } }
) {
  try {
    const pb = await getDb();
    const { enrollmentId } = params;
    const body = await request.json();

    // Validate request body
    const validationResult = transferRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { targetClassId, reason, preserveProgress } = validationResult.data;

    // Get current enrollment
    const currentEnrollment = await pb.collection('enrollments').getOne(enrollmentId, {
      expand: 'studentId'
    });

    const sourceClassId = currentEnrollment.classId;
    const studentId = currentEnrollment.studentId;

    // Check if trying to transfer to the same class
    if (sourceClassId === targetClassId) {
      return NextResponse.json(
        { error: 'Cannot transfer student to the same class' },
        { status: 400 }
      );
    }

    // Check if student is already enrolled in target class
    const existingEnrollment = await pb.collection('enrollments').getFirstListItem(
      `studentId="${studentId}" && classId="${targetClassId}"`,
      { requestKey: null }
    ).catch(() => null);

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Student is already enrolled in the target class' },
        { status: 409 }
      );
    }

    // Check target class capacity
    const targetClass = await pb.collection('classes').getOne(targetClassId);
    if (targetClass.currentEnrollment >= targetClass.capacity) {
      return NextResponse.json(
        { error: 'Target class is at full capacity' },
        { status: 409 }
      );
    }

    // Get source class for capacity update
    const sourceClass = await pb.collection('classes').getOne(sourceClassId);

    // Prepare enrollment data for transfer
    const transferData = {
      studentId: currentEnrollment.studentId,
      classId: targetClassId,
      status: currentEnrollment.status,
      enrollmentDate: new Date().toISOString(),
      steps: preserveProgress ? currentEnrollment.steps : [],
    };

    // Create new enrollment in target class
    const newEnrollment = await pb.collection('enrollments').create(transferData);

    // Delete old enrollment
    await pb.collection('enrollments').delete(enrollmentId);

    // Update class enrollment counts
    await Promise.all([
      // Decrease source class enrollment
      pb.collection('classes').update(sourceClassId, {
        currentEnrollment: Math.max(0, sourceClass.currentEnrollment - 1)
      }),
      // Increase target class enrollment
      pb.collection('classes').update(targetClassId, {
        currentEnrollment: targetClass.currentEnrollment + 1
      })
    ]);

    // Log the transfer for audit purposes
    const transferLog = {
      studentId,
      sourceClassId,
      targetClassId,
      reason: reason || 'No reason provided',
      preserveProgress,
      transferredBy: 'system', // In a real app, this would be the current user
      transferredAt: new Date().toISOString(),
      oldEnrollmentId: enrollmentId,
      newEnrollmentId: newEnrollment.id,
    };

    // Create transfer log entry (assuming we have a transfer_logs collection)
    try {
      await pb.collection('transfer_logs').create(transferLog);
    } catch (error) {
      console.warn('Failed to create transfer log:', error);
      // Don't fail the transfer if logging fails
    }

    // Get the new enrollment with expanded data
    const enrollmentRecord = await pb.collection('enrollments').getOne(newEnrollment.id, {
      expand: 'studentId,status'
    });

    const student = enrollmentRecord.expand?.studentId;
    const enrollmentStatus = enrollmentRecord.expand?.status;

    const enrollment = {
      id: enrollmentRecord.id,
      studentId: enrollmentRecord.studentId,
      classId: enrollmentRecord.classId,
      status: enrollmentRecord.status,
      enrollmentDate: enrollmentRecord.enrollmentDate,
      steps: enrollmentRecord.steps || [],
      student: student ? {
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role,
        department: student.department,
        avatarUrl: student.avatarUrl || '',
      } : null,
      statusInfo: enrollmentStatus ? {
        id: enrollmentStatus.id,
        name: enrollmentStatus.name,
        description: enrollmentStatus.description,
        color: enrollmentStatus.color,
      } : null,
    };

    return NextResponse.json({ 
      enrollment,
      transfer: {
        sourceClassId,
        targetClassId,
        reason,
        preserveProgress,
        transferredAt: transferLog.transferredAt
      }
    });
  } catch (error) {
    console.error('Error transferring student:', error);
    if (error.status === 404) {
      return NextResponse.json(
        { error: 'Enrollment or target class not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to transfer student' },
      { status: 500 }
    );
  }
}