import { NextRequest, NextResponse } from 'next/server';
import { SnapshotDigestService } from '../../../backend/services/snapshotDigestService';
import type { DigestFrequency, DigestDeliveryMethod } from '../../../types/snapshot-digest';

const snapshotDigestService = new SnapshotDigestService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId') || 'user-1'; // Default user for demo

    switch (action) {
      case 'preferences':
        const preferences = await snapshotDigestService.getDigestPreferences(userId);
        return NextResponse.json(preferences);

      case 'generate-report':
        const reportType = searchParams.get('reportType') as DigestFrequency || 'weekly';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        
        const customDateRange = startDate && endDate ? { startDate, endDate } : undefined;
        const report = await snapshotDigestService.generateProgressReport(
          userId,
          reportType,
          customDateRange
        );
        return NextResponse.json(report);

      case 'activity-summary':
        const summaryStartDate = searchParams.get('startDate') || 
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const summaryEndDate = searchParams.get('endDate') || new Date().toISOString();
        
        const activitySummary = await snapshotDigestService.generateActivitySummary(
          userId,
          summaryStartDate,
          summaryEndDate
        );
        return NextResponse.json(activitySummary);

      case 'deliveries':
        const deliveries = await snapshotDigestService.getDigestDeliveries(userId);
        return NextResponse.json(deliveries);

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Snapshot Digest API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId = 'user-1', ...data } = body;

    switch (action) {
      case 'create-preferences':
        const preferences = await snapshotDigestService.createDigestPreferences(userId, data);
        return NextResponse.json(preferences);

      case 'update-preferences':
        const updatedPreferences = await snapshotDigestService.updateDigestPreferences(userId, data);
        return NextResponse.json(updatedPreferences);

      case 'schedule-delivery':
        const { reportId, method, scheduledAt } = data;
        const delivery = await snapshotDigestService.scheduleDigestDelivery(
          userId,
          reportId,
          method as DigestDeliveryMethod,
          scheduledAt
        );
        return NextResponse.json(delivery);

      case 'send-digest':
        const { deliveryId } = data;
        const success = await snapshotDigestService.sendDigest(deliveryId);
        return NextResponse.json({ success });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Snapshot Digest API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}