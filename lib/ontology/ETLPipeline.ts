import { prisma } from '@/lib/prisma';
import { neo4jClient } from '@/lib/neo4j/neo4jClient';
import { ETLJobType, ETLStatus, SyncStatus } from '@prisma/client';

export interface ETLConfig {
  datasetId: string;
  jobType: ETLJobType;
  batchSize?: number;
  validateOnly?: boolean;
}

export interface ETLResult {
  jobId: string;
  status: ETLStatus;
  recordsProcessed: number;
  recordsSuccess: number;
  recordsFailed: number;
  duration: number;
  errors: any[];
}

export class ETLPipeline {
  private config: ETLConfig;
  private jobId: string | null = null;
  private startTime: number = 0;
  private errors: any[] = [];

  constructor(config: ETLConfig) {
    this.config = config;
  }

  // ETL 작업 실행
  async execute(): Promise<ETLResult> {
    this.startTime = Date.now();

    try {
      // 1. ETL Job 생성
      this.jobId = await this.createETLJob();

      // 2. 데이터셋 정보 조회
      const dataset = await prisma.dataset.findUnique({
        where: { id: this.config.datasetId },
        include: { entities: { include: { entity: true } } },
      });

      if (!dataset) {
        throw new Error(`Dataset not found: ${this.config.datasetId}`);
      }

      // 3. 소스 데이터 추출 (Extract)
      await this.updateJobStatus(ETLStatus.RUNNING);
      const sourceData = await this.extractData(dataset);

      // 4. 데이터 변환 (Transform)
      const transformedData = await this.transformData(sourceData, dataset);

      // 5. Neo4j에 로드 (Load) - 검증 모드가 아닐 때만
      if (!this.config.validateOnly) {
        await this.loadToNeo4j(transformedData);
      }

      // 6. PostgreSQL 온톨로지 테이블 동기화
      await this.syncToPostgreSQL(transformedData);

      // 7. 데이터셋 상태 업데이트
      await prisma.dataset.update({
        where: { id: this.config.datasetId },
        data: {
          syncStatus: SyncStatus.COMPLETED,
          lastSyncAt: new Date(),
          recordCount: transformedData.entities.length,
        },
      });

      // 8. Job 완료
      const duration = Date.now() - this.startTime;
      await this.completeJob(
        ETLStatus.SUCCESS,
        transformedData.entities.length,
        transformedData.entities.length,
        0,
        duration
      );

      return {
        jobId: this.jobId,
        status: ETLStatus.SUCCESS,
        recordsProcessed: transformedData.entities.length,
        recordsSuccess: transformedData.entities.length,
        recordsFailed: 0,
        duration,
        errors: this.errors,
      };
    } catch (error: any) {
      console.error('ETL execution failed:', error);
      this.errors.push({ message: error.message, stack: error.stack });

      const duration = Date.now() - this.startTime;
      if (this.jobId) {
        await this.completeJob(ETLStatus.FAILED, 0, 0, 0, duration);
      }

      return {
        jobId: this.jobId || '',
        status: ETLStatus.FAILED,
        recordsProcessed: 0,
        recordsSuccess: 0,
        recordsFailed: 0,
        duration,
        errors: this.errors,
      };
    }
  }

  // Extract: 소스에서 데이터 추출
  private async extractData(dataset: any): Promise<any[]> {
    switch (dataset.sourceType) {
      case 'POSTGRESQL':
        return await this.extractFromPostgreSQL(dataset);
      case 'NEO4J':
        return await this.extractFromNeo4j(dataset);
      case 'REST_API':
        return await this.extractFromAPI(dataset);
      case 'FILE_CSV':
      case 'FILE_EXCEL':
      case 'FILE_JSON':
        return await this.extractFromFile(dataset);
      case 'MANUAL':
        return dataset.sampleData || [];
      default:
        throw new Error(`Unsupported source type: ${dataset.sourceType}`);
    }
  }

  private async extractFromPostgreSQL(dataset: any): Promise<any[]> {
    const config = dataset.sourceConfig;
    const tableName = config.table;
    const columns = config.columns || '*';

    // Prisma를 통한 raw query
    const result = await prisma.$queryRawUnsafe(
      `SELECT ${columns} FROM ${tableName}`
    );

    return result as any[];
  }

  private async extractFromNeo4j(dataset: any): Promise<any[]> {
    const config = dataset.sourceConfig;
    const cypherQuery = config.query;

    const result = await neo4jClient.runQuery(cypherQuery);
    return result.records.map((record) => record.toObject());
  }

  private async extractFromAPI(dataset: any): Promise<any[]> {
    const config = dataset.sourceConfig;
    const response = await fetch(config.url, {
      method: config.method || 'GET',
      headers: config.headers || {},
    });

    return await response.json();
  }

  private async extractFromFile(dataset: any): Promise<any[]> {
    // 파일 처리는 추후 구현
    return dataset.sampleData || [];
  }

  // Transform: 데이터 변환 및 매핑
  private async transformData(
    sourceData: any[],
    dataset: any
  ): Promise<{ entities: any[]; relations: any[] }> {
    const entities: any[] = [];
    const relations: any[] = [];

    for (const record of sourceData) {
      // 엔티티 매핑
      for (const mapping of dataset.entities) {
        const entity = mapping.entity;
        const sourceField = mapping.sourceField;
        const mappingRule = mapping.mappingRule || {};

        const transformedEntity = {
          id: record[sourceField] || crypto.randomUUID(),
          entityType: entity.entityType,
          name: record[mappingRule.nameField || 'name'] || '',
          label: record[mappingRule.labelField || 'label'] || '',
          description: record[mappingRule.descriptionField || 'description'] || '',
          properties: this.applyMappingRule(record, mappingRule),
          source: 'etl',
          confidence: 1.0,
          verified: false,
        };

        entities.push(transformedEntity);
      }

      // 관계 추출 (설정된 경우)
      if (dataset.sourceConfig.relationMappings) {
        for (const relMapping of dataset.sourceConfig.relationMappings) {
          relations.push({
            fromId: record[relMapping.fromField],
            toId: record[relMapping.toField],
            relationType: relMapping.type,
            properties: relMapping.properties || {},
            weight: 1.0,
            confidence: 1.0,
          });
        }
      }
    }

    return { entities, relations };
  }

  private applyMappingRule(record: any, rule: any): any {
    const properties: any = {};

    if (rule.propertyMappings) {
      for (const [targetProp, sourceProp] of Object.entries(
        rule.propertyMappings
      )) {
        properties[targetProp] = record[sourceProp as string];
      }
    }

    return properties;
  }

  // Load: Neo4j에 데이터 로드
  private async loadToNeo4j(data: {
    entities: any[];
    relations: any[];
  }): Promise<void> {
    // 1. 엔티티 생성
    for (const entity of data.entities) {
      await neo4jClient.createEntity(entity.entityType, {
        id: entity.id,
        name: entity.name,
        label: entity.label,
        description: entity.description,
        ...(entity.properties as Record<string, any>),
      });
    }

    // 2. 관계 생성
    for (const relation of data.relations) {
      try {
        await neo4jClient.runQuery(
          `MATCH (from {id: $fromId}), (to {id: $toId})
           CREATE (from)-[r:${relation.relationType} $props]->(to)
           RETURN r`,
          {
            fromId: relation.fromId,
            toId: relation.toId,
            props: relation.properties,
          }
        );
      } catch (error) {
        console.error('Failed to create relation:', error);
        this.errors.push({ relation, error });
      }
    }
  }

  // PostgreSQL 온톨로지 테이블 동기화
  private async syncToPostgreSQL(data: {
    entities: any[];
    relations: any[];
  }): Promise<void> {
    // 1. 엔티티 저장
    for (const entity of data.entities) {
      await prisma.ontologyEntity.upsert({
        where: { id: entity.id },
        create: {
          id: entity.id,
          entityType: entity.entityType,
          name: entity.name,
          label: entity.label,
          description: entity.description,
          properties: entity.properties,
          source: entity.source,
          confidence: entity.confidence,
          verified: entity.verified,
        },
        update: {
          name: entity.name,
          label: entity.label,
          description: entity.description,
          properties: entity.properties,
        },
      });
    }

    // 2. 관계 저장
    for (const relation of data.relations) {
      try {
        const fromEntity = await prisma.ontologyEntity.findFirst({
          where: { id: relation.fromId },
        });
        const toEntity = await prisma.ontologyEntity.findFirst({
          where: { id: relation.toId },
        });

        if (fromEntity && toEntity) {
          await prisma.ontologyRelation.create({
            data: {
              fromEntityId: fromEntity.id,
              toEntityId: toEntity.id,
              relationType: relation.relationType,
              properties: relation.properties,
              weight: relation.weight,
              confidence: relation.confidence,
            },
          });
        }
      } catch (error) {
        console.error('Failed to sync relation to PostgreSQL:', error);
      }
    }
  }

  // ETL Job 생성
  private async createETLJob(): Promise<string> {
    const job = await prisma.eTLJob.create({
      data: {
        datasetId: this.config.datasetId,
        jobType: this.config.jobType,
        status: ETLStatus.QUEUED,
      },
    });
    return job.id;
  }

  // Job 상태 업데이트
  private async updateJobStatus(status: ETLStatus): Promise<void> {
    if (!this.jobId) return;

    await prisma.eTLJob.update({
      where: { id: this.jobId },
      data: {
        status,
        startedAt: status === ETLStatus.RUNNING ? new Date() : undefined,
      },
    });
  }

  // Job 완료
  private async completeJob(
    status: ETLStatus,
    processed: number,
    success: number,
    failed: number,
    duration: number
  ): Promise<void> {
    if (!this.jobId) return;

    await prisma.eTLJob.update({
      where: { id: this.jobId },
      data: {
        status,
        completedAt: new Date(),
        duration,
        recordsProcessed: processed,
        recordsSuccess: success,
        recordsFailed: failed,
        errorLog: this.errors.length > 0 ? this.errors : undefined,
      },
    });
  }
}

// Helper: ETL 작업 실행 함수
export async function runETL(config: ETLConfig): Promise<ETLResult> {
  const pipeline = new ETLPipeline(config);
  return await pipeline.execute();
}
