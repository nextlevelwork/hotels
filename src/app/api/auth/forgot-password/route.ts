import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generatePasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/email';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const limited = applyRateLimit(request, RATE_LIMITS.auth, 'auth:forgot');
  if (limited) return limited;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      // Still return 200 to avoid leaking info
      return NextResponse.json({
        message: 'Если аккаунт с таким email существует, мы отправили письмо для сброса пароля',
      });
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = await generatePasswordResetToken(email);
      await sendPasswordResetEmail(email, token);
    }

    // Always return the same response
    return NextResponse.json({
      message: 'Если аккаунт с таким email существует, мы отправили письмо для сброса пароля',
    });
  } catch {
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 },
    );
  }
}
