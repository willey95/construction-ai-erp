import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const productions = await prisma.energyProduction.findMany({
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
        recordedAt: 'desc',
      },
      take: 500, // 최근 500개
    });

    // Serialize Decimal types
    const serialized = productions.map(prod => ({
      ...prod,
      production: Number(prod.production),
      temperature: prod.temperature ? Number(prod.temperature) : null,
      humidity: prod.humidity ? Number(prod.humidity) : null,
      irradiance: prod.irradiance ? Number(prod.irradiance) : null,
      windSpeed: prod.windSpeed ? Number(prod.windSpeed) : null,
      efficiency: prod.efficiency ? Number(prod.efficiency) : null,
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Failed to fetch productions:', error);
    return NextResponse.json({ error: 'Failed to fetch productions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const production = await prisma.energyProduction.create({
      data: {
        plantId: body.plantId,
        recordedAt: new Date(body.recordedAt || new Date()),
        production: body.production,
        temperature: body.temperature,
        humidity: body.humidity,
        irradiance: body.irradiance,
        windSpeed: body.windSpeed,
        efficiency: body.efficiency,
      },
    });

    return NextResponse.json(production, { status: 201 });
  } catch (error) {
    console.error('Failed to create production:', error);
    return NextResponse.json({ error: 'Failed to create production' }, { status: 500 });
  }
}
