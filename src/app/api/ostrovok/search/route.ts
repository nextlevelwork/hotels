import { NextRequest, NextResponse } from 'next/server';
import { ostrovokFetch } from '@/lib/ostrovok/client';
import type { OstrovokSearchResponse } from '@/lib/ostrovok/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      checkin,
      checkout,
      region_id,
      guests = [{ adults: 2 }],
      currency = 'RUB',
      language = 'ru',
      residency = 'ru',
    } = body;

    if (!checkin || !checkout || !region_id) {
      return NextResponse.json(
        { error: 'checkin, checkout and region_id are required' },
        { status: 400 }
      );
    }

    const data = await ostrovokFetch<OstrovokSearchResponse>(
      '/search/serp/region/',
      {
        checkin,
        checkout,
        region_id: Number(region_id),
        guests,
        currency,
        language,
        residency,
      },
      { timeout: 30_000 }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error('[api/ostrovok/search]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 502 }
    );
  }
}
