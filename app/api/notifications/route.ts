import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const userId = searchParams.get('userId');
    const severity = searchParams.get('severity');
    const isRead = searchParams.get('isRead');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {
      isArchived: false,
    };

    if (projectId) where.projectId = projectId;
    if (userId) where.userId = userId;
    if (severity) where.severity = severity;
    if (isRead !== null) where.isRead = isRead === 'true';

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        project: {
          select: {
            projectCode: true,
            projectName: true,
          },
        },
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('알림 조회 실패:', error);
    return NextResponse.json({ error: '알림 조회 실패' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const notification = await prisma.notification.create({
      data: {
        projectId: body.projectId,
        userId: body.userId,
        severity: body.severity,
        category: body.category,
        title: body.title,
        message: body.message,
        metrics: body.metrics || {},
        actionRequired: body.actionRequired || false,
        agentName: body.agentName,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('알림 생성 실패:', error);
    return NextResponse.json({ error: '알림 생성 실패' }, { status: 500 });
  }
}
