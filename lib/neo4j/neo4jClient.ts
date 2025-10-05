import neo4j, { Driver, Session, Result } from 'neo4j-driver';

class Neo4jClient {
  private driver: Driver | null = null;
  private static instance: Neo4jClient;

  private constructor() {}

  static getInstance(): Neo4jClient {
    if (!Neo4jClient.instance) {
      Neo4jClient.instance = new Neo4jClient();
    }
    return Neo4jClient.instance;
  }

  connect(uri?: string, username?: string, password?: string): void {
    const NEO4J_URI = uri || process.env.NEO4J_URI || 'neo4j://localhost:7687';
    const NEO4J_USERNAME = username || process.env.NEO4J_USERNAME || 'neo4j';
    const NEO4J_PASSWORD = password || process.env.NEO4J_PASSWORD || 'password';

    if (this.driver) {
      console.log('Neo4j driver already connected');
      return;
    }

    this.driver = neo4j.driver(
      NEO4J_URI,
      neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
    );

    console.log('Neo4j driver connected');
  }

  async disconnect(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
      console.log('Neo4j driver disconnected');
    }
  }

  getSession(): Session {
    if (!this.driver) {
      throw new Error('Neo4j driver not connected. Call connect() first.');
    }
    return this.driver.session();
  }

  // 엔티티 생성
  async createEntity(
    entityType: string,
    properties: Record<string, any>
  ): Promise<any> {
    const session = this.getSession();
    try {
      const result = await session.run(
        `CREATE (e:${entityType} $props) RETURN e`,
        { props: properties }
      );
      return result.records[0]?.get('e').properties;
    } finally {
      await session.close();
    }
  }

  // 엔티티 조회
  async getEntity(entityType: string, id: string): Promise<any> {
    const session = this.getSession();
    try {
      const result = await session.run(
        `MATCH (e:${entityType} {id: $id}) RETURN e`,
        { id }
      );
      return result.records[0]?.get('e').properties;
    } finally {
      await session.close();
    }
  }

  // 엔티티 업데이트
  async updateEntity(
    entityType: string,
    id: string,
    properties: Record<string, any>
  ): Promise<any> {
    const session = this.getSession();
    try {
      const result = await session.run(
        `MATCH (e:${entityType} {id: $id}) SET e += $props RETURN e`,
        { id, props: properties }
      );
      return result.records[0]?.get('e').properties;
    } finally {
      await session.close();
    }
  }

  // 엔티티 삭제
  async deleteEntity(entityType: string, id: string): Promise<void> {
    const session = this.getSession();
    try {
      await session.run(
        `MATCH (e:${entityType} {id: $id}) DETACH DELETE e`,
        { id }
      );
    } finally {
      await session.close();
    }
  }

  // 관계 생성
  async createRelation(
    fromEntityType: string,
    fromId: string,
    relationType: string,
    toEntityType: string,
    toId: string,
    properties?: Record<string, any>
  ): Promise<any> {
    const session = this.getSession();
    try {
      const query = properties
        ? `MATCH (from:${fromEntityType} {id: $fromId}), (to:${toEntityType} {id: $toId})
           CREATE (from)-[r:${relationType} $props]->(to) RETURN r`
        : `MATCH (from:${fromEntityType} {id: $fromId}), (to:${toEntityType} {id: $toId})
           CREATE (from)-[r:${relationType}]->(to) RETURN r`;

      const result = await session.run(query, {
        fromId,
        toId,
        props: properties || {},
      });

      return result.records[0]?.get('r').properties;
    } finally {
      await session.close();
    }
  }

  // 관계 삭제
  async deleteRelation(
    fromEntityType: string,
    fromId: string,
    relationType: string,
    toEntityType: string,
    toId: string
  ): Promise<void> {
    const session = this.getSession();
    try {
      await session.run(
        `MATCH (from:${fromEntityType} {id: $fromId})-[r:${relationType}]->(to:${toEntityType} {id: $toId})
         DELETE r`,
        { fromId, toId }
      );
    } finally {
      await session.close();
    }
  }

  // Cypher 쿼리 실행
  async runQuery(query: string, params?: Record<string, any>): Promise<Result> {
    const session = this.getSession();
    try {
      return await session.run(query, params || {});
    } finally {
      await session.close();
    }
  }

  // 그래프 탐색: 특정 엔티티와 연결된 모든 엔티티 조회
  async getConnectedEntities(
    entityType: string,
    id: string,
    depth: number = 1
  ): Promise<any[]> {
    const session = this.getSession();
    try {
      const result = await session.run(
        `MATCH (start:${entityType} {id: $id})-[*1..${depth}]-(connected)
         RETURN DISTINCT connected`,
        { id }
      );
      return result.records.map((record) => record.get('connected').properties);
    } finally {
      await session.close();
    }
  }

  // 경로 찾기
  async findPath(
    fromEntityType: string,
    fromId: string,
    toEntityType: string,
    toId: string
  ): Promise<any> {
    const session = this.getSession();
    try {
      const result = await session.run(
        `MATCH path = shortestPath(
           (from:${fromEntityType} {id: $fromId})-[*]-(to:${toEntityType} {id: $toId})
         )
         RETURN path`,
        { fromId, toId }
      );

      if (result.records.length === 0) return null;

      const path = result.records[0].get('path');
      return {
        length: path.length,
        nodes: path.segments.map((seg: any) => ({
          start: seg.start.properties,
          end: seg.end.properties,
          relationship: seg.relationship.properties,
        })),
      };
    } finally {
      await session.close();
    }
  }

  // 통계 조회
  async getStatistics(): Promise<{
    nodeCount: number;
    relationshipCount: number;
    labels: string[];
    relationshipTypes: string[];
  }> {
    const session = this.getSession();
    try {
      // 노드 수
      const nodeCountResult = await session.run('MATCH (n) RETURN count(n) as count');
      const nodeCount = nodeCountResult.records[0].get('count').toNumber();

      // 관계 수
      const relCountResult = await session.run('MATCH ()-[r]->() RETURN count(r) as count');
      const relationshipCount = relCountResult.records[0].get('count').toNumber();

      // 레이블 목록
      const labelsResult = await session.run('CALL db.labels()');
      const labels = labelsResult.records.map((record) => record.get('label'));

      // 관계 타입 목록
      const relTypesResult = await session.run('CALL db.relationshipTypes()');
      const relationshipTypes = relTypesResult.records.map((record) =>
        record.get('relationshipType')
      );

      return {
        nodeCount,
        relationshipCount,
        labels,
        relationshipTypes,
      };
    } finally {
      await session.close();
    }
  }
}

// Singleton export
export const neo4jClient = Neo4jClient.getInstance();

// 자동 연결 (환경 변수 사용)
if (typeof window === 'undefined') {
  try {
    neo4jClient.connect();
  } catch (error) {
    console.warn('Neo4j auto-connect failed:', error);
  }
}
