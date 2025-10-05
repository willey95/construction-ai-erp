import { prisma } from './prisma';

/**
 * 데이터 연결 네트워크
 *
 * 시스템 내의 모든 데이터(프로젝트, 엔티티, 인사이트)가 어떻게 연결되어 있는지를 시각화하고 분석합니다.
 *
 * 주요 기능:
 * 1. 프로젝트 간 연결 (동일 발주처, 동일 담당자, 유사 위치 등)
 * 2. 프로젝트-엔티티 연결 (온톨로지 기반)
 * 3. 인사이트-프로젝트 연결 (AI 크롤러 기반)
 * 4. 연결 강도 계산 (관계 수, 신뢰도 등)
 */

export interface DataNode {
  id: string;
  label: string;
  type: 'project' | 'entity' | 'insight' | 'organization' | 'person';
  metadata: {
    name: string;
    description?: string;
    category?: string;
    [key: string]: any;
  };
}

export interface DataConnection {
  from: string; // node id
  to: string; // node id
  type: 'same_client' | 'same_manager' | 'ontology_relation' | 'insight_relation' | 'data_flow';
  strength: number; // 0.0 ~ 1.0
  label: string;
  metadata?: {
    relationType?: string;
    relationCount?: number;
    [key: string]: any;
  };
}

export interface NetworkGraph {
  nodes: DataNode[];
  connections: DataConnection[];
  stats: {
    totalNodes: number;
    totalConnections: number;
    avgConnectionsPerNode: number;
    mostConnectedNode: { id: string; label: string; connections: number } | null;
  };
}

/**
 * 데이터 연결 네트워크 분석기
 */
export class DataConnectionNetwork {
  /**
   * 전체 네트워크 그래프 생성
   */
  async generateNetworkGraph(options?: {
    includeProjects?: boolean;
    includeEntities?: boolean;
    includeInsights?: boolean;
    maxNodes?: number;
  }): Promise<NetworkGraph> {
    const {
      includeProjects = true,
      includeEntities = true,
      includeInsights = true,
      maxNodes = 50,
    } = options || {};

    const nodes: DataNode[] = [];
    const connections: DataConnection[] = [];

    // 1. 프로젝트 노드 추가
    if (includeProjects) {
      const projects = await prisma.project.findMany({
        take: Math.min(maxNodes, 20),
        orderBy: { createdAt: 'desc' },
      });

      for (const project of projects) {
        nodes.push({
          id: `project-${project.id}`,
          label: project.projectCode,
          type: 'project',
          metadata: {
            name: project.projectName,
            description: `${project.client} - ${project.projectType}`,
            client: project.client,
            status: project.status,
          },
        });
      }

      // 프로젝트 간 연결 (동일 발주처)
      const clientGroups = new Map<string, typeof projects>();
      projects.forEach((p) => {
        if (p.client) {
          if (!clientGroups.has(p.client)) {
            clientGroups.set(p.client, []);
          }
          clientGroups.get(p.client)!.push(p);
        }
      });

      clientGroups.forEach((groupProjects) => {
        if (groupProjects.length > 1) {
          for (let i = 0; i < groupProjects.length; i++) {
            for (let j = i + 1; j < groupProjects.length; j++) {
              connections.push({
                from: `project-${groupProjects[i].id}`,
                to: `project-${groupProjects[j].id}`,
                type: 'same_client',
                strength: 0.8,
                label: `동일 발주처: ${groupProjects[i].client}`,
              });
            }
          }
        }
      });
    }

    // 2. 엔티티 노드 추가 (온톨로지)
    if (includeEntities) {
      const entities = await prisma.ontologyEntity.findMany({
        where: {
          entityType: {
            in: ['PROJECT', 'ORGANIZATION', 'PERSON'],
          },
        },
        take: Math.min(maxNodes - nodes.length, 15),
        orderBy: { createdAt: 'desc' },
        include: {
          outgoingRelations: {
            include: { toEntity: true },
            take: 5,
          },
        },
      });

      for (const entity of entities) {
        const nodeType =
          entity.entityType === 'ORGANIZATION'
            ? 'organization'
            : entity.entityType === 'PERSON'
            ? 'person'
            : 'entity';

        nodes.push({
          id: `entity-${entity.id}`,
          label: entity.label,
          type: nodeType as any,
          metadata: {
            name: entity.name,
            description: entity.description,
            category: entity.entityType,
          },
        });

        // 엔티티 간 관계
        for (const relation of entity.outgoingRelations) {
          connections.push({
            from: `entity-${entity.id}`,
            to: `entity-${relation.toEntity.id}`,
            type: 'ontology_relation',
            strength: relation.confidence || 0.7,
            label: relation.relationType,
            metadata: {
              relationType: relation.relationType,
            },
          });
        }
      }
    }

    // 3. 인사이트 노드 추가
    if (includeInsights) {
      const insights = await prisma.ontologyEntity.findMany({
        where: {
          entityType: 'CONCEPT',
          source: 'ai_crawler',
        },
        take: Math.min(maxNodes - nodes.length, 10),
        orderBy: { createdAt: 'desc' },
        include: {
          outgoingRelations: {
            include: { toEntity: true },
            take: 3,
          },
        },
      });

      for (const insight of insights) {
        nodes.push({
          id: `insight-${insight.id}`,
          label: insight.label,
          type: 'insight',
          metadata: {
            name: insight.name,
            description: insight.description,
            category: (insight.properties as any)?.category,
          },
        });

        // 인사이트-엔티티 연결
        for (const relation of insight.outgoingRelations) {
          connections.push({
            from: `insight-${insight.id}`,
            to: `entity-${relation.toEntity.id}`,
            type: 'insight_relation',
            strength: relation.confidence || 0.6,
            label: '영향',
            metadata: {
              relationType: relation.relationType,
            },
          });
        }
      }
    }

    // 통계 계산
    const connectionCounts = new Map<string, number>();
    connections.forEach((conn) => {
      connectionCounts.set(conn.from, (connectionCounts.get(conn.from) || 0) + 1);
      connectionCounts.set(conn.to, (connectionCounts.get(conn.to) || 0) + 1);
    });

    let mostConnectedNode: NetworkGraph['stats']['mostConnectedNode'] = null;
    let maxConnections = 0;
    connectionCounts.forEach((count, nodeId) => {
      if (count > maxConnections) {
        maxConnections = count;
        const node = nodes.find((n) => n.id === nodeId);
        if (node) {
          mostConnectedNode = {
            id: nodeId,
            label: node.label,
            connections: count,
          };
        }
      }
    });

    return {
      nodes,
      connections,
      stats: {
        totalNodes: nodes.length,
        totalConnections: connections.length,
        avgConnectionsPerNode: nodes.length > 0 ? connections.length / nodes.length : 0,
        mostConnectedNode,
      },
    };
  }

  /**
   * 특정 프로젝트의 연결 분석
   */
  async analyzeProjectConnections(projectId: string): Promise<{
    directConnections: number;
    indirectConnections: number;
    connectedInsights: number;
    connectedEntities: number;
    connectionStrength: number; // 0.0 ~ 1.0
  }> {
    // 프로젝트 엔티티 찾기
    const projectEntity = await prisma.ontologyEntity.findFirst({
      where: {
        entityType: 'PROJECT',
        properties: {
          path: ['projectId'],
          equals: projectId,
        },
      },
      include: {
        outgoingRelations: true,
        incomingRelations: true,
      },
    });

    if (!projectEntity) {
      return {
        directConnections: 0,
        indirectConnections: 0,
        connectedInsights: 0,
        connectedEntities: 0,
        connectionStrength: 0,
      };
    }

    const directConnections =
      projectEntity.outgoingRelations.length + projectEntity.incomingRelations.length;

    // 인사이트 연결 (CONCEPT 엔티티에서 이 프로젝트로의 관계)
    const connectedInsights = await prisma.ontologyRelation.count({
      where: {
        toEntityId: projectEntity.id,
        fromEntity: {
          entityType: 'CONCEPT',
          source: 'ai_crawler',
        },
      },
    });

    // 연결된 다른 엔티티 수
    const connectedEntities =
      projectEntity.outgoingRelations.length + projectEntity.incomingRelations.length;

    // 연결 강도 계산 (관계 수와 신뢰도 기반)
    const avgConfidence =
      [...projectEntity.outgoingRelations, ...projectEntity.incomingRelations].reduce(
        (sum, rel) => sum + (rel.confidence || 0.5),
        0
      ) / Math.max(directConnections, 1);

    const connectionStrength = Math.min(
      (directConnections / 10) * 0.5 + avgConfidence * 0.5,
      1.0
    );

    return {
      directConnections,
      indirectConnections: 0, // TODO: 2-hop 연결 계산
      connectedInsights,
      connectedEntities,
      connectionStrength,
    };
  }

  /**
   * 데이터 흐름 히스토리 생성
   */
  async generateDataFlowHistory(limit: number = 20): Promise<
    Array<{
      timestamp: Date;
      source: string;
      target: string;
      action: string;
      category: string;
    }>
  > {
    // 최근 생성된 관계 조회
    const recentRelations = await prisma.ontologyRelation.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        fromEntity: true,
        toEntity: true,
      },
    });

    return recentRelations.map((relation) => ({
      timestamp: relation.createdAt,
      source: relation.fromEntity.name,
      target: relation.toEntity.name,
      action: relation.relationType,
      category:
        relation.fromEntity.entityType === 'CONCEPT'
          ? 'ai_insight'
          : relation.fromEntity.entityType === 'PROJECT'
          ? 'project_sync'
          : 'ontology',
    }));
  }
}

// 싱글톤 인스턴스
export const dataConnectionNetwork = new DataConnectionNetwork();
