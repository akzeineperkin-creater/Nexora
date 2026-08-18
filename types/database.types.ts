export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          nickname?: string | null;
          full_name: string | null;
          avatar_url: string | null;
          level: number;
          xp: number;
          xp_max: number;
          tier: string;
          referral_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          nickname?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          level?: number;
          xp?: number;
          xp_max?: number;
          tier?: string;
          referral_code?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          nickname?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          level?: number;
          xp?: number;
          xp_max?: number;
          tier?: string;
          referral_code?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          ticker: string;
          name: string;
          type: 'Stock' | 'ETF' | 'Crypto' | 'Index';
          category: 'stocks' | 'etfs' | 'crypto' | 'indices';
          sector: string;
          current_price: number;
          day_change: number;
          day_change_pct: number;
          volume_24h: string;
          market_cap: string;
          pe_ratio: number | null;
          high_52w: number;
          low_52w: number;
          beta: number;
          eps: number | null;
          description: string;
          ai_summary: string;
          ai_sentiment: 'Bullish' | 'Neutral' | 'Bearish';
          color: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticker: string;
          name: string;
          type: 'Stock' | 'ETF' | 'Crypto' | 'Index';
          category: 'stocks' | 'etfs' | 'crypto' | 'indices';
          sector: string;
          current_price: number;
          day_change: number;
          day_change_pct: number;
          volume_24h: string;
          market_cap: string;
          pe_ratio?: number | null;
          high_52w: number;
          low_52w: number;
          beta: number;
          eps?: number | null;
          description: string;
          ai_summary: string;
          ai_sentiment: 'Bullish' | 'Neutral' | 'Bearish';
          color?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticker?: string;
          name?: string;
          type?: 'Stock' | 'ETF' | 'Crypto' | 'Index';
          category?: 'stocks' | 'etfs' | 'crypto' | 'indices';
          sector?: string;
          current_price?: number;
          day_change?: number;
          day_change_pct?: number;
          volume_24h?: string;
          market_cap?: string;
          pe_ratio?: number | null;
          high_52w?: number;
          low_52w?: number;
          beta?: number;
          eps?: number | null;
          description?: string;
          ai_summary?: string;
          ai_sentiment?: 'Bullish' | 'Neutral' | 'Bearish';
          color?: string;
          updated_at?: string;
        };
      };
      portfolios: {
        Row: {
          id: string;
          user_id: string;
          type: 'SANDBOX' | 'COMPETITION';
          cash_balance: number;
          starting_capital: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: 'SANDBOX' | 'COMPETITION';
          cash_balance?: number;
          starting_capital?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'SANDBOX' | 'COMPETITION';
          cash_balance?: number;
          starting_capital?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      holdings: {
        Row: {
          id: string;
          portfolio_id: string;
          asset_id: string;
          shares: number;
          average_buy_price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          portfolio_id: string;
          asset_id: string;
          shares: number;
          average_buy_price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          portfolio_id?: string;
          asset_id?: string;
          shares?: number;
          average_buy_price?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          portfolio_id: string;
          asset_id: string;
          type: 'BUY' | 'SELL';
          shares: number;
          price_per_share: number;
          total_amount: number;
          order_type: 'MARKET' | 'LIMIT' | 'STOP';
          realized_pnl: number | null;
          status: 'FILLED' | 'PENDING' | 'CANCELLED';
          created_at: string;
        };
        Insert: {
          id?: string;
          portfolio_id: string;
          asset_id: string;
          type: 'BUY' | 'SELL';
          shares: number;
          price_per_share: number;
          total_amount: number;
          order_type?: 'MARKET' | 'LIMIT' | 'STOP';
          realized_pnl?: number | null;
          status?: 'FILLED' | 'PENDING' | 'CANCELLED';
          created_at?: string;
        };
        Update: {
          id?: string;
          portfolio_id?: string;
          asset_id?: string;
          type?: 'BUY' | 'SELL';
          shares?: number;
          price_per_share?: number;
          total_amount?: number;
          order_type?: 'MARKET' | 'LIMIT' | 'STOP';
          realized_pnl?: number | null;
          status?: 'FILLED' | 'PENDING' | 'CANCELLED';
          created_at?: string;
        };
      };
      watchlists: {
        Row: {
          id: string;
          user_id: string;
          asset_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          asset_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          asset_id?: string;
          created_at?: string;
        };
      };
      challenges: {
        Row: {
          id: string;
          name: string;
          description: string;
          starting_capital: number;
          start_date: string;
          end_date: string;
          status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          starting_capital?: number;
          start_date: string;
          end_date: string;
          status?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          starting_capital?: number;
          start_date?: string;
          end_date?: string;
          status?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | string;
          created_at?: string;
        };
      };
      challenge_participants: {
        Row: {
          id: string;
          challenge_id: string;
          user_id: string;
          rank: number;
          pnl: number;
          starting_capital: number;
          current_value: number;
          joined_at: string;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          user_id: string;
          rank?: number;
          pnl?: number;
          starting_capital?: number;
          current_value?: number;
          joined_at?: string;
        };
        Update: {
          id?: string;
          challenge_id?: string;
          user_id?: string;
          rank?: number;
          pnl?: number;
          starting_capital?: number;
          current_value?: number;
          joined_at?: string;
        };
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_id: string;
          status: 'PENDING' | 'QUALIFIED' | 'REWARDED';
          reward_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referred_id: string;
          status?: 'PENDING' | 'QUALIFIED' | 'REWARDED';
          reward_amount?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          referrer_id?: string;
          referred_id?: string;
          status?: 'PENDING' | 'QUALIFIED' | 'REWARDED';
          reward_amount?: number;
          created_at?: string;
        };
      };
      news: {
        Row: {
          id: string;
          title: string;
          summary: string;
          source_name: string;
          source_url: string;
          image_url: string | null;
          sentiment: 'Bullish' | 'Neutral' | 'Bearish';
          published_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          summary: string;
          source_name: string;
          source_url: string;
          image_url?: string | null;
          sentiment?: 'Bullish' | 'Neutral' | 'Bearish';
          published_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          summary?: string;
          source_name?: string;
          source_url?: string;
          image_url?: string | null;
          sentiment?: 'Bullish' | 'Neutral' | 'Bearish';
          published_at?: string;
          created_at?: string;
        };
      };
      news_assets: {
        Row: {
          news_id: string;
          asset_id: string;
        };
        Insert: {
          news_id: string;
          asset_id: string;
        };
        Update: {
          news_id?: string;
          asset_id?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'trade' | 'price' | 'challenge' | 'academy' | 'info';
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: 'trade' | 'price' | 'challenge' | 'academy' | 'info';
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'trade' | 'price' | 'challenge' | 'academy' | 'info';
          is_read?: boolean;
          created_at?: string;
        };
      };
      academy_courses: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          level: 'Beginner' | 'Intermediate' | 'Advanced';
          category: string;
          duration_minutes: number;
          xp_reward: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description: string;
          level?: 'Beginner' | 'Intermediate' | 'Advanced';
          category?: string;
          duration_minutes?: number;
          xp_reward?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string;
          level?: 'Beginner' | 'Intermediate' | 'Advanced';
          category?: string;
          duration_minutes?: number;
          xp_reward?: number;
          created_at?: string;
        };
      };
      academy_lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          content: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          content: string;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          content?: string;
          order_index?: number;
          created_at?: string;
        };
      };
      academy_progress: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          completed: boolean;
          quiz_score: number | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          completed?: boolean;
          quiz_score?: number | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          completed?: boolean;
          quiz_score?: number | null;
          completed_at?: string | null;
        };
      };
    };
    Functions: {
      execute_trade: {
        Args: {
          p_asset_id: string;
          p_quantity: number;
          p_transaction_type: 'BUY' | 'SELL';
        };
        Returns: {
          success: boolean;
          type: 'BUY' | 'SELL';
          price: number;
          quantity: number;
          total_value: number;
          remaining_cash: number;
        };
      };
    };
  };
}

// Convenient Joined Types for Frontend Consumption
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Asset = Database['public']['Tables']['assets']['Row'];
export type Portfolio = Database['public']['Tables']['portfolios']['Row'];
export type Holding = Database['public']['Tables']['holdings']['Row'] & { asset?: Asset };
export type Transaction = Database['public']['Tables']['transactions']['Row'] & { asset?: Asset };
export type WatchlistItem = Database['public']['Tables']['watchlists']['Row'] & { asset?: Asset };
export type Challenge = Database['public']['Tables']['challenges']['Row'];
export type ChallengeParticipant = Database['public']['Tables']['challenge_participants']['Row'] & {
  profile?: Profile;
  portfolio?: Portfolio;
};
export type Referral = Database['public']['Tables']['referrals']['Row'] & {
  referred_profile?: Profile;
};
export type NewsItem = Database['public']['Tables']['news']['Row'] & {
  assets?: Asset[];
};
export type NewsArticle = Database['public']['Tables']['news']['Row'];
export type NotificationItem = Database['public']['Tables']['notifications']['Row'];
export type AcademyCourse = Database['public']['Tables']['academy_courses']['Row'] & {
  lessons?: Database['public']['Tables']['academy_lessons']['Row'][];
  progress?: Database['public']['Tables']['academy_progress']['Row'];
};
