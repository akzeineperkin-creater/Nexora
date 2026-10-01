'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { usePortfolio } from '@/hooks/usePortfolio';

export interface LeaderboardUser {
  rank: number;
  userId: string;
  name: string;
  avatarUrl?: string | null;
  portfolioValue: number;
  startingCapital: number;
  returnPct: number;
  pnl: number;
  trades: number;
  winRate: string;
  isCurrentUser: boolean;
}

export function useLeaderboard() {
  const { user, profile } = useAuth();
  const { data: myPortfolio } = usePortfolio();

  return useQuery({
    queryKey: ['global-leaderboard', user?.id, myPortfolio?.totalPortfolioValue],
    queryFn: async (): Promise<LeaderboardUser[]> => {
      let dbProfiles: any[] = [];
      let dbPortfolios: any[] = [];

      // 1. Fetch from Supabase client directly
      try {
        const { data: profs } = await (supabase as any)
          .from('profiles')
          .select('id, username, full_name, avatar_url, level, xp, created_at');
        if (profs && Array.isArray(profs)) {
          dbProfiles = profs;
        }
      } catch (e) {
        console.warn('Leaderboard profiles fetch notice:', e);
      }

      try {
        const { data: ports } = await (supabase as any)
          .from('portfolios')
          .select('id, user_id, cash, starting_cash, created_at');
        if (ports && Array.isArray(ports)) {
          dbPortfolios = ports;
        }
      } catch (e) {
        console.warn('Leaderboard portfolios fetch notice:', e);
      }

      // If client-side direct query was empty due to RLS, fetch via /api/leaderboard
      if (dbProfiles.length === 0) {
        try {
          const res = await fetch('/api/leaderboard');
          if (res.ok) {
            const json = await res.json();
            if (json.leaderboard && Array.isArray(json.leaderboard)) {
              return json.leaderboard.map((u: any) => {
                const isYou = user?.id ? u.userId === user.id : false;
                if (isYou && myPortfolio) {
                  return {
                    rank: u.rank,
                    userId: u.userId,
                    name: profile?.nickname || profile?.username || u.username,
                    avatarUrl: profile?.avatar_url || u.avatarUrl,
                    portfolioValue: myPortfolio.totalPortfolioValue,
                    startingCapital: myPortfolio.startingCapital,
                    returnPct: myPortfolio.totalReturnPct,
                    pnl: myPortfolio.totalPnl,
                    trades: myPortfolio.transactions.length,
                    winRate: myPortfolio.transactions.length > 0 ? '100%' : '—',
                    isCurrentUser: true,
                  };
                }
                return {
                  rank: u.rank,
                  userId: u.userId,
                  name: u.username,
                  avatarUrl: u.avatarUrl,
                  portfolioValue: Number(u.portfolioValue),
                  startingCapital: Number(u.startingCapital),
                  returnPct: Number(u.returnPct),
                  pnl: Number(u.pnl),
                  trades: Number(u.trades || 0),
                  winRate: u.winRate || '—',
                  isCurrentUser: isYou,
                };
              });
            }
          }
        } catch (apiErr) {
          console.warn('API leaderboard fetch error:', apiErr);
        }
      }

      // Build map of portfolios
      const portfolioMap = new Map<string, { cash: number; starting_cash: number }>();
      dbPortfolios.forEach((p: any) => {
        if (p.user_id) {
          portfolioMap.set(p.user_id, {
            cash: Number(p.cash ?? 10000),
            starting_cash: Number(p.starting_cash ?? 10000),
          });
        }
      });

      // Assemble all users
      const usersList: LeaderboardUser[] = dbProfiles.map((prof: any) => {
        const isCurrent = user?.id === prof.id;
        const port = portfolioMap.get(prof.id) || { cash: 10000, starting_cash: 10000 };

        // For current logged in user, use the centralized Live Valuation (Total Net Worth)
        const curValue = isCurrent && myPortfolio ? myPortfolio.totalPortfolioValue : port.cash;
        const startCap = isCurrent && myPortfolio ? myPortfolio.startingCapital : port.starting_cash;
        const pnl = isCurrent && myPortfolio ? myPortfolio.totalPnl : (curValue - startCap);
        const retPct = isCurrent && myPortfolio ? myPortfolio.totalReturnPct : (startCap > 0 ? ((pnl / startCap) * 100) : 0);
        const tradesCount = isCurrent && myPortfolio ? myPortfolio.transactions.length : 0;

        const displayName = isCurrent
          ? (profile?.nickname || profile?.username || prof.username || prof.full_name || 'Trader (You)')
          : (prof.username || prof.full_name || `Trader_${prof.id?.slice(0, 5)}`);

        return {
          rank: 0,
          userId: prof.id,
          name: displayName,
          avatarUrl: prof.avatar_url,
          portfolioValue: Number(curValue),
          startingCapital: Number(startCap),
          returnPct: Number(Number(retPct).toFixed(2)),
          pnl: Number(Number(pnl).toFixed(2)),
          trades: tradesCount,
          winRate: isCurrent && myPortfolio && myPortfolio.transactions.length > 0 ? '100%' : '—',
          isCurrentUser: isCurrent,
        };
      });

      // If current user is logged in but not in the database profiles list yet, append them
      if (user && !usersList.some((u) => u.userId === user.id)) {
        const myName = profile?.nickname || profile?.username || user.email?.split('@')[0] || 'Trader (You)';
        const myVal = myPortfolio ? myPortfolio.totalPortfolioValue : 10000;
        const myStart = myPortfolio ? myPortfolio.startingCapital : 10000;
        const myPnl = myPortfolio ? myPortfolio.totalPnl : 0;
        const myRet = myPortfolio ? myPortfolio.totalReturnPct : 0;

        usersList.push({
          rank: 1,
          userId: user.id,
          name: myName,
          avatarUrl: profile?.avatar_url,
          portfolioValue: myVal,
          startingCapital: myStart,
          returnPct: myRet,
          pnl: myPnl,
          trades: myPortfolio?.transactions.length ?? 0,
          winRate: myPortfolio && myPortfolio.transactions.length > 0 ? '100%' : '—',
          isCurrentUser: true,
        });
      }

      // Sort strictly by Return % descending
      usersList.sort((a, b) => b.returnPct - a.returnPct);

      // Re-assign ranks 1..N
      return usersList.map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));
    },
    refetchInterval: 5000,
  });
}
