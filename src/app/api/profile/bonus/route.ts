import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTierBySpent, calculateBonusEarned, getNextTier } from '@/lib/loyalty';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const userId = session.user.id;

  // Auto-credit bonuses for completed bookings (checkOut < today, confirmed, bonusEarned = 0)
  const today = new Date().toISOString().split('T')[0];
  const eligibleBookings = await prisma.booking.findMany({
    where: {
      userId,
      status: 'confirmed',
      bonusEarned: 0,
      checkOut: { lt: today },
    },
  });

  if (eligibleBookings.length > 0) {
    // Calculate totalSpent from all confirmed bookings for tier calculation
    const allConfirmed = await prisma.booking.aggregate({
      where: { userId, status: 'confirmed' },
      _sum: { finalPrice: true },
    });
    const totalSpent = allConfirmed._sum.finalPrice || 0;

    for (const booking of eligibleBookings) {
      const earned = calculateBonusEarned(booking.finalPrice, totalSpent);
      if (earned > 0) {
        await prisma.$transaction([
          prisma.booking.update({
            where: { id: booking.id },
            data: { bonusEarned: earned },
          }),
          prisma.user.update({
            where: { id: userId },
            data: { bonusBalance: { increment: earned } },
          }),
          prisma.bonusTransaction.create({
            data: {
              userId,
              amount: earned,
              type: 'earn',
              bookingId: booking.id,
              description: `Кешбэк за бронирование ${booking.bookingId}`,
            },
          }),
        ]);
      }
    }
  }

  // Fetch updated user + stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { bonusBalance: true },
  });

  const totalSpentResult = await prisma.booking.aggregate({
    where: { userId, status: 'confirmed' },
    _sum: { finalPrice: true },
  });
  const totalSpent = totalSpentResult._sum.finalPrice || 0;

  const tier = getTierBySpent(totalSpent);
  const nextTier = getNextTier(totalSpent);

  const transactions = await prisma.bonusTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({
    balance: user?.bonusBalance || 0,
    totalSpent,
    tier: {
      tier: tier.tier,
      label: tier.label,
      cashbackPercent: tier.cashbackPercent,
      color: tier.color,
      bgColor: tier.bgColor,
    },
    nextTier: nextTier
      ? {
          label: nextTier.tier.label,
          remaining: nextTier.remaining,
          cashbackPercent: nextTier.tier.cashbackPercent,
        }
      : null,
    transactions: transactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      type: t.type,
      description: t.description,
      createdAt: t.createdAt.toISOString(),
    })),
  });
}
