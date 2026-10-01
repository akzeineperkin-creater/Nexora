import { NextRequest, NextResponse } from 'next/server';
import { joinGame } from '@/lib/games/games-service';
import { getAuthenticatedUser, enforceOwnership } from '@/lib/security/session-auth';
import { checkRateLimit, createRateLimitExceededResponse, RateLimitTiers } from '@/lib/security/rate-limiter';
import { logSecurityEvent } from '@/lib/security/logger';

export const dynamic = 'force-dynamic';

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
        endpoint: `/api/games/${gameId}/join`,
        method: 'POST',
        details: { reason: 'Unauthenticated join attempt' },
        severity: 'WARN',
      });
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Please sign in to join this tournament.' },
        { status: 401 }
      );
    }

    // 2. Rate Limiting: Max 20 attempts per minute
    const rateCheck = checkRateLimit(request, {
      keyPrefix: `game_join_${gameId}`,
      userId: sessionUser.id,
      ...RateLimitTiers.MUTATION,
    });
    if (!rateCheck.success) {
      return createRateLimitExceededResponse(rateCheck);
    }

    const body = await request.json().catch(() => ({}));
    const { userId: bodyUserId, username, password } = body;

    // 3. IDOR Defense: Reject client-supplied target user ID if mismatched
    if (bodyUserId && bodyUserId !== sessionUser.id) {
      const ownership = enforceOwnership(sessionUser, bodyUserId, `/api/games/${gameId}/join`, request);
      return NextResponse.json(
        { error: 'IDOR_DETECTED', message: ownership.error },
        { status: 403, headers: rateCheck.headers }
      );
    }

    // 4. Join game strictly using authenticated user's ID
    const result = await joinGame({
      gameIdOrSlug: gameId,
      userId: sessionUser.id,
      username: username || sessionUser.user_metadata?.username,
      password,
    });

    return NextResponse.json(result, { status: 200, headers: rateCheck.headers });
  } catch (err: any) {
    console.error(`[API /api/games/${params.id}/join POST] error:`, err.message);
    return NextResponse.json({ error: 'Join failed', message: err.message }, { status: 400 });
  }
}
