import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface YooKassaWebhookEvent {
  type: string;
  event: string;
  object: {
    id: string;
    status: string;
    metadata?: {
      bookingId?: string;
    };
  };
}

export async function POST(request: Request) {
  let body: YooKassaWebhookEvent;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { event, object } = body;
  const paymentId = object?.id;
  const bookingId = object?.metadata?.bookingId;

  if (!paymentId) {
    return NextResponse.json({ error: 'Missing payment id' }, { status: 400 });
  }

  if (event === 'payment.succeeded') {
    // Find booking by paymentId or bookingId
    const where = bookingId
      ? { bookingId }
      : { paymentId };

    await prisma.booking.updateMany({
      where,
      data: {
        paymentStatus: 'succeeded',
        status: 'confirmed',
      },
    });
  } else if (event === 'payment.canceled') {
    const where = bookingId
      ? { bookingId }
      : { paymentId };

    await prisma.booking.updateMany({
      where,
      data: {
        paymentStatus: 'canceled',
        status: 'payment_failed',
      },
    });
  }

  return NextResponse.json({ ok: true });
}
