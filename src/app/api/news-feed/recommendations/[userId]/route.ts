import { NextRequest, NextResponse } from 'next/server';
import { NewsRecommendation, NewsArticle } from '@/types';

// Mock function to calculate news recommendations for a user
function calculateNewsRecommendation(article: NewsArticle, userProfile: any): NewsRecommendation {
  // Simplified recommendation algorithm
  const interestMatch = Math.floor(Math.random() * 30) + 70; // 70-100
  const recencyBoost = Math.max(0, 100 - Math.floor((Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60 * 24)) * 2); // Decay over days
  const popularityBoost = Math.min(100, Math.floor(article.engagement.views / 100) + Math.floor(article.engagement.likes / 10));
  const diversityFactor = Math.floor(Math.random() * 20) + 80; // 80-100

  const relevanceScore = Math.round(
    (interestMatch * 0.4) +
    (recencyBoost * 0.2) +
    (popularityBoost * 0.2) +
    (diversityFactor * 0.2)
  );

  // Estimate reading time (average 200 words per minute)
  const wordCount = article.content.split(' ').length;
  const readingTime = Math.ceil(wordCount / 200);

  // Generate related content IDs (mock)
  const relatedContent = ['news-2', 'news-3', 'opportunity-1'].filter(id => id !== article.id);

  // Generate follow-up actions based on article type and content
  const followUpActions = [
    { type: 'bookmark' as const, label: 'Save for later' },
    { type: 'share' as const, label: 'Share with friends' }
  ];

  if (article.category === 'scholarship' || article.category === 'internship') {
    followUpActions.push({ 
      type: 'apply' as const, 
      label: 'View opportunities',
      url: '/opportunities'
    });
  }

  if (article.category === 'research' || article.category === 'academic') {
    followUpActions.push({ 
      type: 'learn_more' as const, 
      label: 'Explore research',
      url: '/research'
    });
  }

  followUpActions.push({ 
    type: 'discuss' as const, 
    label: 'Join discussion',
    url: `/news/${article.id}/discussion`
  });

  return {
    article,
    relevanceScore,
    relevanceFactors: {
      interestMatch,
      recencyBoost,
      popularityBoost,
      diversityFactor,
      personalizedFactors: {
        categoryPreference: Math.floor(Math.random() * 20) + 80,
        authorFamiliarity: Math.floor(Math.random() * 30) + 50,
        topicExpertise: Math.floor(Math.random() * 40) + 60
      }
    },
    readingTime,
    relatedContent,
    followUpActions
  };
}

// Mock data for news recommendations
const mockNewsRecommendations: Record<string, NewsRecommendation[]> = {};

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // In a real application, this would fetch user profile and calculate recommendations
    // For now, we'll generate mock recommendations
    
    if (!mockNewsRecommendations[userId]) {
      // Mock news articles for recommendations
      const mockArticles: NewsArticle[] = [
        {
          id: 'news-1',
          title: 'Revolutionary AI Breakthrough in Medical Diagnosis',
          summary: 'Researchers develop AI system with 95% accuracy in diagnosing rare diseases',
          content: 'A groundbreaking artificial intelligence system developed by researchers at Stanford University has achieved a remarkable 95% accuracy rate in diagnosing rare diseases. The system uses advanced machine learning algorithms to analyze patient symptoms, medical history, and diagnostic test results. This breakthrough could significantly reduce the time it takes to diagnose rare conditions, which often take months or years for human doctors to identify correctly. The AI system, called MedAI, has been trained on millions of medical records and case studies from around the world.',
          category: 'science',
          tags: ['AI', 'Healthcare', 'Medical Research'],
          author: 'Dr. Sarah Chen',
          authorType: 'external',
          source: 'external',
          sourceUrl: 'https://example.com/ai-medical-breakthrough',
          imageUrl: '/images/ai-medical-research.jpg',
          publishedAt: '2024-01-21T14:30:00Z',
          targetAudience: {
            roles: ['student', 'teacher'],
            ageGroups: [{ min: 14, max: 18 }],
            interests: ['science', 'technology', 'healthcare']
          },
          relevanceFactors: {
            interests: ['STEM', 'Healthcare', 'Technology'],
            academicSubjects: ['Biology', 'Computer Science'],
            careerPaths: ['Medicine', 'Research', 'Technology'],
            timeRelevance: 'timely'
          },
          engagement: {
            views: 2847,
            likes: 342,
            shares: 89,
            comments: 56,
            bookmarks: 127
          },
          isPromoted: false,
          isActive: true,
          createdAt: '2024-01-21T14:30:00Z',
          updatedAt: '2024-01-21T14:30:00Z'
        },
        {
          id: 'news-2',
          title: 'New Scholarship Program for STEM Students',
          summary: '$50 million program supports underrepresented students in STEM fields',
          content: 'The National Science Foundation has unveiled an ambitious $50 million scholarship program designed to support underrepresented students pursuing careers in science, technology, engineering, and mathematics. The program, called "STEM Futures," will provide financial assistance, mentorship, and research opportunities to students from diverse backgrounds who have historically been underrepresented in STEM fields. Applications are now open for the fall 2024 semester, with awards ranging from $5,000 to $15,000 per year.',
          category: 'scholarship',
          tags: ['Scholarship', 'STEM', 'Diversity'],
          author: 'Maria Rodriguez',
          authorType: 'staff',
          source: 'internal',
          imageUrl: '/images/stem-scholarship.jpg',
          publishedAt: '2024-01-20T10:15:00Z',
          targetAudience: {
            roles: ['student', 'parent'],
            ageGroups: [{ min: 16, max: 22 }],
            interests: ['scholarship', 'STEM']
          },
          relevanceFactors: {
            interests: ['STEM', 'Scholarships'],
            academicSubjects: ['Science', 'Technology', 'Engineering', 'Mathematics'],
            careerPaths: ['STEM Careers'],
            timeRelevance: 'urgent'
          },
          engagement: {
            views: 4521,
            likes: 678,
            shares: 234,
            comments: 89,
            bookmarks: 456
          },
          isPromoted: true,
          promotionWeight: 0.8,
          isActive: true,
          createdAt: '2024-01-20T10:15:00Z',
          updatedAt: '2024-01-20T10:15:00Z'
        }
      ];

      // Calculate recommendations for each article
      const userProfile = { /* mock user profile */ };
      mockNewsRecommendations[userId] = mockArticles
        .map(article => calculateNewsRecommendation(article, userProfile))
        .filter(rec => category ? rec.article.category === category : true)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    }
    
    let recommendations = mockNewsRecommendations[userId];
    
    // Filter by category if specified
    if (category) {
      recommendations = recommendations.filter(rec => rec.article.category === category);
    }
    
    // Apply limit
    recommendations = recommendations.slice(0, limit);
    
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error fetching news recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news recommendations' },
      { status: 500 }
    );
  }
}