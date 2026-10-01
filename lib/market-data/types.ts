import { Asset } from '@/types/database.types';

export interface MarketQuote {
  ticker: string;
  name: string;
  type: string;
  category: string;
  sector: string;
  industry?: string;
  currentPrice: number;
  dayChange: number;
  dayChangePct: number;
  openPrice?: number;
  previousClose?: number;
  dayHigh?: number;
  dayLow?: number;
  volume24h: string;
  avgVolume?: string;
  marketCap: string;
  sharesOutstanding?: string;
  high52w: number;
  low52w: number;
  week52Change?: number;
  peRatio: number | null;
  beta: number;
  eps: number | null;
  dividendYield?: number | null;
  description: string;
  aiSentiment: string;
  aiSummary: string;
  updatedAt: string;
  isMarketOpen?: boolean;
  marketStatus?: 'OPEN' | 'PRE_MARKET' | 'AFTER_HOURS' | 'CLOSED';
  region?: string;
  country?: string;
  exchange?: string;
  currency?: string;
}

export interface HistoricalPricePoint {
  date: string;
  timestamp: number;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

export type Timeframe = '1D' | '5D' | '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y' | 'ALL';

export interface GetAssetsParams {
  category?: 'stocks' | 'etfs' | 'indices' | 'all' | string;
  region?: 'All' | 'US' | 'Canada' | 'Europe' | 'Asia' | 'Latin America' | 'Emerging Markets' | 'ETFs' | 'Indices' | 'all' | 'us' | 'canada' | 'europe' | 'asia' | 'latam' | 'emerging' | string;
  search?: string;
  filter?: 'all' | 'gainers' | 'losers' | 'active' | 'market_cap' | 'most_viewed' | string;
  sort?: 'all' | 'gainers' | 'losers' | 'active' | 'market_cap' | 'most_viewed' | string;
  page?: number;
  limit?: number;
  offset?: number;
  country?: string;
  exchange?: string;
}

export interface MarketDataProvider {
  getQuote(ticker: string): Promise<MarketQuote | null>;
  getAsset(ticker: string): Promise<Asset | null>;
  getAssets(params?: GetAssetsParams): Promise<Asset[]>;
  getHistoricalPrices(ticker: string, timeframe: Timeframe): Promise<HistoricalPricePoint[]>;
}
