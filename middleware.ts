import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // 1. CSRF Protection for state-modifying requests (POST, PUT, DELETE, PATCH)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    // If origin is present, ensure it matches request host (blocks cross-origin request forging)
    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host && !originUrl.host.endsWith('.vercel.app')) {
          return NextResponse.json(
            { error: 'CROSS_SITE_REQUEST_BLOCKED', message: 'Forbidden cross-origin request.' },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'INVALID_ORIGIN_HEADER', message: 'Forbidden request.' },
          { status: 403 }
        );
      }
    }
  }

  // 2. Immediately bypass Next.js internal bundles, static chunks, and assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico' ||
    pathname === '/hero-bg.jpg' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 3. Process Supabase Session refresh
  let response = await updateSession(request);
  if (!response) {
    response = NextResponse.next({ request });
  }

  // 4. Inject Baseline Defensive HTTP Security Headers
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
    "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com data:",
    "frame-src 'self' https://challenges.cloudflare.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com https://fonts.googleapis.com https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - all static asset extensions (.png, .jpg, .svg, .js, .css, .woff, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2|ttf|eot)$).*)',
  ],
};
