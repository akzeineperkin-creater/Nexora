import { NextRequest, NextResponse } from 'next/server';
import { searchStocksServer } from '@/lib/market-data/market-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('search') || '';

    const results = await searchStocksServer(query);

    return NextResponse.json(
      {
        results,
        count: results.length,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (err: any) {
    console.error('[API /api/market-data/search] Error:', err.message);
    return NextResponse.json(
      {
        results: [],
        count: 0,
        error: 'Failed to search market assets.',
        message: err.message,
      },
      { status: 500 }
    );
  }
}
