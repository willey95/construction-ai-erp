import { NextRequest, NextResponse } from 'next/server';
import { ProjectOntologyGenerator } from '@/lib/ontology/ProjectOntologyGenerator';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const generator = new ProjectOntologyGenerator();
    const ontology = await generator.getProjectOntology(params.id);

    if (!ontology) {
      return NextResponse.json(
        { error: 'Ontology를 찾을 수 없습니다. 생성이 필요합니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(ontology);
  } catch (error) {
    console.error('Ontology 조회 실패:', error);
    return NextResponse.json({ error: 'Ontology 조회 실패' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const generator = new ProjectOntologyGenerator();
    const ontology = await generator.generateProjectOntology({
      projectId: params.id,
      includeFinancial: body.includeFinancial ?? true,
      includeSchedule: body.includeSchedule ?? true,
      includeRisk: body.includeRisk ?? true,
      includeResources: body.includeResources ?? true,
    });

    return NextResponse.json(ontology, { status: 201 });
  } catch (error) {
    console.error('Ontology 생성 실패:', error);
    return NextResponse.json({ error: 'Ontology 생성 실패' }, { status: 500 });
  }
}
