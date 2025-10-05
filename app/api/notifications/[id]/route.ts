import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            projectCode: true,
            projectName: true,
          },
        },
      },
    });

    if (!notification) {
      return NextResponse.json({ error: '알림을 찾을 수 없습니다' }, { status: 404 });
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error('알림 조회 실패:', error);
    return NextResponse.json({ error: '알림 조회 실패' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const updateData: any = {};

    if (body.isRead !== undefined) {
      updateData.isRead = body.isRead;
      if (body.isRead && !body.readAt) {
        updateData.readAt = new Date();
      }
    }

    if (body.isArchived !== undefined) {
      updateData.isArchived = body.isArchived;
    }

    if (body.actionTaken !== undefined) {
      updateData.actionTaken = body.actionTaken;
      if (body.actionTaken && !body.actionTakenAt) {
        updateData.actionTakenAt = new Date();
      }
    }

    const notification = await prisma.notification.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('알림 수정 실패:', error);
    return NextResponse.json({ error: '알림 수정 실패' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.notification.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: '알림이 삭제되었습니다' });
  } catch (error) {
    console.error('알림 삭제 실패:', error);
    return NextResponse.json({ error: '알림 삭제 실패' }, { status: 500 });
  }
}
