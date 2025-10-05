import { AgentBase, AgentConfig } from './AgentBase';
import { AgentType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { neo4jClient } from '@/lib/neo4j/neo4jClient';
import { runETL } from '@/lib/ontology/ETLPipeline';
import { ETLJobType } from '@prisma/client';

/**
 * 온톨로지 관리 AI 에이전트
 *
 * 역할:
 * 1. Legacy DB → Neo4j 자동 동기화
 * 2. 엔티티 및 관계 자동 추출
 * 3. 중복 엔티티 병합
 * 4. 데이터 품질 검증
 * 5. 온톨로지 최적화 (불필요한 관계 제거, 가중치 업데이트)
 * 6. 스케줄 기반 ETL 작업 실행
 */
export class OntologyManagerAgent extends AgentBase {
  constructor() {
    super({
      name: 'OntologyManager',
      type: AgentType.COORDINATOR, // ONTOLOGY_MANAGER enum 추가 필요
      interval: 3600000, // 1시간
      enabled: true,
    });
  }

  protected async run(): Promise<any> {
    const timestamp = new Date();

    try {
      // 1. 스케줄된 ETL 작업 확인 및 실행
      const etlJobsExecuted = await this.executeScheduledETLJobs();

      // 2. 엔티티 중복 검출 및 병합
      const duplicatesResolved = await this.detectAndMergeDuplicates();

      // 3. 관계 품질 검증
      const relationsValidated = await this.validateRelations();

      // 4. Legacy DB에서 새로운 엔티티 추출
      const newEntitiesExtracted = await this.extractNewEntitiesFromLegacyDB();

      // 5. Neo4j ↔ PostgreSQL 동기화 상태 확인
      const syncStatus = await this.checkSyncStatus();

      // 6. 온톨로지 통계 수집
      const stats = await this.collectOntologyStatistics();

      // 7. 최적화 작업 (가중치 재계산, 불필요한 관계 제거)
      const optimizationResults = await this.optimizeOntology();

      return {
        timestamp,
        etlJobsExecuted,
        duplicatesResolved,
        relationsValidated,
        newEntitiesExtracted,
        syncStatus,
        stats,
        optimizationResults,
      };
    } catch (error: any) {
      console.error('OntologyManager run failed:', error);
      throw error;
    }
  }

  // 1. 스케줄된 ETL 작업 실행
  private async executeScheduledETLJobs(): Promise<number> {
    const datasets = await prisma.dataset.findMany({
      where: {
        etlSchedule: { not: null },
        syncStatus: { in: ['PENDING', 'FAILED'] },
      },
    });

    let executedCount = 0;

    for (const dataset of datasets) {
      try {
        await this.log('INFO', `Starting scheduled ETL for dataset: ${dataset.name}`, {
          datasetId: dataset.id,
        });

        const result = await runETL({
          datasetId: dataset.id,
          jobType: ETLJobType.INCREMENTAL_SYNC,
          batchSize: 100,
        });

        await this.log('SUCCESS', `ETL completed for dataset: ${dataset.name}`, {
          result,
        });

        executedCount++;
      } catch (error: any) {
        await this.log('ERROR', `ETL failed for dataset: ${dataset.name}`, {
          error: error.message,
        });
      }
    }

    return executedCount;
  }

  // 2. 중복 엔티티 검출 및 병합
  private async detectAndMergeDuplicates(): Promise<number> {
    // 이름이 유사한 엔티티 찾기 (Levenshtein distance 사용 가능)
    const entities = await prisma.ontologyEntity.findMany({
      where: { verified: false },
    });

    let mergedCount = 0;
    const processedIds = new Set<string>();

    for (let i = 0; i < entities.length; i++) {
      if (processedIds.has(entities[i].id)) continue;

      for (let j = i + 1; j < entities.length; j++) {
        if (processedIds.has(entities[j].id)) continue;

        // 같은 타입이고 이름이 매우 유사한 경우
        if (
          entities[i].entityType === entities[j].entityType &&
          this.calculateSimilarity(entities[i].name, entities[j].name) > 0.9
        ) {
          // 병합: j를 i에 통합
          await this.mergeEntities(entities[i].id, entities[j].id);
          processedIds.add(entities[j].id);
          mergedCount++;

          await this.log('INFO', 'Merged duplicate entities', {
            from: entities[j].name,
            to: entities[i].name,
          });
        }
      }
    }

    return mergedCount;
  }

  // 간단한 유사도 계산 (Jaccard similarity)
  private calculateSimilarity(str1: string, str2: string): number {
    const set1 = new Set(str1.toLowerCase().split(''));
    const set2 = new Set(str2.toLowerCase().split(''));

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  // 엔티티 병합
  private async mergeEntities(
    targetId: string,
    sourceId: string
  ): Promise<void> {
    // 1. 모든 관계를 target으로 이동
    await prisma.ontologyRelation.updateMany({
      where: { fromEntityId: sourceId },
      data: { fromEntityId: targetId },
    });

    await prisma.ontologyRelation.updateMany({
      where: { toEntityId: sourceId },
      data: { toEntityId: targetId },
    });

    // 2. source 엔티티 삭제
    await prisma.ontologyEntity.delete({
      where: { id: sourceId },
    });

    // 3. Neo4j에서도 병합
    try {
      await neo4jClient.runQuery(
        `MATCH (source {id: $sourceId})
         MATCH (target {id: $targetId})
         CALL apoc.refactor.mergeNodes([source, target], {properties: 'discard'})
         YIELD node
         RETURN node`,
        { sourceId, targetId }
      );
    } catch (error) {
      console.error('Neo4j merge failed:', error);
    }
  }

  // 3. 관계 품질 검증
  private async validateRelations(): Promise<number> {
    const relations = await prisma.ontologyRelation.findMany({
      where: { verified: false },
      include: { fromEntity: true, toEntity: true },
    });

    let validatedCount = 0;

    for (const relation of relations) {
      // 순환 관계 체크
      const isCircular = relation.fromEntityId === relation.toEntityId;
      if (isCircular) {
        await this.log('WARNING', 'Circular relation detected', {
          relationId: relation.id,
        });
        continue;
      }

      // 중복 관계 체크
      const duplicates = await prisma.ontologyRelation.findMany({
        where: {
          fromEntityId: relation.fromEntityId,
          toEntityId: relation.toEntityId,
          relationType: relation.relationType,
          id: { not: relation.id },
        },
      });

      if (duplicates.length > 0) {
        // 중복 관계 삭제
        await prisma.ontologyRelation.delete({
          where: { id: relation.id },
        });

        await this.log('INFO', 'Duplicate relation removed', {
          relationId: relation.id,
        });
        continue;
      }

      // 검증 완료
      await prisma.ontologyRelation.update({
        where: { id: relation.id },
        data: { verified: true },
      });

      validatedCount++;
    }

    return validatedCount;
  }

  // 4. Legacy DB에서 새로운 엔티티 추출
  private async extractNewEntitiesFromLegacyDB(): Promise<number> {
    // Project 테이블에서 엔티티 추출
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        projectName: true,
        projectType: true,
        status: true,
        location: true,
        clientName: true,
      },
    });

    let extractedCount = 0;

    for (const project of projects) {
      // 프로젝트 엔티티 생성
      const existingEntity = await prisma.ontologyEntity.findFirst({
        where: {
          name: project.projectName,
          entityType: 'PROJECT',
        },
      });

      if (!existingEntity) {
        await prisma.ontologyEntity.create({
          data: {
            entityType: 'PROJECT',
            name: project.projectName,
            label: project.projectName,
            description: `${project.projectType} project`,
            properties: {
              projectId: project.id,
              status: project.status,
              location: project.location,
            },
            source: 'legacy_db',
            confidence: 1.0,
            verified: false,
          },
        });

        extractedCount++;

        // Neo4j에도 생성
        try {
          await neo4jClient.createEntity('PROJECT', {
            id: project.id,
            name: project.projectName,
            type: project.projectType,
            status: project.status,
          });
        } catch (error) {
          console.error('Failed to create entity in Neo4j:', error);
        }
      }

      // 조직 엔티티 생성 (발주처)
      if (project.clientName) {
        const clientEntity = await prisma.ontologyEntity.findFirst({
          where: {
            name: project.clientName,
            entityType: 'ORGANIZATION',
          },
        });

        if (!clientEntity) {
          const newClient = await prisma.ontologyEntity.create({
            data: {
              entityType: 'ORGANIZATION',
              name: project.clientName,
              label: project.clientName,
              description: 'Client organization',
              properties: {},
              source: 'legacy_db',
              confidence: 1.0,
              verified: false,
            },
          });

          // PROJECT -[MANAGED_BY]-> ORGANIZATION 관계 생성
          await prisma.ontologyRelation.create({
            data: {
              fromEntityId: existingEntity?.id || project.id,
              toEntityId: newClient.id,
              relationType: 'MANAGED_BY',
              weight: 1.0,
              confidence: 1.0,
            },
          });

          extractedCount++;
        }
      }
    }

    return extractedCount;
  }

  // 5. 동기화 상태 확인
  private async checkSyncStatus(): Promise<{
    postgresqlCount: number;
    neo4jCount: number;
    inSync: boolean;
  }> {
    // PostgreSQL 엔티티 수
    const postgresqlCount = await prisma.ontologyEntity.count();

    // Neo4j 노드 수
    let neo4jCount = 0;
    try {
      const stats = await neo4jClient.getStatistics();
      neo4jCount = stats.nodeCount;
    } catch (error) {
      console.error('Failed to get Neo4j statistics:', error);
    }

    const inSync = Math.abs(postgresqlCount - neo4jCount) < 10; // 10개 이내 차이는 허용

    if (!inSync) {
      await this.log('WARNING', 'Ontology databases out of sync', {
        postgresqlCount,
        neo4jCount,
        diff: postgresqlCount - neo4jCount,
      });

      // 자동 동기화 시도
      await this.sendMessageToAgent(
        'OntologyManager',
        'SYNC_DATABASES',
        { postgresqlCount, neo4jCount },
        1
      );
    }

    return { postgresqlCount, neo4jCount, inSync };
  }

  // 6. 온톨로지 통계 수집
  private async collectOntologyStatistics(): Promise<any> {
    const entityCount = await prisma.ontologyEntity.count();
    const relationCount = await prisma.ontologyRelation.count();

    const entityTypeDistribution = await prisma.ontologyEntity.groupBy({
      by: ['entityType'],
      _count: true,
    });

    const relationTypeDistribution = await prisma.ontologyRelation.groupBy({
      by: ['relationType'],
      _count: true,
    });

    const unverifiedEntities = await prisma.ontologyEntity.count({
      where: { verified: false },
    });

    const unverifiedRelations = await prisma.ontologyRelation.count({
      where: { verified: false },
    });

    return {
      entityCount,
      relationCount,
      entityTypeDistribution,
      relationTypeDistribution,
      unverifiedEntities,
      unverifiedRelations,
      verificationRate: {
        entities:
          entityCount > 0
            ? ((entityCount - unverifiedEntities) / entityCount) * 100
            : 0,
        relations:
          relationCount > 0
            ? ((relationCount - unverifiedRelations) / relationCount) * 100
            : 0,
      },
    };
  }

  // 7. 온톨로지 최적화
  private async optimizeOntology(): Promise<{
    relationsPruned: number;
    weightsUpdated: number;
  }> {
    let relationsPruned = 0;
    let weightsUpdated = 0;

    // 가중치가 너무 낮은 관계 제거 (0.1 미만)
    const weakRelations = await prisma.ontologyRelation.findMany({
      where: { weight: { lt: 0.1 } },
    });

    for (const relation of weakRelations) {
      await prisma.ontologyRelation.delete({
        where: { id: relation.id },
      });
      relationsPruned++;
    }

    // 관계 가중치 재계산 (사용 빈도 기반)
    const relations = await prisma.ontologyRelation.findMany();

    for (const relation of relations) {
      // 간단한 예: 관계가 오래될수록 가중치 감소
      const daysSinceCreation = Math.floor(
        (Date.now() - relation.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      const newWeight = Math.max(0.1, 1.0 - daysSinceCreation * 0.01);

      if (Math.abs(Number(relation.weight) - newWeight) > 0.05) {
        await prisma.ontologyRelation.update({
          where: { id: relation.id },
          data: { weight: newWeight },
        });
        weightsUpdated++;
      }
    }

    return { relationsPruned, weightsUpdated };
  }
}
