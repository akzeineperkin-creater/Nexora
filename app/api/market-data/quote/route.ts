import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveQuoteServer, isMarketRateLimited } from '@/lib/market-data/market-service';
import { checkRateLimit, createRateLimitExceededResponse, RateLimitTiers } from '@/lib/security/rate-limiter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Centralized IP-based rate limiting
    const rateCheck = checkRateLimit(request, {
      keyPrefix: 'quote_fetch',
      ...RateLimitTiers.DATA_FEED,
    });
    if (!rateCheck.success) {
      return createRateLimitExceededResponse(rateCheck);
    }

    const { searchParams } = new URL(request.url);
    const rawSymbol = searchParams.get('symbol') || searchParams.get('ticker') || '';

    // Sanitize input
    const symbol = rawSymbol.trim().toUpperCase().slice(0, 15);
    if (!symbol || !/^[A-Z0-9.:\-_]+$/.test(symbol)) {
      return NextResponse.json(
        { error: 'Valid ticker symbol parameter is required.' },
        { status: 400, headers: rateCheck.headers }
      );
    }

    const quote = await fetchLiveQuoteServer(symbol);

    if (!quote) {
      return NextResponse.json(
        { error: `Asset not found for ticker: ${symbol}` },
        { status: 404, headers: rateCheck.headers }
      );
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
          ...rateCheck.headers,
        },
      }
    );
  } catch (err: any) {
    console.error('[API /api/market-data/quote] Error:', err.message);
    return NextResponse.json(
      {
        quote: null,
        error: 'Market data temporarily unavailable.',
      },
      { status: 500 }
    );
  }
}
