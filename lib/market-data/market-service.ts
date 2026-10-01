import { Asset } from '@/types/database.types';
import { MarketQuote, HistoricalPricePoint, Timeframe, GetAssetsParams } from './types';
import { GLOBAL_STOCKS_UNIVERSE, GlobalStockItem } from './global-universe';

// Re-export for any modules referencing REAL_STOCKS_UNIVERSE
export const REAL_STOCKS_UNIVERSE = GLOBAL_STOCKS_UNIVERSE;

export interface EasternTimeInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  timeString: string; // e.g. "10:30 AM EDT"
  dateString: string; // e.g. "2026-08-17"
  isMarketOpen: boolean;
  marketStatus: 'OPEN' | 'PRE_MARKET' | 'AFTER_HOURS' | 'CLOSED';
}

export function getEasternTime(date: Date = new Date()): EasternTimeInfo {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  parts.forEach((p) => {
    map[p.type] = p.value;
  });

  const year = parseInt(map.year, 10);
  const month = parseInt(map.month, 10);
  const day = parseInt(map.day, 10);
  const hour = parseInt(map.hour, 10);
  const minute = parseInt(map.minute, 10);
  const second = parseInt(map.second, 10);

  const easternDate = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}Z`);
  const dayOfWeek = easternDate.getUTCDay();

  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const currentMinutes = hour * 60 + minute;
  const marketOpenMinutes = 9 * 60 + 30; // 9:30 AM
  const marketCloseMinutes = 16 * 60; // 4:00 PM
  const preMarketMinutes = 4 * 60; // 4:00 AM
  const afterHoursMinutes = 20 * 60; // 8:00 PM

  let marketStatus: 'OPEN' | 'PRE_MARKET' | 'AFTER_HOURS' | 'CLOSED' = 'CLOSED';
  let isMarketOpen = false;

  if (isWeekday) {
    if (currentMinutes >= marketOpenMinutes && currentMinutes < marketCloseMinutes) {
      marketStatus = 'OPEN';
      isMarketOpen = true;
    } else if (currentMinutes >= preMarketMinutes && currentMinutes < marketOpenMinutes) {
      marketStatus = 'PRE_MARKET';
    } else if (currentMinutes >= marketCloseMinutes && currentMinutes < afterHoursMinutes) {
      marketStatus = 'AFTER_HOURS';
    } else {
      marketStatus = 'CLOSED';
    }
  } else {
    marketStatus = 'CLOSED';
  }

  const hour12 = hour % 12 || 12;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const timeString = `${hour12}:${String(minute).padStart(2, '0')} ${ampm} EDT`;
  const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    dayOfWeek,
    timeString,
    dateString,
    isMarketOpen,
    marketStatus,
  };
}

export function formatEasternTimeLabel(timestamp: number): string {
  const d = new Date(timestamp);
  const info = getEasternTime(d);
  const hour12 = info.hour % 12 || 12;
  const ampm = info.hour >= 12 ? 'PM' : 'AM';
  return `${hour12}:${String(info.minute).padStart(2, '0')} ${ampm}`;
}

const CLEAN_NUM = (str: any): number => {
  if (typeof str === 'number') return isNaN(str) ? 0 : str;
  if (!str || typeof str !== 'string') return 0;
  const n = parseFloat(str.replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : n;
};

// Central Real Market Data Provider (Nasdaq Live Market API)
class RealMarketDataProvider {
  private quoteCache = new Map<string, { quote: MarketQuote; fetchedAt: number }>();
  private historyCache = new Map<string, { points: HistoricalPricePoint[]; fetchedAt: number }>();
  private universeCache: { assets: Asset[]; fetchedAt: number } | null = null;
  private pendingQuotes = new Map<string, Promise<MarketQuote | null>>();

  private isEtfTicker(ticker: string): boolean {
    const clean = ticker.toUpperCase().trim();
    return ['SPY', 'QQQ', 'VOO', 'IWM', 'VTI', 'DIA', 'XLK', 'XLF', 'XLE', 'SOXX', 'ARKK', 'GLD', 'SLV', 'TLT'].includes(clean);
  }

  public async getRealQuote(ticker: string): Promise<MarketQuote | null> {
    const clean = ticker.toUpperCase().trim();
    if (!clean) return null;

    const now = Date.now();
    const cached = this.quoteCache.get(clean);
    // Cache quotes for 5 seconds
    if (cached && now - cached.fetchedAt < 5000) {
      return cached.quote;
    }

    if (this.pendingQuotes.has(clean)) {
      return this.pendingQuotes.get(clean)!;
    }

    const fetchPromise = this.fetchFromNasdaq(clean);
    this.pendingQuotes.set(clean, fetchPromise);

    try {
      const quote = await fetchPromise;
      if (quote) {
        this.quoteCache.set(clean, { quote, fetchedAt: Date.now() });
      }
      return quote;
    } finally {
      this.pendingQuotes.delete(clean);
    }
  }

  private async fetchFromNasdaq(cleanTicker: string): Promise<MarketQuote | null> {
    const assetclass = this.isEtfTicker(cleanTicker) ? 'etf' : 'stocks';
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
    };

    try {
      const [infoRes, summaryRes] = await Promise.all([
        fetch(`https://api.nasdaq.com/api/quote/${cleanTicker}/info?assetclass=${assetclass}`, {
          headers,
          next: { revalidate: 5 },
        }),
        fetch(`https://api.nasdaq.com/api/quote/${cleanTicker}/summary?assetclass=${assetclass}`, {
          headers,
          next: { revalidate: 15 },
        }),
      ]);

      if (!infoRes.ok) {
        return this.getFallbackQuoteFromUniverse(cleanTicker);
      }

      const infoJson = await infoRes.json();
      const primary = infoJson.data?.primaryData;
      if (!primary || !primary.lastSalePrice) {
        return this.getFallbackQuoteFromUniverse(cleanTicker);
      }

      const summaryJson = summaryRes.ok ? await summaryRes.json() : null;
      const summary = summaryJson?.data?.summaryData || {};

      const currentPrice = CLEAN_NUM(primary.lastSalePrice);
      if (currentPrice <= 0) {
        return this.getFallbackQuoteFromUniverse(cleanTicker);
      }

      const prevCloseRaw = CLEAN_NUM(summary.PreviousClose?.value);
      const dayChangeRaw = CLEAN_NUM(primary.netChange);
      const prevClose = prevCloseRaw > 0 ? prevCloseRaw : Number((currentPrice - dayChangeRaw).toFixed(2));
      const dayChange = Number((currentPrice - prevClose).toFixed(2));
      const dayChangePct = prevClose > 0 ? Number(((dayChange / prevClose) * 100).toFixed(2)) : 0;

      let high52 = 0;
      let low52 = 0;
      if (summary.FiftTwoWeekHighLow?.value) {
        const parts = summary.FiftTwoWeekHighLow.value.split('/');
        high52 = CLEAN_NUM(parts[0]);
        low52 = CLEAN_NUM(parts[1]);
      }

      let dayHigh = 0;
      let dayLow = 0;
      if (summary.TodayHighLow?.value && summary.TodayHighLow.value !== 'N/A') {
        const parts = summary.TodayHighLow.value.split('/');
        dayHigh = CLEAN_NUM(parts[0]);
        dayLow = CLEAN_NUM(parts[1]);
      } else {
        dayHigh = Math.max(currentPrice, prevClose);
        dayLow = Math.min(currentPrice, prevClose);
      }

      const eastern = getEasternTime();
      const known = GLOBAL_STOCKS_UNIVERSE.find((s) => s.ticker === cleanTicker);

      const quote: MarketQuote = {
        ticker: cleanTicker,
        name: infoJson.data?.companyName || known?.name || cleanTicker,
        type: this.isEtfTicker(cleanTicker) ? 'ETF' : 'Stock',
        category: this.isEtfTicker(cleanTicker) ? 'etfs' : 'stocks',
        sector: summary.Sector?.value || known?.sector || 'Technology',
        industry: summary.Industry?.value || known?.industry || 'Equities',
        currentPrice: Number(currentPrice.toFixed(2)),
        dayChange: Number(dayChange.toFixed(2)),
        dayChangePct: Number(dayChangePct.toFixed(2)),
        openPrice: CLEAN_NUM(summary.OpenPrice?.value) || prevClose,
        previousClose: Number(prevClose.toFixed(2)),
        dayHigh: Number(dayHigh.toFixed(2)),
        dayLow: Number(dayLow.toFixed(2)),
        volume24h: primary.volume ? `${(CLEAN_NUM(primary.volume) / 1e6).toFixed(1)}M` : known?.volume_24h || '1.0M',
        avgVolume: summary.AverageVolume?.value ? `${(CLEAN_NUM(summary.AverageVolume.value) / 1e6).toFixed(1)}M` : known?.volume_24h || '1.2M',
        marketCap: summary.MarketCap?.value ? `$${(CLEAN_NUM(summary.MarketCap.value) / 1e9).toFixed(2)}B` : known?.market_cap || '$100B',
        sharesOutstanding: (known as any)?.shares_outstanding || '2.5B',
        high52w: high52 > 0 ? high52 : Number((currentPrice * 1.18).toFixed(2)),
        low52w: low52 > 0 ? low52 : Number((currentPrice * 0.78).toFixed(2)),
        week52Change: (known as any)?.week_52_change || Number((dayChangePct * 4).toFixed(2)),
        peRatio: summary.PERatio?.value ? CLEAN_NUM(summary.PERatio.value) : known?.pe_ratio || null,
        beta: CLEAN_NUM(summary.Beta?.value) || known?.beta || 1.1,
        eps: CLEAN_NUM(summary.EPS?.value) || known?.eps || null,
        dividendYield: summary.Yield?.value ? CLEAN_NUM(summary.Yield.value) : (known as any)?.dividend_yield || null,
        description: known?.description || `${cleanTicker} is a publicly traded financial instrument on ${summary.Exchange?.value || 'NASDAQ'}.`,
        aiSentiment: dayChange >= 0 ? 'Bullish' : 'Bearish',
        aiSummary: known?.ai_summary || `Real-time trading volume and price momentum indicates ${dayChange >= 0 ? 'bullish' : 'bearish'} market activity.`,
        updatedAt: new Date().toISOString(),
        isMarketOpen: eastern.isMarketOpen,
        marketStatus: eastern.marketStatus,
        region: known?.region || 'US',
        country: known?.country || 'United States',
        exchange: summary.Exchange?.value || infoJson.data?.exchange || known?.exchange || 'NASDAQ',
        currency: 'USD',
      };

      return quote;
    } catch (err) {
      return this.getFallbackQuoteFromUniverse(cleanTicker);
    }
  }

  private getFallbackQuoteFromUniverse(cleanTicker: string): MarketQuote | null {
    const known = GLOBAL_STOCKS_UNIVERSE.find((s) => s.ticker === cleanTicker);
    if (!known) return null;

    const eastern = getEasternTime();
    return {
      ticker: known.ticker,
      name: known.name,
      type: known.type,
      category: known.category,
      sector: known.sector,
      industry: known.industry,
      currentPrice: known.current_price,
      dayChange: known.day_change,
      dayChangePct: known.day_change_pct,
      openPrice: known.current_price - known.day_change,
      previousClose: known.current_price - known.day_change,
      dayHigh: known.high_52w * 0.98,
      dayLow: known.low_52w * 1.05,
      volume24h: known.volume_24h,
      avgVolume: known.volume_24h,
      marketCap: known.market_cap,
      sharesOutstanding: (known as any)?.shares_outstanding || '2.5B',
      high52w: known.high_52w,
      low52w: known.low_52w,
      week52Change: (known as any)?.week_52_change || Number((known.day_change_pct * 4).toFixed(2)),
      peRatio: known.pe_ratio,
      beta: known.beta,
      eps: known.eps,
      dividendYield: (known as any)?.dividend_yield || null,
      description: known.description,
      aiSentiment: known.ai_sentiment as any,
      aiSummary: known.ai_summary,
      updatedAt: new Date().toISOString(),
      isMarketOpen: eastern.isMarketOpen,
      marketStatus: eastern.marketStatus,
      region: known.region,
      country: known.country,
      exchange: known.exchange,
      currency: known.currency,
    };
  }

  public async getRealHistory(ticker: string, timeframe: Timeframe = '1D'): Promise<HistoricalPricePoint[]> {
    const clean = ticker.toUpperCase().trim();
    if (!clean) return [];

    const cacheKey = `${clean}-${timeframe}`;
    const cached = this.historyCache.get(cacheKey);
    const ttl = timeframe === '1D' ? 5000 : 60000;
    if (cached && Date.now() - cached.fetchedAt < ttl) {
      return cached.points;
    }

    const assetclass = this.isEtfTicker(clean) ? 'etf' : 'stocks';
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
    };

    try {
      if (timeframe === '1D') {
        const res = await fetch(`https://api.nasdaq.com/api/quote/${clean}/chart?assetclass=${assetclass}`, {
          headers,
          next: { revalidate: 5 },
        });

        if (res.ok) {
          const json = await res.json();
          const rawChart = json.data?.chart || [];
          if (Array.isArray(rawChart) && rawChart.length > 1) {
            const points: HistoricalPricePoint[] = rawChart
              .map((pt: any) => {
                const priceVal = typeof pt.y === 'number' ? pt.y : CLEAN_NUM(pt.z?.value);
                return {
                  date: pt.z?.dateTime || '',
                  timestamp: pt.x || Date.now(),
                  price: Number(priceVal.toFixed(2)),
                  close: Number(priceVal.toFixed(2)),
                  open: Number((priceVal * 0.999).toFixed(2)),
                  high: Number((priceVal * 1.002).toFixed(2)),
                  low: Number((priceVal * 0.998).toFixed(2)),
                  volume: 10000,
                };
              })
              .filter((p) => p.price > 0);

            if (points.length > 1) {
              this.historyCache.set(cacheKey, { points, fetchedAt: Date.now() });
              return points;
            }
          }
        }
      } else {
        // Multi-day from Nasdaq Historical API
        const days = timeframe === '5D' || timeframe === '1W' ? 7 : timeframe === '1M' ? 35 : timeframe === '3M' ? 95 : timeframe === '6M' ? 190 : 365;
        const fromdate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const res = await fetch(`https://api.nasdaq.com/api/quote/${clean}/historical?assetclass=${assetclass}&fromdate=${fromdate}&limit=250`, {
          headers,
          next: { revalidate: 60 },
        });

        if (res.ok) {
          const json = await res.json();
          const rows = json.data?.tradesTable?.rows || [];
          if (Array.isArray(rows) && rows.length > 0) {
            const points: HistoricalPricePoint[] = [...rows].reverse().map((r: any) => {
              const close = CLEAN_NUM(r.close);
              return {
                date: r.date,
                timestamp: new Date(r.date).getTime() || Date.now(),
                price: Number(close.toFixed(2)),
                open: Number(CLEAN_NUM(r.open).toFixed(2)),
                high: Number(CLEAN_NUM(r.high).toFixed(2)),
                low: Number(CLEAN_NUM(r.low).toFixed(2)),
                close: Number(close.toFixed(2)),
                volume: Math.round(CLEAN_NUM(r.volume)),
              };
            }).filter((p) => p.price > 0);

            if (points.length > 1) {
              this.historyCache.set(cacheKey, { points, fetchedAt: Date.now() });
              return points;
            }
          }
        }
      }
    } catch (e) {
      // Fallback
    }

    // Fallback generation based on actual live quote
    const quote = await this.getRealQuote(clean);
    const basePrice = quote?.currentPrice || 100;
    const dayChangePct = (quote?.dayChangePct || 0) / 100;
    const sampleCount = timeframe === '1D' ? 30 : 25;
    const points: HistoricalPricePoint[] = [];
    const now = Date.now();
    const duration = timeframe === '1D' ? 6.5 * 3600 * 1000 : 30 * 86400 * 1000;
    const startTime = now - duration;

    for (let i = 0; i < sampleCount; i++) {
      const prog = i / (sampleCount - 1);
      const time = new Date(startTime + prog * duration);
      const ratio = 1 - dayChangePct * (1 - prog);
      const p = Number((basePrice * ratio).toFixed(2));
      points.push({
        date: timeframe === '1D' ? formatEasternTimeLabel(time.getTime()) : time.toISOString().split('T')[0],
        timestamp: time.getTime(),
        price: i === sampleCount - 1 ? basePrice : p,
        close: i === sampleCount - 1 ? basePrice : p,
      });
    }

    return points;
  }

  public async getAllUniverseAssets(): Promise<Asset[]> {
    const now = Date.now();
    if (this.universeCache && now - this.universeCache.fetchedAt < 5000) {
      return this.universeCache.assets;
    }

    // Fetch live quotes in parallel for top universe stocks (including Kazakh & Energy leaders)
    const topTickers = [
      'NVDA', 'AAPL', 'MSFT', 'AMZN', 'TSLA', 'GOOGL', 'META', 'SPY', 'QQQ', 'AMD', 'NFLX', 'AVGO',
      'KSPI', 'XOM', 'CVX', 'COP', 'SHEL', 'BP', 'TTE', 'OXY', 'SLB', 'CNQ', 'EQNR', 'FANG', 'MPC', 'VLO', 'PSX', 'HAL', 'BKR', 'ENB'
    ];
    const quotes = await Promise.all(topTickers.map((t) => this.getRealQuote(t)));

    const assets: Asset[] = GLOBAL_STOCKS_UNIVERSE.map((stock) => {
      const live = quotes.find((q) => q?.ticker === stock.ticker);
      return {
        id: `asset-${stock.ticker.toLowerCase()}`,
        ticker: stock.ticker,
        name: live?.name || stock.name,
        type: (live?.type || stock.type) as any,
        category: (live?.category || stock.category) as any,
        sector: live?.sector || stock.sector,
        current_price: live?.currentPrice ?? stock.current_price,
        day_change: live?.dayChange ?? stock.day_change,
        day_change_pct: live?.dayChangePct ?? stock.day_change_pct,
        volume_24h: live?.volume24h || stock.volume_24h,
        market_cap: live?.marketCap || stock.market_cap,
        pe_ratio: live?.peRatio ?? stock.pe_ratio,
        high_52w: live?.high52w ?? stock.high_52w,
        low_52w: live?.low52w ?? stock.low_52w,
        beta: live?.beta ?? stock.beta,
        eps: live?.eps ?? stock.eps,
        description: stock.description,
        ai_summary: stock.ai_summary,
        ai_sentiment: (live?.aiSentiment || stock.ai_sentiment) as any,
        color: stock.color,
        country: stock.country,
        industry: stock.industry,
        exchange: stock.exchange,
        region: stock.region,
        updated_at: new Date().toISOString(),
      } as any;
    });

    this.universeCache = { assets, fetchedAt: now };
    return assets;
  }
}

// Global Singleton Engine
const globalForMarket = globalThis as unknown as {
  __nexraRealMarketDataProvider__?: RealMarketDataProvider;
};

export const realMarketData =
  globalForMarket.__nexraRealMarketDataProvider__ || new RealMarketDataProvider();

if (process.env.NODE_ENV !== 'production') {
  globalForMarket.__nexraRealMarketDataProvider__ = realMarketData;
}

// Backward compatibility facade
export const liveMarketEngine = {
  getQuote: (ticker: string) => {
    // Synchronous access using universe updated with cached quote
    return realMarketData.getRealQuote(ticker);
  },
  getAllAssets: () => {
    return realMarketData.getAllUniverseAssets();
  },
};

// Rate Limit and Backoff Management
let isRateLimited = false;
let rateLimitCooldownUntil = 0;

export function isMarketRateLimited(): boolean {
  return isRateLimited && Date.now() < rateLimitCooldownUntil;
}

export function setMarketRateLimitBackoff(seconds: number = 60) {
  isRateLimited = true;
  rateLimitCooldownUntil = Date.now() + seconds * 1000;
}

export function toAssetModel(s: GlobalStockItem): Asset {
  return {
    id: `asset-${s.ticker.toLowerCase()}`,
    ticker: s.ticker,
    name: s.name,
    type: s.type as any,
    category: s.category as any,
    sector: s.sector,
    current_price: s.current_price,
    day_change: s.day_change,
    day_change_pct: s.day_change_pct,
    volume_24h: s.volume_24h,
    market_cap: s.market_cap,
    pe_ratio: s.pe_ratio,
    high_52w: s.high_52w,
    low_52w: s.low_52w,
    beta: s.beta,
    eps: s.eps,
    description: s.description,
    ai_summary: s.ai_summary,
    ai_sentiment: s.ai_sentiment as any,
    color: s.color,
    country: s.country,
    industry: s.industry,
    exchange: s.exchange,
    region: s.region,
    updated_at: new Date().toISOString(),
  } as any;
}

export async function fetchLiveQuoteServer(ticker: string): Promise<MarketQuote | null> {
  return realMarketData.getRealQuote(ticker);
}

export async function fetchLiveHistoryServer(ticker: string, timeframe: Timeframe = '1D'): Promise<HistoricalPricePoint[]> {
  return realMarketData.getRealHistory(ticker, timeframe);
}

export async function getMarketAssetsServer(params?: GetAssetsParams): Promise<{
  assets: Asset[];
  totalCount: number;
  page: number;
  totalPages: number;
}> {
  let allAssets = await realMarketData.getAllUniverseAssets();

  // Region / Category Filter
  if (params?.region && params.region !== 'all' && params.region !== 'All') {
    const reg = params.region.toLowerCase().trim();
    if (reg === 'etfs') {
      allAssets = allAssets.filter((a) => a.category === 'etfs' || a.type === 'ETF');
    } else if (reg === 'indices') {
      allAssets = allAssets.filter((a) => a.category === 'indices' || a.type === 'Index');
    } else if (reg === 'us') {
      allAssets = allAssets.filter((a) => a.category === 'stocks' || (a as any).region === 'US' || (a as any).country === 'United States');
    } else if (reg === 'emerging markets' || reg === 'emerging') {
      allAssets = allAssets.filter((a) => (a as any).region === 'Emerging Markets' || (a as any).country === 'Kazakhstan');
    } else if (reg === 'europe') {
      allAssets = allAssets.filter((a) => (a as any).region === 'Europe');
    } else if (reg === 'canada') {
      allAssets = allAssets.filter((a) => (a as any).region === 'Canada' || (a as any).country === 'Canada');
    } else if (reg === 'asia') {
      allAssets = allAssets.filter((a) => (a as any).region === 'Asia');
    } else if (reg === 'latin america' || reg === 'latam') {
      allAssets = allAssets.filter((a) => (a as any).region === 'Latin America');
    }
  }

  // Search Filter across ticker, name, sector, industry, country, exchange, description
  if (params?.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    allAssets = allAssets.filter(
      (a) =>
        a.ticker.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        (a.sector && a.sector.toLowerCase().includes(q)) ||
        ((a as any).industry && (a as any).industry.toLowerCase().includes(q)) ||
        ((a as any).country && (a as any).country.toLowerCase().includes(q)) ||
        ((a as any).exchange && (a as any).exchange.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q))
    );
  }

  // Analytical Sorters
  const filter = params?.filter || params?.sort;
  if (filter === 'gainers') {
    allAssets = [...allAssets].sort((a, b) => b.day_change_pct - a.day_change_pct);
  } else if (filter === 'losers') {
    allAssets = [...allAssets].sort((a, b) => a.day_change_pct - b.day_change_pct);
  } else if (filter === 'active') {
    allAssets = [...allAssets].sort((a, b) => parseFloat(b.volume_24h) - parseFloat(a.volume_24h));
  } else if (filter === 'market_cap') {
    allAssets = [...allAssets].sort((a, b) => parseFloat(b.market_cap.replace(/[^0-9.]/g, '')) - parseFloat(a.market_cap.replace(/[^0-9.]/g, '')));
  }

  const page = params?.page || 1;
  const limit = params?.limit || 150;
  const totalCount = allAssets.length;
  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = (page - 1) * limit;
  const paginatedAssets = allAssets.slice(startIndex, startIndex + limit);

  return {
    assets: paginatedAssets,
    totalCount,
    page,
    totalPages,
  };
}

export async function searchStocksServer(query: string): Promise<Asset[]> {
  const q = (query || '').trim().toLowerCase();
  const all = await realMarketData.getAllUniverseAssets();
  if (!q) return all.slice(0, 20);

  return all
    .filter(
      (a) =>
        a.ticker.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        (a.sector && a.sector.toLowerCase().includes(q)) ||
        ((a as any).industry && (a as any).industry.toLowerCase().includes(q)) ||
        ((a as any).country && (a as any).country.toLowerCase().includes(q)) ||
        ((a as any).exchange && (a as any).exchange.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q))
    )
    .slice(0, 30);
}
