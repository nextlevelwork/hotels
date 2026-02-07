import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const reviews = await prisma.review.findMany({
    where: { userId: session.user.id },
    select: { hotelSlug: true },
  });

  const slugs = reviews.map((r) => r.hotelSlug);

  return NextResponse.json(slugs);
}
