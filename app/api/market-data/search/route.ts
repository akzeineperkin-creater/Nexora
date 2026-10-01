import { NextRequest, NextResponse } from 'next/server';
import { searchStocksServer } from '@/lib/market-data/market-service';
import { checkRateLimit, createRateLimitExceededResponse, RateLimitTiers } from '@/lib/security/rate-limiter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const rateCheck = checkRateLimit(request, {
      keyPrefix: 'search_assets',
      ...RateLimitTiers.DATA_FEED,
    });
    if (!rateCheck.success) {
      return createRateLimitExceededResponse(rateCheck);
    }

    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('q') || searchParams.get('search') || '';
    const query = rawQuery.trim().slice(0, 50);

    const results = await searchStocksServer(query);

    return NextResponse.json(
      {
        results,
        count: results.length,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          ...rateCheck.headers,
        },
      }
    );
  } catch (err: any) {
    console.error('[API /api/market-data/search] Error:', err.message);
    return NextResponse.json(
      {
        results: [],
        count: 0,
        error: 'Failed to search market assets.',
      },
      { status: 500 }
    );
  }
}
