import { NextRequest, NextResponse } from 'next/server';
import { syncFinancialNews, syncNewsForSymbol, isRateLimited } from '@/lib/news/news-service';

export const dynamic = 'force-dynamic';

// Throttle manual refresh requests (max 1 per 30 seconds per server process)
let lastManualRefreshTime = 0;

export async function POST(request: NextRequest) {
  try {
    const now = Date.now();
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    const symbol = body?.symbol as string | undefined;

    // Rate-limit throttle for manual clicks
    if (now - lastManualRefreshTime < 30 * 1000 && !body?.force) {
      return NextResponse.json({
        success: true,
        newArticlesCount: 0,
        message: 'News was recently updated. Please try again in a moment.',
        lastSyncAt: new Date(lastManualRefreshTime).toISOString(),
      });
    }

    if (isRateLimited()) {
      return NextResponse.json({
        success: false,
        newArticlesCount: 0,
        message: 'News was recently updated. Provider rate limit cooldown active.',
        lastSyncAt: new Date().toISOString(),
      });
    }

    lastManualRefreshTime = now;

    if (symbol) {
      const result = await syncNewsForSymbol(symbol, { force: true });
      return NextResponse.json({
        success: result.success,
        newArticlesCount: result.newArticlesCount,
        message: result.message,
        lastSyncAt: new Date().toISOString(),
      });
    } else {
      const result = await syncFinancialNews({ force: true });
      return NextResponse.json({
        success: result.success,
        newArticlesCount: result.newArticlesCount,
        message: result.message,
        lastSyncAt: result.lastSyncAt,
      });
    }
  } catch (err: any) {
    console.error('[API /api/news/sync] Error:', err.message);
    return NextResponse.json(
      {
        success: false,
        newArticlesCount: 0,
        message: err.message || 'Error executing manual news sync.',
      },
      { status: 500 }
    );
  }
}
