import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { CalendarService } from '../../../../backend/services/calendarService';
import { PocketBaseCalendarRepository } from '../../../../backend/repositories/pocketbase/calendarRepository';
import { RecurrencePattern } from '../../../../types';

/**
 * API endpoint for updating recurrence patterns
 */

// Initialize PocketBase connection
function initializePocketBase(): PocketBase {
  const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
  return new PocketBase(pocketbaseUrl);
}

/**
 * PUT /api/calendar/recurrence-pattern
 * Update a recurrence pattern for a recurring event
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, newPattern, effectiveDate } = body;

    // Validate required fields
    if (!eventId || !newPattern) {
      return NextResponse.json(
        { error: 'Event ID and new pattern are required' },
        { status: 400 }
      );
    }

    // Validate pattern structure
    if (!newPattern.type || !newPattern.interval) {
      return NextResponse.json(
        { error: 'Pattern must have type and interval' },
        { status: 400 }
      );
    }

    // Initialize services
    const pb = initializePocketBase();
    const calendarRepository = new PocketBaseCalendarRepository(pb);
    const calendarService = new CalendarService(calendarRepository);

    // Update the recurrence pattern
    const updatedEvent = await calendarService.updateRecurrencePattern(
      eventId,
      newPattern as RecurrencePattern,
      effectiveDate
    );

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      message: 'Recurrence pattern updated successfully'
    });

  } catch (error) {
    console.error('Error updating recurrence pattern:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const statusCode = errorMessage.includes('not found') ? 404 : 500;

    return NextResponse.json(
      { 
        error: 'Failed to update recurrence pattern',
        details: errorMessage
      },
      { status: statusCode }
    );
  }
}

/**
 * POST /api/calendar/recurrence-pattern/bulk
 * Bulk update recurrence patterns for multiple events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body;

    // Validate input
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Updates array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate each update
    for (const update of updates) {
      if (!update.eventId || !update.newPattern) {
        return NextResponse.json(
          { error: 'Each update must have eventId and newPattern' },
          { status: 400 }
        );
      }
    }

    // Initialize services
    const pb = initializePocketBase();
    const calendarRepository = new PocketBaseCalendarRepository(pb);
    const calendarService = new CalendarService(calendarRepository);

    // Perform bulk update
    const result = await calendarService.bulkUpdateRecurrencePatterns(updates);

    return NextResponse.json({
      success: true,
      result,
      message: `Bulk update completed: ${result.successful.length} successful, ${result.failed.length} failed`
    });

  } catch (error) {
    console.error('Error in bulk recurrence pattern update:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { 
        error: 'Failed to perform bulk update',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}