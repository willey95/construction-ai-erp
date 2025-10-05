import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { neo4jClient } from '@/lib/neo4j/neo4jClient';
import { EntityType, RelationType } from '@prisma/client';

interface GenerateRequest {
  sourceType: 'project' | 'database' | 'text';
  sourceId?: string;
  textContent?: string;
  autoDetect?: boolean;
}

interface OntologyRecommendation {
  entities: Array<{
    type: EntityType;
    name: string;
    label: string;
    description: string;
    properties: any;
    confidence: number;
  }>;
  relations: Array<{
    fromEntity: string;
    toEntity: string;
    type: RelationType;
    properties: any;
    confidence: number;
  }>;
}

/**
 * POST /api/ontology/generate
 * AI 기반 온톨로지 자동 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    let recommendation: OntologyRecommendation;

    switch (body.sourceType) {
      case 'project':
        recommendation = await generateFromProject(body.sourceId!);
        break;
      case 'database':
        recommendation = await generateFromDatabase();
        break;
      case 'text':
        recommendation = await generateFromText(body.textContent!);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid source type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      recommendation,
      message: `${recommendation.entities.length}개 엔티티, ${recommendation.relations.length}개 관계 추천`,
    });
  } catch (error: any) {
    console.error('Ontology generation failed:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// 프로젝트에서 온톨로지 추출
async function generateFromProject(projectId: string): Promise<OntologyRecommendation> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      assumptions: true,
      progress: true,
      cashFlows: true,
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const entities: OntologyRecommendation['entities'] = [];
  const relations: OntologyRecommendation['relations'] = [];

  // 1. 프로젝트 엔티티
  entities.push({
    type: EntityType.PROJECT,
    name: project.projectName,
    label: project.projectCode,
    description: `${project.projectType} 프로젝트`,
    properties: {
      projectId: project.id,
      contractPrice: project.contractPrice,
      status: project.status,
      location: project.location || '',
      startDate: project.startDate,
      endDate: project.endDate,
    },
    confidence: 1.0,
  });

  // 2. 발주처 조직 엔티티
  if (project.client) {
    entities.push({
      type: EntityType.ORGANIZATION,
      name: project.client,
      label: project.client,
      description: '발주처 조직',
      properties: {
        type: 'client',
      },
      confidence: 1.0,
    });

    relations.push({
      fromEntity: project.projectName,
      toEntity: project.client,
      type: RelationType.MANAGED_BY,
      properties: {},
      confidence: 1.0,
    });
  }

  // 3. 위치 엔티티
  if (project.location) {
    entities.push({
      type: EntityType.LOCATION,
      name: project.location,
      label: project.location,
      description: '프로젝트 위치',
      properties: {},
      confidence: 0.9,
    });

    relations.push({
      fromEntity: project.projectName,
      toEntity: project.location,
      type: RelationType.LOCATED_IN,
      properties: {},
      confidence: 0.9,
    });
  }

  // 4. 담당자 엔티티 (createdBy에서 추출)
  if (project.createdBy) {
    const user = await prisma.user.findUnique({
      where: { id: project.createdBy },
    });

    if (user) {
      entities.push({
        type: EntityType.PERSON,
        name: user.fullName,
        label: user.fullName,
        description: `${user.department} 담당자`,
        properties: {
          userId: user.id,
          department: user.department,
        },
        confidence: 1.0,
      });

      relations.push({
        fromEntity: project.projectName,
        toEntity: user.fullName,
        type: RelationType.MANAGED_BY,
        properties: { role: 'project_manager' },
        confidence: 1.0,
      });
    }
  }

  // 5. 마일스톤 엔티티 (진척률 기반)
  if (project.progress && project.progress.length > 0) {
    const milestones = ['착공', '중간점검', '준공'];
    milestones.forEach((milestone, idx) => {
      entities.push({
        type: EntityType.MILESTONE,
        name: `${project.projectName} - ${milestone}`,
        label: milestone,
        description: `${milestone} 마일스톤`,
        properties: {
          order: idx + 1,
          targetProgress: (idx + 1) * 33,
        },
        confidence: 0.8,
      });

      relations.push({
        fromEntity: project.projectName,
        toEntity: `${project.projectName} - ${milestone}`,
        type: RelationType.CONTAINS,
        properties: {},
        confidence: 0.8,
      });
    });
  }

  // 6. 리스크 엔티티 (예산 초과 감지)
  if (project.assumptions && project.assumptions.length > 0) {
    const latestAssumption = project.assumptions[0];
    const profitMargin = Number(latestAssumption.profitMargin);

    if (profitMargin < 0.1) {
      entities.push({
        type: EntityType.RISK,
        name: `${project.projectName} - 저수익성 리스크`,
        label: '저수익성 리스크',
        description: '이익률 10% 미만 리스크',
        properties: {
          severity: 'high',
          profitMargin: profitMargin,
        },
        confidence: 0.95,
      });

      relations.push({
        fromEntity: project.projectName,
        toEntity: `${project.projectName} - 저수익성 리스크`,
        type: RelationType.AFFECTS,
        properties: { impact: 'negative' },
        confidence: 0.95,
      });
    }
  }

  return { entities, relations };
}

// 전체 데이터베이스에서 온톨로지 추출
async function generateFromDatabase(): Promise<OntologyRecommendation> {
  const entities: OntologyRecommendation['entities'] = [];
  const relations: OntologyRecommendation['relations'] = [];

  // 모든 프로젝트 조회
  const projects = await prisma.project.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
  });

  // 프로젝트별 엔티티 생성
  for (const project of projects) {
    entities.push({
      type: EntityType.PROJECT,
      name: project.projectName,
      label: project.projectCode,
      description: `${project.projectType} 프로젝트`,
      properties: {
        projectId: project.id,
        status: project.status,
      },
      confidence: 1.0,
    });
  }

  // 발주처 그룹화 (동일 발주처 프로젝트 연결)
  const clientGroups = new Map<string, string[]>();
  projects.forEach((p) => {
    if (p.client) {
      if (!clientGroups.has(p.client)) {
        clientGroups.set(p.client, []);
      }
      clientGroups.get(p.client)!.push(p.projectName);
    }
  });

  clientGroups.forEach((projectNames, clientName) => {
    // 발주처 엔티티
    entities.push({
      type: EntityType.ORGANIZATION,
      name: clientName,
      label: clientName,
      description: `발주처 (프로젝트 ${projectNames.length}건)`,
      properties: {
        projectCount: projectNames.length,
      },
      confidence: 1.0,
    });

    // 발주처-프로젝트 관계
    projectNames.forEach((projectName) => {
      relations.push({
        fromEntity: projectName,
        toEntity: clientName,
        type: RelationType.MANAGED_BY,
        properties: {},
        confidence: 1.0,
      });
    });
  });

  // 사용자 (담당자) 엔티티
  const users = await prisma.user.findMany({ take: 20 });
  users.forEach((user) => {
    entities.push({
      type: EntityType.PERSON,
      name: user.fullName,
      label: user.fullName,
      description: `${user.department} 담당자`,
      properties: {
        userId: user.id,
        department: user.department,
      },
      confidence: 1.0,
    });
  });

  return { entities, relations };
}

// 텍스트에서 온톨로지 추출 (간단한 NLP)
async function generateFromText(text: string): Promise<OntologyRecommendation> {
  const entities: OntologyRecommendation['entities'] = [];
  const relations: OntologyRecommendation['relations'] = [];

  // 간단한 키워드 기반 엔티티 추출
  const projectKeywords = ['프로젝트', '공사', '사업', '현장'];
  const orgKeywords = ['발주처', '협력사', '업체', '회사'];
  const personKeywords = ['담당자', '책임자', '매니저', '팀장'];
  const locationKeywords = ['위치', '지역', '현장', '소재지'];

  const lines = text.split('\n');

  lines.forEach((line, idx) => {
    // 프로젝트 감지
    if (projectKeywords.some((kw) => line.includes(kw))) {
      const match = line.match(/[\w\s가-힣]+/g);
      if (match && match.length > 0) {
        entities.push({
          type: EntityType.PROJECT,
          name: match[0].trim(),
          label: match[0].trim(),
          description: '텍스트에서 추출된 프로젝트',
          properties: { source: 'text', lineNumber: idx + 1 },
          confidence: 0.7,
        });
      }
    }

    // 조직 감지
    if (orgKeywords.some((kw) => line.includes(kw))) {
      const match = line.match(/[\w\s가-힣]+/g);
      if (match && match.length > 1) {
        entities.push({
          type: EntityType.ORGANIZATION,
          name: match[1].trim(),
          label: match[1].trim(),
          description: '텍스트에서 추출된 조직',
          properties: { source: 'text', lineNumber: idx + 1 },
          confidence: 0.6,
        });
      }
    }

    // 담당자 감지
    if (personKeywords.some((kw) => line.includes(kw))) {
      const match = line.match(/[\w\s가-힣]+/g);
      if (match && match.length > 1) {
        entities.push({
          type: EntityType.PERSON,
          name: match[1].trim(),
          label: match[1].trim(),
          description: '텍스트에서 추출된 담당자',
          properties: { source: 'text', lineNumber: idx + 1 },
          confidence: 0.6,
        });
      }
    }
  });

  // 간단한 관계 추론: 첫 번째 프로젝트와 첫 번째 조직 연결
  const firstProject = entities.find((e) => e.type === EntityType.PROJECT);
  const firstOrg = entities.find((e) => e.type === EntityType.ORGANIZATION);

  if (firstProject && firstOrg) {
    relations.push({
      fromEntity: firstProject.name,
      toEntity: firstOrg.name,
      type: RelationType.MANAGED_BY,
      properties: {},
      confidence: 0.5,
    });
  }

  return { entities, relations };
}
