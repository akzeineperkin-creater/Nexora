'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { WatchlistItem, Asset } from '@/types/database.types';
import { REAL_STOCKS_UNIVERSE } from '@/lib/market-data/market-service';

export function useWatchlist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  const query = useQuery({
    queryKey: ['watchlist', userId],
    queryFn: async () => {
      if (!userId) return [] as WatchlistItem[];

      // 1. Read watchlisted tickers from user metadata in Supabase Auth
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user || user;
      const metaTickers: string[] = (currentUser?.user_metadata?.watchlist as string[]) || [];

      // 2. Also query public.watchlists as secondary source
      const { data: dbRows } = await supabase
        .from('watchlists')
        .select('id, user_id, asset_id, created_at, asset:assets(*)')
        .eq('user_id', userId);

      const dbTickers: string[] = [];
      ((dbRows as unknown as any[]) || []).forEach((row) => {
        const sym = (row.asset?.symbol || row.asset?.ticker || '').toUpperCase();
        if (sym && sym !== 'TEST') {
          dbTickers.push(sym);
        }
      });

      // Combine unique tickers (preserving user_metadata list)
      const combinedTickers = Array.from(
        new Set([
          ...metaTickers.map((t) => t.toUpperCase().trim()),
          ...dbTickers.map((t) => t.toUpperCase().trim()),
        ])
      ).filter(Boolean);

      // 3. Fetch latest live market assets
      let liveAssets: Asset[] = [];
      try {
        const assetsRes = await fetch('/api/market-data/markets?limit=100');
        if (assetsRes.ok) {
          const json = await assetsRes.json();
          liveAssets = json.assets || [];
        }
      } catch (err) {
        // fallback
      }

      // 4. Map each ticker to full live Asset record
      const items: WatchlistItem[] = combinedTickers.map((ticker) => {
        const liveAsset = liveAssets.find((a) => a.ticker?.toUpperCase() === ticker.toUpperCase());
        const stockInfo =
          REAL_STOCKS_UNIVERSE.find((s) => s.ticker.toUpperCase() === ticker) || {
            ticker: ticker,
            name: `${ticker} Equity`,
            type: 'Stock',
            category: 'stocks',
            sector: 'Technology',
            current_price: 150.0,
            day_change: 0.0,
            day_change_pct: 0.0,
            volume_24h: '1.2M',
            market_cap: '$50B',
            pe_ratio: 25.0,
            high_52w: 180.0,
            low_52w: 120.0,
            beta: 1.1,
            eps: 4.5,
            description: `${ticker} is an equity instrument.`,
            ai_summary: 'Market trends and volume indicates stable trading volume.',
            ai_sentiment: 'Bullish' as const,
            color: '#10B981',
          };

        const resolvedAsset: Asset = {
          id: liveAsset?.id || `asset-${ticker.toLowerCase()}`,
          ticker: liveAsset?.ticker || stockInfo.ticker,
          name: liveAsset?.name || stockInfo.name,
          type: (liveAsset?.type || stockInfo.type) as any,
          category: (liveAsset?.category || stockInfo.category) as any,
          sector: liveAsset?.sector || stockInfo.sector,
          current_price: liveAsset?.current_price ?? stockInfo.current_price,
          day_change: liveAsset?.day_change ?? stockInfo.day_change,
          day_change_pct: liveAsset?.day_change_pct ?? stockInfo.day_change_pct,
          volume_24h: liveAsset?.volume_24h || stockInfo.volume_24h,
          market_cap: liveAsset?.market_cap || stockInfo.market_cap,
          pe_ratio: liveAsset?.pe_ratio ?? stockInfo.pe_ratio,
          high_52w: liveAsset?.high_52w ?? stockInfo.high_52w,
          low_52w: liveAsset?.low_52w ?? stockInfo.low_52w,
          beta: liveAsset?.beta ?? stockInfo.beta,
          eps: liveAsset?.eps ?? stockInfo.eps,
          description: liveAsset?.description || stockInfo.description,
          ai_summary: liveAsset?.ai_summary || stockInfo.ai_summary,
          ai_sentiment: (liveAsset?.ai_sentiment || stockInfo.ai_sentiment) as any,
          color: liveAsset?.color || stockInfo.color,
          updated_at: new Date().toISOString(),
        };

        return {
          id: `wl-${userId}-${ticker}`,
          user_id: userId,
          asset_id: resolvedAsset.id,
          created_at: new Date().toISOString(),
          asset: resolvedAsset,
        };
      });

      return items;
    },
    enabled: !!userId,
    refetchInterval: 3000,
  });

  const toggleMutation = useMutation({
    mutationFn: async (args: string | { assetId?: string; ticker?: string; isSaved?: boolean }) => {
      if (!userId) {
        throw new Error('Please sign in to add instruments to your Watchlist.');
      }

      const inputTicker = (typeof args === 'string' ? args : (args.ticker || args.assetId || '')).toUpperCase().trim();

      const targetStock = REAL_STOCKS_UNIVERSE.find(
        (s) => s.ticker.toUpperCase() === inputTicker || `asset-${s.ticker.toLowerCase()}` === inputTicker.toLowerCase()
      ) || (inputTicker ? { ticker: inputTicker, name: inputTicker } : null);

      if (!targetStock || !targetStock.ticker) {
        throw new Error('Unable to resolve instrument to add to watchlist.');
      }

      const cleanTicker = targetStock.ticker.toUpperCase();

      // 1. Fetch current list of watched tickers from user_metadata
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user || user;
      const currentTickers: string[] = ((currentUser?.user_metadata?.watchlist as string[]) || []).map((t) =>
        t.toUpperCase().trim()
      );

      const exists = currentTickers.includes(cleanTicker);
      let updatedTickers: string[];

      if (exists) {
        // Remove from list
        updatedTickers = currentTickers.filter((t) => t !== cleanTicker);
      } else {
        // Add to list
        updatedTickers = [...currentTickers, cleanTicker];
      }

      // 2. Persist updated watchlist array in Supabase Auth user_metadata
      const { error: updateErr } = await supabase.auth.updateUser({
        data: {
          watchlist: updatedTickers,
        },
      });

      if (updateErr) {
        console.error('[useWatchlist] Error updating user metadata:', updateErr.message);
        throw new Error(`Failed to update watchlist: ${updateErr.message}`);
      }

      // 3. Background sync to public.watchlists table if available
      try {
        if (exists) {
          await (supabase as any)
            .from('watchlists')
            .delete()
            .eq('user_id', userId);
        } else {
          const { data: dbAsset } = await (supabase as any)
            .from('assets')
            .select('id')
            .limit(1)
            .maybeSingle();

          if (dbAsset?.id) {
            await (supabase as any)
              .from('watchlists')
              .upsert(
                {
                  user_id: userId,
                  asset_id: dbAsset.id,
                },
                { onConflict: 'user_id,asset_id' }
              );
          }
        }
      } catch (dbErr) {
        // Supabase table sync is non-blocking since user_metadata is the primary source
      }

      return updatedTickers;
    },
    onMutate: async (args) => {
      // Optimistic UI Update
      await queryClient.cancelQueries({ queryKey: ['watchlist', userId] });
      const previousWatchlist = queryClient.getQueryData<WatchlistItem[]>(['watchlist', userId]) || [];

      const inputTicker = (typeof args === 'string' ? args : (args.ticker || args.assetId || '')).toUpperCase().trim();
      const cleanTicker = inputTicker.replace(/^ASSET-/, '');

      const isCurrentlyWatched = previousWatchlist.some(
        (w) => w.asset?.ticker?.toUpperCase() === cleanTicker || w.asset_id === `asset-${cleanTicker.toLowerCase()}`
      );

      let newWatchlist: WatchlistItem[];
      if (isCurrentlyWatched) {
        newWatchlist = previousWatchlist.filter(
          (w) => w.asset?.ticker?.toUpperCase() !== cleanTicker && w.asset_id !== `asset-${cleanTicker.toLowerCase()}`
        );
      } else {
        const stockInfo = REAL_STOCKS_UNIVERSE.find((s) => s.ticker.toUpperCase() === cleanTicker) || {
          ticker: cleanTicker,
          name: cleanTicker,
          type: 'Stock',
          category: 'stocks',
          sector: 'Technology',
          current_price: 150,
          day_change: 0,
          day_change_pct: 0,
          volume_24h: '1.0M',
          market_cap: '$10B',
          pe_ratio: null,
          high_52w: 200,
          low_52w: 100,
          beta: 1.0,
          eps: null,
          description: '',
          ai_summary: '',
          ai_sentiment: 'Bullish' as const,
          color: '#10B981',
        };

        const newItem: WatchlistItem = {
          id: `wl-${userId}-${cleanTicker}`,
          user_id: userId || '',
          asset_id: `asset-${cleanTicker.toLowerCase()}`,
          created_at: new Date().toISOString(),
          asset: {
            id: `asset-${cleanTicker.toLowerCase()}`,
            ticker: stockInfo.ticker,
            name: stockInfo.name,
            type: stockInfo.type as any,
            category: stockInfo.category as any,
            sector: stockInfo.sector,
            current_price: stockInfo.current_price,
            day_change: stockInfo.day_change,
            day_change_pct: stockInfo.day_change_pct,
            volume_24h: stockInfo.volume_24h,
            market_cap: stockInfo.market_cap,
            pe_ratio: stockInfo.pe_ratio,
            high_52w: stockInfo.high_52w,
            low_52w: stockInfo.low_52w,
            beta: stockInfo.beta,
            eps: stockInfo.eps,
            description: stockInfo.description,
            ai_summary: stockInfo.ai_summary,
            ai_sentiment: stockInfo.ai_sentiment as any,
            color: stockInfo.color,
            updated_at: new Date().toISOString(),
          },
        };
        newWatchlist = [newItem, ...previousWatchlist];
      }

      queryClient.setQueryData(['watchlist', userId], newWatchlist);
      return { previousWatchlist };
    },
    onError: (_err, _newArgs, context) => {
      if (context?.previousWatchlist) {
        queryClient.setQueryData(['watchlist', userId], context.previousWatchlist);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const isWatched = (tickerOrId?: string): boolean => {
    if (!tickerOrId || !query.data) return false;
    const clean = tickerOrId.toUpperCase().trim().replace(/^ASSET-/, '');
    return query.data.some(
      (item) =>
        item.asset?.ticker?.toUpperCase() === clean ||
        (item.asset as any)?.symbol?.toUpperCase() === clean ||
        item.asset_id === tickerOrId ||
        item.asset_id === `asset-${clean.toLowerCase()}`
    );
  };

  return {
    ...query,
    toggleWatchlist: toggleMutation.mutate,
    toggleWatchlistAsync: toggleMutation.mutateAsync,
    isWatched,
    isToggling: toggleMutation.isPending,
  };
}
