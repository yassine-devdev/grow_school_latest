import { NextRequest, NextResponse } from 'next/server';
import { NewsArticle, NewsCategory } from '@/types';

// Mock data for news articles
const mockNewsArticles: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Revolutionary AI Breakthrough in Medical Diagnosis',
    summary: 'Researchers at Stanford University have developed an AI system that can diagnose rare diseases with 95% accuracy, potentially transforming healthcare.',
    content: 'A groundbreaking artificial intelligence system developed by researchers at Stanford University has achieved a remarkable 95% accuracy rate in diagnosing rare diseases, marking a significant milestone in medical technology. The system, called MedAI, uses advanced machine learning algorithms to analyze patient symptoms, medical history, and diagnostic test results to identify conditions that often take months or years for human doctors to diagnose correctly...',
    category: 'science' as NewsCategory,
    tags: ['AI', 'Healthcare', 'Medical Research', 'Stanford', 'Diagnosis'],
    author: 'Dr. Sarah Chen',
    authorType: 'external',
    source: 'external',
    sourceUrl: 'https://example.com/ai-medical-breakthrough',
    imageUrl: '/images/ai-medical-research.jpg',
    publishedAt: '2024-01-21T14:30:00Z',
    targetAudience: {
      roles: ['student', 'teacher'],
      ageGroups: [{ min: 14, max: 18 }],
      interests: ['science', 'technology', 'healthcare'],
      academicLevels: ['high school', 'college']
    },
    relevanceFactors: {
      interests: ['STEM', 'Healthcare', 'Technology'],
      academicSubjects: ['Biology', 'Computer Science', 'Health Sciences'],
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
    title: 'New Scholarship Program Launches for Underrepresented Students in STEM',
    summary: 'The National Science Foundation announces a $50 million scholarship program aimed at increasing diversity in science, technology, engineering, and mathematics fields.',
    content: 'The National Science Foundation (NSF) has unveiled an ambitious $50 million scholarship program designed to support underrepresented students pursuing careers in science, technology, engineering, and mathematics (STEM). The program, called "STEM Futures," will provide financial assistance, mentorship, and research opportunities to students from diverse backgrounds who have historically been underrepresented in STEM fields...',
    category: 'scholarship' as NewsCategory,
    tags: ['Scholarship', 'STEM', 'Diversity', 'NSF', 'Education'],
    author: 'Maria Rodriguez',
    authorType: 'staff',
    source: 'internal',
    imageUrl: '/images/stem-scholarship.jpg',
    publishedAt: '2024-01-20T10:15:00Z',
    targetAudience: {
      roles: ['student', 'parent'],
      ageGroups: [{ min: 16, max: 22 }],
      interests: ['scholarship', 'STEM', 'education'],
      academicLevels: ['high school', 'college']
    },
    relevanceFactors: {
      interests: ['STEM', 'Scholarships', 'Education'],
      academicSubjects: ['Science', 'Technology', 'Engineering', 'Mathematics'],
      careerPaths: ['STEM Careers', 'Research', 'Engineering'],
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
  },
  {
    id: 'news-3',
    title: 'Climate Change Research Opportunities for High School Students',
    summary: 'Universities across the country are opening their climate research labs to high school students, offering hands-on experience in environmental science.',
    content: 'A growing number of universities are recognizing the importance of engaging young minds in climate change research by opening their doors to high school students. These programs offer unprecedented opportunities for students to work alongside leading researchers, contribute to meaningful scientific studies, and gain valuable experience in environmental science and sustainability...',
    category: 'research' as NewsCategory,
    tags: ['Climate Change', 'Research', 'High School', 'Environmental Science', 'Universities'],
    author: 'Dr. James Wilson',
    authorType: 'external',
    source: 'partner',
    sourceUrl: 'https://example.com/climate-research-students',
    imageUrl: '/images/climate-research.jpg',
    publishedAt: '2024-01-19T16:45:00Z',
    targetAudience: {
      roles: ['student', 'teacher'],
      ageGroups: [{ min: 15, max: 18 }],
      interests: ['research', 'environmental science', 'climate'],
      academicLevels: ['high school']
    },
    relevanceFactors: {
      interests: ['Environmental Science', 'Research', 'Climate Change'],
      academicSubjects: ['Environmental Science', 'Biology', 'Chemistry'],
      careerPaths: ['Environmental Science', 'Research', 'Sustainability'],
      timeRelevance: 'timely'
    },
    engagement: {
      views: 1923,
      likes: 287,
      shares: 76,
      comments: 34,
      bookmarks: 198
    },
    isPromoted: false,
    isActive: true,
    createdAt: '2024-01-19T16:45:00Z',
    updatedAt: '2024-01-19T16:45:00Z'
  },
  {
    id: 'news-4',
    title: 'Virtual Reality Transforms Art Education in Schools',
    summary: 'Schools nationwide are adopting VR technology to give students immersive experiences in art history and creative expression.',
    content: 'Virtual reality technology is revolutionizing art education in schools across the nation, providing students with immersive experiences that were previously impossible in traditional classrooms. Students can now walk through the Louvre, examine Renaissance masterpieces up close, and even create three-dimensional art in virtual spaces...',
    category: 'arts' as NewsCategory,
    tags: ['Virtual Reality', 'Art Education', 'Technology', 'Schools', 'Innovation'],
    author: 'Lisa Thompson',
    authorType: 'staff',
    source: 'internal',
    imageUrl: '/images/vr-art-education.jpg',
    publishedAt: '2024-01-18T13:20:00Z',
    targetAudience: {
      roles: ['student', 'teacher'],
      ageGroups: [{ min: 12, max: 18 }],
      interests: ['arts', 'technology', 'education'],
      academicLevels: ['middle school', 'high school']
    },
    relevanceFactors: {
      interests: ['Arts', 'Technology', 'Education'],
      academicSubjects: ['Art', 'Technology', 'Digital Media'],
      careerPaths: ['Arts', 'Technology', 'Education'],
      timeRelevance: 'timely'
    },
    engagement: {
      views: 3156,
      likes: 421,
      shares: 134,
      comments: 67,
      bookmarks: 289
    },
    isPromoted: false,
    isActive: true,
    createdAt: '2024-01-18T13:20:00Z',
    updatedAt: '2024-01-18T13:20:00Z'
  },
  {
    id: 'news-5',
    title: 'International Student Exchange Programs Expand Post-Pandemic',
    summary: 'After years of limited travel, international student exchange programs are experiencing unprecedented growth and new opportunities.',
    content: 'The global education landscape is witnessing a remarkable resurgence in international student exchange programs as travel restrictions ease and institutions adapt to new safety protocols. Universities and high schools worldwide are reporting record applications for exchange programs, with students eager to experience different cultures and educational systems...',
    category: 'cultural' as NewsCategory,
    tags: ['International Exchange', 'Study Abroad', 'Cultural Exchange', 'Education', 'Travel'],
    author: 'Michael Chang',
    authorType: 'external',
    source: 'external',
    sourceUrl: 'https://example.com/international-exchange-growth',
    imageUrl: '/images/international-exchange.jpg',
    publishedAt: '2024-01-17T11:30:00Z',
    targetAudience: {
      roles: ['student', 'parent'],
      ageGroups: [{ min: 16, max: 22 }],
      interests: ['cultural exchange', 'travel', 'international'],
      academicLevels: ['high school', 'college']
    },
    relevanceFactors: {
      interests: ['Cultural Exchange', 'International Experience', 'Travel'],
      academicSubjects: ['Foreign Languages', 'Cultural Studies', 'International Relations'],
      careerPaths: ['International Business', 'Diplomacy', 'Cultural Studies'],
      timeRelevance: 'timely'
    },
    engagement: {
      views: 2734,
      likes: 356,
      shares: 98,
      comments: 45,
      bookmarks: 234
    },
    isPromoted: false,
    isActive: true,
    createdAt: '2024-01-17T11:30:00Z',
    updatedAt: '2024-01-17T11:30:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category') as NewsCategory;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    let filteredArticles = mockNewsArticles.filter(article => article.isActive);
    
    // Filter by category if specified
    if (category) {
      filteredArticles = filteredArticles.filter(article => 
        article.category === category
      );
    }
    
    // In a real application, this would personalize based on user preferences
    if (userId) {
      // Sort by relevance for the user (simplified)
      filteredArticles.sort((a, b) => {
        // Prioritize promoted content
        if (a.isPromoted !== b.isPromoted) {
          return a.isPromoted ? -1 : 1;
        }
        
        // Then by engagement
        const engagementA = a.engagement.views + a.engagement.likes * 2 + a.engagement.shares * 3;
        const engagementB = b.engagement.views + b.engagement.likes * 2 + b.engagement.shares * 3;
        
        if (engagementA !== engagementB) {
          return engagementB - engagementA;
        }
        
        // Finally by recency
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
    } else {
      // Sort by publication date for non-personalized requests
      filteredArticles.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }
    
    // Apply pagination
    const paginatedArticles = filteredArticles.slice(offset, offset + limit);
    
    return NextResponse.json({
      articles: paginatedArticles,
      total: filteredArticles.length,
      hasMore: offset + limit < filteredArticles.length
    });
  } catch (error) {
    console.error('Error fetching news articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const articleData = await request.json();
    
    // In a real application, this would save to a database
    const newArticle: NewsArticle = {
      id: `news-${Date.now()}`,
      ...articleData,
      engagement: {
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        bookmarks: 0
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockNewsArticles.push(newArticle);
    
    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error('Error creating news article:', error);
    return NextResponse.json(
      { error: 'Failed to create news article' },
      { status: 500 }
    );
  }
}