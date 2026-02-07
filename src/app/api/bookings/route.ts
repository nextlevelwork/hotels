import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
  } = body;

  if (!bookingId || !hotelSlug || !hotelName) {
    return NextResponse.json({ error: 'Отсутствуют обязательные поля' }, { status: 400 });
  }

  // Check for duplicate bookingId
  const existing = await prisma.booking.findUnique({ where: { bookingId } });
  if (existing) {
    return NextResponse.json({ message: 'Бронирование уже сохранено' });
  }

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

  return NextResponse.json(booking, { status: 201 });
}
