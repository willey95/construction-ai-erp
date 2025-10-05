import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { neo4jClient } from '@/lib/neo4j/neo4jClient';
import { RelationType } from '@prisma/client';

// GET /api/ontology/relations - 관계 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const relationType = searchParams.get('type') as RelationType | null;
    const entityId = searchParams.get('entityId');
    const limit = parseInt(searchParams.get('limit') || '100');

    const where: any = {};
    if (relationType) where.relationType = relationType;
    if (entityId) {
      where.OR = [
        { fromEntityId: entityId },
        { toEntityId: entityId },
      ];
    }

    const relations = await prisma.ontologyRelation.findMany({
      where,
      take: Math.min(limit, 500),
      orderBy: { createdAt: 'desc' },
      include: {
        fromEntity: true,
        toEntity: true,
      },
    });

    return NextResponse.json({
      relations,
      count: relations.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/ontology/relations - 새 관계 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // PostgreSQL에 생성
    const relation = await prisma.ontologyRelation.create({
      data: {
        fromEntityId: body.fromEntityId,
        toEntityId: body.toEntityId,
        relationType: body.relationType,
        properties: body.properties || {},
        weight: body.weight || 1.0,
        confidence: body.confidence || 1.0,
        verified: body.verified || false,
      },
      include: {
        fromEntity: true,
        toEntity: true,
      },
    });

    // Neo4j에도 생성
    try {
      await neo4jClient.createRelation(
        relation.fromEntity.entityType,
        relation.fromEntityId,
        body.relationType,
        relation.toEntity.entityType,
        relation.toEntityId,
        body.properties || {}
      );
    } catch (error) {
      console.error('Failed to create relation in Neo4j:', error);
    }

    return NextResponse.json({
      success: true,
      relation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/ontology/relations - 관계 삭제
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Relation ID is required' },
        { status: 400 }
      );
    }

    const relation = await prisma.ontologyRelation.findUnique({
      where: { id },
      include: {
        fromEntity: true,
        toEntity: true,
      },
    });

    if (!relation) {
      return NextResponse.json(
        { error: 'Relation not found' },
        { status: 404 }
      );
    }

    // PostgreSQL에서 삭제
    await prisma.ontologyRelation.delete({
      where: { id },
    });

    // Neo4j에서도 삭제
    try {
      await neo4jClient.deleteRelation(
        relation.fromEntity.entityType,
        relation.fromEntityId,
        relation.relationType,
        relation.toEntity.entityType,
        relation.toEntityId
      );
    } catch (error) {
      console.error('Failed to delete relation from Neo4j:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Relation deleted',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
