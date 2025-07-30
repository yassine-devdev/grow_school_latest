import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/backend/db';
import { enrollmentUpdateSchema } from '@/backend/validation/schemas';

export async function GET(
  request: NextRequest,
  { params }: { params: { enrollmentId: string } }
) {
  try {
    const pb = await getDb();
    const { enrollmentId } = params;

    // Get enrollment with expanded data
    const enrollmentRecord = await pb.collection('enrollments').getOne(enrollmentId, {
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

    return NextResponse.json({ enrollment });
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    if (error.status === 404) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch enrollment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { enrollmentId: string } }
) {
  try {
    const pb = await getDb();
    const { enrollmentId } = params;
    const body = await request.json();

    // Validate request body
    const validationResult = enrollmentUpdateSchema.safeParse({
      id: enrollmentId,
      ...body
    });
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { id, ...updateData } = validationResult.data;

    // Get current enrollment to check for class changes
    const currentEnrollment = await pb.collection('enrollments').getOne(enrollmentId);
    const oldClassId = currentEnrollment.classId;
    const newClassId = updateData.classId;

    // If class is being changed, handle capacity updates
    if (newClassId && newClassId !== oldClassId) {
      // Check if student is already enrolled in the new class
      const existingEnrollment = await pb.collection('enrollments').getFirstListItem(
        `studentId="${currentEnrollment.studentId}" && classId="${newClassId}" && id!="${enrollmentId}"`,
        { requestKey: null }
      ).catch(() => null);

      if (existingEnrollment) {
        return NextResponse.json(
          { error: 'Student is already enrolled in the target class' },
          { status: 409 }
        );
      }

      // Check new class capacity
      const newClassRecord = await pb.collection('classes').getOne(newClassId);
      if (newClassRecord.currentEnrollment >= newClassRecord.capacity) {
        return NextResponse.json(
          { error: 'Target class is at full capacity' },
          { status: 409 }
        );
      }

      // Update class enrollment counts
      const oldClassRecord = await pb.collection('classes').getOne(oldClassId);
      
      // Decrease old class enrollment
      await pb.collection('classes').update(oldClassId, {
        currentEnrollment: Math.max(0, oldClassRecord.currentEnrollment - 1)
      });

      // Increase new class enrollment
      await pb.collection('classes').update(newClassId, {
        currentEnrollment: newClassRecord.currentEnrollment + 1
      });
    }

    // Update enrollment
    const updatedRecord = await pb.collection('enrollments').update(enrollmentId, updateData);

    // Get updated enrollment with expanded data
    const enrollmentRecord = await pb.collection('enrollments').getOne(enrollmentId, {
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

    return NextResponse.json({ enrollment });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    if (error.status === 404) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update enrollment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { enrollmentId: string } }
) {
  try {
    const pb = await getDb();
    const { enrollmentId } = params;

    // Get enrollment to update class count
    const enrollmentRecord = await pb.collection('enrollments').getOne(enrollmentId);
    const classId = enrollmentRecord.classId;

    // Delete enrollment
    await pb.collection('enrollments').delete(enrollmentId);

    // Update class enrollment count
    const classRecord = await pb.collection('classes').getOne(classId);
    await pb.collection('classes').update(classId, {
      currentEnrollment: Math.max(0, classRecord.currentEnrollment - 1)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    if (error.status === 404) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete enrollment' },
      { status: 500 }
    );
  }
}