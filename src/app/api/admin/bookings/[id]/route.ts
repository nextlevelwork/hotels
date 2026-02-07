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
  const { status } = body;

  if (!status || !['confirmed', 'cancelled'].includes(status)) {
    return NextResponse.json({ error: 'Некорректный статус' }, { status: 400 });
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(booking);
}
