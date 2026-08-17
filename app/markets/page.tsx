'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Sparkles,
  Layers,
  BarChart2,
  Globe,
  PlusCircle,
  Flame,
  Building2,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';
import { PillTabs } from '@/components/ui/Tabs';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { CompanyLogo } from '@/components/market/CompanyLogo';
import { useAssets } from '@/hooks/useAssets';
import { useWatchlist } from '@/hooks/useWatchlist';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Asset } from '@/types/database.types';

export default function MarketsPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState<number>(25);

  // 1. Fetch real global market assets via server API
  const { data: rawAssets, isLoading, isError, error } = useAssets({
    category: selectedRegion !== 'all' ? selectedRegion : undefined,
    region: selectedRegion !== 'all' ? selectedRegion : undefined,
    search: searchQuery ? searchQuery : undefined,
    filter: activeFilter,
    limit: 150,
  });

  // 2. Real Watchlist connection to Supabase Auth user_metadata
  const { toggleWatchlist, isWatched, isToggling } = useWatchlist();

  const allFetchedAssets = rawAssets || [];
  const totalAssetsCount = allFetchedAssets.length;
  const displayedAssets = allFetchedAssets.slice(0, displayLimit);
  const hasMore = displayLimit < totalAssetsCount;

  const regions = [
    { id: 'all', label: 'All Global' },
    { id: 'us', label: 'US Equities' },
    { id: 'canada', label: 'Canada' },
    { id: 'europe', label: 'Europe' },
    { id: 'asia', label: 'Asia-Pacific' },
    { id: 'latin america', label: 'Latin America' },
    { id: 'emerging markets', label: 'Emerging Markets' },
    { id: 'etfs', label: 'ETFs' },
    { id: 'indices', label: 'Major Indices' },
  ];

  const filterTabs = [
    { id: 'all', label: 'All Instruments' },
    { id: 'active', label: 'Most Active' },
    { id: 'gainers', label: 'Top Gainers' },
    { id: 'losers', label: 'Top Losers' },
    { id: 'market_cap', label: 'Largest Market Cap' },
    { id: 'most_viewed', label: 'Most Viewed' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-dark dark:text-[#F5F5F5] tracking-tight">
              Global Markets Directory
            </h1>
            <Badge variant="lime" size="sm">
              Live Equities & ETFs
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-slate-muted dark:text-[#A1A1AA] mt-0.5">
            Real-time simulated prices, fundamentals, and market depth for global equities, ETFs, and benchmark indices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/trade">
            <GlassButton variant="lime" size="sm">
              <ArrowLeftRight className="w-4 h-4" />
              <span>Trade Terminal</span>
            </GlassButton>
          </Link>
        </div>
      </div>

      {/* 2. REGION SWITCHER BAR */}
      <GlassCard className="p-3.5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto min-w-max">
            {regions.map((reg) => (
              <button
                key={reg.id}
                onClick={() => {
                  setSelectedRegion(reg.id);
                  setDisplayLimit(25);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedRegion === reg.id
                    ? 'bg-lime text-[#0F0B0A] shadow-sm'
                    : 'bg-slate-100 dark:bg-[#1E1E21] text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-200 dark:hover:bg-[#323236] dark:hover:text-[#F5F5F5]'
                }`}
              >
                {reg.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 dark:text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ticker, company, exchange, country..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDisplayLimit(25);
              }}
              className="w-full pl-9 pr-8 py-1.5 bg-white dark:bg-[#1E1E21] border border-slate-border dark:border-[#3A3A3D] rounded-xl text-xs text-slate-dark dark:text-[#F5F5F5] placeholder:text-slate-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-[#B8F500]/60 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#71717A] hover:text-slate-600 dark:hover:text-[#F5F5F5] text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Analytical Sorters */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-[#3A3A3D] flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#71717A]">
            Sort by performance:
          </span>
          <div className="overflow-x-auto pb-1 sm:pb-0">
            <PillTabs
              items={filterTabs}
              activeId={activeFilter}
              onChange={(id) => {
                setActiveFilter(id);
                setDisplayLimit(25);
              }}
              variant="lime"
            />
          </div>
        </div>
      </GlassCard>

      {/* 3. MARKETS TABLE */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-[#1E1E21] border-b border-slate-border dark:border-[#3A3A3D] text-slate-muted dark:text-[#A1A1AA] uppercase text-[10px] font-bold tracking-wider select-none">
                <th className="py-3.5 px-4 w-12 text-center">Watch</th>
                <th className="py-3.5 px-4">Instrument</th>
                <th className="py-3.5 px-4 text-right">Price</th>
                <th className="py-3.5 px-4 text-right">24h Change</th>
                <th className="py-3.5 px-4 text-right">24h %</th>
                <th className="py-3.5 px-4 text-right hidden sm:table-cell">24h Volume</th>
                <th className="py-3.5 px-4 text-right hidden md:table-cell">Market Cap</th>
                <th className="py-3.5 px-4 text-right hidden lg:table-cell">52W Range</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-[#3A3A3D]">
              {isLoading ? (
                <>
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                </>
              ) : isError ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-[#71717A]">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm font-bold text-slate-700 dark:text-[#F5F5F5]">Market data temporarily unavailable.</span>
                      <span className="text-xs text-slate-400 dark:text-[#71717A]">Please check back in a moment or refresh.</span>
                    </div>
                  </td>
                </tr>
              ) : displayedAssets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-[#71717A]">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm font-bold text-slate-700 dark:text-[#F5F5F5]">No assets found</span>
                      <span className="text-xs text-slate-400 dark:text-[#71717A]">Try adjusting your region filter or search keywords.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedAssets.map((asset: Asset) => {
                  const ticker = asset.ticker || (asset as any).symbol || '';
                  const name = asset.name || ticker || 'Company';
                  const isItemWatched = isWatched(ticker) || isWatched(asset.id);
                  const price = Number(asset.current_price || 0);
                  const dayChange = Number(asset.day_change || 0);
                  const dayChangePct = Number(asset.day_change_pct || 0);
                  const isPositive = dayChangePct >= 0;
                  const isNeutral = dayChangePct === 0;

                  return (
                    <tr key={asset.id || ticker} className="hover:bg-slate-50/80 dark:hover:bg-[#323236] transition-colors group">
                      {/* Watchlist Star Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleWatchlist({ assetId: asset.id, ticker })}
                          disabled={isToggling}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            isItemWatched ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 dark:text-[#71717A] hover:text-slate-500 dark:hover:text-[#F5F5F5]'
                          }`}
                          aria-label={isItemWatched ? `Remove ${ticker} from Watchlist` : `Add ${ticker} to Watchlist`}
                          title={isItemWatched ? `Remove ${ticker} from Watchlist` : `Add ${ticker} to Watchlist`}
                        >
                          <Star className={`w-4 h-4 ${isItemWatched ? 'fill-amber-500' : ''}`} />
                        </button>
                      </td>

                      {/* Instrument Symbol & Name */}
                      <td className="py-3.5 px-4">
                        <Link href={`/markets/${ticker}`} className="flex items-center gap-3">
                          <CompanyLogo ticker={ticker} name={name} size="md" />
                          <div>
                            <div className="font-extrabold text-slate-dark dark:text-[#F5F5F5] text-sm group-hover:text-lime-900 dark:group-hover:text-lime transition-colors flex items-center gap-1.5">
                              {ticker}
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#1E1E21] text-slate-600 dark:text-[#A1A1AA] border border-slate-200 dark:border-[#3A3A3D]">
                                {asset.type || 'Stock'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-muted dark:text-[#71717A] truncate max-w-[160px] sm:max-w-[220px]">
                              {name}
                            </div>
                          </div>
                        </Link>
                      </td>

                      {/* Current Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">
                        {formatCurrency(price)}
                      </td>

                      {/* 24h Dollar Change */}
                      <td className={`py-3.5 px-4 text-right font-mono font-bold ${
                        isNeutral ? 'text-slate-500 dark:text-[#71717A]' : isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {isPositive && !isNeutral ? '+' : ''}{dayChange.toFixed(2)}
                      </td>

                      {/* 24h Percent Badge */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex justify-end">
                          <Badge variant={isNeutral ? 'neutral' : isPositive ? 'up' : 'down'} size="sm">
                            {isPositive && !isNeutral ? (
                              <ArrowUpRight className="w-3 h-3 mr-0.5" />
                            ) : !isNeutral ? (
                              <ArrowDownRight className="w-3 h-3 mr-0.5" />
                            ) : null}
                            {formatPercent(dayChangePct)}
                          </Badge>
                        </div>
                      </td>

                      {/* 24h Volume */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-[#A1A1AA] hidden sm:table-cell">
                        {asset.volume_24h || 'N/A'}
                      </td>

                      {/* Market Cap */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-[#A1A1AA] hidden md:table-cell">
                        {asset.market_cap || 'N/A'}
                      </td>

                      {/* 52W Range Indicator */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500 dark:text-[#71717A] text-[11px] hidden lg:table-cell">
                        {asset.low_52w && asset.high_52w
                          ? `$${asset.low_52w.toFixed(0)} - $${asset.high_52w.toFixed(0)}`
                          : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link href={`/trade?ticker=${ticker}&type=BUY`}>
                            <button className="px-2.5 py-1 rounded-lg bg-lime text-[#0F0B0A] text-[11px] font-extrabold hover:bg-lime-300 transition-colors cursor-pointer">
                              Buy
                            </button>
                          </Link>
                          <Link href={`/markets/${ticker}`}>
                            <button className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#1E1E21] text-slate-700 dark:text-[#F5F5F5] text-[11px] font-bold hover:bg-slate-200 dark:hover:bg-[#323236] border border-slate-200 dark:border-[#3A3A3D] transition-colors cursor-pointer">
                              Quote
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. PAGINATION & LOAD MORE FOOTER */}
        {hasMore && (
          <div className="p-4 border-t border-slate-100 dark:border-[#3A3A3D] flex items-center justify-between flex-wrap gap-3 bg-slate-50/50 dark:bg-[#1E1E21]">
            <span className="text-xs text-slate-500 dark:text-[#A1A1AA] font-medium">
              Showing <span className="font-bold text-slate-dark dark:text-[#F5F5F5]">{displayedAssets.length}</span> of{' '}
              <span className="font-bold text-slate-dark dark:text-[#F5F5F5]">{totalAssetsCount}</span> instruments
            </span>

            <button
              onClick={() => setDisplayLimit((prev) => prev + 25)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#28282B] border border-slate-border dark:border-[#3A3A3D] text-xs font-extrabold text-slate-dark dark:text-[#F5F5F5] hover:bg-slate-100 dark:hover:bg-[#323236] shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Load More Assets</span>
              <PlusCircle className="w-3.5 h-3.5 text-slate-500 dark:text-[#71717A]" />
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
