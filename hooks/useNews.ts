'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NewsArticle } from '@/types/database.types';

export interface MarketMoverItem {
  ticker: string;
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  count: number;
}

interface UseNewsParams {
  category?: string;
  search?: string;
  ticker?: string;
  limit?: number;
  page?: number;
}

interface NewsApiResponse {
  articles: NewsArticle[];
  totalCount: number;
  page: number;
  totalPages: number;
  marketMovers?: MarketMoverItem[];
  lastSyncAt: string;
  isRateLimited?: boolean;
}

export function useNews(params?: UseNewsParams) {
  const queryClient = useQueryClient();
  const category = params?.category || 'all';
  const search = params?.search || '';
  const ticker = params?.ticker || '';
  const [currentPage, setCurrentPage] = useState<number>(params?.page || 1);

  // Local state for accumulated articles (supporting "Load More")
  const [accumulatedArticles, setAccumulatedArticles] = useState<NewsArticle[]>([]);
  const [unseenArticles, setUnseenArticles] = useState<NewsArticle[]>([]);
  const lastParamsRef = useRef<string>('');

  const query = useQuery<NewsApiResponse>({
    queryKey: ['news', category, search, ticker, currentPage],
    queryFn: async () => {
      const url = new URL('/api/news', window.location.origin);
      if (category && category !== 'all') url.searchParams.set('category', category);
      if (search) url.searchParams.set('search', search);
      if (ticker) url.searchParams.set('ticker', ticker);
      url.searchParams.set('page', currentPage.toString());
      url.searchParams.set('limit', (params?.limit || 20).toString());

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch news feed.');
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });

  // Reset pagination when category, search, or ticker changes
  const currentParamsKey = `${category}_${search}_${ticker}`;
  useEffect(() => {
    if (lastParamsRef.current !== currentParamsKey) {
      lastParamsRef.current = currentParamsKey;
      setCurrentPage(1);
      setAccumulatedArticles([]);
    }
  }, [currentParamsKey]);

  // Handle incoming data & accumulation
  useEffect(() => {
    if (!query.data?.articles) return;
    const incoming = query.data.articles;

    if (currentPage === 1) {
      setAccumulatedArticles(incoming);
    } else {
      setAccumulatedArticles((prev) => {
        const seenIds = new Set(prev.map((a) => a.id));
        const newUnique = incoming.filter((a) => !seenIds.has(a.id));
        return [...prev, ...newUnique];
      });
    }
  }, [query.data?.articles, currentPage]);

  const loadMore = useCallback(() => {
    if (query.data && currentPage < query.data.totalPages && !query.isFetching) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [query.data, currentPage, query.isFetching]);

  const showNewStories = useCallback(() => {
    if (unseenArticles.length === 0) return;
    setAccumulatedArticles((prev) => [...unseenArticles, ...prev]);
    setUnseenArticles([]);
  }, [unseenArticles]);

  // Manual refresh mutation
  const refreshMutation = useMutation({
    mutationFn: async (symbol?: string) => {
      const res = await fetch('/api/news/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, force: true }),
      });
      if (!res.ok) throw new Error('Manual sync failed.');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });

  return {
    articles: accumulatedArticles,
    allArticles: query.data?.articles || [],
    totalCount: query.data?.totalCount || accumulatedArticles.length,
    currentPage,
    totalPages: query.data?.totalPages || 1,
    hasMore: query.data ? currentPage < query.data.totalPages : false,
    loadMore,
    marketMovers: query.data?.marketMovers || [],
    isLoading: query.isLoading && accumulatedArticles.length === 0,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    lastSyncAt: query.data?.lastSyncAt || new Date().toISOString(),
    isRateLimited: query.data?.isRateLimited || false,
    newStoriesCount: unseenArticles.length,
    showNewStories,
    refreshNews: (symbol?: string) => refreshMutation.mutate(symbol),
    isRefreshing: refreshMutation.isPending,
  };
}
