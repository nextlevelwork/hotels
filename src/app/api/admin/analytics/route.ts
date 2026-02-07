import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const groupBy = searchParams.get('groupBy') || 'day';

  const dateFilter: Record<string, unknown> = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.lte = end;
  }

  const where = Object.keys(dateFilter).length > 0
    ? { createdAt: dateFilter }
    : {};

  // Fetch all bookings in range for grouping
  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      hotelName: true,
      finalPrice: true,
      paymentMethod: true,
      status: true,
      nights: true,
      createdAt: true,
    },
  });

  // Group revenue by period
  const revenueMap = new Map<string, { amount: number; count: number }>();
  for (const b of bookings) {
    const key = getGroupKey(b.createdAt, groupBy);
    const existing = revenueMap.get(key) || { amount: 0, count: 0 };
    existing.amount += b.finalPrice;
    existing.count += 1;
    revenueMap.set(key, existing);
  }

  const revenue = Array.from(revenueMap.entries()).map(([date, data]) => ({
    date,
    amount: data.amount,
    count: data.count,
  }));

  // Bookings by status
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
  const cancelled = bookings.filter((b) => b.status === 'cancelled').length;

  // Top 5 hotels by revenue
  const hotelMap = new Map<string, { revenue: number; bookings: number }>();
  for (const b of bookings) {
    const existing = hotelMap.get(b.hotelName) || { revenue: 0, bookings: 0 };
    existing.revenue += b.finalPrice;
    existing.bookings += 1;
    hotelMap.set(b.hotelName, existing);
  }

  const topHotels = Array.from(hotelMap.entries())
    .map(([hotelName, data]) => ({ hotelName, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Payment methods distribution
  const paymentMethods: Record<string, number> = {};
  for (const b of bookings) {
    const method = b.paymentMethod || 'unknown';
    paymentMethods[method] = (paymentMethods[method] || 0) + 1;
  }

  // Average booking
  const totalRevenue = bookings.reduce((sum, b) => sum + b.finalPrice, 0);
  const totalNights = bookings.reduce((sum, b) => sum + b.nights, 0);
  const averageBooking = {
    averageCheck: bookings.length > 0 ? Math.round(totalRevenue / bookings.length) : 0,
    averageNights: bookings.length > 0 ? Math.round((totalNights / bookings.length) * 10) / 10 : 0,
  };

  return NextResponse.json({
    revenue,
    bookingsByStatus: { confirmed, cancelled },
    topHotels,
    paymentMethods,
    averageBooking,
  });
}

function getGroupKey(date: Date, groupBy: string): string {
  const d = new Date(date);
  if (groupBy === 'month') {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  if (groupBy === 'week') {
    // Get Monday of the week
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  }
  // day
  return d.toISOString().split('T')[0];
}
