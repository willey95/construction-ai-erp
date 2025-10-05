import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        assumptions: {
          orderBy: { effectiveFrom: 'desc' },
        },
        progress: {
          orderBy: { month: 'asc' },
        },
        cashFlows: {
          orderBy: { month: 'asc' },
        },
        creator: {
          select: {
            fullName: true,
            department: true,
            email: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다' }, { status: 404 });
    }

    // Serialize Decimal types to numbers for JSON
    const serializedProject = {
      ...project,
      contractPrice: project.contractPrice ? Number(project.contractPrice) : 0,
      progressRate: project.progressRate ? Number(project.progressRate) : 0,
      progress: project.progress?.map(p => ({
        ...p,
        plannedRate: p.plannedRate ? Number(p.plannedRate) : 0,
        actualRate: p.actualRate ? Number(p.actualRate) : 0,
      })),
      cashFlows: project.cashFlows?.map(cf => ({
        ...cf,
        inflow: cf.inflow ? Number(cf.inflow) : 0,
        outflow: cf.outflow ? Number(cf.outflow) : 0,
        netCashFlow: cf.netCashFlow ? Number(cf.netCashFlow) : 0,
        cumulativeCashFlow: cf.cumulativeCashFlow ? Number(cf.cumulativeCashFlow) : 0,
      })),
    };

    return NextResponse.json(serializedProject);
  } catch (error) {
    console.error('프로젝트 상세 조회 실패:', error);
    return NextResponse.json({ error: '프로젝트 상세 조회 실패' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...body,
        contractDate: body.contractDate ? new Date(body.contractDate) : undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
    });

    // Serialize Decimal types to numbers for JSON
    const serializedProject = {
      ...project,
      contractPrice: project.contractPrice ? Number(project.contractPrice) : 0,
      progressRate: project.progressRate ? Number(project.progressRate) : 0,
    };

    return NextResponse.json(serializedProject);
  } catch (error) {
    console.error('프로젝트 수정 실패:', error);
    return NextResponse.json({ error: '프로젝트 수정 실패' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: '프로젝트가 삭제되었습니다' });
  } catch (error) {
    console.error('프로젝트 삭제 실패:', error);
    return NextResponse.json({ error: '프로젝트 삭제 실패' }, { status: 500 });
  }
}
