import { NextRequest, NextResponse } from 'next/server';
import { User, createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logSecurityEvent } from './logger';
import { getClientIp } from './rate-limiter';
import { Database } from '@/types/database.types';

export interface AuthSessionResult {
  user: User | null;
  error?: string | null;
}

export interface OwnershipCheckResult {
  authorized: boolean;
  status?: number;
  error?: string;
  user?: User;
}

/**
 * Resolves the authenticated Supabase user on the server.
 * Inspects both secure HTTP cookies (via @supabase/ssr) and Authorization: Bearer tokens.
 */
export async function getAuthenticatedUser(request?: NextRequest): Promise<AuthSessionResult> {
  try {
    // 1. Check HTTP-only cookie session via createServerSupabaseClient
    try {
      const serverSupabase = createServerSupabaseClient();
      const { data: { user }, error } = await serverSupabase.auth.getUser();
      if (user && !error) {
        return { user, error: null };
      }
    } catch {
      // Cookies might not be present or server context is non-standard
    }

    // 2. Check Authorization Bearer header if provided
    if (request) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7).trim();
        if (token) {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
          if (supabaseUrl && supabaseAnonKey) {
            const tokenClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
              auth: { persistSession: false },
            });
            const { data: { user }, error } = await tokenClient.auth.getUser(token);
            if (user && !error) {
              return { user, error: null };
            }
          }
        }
      }
    }

    return { user: null, error: 'No active authenticated session found' };
  } catch (err: any) {
    return { user: null, error: err.message };
  }
}

/**
 * Validates that the requested target user ID belongs strictly to the authenticated user.
 * Blocks Insecure Direct Object References (IDOR).
 */
export function enforceOwnership(
  sessionUser: User | null,
  requestedUserId: string | null | undefined,
  endpoint: string,
  req?: NextRequest
): OwnershipCheckResult {
  const ip = req ? getClientIp(req) : 'unknown';

  if (!sessionUser) {
    logSecurityEvent({
      event: 'UNAUTHORIZED_ACCESS',
      endpoint,
      method: req?.method || 'UNKNOWN',
      ip,
      targetId: requestedUserId || undefined,
      details: { reason: 'User session missing or unauthenticated' },
      severity: 'WARN',
    });
    return {
      authorized: false,
      status: 401,
      error: 'Authentication required. Please sign in to access this resource.',
    };
  }

  // If a specific userId was requested by the client, it MUST match sessionUser.id
  if (requestedUserId && requestedUserId.trim() !== '' && requestedUserId !== sessionUser.id) {
    logSecurityEvent({
      event: 'IDOR_ATTEMPT',
      endpoint,
      method: req?.method || 'UNKNOWN',
      ip,
      userId: sessionUser.id,
      targetId: requestedUserId,
      details: {
        reason: 'Client attempted to access or modify another user resource',
        authenticatedUser: sessionUser.id,
        attemptedTargetUser: requestedUserId,
      },
      severity: 'CRITICAL',
    });

    return {
      authorized: false,
      status: 403,
      error: 'Access denied. You do not have permission to access or modify this user resource.',
    };
  }

  return {
    authorized: true,
    user: sessionUser,
  };
}
