import { NextRequest, NextResponse } from 'next/server';
import { ostrovokFetch } from '@/lib/ostrovok/client';
import type { OstrovokBookingFormResponse } from '@/lib/ostrovok/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partner_order_id, book_hash, language = 'ru' } = body;

    if (!partner_order_id || !book_hash) {
      return NextResponse.json(
        { error: 'partner_order_id and book_hash are required' },
        { status: 400 }
      );
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const userIp = forwarded?.split(',')[0]?.trim() || '127.0.0.1';

    const data = await ostrovokFetch<OstrovokBookingFormResponse>(
      '/hotel/order/booking/form/',
      {
        partner_order_id,
        book_hash,
        language,
        user_ip: userIp,
      },
      { timeout: 30_000 }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error('[api/ostrovok/booking/form]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Booking form failed' },
      { status: 502 }
    );
  }
}
