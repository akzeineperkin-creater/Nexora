import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveHistoryServer, isMarketRateLimited } from '@/lib/market-data/market-service';
import { Timeframe } from '@/lib/market-data/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || searchParams.get('ticker') || '';
    const timeframe = (searchParams.get('timeframe') || '1M') as Timeframe;

    if (!symbol) {
      return NextResponse.json({ error: 'Ticker symbol parameter is required.' }, { status: 400 });
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
        message: err.message,
      },
      { status: 500 }
    );
  }
}
