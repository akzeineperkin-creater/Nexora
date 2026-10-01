import { supabase } from '@/lib/supabase/client';
import { Asset } from '@/types/database.types';
import { MarketDataProvider, MarketQuote, HistoricalPricePoint, Timeframe, GetAssetsParams } from './types';

export class SupabaseMarketDataProvider implements MarketDataProvider {
  async getAsset(ticker: string): Promise<Asset | null> {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('ticker', ticker.toUpperCase())
      .maybeSingle();

    if (error) {
      console.error(`[MarketDataProvider] Error fetching asset for ${ticker}:`, error.message);
      return null;
    }

    return (data as unknown as Asset) || null;
  }

  async getQuote(ticker: string): Promise<MarketQuote | null> {
    const asset = await this.getAsset(ticker);
    if (!asset) return null;

    return {
      ticker: asset.ticker,
      name: asset.name,
      type: asset.type,
      category: asset.category,
      sector: asset.sector,
      currentPrice: Number(asset.current_price),
      dayChange: Number(asset.day_change),
      dayChangePct: Number(asset.day_change_pct),
      volume24h: asset.volume_24h,
      marketCap: asset.market_cap,
      high52w: Number(asset.high_52w),
      low52w: Number(asset.low_52w),
      peRatio: asset.pe_ratio !== null ? Number(asset.pe_ratio) : null,
      beta: Number(asset.beta),
      eps: asset.eps !== null ? Number(asset.eps) : null,
      description: asset.description,
      aiSentiment: asset.ai_sentiment,
      aiSummary: asset.ai_summary,
      updatedAt: asset.updated_at,
    };
  }

  async getAssets(params?: GetAssetsParams): Promise<Asset[]> {
    let query = supabase.from('assets').select('*');

    if (params?.category && params.category !== 'all') {
      query = query.eq('category', params.category);
    }

    if (params?.search) {
      const s = params.search.trim();
      query = query.or(`ticker.ilike.%${s}%,name.ilike.%${s}%,sector.ilike.%${s}%`);
    }

    if (params?.filter === 'gainers') {
      query = query.order('day_change_pct', { ascending: false });
    } else if (params?.filter === 'losers') {
      query = query.order('day_change_pct', { ascending: true });
    } else {
      query = query.order('market_cap', { ascending: false });
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[MarketDataProvider] Error fetching assets:', error.message);
      return [];
    }

    return (data as unknown as Asset[]) || [];
  }

  async getHistoricalPrices(ticker: string, timeframe: Timeframe): Promise<HistoricalPricePoint[]> {
    // Database schema currently stores live quotes in public.assets.
    // Clean abstraction: returns empty array when historical database series is unavailable
    // so the UI can gracefully render live price levels or connect real external API later without mock data.
    return [];
  }
}

export const defaultMarketDataProvider = new SupabaseMarketDataProvider();
