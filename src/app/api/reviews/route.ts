import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const hotelSlug = request.nextUrl.searchParams.get('hotelSlug');
  if (!hotelSlug) {
    return NextResponse.json({ error: 'hotelSlug required' }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { hotelSlug, status: 'approved' },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(reviews);
}

const TRAVELER_TYPES = ['business', 'couple', 'family', 'solo', 'friends'];

export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, RATE_LIMITS.api, 'reviews:create');
  if (limited) return limited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const body = await request.json();
  const { hotelSlug, rating, title, text, pros, cons, travelerType } = body;

  // Validation
  if (!hotelSlug || typeof hotelSlug !== 'string') {
    return NextResponse.json({ error: 'hotelSlug обязателен' }, { status: 400 });
  }
  if (!rating || typeof rating !== 'number' || rating < 1 || rating > 10) {
    return NextResponse.json({ error: 'Рейтинг должен быть от 1 до 10' }, { status: 400 });
  }
  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    return NextResponse.json({ error: 'Заголовок минимум 3 символа' }, { status: 400 });
  }
  if (!text || typeof text !== 'string' || text.trim().length < 10) {
    return NextResponse.json({ error: 'Текст отзыва минимум 10 символов' }, { status: 400 });
  }
  if (!travelerType || !TRAVELER_TYPES.includes(travelerType)) {
    return NextResponse.json({ error: 'Укажите тип путешественника' }, { status: 400 });
  }

  // Check: user has a confirmed booking with checkOut < today
  const today = new Date().toISOString().split('T')[0];
  const hasBooking = await prisma.booking.findFirst({
    where: {
      userId: session.user.id,
      hotelSlug,
      status: 'confirmed',
      checkOut: { lt: today },
    },
  });

  if (!hasBooking) {
    return NextResponse.json(
      { error: 'Отзыв можно оставить только после выезда из отеля' },
      { status: 403 }
    );
  }

  // Create review (catch unique constraint error)
  try {
    const review = await prisma.review.create({
      data: {
        hotelSlug,
        userId: session.user.id,
        authorName: session.user.name || 'Гость',
        rating,
        title: title.trim(),
        text: text.trim(),
        pros: pros?.trim() || null,
        cons: cons?.trim() || null,
        travelerType,
        status: 'approved',
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Вы уже оставили отзыв об этом отеле' },
        { status: 409 }
      );
    }
    throw err;
  }
}
