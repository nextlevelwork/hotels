import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id } = await params;

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    return NextResponse.json({ error: 'Отзыв не найден' }, { status: 404 });
  }

  // Only owner or admin can delete
  if (review.userId !== session.user.id && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
  }

  await prisma.review.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
