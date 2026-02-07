import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendCheckinReminder, sendReviewRequest } from '@/lib/email';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD

  let checkinReminders = 0;
  let reviewRequests = 0;

  // 1. Check-in reminders: checkIn = tomorrow, status=confirmed
  const checkinBookings = await prisma.booking.findMany({
    where: {
      checkIn: tomorrowStr,
      status: 'confirmed',
      NOT: { notificationsSent: { contains: 'checkin_reminder' } },
      user: {
        emailNotifications: true,
      },
    },
    include: {
      user: { select: { id: true } },
    },
  });

  for (const booking of checkinBookings) {
    try {
      await sendCheckinReminder(booking);
      const sent = booking.notificationsSent
        ? `${booking.notificationsSent},checkin_reminder`
        : 'checkin_reminder';
      await prisma.booking.update({
        where: { id: booking.id },
        data: { notificationsSent: sent },
      });
      checkinReminders++;
    } catch (e) {
      console.error(`Failed to send checkin reminder for booking ${booking.id}:`, e);
    }
  }

  // 2. Review requests: checkOut = yesterday, status=confirmed
  const reviewBookings = await prisma.booking.findMany({
    where: {
      checkOut: yesterdayStr,
      status: 'confirmed',
      NOT: { notificationsSent: { contains: 'review_request' } },
      user: {
        emailNotifications: true,
      },
    },
    include: {
      user: { select: { id: true, bonusBalance: true } },
    },
  });

  for (const booking of reviewBookings) {
    try {
      await sendReviewRequest(booking, booking.bonusEarned);
      const sent = booking.notificationsSent
        ? `${booking.notificationsSent},review_request`
        : 'review_request';
      await prisma.booking.update({
        where: { id: booking.id },
        data: { notificationsSent: sent },
      });
      reviewRequests++;
    } catch (e) {
      console.error(`Failed to send review request for booking ${booking.id}:`, e);
    }
  }

  return NextResponse.json({
    checkinReminders,
    reviewRequests,
    date: now.toISOString().split('T')[0],
  });
}
