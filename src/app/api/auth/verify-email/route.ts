import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/tokens';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const valid = await verifyToken(email, token);
    if (!valid) {
      return NextResponse.redirect(
        new URL('/auth/email-verified?error=invalid', request.url),
      );
    }

    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    return NextResponse.redirect(new URL('/auth/email-verified', request.url));
  } catch {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}
