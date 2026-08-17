import { supabase } from '@/lib/supabase/client';
import { REAL_STOCKS_UNIVERSE } from '@/lib/market-data/market-service';
import {
  TradingGame,
  GameParticipant,
  GamePortfolio,
  GameHolding,
  GameTransaction,
  CreateGamePayload,
  calculateRewardXp,
} from './types';

// Helper: Format ISO date string into standard US Eastern Time
export function formatEasternDateTime(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }) + ' EDT';
  } catch {
    return isoString;
  }
}

// Helper: Live Countdown text to a target date
export function getCountdownString(targetIso: string, isStartCountdown: boolean = true): string {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) return isStartCountdown ? 'Starting now' : 'Ended';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  const prefix = isStartCountdown ? 'Starts in ' : 'Ends in ';
  if (days > 0) return `${prefix}${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${prefix}${hours}h ${mins}m ${secs}s`;
  return `${prefix}${mins}m ${secs}s`;
}

// Compute live lifecycle status dynamically based on current time vs start/end dates
export function getComputedGameStatus(game: { startDate: string; endDate: string; status?: string }): 'upcoming' | 'active' | 'completed' {
  const now = Date.now();
  const start = new Date(game.startDate).getTime();
  const end = new Date(game.endDate).getTime();

  if (!isNaN(start) && now < start) {
    return 'upcoming';
  }
  if (!isNaN(end) && now > end) {
    return 'completed';
  }
  return 'active';
}

// Parse Date and Time input into a normalized ISO string in US Eastern Time
export function parseEasternDateTime(dateStr: string, timeStr?: string): string {
  if (!dateStr) return new Date().toISOString();

  // If already full ISO format with time
  if (dateStr.includes('T') && dateStr.length > 10) {
    return dateStr;
  }

  const cleanDate = dateStr.trim(); // YYYY-MM-DD
  const rawTime = (timeStr || '09:00').trim();

  let hours = 9;
  let minutes = 0;

  // Handle 12-hour AM/PM format (e.g. "09:30 AM" or "04:00 PM")
  const match12 = rawTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    hours = parseInt(match12[1], 10);
    minutes = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  } else {
    // Handle 24-hour format (e.g. "09:30" or "18:00")
    const match24 = rawTime.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
      hours = parseInt(match24[1], 10);
      minutes = parseInt(match24[2], 10);
    }
  }

  const pad = (n: number) => n.toString().padStart(2, '0');
  // Construct ISO string targeting EDT (-04:00)
  return `${cleanDate}T${pad(hours)}:${pad(minutes)}:00-04:00`;
}

// Baseline Institutional Educational Trading Games
export const INITIAL_GAMES: TradingGame[] = [
  {
    id: 'game-alpha-summer-2026',
    slug: 'alpha-summer-cup-2026',
    title: 'Alpha Trader Summer Cup 2026',
    description: 'The premier global equities competition. Equal starting capital, transparent real-time execution, and strict risk-adjusted return rankings.',
    category: 'Equities',
    status: 'active',
    visibility: 'public',
    startingCapital: 25000,
    participantsCount: 1420,
    maxParticipants: 2000,
    startDate: '2026-08-01T09:00:00-04:00',
    endDate: '2026-08-31T18:00:00-04:00',
    startTime: '09:00 AM EDT',
    endTime: '06:00 PM EDT',
    timezone: 'US Eastern Time (EDT/EST)',
    durationDays: 30,
    allowLateJoiners: true,
    allowJoinAfterStart: true,
    allowedAssetClasses: ['stocks', 'etfs', 'indices'],
    rules: [
      'Equal starting virtual capital of $25,000.00 for all participants.',
      'All trades execute against real-time equity and ETF market prices.',
      'Strictly zero cryptocurrency assets allowed.',
      'Rankings are determined strictly by Net Portfolio Return percentage.',
      'Competition cash is completely isolated from normal Nexra account balance.',
    ],
    prizePoolDescription: '1st: +500 XP | 2nd: +350 XP | 3rd: +250 XP | Top 10: +100 XP | Finishers: +25 XP',
    inviteCode: 'ALPHA2026',
    createdAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'game-tech-titans-2026',
    slug: 'tech-titans-championship',
    title: 'Tech Titans Equities Championship',
    description: 'Compete exclusively in high-growth semiconductor, cloud, enterprise software, and artificial intelligence leaders.',
    category: 'Tech Titans',
    status: 'active',
    visibility: 'public',
    startingCapital: 50000,
    participantsCount: 890,
    maxParticipants: 1000,
    startDate: '2026-08-10T09:00:00-04:00',
    endDate: '2026-08-28T18:00:00-04:00',
    startTime: '09:00 AM EDT',
    endTime: '06:00 PM EDT',
    timezone: 'US Eastern Time (EDT/EST)',
    durationDays: 18,
    allowLateJoiners: true,
    allowJoinAfterStart: true,
    allowedAssetClasses: ['stocks'],
    rules: [
      'Starting capital: $50,000.00 isolated virtual cash.',
      'Trade technology and semiconductor stocks (NVDA, AAPL, MSFT, ASML, TSM, AVGO, etc.).',
      'Minimum of 3 different asset holdings required for final qualification.',
      'Real-time automated leaderboards update on market tick.',
    ],
    prizePoolDescription: '1st: +500 XP | 2nd: +350 XP | 3rd: +250 XP | Top 10: +100 XP | Finishers: +25 XP',
    inviteCode: 'TECH2026',
    createdAt: '2026-08-10T00:00:00Z',
  },
  {
    id: 'game-dividend-sprint-2026',
    slug: 'blue-chip-dividend-sprint',
    title: 'Blue-Chip Dividend Aristocrats Sprint',
    description: 'Value and income investing tournament focused on defensive cash generators, consumer staples, and dividend growth.',
    category: 'Dividends',
    status: 'active',
    visibility: 'public',
    startingCapital: 10000,
    participantsCount: 640,
    maxParticipants: 800,
    startDate: '2026-08-12T09:00:00-04:00',
    endDate: '2026-08-25T18:00:00-04:00',
    startTime: '09:00 AM EDT',
    endTime: '06:00 PM EDT',
    timezone: 'US Eastern Time (EDT/EST)',
    durationDays: 13,
    allowLateJoiners: false,
    allowJoinAfterStart: false,
    allowedAssetClasses: ['stocks', 'etfs'],
    rules: [
      'Starting capital: $10,000.00 isolated virtual cash.',
      'Focus on high-quality value, dividend growth, and low-volatility equities.',
      'Late joiners disabled after start time.',
    ],
    prizePoolDescription: '1st: +500 XP | 2nd: +350 XP | 3rd: +250 XP | Top 10: +100 XP | Finishers: +25 XP',
    inviteCode: 'DIV2026',
    createdAt: '2026-08-12T00:00:00Z',
  },
  {
    id: 'game-global-macro-2026',
    slug: 'global-macro-invitational',
    title: 'Global Macro Invitational 2026',
    description: 'Upcoming multi-market competition spanning North American, European, Asian, and Latin American equity markets.',
    category: 'Global Macro',
    status: 'upcoming',
    visibility: 'public',
    startingCapital: 100000,
    participantsCount: 310,
    maxParticipants: 1500,
    startDate: '2026-09-01T09:00:00-04:00',
    endDate: '2026-09-30T18:00:00-04:00',
    startTime: '09:00 AM EDT',
    endTime: '06:00 PM EDT',
    timezone: 'US Eastern Time (EDT/EST)',
    durationDays: 30,
    allowLateJoiners: false,
    allowJoinAfterStart: false,
    allowedAssetClasses: ['stocks', 'etfs', 'indices'],
    rules: [
      'Starting capital: $100,000.00 isolated virtual cash.',
      'Global equities across US, Canada, Europe, Asia, and Emerging Markets.',
      'Trading arena remains locked until Sep 1, 2026 at 9:00 AM EDT.',
    ],
    prizePoolDescription: '1st: +500 XP | 2nd: +350 XP | 3rd: +250 XP | Top 10: +100 XP | Finishers: +25 XP',
    inviteCode: 'MACRO2026',
    createdAt: '2026-08-15T00:00:00Z',
  },
  {
    id: 'game-spring-classic-2026',
    slug: 'spring-alpha-classic',
    title: 'Spring Alpha Classic 2026',
    description: 'Concluded quarterly tournament celebrating the top simulated equity performers of Q2.',
    category: 'Equities',
    status: 'completed',
    visibility: 'public',
    startingCapital: 25000,
    participantsCount: 2150,
    maxParticipants: 2500,
    startDate: '2026-05-01T09:00:00-04:00',
    endDate: '2026-05-31T18:00:00-04:00',
    startTime: '09:00 AM EDT',
    endTime: '06:00 PM EDT',
    timezone: 'US Eastern Time (EDT/EST)',
    durationDays: 31,
    allowLateJoiners: false,
    allowJoinAfterStart: false,
    allowedAssetClasses: ['stocks', 'etfs'],
    rules: [
      'Standard equal starting capital of $25,000.00.',
      'Tournament completed on May 31, 2026.',
    ],
    prizePoolDescription: 'Final Rankings Frozen • XP Rewards Distributed',
    inviteCode: 'SPRING2026',
    xpDistributed: true,
    finalRankingsLocked: true,
    createdAt: '2026-05-01T00:00:00Z',
  },
];

// Persistent cache on globalThis
const globalForGames = globalThis as unknown as {
  __nexraGamesState__?: {
    gamesList: TradingGame[];
    gamePortfolios: Map<string, GamePortfolio>; // key: `${gameId}_${userId}`
    customLeaderboards: Map<string, GameParticipant[]>; // key: gameId
    awardedUsers: Set<string>; // key: `${gameId}_${userId}`
    leftParticipants: Map<string, Set<string>>; // key: gameId -> Set of userIds who left
  };
};

if (!globalForGames.__nexraGamesState__) {
  globalForGames.__nexraGamesState__ = {
    gamesList: [...INITIAL_GAMES],
    gamePortfolios: new Map(),
    customLeaderboards: new Map(),
    awardedUsers: new Set(),
    leftParticipants: new Map(),
  };
}

const gamesState = globalForGames.__nexraGamesState__;

// Pre-seed benchmark competitors for games
function generateGameLeaderboard(game: TradingGame, currentPortfolio?: GamePortfolio, currentUsername?: string): GameParticipant[] {
  const baseParticipants: Omit<GameParticipant, 'isCurrentUser'>[] = [
    {
      userId: 'bot-1',
      username: 'SatoshiQuant',
      rank: 1,
      startingCapital: game.startingCapital,
      portfolioValue: Number((game.startingCapital * 1.342).toFixed(2)),
      returnPct: 34.20,
      pnl: Number((game.startingCapital * 0.342).toFixed(2)),
      totalTrades: 28,
      winRate: '75%',
    },
    {
      userId: 'bot-2',
      username: 'ValkyrieTrading',
      rank: 2,
      startingCapital: game.startingCapital,
      portfolioValue: Number((game.startingCapital * 1.284).toFixed(2)),
      returnPct: 28.40,
      pnl: Number((game.startingCapital * 0.284).toFixed(2)),
      totalTrades: 19,
      winRate: '71%',
    },
    {
      userId: 'bot-3',
      username: 'CyberBull_99',
      rank: 3,
      startingCapital: game.startingCapital,
      portfolioValue: Number((game.startingCapital * 1.215).toFixed(2)),
      returnPct: 21.50,
      pnl: Number((game.startingCapital * 0.215).toFixed(2)),
      totalTrades: 34,
      winRate: '68%',
    },
    {
      userId: 'bot-4',
      username: 'AlphaSeeker_X',
      rank: 4,
      startingCapital: game.startingCapital,
      portfolioValue: Number((game.startingCapital * 1.168).toFixed(2)),
      returnPct: 16.80,
      pnl: Number((game.startingCapital * 0.168).toFixed(2)),
      totalTrades: 22,
      winRate: '64%',
    },
    {
      userId: 'bot-5',
      username: 'ApexCapital',
      rank: 5,
      startingCapital: game.startingCapital,
      portfolioValue: Number((game.startingCapital * 1.112).toFixed(2)),
      returnPct: 11.20,
      pnl: Number((game.startingCapital * 0.112).toFixed(2)),
      totalTrades: 14,
      winRate: '62%',
    },
    {
      userId: 'bot-6',
      username: 'DeltaHedger',
      rank: 6,
      startingCapital: game.startingCapital,
      portfolioValue: Number((game.startingCapital * 1.074).toFixed(2)),
      returnPct: 7.40,
      pnl: Number((game.startingCapital * 0.074).toFixed(2)),
      totalTrades: 11,
      winRate: '58%',
    },
    {
      userId: 'bot-7',
      username: 'VectorQuant',
      rank: 7,
      startingCapital: game.startingCapital,
      portfolioValue: Number((game.startingCapital * 1.032).toFixed(2)),
      returnPct: 3.20,
      pnl: Number((game.startingCapital * 0.032).toFixed(2)),
      totalTrades: 9,
      winRate: '55%',
    },
  ];

  let list: GameParticipant[] = baseParticipants.map((p) => ({ ...p, isCurrentUser: false }));

  if (currentPortfolio) {
    const userEntry: GameParticipant = {
      userId: currentPortfolio.userId,
      username: currentUsername || 'Trader (You)',
      rank: 0,
      startingCapital: currentPortfolio.startingCapital,
      portfolioValue: currentPortfolio.totalPortfolioValue,
      returnPct: currentPortfolio.returnPct,
      pnl: currentPortfolio.pnl,
      totalTrades: currentPortfolio.transactions.length,
      winRate: currentPortfolio.transactions.length > 0 ? '66.7%' : '—',
      isCurrentUser: true,
    };
    list.push(userEntry);
  }

  // Sort by returnPct descending
  list.sort((a, b) => b.returnPct - a.returnPct);

  // Assign ranks and calculate exact non-stacked XP reward
  list = list.map((item, idx) => {
    const rank = idx + 1;
    const rewardXp = calculateRewardXp(rank);
    return {
      ...item,
      rank,
      rewardXp,
    };
  });

  return list;
}

export function sanitizeGame<T extends TradingGame | null | undefined>(game: T): T {
  if (!game) return game;
  const clone = { ...game };
  delete clone.password;
  // Dynamically update status based on live time
  clone.status = getComputedGameStatus(clone);
  return clone;
}

// Finalize a completed game and distribute XP rewards to users
export async function finalizeCompletedGame(game: TradingGame): Promise<void> {
  const currentStatus = getComputedGameStatus(game);
  if (currentStatus !== 'completed') return;

  game.status = 'completed';
  game.finalRankingsLocked = true;

  if (game.xpDistributed) return;

  // Process XP distribution for user portfolios
  gamesState.gamePortfolios.forEach(async (portfolio, key) => {
    if (!key.startsWith(`${game.id}_`)) return;
    const userKey = `${game.id}_${portfolio.userId}`;
    if (gamesState.awardedUsers.has(userKey)) return;

    const rank = portfolio.rank || 8;
    const xpReward = calculateRewardXp(rank);

    portfolio.rewardXp = xpReward;
    portfolio.xpAwarded = true;
    gamesState.awardedUsers.add(userKey);

    // Persist XP to Supabase user profile
    if (portfolio.userId && !portfolio.userId.startsWith('guest') && !portfolio.userId.startsWith('bot-')) {
      try {
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('id, xp, level')
          .eq('id', portfolio.userId)
          .single();

        if (profile) {
          const newXp = (profile.xp || 0) + xpReward;
          const newLevel = Math.max(1, Math.floor(newXp / 1000) + 1);
          await (supabase as any)
            .from('profiles')
            .update({ xp: newXp, level: newLevel })
            .eq('id', portfolio.userId);
        }
      } catch {}
    }
  });

  game.xpDistributed = true;
}

// 1. Get All Games with optional status filter (always sanitized and dynamically updated)
export async function getGames(status?: 'active' | 'upcoming' | 'completed'): Promise<TradingGame[]> {
  let list = gamesState.gamesList.map((g) => {
    const computedStatus = getComputedGameStatus(g);
    g.status = computedStatus;
    if (computedStatus === 'completed' && !g.xpDistributed) {
      finalizeCompletedGame(g).catch(() => {});
    }
    return sanitizeGame(g);
  });

  if (status) {
    list = list.filter((g) => g.status === status);
  }
  return list;
}

// 2. Get Single Game by ID or Slug (raw or sanitized)
export async function getGameById(idOrSlug: string, options?: { raw?: boolean }): Promise<TradingGame | null> {
  const clean = decodeURIComponent(idOrSlug || '').toLowerCase().trim();
  const game = gamesState.gamesList.find(
    (g) =>
      g.id.toLowerCase() === clean ||
      g.slug.toLowerCase() === clean ||
      g.id.toLowerCase() === `game-${clean}` ||
      (g.inviteCode && g.inviteCode.toLowerCase() === clean)
  );
  if (!game) return null;

  const computedStatus = getComputedGameStatus(game);
  game.status = computedStatus;

  if (computedStatus === 'completed' && !game.xpDistributed) {
    finalizeCompletedGame(game).catch(() => {});
  }

  return options?.raw ? game : sanitizeGame(game);
}

// Verify private game password server-side
export async function verifyGamePassword(
  idOrSlug: string,
  passwordAttempt?: string,
  userId?: string
): Promise<{
  valid: boolean;
  isCreator?: boolean;
  message?: string;
  game?: TradingGame;
}> {
  const rawGame = await getGameById(idOrSlug, { raw: true });
  if (!rawGame) {
    return { valid: false, message: 'Tournament not found.' };
  }

  // Creator has automatic access
  if (userId && rawGame.creatorId && userId === rawGame.creatorId) {
    return { valid: true, isCreator: true, game: sanitizeGame(rawGame) };
  }

  // Public games do not require password
  if (rawGame.visibility !== 'private') {
    return { valid: true, game: sanitizeGame(rawGame) };
  }

  if (!passwordAttempt || !passwordAttempt.trim()) {
    return { valid: false, message: 'Password is required to enter this private tournament.' };
  }

  if (rawGame.password && rawGame.password.trim() === passwordAttempt.trim()) {
    return { valid: true, game: sanitizeGame(rawGame) };
  }

  return { valid: false, message: 'Incorrect tournament password. Access denied.' };
}

// 3. Create a New Game with Exact Scheduled Start / End Times & US Eastern Timezone
export async function createGame(payload: CreateGamePayload, creatorId?: string, creatorName?: string): Promise<TradingGame> {
  const id = `game-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  // Normalize Start and End Dates with exact time in US Eastern Time
  const startDateISO = parseEasternDateTime(payload.startDate, payload.startTime);
  const endDateISO = parseEasternDateTime(payload.endDate, payload.endTime);

  const startMs = new Date(startDateISO).getTime();
  const endMs = new Date(endDateISO).getTime();
  const durationDays = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)));

  const allowLateJoiners = Boolean(
    payload.allowLateJoiners ?? payload.allowJoinAfterStart ?? true
  );

  const initialStatus = getComputedGameStatus({ startDate: startDateISO, endDate: endDateISO });

  const newGame: TradingGame = {
    id,
    slug: slug || id,
    title: payload.name.trim(),
    description: payload.description.trim() || 'Custom simulated trading tournament on Nexra.',
    category: 'Custom',
    status: initialStatus,
    visibility: payload.visibility,
    password: payload.password,
    startingCapital: payload.startingCapital || 25000,
    participantsCount: 1,
    maxParticipants: payload.maxPlayers > 0 ? payload.maxPlayers : undefined,
    startDate: startDateISO,
    endDate: endDateISO,
    startTime: payload.startTime || '09:00 AM EDT',
    endTime: payload.endTime || '06:00 PM EDT',
    timezone: 'US Eastern Time (EDT/EST)',
    durationDays,
    allowLateJoiners,
    allowJoinAfterStart: allowLateJoiners,
    allowedAssetClasses: payload.allowedAssetClasses || ['stocks', 'etfs', 'indices'],
    rules: [
      `Starting virtual balance: $${(payload.startingCapital || 25000).toLocaleString()}.00 (completely isolated).`,
      `Asset universe: ${payload.allowedAssetClasses.join(', ').toUpperCase()}.`,
      `Scheduled start: ${formatEasternDateTime(startDateISO)}.`,
      `Scheduled finish: ${formatEasternDateTime(endDateISO)}.`,
      `Late joining: ${allowLateJoiners ? 'Allowed during active tournament' : 'Strictly closed after start time'}.`,
      'Rankings determined strictly by Net Portfolio Return percentage.',
    ],
    prizePoolDescription: '1st: +500 XP | 2nd: +350 XP | 3rd: +250 XP | Top 10: +100 XP | Finishers: +25 XP',
    creatorId,
    creatorName,
    inviteCode,
    xpDistributed: false,
    finalRankingsLocked: false,
    createdAt: new Date().toISOString(),
  };

  gamesState.gamesList = [newGame, ...gamesState.gamesList];

  // If creator provided, automatically initialize creator's portfolio as joined
  if (creatorId) {
    const creatorKey = `${newGame.id}_${creatorId}`;
    const creatorPort: GamePortfolio = {
      gameId: newGame.id,
      userId: creatorId,
      startingCapital: newGame.startingCapital,
      cashBalance: newGame.startingCapital,
      totalPortfolioValue: newGame.startingCapital,
      holdings: [],
      transactions: [],
      rank: 1,
      returnPct: 0.0,
      pnl: 0.0,
      joinedAt: new Date().toISOString(),
    };
    gamesState.gamePortfolios.set(creatorKey, creatorPort);
  }

  // Try persisting to Supabase if games table exists
  try {
    await (supabase as any).from('games').insert({
      id: newGame.id,
      title: newGame.title,
      description: newGame.description,
      starting_capital: newGame.startingCapital,
      status: newGame.status,
      visibility: newGame.visibility,
      invite_code: newGame.inviteCode,
      creator_id: creatorId,
      start_date: newGame.startDate,
      end_date: newGame.endDate,
    });
  } catch {}

  return newGame;
}

// 4. JOIN TOURNAMENT WITH STRICT VALIDATION & PORTFOLIO CREATION
export async function joinGame(payload: {
  gameIdOrSlug: string;
  userId: string;
  username?: string;
  password?: string;
}): Promise<{
  success: boolean;
  message: string;
  portfolio: GamePortfolio;
  game: TradingGame;
}> {
  const { gameIdOrSlug, userId, username, password } = payload;
  const rawGame = await getGameById(gameIdOrSlug, { raw: true });
  if (!rawGame) throw new Error('Tournament not found.');

  const currentStatus = getComputedGameStatus(rawGame);

  // Status restriction: Nobody can join after tournament has ended
  if (currentStatus === 'completed') {
    throw new Error('This tournament has concluded. New participants cannot join.');
  }

  // Status restriction: If late joining is disabled, closed after start
  const allowLate = rawGame.allowLateJoiners !== false && rawGame.allowJoinAfterStart !== false;
  if (currentStatus === 'active' && !allowLate) {
    throw new Error(
      `Late joining is closed for this tournament. Registration ended on ${formatEasternDateTime(rawGame.startDate)}.`
    );
  }

  const key = `${rawGame.id}_${userId}`;
  if (gamesState.gamePortfolios.has(key)) {
    throw new Error('You are already registered in this tournament.');
  }

  // Re-entry restriction
  if (gamesState.leftParticipants?.get(rawGame.id)?.has(userId)) {
    throw new Error('You previously left this tournament. Rejoining is not permitted.');
  }

  // Max capacity restriction
  if (rawGame.maxParticipants && rawGame.maxParticipants > 0 && rawGame.participantsCount >= rawGame.maxParticipants) {
    throw new Error('Tournament is full (maximum capacity reached).');
  }

  // Private tournament password verification
  if (rawGame.visibility === 'private' && rawGame.creatorId !== userId) {
    if (!password || rawGame.password?.trim() !== password.trim()) {
      throw new Error('Incorrect tournament password. Access denied.');
    }
  }

  // Initialize isolated competition portfolio with starting capital
  const port: GamePortfolio = {
    gameId: rawGame.id,
    userId,
    startingCapital: rawGame.startingCapital,
    cashBalance: rawGame.startingCapital,
    totalPortfolioValue: rawGame.startingCapital,
    holdings: [],
    transactions: [],
    rank: (rawGame.participantsCount || 1) + 1,
    returnPct: 0.0,
    pnl: 0.0,
    joinedAt: new Date().toISOString(),
  };

  gamesState.gamePortfolios.set(key, port);
  rawGame.participantsCount = (rawGame.participantsCount || 0) + 1;

  return {
    success: true,
    message: `Successfully joined ${rawGame.title}! Your isolated starting capital of $${rawGame.startingCapital.toLocaleString()} is ready.`,
    portfolio: port,
    game: sanitizeGame(rawGame),
  };
}

// 5. LEAVE TOURNAMENT WITH CLEANUP
export async function leaveGame(payload: {
  gameIdOrSlug: string;
  userId: string;
}): Promise<{
  success: boolean;
  message: string;
  game: TradingGame;
}> {
  const { gameIdOrSlug, userId } = payload;
  const rawGame = await getGameById(gameIdOrSlug, { raw: true });
  if (!rawGame) throw new Error('Tournament not found.');

  const key = `${rawGame.id}_${userId}`;
  const existingPort = gamesState.gamePortfolios.get(key);

  if (!existingPort) {
    throw new Error('You are not currently enrolled in this tournament.');
  }

  // Remove portfolio from active competition state
  gamesState.gamePortfolios.delete(key);

  // Record that user left
  if (!gamesState.leftParticipants) {
    gamesState.leftParticipants = new Map();
  }
  let leftSet = gamesState.leftParticipants.get(rawGame.id);
  if (!leftSet) {
    leftSet = new Set();
    gamesState.leftParticipants.set(rawGame.id, leftSet);
  }
  leftSet.add(userId);

  rawGame.participantsCount = Math.max(1, (rawGame.participantsCount || 1) - 1);

  return {
    success: true,
    message: `You have left ${rawGame.title}. Your competition portfolio has been closed. Your main Nexra cash remains untouched.`,
    game: sanitizeGame(rawGame),
  };
}

// 6. Get User's Competition Portfolio (Strictly Isolated from Main Cash)
export async function getGamePortfolio(gameId: string, userId: string, username?: string): Promise<{
  portfolio: GamePortfolio | null;
  hasJoined: boolean;
  hasLeft: boolean;
  leaderboard: GameParticipant[];
  game: TradingGame;
}> {
  const rawGame = await getGameById(gameId, { raw: true });
  if (!rawGame) throw new Error('Tournament not found.');

  const currentStatus = getComputedGameStatus(rawGame);
  rawGame.status = currentStatus;

  const key = `${rawGame.id}_${userId}`;
  let port = gamesState.gamePortfolios.get(key);

  const hasLeft = Boolean(gamesState.leftParticipants?.get(rawGame.id)?.has(userId));
  const hasJoined = Boolean(port);

  if (port) {
    // Recalculate portfolio value with live market prices
    let totalHoldingsValue = 0;
    port.holdings = port.holdings.map((h) => {
      const liveStock = REAL_STOCKS_UNIVERSE.find((s) => s.ticker.toUpperCase() === h.ticker.toUpperCase());
      const currentPrice = Number(liveStock?.current_price ?? h.currentPrice);
      const currentValue = Number((h.shares * currentPrice).toFixed(2));
      const totalCost = Number((h.shares * h.avgCost).toFixed(2));
      const unrealizedPnl = Number((currentValue - totalCost).toFixed(2));
      const returnPct = totalCost > 0 ? Number(((unrealizedPnl / totalCost) * 100).toFixed(2)) : 0;

      totalHoldingsValue += currentValue;

      return {
        ...h,
        currentPrice,
        currentValue,
        unrealizedPnl,
        returnPct,
        allocationPct: 0,
      };
    });

    const totalPortfolioValue = Number((port.cashBalance + totalHoldingsValue).toFixed(2));
    const pnl = Number((totalPortfolioValue - port.startingCapital).toFixed(2));
    const returnPct = port.startingCapital > 0 ? Number(((pnl / port.startingCapital) * 100).toFixed(2)) : 0;

    port.holdings = port.holdings.map((h) => ({
      ...h,
      allocationPct: totalPortfolioValue > 0 ? Number(((h.currentValue / totalPortfolioValue) * 100).toFixed(1)) : 0,
    }));

    port.totalPortfolioValue = totalPortfolioValue;
    port.pnl = pnl;
    port.returnPct = returnPct;
  }

  const leaderboard = generateGameLeaderboard(rawGame, port || undefined, username);
  if (port) {
    const userRank = leaderboard.find((p) => p.isCurrentUser)?.rank || 8;
    port.rank = userRank;
    port.rewardXp = calculateRewardXp(userRank);
  }

  // If game is completed, finalize XP rewards
  if (currentStatus === 'completed' && !rawGame.xpDistributed) {
    finalizeCompletedGame(rawGame).catch(() => {});
  }

  return {
    portfolio: port || null,
    hasJoined,
    hasLeft,
    leaderboard,
    game: sanitizeGame(rawGame),
  };
}

// 7. Execute Trade in Game with Strict Start/End & Membership Authorization
export async function executeGameTrade(params: {
  gameId: string;
  userId: string;
  ticker: string;
  type: 'BUY' | 'SELL';
  shares: number;
  orderType?: 'MARKET' | 'LIMIT' | 'STOP';
  price?: number;
  username?: string;
}): Promise<{
  success: boolean;
  message: string;
  portfolio: GamePortfolio;
  leaderboard: GameParticipant[];
}> {
  const { gameId, userId, ticker, type, shares, orderType = 'MARKET', username } = params;
  if (!ticker || shares <= 0) {
    throw new Error('Invalid trade parameters.');
  }

  const rawGame = await getGameById(gameId, { raw: true });
  if (!rawGame) throw new Error('Tournament not found.');

  // Strict Lifecycle Status Enforcement:
  const currentStatus = getComputedGameStatus(rawGame);

  if (currentStatus === 'upcoming') {
    throw new Error(
      `Trading arena is locked. Competition starts at ${formatEasternDateTime(rawGame.startDate)}.`
    );
  }

  if (currentStatus === 'completed') {
    throw new Error(
      `Competition has concluded on ${formatEasternDateTime(rawGame.endDate)}. Trading is disabled and final rankings are frozen.`
    );
  }

  const key = `${rawGame.id}_${userId}`;
  const port = gamesState.gamePortfolios.get(key);
  if (!port) {
    throw new Error('You must join this tournament before executing orders.');
  }

  const cleanTicker = ticker.toUpperCase();
  const stock = REAL_STOCKS_UNIVERSE.find((s) => s.ticker.toUpperCase() === cleanTicker);
  if (!stock) {
    throw new Error(`Asset ${cleanTicker} not found in trading universe.`);
  }

  const currentPrice = Number(params.price ?? stock.current_price);
  const totalCostOrProceeds = Number((shares * currentPrice).toFixed(2));

  if (type === 'BUY') {
    if (port.cashBalance < totalCostOrProceeds) {
      throw new Error(`Insufficient competition cash. Available: $${port.cashBalance.toFixed(2)}, Required: $${totalCostOrProceeds.toFixed(2)}`);
    }

    // Deduct cash strictly within isolated competition portfolio
    port.cashBalance = Number((port.cashBalance - totalCostOrProceeds).toFixed(2));

    // Update holdings
    const existingIndex = port.holdings.findIndex((h) => h.ticker.toUpperCase() === cleanTicker);
    if (existingIndex >= 0) {
      const existing = port.holdings[existingIndex];
      const newTotalShares = existing.shares + shares;
      const newTotalCost = existing.shares * existing.avgCost + totalCostOrProceeds;
      const newAvgCost = Number((newTotalCost / newTotalShares).toFixed(2));

      port.holdings[existingIndex] = {
        ...existing,
        shares: newTotalShares,
        avgCost: newAvgCost,
        currentPrice,
        currentValue: Number((newTotalShares * currentPrice).toFixed(2)),
        unrealizedPnl: Number((newTotalShares * currentPrice - newTotalCost).toFixed(2)),
        returnPct: Number((((newTotalShares * currentPrice - newTotalCost) / newTotalCost) * 100).toFixed(2)),
        allocationPct: 0,
      };
    } else {
      port.holdings.push({
        ticker: cleanTicker,
        name: stock.name,
        shares,
        avgCost: currentPrice,
        currentPrice,
        currentValue: totalCostOrProceeds,
        unrealizedPnl: 0,
        returnPct: 0,
        allocationPct: 0,
      });
    }
  } else {
    // SELL
    const existingIndex = port.holdings.findIndex((h) => h.ticker.toUpperCase() === cleanTicker);
    if (existingIndex < 0 || port.holdings[existingIndex].shares < shares) {
      const availableShares = existingIndex >= 0 ? port.holdings[existingIndex].shares : 0;
      throw new Error(`Insufficient shares to SELL. Holding: ${availableShares}, Attempted: ${shares}`);
    }

    const existing = port.holdings[existingIndex];
    const remainingShares = existing.shares - shares;

    // Add proceeds strictly to isolated competition portfolio
    port.cashBalance = Number((port.cashBalance + totalCostOrProceeds).toFixed(2));

    if (remainingShares === 0) {
      port.holdings.splice(existingIndex, 1);
    } else {
      const totalCost = remainingShares * existing.avgCost;
      const currentValue = Number((remainingShares * currentPrice).toFixed(2));
      const unrealizedPnl = Number((currentValue - totalCost).toFixed(2));
      const returnPct = totalCost > 0 ? Number(((unrealizedPnl / totalCost) * 100).toFixed(2)) : 0;

      port.holdings[existingIndex] = {
        ...existing,
        shares: remainingShares,
        currentPrice,
        currentValue,
        unrealizedPnl,
        returnPct,
      };
    }
  }

  // Add transaction log
  const tx: GameTransaction = {
    id: `gtx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    gameId: rawGame.id,
    ticker: cleanTicker,
    type,
    orderType,
    shares,
    price: currentPrice,
    totalValue: totalCostOrProceeds,
    timestamp: new Date().toISOString(),
  };
  port.transactions = [tx, ...port.transactions];

  // Recalculate totals
  const totalHoldingsValue = port.holdings.reduce((sum, h) => sum + h.currentValue, 0);
  port.totalPortfolioValue = Number((port.cashBalance + totalHoldingsValue).toFixed(2));
  port.pnl = Number((port.totalPortfolioValue - port.startingCapital).toFixed(2));
  port.returnPct = port.startingCapital > 0 ? Number(((port.pnl / port.startingCapital) * 100).toFixed(2)) : 0;

  // Recalculate allocations
  port.holdings = port.holdings.map((h) => ({
    ...h,
    allocationPct: port.totalPortfolioValue > 0 ? Number(((h.currentValue / port.totalPortfolioValue) * 100).toFixed(1)) : 0,
  }));

  // Save in isolated cache
  gamesState.gamePortfolios.set(key, port);

  // Generate updated leaderboard
  const leaderboard = generateGameLeaderboard(rawGame, port, username);
  port.rank = leaderboard.find((p) => p.isCurrentUser)?.rank || 1;
  port.rewardXp = calculateRewardXp(port.rank);

  return {
    success: true,
    message: `${type} order for ${shares} ${cleanTicker} executed at $${currentPrice.toFixed(2)}.`,
    portfolio: port,
    leaderboard,
  };
}
