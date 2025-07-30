import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/backend/db';
import { z } from 'zod';

// Bulk enrollment operation schemas
const bulkAddSchema = z.object({
  classId: z.string().min(1, 'Class ID is required'),
  studentIds: z.array(z.string().min(1, 'Student ID is required'))
    .min(1, 'At least one student ID is required')
    .max(50, 'Cannot add more than 50 students at once'),
  status: z.string().min(1, 'Status is required'),
  enrollmentDate: z.string().datetime('Invalid enrollment date format').optional(),
  steps: z.array(z.any()).optional(),
});

const bulkRemoveSchema = z.object({
  classId: z.string().min(1, 'Class ID is required'),
  studentIds: z.array(z.string().min(1, 'Student ID is required'))
    .min(1, 'At least one student ID is required')
    .max(50, 'Cannot remove more than 50 students at once'),
});

const bulkTransferSchema = z.object({
  sourceClassId: z.string().min(1, 'Source class ID is required'),
  targetClassId: z.string().min(1, 'Target class ID is required'),
  studentIds: z.array(z.string().min(1, 'Student ID is required'))
    .min(1, 'At least one student ID is required')
    .max(50, 'Cannot transfer more than 50 students at once'),
  reason: z.string().max(500, 'Reason must not exceed 500 characters').optional(),
  preserveProgress: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const pb = await getDb();
    const body = await request.json();
    const { operation } = body;

    switch (operation) {
      case 'add':
        return await handleBulkAdd(pb, body);
      case 'remove':
        return await handleBulkRemove(pb, body);
      case 'transfer':
        return await handleBulkTransfer(pb, body);
      default:
        return NextResponse.json(
          { error: 'Invalid operation. Must be "add", "remove", or "transfer"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in bulk enrollment operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk enrollment operation' },
      { status: 500 }
    );
  }
}

async function handleBulkAdd(pb: any, body: any) {
  // Validate request body
  const validationResult = bulkAddSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: validationResult.error.errors
      },
      { status: 400 }
    );
  }

  const { classId, studentIds, status, enrollmentDate, steps } = validationResult.data;

  // Check class capacity
  const classRecord = await pb.collection('classes').getOne(classId);
  const availableSpots = classRecord.capacity - classRecord.currentEnrollment;
  
  if (availableSpots < studentIds.length) {
    return NextResponse.json(
      { 
        error: `Insufficient capacity. Class has ${availableSpots} available spots but trying to add ${studentIds.length} students` 
      },
      { status: 409 }
    );
  }

  // Check for existing enrollments
  const existingEnrollments = await pb.collection('enrollments').getFullList({
    filter: `classId="${classId}" && (${studentIds.map(id => `studentId="${id}"`).join(' || ')})`,
  });

  const alreadyEnrolledStudentIds = existingEnrollments.map(e => e.studentId);
  const newStudentIds = studentIds.filter(id => !alreadyEnrolledStudentIds.includes(id));

  if (newStudentIds.length === 0) {
    return NextResponse.json(
      { error: 'All specified students are already enrolled in this class' },
      { status: 409 }
    );
  }

  // Create enrollments for new students
  const enrollmentData = newStudentIds.map(studentId => ({
    studentId,
    classId,
    status,
    enrollmentDate: enrollmentDate || new Date().toISOString(),
    steps: steps || [],
  }));

  const results = {
    successful: [],
    failed: [],
    alreadyEnrolled: alreadyEnrolledStudentIds,
  };

  // Create enrollments one by one to handle individual failures
  for (const data of enrollmentData) {
    try {
      const enrollment = await pb.collection('enrollments').create(data);
      results.successful.push({
        studentId: data.studentId,
        enrollmentId: enrollment.id,
      });
    } catch (error) {
      results.failed.push({
        studentId: data.studentId,
        error: error.message,
      });
    }
  }

  // Update class enrollment count
  if (results.successful.length > 0) {
    await pb.collection('classes').update(classId, {
      currentEnrollment: classRecord.currentEnrollment + results.successful.length
    });
  }

  return NextResponse.json({
    operation: 'add',
    results,
    summary: {
      requested: studentIds.length,
      successful: results.successful.length,
      failed: results.failed.length,
      alreadyEnrolled: results.alreadyEnrolled.length,
    }
  });
}

async function handleBulkRemove(pb: any, body: any) {
  // Validate request body
  const validationResult = bulkRemoveSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: validationResult.error.errors
      },
      { status: 400 }
    );
  }

  const { classId, studentIds } = validationResult.data;

  // Find existing enrollments
  const existingEnrollments = await pb.collection('enrollments').getFullList({
    filter: `classId="${classId}" && (${studentIds.map(id => `studentId="${id}"`).join(' || ')})`,
  });

  const results = {
    successful: [],
    failed: [],
    notFound: [],
  };

  const foundStudentIds = existingEnrollments.map(e => e.studentId);
  const notFoundStudentIds = studentIds.filter(id => !foundStudentIds.includes(id));
  results.notFound = notFoundStudentIds;

  // Remove enrollments one by one to handle individual failures
  for (const enrollment of existingEnrollments) {
    try {
      await pb.collection('enrollments').delete(enrollment.id);
      results.successful.push({
        studentId: enrollment.studentId,
        enrollmentId: enrollment.id,
      });
    } catch (error) {
      results.failed.push({
        studentId: enrollment.studentId,
        enrollmentId: enrollment.id,
        error: error.message,
      });
    }
  }

  // Update class enrollment count
  if (results.successful.length > 0) {
    const classRecord = await pb.collection('classes').getOne(classId);
    await pb.collection('classes').update(classId, {
      currentEnrollment: Math.max(0, classRecord.currentEnrollment - results.successful.length)
    });
  }

  return NextResponse.json({
    operation: 'remove',
    results,
    summary: {
      requested: studentIds.length,
      successful: results.successful.length,
      failed: results.failed.length,
      notFound: results.notFound.length,
    }
  });
}

async function handleBulkTransfer(pb: any, body: any) {
  // Validate request body
  const validationResult = bulkTransferSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: validationResult.error.errors
      },
      { status: 400 }
    );
  }

  const { sourceClassId, targetClassId, studentIds, reason, preserveProgress } = validationResult.data;

  // Check if trying to transfer to the same class
  if (sourceClassId === targetClassId) {
    return NextResponse.json(
      { error: 'Cannot transfer students to the same class' },
      { status: 400 }
    );
  }

  // Check target class capacity
  const targetClass = await pb.collection('classes').getOne(targetClassId);
  const availableSpots = targetClass.capacity - targetClass.currentEnrollment;
  
  if (availableSpots < studentIds.length) {
    return NextResponse.json(
      { 
        error: `Insufficient capacity in target class. Has ${availableSpots} available spots but trying to transfer ${studentIds.length} students` 
      },
      { status: 409 }
    );
  }

  // Find existing enrollments in source class
  const sourceEnrollments = await pb.collection('enrollments').getFullList({
    filter: `classId="${sourceClassId}" && (${studentIds.map(id => `studentId="${id}"`).join(' || ')})`,
  });

  // Check for existing enrollments in target class
  const targetEnrollments = await pb.collection('enrollments').getFullList({
    filter: `classId="${targetClassId}" && (${studentIds.map(id => `studentId="${id}"`).join(' || ')})`,
  });

  const alreadyInTargetIds = targetEnrollments.map(e => e.studentId);
  const foundInSourceIds = sourceEnrollments.map(e => e.studentId);
  const notFoundInSourceIds = studentIds.filter(id => !foundInSourceIds.includes(id));
  const validTransferEnrollments = sourceEnrollments.filter(e => !alreadyInTargetIds.includes(e.studentId));

  const results = {
    successful: [],
    failed: [],
    notFoundInSource: notFoundInSourceIds,
    alreadyInTarget: alreadyInTargetIds,
  };

  // Transfer students one by one
  for (const enrollment of validTransferEnrollments) {
    try {
      // Create new enrollment in target class
      const transferData = {
        studentId: enrollment.studentId,
        classId: targetClassId,
        status: enrollment.status,
        enrollmentDate: new Date().toISOString(),
        steps: preserveProgress ? enrollment.steps : [],
      };

      const newEnrollment = await pb.collection('enrollments').create(transferData);

      // Delete old enrollment
      await pb.collection('enrollments').delete(enrollment.id);

      // Log the transfer
      try {
        await pb.collection('transfer_logs').create({
          studentId: enrollment.studentId,
          sourceClassId,
          targetClassId,
          reason: reason || 'Bulk transfer',
          preserveProgress,
          transferredBy: 'system',
          transferredAt: new Date().toISOString(),
          oldEnrollmentId: enrollment.id,
          newEnrollmentId: newEnrollment.id,
        });
      } catch (logError) {
        console.warn('Failed to create transfer log:', logError);
      }

      results.successful.push({
        studentId: enrollment.studentId,
        oldEnrollmentId: enrollment.id,
        newEnrollmentId: newEnrollment.id,
      });
    } catch (error) {
      results.failed.push({
        studentId: enrollment.studentId,
        enrollmentId: enrollment.id,
        error: error.message,
      });
    }
  }

  // Update class enrollment counts
  if (results.successful.length > 0) {
    const sourceClass = await pb.collection('classes').getOne(sourceClassId);
    
    await Promise.all([
      // Decrease source class enrollment
      pb.collection('classes').update(sourceClassId, {
        currentEnrollment: Math.max(0, sourceClass.currentEnrollment - results.successful.length)
      }),
      // Increase target class enrollment
      pb.collection('classes').update(targetClassId, {
        currentEnrollment: targetClass.currentEnrollment + results.successful.length
      })
    ]);
  }

  return NextResponse.json({
    operation: 'transfer',
    results,
    summary: {
      requested: studentIds.length,
      successful: results.successful.length,
      failed: results.failed.length,
      notFoundInSource: results.notFoundInSource.length,
      alreadyInTarget: results.alreadyInTarget.length,
    }
  });
}