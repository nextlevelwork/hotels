import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { role } = body;

  if (!role || !['user', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Некорректная роль' }, { status: 400 });
  }

  // Cannot remove admin from yourself
  if (id === session.user.id && role !== 'admin') {
    return NextResponse.json(
      { error: 'Нельзя снять роль admin у самого себя' },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(user);
}
