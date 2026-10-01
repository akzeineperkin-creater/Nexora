'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useAssets } from '@/hooks/useAssets';
import { usePortfolio } from '@/hooks/usePortfolio';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';

export type NotificationType =
  | 'market_alert'
  | 'news'
  | 'tournament'
  | 'trade'
  | 'price'
  | 'academy'
  | 'challenge'
  | 'info';

export interface AppNotification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  ticker?: string;
  news_id?: string;
  game_id?: string;
  target_url: string;
  created_at: string;
  time_ago?: string;
}

const STORAGE_PREFIX = 'nexra_read_notifications_v2_';

function getTimeAgo(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffSec = Math.max(0, Math.floor((now - date) / 1000));

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export function useNotifications() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const storageKey = `${STORAGE_PREFIX}${userId}`;

  const { data: assets } = useAssets({ limit: 20 });
  const { data: portfolio } = usePortfolio();

  // Local state for read IDs to ensure instant UI reactivity and persistence
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Sync with localStorage on change or user switch
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setReadIds(new Set(JSON.parse(stored)));
      } else {
        setReadIds(new Set());
      }
    } catch {}
  }, [storageKey]);

  const persistReadIds = useCallback((newSet: Set<string>) => {
    setReadIds(newSet);
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(newSet)));
    } catch {}
  }, [storageKey]);

  // Query notifications from database and dynamic contextual sources
  const query = useQuery<AppNotification[]>({
    queryKey: ['notifications', userId, assets?.length, portfolio?.transactions?.length],
    queryFn: async () => {
      let dbNotifications: AppNotification[] = [];

      // 1. Fetch from Supabase notifications table if logged in
      if (user?.id) {
        try {
          const { data, error } = await (supabase.from('notifications') as any)
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

          if (!error && data && Array.isArray(data) && data.length > 0) {
            dbNotifications = data.map((n: any) => {
              let target_url = '/markets';
              let ticker: string | undefined;

              if (n.type === 'trade') target_url = '/history';
              else if (n.type === 'challenge' || n.type === 'tournament') target_url = '/games';
              else if (n.type === 'academy') target_url = '/academy';

              return {
                id: n.id,
                user_id: n.user_id,
                title: n.title,
                message: n.message,
                type: (n.type || 'info') as NotificationType,
                is_read: Boolean(n.is_read) || readIds.has(n.id),
                ticker,
                target_url,
                created_at: n.created_at,
                time_ago: getTimeAgo(n.created_at),
              };
            });
          }
        } catch {}
      }

      // 2. Synthesize contextual, real actionable notifications
      const contextualList: AppNotification[] = [];

      // A. Real Market Alert from top mover
      if (assets && assets.length > 0) {
        const topGainer = [...assets].sort((a, b) => Math.abs(b.day_change_pct) - Math.abs(a.day_change_pct))[0];
        if (topGainer) {
          const isUp = topGainer.day_change_pct >= 0;
          const gainerId = `notif-market-${topGainer.ticker.toLowerCase()}`;
          contextualList.push({
            id: gainerId,
            title: `Market Alert: ${topGainer.ticker}`,
            message: `${topGainer.name} is ${isUp ? 'up' : 'down'} ${isUp ? '+' : ''}${topGainer.day_change_pct.toFixed(2)}% today at ${formatCurrency(topGainer.current_price)}.`,
            type: 'market_alert',
            ticker: topGainer.ticker,
            target_url: `/markets/${topGainer.ticker}`,
            is_read: readIds.has(gainerId),
            created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            time_ago: '15m ago',
          });
        }

        // B. Secondary mover (e.g. NVDA or Kaspi or Exxon)
        const secondMover = assets.find((a) => ['NVDA', 'KSPI', 'XOM', 'AAPL', 'MSFT'].includes(a.ticker) && a.ticker !== topGainer?.ticker);
        if (secondMover) {
          const isUp = secondMover.day_change_pct >= 0;
          const moverId = `notif-market-${secondMover.ticker.toLowerCase()}`;
          contextualList.push({
            id: moverId,
            title: `Market Activity: ${secondMover.ticker}`,
            message: `${secondMover.ticker} is trading at ${formatCurrency(secondMover.current_price)} (${isUp ? '+' : ''}${secondMover.day_change_pct.toFixed(2)}%) with strong market volume.`,
            type: 'market_alert',
            ticker: secondMover.ticker,
            target_url: `/markets/${secondMover.ticker}`,
            is_read: readIds.has(moverId),
            created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            time_ago: '45m ago',
          });
        }
      }

      // C. Financial News Notification
      const newsId = 'notif-news-breaking';
      contextualList.push({
        id: newsId,
        title: 'Financial News Feed',
        message: 'Global markets analyze latest corporate earnings, energy sector output, and Central Asian tech expansion.',
        type: 'news',
        target_url: '/news',
        is_read: readIds.has(newsId),
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        time_ago: '2h ago',
      });

      // D. Trading Arena / Tournament Notification
      const arenaId = 'notif-arena-tournament';
      contextualList.push({
        id: arenaId,
        title: 'Trading Arena Tournament',
        message: 'Summer Cup & Speed Trading challenges are live! Test your strategy and compete on the leaderboard.',
        type: 'tournament',
        game_id: 'speed-trading',
        target_url: '/games',
        is_read: readIds.has(arenaId),
        created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        time_ago: '6h ago',
      });

      // E. Real Trade Confirmation (if user has executed transactions)
      if (portfolio?.transactions && portfolio.transactions.length > 0) {
        const latestTx = portfolio.transactions[0];
        const txId = `notif-tx-${latestTx.id || latestTx.created_at}`;
        const cleanTicker = latestTx.asset?.ticker || (latestTx as any).ticker || 'STOCK';
        contextualList.unshift({
          id: txId,
          title: `Trade Executed: ${latestTx.type} ${cleanTicker}`,
          message: `Successfully executed ${latestTx.type} for ${latestTx.shares} sh of ${cleanTicker} @ ${formatCurrency(latestTx.price_per_share || 0)}.`,
          type: 'trade',
          ticker: cleanTicker,
          target_url: '/history',
          is_read: readIds.has(txId),
          created_at: latestTx.created_at || new Date().toISOString(),
          time_ago: getTimeAgo(latestTx.created_at || new Date().toISOString()),
        });
      }

      // Combine database and contextual items without duplicates
      const seen = new Set<string>();
      const combined: AppNotification[] = [];

      for (const item of [...dbNotifications, ...contextualList]) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          combined.push({
            ...item,
            is_read: readIds.has(item.id) || item.is_read,
          });
        }
      }

      return combined;
    },
    staleTime: 10000,
  });

  const notifications = useMemo(() => query.data || [], [query.data]);
  const unreadCount = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications]);

  // Mark single notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      const newSet = new Set(readIds);
      newSet.add(notificationId);
      persistReadIds(newSet);

      // Optimistically update React Query cache
      queryClient.setQueryData(
        ['notifications', userId, assets?.length, portfolio?.transactions?.length],
        (old: AppNotification[] | undefined) =>
          old ? old.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)) : []
      );

      // Persist to Supabase if valid UUID
      if (user?.id && !notificationId.startsWith('notif-')) {
        try {
          await (supabase.from('notifications') as any)
            .update({ is_read: true })
            .eq('id', notificationId)
            .eq('user_id', user.id);
        } catch {}
      }
    },
    [readIds, persistReadIds, queryClient, userId, assets?.length, portfolio?.transactions?.length, user?.id]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    const newSet = new Set(readIds);
    notifications.forEach((n) => newSet.add(n.id));
    persistReadIds(newSet);

    // Optimistically update React Query cache
    queryClient.setQueryData(
      ['notifications', userId, assets?.length, portfolio?.transactions?.length],
      (old: AppNotification[] | undefined) =>
        old ? old.map((n) => ({ ...n, is_read: true })) : []
    );

    // Persist to Supabase
    if (user?.id) {
      try {
        await (supabase.from('notifications') as any)
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
      } catch {}
    }
  }, [readIds, notifications, persistReadIds, queryClient, userId, assets?.length, portfolio?.transactions?.length, user?.id]);

  // Click handler that marks as read and navigates to the actionable target
  const handleNotificationClick = useCallback(
    (notification: AppNotification, onComplete?: () => void) => {
      // 1. Mark as read
      markAsRead(notification.id);

      // 2. Call optional callback (e.g. close dropdown)
      if (onComplete) {
        onComplete();
      }

      // 3. Resolve destination URL based on notification type and metadata
      let dest = notification.target_url || '/markets';
      if (notification.type === 'market_alert' || notification.type === 'price') {
        if (notification.ticker) {
          dest = `/markets/${notification.ticker.toUpperCase()}`;
        }
      } else if (notification.type === 'news') {
        dest = notification.ticker ? `/news?ticker=${notification.ticker.toUpperCase()}` : '/news';
      } else if (notification.type === 'tournament' || notification.type === 'challenge') {
        dest = notification.game_id ? `/games/${notification.game_id}` : '/games';
      } else if (notification.type === 'trade') {
        dest = '/history';
      }

      // 4. Navigate immediately
      router.push(dest);
    },
    [markAsRead, router]
  );

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    markAsRead,
    markAllAsRead,
    handleNotificationClick,
    refetch: query.refetch,
  };
}
