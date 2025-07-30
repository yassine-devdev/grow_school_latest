import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/backend/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const grade = searchParams.get('grade');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let enrollments;

    if (status) {
      enrollments = await db.search('enrollments', `status = "${status}"`, {
        sort: '-created',
        limit,
        offset: (page - 1) * limit
      });
    } else if (grade) {
      enrollments = await db.search('enrollments', `grade = "${grade}"`, {
        sort: '-created',
        limit,
        offset: (page - 1) * limit
      });
    } else {
      enrollments = await db.getAll('enrollments', {
        sort: '-created',
        limit,
        offset: (page - 1) * limit
      });
    }

    return NextResponse.json({
      success: true,
      enrollments,
      pagination: {
        page,
        limit,
        hasMore: enrollments.length === limit
      }
    });

  } catch (error: any) {
    // Only log in non-test environments to avoid test noise
    if (process.env.NODE_ENV !== 'test') {
      console.error('Enrollment retrieval error:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      grade,
      parentFirstName,
      parentLastName,
      parentEmail,
      parentPhone,
      address,
      city,
      state,
      zipCode,
      emergencyContact,
      emergencyPhone,
      medicalInfo,
      specialNeeds,
      previousSchool,
      academicHistory
    } = body;

    // Required field validation
    const requiredFields = ['firstName', 'lastName', 'email', 'grade', 'parentEmail'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || !emailRegex.test(parentEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Grade validation
    const validGrades = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    if (!validGrades.includes(grade)) {
      return NextResponse.json(
        { success: false, error: 'Invalid grade level' },
        { status: 400 }
      );
    }

    // Age validation
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 4 || age > 19) {
        return NextResponse.json(
          { success: false, error: 'Student age must be between 4 and 19 years' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate enrollment
    const existingEnrollments = await db.search('enrollments', `email = "${email}"`);
    if (existingEnrollments.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Student is already enrolled' },
        { status: 409 }
      );
    }

    // Create enrollment
    const enrollmentData = {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      grade,
      parentFirstName,
      parentLastName,
      parentEmail,
      parentPhone,
      address,
      city,
      state,
      zipCode,
      emergencyContact,
      emergencyPhone,
      medicalInfo,
      specialNeeds,
      previousSchool,
      academicHistory,
      status: 'pending',
      created: new Date().toISOString()
    };

    const enrollment = await db.create('enrollments', enrollmentData);

    // Send confirmation emails
    try {
      const { sendEnrollmentConfirmation, sendEnrollmentNotification } = require('@/lib/email-service');
      await sendEnrollmentConfirmation(parentEmail, enrollment);
      await sendEnrollmentNotification(enrollment);
    } catch (emailError) {
      console.warn('Email sending failed:', emailError);
    }

    return NextResponse.json({
      success: true,
      enrollment
    }, { status: 201 });

  } catch (error: any) {
    // Only log in non-test environments to avoid test noise
    if (process.env.NODE_ENV !== 'test') {
      console.error('Enrollment creation error:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}