'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { Profile, Portfolio } from '@/types/database.types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  portfolio: Portfolio | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signUp: (email: string, password: string, nickname?: string) => Promise<{ data?: any; error?: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshPortfolio: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  portfolio: null,
  isLoading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
  refreshProfile: async () => {},
  refreshPortfolio: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Sync user profile & sandbox portfolio with Supabase database (non-blocking)
  const syncUserData = useCallback(async (currentUser: User) => {
    try {
      // 1. Query or initialize public.profiles linked to auth.users (id = auth.users.id)
      const { data: rawProfile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      let resolvedProfile: Profile | null = (rawProfile as unknown as Profile) || null;

      if (!resolvedProfile && !profileErr) {
        // Create initial profile in public.profiles with user's chosen nickname
        const userMetaNickname = currentUser.user_metadata?.nickname || currentUser.user_metadata?.username;
        const nickname = userMetaNickname || currentUser.email?.split('@')[0] || `trader_${currentUser.id.slice(0, 5)}`;
        const cleanRefSuffix = nickname.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        const referralCode = `NEXORA-${cleanRefSuffix || 'SIM'}${currentUser.id.slice(0, 4).toUpperCase()}`;

        try {
          const { data: newProfile, error: insertProfileErr } = await (supabase as any)
            .from('profiles')
            .insert({
              id: currentUser.id,
              username: nickname,
              full_name: nickname,
              avatar_url: null, // Clean neutral empty state
            })
            .select('*')
            .single();

          if (!insertProfileErr && newProfile) {
            resolvedProfile = newProfile as Profile;
          }
        } catch (e) {
          console.warn('Profile insertion notice:', e);
        }

        if (!resolvedProfile) {
          resolvedProfile = {
            id: currentUser.id,
            username: nickname,
            nickname: nickname,
            full_name: nickname,
            avatar_url: null,
            level: 1,
            xp: 0,
            xp_max: 1000,
            tier: 'Pro Simulator',
            referral_code: referralCode,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
      }

      if (resolvedProfile) {
        setProfile(resolvedProfile);
      }

      // 2. Query or initialize public.portfolios for this user
      const { data: rawPortfolio, error: portfolioErr } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      let resolvedPortfolio: Portfolio | null = (rawPortfolio as unknown as Portfolio) || null;

      if (!resolvedPortfolio && !portfolioErr) {
        try {
          // Create standard virtual cash portfolio in public.portfolios
          const { data: newPortfolio, error: insertPortfolioErr } = await (supabase as any)
            .from('portfolios')
            .insert({
              user_id: currentUser.id,
              cash: 10000.00,
              starting_cash: 10000.00,
            })
            .select('*')
            .single();

          if (!insertPortfolioErr && newPortfolio) {
            resolvedPortfolio = newPortfolio as Portfolio;
          } else {
            // Fallback schema
            const { data: fallbackPortfolio } = await (supabase as any)
              .from('portfolios')
              .insert({
                user_id: currentUser.id,
                type: 'SANDBOX',
                cash_balance: 10000.00,
                starting_capital: 10000.00,
              })
              .select('*')
              .single();

            if (fallbackPortfolio) {
              resolvedPortfolio = fallbackPortfolio as Portfolio;
            }
          }
        } catch (e) {
          console.warn('Portfolio initialization notice:', e);
        }

        if (!resolvedPortfolio) {
          resolvedPortfolio = {
            id: `port-${currentUser.id}`,
            user_id: currentUser.id,
            type: 'SANDBOX',
            cash_balance: 10000.00,
            starting_capital: 10000.00,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
      }

      if (resolvedPortfolio) {
        setPortfolio(resolvedPortfolio);
      }
    } catch (err) {
      console.error('Notice synchronizing user profile and portfolio:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!isMounted) return;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setIsLoading(false);

      if (initialSession?.user) {
        syncUserData(initialSession.user);
      }
    }).catch((err) => {
      if (!isMounted) return;
      console.warn('GetSession error:', err);
      setIsLoading(false);
    });

    // 2. Real-time Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);

      if (currentSession?.user) {
        syncUserData(currentSession.user);
      } else {
        setProfile(null);
        setPortfolio(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [syncUserData]);

  const signIn = async (email: string, password: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (res.error) {
        return { data: null, error: res.error };
      }

      if (res.data?.user && res.data?.session) {
        setUser(res.data.user);
        setSession(res.data.session);
        setIsLoading(false);
        await syncUserData(res.data.user);
      }
      return res;
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const signUp = async (email: string, password: string, nickname?: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanNickname = nickname?.trim() || cleanEmail.split('@')[0];
      const res = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            nickname: cleanNickname,
            username: cleanNickname,
            full_name: cleanNickname,
          },
        },
      });

      if (res.error) {
        return { data: null, error: res.error };
      }

      // Check if user already exists (Supabase returns empty identities array when email exists)
      if (res.data?.user && Array.isArray(res.data.user.identities) && res.data.user.identities.length === 0) {
        return {
          data: null,
          error: {
            message: 'An account with this email address already exists. Please sign in instead.',
            status: 400,
          },
        };
      }

      if (res.data?.user) {
        let activeSession = res.data.session;
        let activeUser = res.data.user;

        // If signup didn't return an active session, sign in immediately with the exact same credentials
        if (!activeSession) {
          const loginRes = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          if (loginRes.data?.session) {
            activeSession = loginRes.data.session;
            activeUser = loginRes.data.user;
          }
        }

        setUser(activeUser);
        if (activeSession) setSession(activeSession);
        setIsLoading(false);
        await syncUserData(activeUser);
      }
      return res;
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('SignOut error:', err);
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setPortfolio(null);
    setIsLoading(false);
    router.replace('/register');
    router.refresh();
  };

  const refreshProfile = async () => {
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    }
  };

  const refreshPortfolio = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        setUser(userData.user);
      }
      const uid = userData?.user?.id || user?.id;
      if (uid) {
        const { data } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', uid)
          .maybeSingle();
        if (data) setPortfolio(data);
      }
    } catch (e) {
      console.warn('refreshPortfolio notice:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        portfolio,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        refreshPortfolio,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
