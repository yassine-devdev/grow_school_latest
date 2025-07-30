import { NextRequest, NextResponse } from 'next/server';
import { PersonalizedFeed, FeedItem } from '@/types';

// Mock data for personalized feeds
const mockPersonalizedFeeds: Record<string, PersonalizedFeed> = {
  'user-1': {
    userId: 'user-1',
    generatedAt: '2024-01-22T08:00:00Z',
    expiresAt: '2024-01-22T20:00:00Z',
    items: [
      {
        id: 'feed-item-1',
        type: 'opportunity',
        contentId: 'opportunity-1',
        relevanceScore: 92,
        reasonsForRecommendation: [
          'Matches your interest in Computer Science',
          'Perfect for your grade level',
          'Located in your preferred region'
        ],
        personalizedTitle: 'Google Summer of Code - Perfect Match for You!',
        personalizedSummary: 'Based on your coding projects and CS interests, this internship opportunity could be ideal for your career development.',
        urgencyLevel: 'high',
        position: 1,
        isPromoted: true
      },
      {
        id: 'feed-item-2',
        type: 'news',
        contentId: 'news-1',
        relevanceScore: 88,
        reasonsForRecommendation: [
          'Related to your STEM interests',
          'Trending in your school',
          'Matches your reading preferences'
        ],
        urgencyLevel: 'medium',
        position: 2,
        isPromoted: false
      },
      {
        id: 'feed-item-3',
        type: 'opportunity',
        contentId: 'opportunity-2',
        relevanceScore: 85,
        reasonsForRecommendation: [
          'Scholarship opportunity in your field',
          'Deadline approaching soon',
          'High success rate for students like you'
        ],
        urgencyLevel: 'critical',
        position: 3,
        isPromoted: false
      },
      {
        id: 'feed-item-4',
        type: 'news',
        contentId: 'news-2',
        relevanceScore: 82,
        reasonsForRecommendation: [
          'Popular among your peers',
          'Related to your extracurricular activities',
          'Educational content you enjoy'
        ],
        urgencyLevel: 'low',
        position: 4,
        isPromoted: false,
        bookmarkedAt: '2024-01-21T15:30:00Z'
      },
      {
        id: 'feed-item-5',
        type: 'opportunity',
        contentId: 'opportunity-3',
        relevanceScore: 79,
        reasonsForRecommendation: [
          'Research opportunity in your area of interest',
          'Matches your academic performance',
          'Good stepping stone for college applications'
        ],
        urgencyLevel: 'medium',
        position: 5,
        isPromoted: false
      }
    ],
    metadata: {
      totalItems: 5,
      algorithmVersion: '2.1.0',
      personalizationScore: 87,
      diversityScore: 73,
      freshnessScore: 91
    }
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';
    
    // In a real application, this would generate or fetch from a database
    let feed = mockPersonalizedFeeds[userId];
    
    if (!feed || refresh) {
      // Generate new personalized feed
      feed = {
        userId,
        generatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
        items: [
          {
            id: `feed-item-${Date.now()}-1`,
            type: 'opportunity',
            contentId: 'opportunity-1',
            relevanceScore: Math.floor(Math.random() * 20) + 80, // 80-100
            reasonsForRecommendation: [
              'Matches your interests',
              'Perfect timing',
              'High success rate'
            ],
            urgencyLevel: 'high',
            position: 1,
            isPromoted: Math.random() > 0.7
          },
          {
            id: `feed-item-${Date.now()}-2`,
            type: 'news',
            contentId: 'news-1',
            relevanceScore: Math.floor(Math.random() * 20) + 70, // 70-90
            reasonsForRecommendation: [
              'Trending topic',
              'Related to your field',
              'Popular with peers'
            ],
            urgencyLevel: 'medium',
            position: 2,
            isPromoted: false
          }
        ],
        metadata: {
          totalItems: 2,
          algorithmVersion: '2.1.0',
          personalizationScore: Math.floor(Math.random() * 20) + 80,
          diversityScore: Math.floor(Math.random() * 30) + 70,
          freshnessScore: Math.floor(Math.random() * 20) + 80
        }
      };
      
      mockPersonalizedFeeds[userId] = feed;
    }
    
    return NextResponse.json(feed);
  } catch (error) {
    console.error('Error fetching personalized feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personalized feed' },
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
    const { action, itemId, feedback } = await request.json();
    
    // In a real application, this would update user behavior data
    const feed = mockPersonalizedFeeds[userId];
    if (!feed) {
      return NextResponse.json(
        { error: 'Feed not found' },
        { status: 404 }
      );
    }
    
    const item = feed.items.find(item => item.id === itemId);
    if (!item) {
      return NextResponse.json(
        { error: 'Feed item not found' },
        { status: 404 }
      );
    }
    
    const now = new Date().toISOString();
    
    switch (action) {
      case 'view':
        item.seenAt = now;
        break;
      case 'click':
        item.clickedAt = now;
        break;
      case 'bookmark':
        item.bookmarkedAt = now;
        break;
      case 'dismiss':
        item.dismissedAt = now;
        break;
      case 'apply':
        item.appliedAt = now;
        break;
      case 'feedback':
        // Store feedback for algorithm improvement
        break;
    }
    
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Error updating feed interaction:', error);
    return NextResponse.json(
      { error: 'Failed to update feed interaction' },
      { status: 500 }
    );
  }
}