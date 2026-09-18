import { NextRequest, NextResponse } from 'next/server';
import { logSecurityEvent } from './logger';

export interface RateLimitOptions {
  keyPrefix: string;
  limit: number;
  windowSeconds: number;
  userId?: string | null;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds when the window resets
  retryAfter: number; // Seconds until caller can retry
  headers: Record<string, string>;
}

// In-memory sliding window cache: key -> array of request timestamps in ms
const requestTimestampsMap = new Map<string, number[]>();

// Periodically clean up stale entries every 5 minutes
let lastCleanup = Date.now();
function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;

  requestTimestampsMap.forEach((timestamps, key) => {
    // If all timestamps are older than 15 minutes, purge the key
    const recent = timestamps.filter((t: number) => now - t < 15 * 60 * 1000);
    if (recent.length === 0) {
      requestTimestampsMap.delete(key);
    } else {
      requestTimestampsMap.set(key, recent);
    }
  });
}

/**
 * Extracts best-guess client IP address from proxy headers
 */
export function getClientIp(req: NextRequest): string {
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  const xRealIp = req.headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();

  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0];
    if (first) return first.trim();
  }

  return '127.0.0.1';
}

/**
 * Standard pre-configured rate limit tiers
 */
export const RateLimitTiers = {
  // Strictest: Authentication attempts, password verification (5 per minute)
  AUTH: { limit: 5, windowSeconds: 60 },
  // Sensitive Creations: Creating tournaments or portfolios (5 per 10 minutes)
  CREATION: { limit: 5, windowSeconds: 600 },
  // Mutations: Executing trades, joining/leaving tournaments (20 per minute)
  MUTATION: { limit: 20, windowSeconds: 60 },
  // Data feeds: Live quotes, news sync, search (60 per minute)
  DATA_FEED: { limit: 60, windowSeconds: 60 },
  // General standard API routes (30 per minute)
  STANDARD: { limit: 30, windowSeconds: 60 },
};

/**
 * Checks and records rate limit for a request
 */
export function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions
): RateLimitResult {
  cleanupStaleEntries();

  const ip = getClientIp(req);
  const identifier = options.userId ? `uid_${options.userId}` : `ip_${ip}`;
  const key = `${options.keyPrefix}:${identifier}`;

  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const cutoff = now - windowMs;

  const existing = requestTimestampsMap.get(key) || [];
  const currentTimestamps = existing.filter((t) => t > cutoff);

  const remaining = Math.max(0, options.limit - currentTimestamps.length);
  const resetEpochSeconds = Math.ceil((now + windowMs) / 1000);

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(options.limit),
    'X-RateLimit-Remaining': String(Math.max(0, remaining - 1)),
    'X-RateLimit-Reset': String(resetEpochSeconds),
  };

  if (currentTimestamps.length >= options.limit) {
    const oldestInWindow = currentTimestamps[0] || now;
    const retryAfter = Math.max(1, Math.ceil((oldestInWindow + windowMs - now) / 1000));
    headers['Retry-After'] = String(retryAfter);

    logSecurityEvent({
      event: 'RATE_LIMIT_EXCEEDED',
      endpoint: req.nextUrl.pathname,
      method: req.method,
      ip,
      userId: options.userId,
      details: {
        keyPrefix: options.keyPrefix,
        limit: options.limit,
        windowSeconds: options.windowSeconds,
        retryAfter,
      },
      severity: 'WARN',
    });

    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      reset: resetEpochSeconds,
      retryAfter,
      headers,
    };
  }

  currentTimestamps.push(now);
  requestTimestampsMap.set(key, currentTimestamps);

  return {
    success: true,
    limit: options.limit,
    remaining: remaining - 1,
    reset: resetEpochSeconds,
    retryAfter: 0,
    headers,
  };
}

/**
 * Generates an HTTP 429 Too Many Requests response with standard rate limit headers
 */
export function createRateLimitExceededResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'TOO_MANY_REQUESTS',
      message: `Rate limit exceeded. Too many requests. Please try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
    },
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...result.headers,
      },
    }
  );
}
