import { NextRequest, NextResponse } from 'next/server';
import { ostrovokFetch } from '@/lib/ostrovok/client';
import type { OstrovokHotelInfoResponse } from '@/lib/ostrovok/types';

// Cache hotel info for 1 hour (static content changes rarely)
const hotelCache = new Map<number, { data: OstrovokHotelInfoResponse; cachedAt: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ hid: string }> }
) {
  try {
    const { hid: hidStr } = await params;
    const hid = Number(hidStr);

    if (!hid || isNaN(hid)) {
      return NextResponse.json({ error: 'Invalid hotel ID' }, { status: 400 });
    }

    // Check cache
    const cached = hotelCache.get(hid);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    const data = await ostrovokFetch<OstrovokHotelInfoResponse>(
      '/hotel/info/',
      { hid, language: 'ru' },
      { timeout: 15_000 }
    );

    // Store in cache
    hotelCache.set(hid, { data, cachedAt: Date.now() });

    return NextResponse.json(data);
  } catch (error) {
    console.error('[api/ostrovok/hotel/info]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Hotel info failed' },
      { status: 502 }
    );
  }
}
