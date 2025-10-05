// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const datasets = await prisma.dataset.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(datasets);
  } catch (error: any) {
    console.error('Failed to fetch datasets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch datasets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const dataset = await prisma.dataset.create({
      data: {
        name: body.name,
        description: body.description || null,
        dataType: body.dataType,
        sourceType: body.sourceType,
        recordCount: body.recordCount || 0,
        syncStatus: body.syncStatus || 'PENDING',
        config: body.config || {},
      },
    });

    return NextResponse.json(dataset, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create dataset:', error);
    return NextResponse.json(
      { error: 'Failed to create dataset' },
      { status: 500 }
    );
  }
}
