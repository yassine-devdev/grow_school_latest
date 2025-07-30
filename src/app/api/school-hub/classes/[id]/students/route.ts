import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/backend/db';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { studentId } = body;
    const { id: classId } = params;

    // Validate required fields
    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Check if class exists
    const existingClass = await db.getById('classes', classId);
    if (!existingClass) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    // Check if class is full
    if (existingClass.enrolled >= existingClass.capacity) {
      return NextResponse.json(
        { success: false, error: 'Class is full' },
        { status: 400 }
      );
    }

    // Check if student exists
    const student = await db.getById('users', studentId);
    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if student is already enrolled
    const existingEnrollments = await db.search('enrollments', `studentId = "${studentId}" && classId = "${classId}"`);
    if (existingEnrollments.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Student already enrolled in this class' },
        { status: 409 }
      );
    }

    // Add student to class
    const enrollmentData = {
      studentId,
      classId,
      enrolledAt: new Date().toISOString(),
      status: 'active'
    };

    await db.create('enrollments', enrollmentData);

    // Update class enrollment count
    await db.update('classes', classId, {
      enrolled: existingClass.enrolled + 1
    });

    return NextResponse.json({
      success: true,
      message: 'Student added to class successfully'
    });

  } catch (error: any) {
    console.error('Student enrollment error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const { id: classId } = params;

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Check if class exists
    const existingClass = await db.getById('classes', classId);
    if (!existingClass) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    // Find and remove enrollment
    const enrollments = await db.search('enrollments', `studentId = "${studentId}" && classId = "${classId}"`);
    if (enrollments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Student not enrolled in this class' },
        { status: 404 }
      );
    }

    await db.delete('enrollments', enrollments[0].id);

    // Update class enrollment count
    await db.update('classes', classId, {
      enrolled: Math.max(0, existingClass.enrolled - 1)
    });

    return NextResponse.json({
      success: true,
      message: 'Student removed from class successfully'
    });

  } catch (error: any) {
    console.error('Student removal error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
