import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/tokens';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

const schema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

export async function POST(request: Request) {
  const limited = applyRateLimit(request, RATE_LIMITS.auth, 'auth:reset');
  if (limited) return limited;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email, token, password } = parsed.data;

    const valid = await verifyToken(email, token);
    if (!valid) {
      return NextResponse.json(
        { error: 'Ссылка недействительна или истекла. Запросите сброс пароля заново.' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    return NextResponse.json({ message: 'Пароль успешно изменён' });
  } catch {
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 },
    );
  }
}
