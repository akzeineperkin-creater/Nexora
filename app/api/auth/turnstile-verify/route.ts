import { NextRequest, NextResponse } from 'next/server';
import { verifyTurnstileToken } from '@/lib/security/turnstile';
import { checkRateLimit, createRateLimitExceededResponse, RateLimitTiers, getClientIp } from '@/lib/security/rate-limiter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting: Max 10 attempts per minute per IP
    const rateCheck = checkRateLimit(request, {
      keyPrefix: 'turnstile_verify',
      limit: 10,
      windowSeconds: 60,
    });

    if (!rateCheck.success) {
      return createRateLimitExceededResponse(rateCheck);
    }

    // 2. Parse request body
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body' },
        { status: 400, headers: rateCheck.headers }
      );
    }

    const { token } = body;
    const clientIp = getClientIp(request);

    // 3. Verify token with Cloudflare
    const result = await verifyTurnstileToken(token, clientIp);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message || 'Verification challenge failed',
          errorCodes: result.errorCodes,
        },
        { status: 400, headers: rateCheck.headers }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Human verification successfully verified.',
      },
      { status: 200, headers: rateCheck.headers }
    );
  } catch (err: any) {
    console.error('[API /api/auth/turnstile-verify POST] Error:', err.message);
    return NextResponse.json(
      { success: false, error: 'Server error verifying human verification' },
      { status: 500 }
    );
  }
}
