import { NextRequest, NextResponse } from 'next/server';
import {
  syncFinancialNews,
  syncFinancialNewsForTicker,
  getFinancialNews,
  getLastSyncTime,
  isRateLimited,
} from '@/lib/news/news-service';
import { checkRateLimit, createRateLimitExceededResponse, RateLimitTiers } from '@/lib/security/rate-limiter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const rateCheck = checkRateLimit(request, {
      keyPrefix: 'news_feed',
      ...RateLimitTiers.DATA_FEED,
    });
    if (!rateCheck.success) {
      return createRateLimitExceededResponse(rateCheck);
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const rawSearch = searchParams.get('search') || searchParams.get('q') || undefined;
    const rawTicker = searchParams.get('ticker') || undefined;

    const search = rawSearch ? rawSearch.trim().slice(0, 50) : undefined;
    const ticker = rawTicker ? rawTicker.trim().toUpperCase().slice(0, 15) : undefined;

    const rawLimit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 30;
    const limit = Math.max(1, Math.min(100, isNaN(rawLimit) ? 30 : rawLimit));
    const rawPage = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const page = Math.max(1, Math.min(1000, isNaN(rawPage) ? 1 : rawPage));
    const autoSync = searchParams.get('autoSync') !== 'false';

    // 1. Sync on demand: for specific ticker or general feed
    if (autoSync && !isRateLimited()) {
      try {
        if (ticker) {
          await syncFinancialNewsForTicker(ticker);
        } else if (getLastSyncTime() === 0) {
          await syncFinancialNews();
        }
      } catch (err) {
        console.warn('[API /api/news] Background sync notice:', err);
      }
    }

    // 2. Fetch fresh articles with pagination and market movers
    const result = await getFinancialNews({
      category: category ? category.slice(0, 30) : undefined,
      search,
      ticker,
      limit,
      page,
    });

    const currentSyncTimestamp = getLastSyncTime();

    return NextResponse.json(
      {
        articles: result.articles,
        totalCount: result.totalCount,
        page: result.page,
        totalPages: result.totalPages,
        marketMovers: result.marketMovers,
        lastSyncAt: currentSyncTimestamp > 0 ? new Date(currentSyncTimestamp).toISOString() : new Date().toISOString(),
        isRateLimited: isRateLimited(),
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
    console.error('[API /api/news] Error:', err.message);
    return NextResponse.json(
      {
        articles: [],
        totalCount: 0,
        page: 1,
        totalPages: 1,
        error: 'Financial news feed temporarily unavailable.',
      },
      { status: 500 }
    );
  }
}
