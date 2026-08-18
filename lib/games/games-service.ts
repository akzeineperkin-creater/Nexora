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

// Map a Supabase challenges database row to the TradingGame frontend model
export function mapChallengeToGame(row: any, participantsCount: number = 0): TradingGame {
  const startDate = row.start_date || new Date().toISOString();
  const endDate = row.end_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).getTime();
  const durationDays = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)));

  const computedStatus = getComputedGameStatus({ startDate, endDate, status: row.status });

  return {
    id: row.id,
    slug: row.id,
    title: row.name || row.title || 'Trading Tournament',
    description: row.description || 'Simulated equity trading tournament on Nexra.',
    category: 'Equities',
    status: computedStatus,
    visibility: 'public',
    startingCapital: Number(row.starting_capital) || 25000,
    participantsCount: participantsCount,
    startDate,
    endDate,
    startTime: formatEasternDateTime(startDate).split(' at ')[1] || '09:00 AM EDT',
    endTime: formatEasternDateTime(endDate).split(' at ')[1] || '06:00 PM EDT',
    timezone: 'US Eastern Time (EDT/EST)',
    durationDays,
    allowLateJoiners: true,
    allowJoinAfterStart: true,
    allowedAssetClasses: ['stocks', 'etfs', 'indices'],
    rules: [
      `Starting virtual balance: $${(Number(row.starting_capital) || 25000).toLocaleString()}.00 (completely isolated).`,
      'All trades execute against real-time market prices.',
      'Rankings determined strictly by Net Portfolio Return percentage.',
      `Scheduled start: ${formatEasternDateTime(startDate)}.`,
      `Scheduled finish: ${formatEasternDateTime(endDate)}.`,
    ],
    prizePoolDescription: '1st: +500 XP | 2nd: +350 XP | 3rd: +250 XP | Top 10: +100 XP | Finishers: +25 XP',
    xpDistributed: computedStatus === 'completed',
    finalRankingsLocked: computedStatus === 'completed',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

// In-memory active trade sessions cache (isolated from main cash)
const globalForGames = globalThis as unknown as {
  __nexraGamesPortfolios__?: Map<string, GamePortfolio>; // key: `${gameId}_${userId}`
};

if (!globalForGames.__nexraGamesPortfolios__) {
  globalForGames.__nexraGamesPortfolios__ = new Map();
}

const gamePortfoliosCache = globalForGames.__nexraGamesPortfolios__;

export function sanitizeGame<T extends TradingGame | null | undefined>(game: T): T {
  if (!game) return game;
  const clone = { ...game };
  delete clone.password;
  clone.status = getComputedGameStatus(clone);
  return clone;
}

// 1. Get All Competitions directly from Supabase challenges table
export async function getGames(status?: 'active' | 'upcoming' | 'completed'): Promise<TradingGame[]> {
  try {
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[games-service getGames] Supabase query error:', error.message);
      return [];
    }

    if (!challenges || challenges.length === 0) {
      return [];
    }

    // Fetch participant counts for these challenges
    const challengeIds = (challenges as any[]).map((c: any) => c.id);
    const { data: participantRows } = await (supabase as any)
      .from('challenge_participants')
      .select('challenge_id')
      .in('challenge_id', challengeIds);

    const countsMap = new Map<string, number>();
    if (participantRows) {
      participantRows.forEach((p: any) => {
        countsMap.set(p.challenge_id, (countsMap.get(p.challenge_id) || 0) + 1);
      });
    }

    let list = (challenges as any[]).map((row: any) => {
      const pCount = countsMap.get(row.id) || 0;
      return mapChallengeToGame(row, pCount);
    });

    if (status) {
      list = list.filter((g) => g.status === status);
    }

    return list.map((g) => sanitizeGame(g));
  } catch (err: any) {
    console.error('[games-service getGames] error:', err.message);
    return [];
  }
}

// 2. Get Single Competition by ID directly from Supabase
export async function getGameById(idOrSlug: string, options?: { raw?: boolean }): Promise<TradingGame | null> {
  const clean = decodeURIComponent(idOrSlug || '').trim();
  if (!clean) return null;

  try {
    let query = (supabase as any).from('challenges').select('*');
    
    // Check if clean is UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);
    if (isUuid) {
      query = query.eq('id', clean);
    } else {
      query = query.eq('name', clean);
    }

    const { data: row, error } = await query.maybeSingle();

    if (error || !row) {
      return null;
    }

    // Count participants
    const { count } = await (supabase as any)
      .from('challenge_participants')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_id', row.id);

    const game = mapChallengeToGame(row, count || 0);
    return options?.raw ? game : sanitizeGame(game);
  } catch (err: any) {
    console.error('[games-service getGameById] error:', err.message);
    return null;
  }
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

// 3. Create a New Competition directly in Supabase challenges table
export async function createGame(payload: CreateGamePayload, creatorId?: string, creatorName?: string): Promise<TradingGame> {
  const startDateISO = parseEasternDateTime(payload.startDate, payload.startTime);
  const endDateISO = parseEasternDateTime(payload.endDate, payload.endTime);
  const initialStatus = getComputedGameStatus({ startDate: startDateISO, endDate: endDateISO });
  const startingCapital = Number(payload.startingCapital) || 25000;

  const insertPayload = {
    name: payload.name.trim(),
    description: payload.description ? payload.description.trim() : 'Simulated equity trading tournament on Nexra.',
    starting_capital: startingCapital,
    start_date: startDateISO,
    end_date: endDateISO,
    status: initialStatus.toUpperCase(),
  };

  const { data: inserted, error } = await (supabase as any)
    .from('challenges')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error || !inserted) {
    console.error('[games-service createGame] Supabase insert error:', error);
    throw new Error(error?.message || 'Failed to insert competition into Supabase database.');
  }

  const createdGame = mapChallengeToGame(inserted, creatorId ? 1 : 0);

  // If creator provided, automatically join creator in challenge_participants
  if (creatorId) {
    try {
      await (supabase as any).from('challenge_participants').insert({
        challenge_id: inserted.id,
        user_id: creatorId,
        rank: 1,
        pnl: 0,
        starting_capital: startingCapital,
        current_value: startingCapital,
      });
    } catch (joinErr) {
      console.warn('Creator join notice:', joinErr);
    }

    const creatorKey = `${createdGame.id}_${creatorId}`;
    const creatorPort: GamePortfolio = {
      gameId: createdGame.id,
      userId: creatorId,
      startingCapital: startingCapital,
      cashBalance: startingCapital,
      totalPortfolioValue: startingCapital,
      holdings: [],
      transactions: [],
      rank: 1,
      returnPct: 0.0,
      pnl: 0.0,
      joinedAt: new Date().toISOString(),
    };
    gamePortfoliosCache.set(creatorKey, creatorPort);
  }

  return createdGame;
}

// 4. Join Competition with Supabase persistence
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
  const { gameIdOrSlug, userId, username } = payload;
  const rawGame = await getGameById(gameIdOrSlug, { raw: true });
  if (!rawGame) throw new Error('Tournament not found.');

  const currentStatus = getComputedGameStatus(rawGame);

  if (currentStatus === 'completed') {
    throw new Error('This tournament has concluded. New participants cannot join.');
  }

  // Check if already registered in challenge_participants
  const { data: existingParticipant } = await (supabase as any)
    .from('challenge_participants')
    .select('*')
    .eq('challenge_id', rawGame.id)
    .eq('user_id', userId)
    .maybeSingle();

  const key = `${rawGame.id}_${userId}`;
  if (existingParticipant || gamePortfoliosCache.has(key)) {
    throw new Error('You are already registered in this tournament.');
  }

  // Persist participant into challenge_participants
  try {
    await (supabase as any).from('challenge_participants').insert({
      challenge_id: rawGame.id,
      user_id: userId,
      rank: (rawGame.participantsCount || 0) + 1,
      pnl: 0,
      starting_capital: rawGame.startingCapital,
      current_value: rawGame.startingCapital,
    });
  } catch (cpErr) {
    console.warn('Notice saving challenge participant:', cpErr);
  }

  // Initialize isolated competition portfolio
  const port: GamePortfolio = {
    gameId: rawGame.id,
    userId,
    startingCapital: rawGame.startingCapital,
    cashBalance: rawGame.startingCapital,
    totalPortfolioValue: rawGame.startingCapital,
    holdings: [],
    transactions: [],
    rank: (rawGame.participantsCount || 0) + 1,
    returnPct: 0.0,
    pnl: 0.0,
    joinedAt: new Date().toISOString(),
  };

  gamePortfoliosCache.set(key, port);
  rawGame.participantsCount = (rawGame.participantsCount || 0) + 1;

  return {
    success: true,
    message: `Successfully joined ${rawGame.title}! Your isolated starting capital of $${rawGame.startingCapital.toLocaleString()} is ready.`,
    portfolio: port,
    game: sanitizeGame(rawGame),
  };
}

// 5. Leave Competition
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
  gamePortfoliosCache.delete(key);

  try {
    await (supabase as any)
      .from('challenge_participants')
      .delete()
      .eq('challenge_id', rawGame.id)
      .eq('user_id', userId);
  } catch (delErr) {
    console.warn('Notice deleting challenge participant:', delErr);
  }

  rawGame.participantsCount = Math.max(0, (rawGame.participantsCount || 1) - 1);

  return {
    success: true,
    message: `You have left ${rawGame.title}. Your competition portfolio has been closed. Your main Nexra cash remains untouched.`,
    game: sanitizeGame(rawGame),
  };
}

// 6. Get User's Competition Portfolio & Real Leaderboard Rankings
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

  // Check if participant is in challenge_participants
  const { data: dbParticipant } = await (supabase as any)
    .from('challenge_participants')
    .select('*')
    .eq('challenge_id', rawGame.id)
    .eq('user_id', userId)
    .maybeSingle();

  const key = `${rawGame.id}_${userId}`;
  let port = gamePortfoliosCache.get(key);

  if (!port && dbParticipant) {
    port = {
      gameId: rawGame.id,
      userId,
      startingCapital: Number(dbParticipant.starting_capital) || rawGame.startingCapital,
      cashBalance: Number(dbParticipant.current_value) || rawGame.startingCapital,
      totalPortfolioValue: Number(dbParticipant.current_value) || rawGame.startingCapital,
      holdings: [],
      transactions: [],
      rank: dbParticipant.rank || 1,
      returnPct: Number(dbParticipant.starting_capital) > 0
        ? Number((((Number(dbParticipant.current_value) - Number(dbParticipant.starting_capital)) / Number(dbParticipant.starting_capital)) * 100).toFixed(2))
        : 0,
      pnl: Number(dbParticipant.pnl) || 0,
      joinedAt: dbParticipant.joined_at || new Date().toISOString(),
    };
    gamePortfoliosCache.set(key, port);
  }

  const hasJoined = Boolean(port || dbParticipant);

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

  // Fetch real participants from Supabase challenge_participants table
  const { data: allDbParticipants } = await (supabase as any)
    .from('challenge_participants')
    .select('id, user_id, rank, pnl, starting_capital, current_value, joined_at')
    .eq('challenge_id', rawGame.id);

  // Fetch usernames for these real users from profiles
  const participantUserIds = (allDbParticipants || []).map((p: any) => p.user_id);
  const profilesMap = new Map<string, { username: string; avatarUrl?: string }>();
  if (participantUserIds.length > 0) {
    const { data: userProfiles } = await (supabase as any)
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', participantUserIds);

    if (userProfiles) {
      userProfiles.forEach((prof: any) => {
        profilesMap.set(prof.id, {
          username: prof.username || 'Trader',
          avatarUrl: prof.avatar_url,
        });
      });
    }
  }

  let leaderboardList: GameParticipant[] = [];

  if (allDbParticipants && allDbParticipants.length > 0) {
    leaderboardList = allDbParticipants.map((p: any) => {
      const isCurrent = p.user_id === userId;
      const prof = profilesMap.get(p.user_id);
      const startCap = Number(p.starting_capital) || rawGame.startingCapital;
      const curVal = isCurrent && port ? port.totalPortfolioValue : (Number(p.current_value) || startCap);
      const curPnl = isCurrent && port ? port.pnl : (Number(p.pnl) || (curVal - startCap));
      const curReturn = startCap > 0 ? Number(((curPnl / startCap) * 100).toFixed(2)) : 0;

      return {
        userId: p.user_id,
        username: isCurrent ? (username || prof?.username || 'Trader (You)') : (prof?.username || `Trader_${p.user_id.slice(0, 5)}`),
        avatarUrl: prof?.avatarUrl,
        rank: 0,
        startingCapital: startCap,
        portfolioValue: curVal,
        returnPct: curReturn,
        pnl: curPnl,
        totalTrades: isCurrent && port ? port.transactions.length : 0,
        winRate: isCurrent && port && port.transactions.length > 0 ? '66.7%' : '—',
        isCurrentUser: isCurrent,
      };
    });
  } else if (port) {
    // Only current user registered
    leaderboardList = [
      {
        userId: port.userId,
        username: username || 'Trader (You)',
        rank: 1,
        startingCapital: port.startingCapital,
        portfolioValue: port.totalPortfolioValue,
        returnPct: port.returnPct,
        pnl: port.pnl,
        totalTrades: port.transactions.length,
        winRate: port.transactions.length > 0 ? '66.7%' : '—',
        isCurrentUser: true,
      },
    ];
  }

  // Recalculate leaderboard standings ordered strictly by Net Return % descending
  leaderboardList.sort((a, b) => b.returnPct - a.returnPct);
  leaderboardList = leaderboardList.map((item, idx) => {
    const rank = idx + 1;
    return {
      ...item,
      rank,
      rewardXp: calculateRewardXp(rank),
    };
  });

  if (port) {
    const myRank = leaderboardList.find((p) => p.isCurrentUser)?.rank || 1;
    port.rank = myRank;
    port.rewardXp = calculateRewardXp(myRank);
  }

  return {
    portfolio: port || null,
    hasJoined,
    hasLeft: false,
    leaderboard: leaderboardList,
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
  const { gameId, userId, ticker, type, shares, orderType = 'MARKET' } = params;
  if (!ticker || shares <= 0) {
    throw new Error('Invalid trade parameters.');
  }

  const rawGame = await getGameById(gameId, { raw: true });
  if (!rawGame) throw new Error('Tournament not found.');

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
  const port = gamePortfoliosCache.get(key);
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

    port.cashBalance = Number((port.cashBalance - totalCostOrProceeds).toFixed(2));

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

  const totalHoldingsValue = port.holdings.reduce((sum, h) => sum + h.currentValue, 0);
  port.totalPortfolioValue = Number((port.cashBalance + totalHoldingsValue).toFixed(2));
  port.pnl = Number((port.totalPortfolioValue - port.startingCapital).toFixed(2));
  port.returnPct = port.startingCapital > 0 ? Number(((port.pnl / port.startingCapital) * 100).toFixed(2)) : 0;

  port.holdings = port.holdings.map((h) => ({
    ...h,
    allocationPct: port.totalPortfolioValue > 0 ? Number(((h.currentValue / port.totalPortfolioValue) * 100).toFixed(1)) : 0,
  }));

  gamePortfoliosCache.set(key, port);

  // Sync to challenge_participants table in Supabase
  try {
    await (supabase as any)
      .from('challenge_participants')
      .update({
        current_value: port.totalPortfolioValue,
        pnl: port.pnl,
      })
      .eq('challenge_id', rawGame.id)
      .eq('user_id', userId);
  } catch (syncErr) {
    console.warn('Notice syncing challenge participant trade:', syncErr);
  }

  const { leaderboard } = await getGamePortfolio(rawGame.id, userId, params.username);

  return {
    success: true,
    message: `${type} order for ${shares} ${cleanTicker} executed at $${currentPrice.toFixed(2)}.`,
    portfolio: port,
    leaderboard,
  };
}
