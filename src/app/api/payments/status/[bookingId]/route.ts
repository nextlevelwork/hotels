import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { bookingId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { bookingId },
    select: {
      paymentStatus: true,
      paymentId: true,
      status: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: 'Бронирование не найдено' }, { status: 404 });
  }

  return NextResponse.json({
    paymentStatus: booking.paymentStatus,
    bookingStatus: booking.status,
    paymentId: booking.paymentId,
  });
}
