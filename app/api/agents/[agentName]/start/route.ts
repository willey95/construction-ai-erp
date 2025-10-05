import { NextRequest, NextResponse } from 'next/server';
import { getAgentEngine } from '@/lib/agents/agentEngine';
import { insightsScheduler } from '@/lib/ai/InsightsScheduler';

export async function POST(
  request: NextRequest,
  { params }: { params: { agentName: string } }
) {
  try {
    const agentName = params.agentName;

    // AI Insights 에이전트는 별도의 스케줄러로 관리
    if (agentName === 'AIInsights' || agentName === 'DataCollector') {
      insightsScheduler.start();
      return NextResponse.json({
        message: `${agentName} started successfully`,
        status: 'RUNNING',
      });
    }

    // 일반 에이전트는 AgentEngine으로 관리
    const engine = getAgentEngine();
    const success = await engine.startAgent(agentName);

    if (success) {
      return NextResponse.json({
        message: `Agent ${agentName} started successfully`,
        status: 'RUNNING',
      });
    } else {
      return NextResponse.json(
        { error: `Agent ${agentName} not found` },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Error starting agent:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
