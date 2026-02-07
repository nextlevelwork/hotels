import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalBookings, totalUsers, revenue, bookingsToday, recentBookings, totalReviews, rejectedReviews] =
    await Promise.all([
      prisma.booking.count(),
      prisma.user.count(),
      prisma.booking.aggregate({ _sum: { finalPrice: true } }),
      prisma.booking.count({ where: { createdAt: { gte: today } } }),
      prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.review.count(),
      prisma.review.count({ where: { status: 'rejected' } }),
    ]);

  return NextResponse.json({
    totalBookings,
    totalUsers,
    totalRevenue: revenue._sum.finalPrice || 0,
    bookingsToday,
    recentBookings,
    totalReviews,
    rejectedReviews,
  });
}
