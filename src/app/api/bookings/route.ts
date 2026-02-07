import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendBookingConfirmation } from '@/lib/email';
import { maxBonusSpend } from '@/lib/loyalty';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'bookings:create');
  if (limited) return limited;

  const session = await auth();
  const body = await request.json();

  const {
    bookingId,
    hotelSlug,
    hotelName,
    roomName,
    checkIn,
    checkOut,
    nights,
    guests,
    pricePerNight,
    totalPrice,
    discount,
    finalPrice,
    paymentMethod,
    status,
    guestFirstName,
    guestLastName,
    guestEmail,
    guestPhone,
    bonusSpent,
  } = body;

  if (!bookingId || !hotelSlug || !hotelName) {
    return NextResponse.json({ error: 'Отсутствуют обязательные поля' }, { status: 400 });
  }

  // Check for duplicate bookingId
  const existing = await prisma.booking.findUnique({ where: { bookingId } });
  if (existing) {
    return NextResponse.json({ message: 'Бронирование уже сохранено' });
  }

  const bonusToSpend = bonusSpent && bonusSpent > 0 ? Math.round(bonusSpent) : 0;

  // If bonus spending requested, validate and process atomically
  if (bonusToSpend > 0 && session?.user?.id) {
    const subtotal = (totalPrice || 0);
    const maxAllowed = maxBonusSpend(subtotal, Infinity); // 50% check

    if (bonusToSpend > maxAllowed) {
      return NextResponse.json(
        { error: `Нельзя списать больше 50% от стоимости (макс. ${maxAllowed} ₽)` },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { bonusBalance: true },
    });

    if (!user || bonusToSpend > user.bonusBalance) {
      return NextResponse.json(
        { error: 'Недостаточно бонусных рублей' },
        { status: 400 }
      );
    }

    // Atomic transaction: create booking + deduct balance + log transaction
    const booking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.create({
        data: {
          bookingId,
          userId: session.user.id,
          hotelSlug,
          hotelName,
          roomName: roomName || '',
          checkIn: checkIn || '',
          checkOut: checkOut || '',
          nights: nights || 1,
          guests: guests || 1,
          pricePerNight: pricePerNight || 0,
          totalPrice: totalPrice || 0,
          discount: discount || 0,
          finalPrice: finalPrice || 0,
          bonusSpent: bonusToSpend,
          paymentMethod: paymentMethod || 'card',
          status: status || 'confirmed',
          guestFirstName: guestFirstName || '',
          guestLastName: guestLastName || '',
          guestEmail: guestEmail || '',
          guestPhone: guestPhone || '',
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: { bonusBalance: { decrement: bonusToSpend } },
      });

      await tx.bonusTransaction.create({
        data: {
          userId: session.user.id,
          amount: -bonusToSpend,
          type: 'spend',
          bookingId: b.id,
          description: `Списание за бронирование ${bookingId}`,
        },
      });

      return b;
    });

    sendBookingConfirmation(booking).catch(console.error);
    return NextResponse.json(booking, { status: 201 });
  }

  // Normal flow (no bonus)
  const booking = await prisma.booking.create({
    data: {
      bookingId,
      userId: session?.user?.id || null,
      hotelSlug,
      hotelName,
      roomName: roomName || '',
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      nights: nights || 1,
      guests: guests || 1,
      pricePerNight: pricePerNight || 0,
      totalPrice: totalPrice || 0,
      discount: discount || 0,
      finalPrice: finalPrice || 0,
      paymentMethod: paymentMethod || 'card',
      status: status || 'confirmed',
      guestFirstName: guestFirstName || '',
      guestLastName: guestLastName || '',
      guestEmail: guestEmail || '',
      guestPhone: guestPhone || '',
    },
  });

  sendBookingConfirmation(booking).catch(console.error);

  return NextResponse.json(booking, { status: 201 });
}
