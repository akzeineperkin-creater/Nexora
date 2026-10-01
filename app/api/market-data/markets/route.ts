import { NextRequest, NextResponse } from 'next/server';
import { getMarketAssetsServer, isMarketRateLimited } from '@/lib/market-data/market-service';
import { GetAssetsParams } from '@/lib/market-data/types';
import { checkRateLimit, createRateLimitExceededResponse, RateLimitTiers } from '@/lib/security/rate-limiter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const rateCheck = checkRateLimit(request, {
      keyPrefix: 'markets_list',
      ...RateLimitTiers.DATA_FEED,
    });
    if (!rateCheck.success) {
      return createRateLimitExceededResponse(rateCheck);
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const region = searchParams.get('region') || undefined;
    const search = searchParams.get('search') || searchParams.get('q') || undefined;
    const filter = searchParams.get('filter') || searchParams.get('sort') || undefined;

    // Bounds checking for pagination parameters
    const rawLimit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const limit = Math.max(1, Math.min(100, isNaN(rawLimit) ? 50 : rawLimit));
    const rawPage = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const page = Math.max(1, Math.min(1000, isNaN(rawPage) ? 1 : rawPage));

    const params: GetAssetsParams = {
      category: category ? category.slice(0, 30) : region ? region.slice(0, 30) : undefined,
      region: region ? region.slice(0, 30) : category ? category.slice(0, 30) : undefined,
      search: search ? search.trim().slice(0, 50) : undefined,
      filter: filter ? filter.slice(0, 30) : undefined,
      sort: filter ? filter.slice(0, 30) : undefined,
      limit,
      page,
    };

    const result = await getMarketAssetsServer(params);

    return NextResponse.json(
      {
        assets: result.assets,
        totalCount: result.totalCount,
        page: result.page,
        totalPages: result.totalPages,
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
    console.error('[API /api/market-data/markets] Error:', err.message);
    return NextResponse.json(
      {
        assets: [],
        totalCount: 0,
        page: 1,
        totalPages: 1,
        error: 'Market list data temporarily unavailable.',
      },
      { status: 500 }
    );
  }
}
