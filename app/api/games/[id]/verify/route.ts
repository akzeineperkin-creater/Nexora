import { NextRequest, NextResponse } from 'next/server';
import { verifyGamePassword } from '@/lib/games/games-service';
import { getAuthenticatedUser } from '@/lib/security/session-auth';
import { checkRateLimit, createRateLimitExceededResponse, RateLimitTiers } from '@/lib/security/rate-limiter';
import { logSecurityEvent } from '@/lib/security/logger';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;

    // 1. Strict Rate Limiting: Max 5 password attempts per minute per IP to prevent brute-forcing
    const rateCheck = checkRateLimit(request, {
      keyPrefix: `game_pw_verify_${gameId}`,
      ...RateLimitTiers.AUTH,
    });

    if (!rateCheck.success) {
      return createRateLimitExceededResponse(rateCheck);
    }

    const body = await request.json().catch(() => ({}));
    const { password } = body;

    // 2. Resolve Authenticated Server User (creator bypass requires verified session, not spoofed body.userId)
    const { user: sessionUser } = await getAuthenticatedUser(request);
    const verifiedUserId = sessionUser?.id || undefined;

    const result = await verifyGamePassword(gameId, password, verifiedUserId);

    if (!result.valid) {
      logSecurityEvent({
        event: 'AUTH_FAILURE',
        endpoint: `/api/games/${gameId}/verify`,
        method: 'POST',
        userId: verifiedUserId,
        details: { reason: 'Incorrect tournament password attempt' },
        severity: 'WARN',
      });

      return NextResponse.json(
        {
          success: false,
          error: 'ACCESS_DENIED',
          message: result.message || 'Incorrect tournament password. Access denied.',
        },
        { status: 401, headers: rateCheck.headers }
      );
    }

    return NextResponse.json(
      {
        success: true,
        authorized: true,
        isCreator: Boolean(result.isCreator),
        game: result.game,
        message: 'Tournament password verified successfully.',
      },
      { status: 200, headers: rateCheck.headers }
    );
  } catch (err: any) {
    console.error(`[API /api/games/${params.id}/verify POST] error:`, err.message);
    return NextResponse.json(
      { error: 'Password verification failed', message: err.message },
      { status: 400 }
    );
  }
}
