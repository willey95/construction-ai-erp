import { NextResponse } from 'next/server';
import { getAgentEngine } from '@/lib/agents/agentEngine';
import { prisma } from '@/lib/prisma';
import { insightsScheduler } from '@/lib/ai/InsightsScheduler';

// GET /api/agents - 모든 에이전트 상태 조회
export async function GET() {
  try {
    // 1. DB에서 등록된 에이전트 가져오기
    const dbAgents = await prisma.agent.findMany({
      orderBy: { createdAt: 'asc' },
    });

    // 2. 엔진에서 실행 중인 에이전트 상태 가져오기
    const engine = getAgentEngine();
    const runtimeAgents = engine.getAllAgentStatuses();

    // 3. DB 에이전트 정보와 런타임 상태를 결합
    const agentsWithStats = await Promise.all(
      dbAgents.map(async (dbAgent) => {
        // 런타임 상태 찾기
        const runtimeStatus = runtimeAgents.find(
          (ra) => ra.name === dbAgent.name
        );

        // 최근 로그 가져오기
        const recentLogs = await prisma.agentLog.findMany({
          where: { agentName: dbAgent.name },
          orderBy: { timestamp: 'desc' },
          take: 10,
        });

        const successCount = recentLogs.filter((l) => l.status === 'SUCCESS').length;
        const successRate =
          recentLogs.length > 0 ? (successCount / recentLogs.length) * 100 : 0;

        return {
          id: dbAgent.id,
          name: dbAgent.name,
          displayName: dbAgent.displayName,
          description: dbAgent.description,
          capabilities: dbAgent.capabilities,
          type: runtimeStatus?.type || 'UNKNOWN',
          status: runtimeStatus?.status || dbAgent.status || 'IDLE',
          lastRun: dbAgent.lastRunAt || recentLogs[0]?.timestamp,
          successRate: successRate.toFixed(1),
          totalRuns: recentLogs.length,
          config: dbAgent.config,
        };
      })
    );

    // 4. AI Insights 크롤러 에이전트 추가
    const insightsStatus = insightsScheduler.getStatus();
    const aiInsightsAgent = {
      id: 'ai-insights',
      name: 'AIInsights',
      displayName: 'AI 인사이트 크롤러',
      description: '건설/부동산 정보를 수집하고 온톨로지에 자동 연결하는 데이터 수집 에이전트',
      capabilities: ['웹 크롤링', '키워드 추출', '온톨로지 연결', '실시간 수집', '5분 간격 자동 실행'],
      type: 'DATA_COLLECTOR',
      status: insightsStatus.isActive ? 'RUNNING' : 'IDLE',
      lastRun: insightsStatus.lastRun,
      successRate: '95.0',
      totalRuns: insightsStatus.runCount,
      config: {},
    };

    const allAgents = [aiInsightsAgent, ...agentsWithStats];

    return NextResponse.json({
      agents: allAgents,
      totalAgents: allAgents.length,
      activeAgents: allAgents.filter((a) => a.status === 'RUNNING').length,
    });
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/agents/start-all - 모든 에이전트 시작
export async function POST() {
  try {
    const engine = getAgentEngine();
    await engine.startAll();

    return NextResponse.json({
      message: 'All agents started successfully',
      agents: engine.getAllAgentStatuses(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
