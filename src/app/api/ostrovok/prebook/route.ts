import { NextRequest, NextResponse } from 'next/server';
import { ostrovokFetch } from '@/lib/ostrovok/client';
import type { OstrovokBookingFormResponse } from '@/lib/ostrovok/types';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { book_hash, language = 'ru' } = body;

    if (!book_hash) {
      return NextResponse.json(
        { error: 'book_hash is required' },
        { status: 400 }
      );
    }

    // Get user IP for the API
    const forwarded = request.headers.get('x-forwarded-for');
    const userIp = forwarded?.split(',')[0]?.trim() || '127.0.0.1';

    const partnerOrderId = randomUUID();

    const data = await ostrovokFetch<OstrovokBookingFormResponse>(
      '/hotel/order/booking/form/',
      {
        partner_order_id: partnerOrderId,
        book_hash,
        language,
        user_ip: userIp,
      },
      { timeout: 30_000 }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error('[api/ostrovok/prebook]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Prebook failed' },
      { status: 502 }
    );
  }
}
