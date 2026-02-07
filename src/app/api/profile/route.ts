import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, emailNotifications: true, emailVerified: true, createdAt: true, passwordHash: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  }

  const { passwordHash, ...rest } = user;
  return NextResponse.json({ ...rest, hasPassword: !!passwordHash });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const body = await request.json();
  const { name, phone, currentPassword, newPassword, emailNotifications } = body;

  // If changing password
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Введите текущий пароль' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.passwordHash) {
      return NextResponse.json({ error: 'Пароль не установлен' }, { status: 400 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Неверный текущий пароль' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Новый пароль должен быть не менее 6 символов' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ message: 'Пароль обновлён' });
  }

  // Update profile fields
  const updateData: Record<string, string | boolean> = {};
  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (typeof emailNotifications === 'boolean') updateData.emailNotifications = emailNotifications;

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: { id: true, name: true, email: true, phone: true, emailNotifications: true },
  });

  return NextResponse.json(updated);
}
