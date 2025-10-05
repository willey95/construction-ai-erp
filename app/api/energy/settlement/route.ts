import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const settlements = await prisma.energySettlement.findMany({
      include: {
        plant: {
          select: {
            plantName: true,
            plantType: true,
            region: true,
          },
        },
      },
      orderBy: {
        settlementMonth: 'desc',
      },
    });

    // Serialize Decimal types
    const serialized = settlements.map(settlement => ({
      ...settlement,
      smpRevenue: Number(settlement.smpRevenue),
      recRevenue: Number(settlement.recRevenue),
      incentive: Number(settlement.incentive),
      totalRevenue: Number(settlement.totalRevenue),
      operationCost: Number(settlement.operationCost),
      maintenanceCost: Number(settlement.maintenanceCost),
      totalCost: Number(settlement.totalCost),
      netProfit: Number(settlement.netProfit),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Failed to fetch settlements:', error);
    return NextResponse.json({ error: 'Failed to fetch settlements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const settlement = await prisma.energySettlement.create({
      data: {
        plantId: body.plantId,
        settlementMonth: new Date(body.settlementMonth),
        smpRevenue: body.smpRevenue,
        recRevenue: body.recRevenue,
        incentive: body.incentive || 0,
        totalRevenue: body.totalRevenue,
        operationCost: body.operationCost,
        maintenanceCost: body.maintenanceCost,
        totalCost: body.totalCost,
        netProfit: body.netProfit,
        status: body.status || 'PENDING',
      },
    });

    return NextResponse.json(settlement, { status: 201 });
  } catch (error) {
    console.error('Failed to create settlement:', error);
    return NextResponse.json({ error: 'Failed to create settlement' }, { status: 500 });
  }
}
