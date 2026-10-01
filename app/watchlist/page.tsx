'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Trash2, PlusCircle, ArrowLeftRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Sparkline } from '@/components/charts/Sparkline';
import { CompanyLogo } from '@/components/market/CompanyLogo';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useLanguage } from '@/providers/LanguageProvider';
import { formatCurrency, formatPercent } from '@/lib/utils';

export default function WatchlistPage() {
  const { t } = useLanguage();
  const { data: watchlist, toggleWatchlist } = useWatchlist();
  const watchlistItems = watchlist || [];

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-dark dark:text-[#F5F5F5] tracking-tight">
            {t('watchlist.title')}
          </h1>
          <p className="text-xs md:text-sm text-slate-muted dark:text-[#A1A1AA] mt-0.5">
            {t('watchlist.subtitle')}
          </p>
        </div>

        <Link href="/markets">
          <Button variant="lime" size="sm">
            <PlusCircle className="w-4 h-4" />
            <span>{t('watchlist.browseAssets')}</span>
          </Button>
        </Link>
      </div>

      {/* WATCHLIST TABLE */}
      {watchlistItems.length > 0 ? (
        <Card className="p-0 overflow-hidden shadow-sm dark:shadow-dark-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#1E1E21] border-b border-slate-border dark:border-[#3A3A3D] text-slate-muted dark:text-[#A1A1AA] uppercase text-[10px] sm:text-[11px] font-bold tracking-wider select-none">
                  <th className="py-3 px-2.5 sm:px-4">{t('watchlist.colInstrument')}</th>
                  <th className="py-3 px-2.5 sm:px-4 text-right">{t('watchlist.colPrice')}</th>
                  <th className="py-3 px-2.5 sm:px-4 text-right">{t('watchlist.col24hChange')}</th>
                  <th className="py-3 px-2.5 sm:px-4 text-right hidden sm:table-cell">{t('watchlist.col24hVolume')}</th>
                  <th className="py-3 px-2.5 sm:px-4 text-right hidden md:table-cell">{t('watchlist.colMarketCap')}</th>
                  <th className="py-3 px-2.5 sm:px-4 text-center hidden lg:table-cell">{t('watchlist.col7dTrend')}</th>
                  <th className="py-3 px-2.5 sm:px-4 text-center hidden sm:table-cell">{t('watchlist.colSentiment')}</th>
                  <th className="py-3 px-2.5 sm:px-4 text-right">{t('watchlist.colAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#3A3A3D]">
                {watchlistItems.map((item) => {
                  const asset = item.asset;
                  if (!asset) return null;
                  const isUp = asset.day_change >= 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-[#323236] transition-colors group">
                      <td className="py-3.5 px-2.5 sm:px-4">
                        <Link href={`/markets/${asset.ticker || ''}`} className="flex items-center gap-2 sm:gap-3">
                          <CompanyLogo ticker={asset.ticker} name={asset.name} size="sm" />
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-dark dark:text-[#F5F5F5] group-hover:text-lime-900 dark:group-hover:text-lime transition-colors text-xs sm:text-sm">{asset.ticker || asset.name}</div>
                            <div className="text-[10px] sm:text-[11px] text-slate-muted dark:text-[#71717A] truncate max-w-[100px] sm:max-w-[180px]">{asset.name}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3.5 px-2.5 sm:px-4 font-mono font-bold text-slate-dark dark:text-[#F5F5F5] text-right text-xs sm:text-sm">{formatCurrency(asset.current_price)}</td>
                      <td className="py-3.5 px-2.5 sm:px-4 text-right">
                        <Badge variant={isUp ? 'up' : 'down'} size="sm">
                          {isUp ? '+' : ''}{asset.day_change.toFixed(2)} <span className="hidden sm:inline">({formatPercent(asset.day_change_pct)})</span>
                        </Badge>
                      </td>
                      <td className="py-3.5 px-2.5 sm:px-4 font-mono text-slate-600 dark:text-[#A1A1AA] text-right hidden sm:table-cell">{asset.volume_24h}</td>
                      <td className="py-3.5 px-2.5 sm:px-4 font-mono text-slate-600 dark:text-[#A1A1AA] text-right hidden md:table-cell">{asset.market_cap}</td>
                      <td className="py-3.5 px-2.5 sm:px-4 text-center hidden lg:table-cell">
                        <div className="inline-flex justify-center">
                          <Sparkline isPositive={isUp} width={75} height={22} />
                        </div>
                      </td>
                      <td className="py-3.5 px-2.5 sm:px-4 text-center hidden sm:table-cell">
                        <Badge variant={asset.ai_sentiment === 'Bullish' ? 'lime' : 'neutral'} size="sm">
                          {asset.ai_sentiment}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-2.5 sm:px-4 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                          <Link href={`/trade?ticker=${asset.ticker}&type=BUY`}>
                            <Button variant="lime" size="xs">{t('markets.buy')}</Button>
                          </Link>
                          <button
                            onClick={() => toggleWatchlist({ assetId: item.asset_id || asset.id, ticker: asset.ticker })}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 dark:text-[#71717A] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title={t('watchlist.removeFromWatchlist')}
                            aria-label={t('watchlist.removeFromWatchlist')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-lime-50 dark:bg-lime/10 text-lime-900 dark:text-lime flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-dark dark:text-[#F5F5F5]">{t('watchlist.emptyTitle')}</h3>
          <p className="text-xs text-slate-muted dark:text-[#A1A1AA] mt-1 mb-4">
            {t('watchlist.emptyDesc')}
          </p>
          <Link href="/markets">
            <Button variant="lime" size="sm">{t('watchlist.exploreMarketsBtn')}</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
