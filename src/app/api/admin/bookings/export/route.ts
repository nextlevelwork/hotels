import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const status = searchParams.get('status') || '';

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }

  const dateFilter: Record<string, unknown> = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.lte = end;
  }
  if (Object.keys(dateFilter).length > 0) {
    where.createdAt = dateFilter;
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  const header = [
    'ID', 'Отель', 'Комната', 'Гость', 'Email', 'Телефон',
    'Заезд', 'Выезд', 'Ночи', 'Цена за ночь', 'Скидка', 'Итого',
    'Бонусы списаны', 'Способ оплаты', 'Статус', 'Дата создания',
  ];

  const rows = bookings.map((b) => [
    b.bookingId,
    b.hotelName,
    b.roomName,
    `${b.guestFirstName} ${b.guestLastName}`,
    b.guestEmail,
    b.guestPhone,
    b.checkIn,
    b.checkOut,
    b.nights,
    b.pricePerNight,
    b.discount,
    b.finalPrice,
    b.bonusSpent,
    b.paymentMethod,
    b.status,
    new Date(b.createdAt).toLocaleString('ru-RU'),
  ]);

  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\n');

  // BOM for correct Excel opening
  const bom = '\uFEFF';

  return new Response(bom + csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="bookings.csv"',
    },
  });
}
