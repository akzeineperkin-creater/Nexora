'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TradingGame, GamePortfolio, GameParticipant, CreateGamePayload } from '@/lib/games/types';
import { useAuth } from '@/providers/AuthProvider';

export function isClientGameAuthorized(gameIdOrSlug: string, creatorId?: string, currentUserId?: string): boolean {
  if (currentUserId && creatorId && currentUserId === creatorId) {
    return true;
  }
  if (typeof window === 'undefined') return false;
  try {
    const directAuth = sessionStorage.getItem(`nexra_game_auth_${gameIdOrSlug}`);
    return Boolean(directAuth);
  } catch {
    return false;
  }
}

export function setClientGameAuthorized(gameIdOrSlug: string, gameId?: string) {
  if (typeof window === 'undefined') return;
  try {
    const authVal = `auth_ok_${gameId || gameIdOrSlug}`;
    sessionStorage.setItem(`nexra_game_auth_${gameIdOrSlug}`, authVal);
    if (gameId && gameId !== gameIdOrSlug) {
      sessionStorage.setItem(`nexra_game_auth_${gameId}`, authVal);
    }
  } catch {}
}

export function useGames(status?: 'active' | 'upcoming' | 'completed') {
  return useQuery<{ games: TradingGame[]; count: number }>({
    queryKey: ['games', status || 'all'],
    queryFn: async () => {
      const url = new URL('/api/games', window.location.origin);
      if (status) url.searchParams.set('status', status);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch games list');
      return res.json();
    },
    staleTime: 30 * 1000,
  });
}

export function useCreateGame() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (payload: CreateGamePayload) => {
      const creatorName = profile?.nickname || profile?.username || user?.email?.split('@')[0] || 'Trader';
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          creatorId: user?.id,
          creatorName,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create game.');
      }

      const data = await res.json();
      if (data.game) {
        setClientGameAuthorized(data.game.slug, data.game.id);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

export function useVerifyGamePassword() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ gameIdOrSlug, password }: { gameIdOrSlug: string; password: string }) => {
      const res = await fetch(`/api/games/${gameIdOrSlug}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          userId: user?.id,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Incorrect tournament password. Access denied.');
      }

      if (data.game) {
        setClientGameAuthorized(gameIdOrSlug, data.game.id);
        if (data.game.slug) {
          setClientGameAuthorized(data.game.slug, data.game.id);
        }
      } else {
        setClientGameAuthorized(gameIdOrSlug);
      }

      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['game-session', variables.gameIdOrSlug] });
    },
  });
}

export function useGameSession(gameId: string) {
  const { user, profile } = useAuth();
  const userId = user?.id || '';
  const username = profile?.nickname || profile?.username || user?.email?.split('@')[0] || 'Trader';

  return useQuery<{
    game: TradingGame;
    portfolio?: GamePortfolio | null;
    hasJoined?: boolean;
    hasLeft?: boolean;
    leaderboard?: GameParticipant[];
    isLocked?: boolean;
    isPrivate?: boolean;
    error?: string;
    message?: string;
  }>({
    queryKey: ['game-session', gameId, userId],
    queryFn: async () => {
      const url = new URL(`/api/games/${gameId}`, window.location.origin);
      if (userId) {
        url.searchParams.set('userId', userId);
        url.searchParams.set('username', username);
      }

      const headers: Record<string, string> = {};
      if (typeof window !== 'undefined') {
        const storedAuth = sessionStorage.getItem(`nexra_game_auth_${gameId}`);
        if (storedAuth) {
          headers['x-game-auth'] = storedAuth;
        }
      }

      const res = await fetch(url.toString(), { headers });

      if (res.status === 403) {
        const lockData = await res.json().catch(() => ({}));
        return {
          game: lockData.game || { id: gameId, slug: gameId, title: 'Private Tournament', visibility: 'private', status: 'active' },
          isLocked: true,
          isPrivate: true,
          error: lockData.error || 'PRIVATE_GAME_PASSWORD_REQUIRED',
          message: lockData.message || 'This tournament is private. Password verification is required to enter.',
        };
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to fetch game session');
      }

      return res.json();
    },
    refetchInterval: 15 * 1000,
    staleTime: 10 * 1000,
    enabled: Boolean(gameId),
  });
}

export function useJoinGame(gameId: string) {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (payload?: { password?: string }) => {
      if (!user?.id) {
        throw new Error('Please sign in to your Nexra account to join tournaments.');
      }
      const userId = user.id;
      const username = profile?.nickname || profile?.username || user?.email?.split('@')[0] || 'Trader';

      const res = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          username,
          password: payload?.password,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to join tournament.');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-session', gameId] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

export function useLeaveGame(gameId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('Please sign in to leave a tournament.');
      }
      const userId = user.id;

      const res = await fetch(`/api/games/${gameId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to leave tournament.');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-session', gameId] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

export function useGameTrade(gameId: string) {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      ticker: string;
      type: 'BUY' | 'SELL';
      shares: number;
      orderType?: 'MARKET' | 'LIMIT' | 'STOP';
      price?: number;
    }) => {
      if (!user?.id) {
        throw new Error('Please sign in to your Nexra account to execute tournament trades.');
      }
      const userId = user.id;
      const username = profile?.nickname || profile?.username || user?.email?.split('@')[0] || 'Trader';

      const res = await fetch(`/api/games/${gameId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          userId,
          username,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Trade execution failed.');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-session', gameId] });
    },
  });
}
