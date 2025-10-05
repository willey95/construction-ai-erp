import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { neo4jClient } from '@/lib/neo4j/neo4jClient';

export async function GET() {
  try {
    // PostgreSQL 온톨로지 통계
    const entityCount = await prisma.ontologyEntity.count();
    const relationCount = await prisma.ontologyRelation.count();

    const entityTypeDistribution = await prisma.ontologyEntity.groupBy({
      by: ['entityType'],
      _count: {
        id: true,
      },
    });

    const relationTypeDistribution = await prisma.ontologyRelation.groupBy({
      by: ['relationType'],
      _count: {
        id: true,
      },
    });

    const unverifiedEntities = await prisma.ontologyEntity.count({
      where: { verified: false },
    });

    const unverifiedRelations = await prisma.ontologyRelation.count({
      where: { verified: false },
    });

    const stats = {
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

    // Neo4j 통계
    let neo4jStats = {
      nodeCount: 0,
      relationshipCount: 0,
      labels: [],
      relationshipTypes: [],
    };

    try {
      neo4jStats = await neo4jClient.getStatistics();
    } catch (error) {
      console.error('Failed to get Neo4j statistics:', error);
    }

    // 동기화 상태
    const syncStatus = {
      postgresqlCount: entityCount,
      neo4jCount: neo4jStats.nodeCount,
      inSync: Math.abs(entityCount - neo4jStats.nodeCount) < 10,
    };

    return NextResponse.json({
      stats,
      neo4jStats,
      syncStatus,
    });
  } catch (error: any) {
    console.error('Error fetching ontology stats:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
