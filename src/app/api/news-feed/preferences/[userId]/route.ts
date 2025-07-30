import { NextRequest, NextResponse } from 'next/server';
import { NotificationPreferences, NewsCategory, OpportunityType } from '@/types';

// Mock data for notification preferences
const mockNotificationPreferences: Record<string, NotificationPreferences> = {
  'user-1': {
    email: {
      enabled: true,
      frequency: 'daily',
      categories: ['scholarship', 'internship', 'academic', 'career'],
      opportunityTypes: ['scholarship', 'internship', 'job', 'research']
    },
    push: {
      enabled: true,
      frequency: 'immediate',
      categories: ['scholarship', 'internship'],
      opportunityTypes: ['scholarship', 'internship']
    },
    inApp: {
      enabled: true,
      categories: ['academic', 'career', 'scholarship', 'internship', 'competition'],
      opportunityTypes: ['scholarship', 'internship', 'competition', 'research']
    },
    digest: {
      enabled: true,
      frequency: 'weekly',
      maxItems: 10,
      includeNews: true,
      includeOpportunities: true
    },
    urgentAlerts: {
      enabled: true,
      deadlineThreshold: 7, // 7 days before deadline
      relevanceThreshold: 80 // minimum 80% relevance score
    }
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    // In a real application, this would fetch from a database
    let preferences = mockNotificationPreferences[userId];
    
    if (!preferences) {
      // Return default preferences for new users
      preferences = {
        email: {
          enabled: false,
          frequency: 'weekly',
          categories: [],
          opportunityTypes: []
        },
        push: {
          enabled: false,
          frequency: 'daily',
          categories: [],
          opportunityTypes: []
        },
        inApp: {
          enabled: true,
          categories: ['academic', 'career'],
          opportunityTypes: ['scholarship', 'internship']
        },
        digest: {
          enabled: true,
          frequency: 'weekly',
          maxItems: 5,
          includeNews: true,
          includeOpportunities: true
        },
        urgentAlerts: {
          enabled: true,
          deadlineThreshold: 3,
          relevanceThreshold: 70
        }
      };
      
      mockNotificationPreferences[userId] = preferences;
    }
    
    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
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
    const updates = await request.json();
    
    // In a real application, this would update the database
    const currentPreferences = mockNotificationPreferences[userId] || {
      email: { enabled: false, frequency: 'weekly', categories: [], opportunityTypes: [] },
      push: { enabled: false, frequency: 'daily', categories: [], opportunityTypes: [] },
      inApp: { enabled: true, categories: [], opportunityTypes: [] },
      digest: { enabled: true, frequency: 'weekly', maxItems: 5, includeNews: true, includeOpportunities: true },
      urgentAlerts: { enabled: true, deadlineThreshold: 3, relevanceThreshold: 70 }
    };
    
    // Merge updates with current preferences
    const updatedPreferences: NotificationPreferences = {
      email: { ...currentPreferences.email, ...updates.email },
      push: { ...currentPreferences.push, ...updates.push },
      inApp: { ...currentPreferences.inApp, ...updates.inApp },
      digest: { ...currentPreferences.digest, ...updates.digest },
      urgentAlerts: { ...currentPreferences.urgentAlerts, ...updates.urgentAlerts }
    };
    
    mockNotificationPreferences[userId] = updatedPreferences;
    
    return NextResponse.json(updatedPreferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
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
    const { action, category, opportunityType } = await request.json();
    
    // Handle quick preference updates
    const preferences = mockNotificationPreferences[userId];
    if (!preferences) {
      return NextResponse.json(
        { error: 'User preferences not found' },
        { status: 404 }
      );
    }
    
    switch (action) {
      case 'subscribe_category':
        if (category && !preferences.inApp.categories.includes(category)) {
          preferences.inApp.categories.push(category);
        }
        break;
      case 'unsubscribe_category':
        if (category) {
          preferences.inApp.categories = preferences.inApp.categories.filter(c => c !== category);
        }
        break;
      case 'subscribe_opportunity_type':
        if (opportunityType && !preferences.inApp.opportunityTypes.includes(opportunityType)) {
          preferences.inApp.opportunityTypes.push(opportunityType);
        }
        break;
      case 'unsubscribe_opportunity_type':
        if (opportunityType) {
          preferences.inApp.opportunityTypes = preferences.inApp.opportunityTypes.filter(t => t !== opportunityType);
        }
        break;
      case 'enable_urgent_alerts':
        preferences.urgentAlerts.enabled = true;
        break;
      case 'disable_urgent_alerts':
        preferences.urgentAlerts.enabled = false;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error updating preference action:', error);
    return NextResponse.json(
      { error: 'Failed to update preference action' },
      { status: 500 }
    );
  }
}