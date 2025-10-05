import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/agents/logs - 에이전트 로그 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const agentName = searchParams.get('agentName');
    const status = searchParams.get('status');

    const where: any = {};
    if (agentName) where.agentName = agentName;
    if (status) where.status = status;

    const logs = await prisma.agentLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: Math.min(limit, 1000),
    });

    return NextResponse.json({ logs, count: logs.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
