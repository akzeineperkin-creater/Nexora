import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { checkRateLimit, createRateLimitExceededResponse, RateLimitTiers } from '@/lib/security/rate-limiter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const rateCheck = checkRateLimit(request, {
      keyPrefix: 'leaderboard',
      ...RateLimitTiers.DATA_FEED,
    });
    if (!rateCheck.success) {
      return createRateLimitExceededResponse(rateCheck);
    }

    // 1. Query public profiles from Supabase
    const { data: profiles, error: profErr } = await (supabase as any)
      .from('profiles')
      .select('id, username, full_name, avatar_url, level, xp, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (profErr) {
      console.warn('[API /api/leaderboard GET] profiles query warning:', profErr.message);
    }

    // 2. Query portfolios (aggregated non-sensitive metrics for leaderboard)
    const { data: portfolios, error: portErr } = await (supabase as any)
      .from('portfolios')
      .select('id, user_id, cash, starting_cash, created_at')
      .limit(100);

    if (portErr) {
      console.warn('[API /api/leaderboard GET] portfolios query warning:', portErr.message);
    }

    // Build map of user portfolios by user_id
    const portfolioMap = new Map<string, { cash: number; starting_cash: number }>();
    if (portfolios && Array.isArray(portfolios)) {
      portfolios.forEach((p: any) => {
        if (p.user_id) {
          portfolioMap.set(p.user_id, {
            cash: Number(p.cash ?? 10000),
            starting_cash: Number(p.starting_cash ?? 10000),
          });
        }
      });
    }

    const rawProfiles = profiles && Array.isArray(profiles) ? profiles : [];

    // 3. Assemble Leaderboard entries
    const entries = rawProfiles.map((prof: any) => {
      const port = portfolioMap.get(prof.id) || { cash: 10000, starting_cash: 10000 };
      const cash = Number(port.cash);
      const startingCapital = Number(port.starting_cash) > 0 ? Number(port.starting_cash) : 10000;
      const pnl = Number((cash - startingCapital).toFixed(2));
      const returnPct = Number(((pnl / startingCapital) * 100).toFixed(2));

      const displayName =
        prof.username ||
        prof.full_name ||
        `Trader_${prof.id?.slice(0, 5) || 'user'}`;

      return {
        userId: prof.id,
        username: displayName,
        avatarUrl: prof.avatar_url || null,
        level: prof.level || 1,
        portfolioValue: cash,
        totalPnl: pnl,
        returnPercentage: returnPct,
        rank: 0,
      };
    });

    // Sort by return percentage descending
    entries.sort((a: any, b: any) => b.returnPercentage - a.returnPercentage);
    entries.forEach((e: any, idx: number) => {
      e.rank = idx + 1;
    });

    return NextResponse.json(
      {
        leaderboard: entries,
        count: entries.length,
        updatedAt: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          ...rateCheck.headers,
        },
      }
    );
  } catch (err: any) {
    console.error('[API /api/leaderboard GET] Error:', err.message);
    return NextResponse.json(
      {
        leaderboard: [],
        count: 0,
        error: 'Leaderboard temporarily unavailable.',
      },
      { status: 500 }
    );
  }
}
