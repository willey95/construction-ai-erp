/**
 * ProjectOntologyGenerator
 * 프로젝트별 Ontology 자동 생성 엔진
 *
 * 프로젝트 생성 시 또는 요청 시 자동으로 프로젝트의 ontology를 생성합니다.
 * 생성된 ontology는 대시보드 생성의 기반이 되며, 지식그래프로 시각화됩니다.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ProjectOntologyConfig {
  projectId: string;
  includeFinancial?: boolean;
  includeSchedule?: boolean;
  includeRisk?: boolean;
  includeResources?: boolean;
}

export interface OntologyNode {
  id: string;
  entityType: string;
  name: string;
  properties: Record<string, any>;
  category: string;
}

export interface OntologyRelation {
  from: string;
  to: string;
  relationType: string;
  properties?: Record<string, any>;
}

export interface ProjectOntology {
  projectId: string;
  nodes: OntologyNode[];
  relations: OntologyRelation[];
  metadata: {
    generatedAt: Date;
    nodeCount: number;
    relationCount: number;
    categories: string[];
  };
}

export class ProjectOntologyGenerator {
  /**
   * 프로젝트 Ontology 자동 생성
   */
  async generateProjectOntology(config: ProjectOntologyConfig): Promise<ProjectOntology> {
    const { projectId } = config;

    // 프로젝트 데이터 조회
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        assumptions: true,
        progress: true,
        cashFlows: true,
        creator: true,
      },
    });

    if (!project) {
      throw new Error(`프로젝트를 찾을 수 없습니다: ${projectId}`);
    }

    const nodes: OntologyNode[] = [];
    const relations: OntologyRelation[] = [];
    const categories: string[] = [];

    // 1. 프로젝트 노드 생성 (중심 노드)
    const projectNode: OntologyNode = {
      id: `project_${project.id}`,
      entityType: 'PROJECT',
      name: project.projectName,
      properties: {
        projectCode: project.projectCode,
        projectType: project.projectType,
        client: project.client,
        contractPrice: Number(project.contractPrice),
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        progressRate: Number(project.progressRate),
      },
      category: 'Core',
    };
    nodes.push(projectNode);
    categories.push('Core');

    // 2. 발주처 노드
    const clientNode: OntologyNode = {
      id: `client_${project.client}`,
      entityType: 'ORGANIZATION',
      name: project.client,
      properties: {
        name: project.client,
        type: 'client',
      },
      category: 'Stakeholder',
    };
    nodes.push(clientNode);
    categories.push('Stakeholder');

    relations.push({
      from: `project_${project.id}`,
      to: `client_${project.client}`,
      relationType: 'MANAGED_BY',
    });

    // 3. 프로젝트 관리자 노드 (if creator exists)
    if (project.creator) {
      const pmNode: OntologyNode = {
        id: `user_${project.creator.id}`,
        entityType: 'USER',
        name: project.creator.fullName,
        properties: {
          fullName: project.creator.fullName,
          department: project.creator.department,
        },
        category: 'Stakeholder',
      };
      nodes.push(pmNode);

      relations.push({
        from: `project_${project.id}`,
        to: `user_${project.creator.id}`,
        relationType: 'MANAGED_BY',
      });
    }

    // 4. 재무 Ontology
    if (config.includeFinancial !== false) {
      const financialNode: OntologyNode = {
        id: `financial_${project.id}`,
        entityType: 'FINANCIAL_PLAN',
        name: `${project.projectName} 재무계획`,
        properties: {
          contractPrice: Number(project.contractPrice),
          totalBudget: Number(project.contractPrice),
        },
        category: 'Financial',
      };
      nodes.push(financialNode);
      categories.push('Financial');

      relations.push({
        from: `project_${project.id}`,
        to: `financial_${project.id}`,
        relationType: 'HAS_FINANCIAL_PLAN',
      });

      // 현금흐름 노드들
      if (project.cashFlows && project.cashFlows.length > 0) {
        project.cashFlows.forEach((cf, idx) => {
          const cfNode: OntologyNode = {
            id: `cashflow_${cf.id}`,
            entityType: 'CASH_FLOW',
            name: `${cf.month} 현금흐름`,
            properties: {
              month: cf.month,
              inflow: Number(cf.inflow),
              outflow: Number(cf.outflow),
              netCashFlow: Number(cf.netCashFlow),
              cumulativeCashFlow: Number(cf.cumulativeCashFlow),
            },
            category: 'Financial',
          };
          nodes.push(cfNode);

          relations.push({
            from: `financial_${project.id}`,
            to: `cashflow_${cf.id}`,
            relationType: 'CONTAINS',
          });
        });
      }
    }

    // 5. 공정 Ontology
    if (config.includeSchedule !== false) {
      const scheduleNode: OntologyNode = {
        id: `schedule_${project.id}`,
        entityType: 'SCHEDULE',
        name: `${project.projectName} 공정계획`,
        properties: {
          constructionPeriod: project.constructionPeriod,
          startDate: project.startDate,
          endDate: project.endDate,
          currentProgress: Number(project.progressRate),
        },
        category: 'Schedule',
      };
      nodes.push(scheduleNode);
      categories.push('Schedule');

      relations.push({
        from: `project_${project.id}`,
        to: `schedule_${project.id}`,
        relationType: 'HAS_SCHEDULE',
      });

      // 진척률 노드들
      if (project.progress && project.progress.length > 0) {
        project.progress.forEach((pg) => {
          const progressNode: OntologyNode = {
            id: `progress_${pg.id}`,
            entityType: 'PROGRESS',
            name: `${pg.month} 진척률`,
            properties: {
              month: pg.month,
              plannedRate: Number(pg.plannedRate),
              actualRate: Number(pg.actualRate),
            },
            category: 'Schedule',
          };
          nodes.push(progressNode);

          relations.push({
            from: `schedule_${project.id}`,
            to: `progress_${pg.id}`,
            relationType: 'TRACKS',
          });
        });
      }
    }

    // 6. 리스크 Ontology
    if (config.includeRisk !== false) {
      const riskNode: OntologyNode = {
        id: `risk_${project.id}`,
        entityType: 'RISK_ASSESSMENT',
        name: `${project.projectName} 리스크 평가`,
        properties: {
          // TODO: 실제 리스크 데이터 연동
          assessmentDate: new Date(),
        },
        category: 'Risk',
      };
      nodes.push(riskNode);
      categories.push('Risk');

      relations.push({
        from: `project_${project.id}`,
        to: `risk_${project.id}`,
        relationType: 'HAS_RISK_ASSESSMENT',
      });
    }

    // 7. 가정 노드
    if (project.assumptions && project.assumptions.length > 0) {
      const latestAssumption = project.assumptions[0];
      const assumptionNode: OntologyNode = {
        id: `assumption_${latestAssumption.id}`,
        entityType: 'ASSUMPTION',
        name: `${project.projectName} 가정`,
        properties: {
          profitMargin: Number(latestAssumption.profitMargin),
          costRatio: Number(latestAssumption.costRatio),
          curveType: latestAssumption.curveType,
        },
        category: 'Planning',
      };
      nodes.push(assumptionNode);
      categories.push('Planning');

      relations.push({
        from: `project_${project.id}`,
        to: `assumption_${latestAssumption.id}`,
        relationType: 'BASED_ON',
      });
    }

    // Ontology 객체 생성
    const ontology: ProjectOntology = {
      projectId,
      nodes,
      relations,
      metadata: {
        generatedAt: new Date(),
        nodeCount: nodes.length,
        relationCount: relations.length,
        categories: [...new Set(categories)],
      },
    };

    // Neo4j 또는 PostgreSQL에 저장
    await this.saveOntology(ontology);

    return ontology;
  }

  /**
   * Ontology를 데이터베이스에 저장
   */
  private async saveOntology(ontology: ProjectOntology): Promise<void> {
    // PostgreSQL에 Ontology Entity로 저장
    const entityMap = new Map<string, string>(); // node.id -> entity.id

    for (const node of ontology.nodes) {
      // Check if entity with this name already exists
      const existing = await prisma.ontologyEntity.findFirst({
        where: {
          name: node.name,
          entityType: node.entityType,
        },
      });

      if (existing) {
        // Update existing entity
        await prisma.ontologyEntity.update({
          where: { id: existing.id },
          data: {
            label: node.name,
            properties: node.properties,
          },
        });
        entityMap.set(node.id, existing.id);
      } else {
        // Create new entity
        const created = await prisma.ontologyEntity.create({
          data: {
            entityType: node.entityType,
            name: node.name,
            label: node.name,
            description: `${node.category} - ${node.name}`,
            properties: node.properties,
            source: 'ai_agent',
            confidence: 1.0,
            verified: true,
          },
        });
        entityMap.set(node.id, created.id);
      }
    }

    // Ontology Relationship 저장
    for (const rel of ontology.relations) {
      const fromEntityId = entityMap.get(rel.from);
      const toEntityId = entityMap.get(rel.to);

      if (fromEntityId && toEntityId) {
        // Check if relation already exists
        const existingRelation = await prisma.ontologyRelation.findFirst({
          where: {
            fromEntityId,
            toEntityId,
            relationType: rel.relationType,
          },
        });

        if (!existingRelation) {
          await prisma.ontologyRelation.create({
            data: {
              fromEntityId,
              toEntityId,
              relationType: rel.relationType,
              properties: rel.properties || {},
              confidence: 1.0,
              verified: true,
            },
          });
        }
      }
    }

    console.log(`✅ Ontology 저장 완료: ${ontology.nodes.length} nodes, ${ontology.relations.length} relations`);
  }

  /**
   * 프로젝트 Ontology 조회
   */
  async getProjectOntology(projectId: string): Promise<ProjectOntology | null> {
    // Find project entity first
    const projectEntity = await prisma.ontologyEntity.findFirst({
      where: {
        entityType: 'PROJECT',
        properties: {
          path: ['projectId'],
          equals: projectId,
        },
      },
    });

    if (!projectEntity) {
      return null;
    }

    // Get all entities related to this project (direct and indirect connections)
    const relatedEntities = await prisma.ontologyEntity.findMany({
      where: {
        OR: [
          { id: projectEntity.id },
          {
            outgoingRelations: {
              some: { toEntityId: projectEntity.id },
            },
          },
          {
            incomingRelations: {
              some: { fromEntityId: projectEntity.id },
            },
          },
        ],
      },
      include: {
        outgoingRelations: {
          include: { toEntity: true },
        },
        incomingRelations: {
          include: { fromEntity: true },
        },
      },
    });

    const nodes: OntologyNode[] = relatedEntities.map(e => ({
      id: e.id,
      entityType: e.entityType,
      name: e.name,
      properties: e.properties as Record<string, any>,
      category: e.description?.split(' - ')[0] || 'Unknown',
    }));

    const relations: OntologyRelation[] = [];
    const seenRelations = new Set<string>();

    relatedEntities.forEach(e => {
      e.outgoingRelations.forEach(r => {
        const key = `${r.fromEntityId}-${r.toEntityId}-${r.relationType}`;
        if (!seenRelations.has(key)) {
          relations.push({
            from: r.fromEntityId,
            to: r.toEntityId,
            relationType: r.relationType,
            properties: r.properties as Record<string, any>,
          });
          seenRelations.add(key);
        }
      });
    });

    return {
      projectId,
      nodes,
      relations,
      metadata: {
        generatedAt: new Date(),
        nodeCount: nodes.length,
        relationCount: relations.length,
        categories: [...new Set(nodes.map(n => n.category))],
      },
    };
  }
}
