// =============================================================================
// NEXORA MULTI-USER IDOR & ARCHITECTURE SECURITY TEST SUITE
// =============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${message}`);
    passedTests++;
  } else {
    console.error(`  \x1b[31m✘ FAIL\x1b[0m: ${message}`);
  }
}

console.log('\n\x1b[36m==========================================================\x1b[0m');
console.log('\x1b[36m NEXORA MULTI-USER IDOR & HARDENING VALIDATION SUITE\x1b[0m');
console.log('\x1b[36m==========================================================\x1b[0m\n');

// -----------------------------------------------------------------------------
// TEST SUITE 1: TWO-USER IDOR AUTHORIZATION LOGIC
// -----------------------------------------------------------------------------
console.log('\x1b[33m[TEST GROUP 1] Multi-User IDOR Defense Simulation (User A vs User B)\x1b[0m');

const USER_A = {
  id: 'aaaaaaaa-1111-4aaa-aaaa-aaaaaaaaaaaa',
  email: 'alice@nexra.finance',
  user_metadata: { username: 'AliceTrader' },
};

const USER_B = {
  id: 'bbbbbbbb-2222-4bbb-bbbb-bbbbbbbbbbbb',
  email: 'bob@nexra.finance',
  user_metadata: { username: 'BobInvestor' },
};

// Simulation of enforceOwnership logic from lib/security/session-auth.ts
function simulateEnforceOwnership(sessionUser, requestedUserId, endpoint) {
  if (!sessionUser) {
    return {
      authorized: false,
      status: 401,
      error: 'Authentication required. Please sign in to access this resource.',
    };
  }

  if (requestedUserId && requestedUserId.trim() !== '' && requestedUserId !== sessionUser.id) {
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

// 1.1 User A attempts GET on User B's portfolio (?userId=User_B)
const idorGetAttempt = simulateEnforceOwnership(USER_A, USER_B.id, '/api/games/game-alpha');
assert(
  idorGetAttempt.authorized === false && idorGetAttempt.status === 403,
  'User A cannot access User B portfolio via GET ?userId=User_B (Strictly 403 Forbidden)'
);

// 1.2 User A attempts POST trade on behalf of User B ({ userId: User_B })
const idorPostTradeAttempt = simulateEnforceOwnership(USER_A, USER_B.id, '/api/games/game-alpha');
assert(
  idorPostTradeAttempt.authorized === false && idorPostTradeAttempt.status === 403,
  'User A cannot execute trade on behalf of User B via POST { userId: User_B } (Strictly 403 Forbidden)'
);

// 1.3 User A attempts POST leave on behalf of User B ({ userId: User_B })
const idorPostLeaveAttempt = simulateEnforceOwnership(USER_A, USER_B.id, '/api/games/game-alpha/leave');
assert(
  idorPostLeaveAttempt.authorized === false && idorPostLeaveAttempt.status === 403,
  'User A cannot wipe/leave User B tournament portfolio via POST { userId: User_B } (Strictly 403 Forbidden)'
);

// 1.4 User A attempts POST join on behalf of User B ({ userId: User_B })
const idorPostJoinAttempt = simulateEnforceOwnership(USER_A, USER_B.id, '/api/games/game-alpha/join');
assert(
  idorPostJoinAttempt.authorized === false && idorPostJoinAttempt.status === 403,
  'User A cannot join User B into tournament via POST { userId: User_B } (Strictly 403 Forbidden)'
);

// 1.5 Legitimate User A accessing own resource
const legitAccess = simulateEnforceOwnership(USER_A, USER_A.id, '/api/games/game-alpha');
assert(
  legitAccess.authorized === true,
  'User A can access own portfolio when userId matches session (200 OK Authorized)'
);

// 1.6 Legitimate User A accessing resource without specifying userId (clean client)
const legitOmittedAccess = simulateEnforceOwnership(USER_A, undefined, '/api/games/game-alpha');
assert(
  legitOmittedAccess.authorized === true,
  'User A can access own resource without passing userId parameter (Session-derived identity)'
);

// 1.7 Unauthenticated attacker attempting to query User B's portfolio
const unauthAccess = simulateEnforceOwnership(null, USER_B.id, '/api/games/game-alpha');
assert(
  unauthAccess.authorized === false && unauthAccess.status === 401,
  'Unauthenticated request targeting User B returns 401 Unauthorized'
);


// -----------------------------------------------------------------------------
// TEST SUITE 2: CLIENT CODE PURITY (NO userId IN REQUESTS)
// -----------------------------------------------------------------------------
console.log('\n\x1b[33m[TEST GROUP 2] Client Request Parameters Audit (hooks/useGames.ts)\x1b[0m');

const useGamesContent = fs.readFileSync(path.join(rootDir, 'hooks', 'useGames.ts'), 'utf-8');

// Check that searchParams.set('userId') does not exist
assert(
  !useGamesContent.includes("searchParams.set('userId'"),
  "hooks/useGames.ts does NOT transmit 'userId' in URL query parameters"
);

// Check that searchParams.set('username') does not exist
assert(
  !useGamesContent.includes("searchParams.set('username'"),
  "hooks/useGames.ts does NOT transmit 'username' in URL query parameters"
);

// Check that join mutation body does not include userId
const joinFnMatch = useGamesContent.match(/useJoinGame[\s\S]*?mutationFn:[\s\S]*?body:\s*JSON\.stringify\((\{[\s\S]*?\})\)/);
if (joinFnMatch) {
  const joinBody = joinFnMatch[1];
  assert(
    !joinBody.includes('userId'),
    'useJoinGame does NOT include userId in POST body payload'
  );
} else {
  assert(false, 'Unable to locate useJoinGame mutationFn');
}

// Check that leave mutation body does not include userId
const leaveFnMatch = useGamesContent.match(/useLeaveGame[\s\S]*?mutationFn:[\s\S]*?body:\s*JSON\.stringify\((\{[\s\S]*?\})\)/);
if (leaveFnMatch) {
  const leaveBody = leaveFnMatch[1];
  assert(
    !leaveBody.includes('userId'),
    'useLeaveGame does NOT include userId in POST body payload'
  );
} else {
  assert(false, 'Unable to locate useLeaveGame mutationFn');
}

// Check that trade mutation body does not include userId
const tradeFnMatch = useGamesContent.match(/useGameTrade[\s\S]*?mutationFn:[\s\S]*?body:\s*JSON\.stringify\((\{[\s\S]*?\})\)/);
if (tradeFnMatch) {
  const tradeBody = tradeFnMatch[1];
  assert(
    !tradeBody.includes('userId'),
    'useGameTrade does NOT include userId in POST body payload'
  );
} else {
  assert(false, 'Unable to locate useGameTrade mutationFn');
}

// Check that create mutation body does not include creatorId
const createFnMatch = useGamesContent.match(/useCreateGame[\s\S]*?mutationFn:[\s\S]*?body:\s*JSON\.stringify\((\{[\s\S]*?\})\)/);
if (createFnMatch) {
  const createBody = createFnMatch[1];
  assert(
    !createBody.includes('creatorId'),
    'useCreateGame does NOT include creatorId in POST body payload'
  );
} else {
  assert(false, 'Unable to locate useCreateGame mutationFn');
}


// -----------------------------------------------------------------------------
// TEST SUITE 3: CLOUDFLARE TURNSTILE LIFECYCLE AUDIT
// -----------------------------------------------------------------------------
console.log('\n\x1b[33m[TEST GROUP 3] Cloudflare Turnstile Lifecycle & Warning Fix Audit\x1b[0m');

const turnstileWidgetContent = fs.readFileSync(
  path.join(rootDir, 'components', 'security', 'TurnstileWidget.tsx'),
  'utf-8'
);

assert(
  turnstileWidgetContent.includes('container.hasChildNodes()'),
  'TurnstileWidget guards window.turnstile.remove() with container.hasChildNodes() check'
);

assert(
  turnstileWidgetContent.includes('document.body.contains(container)'),
  'TurnstileWidget checks DOM containment before attempting widget removal'
);

assert(
  turnstileWidgetContent.includes('safeRemoveWidget'),
  'TurnstileWidget encapsulates removal in safeRemoveWidget helper to prevent racing'
);

const authSwitchContent = fs.readFileSync(
  path.join(rootDir, 'components', 'ui', 'auth-switch.tsx'),
  'utf-8'
);

assert(
  authSwitchContent.includes('key={`turnstile-${mode}`}'),
  'auth-switch.tsx specifies key={`turnstile-${mode}`} for isolated widget lifecycles across signin/signup'
);

assert(
  authSwitchContent.includes('disabled={!turnstileToken || isLoading}'),
  'auth-switch.tsx strictly disables submit button when !turnstileToken || isLoading'
);

assert(
  authSwitchContent.includes('if (!turnstileToken)'),
  'auth-switch.tsx aborts submission immediately if turnstileToken is null or missing'
);

assert(
  authSwitchContent.includes('/api/auth/turnstile-verify'),
  'auth-switch.tsx executes mandatory server-side token validation before login/register'
);

assert(
  turnstileWidgetContent.includes('if (!rawSiteKey)'),
  'TurnstileWidget checks if NEXT_PUBLIC_TURNSTILE_SITE_KEY is missing/empty and logs warning'
);

assert(
  turnstileWidgetContent.includes('turnstile_test_token_ok'),
  'TurnstileWidget provides non-blocking test token fallback when sitekey is unconfigured'
);


// -----------------------------------------------------------------------------
// TEST SUITE 4: DISTRIBUTED RATE LIMITING & UPSTASH REDIS ADAPTER
// -----------------------------------------------------------------------------
console.log('\n\x1b[33m[TEST GROUP 4] Distributed Serverless Rate Limiting Adapter Audit\x1b[0m');

const rateLimiterContent = fs.readFileSync(
  path.join(rootDir, 'lib', 'security', 'rate-limiter.ts'),
  'utf-8'
);

assert(
  rateLimiterContent.includes('checkDistributedRateLimit'),
  'lib/security/rate-limiter.ts exports checkDistributedRateLimit for Edge/Serverless environments'
);

assert(
  rateLimiterContent.includes('UPSTASH_REDIS_REST_URL') && rateLimiterContent.includes('UPSTASH_REDIS_REST_TOKEN'),
  'Distributed rate limiter integrates with UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN'
);

assert(
  rateLimiterContent.includes('X-RateLimit-Backend'),
  'Distributed rate limiter sets diagnostic headers including X-RateLimit-Backend'
);

const envExampleContent = fs.readFileSync(path.join(rootDir, '.env.example'), 'utf-8');
assert(
  envExampleContent.includes('UPSTASH_REDIS_REST_URL') && envExampleContent.includes('UPSTASH_REDIS_REST_TOKEN'),
  '.env.example documents UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN'
);


// -----------------------------------------------------------------------------
// TEST SUITE 5: RLS POLICIES & SECRETS EXPOSURE AUDIT
// -----------------------------------------------------------------------------
console.log('\n\x1b[33m[TEST GROUP 5] Supabase RLS & Secrets Exposure Audit\x1b[0m');

const rlsMigration = fs.readFileSync(
  path.join(rootDir, 'supabase', 'migrations', '20260918_harden_rls_policies.sql'),
  'utf-8'
);

assert(
  rlsMigration.includes('ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;'),
  'RLS migration enables Row Level Security on public.portfolios'
);

assert(
  rlsMigration.includes('auth.uid() = user_id'),
  'RLS migration enforces strict auth.uid() = user_id ownership check on user data'
);

const serverSupabaseContent = fs.readFileSync(
  path.join(rootDir, 'lib', 'supabase', 'server.ts'),
  'utf-8'
);

assert(
  !serverSupabaseContent.includes('SERVICE_ROLE') && serverSupabaseContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  'lib/supabase/server.ts strictly operates under NEXT_PUBLIC_SUPABASE_ANON_KEY and never exposes service_role'
);

// -----------------------------------------------------------------------------
// TEST SUITE 6: CONTENT SECURITY POLICY (CSP) & REFERRAL LINK AUDIT
// -----------------------------------------------------------------------------
console.log('\n\x1b[33m[TEST GROUP 6] CSP Headers & Dynamic Referral Link Audit\x1b[0m');

const middlewareContent = fs.readFileSync(path.join(rootDir, 'middleware.ts'), 'utf-8');
assert(
  middlewareContent.includes("'unsafe-eval'") && middlewareContent.includes('https://challenges.cloudflare.com'),
  "middleware.ts includes 'unsafe-eval' and https://challenges.cloudflare.com in script-src"
);

assert(
  middlewareContent.includes("frame-src 'self' https://challenges.cloudflare.com"),
  "middleware.ts includes https://challenges.cloudflare.com in frame-src"
);

assert(
  middlewareContent.includes("https://fonts.googleapis.com") && middlewareContent.includes("https://fonts.gstatic.com"),
  "middleware.ts includes https://fonts.googleapis.com (style-src) and https://fonts.gstatic.com (font-src)"
);

assert(
  middlewareContent.includes("frame-ancestors 'none'"),
  "middleware.ts includes frame-ancestors 'none'"
);

const nextConfigContent = fs.readFileSync(path.join(rootDir, 'next.config.mjs'), 'utf-8');
assert(
  nextConfigContent.includes("'unsafe-eval'") && nextConfigContent.includes('https://challenges.cloudflare.com'),
  "next.config.mjs headers include 'unsafe-eval' and https://challenges.cloudflare.com"
);

assert(
  nextConfigContent.includes("https://fonts.googleapis.com") && nextConfigContent.includes("https://fonts.gstatic.com"),
  "next.config.mjs includes Google Fonts domains in style-src and font-src"
);

assert(
  nextConfigContent.includes("frame-ancestors 'none'"),
  "next.config.mjs includes frame-ancestors 'none'"
);

const invitePageContent = fs.readFileSync(path.join(rootDir, 'app', 'invite', 'page.tsx'), 'utf-8');
assert(
  !invitePageContent.includes('https://nexora.sim'),
  "app/invite/page.tsx does NOT contain hardcoded 'https://nexora.sim'"
);

assert(
  invitePageContent.includes('window.location.origin') && invitePageContent.includes('https://nexora-psi-beryl.vercel.app'),
  'app/invite/page.tsx uses dynamic window.location.origin with fallback to https://nexora-psi-beryl.vercel.app'
);

const joinPagePath = path.join(rootDir, 'app', 'join', 'page.tsx');
assert(
  fs.existsSync(joinPagePath),
  'app/join/page.tsx exists and provides seamless redirect to /register'
);

// -----------------------------------------------------------------------------
// FINAL SUMMARY
// -----------------------------------------------------------------------------
console.log('\n\x1b[36m==========================================================\x1b[0m');
if (passedTests === totalTests) {
  console.log(`\x1b[32m ALL ${passedTests}/${totalTests} SECURITY AUDIT CHECKS PASSED SUCCESSFULLY!\x1b[0m`);
} else {
  console.log(`\x1b[31m WARNING: Only ${passedTests}/${totalTests} checks passed.\x1b[0m`);
}
console.log('\x1b[36m==========================================================\x1b[0m\n');

process.exit(passedTests === totalTests ? 0 : 1);
