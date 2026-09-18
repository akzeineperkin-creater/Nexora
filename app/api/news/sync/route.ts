import { NextRequest, NextResponse } from 'next/server';
import { syncFinancialNews, syncNewsForSymbol, isRateLimited } from '@/lib/news/news-service';
import { checkRateLimit, createRateLimitExceededResponse } from '@/lib/security/rate-limiter';

export const dynamic = 'force-dynamic';

// Server-side throttle timestamp
let lastManualRefreshTime = 0;

export async function POST(request: NextRequest) {
  try {
    // 1. Centralized IP-based rate limiting (Max 10 sync requests per minute)
    const rateCheck = checkRateLimit(request, {
      keyPrefix: 'news_sync',
      limit: 10,
      windowSeconds: 60,
    });
    if (!rateCheck.success) {
      return createRateLimitExceededResponse(rateCheck);
    }

    const now = Date.now();
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    const symbol = body?.symbol as string | undefined;

    // Throttle minimum interval: 15 seconds
    if (now - lastManualRefreshTime < 15 * 1000) {
      return NextResponse.json(
        {
          success: true,
          newArticlesCount: 0,
          message: 'News is up to date. Cooldown active.',
          lastSyncAt: new Date(lastManualRefreshTime).toISOString(),
        },
        { status: 200, headers: rateCheck.headers }
      );
    }

    if (isRateLimited()) {
      return NextResponse.json(
        {
          success: false,
          newArticlesCount: 0,
          message: 'News provider rate limit active. Using cached feeds.',
          lastSyncAt: new Date().toISOString(),
        },
        { status: 429, headers: rateCheck.headers }
      );
    }

    lastManualRefreshTime = now;

    if (symbol) {
      const result = await syncNewsForSymbol(symbol, { force: false });
      return NextResponse.json(
        {
          success: result.success,
          newArticlesCount: result.newArticlesCount,
          message: result.message,
          lastSyncAt: new Date().toISOString(),
        },
        { status: 200, headers: rateCheck.headers }
      );
    } else {
      const result = await syncFinancialNews({ force: false });
      return NextResponse.json(
        {
          success: result.success,
          newArticlesCount: result.newArticlesCount,
          message: result.message,
          lastSyncAt: result.lastSyncAt,
        },
        { status: 200, headers: rateCheck.headers }
      );
    }
  } catch (err: any) {
    console.error('[API /api/news/sync] Error:', err.message);
    return NextResponse.json({ error: 'Failed to synchronize financial news feeds.' }, { status: 500 });
  }
}
