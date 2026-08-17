'use client';

import React from 'react';
import Link from 'next/link';
import { useAssets } from '@/hooks/useAssets';
import { formatCurrency, formatPercent } from '@/lib/utils';

export function TickerTape() {
  const { data: assets } = useAssets();
  const assetList = assets || [];

  if (assetList.length === 0) return null;

  // Double list for infinite marquee effect
  const displayItems = [...assetList, ...assetList];

  return (
    <div className="h-8 bg-white dark:bg-[#0F0B0A] border-b border-slate-border dark:border-[#3A3A3D] overflow-hidden flex items-center relative select-none">
      <div className="flex items-center gap-6 whitespace-nowrap animate-marquee hover:[animation-play-state:paused] pl-full">
        {displayItems.map((asset, i) => {
          const isUp = asset.day_change >= 0;
          return (
            <Link
              key={`${asset.ticker}-${i}`}
              href={`/markets/${asset.ticker}`}
              className="inline-flex items-center gap-2 text-xs py-0.5 px-1.5 rounded hover:bg-slate-100 dark:hover:bg-[#28282B] transition-colors group"
            >
              <span className="font-extrabold text-slate-dark dark:text-[#F5F5F5] group-hover:text-lime-900 dark:group-hover:text-lime">{asset.ticker}</span>
              <span className="font-mono text-slate-600 dark:text-[#A1A1AA]">{formatCurrency(asset.current_price)}</span>
              <span className={`font-mono font-bold flex items-center gap-0.5 ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {isUp ? '▲' : '▼'} {formatPercent(asset.day_change_pct, false)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
