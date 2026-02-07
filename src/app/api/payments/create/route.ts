import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createPayment } from '@/lib/yookassa';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const body = await request.json();
  const { bookingId, amount, description, paymentMethod } = body;

  if (!bookingId || !amount) {
    return NextResponse.json({ error: 'bookingId и amount обязательны' }, { status: 400 });
  }

  // For cash payment — no online payment needed
  if (paymentMethod === 'cash') {
    await prisma.booking.updateMany({
      where: { bookingId },
      data: { paymentStatus: 'succeeded' },
    });
    return NextResponse.json({ status: 'cash', confirmationUrl: null });
  }

  const returnUrl = process.env.YOOKASSA_RETURN_URL || `${process.env.NEXTAUTH_URL}/confirmation/${bookingId}`;

  const yooMethod = paymentMethod === 'sbp' ? 'sbp' : 'bank_card';

  const payment = await createPayment({
    amount,
    description: description || `Бронирование ${bookingId}`,
    bookingId,
    returnUrl,
    paymentMethod: yooMethod,
  });

  // Save payment ID to booking
  await prisma.booking.updateMany({
    where: { bookingId },
    data: {
      paymentId: payment.id,
      paymentStatus: 'pending',
    },
  });

  const confirmationUrl = payment.confirmation?.confirmation_url || null;

  return NextResponse.json({
    paymentId: payment.id,
    confirmationUrl,
    status: payment.status,
  });
}
