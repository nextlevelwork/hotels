import { NextRequest, NextResponse } from 'next/server';
import { ostrovokFetch } from '@/lib/ostrovok/client';
import type { OstrovokBookingFinishResponse } from '@/lib/ostrovok/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      partnerOrderId,
      paymentType,
      amount,
      currencyCode,
      guests,
      email,
      phone,
      comment,
    } = body;

    if (!partnerOrderId || !paymentType || !amount || !guests?.length || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required booking fields' },
        { status: 400 }
      );
    }

    const data = await ostrovokFetch<OstrovokBookingFinishResponse>(
      '/hotel/order/booking/finish/',
      {
        language: 'ru',
        partner: {
          partner_order_id: partnerOrderId,
          comment: comment || '',
        },
        payment_type: {
          type: paymentType,
          amount: String(amount),
          currency_code: currencyCode || 'RUB',
        },
        rooms: [
          {
            guests: guests.map((g: { firstName: string; lastName: string }) => ({
              first_name: g.firstName,
              last_name: g.lastName,
            })),
          },
        ],
        user: {
          email,
          phone,
          comment: comment || '',
        },
      },
      { timeout: 30_000 }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error('[api/ostrovok/booking/start]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Booking start failed' },
      { status: 502 }
    );
  }
}
