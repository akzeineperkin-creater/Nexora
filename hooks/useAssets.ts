'use client';

import { useQuery } from '@tanstack/react-query';
import { Asset } from '@/types/database.types';
import { MarketQuote, HistoricalPricePoint, Timeframe, GetAssetsParams } from '@/lib/market-data/types';

export interface AssetsQueryResult {
  assets: Asset[];
  totalCount: number;
  page: number;
  totalPages: number;
}

// 1. Fetch Market Directory Assets with Region, Category, Search, Sorters, and Pagination
export function useAssets(categoryOrParams?: string | GetAssetsParams, searchArg?: string) {
  const normalizedParams: GetAssetsParams =
    typeof categoryOrParams === 'object' && categoryOrParams !== null
      ? categoryOrParams
      : {
          category: (categoryOrParams as any) || undefined,
          region: (categoryOrParams as any) || undefined,
          search: searchArg || undefined,
        };

  const category = normalizedParams.category;
  const region = normalizedParams.region;
  const search = normalizedParams.search;
  const filter = normalizedParams.filter || normalizedParams.sort;
  const limit = normalizedParams.limit;
  const page = normalizedParams.page || 1;

  const query = useQuery<Asset[]>({
    queryKey: ['assets', category, region, search, filter, limit, page],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (category && category !== 'all') sp.set('category', category);
      if (region && region !== 'all') sp.set('region', region);
      if (search) sp.set('search', search);
      if (filter && filter !== 'all') sp.set('filter', filter);
      if (limit) sp.set('limit', limit.toString());
      if (page) sp.set('page', page.toString());

      const res = await fetch(`/api/market-data/markets?${sp.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch market assets');
      }
      const data = await res.json();
      return data.assets || [];
    },
    refetchInterval: 3000,
  });

  return query;
}

// 2. Global Stock / Company Search (Handles Tickers, Company Names, Exchanges, Countries)
export function useStockSearch(query: string) {
  return useQuery<Asset[]>({
    queryKey: ['stock-search', query?.trim().toLowerCase()],
    queryFn: async () => {
      const q = query.trim();
      const res = await fetch(`/api/market-data/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      return data.results || [];
    },
    enabled: true,
    staleTime: 30000,
  });
}

// 3. Asset Quote Hook (Live Real-Time / Server Cached Quote)
export function useAssetQuote(ticker: string) {
  const cleanTicker = ticker?.toUpperCase().trim();
  return useQuery<MarketQuote | null>({
    queryKey: ['quote', cleanTicker],
    queryFn: async () => {
      if (!cleanTicker) return null;
      const res = await fetch(`/api/market-data/quote?symbol=${encodeURIComponent(cleanTicker)}`);
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      return data.quote || null;
    },
    enabled: !!cleanTicker,
    refetchInterval: 3000,
  });
}

// 4. Asset Detail Hook (Alias for full quote)
export function useAssetDetail(ticker: string) {
  return useAssetQuote(ticker);
}

// 5. Asset Historical Price Points for Charts
export function useAssetHistory(ticker: string, timeframe: Timeframe = '1M') {
  const cleanTicker = ticker?.toUpperCase().trim();
  return useQuery<HistoricalPricePoint[]>({
    queryKey: ['history', cleanTicker, timeframe],
    queryFn: async () => {
      if (!cleanTicker) return [];
      const res = await fetch(
        `/api/market-data/history?symbol=${encodeURIComponent(cleanTicker)}&timeframe=${timeframe}`
      );
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      return data.points || [];
    },
    enabled: !!cleanTicker,
    refetchInterval: timeframe === '1D' ? 4000 : 30000,
  });
}
