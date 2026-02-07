import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/email';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const limited = applyRateLimit(request, RATE_LIMITS.auth, 'auth:resend');
  if (limited) return limited;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email уже подтверждён' });
    }

    const token = await generateVerificationToken(user.email);
    await sendVerificationEmail(user.email, token);

    return NextResponse.json({ message: 'Письмо отправлено' });
  } catch {
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 },
    );
  }
}
