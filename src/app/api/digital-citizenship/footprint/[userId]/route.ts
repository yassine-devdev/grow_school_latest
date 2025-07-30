import { NextRequest, NextResponse } from 'next/server';
import { DigitalFootprintAnalysis, RiskLevel } from '@/types';

// Mock data for digital footprint analysis
const mockFootprintAnalysis: Record<string, DigitalFootprintAnalysis> = {
  'user-1': {
    id: 'analysis-1',
    userId: 'user-1',
    analysisDate: '2024-01-20T00:00:00Z',
    platforms: [
      {
        platform: 'Instagram',
        accountExists: true,
        privacyLevel: 'friends',
        dataShared: ['photos', 'location', 'contacts'],
        riskLevel: 'medium' as RiskLevel,
        lastActivity: '2024-01-19T00:00:00Z',
        recommendations: [
          'Disable location sharing',
          'Review tagged photos',
          'Limit contact sharing'
        ],
        settings: [
          {
            setting: 'Profile Visibility',
            currentValue: 'Friends',
            recommendedValue: 'Friends',
            riskLevel: 'low' as RiskLevel,
            description: 'Controls who can see your profile',
            howToChange: 'Go to Settings > Privacy > Account Privacy'
          },
          {
            setting: 'Location Services',
            currentValue: 'Enabled',
            recommendedValue: 'Disabled',
            riskLevel: 'high' as RiskLevel,
            description: 'Shares your location with posts',
            howToChange: 'Go to Settings > Privacy > Location Services'
          }
        ]
      },
      {
        platform: 'TikTok',
        accountExists: true,
        privacyLevel: 'public',
        dataShared: ['videos', 'likes', 'comments', 'location'],
        riskLevel: 'high' as RiskLevel,
        lastActivity: '2024-01-18T00:00:00Z',
        recommendations: [
          'Change account to private',
          'Disable location sharing',
          'Review comment settings'
        ],
        settings: [
          {
            setting: 'Account Privacy',
            currentValue: 'Public',
            recommendedValue: 'Private',
            riskLevel: 'high' as RiskLevel,
            description: 'Controls who can see your content',
            howToChange: 'Go to Settings > Privacy > Private Account'
          }
        ]
      },
      {
        platform: 'Discord',
        accountExists: true,
        privacyLevel: 'mixed',
        dataShared: ['messages', 'voice', 'activity'],
        riskLevel: 'medium' as RiskLevel,
        lastActivity: '2024-01-20T00:00:00Z',
        recommendations: [
          'Review server privacy settings',
          'Disable activity status',
          'Review friend requests'
        ],
        settings: [
          {
            setting: 'Activity Status',
            currentValue: 'Enabled',
            recommendedValue: 'Disabled',
            riskLevel: 'medium' as RiskLevel,
            description: 'Shows what games/apps you are using',
            howToChange: 'Go to Settings > Activity Privacy'
          }
        ]
      }
    ],
    overallRiskScore: 65,
    riskFactors: [
      {
        id: 'risk-1',
        type: 'privacy',
        severity: 'high' as RiskLevel,
        description: 'Public TikTok account exposes personal information',
        impact: 'Anyone can see your content and personal details',
        likelihood: 85,
        mitigation: [
          'Change account to private',
          'Review existing content',
          'Limit personal information in bio'
        ],
        relatedPlatforms: ['TikTok'],
        isAddressed: false
      },
      {
        id: 'risk-2',
        type: 'security',
        severity: 'medium' as RiskLevel,
        description: 'Location sharing enabled on multiple platforms',
        impact: 'Your location can be tracked by others',
        likelihood: 70,
        mitigation: [
          'Disable location services',
          'Remove location from existing posts',
          'Use location sharing selectively'
        ],
        relatedPlatforms: ['Instagram', 'TikTok'],
        isAddressed: false
      }
    ],
    recommendations: [
      {
        id: 'rec-1',
        priority: 'high',
        category: 'privacy',
        title: 'Make TikTok Account Private',
        description: 'Your TikTok account is currently public, allowing anyone to see your content',
        actionSteps: [
          'Open TikTok app',
          'Go to Profile tab',
          'Tap the menu (three lines)',
          'Select Settings and Privacy',
          'Tap Privacy',
          'Turn on Private Account'
        ],
        estimatedTime: 5,
        difficulty: 'easy',
        impact: 'high',
        isCompleted: false,
        resources: ['privacy-guide-1', 'tiktok-safety-2']
      },
      {
        id: 'rec-2',
        priority: 'medium',
        category: 'privacy',
        title: 'Disable Location Sharing',
        description: 'Multiple platforms are sharing your location data',
        actionSteps: [
          'Review location settings on each platform',
          'Disable location services for social media apps',
          'Remove location data from existing posts'
        ],
        estimatedTime: 15,
        difficulty: 'medium',
        impact: 'medium',
        isCompleted: false,
        resources: ['location-privacy-1']
      }
    ],
    privacyScore: 45,
    publicVisibility: 75,
    dataSharing: 80,
    improvements: [],
    nextAnalysisDate: '2024-02-20T00:00:00Z',
    isAutoGenerated: true,
    metadata: {
      analysisVersion: '1.0',
      platformsAnalyzed: 3,
      dataPoints: 25
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
    const analysis = mockFootprintAnalysis[userId];
    
    if (!analysis) {
      return NextResponse.json(
        { error: 'Digital footprint analysis not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error fetching digital footprint analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch digital footprint analysis' },
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
    
    // In a real application, this would trigger a new analysis
    // For now, we'll simulate creating a new analysis
    const newAnalysis: DigitalFootprintAnalysis = {
      id: `analysis-${Date.now()}`,
      userId,
      analysisDate: new Date().toISOString(),
      platforms: [],
      overallRiskScore: 50,
      riskFactors: [],
      recommendations: [],
      privacyScore: 50,
      publicVisibility: 50,
      dataSharing: 50,
      improvements: [],
      nextAnalysisDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      isAutoGenerated: false,
      metadata: {
        analysisVersion: '1.0',
        platformsAnalyzed: 0,
        dataPoints: 0
      }
    };
    
    mockFootprintAnalysis[userId] = newAnalysis;
    
    return NextResponse.json(newAnalysis, { status: 201 });
  } catch (error) {
    console.error('Error creating digital footprint analysis:', error);
    return NextResponse.json(
      { error: 'Failed to create digital footprint analysis' },
      { status: 500 }
    );
  }
}