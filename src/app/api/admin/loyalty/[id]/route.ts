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
  const { amount, description } = body;

  if (typeof amount !== 'number' || amount === 0) {
    return NextResponse.json({ error: 'Некорректная сумма' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { bonusBalance: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  }

  const newBalance = user.bonusBalance + amount;
  if (newBalance < 0) {
    return NextResponse.json({ error: 'Баланс не может быть отрицательным' }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: { bonusBalance: newBalance },
    }),
    prisma.bonusTransaction.create({
      data: {
        userId: id,
        amount,
        type: 'admin_adjust',
        description: description || `Корректировка администратором (${amount > 0 ? '+' : ''}${amount})`,
      },
    }),
  ]);

  return NextResponse.json({ bonusBalance: newBalance });
}
