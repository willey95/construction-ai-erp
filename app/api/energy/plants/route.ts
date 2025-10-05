import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/energy/plants - 발전소 목록 조회
export async function GET() {
  try {
    const plants = await prisma.powerPlant.findMany({
      orderBy: { plantName: 'asc' },
      include: {
        _count: {
          select: {
            productions: true,
            alerts: true,
          },
        },
      },
    });

    // 각 발전소의 최근 생산량 및 환경 데이터 가져오기
    const plantsWithData = await Promise.all(
      plants.map(async (plant) => {
        // 최근 생산 데이터
        const latestProduction = await prisma.energyProduction.findFirst({
          where: { plantId: plant.id },
          orderBy: { recordedAt: 'desc' },
        });

        // 금일 생산량
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayProductions = await prisma.energyProduction.findMany({
          where: {
            plantId: plant.id,
            recordedAt: { gte: today },
          },
        });

        const todayTotal = todayProductions.reduce(
          (sum, p) => sum + Number(p.production),
          0
        );

        // 현재 날씨 정보 (샘플)
        const weatherConditions = ['맑음', '흐림', '비', '눈', '구름많음'];
        const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

        return {
          id: plant.id,
          plantCode: plant.plantCode,
          plantName: plant.plantName,
          plantType: plant.plantType,
          region: plant.region,
          status: plant.status,
          capacity: Number(plant.capacity),
          currentProduction: latestProduction ? Number(latestProduction.production) : 0,
          todayProduction: todayTotal,
          efficiency: latestProduction ? Number(latestProduction.efficiency || 0) : 0,
          temperature: latestProduction ? Number(latestProduction.temperature || 20) : 20,
          weather: randomWeather,
          alertCount: plant._count.alerts,
        };
      })
    );

    return NextResponse.json({
      plants: plantsWithData,
      total: plantsWithData.length,
    });
  } catch (error: any) {
    console.error('Error fetching power plants:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/energy/plants - 발전소 등록
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const plant = await prisma.powerPlant.create({
      data: {
        plantCode: body.plantCode,
        plantName: body.plantName,
        plantType: body.plantType,
        region: body.region,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        capacity: body.capacity,
        installedDate: new Date(body.installedDate),
        status: body.status || 'OPERATIONAL',
        contractType: body.contractType,
        unitPrice: body.unitPrice,
      },
    });

    return NextResponse.json({ plant });
  } catch (error: any) {
    console.error('Error creating power plant:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
