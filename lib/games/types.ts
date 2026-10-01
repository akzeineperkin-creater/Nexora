export type GameStatus = 'active' | 'upcoming' | 'completed';
export type GameVisibility = 'public' | 'private';

export interface TradingGame {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: 'Equities' | 'Tech Titans' | 'Dividends' | 'Global Macro' | 'Custom';
  status: GameStatus;
  visibility: GameVisibility;
  password?: string;
  startingCapital: number;
  participantsCount: number;
  maxParticipants?: number; // undefined or 0 = unlimited
  startDate: string; // ISO string with exact start date & time
  endDate: string; // ISO string with exact end date & time
  startTime?: string; // e.g. "09:00 AM"
  endTime?: string; // e.g. "06:00 PM"
  timezone: string; // "US Eastern Time (EDT/EST)"
  durationDays: number;
  allowLateJoiners: boolean;
  allowJoinAfterStart?: boolean; // alias for backward compatibility
  allowedAssetClasses: ('stocks' | 'etfs' | 'indices')[];
  rules: string[];
  prizePoolDescription: string;
  creatorId?: string;
  creatorName?: string;
  inviteCode?: string;
  xpDistributed?: boolean;
  finalRankingsLocked?: boolean;
  createdAt: string;
}

export interface GameParticipant {
  userId: string;
  username: string;
  avatarUrl?: string;
  rank: number;
  portfolioValue: number;
  startingCapital: number;
  returnPct: number;
  pnl: number;
  totalTrades: number;
  winRate: string;
  isCurrentUser?: boolean;
  rewardXp?: number;
}

export interface GameHolding {
  ticker: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  currentValue: number;
  unrealizedPnl: number;
  returnPct: number;
  allocationPct: number;
}

export interface GameTransaction {
  id: string;
  gameId: string;
  ticker: string;
  type: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'STOP';
  shares: number;
  price: number;
  totalValue: number;
  timestamp: string;
}

export interface GamePortfolio {
  gameId: string;
  userId: string;
  startingCapital: number;
  cashBalance: number;
  totalPortfolioValue: number;
  holdings: GameHolding[];
  transactions: GameTransaction[];
  rank: number;
  returnPct: number;
  pnl: number;
  joinedAt: string;
  rewardXp?: number;
  xpAwarded?: boolean;
}

export interface CreateGamePayload {
  name: string;
  description: string;
  startDate: string; // ISO String or YYYY-MM-DD
  startTime?: string; // "09:00" or "09:00 AM"
  endDate: string; // ISO String or YYYY-MM-DD
  endTime?: string; // "18:00" or "06:00 PM"
  timezone?: string;
  visibility: GameVisibility;
  password?: string;
  startingCapital: number;
  maxPlayers: number;
  allowedAssetClasses: ('stocks' | 'etfs' | 'indices')[];
  duration: string;
  allowLateJoiners: boolean;
  allowJoinAfterStart?: boolean;
}

export interface XpRewardTier {
  rankMin: number;
  rankMax: number;
  xp: number;
  title: string;
}

export const XP_REWARDS: XpRewardTier[] = [
  { rankMin: 1, rankMax: 1, xp: 500, title: '🥇 1st Place Champion' },
  { rankMin: 2, rankMax: 2, xp: 350, title: '🥈 2nd Place Silver' },
  { rankMin: 3, rankMax: 3, xp: 250, title: '🥉 3rd Place Bronze' },
  { rankMin: 4, rankMax: 10, xp: 100, title: '⭐ Top 10 Finisher' },
  { rankMin: 11, rankMax: 999999, xp: 25, title: '🎖️ Tournament Finisher' },
];

export function calculateRewardXp(rank: number): number {
  if (rank <= 0) return 25;
  if (rank === 1) return 500;
  if (rank === 2) return 350;
  if (rank === 3) return 250;
  if (rank <= 10) return 100;
  return 25;
}
