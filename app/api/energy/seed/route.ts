// @ts-nocheck
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/energy/seed - 샘플 데이터 생성
export async function POST() {
  try {
    // 기존 데이터 삭제
    await prisma.energyProduction.deleteMany({});
    await prisma.energyAlert.deleteMany({});
    await prisma.energySettlement.deleteMany({});
    await prisma.energySales.deleteMany({});
    await prisma.powerPlant.deleteMany({});

    // 샘플 발전소 데이터
    const samplePlants = [
      {
        plantCode: 'SOLAR-001',
        plantName: '서울 태양광 1호',
        plantType: 'SOLAR',
        region: '서울',
        address: '서울시 강남구 테헤란로 123',
        capacity: 5000, // 5MW
        installedDate: new Date('2020-01-15'),
        status: 'OPERATIONAL',
        contractType: 'SMP+REC',
        unitPrice: 125.5,
      },
      {
        plantCode: 'SOLAR-002',
        plantName: '경기 태양광 1호',
        plantType: 'SOLAR',
        region: '경기',
        address: '경기도 성남시 분당구 판교로 256',
        capacity: 8000, // 8MW
        installedDate: new Date('2019-06-20'),
        status: 'OPERATIONAL',
        contractType: 'SMP+REC',
        unitPrice: 125.5,
      },
      {
        plantCode: 'WIND-001',
        plantName: '강원 풍력 1호',
        plantType: 'WIND',
        region: '강원',
        address: '강원도 강릉시 해안로 789',
        capacity: 15000, // 15MW
        installedDate: new Date('2018-03-10'),
        status: 'OPERATIONAL',
        contractType: 'SMP+REC',
        unitPrice: 130.0,
      },
      {
        plantCode: 'ESS-001',
        plantName: '부산 ESS 1호',
        plantType: 'ESS',
        region: '부산',
        address: '부산시 해운대구 센텀로 100',
        capacity: 10000, // 10MW
        installedDate: new Date('2021-09-05'),
        status: 'OPERATIONAL',
        contractType: 'SMP',
        unitPrice: 120.0,
      },
      {
        plantCode: 'SOLAR-003',
        plantName: '충남 태양광 1호',
        plantType: 'SOLAR',
        region: '충남',
        address: '충청남도 아산시 탕정면 산업로 45',
        capacity: 12000, // 12MW
        installedDate: new Date('2020-11-20'),
        status: 'OPERATIONAL',
        contractType: 'SMP+REC',
        unitPrice: 125.5,
      },
      {
        plantCode: 'SOLAR-004',
        plantName: '전남 태양광 1호',
        plantType: 'SOLAR',
        region: '전남',
        address: '전라남도 나주시 빛가람로 301',
        capacity: 7000, // 7MW
        installedDate: new Date('2019-12-15'),
        status: 'MAINTENANCE',
        contractType: 'SMP+REC',
        unitPrice: 125.5,
      },
    ];

    // 발전소 생성
    const createdPlants = [];
    for (const plantData of samplePlants) {
      const plant = await prisma.powerPlant.create({
        data: plantData as any,
      });
      createdPlants.push(plant);
    }

    // 각 발전소에 대한 생산 데이터 생성 (최근 24시간)
    const now = new Date();
    for (const plant of createdPlants) {
      // 24시간 동안 1시간 단위로 데이터 생성
      for (let i = 0; i < 24; i++) {
        const recordedAt = new Date(now.getTime() - i * 60 * 60 * 1000);

        // 발전 타입별 생산량 패턴
        let baseProduction = Number(plant.capacity) * 0.7; // 기본 70% 용량
        let efficiency = 75 + Math.random() * 15; // 75-90% 효율

        if (plant.plantType === 'SOLAR') {
          // 태양광: 시간대별 차등 (낮 높고 밤 낮음)
          const hour = recordedAt.getHours();
          const solarFactor = hour >= 6 && hour <= 18
            ? Math.sin(((hour - 6) / 12) * Math.PI)
            : 0;
          baseProduction = Number(plant.capacity) * solarFactor * (0.6 + Math.random() * 0.3);
          efficiency = solarFactor * 100;
        } else if (plant.plantType === 'WIND') {
          // 풍력: 무작위 변동
          baseProduction = Number(plant.capacity) * (0.4 + Math.random() * 0.4);
          efficiency = 70 + Math.random() * 20;
        }

        if (plant.status !== 'OPERATIONAL') {
          baseProduction = 0;
          efficiency = 0;
        }

        await prisma.energyProduction.create({
          data: {
            plantId: plant.id,
            recordedAt,
            production: baseProduction,
            temperature: 15 + Math.random() * 15, // 15-30°C
            humidity: 40 + Math.random() * 40, // 40-80%
            irradiance: plant.plantType === 'SOLAR' ? 200 + Math.random() * 600 : null,
            windSpeed: plant.plantType === 'WIND' ? 3 + Math.random() * 10 : null,
            efficiency,
          },
        });
      }
    }

    // 샘플 알림 생성
    const sampleAlerts = [
      {
        plantId: createdPlants[5].id, // 정비 중인 발전소
        alertType: 'MAINTENANCE_DUE',
        severity: 'MEDIUM',
        title: '정기 점검 필요',
        message: '정기 점검이 예정되어 있습니다. 점검 일정을 확인해주세요.',
        metrics: { nextMaintenance: '2025-10-10' },
      },
      {
        plantId: createdPlants[0].id,
        alertType: 'PERFORMANCE_DROP',
        severity: 'LOW',
        title: '효율 저하 감지',
        message: '최근 발전 효율이 평균 대비 5% 감소하였습니다.',
        metrics: { currentEfficiency: 72, avgEfficiency: 77 },
      },
      {
        plantId: createdPlants[2].id,
        alertType: 'WEATHER_RISK',
        severity: 'MEDIUM',
        title: '기상 주의보',
        message: '강풍 주의보가 발효되었습니다. 안전 점검이 필요합니다.',
        metrics: { windSpeed: 15.2, threshold: 15.0 },
      },
    ];

    for (const alertData of sampleAlerts) {
      await prisma.energyAlert.create({
        data: alertData,
      });
    }

    // 샘플 정산 데이터 생성
    const settlementDate = new Date('2025-09-01');
    for (const plant of createdPlants.slice(0, 4)) { // 처음 4개만
      await prisma.energySettlement.create({
        data: {
          plantId: plant.id,
          settlementMonth: settlementDate,
          smpRevenue: 15000000 + Math.random() * 5000000,
          recRevenue: 8000000 + Math.random() * 3000000,
          incentive: 500000 + Math.random() * 500000,
          totalRevenue: 24000000,
          operationCost: 2000000,
          maintenanceCost: 1500000,
          totalCost: 3500000,
          netProfit: 20500000,
          status: 'COMPLETED',
          settledAt: new Date('2025-09-15'),
        },
      });
    }

    return NextResponse.json({
      message: 'Sample energy data created successfully',
      plants: createdPlants.length,
      alerts: sampleAlerts.length,
    });
  } catch (error: any) {
    console.error('Error seeding energy data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
