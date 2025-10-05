import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/energy/alerts - 알림 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('active') === 'true';

    const alerts = await prisma.energyAlert.findMany({
      where: activeOnly ? { isResolved: false } : undefined,
      include: {
        plant: {
          select: {
            plantName: true,
            plantCode: true,
            plantType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const formattedAlerts = alerts.map((alert) => ({
      id: alert.id,
      plantId: alert.plantId,
      plantName: alert.plant.plantName,
      plantCode: alert.plant.plantCode,
      plantType: alert.plant.plantType,
      alertType: alert.alertType,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      metrics: alert.metrics,
      isResolved: alert.isResolved,
      resolvedAt: alert.resolvedAt,
      resolvedBy: alert.resolvedBy,
      createdAt: alert.createdAt.toISOString(),
    }));

    return NextResponse.json({
      alerts: formattedAlerts,
      total: formattedAlerts.length,
    });
  } catch (error: any) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/energy/alerts - 알림 생성
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const alert = await prisma.energyAlert.create({
      data: {
        plantId: body.plantId,
        alertType: body.alertType,
        severity: body.severity,
        title: body.title,
        message: body.message,
        metrics: body.metrics,
      },
      include: {
        plant: {
          select: {
            plantName: true,
          },
        },
      },
    });

    return NextResponse.json({
      alert: {
        ...alert,
        plantName: alert.plant.plantName,
      },
    });
  } catch (error: any) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/energy/alerts - 알림 해결
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, resolvedBy } = body;

    const alert = await prisma.energyAlert.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy,
      },
    });

    return NextResponse.json({ alert });
  } catch (error: any) {
    console.error('Error resolving alert:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
