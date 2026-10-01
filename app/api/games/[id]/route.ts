import { NextRequest, NextResponse } from 'next/server';
import { getGameById, getGamePortfolio, executeGameTrade, sanitizeGame } from '@/lib/games/games-service';
import { getAuthenticatedUser, enforceOwnership } from '@/lib/security/session-auth';
import { checkRateLimit, createRateLimitExceededResponse, RateLimitTiers } from '@/lib/security/rate-limiter';
import { logSecurityEvent } from '@/lib/security/logger';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    const username = searchParams.get('username') || undefined;
    const passwordAttempt = searchParams.get('password') || request.headers.get('x-game-password') || undefined;
    const authHeader = request.headers.get('x-game-auth') || searchParams.get('auth') || undefined;

    // 1. Rate Limiting for Game Session Reads
    const rateCheck = checkRateLimit(request, {
      keyPrefix: `game_read_${gameId}`,
      ...RateLimitTiers.DATA_FEED,
    });
    if (!rateCheck.success) {
      return createRateLimitExceededResponse(rateCheck);
    }

    // 2. Resolve Authenticated Server User (Session / Bearer Token)
    const { user: sessionUser } = await getAuthenticatedUser(request);

    // 3. IDOR Defense: Block unauthorized queries for specific user portfolios
    if (requestedUserId) {
      if (!sessionUser) {
        logSecurityEvent({
          event: 'UNAUTHORIZED_ACCESS',
          endpoint: `/api/games/${gameId}`,
          targetId: requestedUserId,
          details: { reason: 'Attempted to query user portfolio while unauthenticated' },
          severity: 'WARN',
        });
        return NextResponse.json(
          {
            error: 'UNAUTHORIZED',
            message: 'Authentication required to view personalized portfolio data.',
          },
          { status: 401, headers: rateCheck.headers }
        );
      }

      const ownership = enforceOwnership(sessionUser, requestedUserId, `/api/games/${gameId}`, request);
      if (!ownership.authorized) {
        return NextResponse.json(
          { error: 'IDOR_DETECTED', message: ownership.error },
          { status: ownership.status || 403, headers: rateCheck.headers }
        );
      }
    }

    // 4. Fetch raw game for authorization verification
    const rawGame = await getGameById(gameId, { raw: true });
    if (!rawGame) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404, headers: rateCheck.headers });
    }

    const effectiveUserId = sessionUser?.id || null;

    // 5. Access control for private games (Creator check uses strictly verified sessionUser.id)
    if (rawGame.visibility === 'private') {
      const isCreator = Boolean(rawGame.creatorId && effectiveUserId && rawGame.creatorId === effectiveUserId);
      const isPasswordCorrect = Boolean(rawGame.password && passwordAttempt && rawGame.password.trim() === passwordAttempt.trim());
      const isTokenAuthorized = Boolean(authHeader === `auth_ok_${rawGame.id}`);

      if (!isCreator && !isPasswordCorrect && !isTokenAuthorized) {
        return NextResponse.json(
          {
            error: 'PRIVATE_GAME_PASSWORD_REQUIRED',
            isPrivate: true,
            isLocked: true,
            game: sanitizeGame(rawGame),
            message: 'This tournament is private. Password verification is required to enter.',
          },
          { status: 403, headers: rateCheck.headers }
        );
      }
    }

    // 6. Fetch portfolio only if a verified session user exists
    let portfolio = null;
    let hasJoined = false;
    let hasLeft = false;
    let leaderboard: any[] = [];

    if (effectiveUserId) {
      const sessionData = await getGamePortfolio(rawGame.id, effectiveUserId, username || sessionUser?.user_metadata?.username);
      portfolio = sessionData.portfolio;
      hasJoined = sessionData.hasJoined;
      hasLeft = sessionData.hasLeft;
      leaderboard = sessionData.leaderboard;
    } else {
      const publicData = await getGamePortfolio(rawGame.id, 'guest-view');
      leaderboard = publicData.leaderboard;
    }

    return NextResponse.json(
      {
        game: sanitizeGame(rawGame),
        portfolio,
        hasJoined,
        hasLeft,
        leaderboard,
      },
      { status: 200, headers: rateCheck.headers }
    );
  } catch (err: any) {
    console.error(`[API /api/games/${params.id} GET] error:`, err.message);
    return NextResponse.json({ error: 'Failed to load game session', message: err.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;

    // 1. Resolve Authenticated Server User
    const { user: sessionUser } = await getAuthenticatedUser(request);
    if (!sessionUser) {
      logSecurityEvent({
        event: 'UNAUTHORIZED_ACCESS',
        endpoint: `/api/games/${gameId}`,
        method: 'POST',
        details: { reason: 'Attempted to execute game trade without authentication' },
        severity: 'WARN',
      });
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required to execute trades.' },
        { status: 401 }
      );
    }

    // 2. Rate Limiting: Max 20 trades per minute per authenticated user
    const rateCheck = checkRateLimit(request, {
      keyPrefix: `game_trade_${gameId}`,
      userId: sessionUser.id,
      ...RateLimitTiers.MUTATION,
    });
    if (!rateCheck.success) {
      return createRateLimitExceededResponse(rateCheck);
    }

    const body = await request.json().catch(() => ({}));
    const { userId: bodyUserId, ticker, type, shares, orderType, price, username } = body;

    // 3. IDOR Defense: If client passed a userId, verify it matches sessionUser.id
    if (bodyUserId && bodyUserId !== sessionUser.id) {
      const ownership = enforceOwnership(sessionUser, bodyUserId, `/api/games/${gameId}`, request);
      return NextResponse.json(
        { error: 'IDOR_DETECTED', message: ownership.error },
        { status: 403, headers: rateCheck.headers }
      );
    }

    if (!ticker || !shares || !type) {
      return NextResponse.json(
        { error: 'Missing required trade parameters' },
        { status: 400, headers: rateCheck.headers }
      );
    }

    // 4. Execute trade strictly using authenticated user's ID
    const result = await executeGameTrade({
      gameId,
      userId: sessionUser.id,
      ticker,
      type,
      shares: Number(shares),
      orderType: orderType || 'MARKET',
      price: price ? Number(price) : undefined,
      username: username || sessionUser.user_metadata?.username,
    });

    return NextResponse.json(result, { status: 200, headers: rateCheck.headers });
  } catch (err: any) {
    console.error(`[API /api/games/${params.id} POST] error:`, err.message);
    return NextResponse.json({ error: 'Trade execution failed', message: err.message }, { status: 400 });
  }
}
