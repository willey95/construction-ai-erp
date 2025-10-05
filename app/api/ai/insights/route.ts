import { NextRequest, NextResponse } from 'next/server';
import { insightsScheduler } from '@/lib/ai/InsightsScheduler';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/ai/insights - 인사이트 목록 및 스케줄러 상태 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    // 스케줄러 상태 조회
    if (action === 'status') {
      const status = insightsScheduler.getStatus();
      return NextResponse.json({ status });
    }

    // 최근 인사이트 조회
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');

    const where: any = {
      entityType: 'CONCEPT',
      source: 'ai_crawler',
    };

    if (category) {
      where.properties = {
        path: ['category'],
        equals: category,
      };
    }

    const insights = await prisma.ontologyEntity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        outgoingRelations: {
          include: {
            toEntity: true,
          },
          take: 5,
        },
      },
    });

    // 인사이트 통계
    const stats = {
      total: await prisma.ontologyEntity.count({
        where: {
          entityType: 'CONCEPT',
          source: 'ai_crawler',
        },
      }),
      byCategory: await prisma.ontologyEntity.groupBy({
        by: ['properties'],
        where: {
          entityType: 'CONCEPT',
          source: 'ai_crawler',
        },
        _count: true,
      }),
    };

    return NextResponse.json({
      insights,
      stats,
      schedulerStatus: insightsScheduler.getStatus(),
    });
  } catch (error: any) {
    console.error('Failed to fetch insights:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/ai/insights - 스케줄러 제어 및 수동 실행
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'start':
        insightsScheduler.start();
        return NextResponse.json({
          success: true,
          message: '스케줄러가 시작되었습니다',
          status: insightsScheduler.getStatus(),
        });

      case 'stop':
        insightsScheduler.stop();
        return NextResponse.json({
          success: true,
          message: '스케줄러가 중지되었습니다',
          status: insightsScheduler.getStatus(),
        });

      case 'run_now':
        await insightsScheduler.runNow();
        return NextResponse.json({
          success: true,
          message: '크롤링이 완료되었습니다',
          status: insightsScheduler.getStatus(),
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Insights scheduler action failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
