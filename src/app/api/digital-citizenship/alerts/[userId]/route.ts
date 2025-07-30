import { NextRequest, NextResponse } from 'next/server';
import { SafetyAlert, RiskLevel, SafetyTopicCategory } from '@/types';

// Mock data for safety alerts
const mockSafetyAlerts: Record<string, SafetyAlert[]> = {
  'user-1': [
    {
      id: 'alert-1',
      userId: 'user-1',
      type: 'security-breach',
      severity: 'high' as RiskLevel,
      title: 'Data Breach Alert: Popular Social Media Platform',
      message: 'A major social media platform has reported a data breach affecting millions of users. Check if your account was affected and update your password immediately.',
      category: 'password-security' as SafetyTopicCategory,
      actionRequired: true,
      actionSteps: [
        'Visit the platform\'s security page to check if your account was affected',
        'Change your password immediately if affected',
        'Enable two-factor authentication',
        'Review your account activity for suspicious behavior',
        'Consider using a password manager'
      ],
      deadline: '2024-01-25T23:59:59Z',
      resources: ['resource-password-security', 'resource-2fa-setup'],
      isRead: false,
      isDismissed: false,
      createdAt: '2024-01-22T09:00:00Z',
      expiresAt: '2024-02-22T09:00:00Z'
    },
    {
      id: 'alert-2',
      userId: 'user-1',
      type: 'new-threat',
      severity: 'medium' as RiskLevel,
      title: 'New Phishing Scam Targeting Students',
      message: 'A new phishing scam is targeting students with fake scholarship offers. Learn how to identify and avoid these scams.',
      category: 'scams' as SafetyTopicCategory,
      actionRequired: false,
      resources: ['resource-phishing-guide', 'resource-scam-awareness'],
      isRead: true,
      readAt: '2024-01-21T14:30:00Z',
      isDismissed: false,
      createdAt: '2024-01-21T08:00:00Z',
      expiresAt: '2024-02-21T08:00:00Z'
    },
    {
      id: 'alert-3',
      type: 'policy-update',
      severity: 'low' as RiskLevel,
      title: 'Updated Digital Citizenship Policy',
      message: 'Our school has updated its digital citizenship policy. Please review the new guidelines and expectations.',
      category: 'digital-wellness' as SafetyTopicCategory,
      actionRequired: true,
      actionSteps: [
        'Read the updated digital citizenship policy',
        'Complete the acknowledgment form',
        'Discuss any questions with your teacher or counselor'
      ],
      deadline: '2024-01-30T23:59:59Z',
      resources: ['resource-policy-document', 'resource-policy-summary'],
      isRead: false,
      isDismissed: false,
      createdAt: '2024-01-20T10:00:00Z',
      expiresAt: '2024-03-20T10:00:00Z'
    },
    {
      id: 'alert-4',
      type: 'educational',
      severity: 'low' as RiskLevel,
      title: 'Safer Internet Day is Coming!',
      message: 'Join us for Safer Internet Day activities and learn new ways to stay safe online. Special workshops and presentations available.',
      category: 'digital-wellness' as SafetyTopicCategory,
      actionRequired: false,
      resources: ['resource-safer-internet-day', 'resource-workshop-schedule'],
      isRead: false,
      isDismissed: false,
      createdAt: '2024-01-19T12:00:00Z',
      expiresAt: '2024-02-06T23:59:59Z'
    }
  ]
};

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const severity = searchParams.get('severity') as RiskLevel;
    const category = searchParams.get('category') as SafetyTopicCategory;
    
    // In a real application, this would fetch from a database
    let alerts = mockSafetyAlerts[userId] || [];
    
    // Filter by unread status if requested
    if (unreadOnly) {
      alerts = alerts.filter(alert => !alert.isRead);
    }
    
    // Filter by severity if specified
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }
    
    // Filter by category if specified
    if (category) {
      alerts = alerts.filter(alert => alert.category === category);
    }
    
    // Filter out expired alerts
    const now = new Date();
    alerts = alerts.filter(alert => 
      !alert.expiresAt || new Date(alert.expiresAt) > now
    );
    
    // Sort by severity (critical first) and then by creation date (newest first)
    const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    alerts.sort((a, b) => {
      const severityA = severityOrder[a.severity];
      const severityB = severityOrder[b.severity];
      
      if (severityA !== severityB) {
        return severityB - severityA;
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching safety alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch safety alerts' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { alertId, action } = await request.json();
    
    // In a real application, this would update the database
    const userAlerts = mockSafetyAlerts[userId] || [];
    const alertIndex = userAlerts.findIndex(alert => alert.id === alertId);
    
    if (alertIndex === -1) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }
    
    const alert = userAlerts[alertIndex];
    const now = new Date().toISOString();
    
    switch (action) {
      case 'mark_read':
        alert.isRead = true;
        alert.readAt = now;
        break;
      case 'mark_unread':
        alert.isRead = false;
        alert.readAt = undefined;
        break;
      case 'dismiss':
        alert.isDismissed = true;
        alert.dismissedAt = now;
        break;
      case 'undismiss':
        alert.isDismissed = false;
        alert.dismissedAt = undefined;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    userAlerts[alertIndex] = alert;
    mockSafetyAlerts[userId] = userAlerts;
    
    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error updating safety alert:', error);
    return NextResponse.json(
      { error: 'Failed to update safety alert' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const alertData = await request.json();
    
    // In a real application, this would save to a database
    const newAlert: SafetyAlert = {
      id: `alert-${Date.now()}`,
      userId,
      ...alertData,
      isRead: false,
      isDismissed: false,
      createdAt: new Date().toISOString()
    };
    
    if (!mockSafetyAlerts[userId]) {
      mockSafetyAlerts[userId] = [];
    }
    
    mockSafetyAlerts[userId].push(newAlert);
    
    return NextResponse.json(newAlert, { status: 201 });
  } catch (error) {
    console.error('Error creating safety alert:', error);
    return NextResponse.json(
      { error: 'Failed to create safety alert' },
      { status: 500 }
    );
  }
}