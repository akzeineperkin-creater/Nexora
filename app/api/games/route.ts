import { NextRequest, NextResponse } from 'next/server';
import { getGames, createGame } from '@/lib/games/games-service';
import { getAuthenticatedUser } from '@/lib/security/session-auth';
import { checkRateLimit, createRateLimitExceededResponse, RateLimitTiers } from '@/lib/security/rate-limiter';
import { logSecurityEvent } from '@/lib/security/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Rate Limiting for Game List
    const rateCheck = checkRateLimit(request, {
      keyPrefix: 'games_list',
      ...RateLimitTiers.DATA_FEED,
    });
    if (!rateCheck.success) {
      return createRateLimitExceededResponse(rateCheck);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'active' | 'upcoming' | 'completed' | null;

    const games = await getGames(status || undefined);

    return NextResponse.json({ games, count: games.length }, { status: 200, headers: rateCheck.headers });
  } catch (err: any) {
    console.error('[API /api/games GET] error:', err.message);
    return NextResponse.json({ error: 'Failed to fetch games', message: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Resolve Authenticated Server User
    const { user: sessionUser } = await getAuthenticatedUser(request);
    if (!sessionUser) {
      logSecurityEvent({
        event: 'UNAUTHORIZED_ACCESS',
        endpoint: '/api/games',
        method: 'POST',
        details: { reason: 'Unauthenticated tournament creation attempt' },
        severity: 'WARN',
      });
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Please sign in to create a tournament.' },
        { status: 401 }
      );
    }

    // 2. Strict Rate Limiting: Max 5 game creations per 10 minutes per user to prevent flooding
    const rateCheck = checkRateLimit(request, {
      keyPrefix: 'game_creation',
      userId: sessionUser.id,
      ...RateLimitTiers.CREATION,
    });
    if (!rateCheck.success) {
      return createRateLimitExceededResponse(rateCheck);
    }

    const body = await request.json().catch(() => ({}));
    const {
      name,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      timezone,
      visibility,
      password,
      startingCapital,
      maxPlayers,
      allowedAssetClasses,
      duration,
      allowLateJoiners,
      allowJoinAfterStart,
    } = body;

    // 3. Input Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Game name is required' }, { status: 400, headers: rateCheck.headers });
    }

    const cleanName = name.trim().slice(0, 100);
    const cleanDesc = description ? String(description).slice(0, 1000) : '';
    const cleanCap = Math.max(1000, Math.min(1000000, Number(startingCapital) || 25000));

    // 4. Force verified session user as creator (Prevents creator spoofing)
    const creatorId = sessionUser.id;
    const creatorName =
      sessionUser.user_metadata?.nickname ||
      sessionUser.user_metadata?.username ||
      sessionUser.email?.split('@')[0] ||
      'Tournament Host';

    const newGame = await createGame(
      {
        name: cleanName,
        description: cleanDesc,
        startDate: startDate || new Date().toISOString(),
        startTime: startTime || '09:00 AM EDT',
        endDate: endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: endTime || '06:00 PM EDT',
        timezone: timezone || 'US Eastern Time (EDT/EST)',
        visibility: visibility === 'private' ? 'private' : 'public',
        password,
        startingCapital: cleanCap,
        maxPlayers: Math.max(0, Math.min(1000, Number(maxPlayers) || 0)),
        allowedAssetClasses: allowedAssetClasses || ['stocks', 'etfs', 'indices'],
        duration: duration || '14 days',
        allowLateJoiners: Boolean(allowLateJoiners ?? allowJoinAfterStart ?? true),
        allowJoinAfterStart: Boolean(allowLateJoiners ?? allowJoinAfterStart ?? true),
      },
      creatorId,
      creatorName
    );

    return NextResponse.json({ success: true, game: newGame }, { status: 201, headers: rateCheck.headers });
  } catch (err: any) {
    console.error('[API /api/games POST] error:', err.message);
    return NextResponse.json({ error: 'Failed to create game', message: err.message }, { status: 500 });
  }
}
