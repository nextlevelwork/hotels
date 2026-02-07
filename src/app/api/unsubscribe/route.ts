import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUnsubscribeToken } from '@/lib/email';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');
  const action = searchParams.get('action'); // 'resubscribe' for re-enabling

  if (!userId || !token) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const isValid = verifyUnsubscribeToken(userId, token);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }

  const emailNotifications = action === 'resubscribe';

  await prisma.user.update({
    where: { id: userId },
    data: { emailNotifications },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || '';
  const redirectUrl = `${baseUrl}/unsubscribe?status=${emailNotifications ? 'resubscribed' : 'unsubscribed'}&userId=${userId}&token=${token}`;

  return NextResponse.redirect(redirectUrl);
}
