import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/energy/stats - 전체 통계
export async function GET() {
  try {
    // 전체 발전소 수
    const totalPlants = await prisma.powerPlant.count();

    // 운영 중인 발전소 수
    const operationalPlants = await prisma.powerPlant.count({
      where: { status: 'OPERATIONAL' },
    });

    // 총 설비용량
    const capacityResult = await prisma.powerPlant.aggregate({
      _sum: { capacity: true },
    });
    const totalCapacity = Number(capacityResult._sum.capacity || 0);

    // 금일 생산량
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayProductions = await prisma.energyProduction.findMany({
      where: { recordedAt: { gte: today } },
    });

    const todayProduction = todayProductions.reduce(
      (sum, p) => sum + Number(p.production),
      0
    );

    // 현재 발전량 (최근 1시간)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentProductions = await prisma.energyProduction.findMany({
      where: { recordedAt: { gte: oneHourAgo } },
    });

    const currentProduction = recentProductions.reduce(
      (sum, p) => sum + Number(p.production),
      0
    ) / Math.max(recentProductions.length, 1);

    // 평균 효율
    const avgEfficiencyResult = await prisma.energyProduction.aggregate({
      _avg: { efficiency: true },
      where: { recordedAt: { gte: today } },
    });
    const avgEfficiency = Number(avgEfficiencyResult._avg.efficiency || 0);

    // 금일 매출 (SMP 기준 - 샘플 단가 125.5원/kWh)
    const smpPrice = 125.5;
    const todayRevenue = todayProduction * smpPrice;

    // 활성 알림 수
    const activeAlerts = await prisma.energyAlert.count({
      where: { isResolved: false },
    });

    return NextResponse.json({
      totalPlants,
      operationalPlants,
      totalCapacity,
      currentProduction,
      todayProduction,
      todayRevenue,
      avgEfficiency,
      activeAlerts,
    });
  } catch (error: any) {
    console.error('Error fetching energy stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
