import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { getTierBySpent } from '@/lib/loyalty';

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      bonusBalance: true,
      bookings: {
        where: { status: 'confirmed' },
        select: { finalPrice: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const result = users.map((u) => {
    const totalSpent = u.bookings.reduce((sum, b) => sum + b.finalPrice, 0);
    const tier = getTierBySpent(totalSpent);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      bonusBalance: u.bonusBalance,
      totalSpent,
      tier: tier.label,
      tierColor: tier.color,
      tierBgColor: tier.bgColor,
    };
  });

  return NextResponse.json(result);
}
