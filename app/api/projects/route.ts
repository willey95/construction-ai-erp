import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: any = {};
    if (type) where.projectType = type;
    if (status) where.status = status;

    const projects = await prisma.project.findMany({
      where,
      include: {
        assumptions: {
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
        },
        creator: {
          select: {
            fullName: true,
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // FIX: More robust serialization to handle nested objects.
    // This now processes both the main project and its related assumptions.
    const serializedProjects = projects.map(project => {
      const assumptions = project.assumptions.map(assumption => {
        // NOTE: Add any Decimal fields from your ProjectAssumption model here.
        // For example, if you have a 'cost' field of type Decimal:
        // return { ...assumption, cost: Number(assumption.cost) };
        return { ...assumption }; // Return as is if no Decimal types
      });

      return {
        ...project,
        contractPrice: project.contractPrice ? Number(project.contractPrice) : 0,
        progressRate: project.progressRate ? Number(project.progressRate) : 0,
        assumptions, // Use the newly serialized assumptions
      };
    });

    return NextResponse.json(serializedProjects);
  } catch (error) {
    // NOTE: Check your Netlify Function logs. The full error message from Prisma
    // will be printed here and will tell you the exact cause of the failure.
    console.error('프로젝트 조회 실패:', error);
    return NextResponse.json({ error: '프로젝트 조회 실패' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const project = await prisma.project.create({
      data: {
        projectCode: body.projectCode,
        projectName: body.projectName,
        projectType: body.projectType,
        client: body.client,
        location: body.location,
        description: body.description,
        contractPrice: body.contractPrice,
        contractDate: new Date(body.contractDate),
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        constructionPeriod: body.constructionPeriod,
        status: body.status || 'PLANNED',
        progressRate: 0,
        createdBy: body.createdBy,
      },
    });

    // 기본 가정 생성
    if (body.assumptions) {
      await prisma.projectAssumption.create({
        data: {
          projectId: project.id,
          ...body.assumptions,
          effectiveFrom: new Date(body.startDate),
        },
      });
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('프로젝트 생성 실패:', error);
    return NextResponse.json({ error: '프로젝트 생성 실패' }, { status: 500 });
  }
}