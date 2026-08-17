import { REAL_STOCKS_UNIVERSE } from '@/lib/market-data/market-service';

export interface RawHoldingInput {
  ticker: string;
  name?: string;
  shares: number;
  avgPrice: number;
  assetId?: string;
  id?: string;
}

export interface EnrichedHolding {
  id: string;
  asset_id: string;
  ticker: string;
  name: string;
  shares: number;
  average_buy_price: number;
  currentPrice: number;
  dayChangePct: number;
  marketValue: number;
  costBasis: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  dayGain: number;
  isPositive: boolean;
  asset: {
    id: string;
    ticker: string;
    symbol: string;
    name: string;
    current_price: number;
    day_change_pct: number;
  };
}

export interface EnrichedTransaction {
  id: string;
  portfolio_id?: string;
  asset_id: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price_per_share: number; // Execution price of this order
  cost_basis: number; // Average purchase price / entry basis
  current_price: number; // Live current market price from quotes
  price_change_pct: number; // ((current_price - cost_basis) / cost_basis) * 100
  price_change_dollar: number;
  unrealized_pnl: number | null; // For BUY: (current_price - cost_basis) * shares
  realized_pnl: number | null; // For SELL: (executionPrice - cost_basis) * shares - commission
  realized_pnl_pct: number | null;
  total_amount: number;
  commission: number;
  cash_before: number | null;
  cash_after: number | null;
  remaining_shares?: number | null;
  remaining_position?: string | null;
  order_type: string;
  status: string;
  created_at: string;
  asset: {
    id: string;
    ticker: string;
    symbol: string;
    name: string;
    current_price: number;
    day_change_pct: number;
  };
}

export interface PortfolioValuationResult {
  cashBalance: number;
  startingCapital: number;
  totalHoldingsValue: number;
  totalPortfolioValue: number; // Total Net Worth = Cash + Total Market Value of Holdings
  totalNetWorth: number;
  totalPnl: number; // Total Net Worth - Starting Capital
  totalReturnPct: number;
  totalUnrealizedPnl: number;
  totalRealizedPnl: number;
  dailyGainDollar: number;
  dailyGainPct: number;
  holdings: EnrichedHolding[];
  transactions: EnrichedTransaction[];
}

/**
 * Single Centralized Valuation Engine for Nexra
 * Computes exact position values, unrealized P&Ls, and Total Net Worth dynamically from live stock quotes.
 * Cash is NEVER modified when stock prices fluctuate.
 */
export function calculatePortfolioValuation(
  rawCash: number | string | null | undefined,
  rawStarting: number | string | null | undefined,
  activeHoldingsMap: Record<string, any> | Array<RawHoldingInput>,
  rawTransactions: any[] = [],
  livePricesMap?: Record<string, { currentPrice: number; dayChangePct?: number }> | any[]
): PortfolioValuationResult {
  // 1. Resolve Available Cash / Buying Power
  const cashBalance = rawCash !== undefined && rawCash !== null && !isNaN(Number(rawCash))
    ? Number(Number(rawCash).toFixed(2))
    : 10000.00;

  const startingCapital = rawStarting !== undefined && rawStarting !== null && !isNaN(Number(rawStarting))
    ? Number(Number(rawStarting).toFixed(2))
    : 10000.00;

  // 2. Normalize Holdings Array
  const rawList: RawHoldingInput[] = [];
  if (Array.isArray(activeHoldingsMap)) {
    activeHoldingsMap.forEach((h) => {
      const shares = Number(h.shares || 0);
      if (shares > 0 && h.ticker) {
        rawList.push({
          ticker: h.ticker.toUpperCase(),
          name: h.name || h.ticker,
          shares,
          avgPrice: Number(h.avgPrice || h.average_buy_price || 100),
          assetId: h.assetId || (h as any).asset_id,
          id: h.id,
        });
      }
    });
  } else if (activeHoldingsMap && typeof activeHoldingsMap === 'object') {
    Object.entries(activeHoldingsMap).forEach(([ticker, hData]: [string, any]) => {
      const shares = Number(hData?.shares || 0);
      if (shares > 0) {
        rawList.push({
          ticker: ticker.toUpperCase(),
          name: hData?.name || ticker,
          shares,
          avgPrice: Number(hData?.avgPrice || hData?.average_buy_price || 100),
          assetId: hData?.assetId,
          id: `holding-${ticker.toLowerCase()}`,
        });
      }
    });
  }

  // 3. Compute Position Market Values & Unrealized P&L from Live Quotes
  let totalHoldingsValue = 0;
  let totalCostBasis = 0;
  let dailyGainDollar = 0;

  const enrichedHoldings: EnrichedHolding[] = rawList.map((h) => {
    const cleanTicker = h.ticker.toUpperCase();
    const matchingStock =
      REAL_STOCKS_UNIVERSE.find((s) => s.ticker.toUpperCase() === cleanTicker) ||
      REAL_STOCKS_UNIVERSE.find((s) => s.ticker === 'AAPL') ||
      REAL_STOCKS_UNIVERSE[0];

    const liveInfo = Array.isArray(livePricesMap)
      ? livePricesMap.find((a: any) => (a.ticker || a.symbol)?.toUpperCase() === cleanTicker)
      : (livePricesMap as any)?.[cleanTicker];

    const resolvedName = h.name || liveInfo?.name || matchingStock.name;
    const shares = Number(h.shares);
    const avgBuyPrice = Number(Number(h.avgPrice).toFixed(2));
    const currentPrice = Number(Number(liveInfo?.current_price ?? liveInfo?.currentPrice ?? matchingStock.current_price ?? avgBuyPrice).toFixed(2));
    const dayChangePct = Number(Number(liveInfo?.day_change_pct ?? liveInfo?.dayChangePct ?? matchingStock.day_change_pct ?? 0).toFixed(2));

    const marketValue = Number((shares * currentPrice).toFixed(2));
    const costBasis = Number((shares * avgBuyPrice).toFixed(2));
    const unrealizedPnl = Number((marketValue - costBasis).toFixed(2));
    const unrealizedPnlPct = costBasis > 0 ? Number(((unrealizedPnl / costBasis) * 100).toFixed(2)) : 0;
    const dayGain = Number((marketValue * (dayChangePct / 100)).toFixed(2));

    totalHoldingsValue += marketValue;
    totalCostBasis += costBasis;
    dailyGainDollar += dayGain;

    return {
      id: h.id || `holding-${cleanTicker.toLowerCase()}`,
      asset_id: h.assetId || (matchingStock as any).id || `asset-${cleanTicker.toLowerCase()}`,
      ticker: cleanTicker,
      name: resolvedName,
      shares,
      average_buy_price: avgBuyPrice,
      currentPrice,
      dayChangePct,
      marketValue,
      costBasis,
      unrealizedPnl,
      unrealizedPnlPct,
      dayGain,
      isPositive: unrealizedPnl >= 0,
      asset: {
        id: h.assetId || (matchingStock as any).id || `asset-${cleanTicker.toLowerCase()}`,
        ticker: cleanTicker,
        symbol: cleanTicker,
        name: resolvedName,
        current_price: currentPrice,
        day_change_pct: dayChangePct,
      },
    };
  });

  // 4. Enrich Transactions with Exact Price Changes and P&L
  let totalRealizedPnl = 0;
  const enrichedTransactions: EnrichedTransaction[] = (rawTransactions || []).map((t) => {
    const cleanTicker = (t.ticker || t.asset?.ticker || 'AAPL').toUpperCase();
    const matchingStock =
      REAL_STOCKS_UNIVERSE.find((s) => s.ticker.toUpperCase() === cleanTicker) ||
      REAL_STOCKS_UNIVERSE[0];

    const liveInfo = Array.isArray(livePricesMap)
      ? livePricesMap.find((a: any) => (a.ticker || a.symbol)?.toUpperCase() === cleanTicker)
      : (livePricesMap as any)?.[cleanTicker];

    const type = ((t.type || t.transaction_type || 'BUY') as string).toUpperCase() as 'BUY' | 'SELL';
    const sharesCount = Number(t.shares || t.quantity || 1);
    const executionPrice = Number(Number(t.price_per_share || t.price || matchingStock.current_price).toFixed(2));
    const livePrice = Number(Number(liveInfo?.current_price ?? liveInfo?.currentPrice ?? matchingStock.current_price ?? executionPrice).toFixed(2));
    const costBasis = Number(Number(t.cost_basis || executionPrice).toFixed(2));

    let priceChangePct = 0;
    let priceChangeDollar = 0;
    let unrealizedPnl: number | null = null;
    let realizedPnl: number | null = null;
    let realizedPnlPct: number | null = null;

    if (type === 'BUY') {
      priceChangeDollar = Number((livePrice - executionPrice).toFixed(2));
      priceChangePct = executionPrice > 0 ? Number(((priceChangeDollar / executionPrice) * 100).toFixed(2)) : 0;
      unrealizedPnl = Number((priceChangeDollar * sharesCount).toFixed(2));
    } else {
      const sellRealizedPnl = t.realized_pnl !== undefined && t.realized_pnl !== null
        ? Number(Number(t.realized_pnl).toFixed(2))
        : Number(((executionPrice - costBasis) * sharesCount).toFixed(2));
      
      realizedPnl = sellRealizedPnl;
      realizedPnlPct = costBasis > 0 ? Number((((executionPrice - costBasis) / costBasis) * 100).toFixed(2)) : 0;
      priceChangePct = realizedPnlPct;
      priceChangeDollar = Number((executionPrice - costBasis).toFixed(2));
      totalRealizedPnl += sellRealizedPnl;
    }

    return {
      id: t.id || `tx-${Math.random()}`,
      portfolio_id: t.portfolio_id,
      asset_id: t.asset_id || (matchingStock as any).id || `asset-${cleanTicker.toLowerCase()}`,
      type,
      shares: sharesCount,
      price_per_share: executionPrice,
      cost_basis: costBasis,
      current_price: livePrice,
      price_change_pct: priceChangePct,
      price_change_dollar: priceChangeDollar,
      unrealized_pnl: unrealizedPnl,
      realized_pnl: realizedPnl,
      realized_pnl_pct: realizedPnlPct,
      total_amount: Number(t.total_amount || t.total_value || (sharesCount * executionPrice)),
      commission: Number(t.commission || 0.00),
      cash_before: t.cash_before !== undefined && t.cash_before !== null ? Number(t.cash_before) : null,
      cash_after: t.cash_after !== undefined && t.cash_after !== null ? Number(t.cash_after) : null,
      remaining_shares: t.remaining_shares !== undefined && t.remaining_shares !== null ? Number(t.remaining_shares) : null,
      remaining_position: t.remaining_position || (t.remaining_shares !== undefined ? `${t.remaining_shares} shares` : undefined),
      order_type: t.order_type || 'MARKET',
      status: t.status || 'COMPLETED',
      created_at: t.created_at || new Date().toISOString(),
      asset: {
        id: t.asset?.id || (matchingStock as any).id || `asset-${cleanTicker.toLowerCase()}`,
        ticker: cleanTicker,
        symbol: cleanTicker,
        name: t.name || liveInfo?.name || matchingStock.name,
        current_price: livePrice,
        day_change_pct: Number(liveInfo?.day_change_pct ?? liveInfo?.dayChangePct ?? matchingStock.day_change_pct ?? 0),
      },
    };
  });

  // 5. Compute Overall Portfolio Net Worth: Total Net Worth = Cash + Total Market Value of Holdings
  const totalNetWorth = Number((cashBalance + totalHoldingsValue).toFixed(2));
  const totalPnl = Number((totalNetWorth - startingCapital).toFixed(2));
  const totalReturnPct = startingCapital > 0 ? Number(((totalPnl / startingCapital) * 100).toFixed(2)) : 0;
  const totalUnrealizedPnl = Number((totalHoldingsValue - totalCostBasis).toFixed(2));
  const dailyGainPct = totalNetWorth > 0 ? Number(((dailyGainDollar / totalNetWorth) * 100).toFixed(2)) : 0;

  return {
    cashBalance,
    startingCapital,
    totalHoldingsValue: Number(totalHoldingsValue.toFixed(2)),
    totalPortfolioValue: totalNetWorth,
    totalNetWorth,
    totalPnl,
    totalReturnPct,
    totalUnrealizedPnl: Number(totalUnrealizedPnl.toFixed(2)),
    totalRealizedPnl: Number(totalRealizedPnl.toFixed(2)),
    dailyGainDollar: Number(dailyGainDollar.toFixed(2)),
    dailyGainPct,
    holdings: enrichedHoldings,
    transactions: enrichedTransactions,
  };
}
