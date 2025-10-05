import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/agents/tasks - 작업 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const agentName = searchParams.get('agentName');
    const limit = parseInt(searchParams.get('limit') || '100');

    const where: any = {};
    if (status) where.status = status;
    if (agentName) where.agentName = agentName;

    const tasks = await prisma.agentTask.findMany({
      where,
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' },
      ],
      take: Math.min(limit, 500),
    });

    const stats = {
      pending: tasks.filter(t => t.status === 'PENDING').length,
      running: tasks.filter(t => t.status === 'RUNNING').length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
      failed: tasks.filter(t => t.status === 'FAILED').length,
    };

    return NextResponse.json({ tasks, stats, count: tasks.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
