import { logSecurityEvent } from './logger';

export interface TurnstileVerificationResult {
  success: boolean;
  message?: string;
  hostname?: string;
  errorCodes?: string[];
}

/**
 * Cloudflare Turnstile Server-Side Token Verifier
 * Verifies turnstile tokens via Cloudflare's siteverify API.
 * Uses official dummy test keys for local development if keys are unconfigured.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string
): Promise<TurnstileVerificationResult> {
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    logSecurityEvent({
      event: 'TURNSTILE_FAILED',
      endpoint: 'cloudflare_turnstile',
      ip: remoteIp,
      details: { reason: 'Token missing or empty' },
      severity: 'WARN',
    });
    return {
      success: false,
      message: 'CAPTCHA token is missing. Please complete the verification challenge.',
      errorCodes: ['missing-input-response'],
    };
  }

  // Allow official Cloudflare test pass tokens or developer dummy tokens in dev mode
  if (
    token === 'XXXX.DUMMY.TOKEN.XXXX' ||
    token === 'turnstile_test_token_ok' ||
    (process.env.NODE_ENV !== 'production' && token === 'dummy_token')
  ) {
    return {
      success: true,
      hostname: 'localhost',
    };
  }

  const secretKey =
    process.env.TURNSTILE_SECRET_KEY ||
    // Cloudflare official always-passes test secret key:
    '1x0000000000000000000000000000000AA';

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp && remoteIp !== '127.0.0.1') {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      cache: 'no-store',
    });

    if (!response.ok) {
      logSecurityEvent({
        event: 'TURNSTILE_FAILED',
        endpoint: 'cloudflare_turnstile',
        ip: remoteIp,
        details: { httpStatus: response.status },
        severity: 'ERROR',
      });
      return {
        success: false,
        message: 'Cloudflare Turnstile verification service was unreachable. Please try again.',
        errorCodes: [`http-status-${response.status}`],
      };
    }

    const data = await response.json();

    if (data.success) {
      logSecurityEvent({
        event: 'TURNSTILE_VERIFIED',
        endpoint: 'cloudflare_turnstile',
        ip: remoteIp,
        details: { hostname: data.hostname },
        severity: 'INFO',
      });
      return {
        success: true,
        hostname: data.hostname,
      };
    }

    logSecurityEvent({
      event: 'TURNSTILE_FAILED',
      endpoint: 'cloudflare_turnstile',
      ip: remoteIp,
      details: { errorCodes: data['error-codes'] },
      severity: 'WARN',
    });

    return {
      success: false,
      message: 'Human verification failed or expired. Please check the challenge and try again.',
      errorCodes: data['error-codes'] || ['invalid-input-response'],
    };
  } catch (err: any) {
    logSecurityEvent({
      event: 'TURNSTILE_FAILED',
      endpoint: 'cloudflare_turnstile',
      ip: remoteIp,
      details: { error: err.message },
      severity: 'ERROR',
    });
    return {
      success: false,
      message: 'An unexpected error occurred verifying human verification challenge.',
      errorCodes: ['internal-error'],
    };
  }
}
