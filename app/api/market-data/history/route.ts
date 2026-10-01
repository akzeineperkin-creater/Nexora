import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveHistoryServer, isMarketRateLimited } from '@/lib/market-data/market-service';
import { Timeframe } from '@/lib/market-data/types';
import { checkRateLimit, createRateLimitExceededResponse, RateLimitTiers } from '@/lib/security/rate-limiter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const rateCheck = checkRateLimit(request, {
      keyPrefix: 'history_fetch',
      ...RateLimitTiers.DATA_FEED,
    });
    if (!rateCheck.success) {
      return createRateLimitExceededResponse(rateCheck);
    }

    const { searchParams } = new URL(request.url);
    const rawSymbol = searchParams.get('symbol') || searchParams.get('ticker') || '';
    const rawTimeframe = (searchParams.get('timeframe') || '1M').toUpperCase();
    const validTimeframes: Timeframe[] = ['1D', '1W', '1M', '1Y', 'ALL'];
    const timeframe: Timeframe = validTimeframes.includes(rawTimeframe as Timeframe)
      ? (rawTimeframe as Timeframe)
      : '1M';

    const symbol = rawSymbol.trim().toUpperCase().slice(0, 15);
    if (!symbol || !/^[A-Z0-9.:\-_]+$/.test(symbol)) {
      return NextResponse.json(
        { error: 'Valid ticker symbol parameter is required.' },
        { status: 400, headers: rateCheck.headers }
      );
    }

    const points = await fetchLiveHistoryServer(symbol, timeframe);

    return NextResponse.json(
      {
        points,
        count: points.length,
        timeframe,
        isRateLimited: isMarketRateLimited(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          ...rateCheck.headers,
        },
      }
    );
  } catch (err: any) {
    console.error('[API /api/market-data/history] Error:', err.message);
    return NextResponse.json(
      {
        points: [],
        count: 0,
        error: 'Historical market data temporarily unavailable.',
      },
      { status: 500 }
    );
  }
}
