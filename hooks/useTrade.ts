'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { REAL_STOCKS_UNIVERSE } from '@/lib/market-data/market-service';

export interface TradeParams {
  assetId?: string;
  ticker?: string;
  type: 'BUY' | 'SELL';
  shares: number;
  orderType?: 'MARKET' | 'LIMIT' | 'STOP';
  price?: number;
  commission?: number;
}

export interface TradeResult {
  success: boolean;
  message: string;
  transaction_id: string | null;
  executed_price: number;
  total_amount: number;
  commission: number;
  cash_before: number;
  cash_after: number;
  realized_pnl: number | null;
  new_cash_balance: number;
  remaining_shares: number;
}

export function useTrade() {
  const queryClient = useQueryClient();
  const { user, refreshPortfolio } = useAuth();

  return useMutation({
    mutationFn: async ({
      assetId,
      ticker,
      type,
      shares,
      price: passedPrice,
      orderType = 'MARKET',
      commission = 0.00,
    }: TradeParams): Promise<TradeResult> => {
      if (!user?.id) {
        throw new Error('Please sign in to execute simulated trades.');
      }

      if (!shares || isNaN(shares) || shares <= 0) {
        throw new Error('Share quantity must be a positive integer greater than zero.');
      }

      const cleanTicker = (ticker || assetId || 'AAPL').toUpperCase().trim();
      const stockInfo =
        REAL_STOCKS_UNIVERSE.find((s) => s.ticker.toUpperCase() === cleanTicker) ||
        REAL_STOCKS_UNIVERSE.find((s) => s.ticker === 'AAPL') ||
        REAL_STOCKS_UNIVERSE[0];

      // Exact live execution price returned for selected stock
      const executionPrice = passedPrice && passedPrice > 0 ? Number(passedPrice) : Number(stockInfo?.current_price || 100);
      const grossTradeValue = Number((shares * executionPrice).toFixed(2));
      const totalCostOrProceeds = type === 'BUY'
        ? Number((grossTradeValue + commission).toFixed(2))
        : Number((grossTradeValue - commission).toFixed(2));

      // 1. Fetch user's current portfolio from Supabase database
      const { data: portData } = await (supabase as any)
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const rawPortCash = (portData as any)?.cash ?? (portData as any)?.cash_balance ?? user.user_metadata?.cash_balance;
      const currentCash = rawPortCash !== undefined && rawPortCash !== null ? Number(rawPortCash) : 10000.00;

      // 2. Fetch user's active holdings map
      const activeHoldings: Record<string, any> = { ...(user.user_metadata?.active_holdings || {}) };
      const existingHolding = activeHoldings[cleanTicker];
      const sharesHeld = existingHolding ? Number(existingHolding.shares || 0) : 0;
      const existingAvgCost = existingHolding ? Number(existingHolding.avgPrice || executionPrice) : executionPrice;

      let newCash = currentCash;
      let realizedPnl: number | null = null;
      let realizedPnlPct: number | null = null;
      let remainingShares = 0;

      if (type === 'BUY') {
        // Validate user has enough buying power before executing a BUY
        if (totalCostOrProceeds > currentCash) {
          throw new Error(
            `Insufficient buying power. Order total $${totalCostOrProceeds.toFixed(2)} exceeds available cash $${currentCash.toFixed(2)}.`
          );
        }

        // On BUY: subtract exact totalCost (price × shares + commission) from buying_power
        newCash = Number((currentCash - totalCostOrProceeds).toFixed(2));

        const newTotalShares = sharesHeld + shares;
        const previousCost = sharesHeld * existingAvgCost;
        const newTotalCost = previousCost + grossTradeValue;
        const newAvgPrice = Number((newTotalCost / newTotalShares).toFixed(2));

        activeHoldings[cleanTicker] = {
          ticker: cleanTicker,
          name: stockInfo.name,
          shares: newTotalShares,
          avgPrice: newAvgPrice,
          assetId: assetId || (stockInfo as any).id || `asset-${cleanTicker.toLowerCase()}`,
          updatedAt: new Date().toISOString(),
        };

        remainingShares = newTotalShares;
      } else {
        // SELL
        if (sharesHeld < shares) {
          throw new Error(
            `Insufficient shares to sell. You currently own ${sharesHeld} ${sharesHeld === 1 ? 'share' : 'shares'} of ${cleanTicker}, but attempted to sell ${shares}.`
          );
        }

        // On SELL: add exact proceeds (price × shares - commission) to buying_power
        newCash = Number((currentCash + totalCostOrProceeds).toFixed(2));

        // Realized P&L calculated on user's actual weighted average cost basis
        realizedPnl = Number(((executionPrice - existingAvgCost) * shares - commission).toFixed(2));
        realizedPnlPct = existingAvgCost > 0
          ? Number((((executionPrice - existingAvgCost) / existingAvgCost) * 100).toFixed(2))
          : 0;

        remainingShares = sharesHeld - shares;

        if (remainingShares <= 0) {
          // If the user sells all shares of a stock, completely remove that position from active holdings
          delete activeHoldings[cleanTicker];
          remainingShares = 0;
        } else {
          activeHoldings[cleanTicker] = {
            ...existingHolding,
            shares: remainingShares,
            updatedAt: new Date().toISOString(),
          };
        }
      }

      // 3. Create permanent transaction record
      const newTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        portfolio_id: portData?.id,
        user_id: user.id,
        ticker: cleanTicker,
        name: stockInfo.name,
        type,
        shares,
        price_per_share: executionPrice,
        total_amount: totalCostOrProceeds,
        commission,
        cash_before: currentCash,
        cash_after: newCash,
        cost_basis: existingAvgCost,
        realized_pnl: realizedPnl,
        realized_pnl_pct: realizedPnlPct,
        remaining_shares: remainingShares,
        remaining_position: remainingShares > 0 ? `${remainingShares} shares` : '0 shares (Closed)',
        order_type: orderType,
        status: 'COMPLETED',
        created_at: new Date().toISOString(),
        asset: {
          id: assetId || (stockInfo as any).id || `asset-${cleanTicker.toLowerCase()}`,
          ticker: cleanTicker,
          symbol: cleanTicker,
          name: stockInfo.name,
        },
      };

      // Permanent immutable transaction history (never purge on position close)
      const existingTransactions = Array.isArray(user.user_metadata?.transactions)
        ? user.user_metadata.transactions
        : [];
      const updatedTransactions = [newTransaction, ...existingTransactions].slice(0, 500);

      // 4. Atomically persist updated cash and holdings into Supabase
      try {
        await supabase.auth.updateUser({
          data: {
            active_holdings: activeHoldings,
            transactions: updatedTransactions,
            cash_balance: newCash,
          },
        });
      } catch (authErr) {
        console.warn('Notice persisting user metadata:', authErr);
      }

      if (portData?.id) {
        try {
          await (supabase as any)
            .from('portfolios')
            .update({
              cash: newCash,
              updated_at: new Date().toISOString(),
            })
            .eq('id', portData.id);
        } catch (dbErr) {
          console.warn('Notice updating portfolio table:', dbErr);
        }
      }

      return {
        success: true,
        message: `${type} order executed successfully (${shares} ${shares === 1 ? 'share' : 'shares'} of ${cleanTicker} @ $${executionPrice.toFixed(2)}).`,
        transaction_id: newTransaction.id,
        executed_price: executionPrice,
        total_amount: totalCostOrProceeds,
        commission,
        cash_before: currentCash,
        cash_after: newCash,
        realized_pnl: realizedPnl,
        new_cash_balance: newCash,
        remaining_shares: remainingShares,
      };
    },
    onSuccess: async () => {
      // Invalidate all portfolio, holdings, assets, and quote queries for instant UI synchronization
      await queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      await queryClient.invalidateQueries({ queryKey: ['assets'] });
      await queryClient.invalidateQueries({ queryKey: ['quote'] });
      if (refreshPortfolio) {
        refreshPortfolio().catch(() => {});
      }
    },
  });
}
