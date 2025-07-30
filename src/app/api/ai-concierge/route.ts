import { NextRequest, NextResponse } from 'next/server';
import { aiConcierge } from '../../../backend/services/aiConciergeService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userRole, ...params } = body;

    if (!userRole || !['student', 'teacher', 'admin'].includes(userRole)) {
      return NextResponse.json({ 
        error: 'Valid userRole (student, teacher, admin) is required' 
      }, { status: 400 });
    }

    switch (action) {
      case 'platform-help':
        const { userQuery, currentModule } = params;
        if (!userQuery) {
          return NextResponse.json({ error: 'userQuery is required' }, { status: 400 });
        }
        
        const helpResponse = await aiConcierge.providePlatformHelp(
          userQuery,
          userRole,
          currentModule
        );
        
        return NextResponse.json({ response: helpResponse });

      case 'module-guidance':
        const { module, specificQuestion } = params;
        if (!module) {
          return NextResponse.json({ error: 'module is required' }, { status: 400 });
        }
        
        const guidanceResponse = await aiConcierge.provideModuleGuidance(
          module,
          userRole,
          specificQuestion
        );
        
        return NextResponse.json({ response: guidanceResponse });

      case 'onboarding':
        const { isFirstTime = true } = params;
        
        const onboardingGuide = await aiConcierge.provideOnboardingGuidance(
          userRole,
          isFirstTime
        );
        
        return NextResponse.json(onboardingGuide);

      case 'troubleshooting':
        const { issue, module: troubleModule, errorDetails } = params;
        if (!issue) {
          return NextResponse.json({ error: 'issue is required' }, { status: 400 });
        }
        
        const troubleshootingHelp = await aiConcierge.provideTroubleshootingHelp(
          issue,
          userRole,
          troubleModule,
          errorDetails
        );
        
        return NextResponse.json(troubleshootingHelp);

      case 'feature-recommendations':
        const { userInterests, currentUsage } = params;
        
        const recommendations = await aiConcierge.recommendFeatures(
          userRole,
          userInterests,
          currentUsage
        );
        
        return NextResponse.json(recommendations);

      case 'navigation-help':
        const { searchQuery } = params;
        if (!searchQuery) {
          return NextResponse.json({ error: 'searchQuery is required' }, { status: 400 });
        }
        
        const navigationHelp = await aiConcierge.provideNavigationHelp(
          searchQuery,
          userRole
        );
        
        return NextResponse.json(navigationHelp);

      case 'performance-insights':
        const { performanceData } = params;
        if (!performanceData) {
          return NextResponse.json({ error: 'performanceData is required' }, { status: 400 });
        }
        
        const insights = await aiConcierge.providePerformanceInsights(
          userRole,
          performanceData
        );
        
        return NextResponse.json({ insights });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    // Only log in non-test environments to avoid test noise
    if (process.env.NODE_ENV !== 'test') {
      console.error('AI Concierge API error:', error);
    }
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const userRole = url.searchParams.get('userRole') as 'student' | 'teacher' | 'admin';

    if (!userRole || !['student', 'teacher', 'admin'].includes(userRole)) {
      return NextResponse.json({ 
        error: 'Valid userRole (student, teacher, admin) is required' 
      }, { status: 400 });
    }

    switch (action) {
      case 'onboarding':
        const isFirstTime = url.searchParams.get('isFirstTime') !== 'false';
        
        const onboardingGuide = await aiConcierge.provideOnboardingGuidance(
          userRole,
          isFirstTime
        );
        
        return NextResponse.json(onboardingGuide);

      case 'feature-recommendations':
        const interests = url.searchParams.get('interests')?.split(',') || [];
        const usage = url.searchParams.get('currentUsage')?.split(',') || [];
        
        const recommendations = await aiConcierge.recommendFeatures(
          userRole,
          interests.length > 0 ? interests : undefined,
          usage.length > 0 ? usage : undefined
        );
        
        return NextResponse.json(recommendations);

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use POST for most actions, GET only for onboarding and feature-recommendations' 
        }, { status: 400 });
    }
  } catch (error) {
    // Only log in non-test environments to avoid test noise
    if (process.env.NODE_ENV !== 'test') {
      console.error('AI Concierge API error:', error);
    }
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}