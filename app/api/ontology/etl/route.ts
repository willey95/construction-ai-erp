import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const jobs = await prisma.eTLJob.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        dataset: {
          select: {
            name: true,
          },
        },
      },
      take: 100,
    });

    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error('Failed to fetch ETL jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ETL jobs' },
      { status: 500 }
    );
  }
}
