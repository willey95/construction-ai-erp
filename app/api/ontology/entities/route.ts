import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { neo4jClient } from '@/lib/neo4j/neo4jClient';
import { EntityType } from '@prisma/client';

// GET /api/ontology/entities - 엔티티 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entityType = searchParams.get('type') as EntityType | null;
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { label: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const entities = await prisma.ontologyEntity.findMany({
      where,
      take: Math.min(limit, 500),
      orderBy: { createdAt: 'desc' },
      include: {
        outgoingRelations: {
          include: { toEntity: true },
          take: 5,
        },
        incomingRelations: {
          include: { fromEntity: true },
          take: 5,
        },
      },
    });

    return NextResponse.json({
      entities,
      count: entities.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/ontology/entities - 새 엔티티 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // PostgreSQL에 생성
    const entity = await prisma.ontologyEntity.create({
      data: {
        entityType: body.entityType,
        name: body.name,
        label: body.label,
        description: body.description || '',
        properties: body.properties || {},
        source: body.source || 'manual',
        confidence: body.confidence || 1.0,
        verified: body.verified || false,
        createdBy: body.createdBy,
      },
    });

    // Neo4j에도 생성
    try {
      await neo4jClient.createEntity(body.entityType, {
        id: entity.id,
        name: entity.name,
        label: entity.label,
        description: entity.description,
        ...entity.properties,
      });
    } catch (error) {
      console.error('Failed to create entity in Neo4j:', error);
    }

    return NextResponse.json({
      success: true,
      entity,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/ontology/entities - 엔티티 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const entity = await prisma.ontologyEntity.update({
      where: { id },
      data: updateData,
    });

    // Neo4j도 업데이트
    try {
      await neo4jClient.updateEntity(entity.entityType, id, {
        name: entity.name,
        label: entity.label,
        description: entity.description,
        ...entity.properties,
      });
    } catch (error) {
      console.error('Failed to update entity in Neo4j:', error);
    }

    return NextResponse.json({
      success: true,
      entity,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/ontology/entities - 엔티티 삭제
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Entity ID is required' },
        { status: 400 }
      );
    }

    const entity = await prisma.ontologyEntity.findUnique({
      where: { id },
    });

    if (!entity) {
      return NextResponse.json(
        { error: 'Entity not found' },
        { status: 404 }
      );
    }

    // PostgreSQL에서 삭제 (관계도 CASCADE로 삭제됨)
    await prisma.ontologyEntity.delete({
      where: { id },
    });

    // Neo4j에서도 삭제
    try {
      await neo4jClient.deleteEntity(entity.entityType, id);
    } catch (error) {
      console.error('Failed to delete entity from Neo4j:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Entity deleted',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
