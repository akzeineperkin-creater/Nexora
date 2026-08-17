import { NextRequest, NextResponse } from 'next/server';
import {
  syncFinancialNews,
  syncFinancialNewsForTicker,
  getFinancialNews,
  getLastSyncTime,
  isRateLimited,
} from '@/lib/news/news-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || searchParams.get('q') || undefined;
    const ticker = searchParams.get('ticker') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 30;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
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
      category,
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
        },
      }
    );
  } catch (err: any) {
    console.error('[API /api/news] Handler error:', err.message);
    return NextResponse.json(
      {
        articles: [],
        totalCount: 0,
        page: 1,
        totalPages: 1,
        marketMovers: [],
        error: 'Failed to retrieve news feed.',
        message: err.message,
      },
      { status: 500 }
    );
  }
}
