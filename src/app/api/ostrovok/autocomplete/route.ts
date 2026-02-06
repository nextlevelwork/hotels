import { NextRequest, NextResponse } from 'next/server';
import { ostrovokFetch } from '@/lib/ostrovok/client';
import type { OstrovokMulticompleteResponse } from '@/lib/ostrovok/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, language = 'ru' } = body;

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const data = await ostrovokFetch<OstrovokMulticompleteResponse>(
      '/search/multicomplete/',
      { query, language },
      { timeout: 10_000 }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error('[api/ostrovok/autocomplete]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Autocomplete failed' },
      { status: 502 }
    );
  }
}
