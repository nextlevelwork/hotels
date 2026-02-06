import { NextRequest, NextResponse } from 'next/server';
import { ostrovokFetch } from '@/lib/ostrovok/client';
import type { OstrovokHotelpageResponse } from '@/lib/ostrovok/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ hid: string }> }
) {
  try {
    const { hid: hidStr } = await params;
    const hid = Number(hidStr);

    if (!hid || isNaN(hid)) {
      return NextResponse.json({ error: 'Invalid hotel ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      checkin,
      checkout,
      guests = [{ adults: 2 }],
      currency = 'RUB',
      language = 'ru',
      residency = 'ru',
      match_hash,
    } = body;

    if (!checkin || !checkout) {
      return NextResponse.json(
        { error: 'checkin and checkout are required' },
        { status: 400 }
      );
    }

    const requestBody: Record<string, unknown> = {
      hid,
      checkin,
      checkout,
      guests,
      currency,
      language,
      residency,
    };

    if (match_hash) {
      requestBody.match_hash = match_hash;
    }

    const data = await ostrovokFetch<OstrovokHotelpageResponse>(
      '/search/hp/',
      requestBody,
      { timeout: 30_000 }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error('[api/ostrovok/hotel/rates]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Hotel rates failed' },
      { status: 502 }
    );
  }
}
