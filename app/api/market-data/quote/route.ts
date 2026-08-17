import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveQuoteServer, isMarketRateLimited } from '@/lib/market-data/market-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || searchParams.get('ticker') || '';

    if (!symbol) {
      return NextResponse.json({ error: 'Ticker symbol parameter is required.' }, { status: 400 });
    }

    const quote = await fetchLiveQuoteServer(symbol);

    if (!quote) {
      return NextResponse.json({ error: `Asset not found for ticker: ${symbol}` }, { status: 404 });
    }

    return NextResponse.json(
      {
        quote,
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
    console.error('[API /api/market-data/quote] Error:', err.message);
    return NextResponse.json(
      {
        quote: null,
        error: 'Market data temporarily unavailable.',
        message: err.message,
      },
      { status: 500 }
    );
  }
}
