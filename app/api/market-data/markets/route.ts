import { NextRequest, NextResponse } from 'next/server';
import { getMarketAssetsServer, isMarketRateLimited } from '@/lib/market-data/market-service';
import { GetAssetsParams } from '@/lib/market-data/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const region = searchParams.get('region') || undefined;
    const search = searchParams.get('search') || searchParams.get('q') || undefined;
    const filter = searchParams.get('filter') || searchParams.get('sort') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;

    const params: GetAssetsParams = {
      category: category || region,
      region: region || category,
      search,
      filter,
      sort: filter,
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
        message: err.message,
      },
      { status: 500 }
    );
  }
}
