import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/email';

const registerSchema = z.object({
  name: z.string().min(2, 'Имя должно быть не менее 2 символов'),
  email: z.string().email('Некорректный email'),
  phone: z.string().min(10, 'Некорректный телефон').optional(),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже зарегистрирован' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash },
      select: { id: true, name: true, email: true },
    });

    // Send verification email (non-blocking, don't fail registration if email fails)
    generateVerificationToken(email)
      .then((token) => sendVerificationEmail(email, token))
      .catch(() => {});

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
