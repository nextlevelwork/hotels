import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { hotelSlug: true },
  });

  return NextResponse.json(favorites.map((f) => f.hotelSlug));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { hotelSlug } = await request.json();
  if (!hotelSlug) {
    return NextResponse.json({ error: 'hotelSlug обязателен' }, { status: 400 });
  }

  await prisma.favorite.upsert({
    where: {
      userId_hotelSlug: {
        userId: session.user.id,
        hotelSlug,
      },
    },
    update: {},
    create: {
      userId: session.user.id,
      hotelSlug,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { hotelSlug } = await request.json();
  if (!hotelSlug) {
    return NextResponse.json({ error: 'hotelSlug обязателен' }, { status: 400 });
  }

  await prisma.favorite.deleteMany({
    where: {
      userId: session.user.id,
      hotelSlug,
    },
  });

  return NextResponse.json({ ok: true });
}
