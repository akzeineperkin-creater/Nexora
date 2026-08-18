'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PillTabs } from '@/components/ui/Tabs';

const CALENDAR_DATA = [
  {
    id: 'c-1',
    date: 'Tomorrow, 08:30 EST',
    category: 'economic',
    country: '🇺🇸 US',
    title: 'US CPI Inflation Data (YoY)',
    importance: 'High',
    forecast: '2.8%',
    previous: '2.9%',
    impact: 'High market volatility expected across SPY, QQQ, and Tech equities.',
    ticker: null,
  },
  {
    id: 'c-2',
    date: 'Aug 28, 16:30 EST',
    category: 'earnings',
    country: '🇺🇸 US',
    title: 'NVIDIA (NVDA) Q2 Earnings Report',
    importance: 'High',
    forecast: 'EPS $0.64',
    previous: 'EPS $0.61',
    impact: 'Crucial bellwether for global AI infrastructure capex demand.',
    ticker: 'NVDA',
  },
  {
    id: 'c-3',
    date: 'Sep 18, 14:00 EST',
    category: 'economic',
    country: '🇺🇸 US',
    title: 'FOMC Federal Reserve Interest Rate Decision',
    importance: 'High',
    forecast: '5.00%',
    previous: '5.25%',
    impact: 'Benchmark rate cut probabilities currently at 88%.',
    ticker: null,
  },
  {
    id: 'c-4',
    date: 'Oct 10, 19:00 EST',
    category: 'events',
    country: '🇺🇸 US',
    title: 'Tesla Robotaxi & Autonomous Cybercab Day',
    importance: 'Medium',
    forecast: 'Demonstration',
    previous: 'N/A',
    impact: 'Demonstration of autonomous robotaxi software stack and commercial plans.',
    ticker: 'TSLA',
  },
];

export default function CalendarPage() {
  const [activeTab, setActiveTab] = useState('all');

  const filtered = CALENDAR_DATA.filter((e) => {
    if (activeTab === 'all') return true;
    return e.category === activeTab;
  });

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-dark dark:text-[#F5F5F5] tracking-tight">
            Market Calendar
          </h1>
          <p className="text-xs md:text-sm text-slate-muted dark:text-[#A1A1AA] mt-0.5">
            Key macroeconomic releases, earnings calls, and market catalytic dates.
          </p>
        </div>

        <div className="overflow-x-auto no-scrollbar max-w-full pb-0.5">
          <div className="shrink-0">
            <PillTabs
              items={[
                { id: 'all', label: 'All Events' },
                { id: 'economic', label: 'Economic Prints' },
                { id: 'earnings', label: 'Earnings' },
                { id: 'events', label: 'Key Conferences' },
              ]}
              activeId={activeTab}
              onChange={setActiveTab}
              variant="lime"
            />
          </div>
        </div>
      </div>

      {/* CALENDAR TABLE */}
      <Card className="p-0 overflow-hidden shadow-sm dark:shadow-dark-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#1E1E21] border-b border-slate-border dark:border-[#3A3A3D] text-slate-muted dark:text-[#A1A1AA] uppercase text-[10px] sm:text-[11px] font-bold tracking-wider select-none">
                <th className="py-3 px-2.5 sm:px-4">Date & Time</th>
                <th className="py-3 px-2.5 sm:px-4 hidden sm:table-cell">Market</th>
                <th className="py-3 px-2.5 sm:px-4">Event</th>
                <th className="py-3 px-2.5 sm:px-4 hidden sm:table-cell">Importance</th>
                <th className="py-3 px-2.5 sm:px-4 hidden md:table-cell">Consensus</th>
                <th className="py-3 px-2.5 sm:px-4 hidden md:table-cell">Prior</th>
                <th className="py-3 px-2.5 sm:px-4 text-right">Related Asset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#3A3A3D]">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/70 dark:hover:bg-[#323236] transition-colors">
                  <td className="py-3.5 px-2.5 sm:px-4 font-mono font-semibold text-slate-dark dark:text-[#F5F5F5] whitespace-nowrap text-xs">{e.date}</td>
                  <td className="py-3.5 px-2.5 sm:px-4 text-slate-dark dark:text-[#F5F5F5] hidden sm:table-cell">{e.country}</td>
                  <td className="py-3.5 px-2.5 sm:px-4">
                    <div className="font-bold text-slate-dark dark:text-[#F5F5F5] text-xs sm:text-sm">{e.title}</div>
                    <div className="text-[10px] sm:text-[11px] text-slate-muted dark:text-[#71717A] mt-0.5 line-clamp-2 max-w-sm">{e.impact}</div>
                  </td>
                  <td className="py-3.5 px-2.5 sm:px-4 hidden sm:table-cell">
                    <Badge variant={e.importance === 'High' ? 'down' : 'neutral'} size="sm">
                      {e.importance}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-2.5 sm:px-4 font-mono font-bold text-slate-dark dark:text-[#F5F5F5] hidden md:table-cell">{e.forecast}</td>
                  <td className="py-3.5 px-2.5 sm:px-4 font-mono text-slate-muted dark:text-[#71717A] hidden md:table-cell">{e.previous}</td>
                  <td className="py-3.5 px-2.5 sm:px-4 text-right">
                    {e.ticker ? (
                      <Link href={`/markets/${e.ticker}`}>
                        <Badge variant="lime" size="sm" className="hover:border-lime cursor-pointer font-bold">
                          {e.ticker} →
                        </Badge>
                      </Link>
                    ) : (
                      <span className="text-[10px] sm:text-[11px] text-slate-muted dark:text-[#71717A]">Broad Market</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
