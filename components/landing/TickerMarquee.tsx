'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const MARQUEE_ITEMS = [
  { symbol: 'NVDA', name: 'NVIDIA', price: '$184.72', change: '+4.71%', up: true },
  { symbol: 'AAPL', name: 'Apple', price: '$306.14', change: '+2.84%', up: true },
  { symbol: 'TSLA', name: 'Tesla', price: '$341.27', change: '+3.26%', up: true },
  { symbol: 'MSFT', name: 'Microsoft', price: '$448.90', change: '+1.92%', up: true },
  { symbol: 'AMZN', name: 'Amazon', price: '$218.35', change: '+2.41%', up: true },
  { symbol: 'META', name: 'Meta', price: '$594.10', change: '+3.87%', up: true },
  { symbol: 'GOOGL', name: 'Alphabet', price: '$192.40', change: '+1.65%', up: true },
  { symbol: 'AMD', name: 'AMD', price: '$162.80', change: '+5.12%', up: true },
  { symbol: 'SPY', name: 'S&P 500 ETF', price: '$588.20', change: '+1.45%', up: true },
  { symbol: 'QQQ', name: 'Invesco QQQ', price: '$512.90', change: '+2.18%', up: true },
];

export function TickerMarquee() {
  const displayItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className="w-full bg-[#07110C] border-y border-[#3A3A3D]/60 py-3 overflow-hidden select-none relative">
      {/* Left/Right Vignette gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#050807] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#050807] to-transparent z-10 pointer-events-none" />

      <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
        {displayItems.map((item, idx) => (
          <Link
            key={idx}
            href={`/markets/${item.symbol}`}
            className="inline-flex items-center gap-2.5 font-mono text-xs hover:opacity-80 transition-opacity"
          >
            <span className="font-extrabold text-white">{item.symbol}</span>
            <span className="text-zinc-400 font-sans">{item.price}</span>
            <span className="inline-flex items-center text-lime font-bold">
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
              {item.change}
            </span>
            <span className="text-zinc-700 ml-4">•</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
