import { NextRequest, NextResponse } from 'next/server';
import { ostrovokFetch } from '@/lib/ostrovok/client';
import type { OstrovokBookingStatusResponse } from '@/lib/ostrovok/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerOrderId = searchParams.get('partner_order_id');

    if (!partnerOrderId) {
      return NextResponse.json(
        { error: 'partner_order_id is required' },
        { status: 400 }
      );
    }

    const data = await ostrovokFetch<OstrovokBookingStatusResponse>(
      '/hotel/order/booking/finish/status/',
      { partner_order_id: partnerOrderId },
      { timeout: 15_000 }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error('[api/ostrovok/booking/status]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Booking status check failed' },
      { status: 502 }
    );
  }
}
