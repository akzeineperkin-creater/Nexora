'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Transaction } from '@/types/database.types';
import { calculatePortfolioValuation } from '@/lib/portfolio/valuation';

export function usePortfolio() {
  const { user, portfolio: authPortfolio } = useAuth();
  const portfolioId = authPortfolio?.id;

  return useQuery({
    queryKey: ['portfolio', portfolioId, user?.id],
    queryFn: async () => {
      if (!user?.id && !portfolioId) {
        return null;
      }

      // 1. Fetch live Portfolio record from public.portfolios
      let currentPortfolio = authPortfolio;
      if (user?.id) {
        const { data: pData, error: pErr } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!pErr && pData) {
          currentPortfolio = pData;
        }
      } else if (portfolioId) {
        const { data: pData, error: pErr } = await supabase
          .from('portfolios')
          .select('*')
          .eq('id', portfolioId)
          .maybeSingle();

        if (!pErr && pData) {
          currentPortfolio = pData;
        }
      }

      const activePortfolioId = currentPortfolio?.id;
      // Single Source of Truth for Cash Balance
      const rawCash = user?.user_metadata?.cash_balance ?? (currentPortfolio as any)?.cash ?? (currentPortfolio as any)?.cash_balance;
      const rawStarting = (currentPortfolio as any)?.starting_cash ?? (currentPortfolio as any)?.starting_capital ?? user?.user_metadata?.starting_cash;

      // 2. User active holdings & transactions from metadata
      const userMetaHoldings: Record<string, any> = user?.user_metadata?.active_holdings || {};
      const metaTxs: any[] = user?.user_metadata?.transactions || [];

      // 3. Fetch latest live market quotes for all assets
      let liveAssets: any[] = [];
      try {
        const assetsRes = await fetch('/api/market-data/markets?limit=100');
        if (assetsRes.ok) {
          const json = await assetsRes.json();
          liveAssets = json.assets || [];
        }
      } catch (err) {
        // Fallback to in-memory universe
      }

      // 4. Centralized Portfolio Valuation Engine with Live Prices
      const valuation = calculatePortfolioValuation(rawCash, rawStarting, userMetaHoldings, metaTxs, liveAssets);

      return {
        portfolioId: activePortfolioId || null,
        cashBalance: valuation.cashBalance,
        startingCapital: valuation.startingCapital,
        totalHoldingsValue: valuation.totalHoldingsValue,
        totalPortfolioValue: valuation.totalPortfolioValue,
        totalNetWorth: valuation.totalNetWorth,
        totalPnl: valuation.totalPnl,
        totalReturnPct: valuation.totalReturnPct,
        totalRealizedPnl: valuation.totalRealizedPnl,
        totalUnrealizedPnl: valuation.totalUnrealizedPnl,
        dailyGainDollar: valuation.dailyGainDollar,
        dailyGainPct: valuation.dailyGainPct,
        holdings: valuation.holdings,
        transactions: valuation.transactions as unknown as Transaction[],
      };
    },
    enabled: !!user?.id || !!portfolioId,
    refetchInterval: 3000,
  });
}
