#!/usr/bin/env tsx

/**
 * Neo4j 초기화 스크립트
 *
 * 이 스크립트는 Neo4j 데이터베이스에 필요한 제약 조건과 인덱스를 생성합니다.
 */

import { neo4jClient } from '../lib/neo4j/neo4jClient';

async function initializeNeo4j() {
  console.log('🚀 Neo4j 초기화 시작...\n');

  try {
    // Neo4j 연결
    neo4jClient.connect(
      process.env.NEO4J_URI,
      process.env.NEO4J_USERNAME,
      process.env.NEO4J_PASSWORD
    );

    console.log('✅ Neo4j 연결 성공\n');

    // 제약 조건 생성 (UNIQUE 제약)
    console.log('📋 제약 조건 생성 중...');

    const constraints = [
      { label: 'PROJECT', property: 'id' },
      { label: 'ORGANIZATION', property: 'id' },
      { label: 'USER', property: 'id' },
      { label: 'FINANCIAL_PLAN', property: 'id' },
      { label: 'CASH_FLOW', property: 'id' },
      { label: 'SCHEDULE', property: 'id' },
      { label: 'PROGRESS', property: 'id' },
      { label: 'RISK_ASSESSMENT', property: 'id' },
      { label: 'ASSUMPTION', property: 'id' },
    ];

    for (const { label, property } of constraints) {
      try {
        await neo4jClient.runQuery(
          `CREATE CONSTRAINT ${label.toLowerCase()}_${property}_unique IF NOT EXISTS
           FOR (n:${label}) REQUIRE n.${property} IS UNIQUE`
        );
        console.log(`  ✓ ${label}.${property} 제약 조건 생성`);
      } catch (error: any) {
        // 이미 존재하는 제약 조건은 무시
        if (!error.message.includes('already exists')) {
          console.warn(`  ⚠ ${label}.${property} 제약 조건 생성 실패:`, error.message);
        } else {
          console.log(`  ✓ ${label}.${property} 제약 조건 (이미 존재)`);
        }
      }
    }

    console.log('\n📊 인덱스 생성 중...');

    // 인덱스 생성 (검색 성능 향상)
    const indexes = [
      { label: 'PROJECT', property: 'projectCode' },
      { label: 'PROJECT', property: 'status' },
      { label: 'ORGANIZATION', property: 'name' },
      { label: 'USER', property: 'email' },
      { label: 'FINANCIAL_PLAN', property: 'projectId' },
      { label: 'SCHEDULE', property: 'projectId' },
    ];

    for (const { label, property } of indexes) {
      try {
        await neo4jClient.runQuery(
          `CREATE INDEX ${label.toLowerCase()}_${property}_index IF NOT EXISTS
           FOR (n:${label}) ON (n.${property})`
        );
        console.log(`  ✓ ${label}.${property} 인덱스 생성`);
      } catch (error: any) {
        if (!error.message.includes('already exists')) {
          console.warn(`  ⚠ ${label}.${property} 인덱스 생성 실패:`, error.message);
        } else {
          console.log(`  ✓ ${label}.${property} 인덱스 (이미 존재)`);
        }
      }
    }

    // 통계 확인
    console.log('\n📈 Neo4j 통계 확인...');
    const stats = await neo4jClient.getStatistics();

    console.log(`  - 노드 수: ${stats.nodeCount}`);
    console.log(`  - 관계 수: ${stats.relationshipCount}`);
    console.log(`  - 레이블: ${stats.labels.join(', ') || '없음'}`);
    console.log(`  - 관계 타입: ${stats.relationshipTypes.join(', ') || '없음'}`);

    console.log('\n✅ Neo4j 초기화 완료!\n');

  } catch (error) {
    console.error('\n❌ Neo4j 초기화 실패:', error);
    process.exit(1);
  } finally {
    await neo4jClient.disconnect();
  }
}

// 스크립트 실행
initializeNeo4j();
