import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAgentEngine } from '@/lib/agents/agentEngine';
import { insightsScheduler } from '@/lib/ai/InsightsScheduler';

// GET /api/agents/[agentName] - 특정 에이전트 상세 정보
export async function GET(
  request: NextRequest,
  { params }: { params: { agentName: string } }
) {
  try {
    const agentName = params.agentName;

    // AI Insights 에이전트의 경우
    if (agentName === 'AIInsights' || agentName === 'DataCollector') {
      const status = insightsScheduler.getStatus();
      const insights = await prisma.ontologyEntity.findMany({
        where: { entityType: 'CONCEPT', source: 'ai_crawler' },
        include: {
          outgoingRelations: {
            include: { toEntity: true },
          },
        },
        take: 20,
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        agent: {
          name: agentName,
          displayName: 'AI 인사이트 크롤러',
          description: '건설/부동산 정보를 수집하고 온톨로지에 자동 연결',
          type: 'DATA_COLLECTOR',
          status: status.isActive ? 'RUNNING' : 'IDLE',
          lastRun: status.lastRun,
          totalRuns: status.runCount,
          successRate: '95.0',
          capabilities: ['웹 크롤링', '키워드 추출', '온톨로지 연결', '실시간 수집'],
        },
        details: {
          scheduler: status,
          recentInsights: insights.slice(0, 10),
          stats: {
            totalInsights: insights.length,
            totalEntities: status.stats.totalEntities,
            totalRelations: status.stats.totalRelations,
          },
        },
      });
    }

    // 일반 에이전트의 경우
    const dbAgent = await prisma.agent.findFirst({
      where: { name: agentName },
    });

    if (!dbAgent) {
      return NextResponse.json(
        { error: `Agent ${agentName} not found` },
        { status: 404 }
      );
    }

    const engine = getAgentEngine();
    const runtimeStatus = engine.getAgentStatus(agentName);

    // 최근 로그
    const logs = await prisma.agentLog.findMany({
      where: { agentName },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    // 최근 작업
    const tasks = await prisma.agentTask.findMany({
      where: { agentName },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const successCount = logs.filter((l) => l.status === 'SUCCESS').length;
    const successRate = logs.length > 0 ? (successCount / logs.length) * 100 : 0;

    return NextResponse.json({
      agent: {
        id: dbAgent.id,
        name: dbAgent.name,
        displayName: dbAgent.displayName,
        description: dbAgent.description,
        capabilities: dbAgent.capabilities,
        type: runtimeStatus?.type || 'UNKNOWN',
        status: runtimeStatus?.status || dbAgent.status || 'IDLE',
        lastRun: dbAgent.lastRunAt || logs[0]?.timestamp,
        successRate: successRate.toFixed(1),
        totalRuns: logs.length,
        config: dbAgent.config,
      },
      details: {
        recentLogs: logs.slice(0, 20),
        recentTasks: tasks.slice(0, 10),
        performance: {
          successRate,
          avgDuration: logs.reduce((sum, l) => sum + (l.duration || 0), 0) / logs.length || 0,
          totalOperations: logs.length,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching agent details:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
